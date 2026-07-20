import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ═══════════════════════════════════════════
// BUILDER INTERFACES
// ═══════════════════════════════════════════
export interface BuilderItem {
    id?: number;
    itemType: string;        // hotel, transport, activity, meal, guide
    inventoryItemId?: number;
    itemName: string;
    itemDetails?: string;
    sortOrder: number;
    quantity: number;
    unitPrice: number;
    currency: string;
    notes?: string;
    /** For hotel items: how many pax the unit price covers (used to calculate rooms needed) */
    paxCount?: number;
}

export interface BuilderDay {
    id?: number;
    dayNumber: number;
    title?: string;
    location?: string;
    locationId?: number;
    accommodationCategoryId?: number;
    accommodationCategoryName?: string;
    notes?: string;
    items: BuilderItem[];
    expanded: boolean;       // UI-only
}

export interface SaveBuilderRequest {
    title: string;
    description?: string;
    durationDays: number;
    defaultCurrency: string;
    seasonId?: number;
    markupPercentage: number;
    numPax: number;
    status: string;
    difficultyLevel?: string;
    days: {
        dayNumber: number;
        title?: string;
        location?: string;
        locationId?: number;
        accommodationCategoryId?: number;
        notes?: string;
        items: {
            itemType: string;
            inventoryItemId?: number;
            itemName: string;
            itemDetails?: string;
            sortOrder: number;
            quantity: number;
            unitPrice: number;
            currency: string;
            notes?: string;
            /** For hotel items: how many pax the unit price covers (used to calculate rooms needed) */
            paxCount?: number;
        }[];
    }[];
}

export interface BuilderResponse {
    id: number;
    title: string;
    description?: string;
    durationDays: number;
    defaultCurrency: string;
    seasonId?: number;
    markupPercentage: number;
    numPax: number;
    status: string;
    difficultyLevel?: string;
    isActive: boolean;
    createdAt: string;
    days: {
        id: number;
        dayNumber: number;
        title?: string;
        location?: string;
        locationId?: number;
        accommodationCategoryId?: number;
        accommodationCategoryName?: string;
        notes?: string;
        items: {
            id: number;
            itemType: string;
            inventoryItemId?: number;
            itemName: string;
            itemDetails?: string;
            sortOrder: number;
            quantity: number;
            unitPrice: number;
            currency: string;
            notes?: string;
            /** For hotel items: how many pax the unit price covers (used to calculate rooms needed) */
            paxCount?: number;
        }[];
    }[];
}

export interface BuilderListItem {
    id: number;
    title: string;
    durationDays: number;
    status: string;
    defaultCurrency: string;
    numPax: number;
    isActive: boolean;
    createdAt: string;
}

export interface PricingSummary {
    accommodation: number;
    transport: number;
    activities: number;
    meals: number;
    guide: number;
    others: number;
    subtotal: number;
    markupPercentage: number;
    markupAmount: number;
    totalEstimatedPrice: number;
    pricePerPerson: number;
    numPax: number;
    seasonName?: string;
    seasonMultiplier: number;
    locationMultiplier: number;
    totalMultiplier: number;
}

// ═══════════════════════════════════════════
// INVENTORY LIBRARY ITEMS (loaded from existing APIs)
// ═══════════════════════════════════════════
export interface InventoryHotel {
    id: number;
    name: string;
    location: string;
    starRating?: number;
    category?: string;
    rooms?: { roomType: string; pricePerNight: number; capacity: number }[];
}

export interface InventoryVehicle {
    id: number;
    vehicleType: string;
    model: string;
    capacity: number;
    pricePerDay: number;
}

export interface InventoryActivity {
    id: number;
    name: string;
    activityType: string;
    location?: string;
    pricePerPerson: number;
    durationHours: number;
}

export interface InventoryGuide {
    id: number;
    fullName: string;
    phone?: string;
    email?: string;
    specialization?: string;
    languages?: string[];
    pricePerDay: number;
    rating?: number;
    experienceYears?: number;
    bio?: string;
}

