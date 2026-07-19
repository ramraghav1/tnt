import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

// ===========================
// Interfaces
// ===========================

export interface ExchangeRatesResponse {
    base: string;
    rates: { [key: string]: number };
    lastUpdated: string;
}

export interface SupportedCurrency {
    code: string;
    symbol: string;
    isBase: boolean;
}

export interface BookingPreviewResponse {
    itineraryId: number;
    currency: string;
    exchangeRate: number;
    basePriceNpr: number;
    finalPrice: number;
    rateTimestamp: string;
    note: string;
}

// ===========================
// Rounding rules per currency
// ===========================
function roundForCurrency(amount: number, currency: string): number {
    switch (currency.toUpperCase()) {
        case 'NPR':
        case 'INR':
            return Math.round(amount);
        case 'USD':
            return Math.round(amount * 100) / 100;
        default:
            return Math.round(amount * 100) / 100;
    }
}

// ===========================
// Currency Service
// ===========================

@Injectable({ providedIn: 'root' })
export class CurrencyService {
    private apiUrl = `${environment.apiBaseUrl}/exchange-rates`;
    private hubConnection?: signalR.HubConnection;

    // Signals
    selectedCurrency = signal<string>(this.loadCurrency());
    rates = signal<{ [key: string]: number }>(this.loadRates());
    lastUpdated = signal<string>('');
    supportedCurrencies = signal<SupportedCurrency[]>([
        { code: 'NPR', symbol: 'Rs', isBase: true },
        { code: 'INR', symbol: '₹', isBase: false },
        { code: 'USD', symbol: '$', isBase: false }
    ]);

    // Computed
    currentSymbol = computed(() => {
        const ccy = this.selectedCurrency();
        const found = this.supportedCurrencies().find(c => c.code === ccy);
        return found?.symbol || ccy;
    });

    isStale = computed(() => {
        const updated = this.lastUpdated();
        if (!updated) return false;
        const diff = Date.now() - new Date(updated).getTime();
        return diff > 12 * 60 * 60 * 1000; // 12 hours
    });

    constructor(private http: HttpClient) {
        // Persist currency selection to localStorage
        effect(() => {
            const ccy = this.selectedCurrency();
            localStorage.setItem('currency', ccy);
        });

        // Persist rates to localStorage
        effect(() => {
            const r = this.rates();
            localStorage.setItem('rates', JSON.stringify(r));
        });
    }

    // ─────────────────────────────────────────────
    // Initialize — call on app load
    // ─────────────────────────────────────────────
    initialize(): void {
        this.fetchRates();
        this.fetchSupportedCurrencies();
        this.connectSignalR();
    }

    // ─────────────────────────────────────────────
    // Fetch latest rates from backend
    // ─────────────────────────────────────────────
    fetchRates(): void {
        this.http.get<ExchangeRatesResponse>(this.apiUrl).subscribe({
            next: (res) => {
                this.rates.set(res.rates);
                this.lastUpdated.set(res.lastUpdated);
            },
            error: (err) => {
                console.warn('Failed to fetch exchange rates, using cached values.', err);
            }
        });
    }

    // ─────────────────────────────────────────────
    // Fetch supported currencies
    // ─────────────────────────────────────────────
    fetchSupportedCurrencies(): void {
        this.http.get<SupportedCurrency[]>(`${this.apiUrl}/supported`).subscribe({
            next: (currencies) => this.supportedCurrencies.set(currencies),
            error: () => {} // Use defaults
        });
    }

    // ─────────────────────────────────────────────
    // Change currency (UI toggle)
    // ─────────────────────────────────────────────
    changeCurrency(code: string): void {
        this.selectedCurrency.set(code.toUpperCase());
    }

    // ─────────────────────────────────────────────
    // Convert NPR amount to selected currency (DISPLAY ONLY)
    // ─────────────────────────────────────────────
    convert(amountNpr: number, targetCurrency?: string): number {
        const ccy = (targetCurrency || this.selectedCurrency()).toUpperCase();
        if (ccy === 'NPR') return roundForCurrency(amountNpr, 'NPR');

        const currentRates = this.rates();
        const rate = currentRates[ccy];
        if (!rate) return amountNpr;

        return roundForCurrency(amountNpr * rate, ccy);
    }

    // ─────────────────────────────────────────────
    // Format amount with currency symbol
    // ─────────────────────────────────────────────
    format(amountNpr: number, targetCurrency?: string): string {
        const ccy = (targetCurrency || this.selectedCurrency()).toUpperCase();
        const converted = this.convert(amountNpr, ccy);
        const symbol = this.supportedCurrencies().find(c => c.code === ccy)?.symbol || ccy;

        if (ccy === 'USD') {
            return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return `${symbol} ${converted.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }

    // ─────────────────────────────────────────────
    // Format with base reference (e.g. "$375 (~Rs 50,000)")
    // ─────────────────────────────────────────────
    formatWithBase(amountNpr: number, targetCurrency?: string): string {
        const ccy = (targetCurrency || this.selectedCurrency()).toUpperCase();
        if (ccy === 'NPR') return this.format(amountNpr, 'NPR');

        const converted = this.format(amountNpr, ccy);
        const baseFormatted = this.format(amountNpr, 'NPR');
        return `${converted} (~${baseFormatted})`;
    }

    // ─────────────────────────────────────────────
    // Get current exchange rate for selected currency
    // ─────────────────────────────────────────────
    getCurrentRate(currency?: string): number {
        const ccy = (currency || this.selectedCurrency()).toUpperCase();
        if (ccy === 'NPR') return 1;
        return this.rates()[ccy] || 0;
    }

    // ─────────────────────────────────────────────
    // Booking preview (calls backend for accurate pricing)
    // ─────────────────────────────────────────────
    previewBooking(itineraryId: number, currency: string, travelerCount: number = 1) {
        return this.http.post<BookingPreviewResponse>(`${this.apiUrl}/booking-preview`, {
            itineraryId,
            currency: currency.toUpperCase(),
            travelerCount
        });
    }

    // ─────────────────────────────────────────────
    // SignalR for real-time rate updates
    // ─────────────────────────────────────────────
    private connectSignalR(): void {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.serverBaseUrl}/hubs/notifications`, {
                accessTokenFactory: () => localStorage.getItem('accessToken') || ''
            })
            .withAutomaticReconnect()
            .build();

        // Listen for rate updates
        this.hubConnection.on('RateUpdated', (payload: { rates: { [key: string]: number }; lastUpdated: string }) => {
            this.rates.set(payload.rates);
            this.lastUpdated.set(payload.lastUpdated);
            console.log('[CurrencyService] Rates updated via SignalR', payload);
        });

        this.hubConnection
            .start()
            .catch(err => console.warn('CurrencyService SignalR connect error:', err));
    }

    // ─────────────────────────────────────────────
    // Disconnect
    // ─────────────────────────────────────────────
    disconnect(): void {
        this.hubConnection?.stop();
    }

    // ─────────────────────────────────────────────
    // LocalStorage helpers
    // ─────────────────────────────────────────────
    private loadCurrency(): string {
        return localStorage.getItem('currency') || 'NPR';
    }

    private loadRates(): { [key: string]: number } {
        try {
            const stored = localStorage.getItem('rates');
            if (stored) return JSON.parse(stored);
        } catch {}
        // Defaults
        return { NPR: 1, INR: 0.625, USD: 0.0075 };
    }
}
