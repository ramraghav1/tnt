import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ===========================
// LOCATION
// ===========================
export interface Location {
    id: number;
    tenantId: number;
    name: string;
    code?: string;
    country: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    costMultiplier: number;
    timezone?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLocationRequest {
    name: string;
    code?: string;
    country: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    costMultiplier: number;
    timezone?: string;
    description?: string;
}

// ===========================
// CURRENCY
// ===========================
export interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    decimalPlaces: number;
    isBase: boolean;
    isActive: boolean;
}

export interface CreateCurrencyRequest {
    code: string;
    name: string;
    symbol: string;
    decimalPlaces: number;
    isBase: boolean;
}

// ===========================
// EXCHANGE RATE V2
// ===========================
export interface ExchangeRateV2 {
    id: number;
    currencyCode: string;
    rateToUsd: number;
    rateFromUsd: number;
    effectiveDate: string;
    source?: string;
    createdAt: string;
}

export interface UpsertExchangeRateRequest {
    currencyCode: string;
    rateToUsd: number;
    rateFromUsd: number;
    effectiveDate: string;
    source?: string;
}

// ===========================
// SEASON
// ===========================
export interface Season {
    id: number;
    tenantId: number;
    name: string;
    seasonType: string;
    startDate: string;
    endDate: string;
    priceMultiplier: number;
    description?: string;
    year: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSeasonRequest {
    name: string;
    seasonType: string;
    startDate: string;
    endDate: string;
    priceMultiplier: number;
    description?: string;
    year: number;
}

// ===========================
// HOTEL SEASON PRICING
// ===========================
export interface HotelSeasonPricing {
    id: number;
    hotelRoomId: number;
    seasonId: number;
    seasonName?: string;
    seasonType?: string;
    pricePerNight: number;
    currency: string;
    notes?: string;
}

export interface CreateHotelSeasonPricingRequest {
    hotelRoomId: number;
    seasonId: number;
    pricePerNight: number;
    currency: string;
    notes?: string;
}

// ===========================
// VEHICLE ROUTE
// ===========================
export interface VehicleRoute {
    id: number;
    tenantId: number;
    vehicleType: string;
    locationFromId: number;
    locationFromName?: string;
    locationToId: number;
    locationToName?: string;
    distanceKm?: number;
    durationHours?: number;
    basePrice: number;
    currency: string;
    capacity: number;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVehicleRouteRequest {
    vehicleType: string;
    locationFromId: number;
    locationToId: number;
    distanceKm?: number;
    durationHours?: number;
    basePrice: number;
    currency: string;
    capacity: number;
    notes?: string;
}

// ===========================
// GUIDE LOCATION
// ===========================
export interface GuideLocation {
    id: number;
    guideId: number;
    locationId: number;
    locationName?: string;
    isPrimary: boolean;
    notes?: string;
}

export interface CreateGuideLocationRequest {
    guideId: number;
    locationId: number;
    isPrimary: boolean;
    notes?: string;
}

// ===========================
// ACTIVITY LOCATION
// ===========================
export interface ActivityLocation {
    id: number;
    activityId: number;
    locationId: number;
    locationName?: string;
    isPrimary: boolean;
}

export interface CreateActivityLocationRequest {
    activityId: number;
    locationId: number;
    isPrimary: boolean;
}

@Injectable({ providedIn: 'root' })
export class InventoryRedesignService {
    private base = environment.apiBaseUrl;

    constructor(private http: HttpClient) {}

    // ======================== LOCATIONS ========================
    getLocations(includeInactive = false): Observable<Location[]> {
        return this.http.get<Location[]>(`${this.base}/inventory/locations`, { params: { includeInactive } });
    }
    getLocation(id: number): Observable<Location> {
        return this.http.get<Location>(`${this.base}/inventory/locations/${id}`);
    }
    createLocation(data: CreateLocationRequest): Observable<Location> {
        return this.http.post<Location>(`${this.base}/inventory/locations`, data);
    }
    updateLocation(id: number, data: Partial<CreateLocationRequest>): Observable<Location> {
        return this.http.put<Location>(`${this.base}/inventory/locations/${id}`, data);
    }
    deleteLocation(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/inventory/locations/${id}`);
    }
    activateLocation(id: number): Observable<void> {
        return this.http.post<void>(`${this.base}/inventory/locations/${id}/activate`, {});
    }

    // ======================== CURRENCIES ========================
    getCurrencies(includeInactive = false): Observable<Currency[]> {
        return this.http.get<Currency[]>(`${this.base}/inventory/currencies`, { params: { includeInactive } });
    }
    createCurrency(data: CreateCurrencyRequest): Observable<Currency> {
        return this.http.post<Currency>(`${this.base}/inventory/currencies`, data);
    }
    setCurrencyActive(id: number, isActive: boolean): Observable<void> {
        return this.http.put<void>(`${this.base}/inventory/currencies/${id}/active`, null, { params: { isActive } });
    }

    // ======================== EXCHANGE RATES V2 ========================
    getLatestRates(): Observable<ExchangeRateV2[]> {
        return this.http.get<ExchangeRateV2[]>(`${this.base}/inventory/exchange-rates`);
    }
    getRate(currencyCode: string, date?: string): Observable<ExchangeRateV2> {
        let params = new HttpParams();
        if (date) params = params.set('date', date);
        return this.http.get<ExchangeRateV2>(`${this.base}/inventory/exchange-rates/${currencyCode}`, { params });
    }
    getRateHistory(currencyCode: string, limit = 30): Observable<ExchangeRateV2[]> {
        return this.http.get<ExchangeRateV2[]>(`${this.base}/inventory/exchange-rates/${currencyCode}/history`, { params: { limit } });
    }
    upsertRate(data: UpsertExchangeRateRequest): Observable<ExchangeRateV2> {
        return this.http.post<ExchangeRateV2>(`${this.base}/inventory/exchange-rates`, data);
    }

    // ======================== SEASONS ========================
    getSeasons(includeInactive = false): Observable<Season[]> {
        return this.http.get<Season[]>(`${this.base}/inventory/seasons`, { params: { includeInactive } });
    }
    getSeason(id: number): Observable<Season> {
        return this.http.get<Season>(`${this.base}/inventory/seasons/${id}`);
    }
    getSeasonsByDate(date: string): Observable<Season[]> {
        return this.http.get<Season[]>(`${this.base}/inventory/seasons/by-date`, { params: { date } });
    }
    createSeason(data: CreateSeasonRequest): Observable<Season> {
        return this.http.post<Season>(`${this.base}/inventory/seasons`, data);
    }
    updateSeason(id: number, data: Partial<CreateSeasonRequest>): Observable<Season> {
        return this.http.put<Season>(`${this.base}/inventory/seasons/${id}`, data);
    }
    deleteSeason(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/inventory/seasons/${id}`);
    }
    activateSeason(id: number): Observable<void> {
        return this.http.post<void>(`${this.base}/inventory/seasons/${id}/activate`, {});
    }