export interface LocationItem {
    id: number;
    name: string;
    country: string;
    costMultiplier: number;
}

export interface SeasonItem {
    id: number;
    name: string;
    seasonType: string;
    startDate: string;
    endDate: string;
    priceMultiplier: number;
}

export interface CurrencyItem {
    id: number;
    code: string;
    name: string;
    symbol: string;
}

export interface AccommodationCategory {
    id: number;
    name: string;
    code: string;
    icon?: string;
    starRating?: number;
    sortOrder: number;
    description?: string;
    isActive: boolean;
    avgPricePerNight?: number;
    baseCurrency?: string;
    /** Number of pax the avg price covers (e.g. 2 = price per room for 2 people) */
    paxCount: number;
}

export interface HotelSuggestion {
    hotelId: number;
    hotelName: string;
    location?: string;
    starRating?: number;
    category?: string;
    accommodationCategoryId?: number;
    accommodationCategoryName?: string;
    minPrice?: number;
    description?: string;
}

// ═══════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class ItineraryBuilderService {
    private api = `${environment.apiBaseUrl}/itinerary-builder`;
    private invApi = `${environment.apiBaseUrl}`;

    constructor(private http: HttpClient) {}

    // Builder CRUD
    save(req: SaveBuilderRequest): Observable<BuilderResponse> {
        return this.http.post<BuilderResponse>(this.api, req);
    }

    update(id: number, req: SaveBuilderRequest): Observable<BuilderResponse> {
        return this.http.put<BuilderResponse>(`${this.api}/${id}`, req);
    }

    getById(id: number): Observable<BuilderResponse> {
        return this.http.get<BuilderResponse>(`${this.api}/${id}`);
    }

    getAll(): Observable<BuilderListItem[]> {
        return this.http.get<BuilderListItem[]>(this.api);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.api}/${id}`);
    }

    calculatePricing(id: number): Observable<PricingSummary> {
        return this.http.post<PricingSummary>(`${this.api}/${id}/pricing`, {});
    }

    pricingPreview(data: any): Observable<PricingSummary> {
        return this.http.post<PricingSummary>(`${this.api}/pricing-preview`, data);
    }

    // Inventory library (existing APIs)
    getHotels(): Observable<InventoryHotel[]> {
        return this.http.get<InventoryHotel[]>(`${this.invApi}/inventory/hotels`);
    }

    getVehicles(): Observable<InventoryVehicle[]> {
        return this.http.get<InventoryVehicle[]>(`${this.invApi}/inventory/vehicles`);
    }

    getActivities(): Observable<InventoryActivity[]> {
        return this.http.get<InventoryActivity[]>(`${this.invApi}/inventory/activities`);
    }

    getGuides(): Observable<InventoryGuide[]> {
        return this.http.get<InventoryGuide[]>(`${this.invApi}/inventory/guides`);
    }

    getLocations(): Observable<LocationItem[]> {
        return this.http.get<LocationItem[]>(`${this.invApi}/inventory/locations`);
    }

    getSeasons(): Observable<SeasonItem[]> {
        return this.http.get<SeasonItem[]>(`${this.invApi}/inventory/seasons`);
    }

    getCurrencies(): Observable<CurrencyItem[]> {
        return this.http.get<CurrencyItem[]>(`${this.invApi}/inventory/currencies`);
    }

    getAccommodationCategories(): Observable<AccommodationCategory[]> {
        return this.http.get<AccommodationCategory[]>(`${this.invApi}/inventory/accommodation-categories`);
    }

    getHotelsByCategory(categoryId: number, locationId?: number): Observable<HotelSuggestion[]> {
        let url = `${this.invApi}/inventory/accommodation-categories/${categoryId}/hotels`;
        if (locationId) url += `?locationId=${locationId}`;
        return this.http.get<HotelSuggestion[]>(url);
    }
}
