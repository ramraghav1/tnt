import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ===========================
// Tax Config Interfaces
// ===========================
export interface TaxConfig {
    id: number;
    taxName: string;
    taxRate: number;
    taxType: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateTaxConfigRequest {
    taxName: string;
    taxRate: number;
    taxType: string;
}

// ===========================
// Invoice Interfaces
// ===========================
export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    taxConfigId?: number;
}

export interface CreateInvoiceRequest {
    bookingId: number;
    currency: string;
    exchangeRate: number;
    notes?: string;
    lineItems: InvoiceLineItem[];
}

export interface InvoiceListItem {
    id: number;
    invoiceNumber: string;
    bookingReference: string;
    clientName: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
    currency: string;
    invoiceDate: string;
    dueDate?: string;
}

export interface InvoiceDetail {
    id: number;
    invoiceNumber: string;
    bookingId: number;
    bookingReference: string;
    clientName: string;
    clientContact: string;
    status: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    currency: string;
    exchangeRate: number;
    notes?: string;
    invoiceDate: string;
    dueDate?: string;
    lineItems: InvoiceLineItemDetail[];
}

export interface InvoiceLineItemDetail {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    lineTotal: number;
}

// ===========================
// Commission Interfaces
// ===========================
export interface Commission {
    id: number;
    bookingReference: string;
    agentName: string;
    commissionRate: number;
    commissionAmount: number;
    currency: string;
    status: string;
    notes?: string;
    createdAt: string;
}

export interface CreateCommissionRequest {
    bookingId: number;
    agentName: string;
    commissionRate: number;
    commissionAmount: number;
    currency: string;
    notes?: string;
}

// ===========================
// Expense Interfaces
// ===========================
export interface Expense {
    id: number;
    bookingReference?: string;
    expenseName: string;
    category: string;
    amount: number;
    currency: string;
    expenseDate: string;
    vendor?: string;
    receiptNumber?: string;
    notes?: string;
    createdAt: string;
}

export interface CreateExpenseRequest {
    bookingId?: number;
    expenseName: string;
    category: string;
    amount: number;
    currency: string;
    expenseDate: string;
    vendor?: string;
    receiptNumber?: string;
    notes?: string;
}

// ===========================
// Refund Interfaces
// ===========================
export interface Refund {
    id: number;
    bookingReference: string;
    refundAmount: number;
    currency: string;
    reason: string;
    status: string;
    requestedAt: string;
    processedAt?: string;
    processedBy?: string;
    notes?: string;
}

export interface CreateRefundRequest {
    bookingId: number;
    refundAmount: number;
    currency: string;
    reason: string;
    notes?: string;
}

export interface ProcessRefundRequest {
    transactionReference: string;
    notes?: string;
}

// ===========================
// Finance Summary Interface
// ===========================
export interface FinanceSummary {
    totalRevenue: number;
    totalExpenses: number;
    totalCommissions: number;
    totalRefunds: number;
    netProfit: number;
    pendingInvoices: number;
    overdueInvoices: number;
    pendingRefunds: number;
    currency: string;
}

// ===========================
// Finance Service
// ===========================
@Injectable({ providedIn: 'root' })
export class FinanceService {
    private baseUrl = `${environment.apiBaseUrl}/finance`;

    constructor(private http: HttpClient) {}

    // Summary
    getSummary(): Observable<FinanceSummary> {
        return this.http.get<FinanceSummary>(`${this.baseUrl}/summary`);
    }

    // Tax Config
    getTaxConfigs(): Observable<TaxConfig[]> {
        return this.http.get<TaxConfig[]>(`${this.baseUrl}/tax-config`);
    }

    createTaxConfig(request: CreateTaxConfigRequest): Observable<TaxConfig> {
        return this.http.post<TaxConfig>(`${this.baseUrl}/tax-config`, request);
    }

    updateTaxConfig(id: number, request: CreateTaxConfigRequest): Observable<TaxConfig> {
        return this.http.put<TaxConfig>(`${this.baseUrl}/tax-config/${id}`, request);
    }

    // Invoices
    getInvoices(page = 1, pageSize = 20, status?: string): Observable<InvoiceListItem[]> {
        let params = new HttpParams().set('page', page).set('pageSize', pageSize);
        if (status) params = params.set('status', status);
        return this.http.get<InvoiceListItem[]>(`${this.baseUrl}/invoices`, { params });
    }

    getInvoiceById(id: number): Observable<InvoiceDetail> {
        return this.http.get<InvoiceDetail>(`${this.baseUrl}/invoices/${id}`);
    }

    generateInvoiceFromBooking(bookingId: number): Observable<InvoiceDetail> {
        return this.http.post<InvoiceDetail>(`${this.baseUrl}/invoices/generate/${bookingId}`, {});
    }

    createInvoice(request: CreateInvoiceRequest): Observable<InvoiceDetail> {
        return this.http.post<InvoiceDetail>(`${this.baseUrl}/invoices`, request);
    }

    updateInvoiceStatus(id: number, status: string): Observable<any> {
        return this.http.patch(`${this.baseUrl}/invoices/${id}/status`, { status });
    }

    // Commissions
    getCommissions(): Observable<Commission[]> {
        return this.http.get<Commission[]>(`${this.baseUrl}/commissions`);
    }

    getCommissionById(id: number): Observable<Commission> {
        return this.http.get<Commission>(`${this.baseUrl}/commissions/${id}`);
    }

    getCommissionsByBooking(bookingId: number): Observable<Commission[]> {
        return this.http.get<Commission[]>(`${this.baseUrl}/commissions/booking/${bookingId}`);
    }

    createCommission(request: CreateCommissionRequest): Observable<Commission> {
        return this.http.post<Commission>(`${this.baseUrl}/commissions`, request);
    }

    updateCommissionStatus(id: number, status: string): Observable<any> {
        return this.http.patch(`${this.baseUrl}/commissions/${id}/status`, { status });
    }

    // Expenses
    getExpenses(): Observable<Expense[]> {
        return this.http.get<Expense[]>(`${this.baseUrl}/expenses`);
    }

    getExpenseById(id: number): Observable<Expense> {
        return this.http.get<Expense>(`${this.baseUrl}/expenses/${id}`);
    }

    createExpense(request: CreateExpenseRequest): Observable<Expense> {
        return this.http.post<Expense>(`${this.baseUrl}/expenses`, request);
    }

    updateExpense(id: number, request: CreateExpenseRequest): Observable<Expense> {
        return this.http.put<Expense>(`${this.baseUrl}/expenses/${id}`, request);
    }

    deleteExpense(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/expenses/${id}`);
    }

    // Refunds
    getRefunds(): Observable<Refund[]> {
        return this.http.get<Refund[]>(`${this.baseUrl}/refunds`);
    }

    getRefundById(id: number): Observable<Refund> {
        return this.http.get<Refund>(`${this.baseUrl}/refunds/${id}`);
    }

    createRefund(request: CreateRefundRequest): Observable<Refund> {
        return this.http.post<Refund>(`${this.baseUrl}/refunds`, request);
    }

    processRefund(id: number, request: ProcessRefundRequest): Observable<any> {
        return this.http.patch(`${this.baseUrl}/refunds/${id}/process`, request);
    }
}