    // ======================== HOTEL SEASON PRICING ========================
    getHotelSeasonPricingByRoom(hotelRoomId: number): Observable<HotelSeasonPricing[]> {
        return this.http.get<HotelSeasonPricing[]>(`${this.base}/inventory/hotel-season-pricing/room/${hotelRoomId}`);
    }
    getHotelSeasonPricingBySeason(seasonId: number): Observable<HotelSeasonPricing[]> {
        return this.http.get<HotelSeasonPricing[]>(`${this.base}/inventory/hotel-season-pricing/season/${seasonId}`);
    }
    createHotelSeasonPricing(data: CreateHotelSeasonPricingRequest): Observable<HotelSeasonPricing> {
        return this.http.post<HotelSeasonPricing>(`${this.base}/inventory/hotel-season-pricing`, data);
    }
    deleteHotelSeasonPricing(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/inventory/hotel-season-pricing/${id}`);
    }

    // ======================== VEHICLE ROUTES ========================
    getVehicleRoutes(includeInactive = false): Observable<VehicleRoute[]> {
        return this.http.get<VehicleRoute[]>(`${this.base}/inventory/vehicle-routes`, { params: { includeInactive } });
    }
    getVehicleRoute(id: number): Observable<VehicleRoute> {
        return this.http.get<VehicleRoute>(`${this.base}/inventory/vehicle-routes/${id}`);
    }
    getVehicleRoutesByRoute(fromId: number, toId: number): Observable<VehicleRoute[]> {
        return this.http.get<VehicleRoute[]>(`${this.base}/inventory/vehicle-routes/by-route`, { params: { fromId, toId } });
    }
    createVehicleRoute(data: CreateVehicleRouteRequest): Observable<VehicleRoute> {
        return this.http.post<VehicleRoute>(`${this.base}/inventory/vehicle-routes`, data);
    }
    updateVehicleRoute(id: number, data: Partial<CreateVehicleRouteRequest>): Observable<VehicleRoute> {
        return this.http.put<VehicleRoute>(`${this.base}/inventory/vehicle-routes/${id}`, data);
    }
    deleteVehicleRoute(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/inventory/vehicle-routes/${id}`);
    }
    activateVehicleRoute(id: number): Observable<void> {
        return this.http.post<void>(`${this.base}/inventory/vehicle-routes/${id}/activate`, {});
    }

    // ======================== GUIDE LOCATIONS ========================
    getGuideLocations(guideId: number): Observable<GuideLocation[]> {
        return this.http.get<GuideLocation[]>(`${this.base}/inventory/guide-locations/guide/${guideId}`);
    }
    getGuidesByLocation(locationId: number): Observable<GuideLocation[]> {
        return this.http.get<GuideLocation[]>(`${this.base}/inventory/guide-locations/location/${locationId}`);
    }
    createGuideLocation(data: CreateGuideLocationRequest): Observable<GuideLocation> {
        return this.http.post<GuideLocation>(`${this.base}/inventory/guide-locations`, data);
    }
    deleteGuideLocation(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/inventory/guide-locations/${id}`);
    }

    // ======================== ACTIVITY LOCATIONS ========================
    getActivityLocations(activityId: number): Observable<ActivityLocation[]> {
        return this.http.get<ActivityLocation[]>(`${this.base}/inventory/activity-locations/activity/${activityId}`);
    }
    getActivitiesByLocation(locationId: number): Observable<ActivityLocation[]> {
        return this.http.get<ActivityLocation[]>(`${this.base}/inventory/activity-locations/location/${locationId}`);
    }
    createActivityLocation(data: CreateActivityLocationRequest): Observable<ActivityLocation> {
        return this.http.post<ActivityLocation>(`${this.base}/inventory/activity-locations`, data);
    }
    deleteActivityLocation(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/inventory/activity-locations/${id}`);
    }
}
