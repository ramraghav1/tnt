import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ═══════════════════════════════════════════
// LOCATION
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// HOTEL
// ═══════════════════════════════════════════
export interface HotelRoom {
    id?: number;
    roomType: string;
    capacity: number;
    totalRooms: number;
    pricePerNight: number;
    baseCurrency?: string;
    features: string[];
}

export interface Hotel {
    id?: number;
    name: string;
    location: string;
    locationId?: number;
    address: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    starRating?: number;
    category?: string;
    amenities: string[];
    rooms: HotelRoom[];
    isActive?: boolean;
    createdAt?: string;
}

// ═══════════════════════════════════════════
// VEHICLE
// ═══════════════════════════════════════════
export interface Vehicle {
    id?: number;
    vehicleType: string;
    model: string;
    registrationNumber: string;
    capacity: number;
    features: string[];
    pricePerDay: number;
    baseCurrency?: string;
    locationFromId?: number;
    locationToId?: number;
    driverName?: string;
    driverContact?: string;
    insuranceExpiry?: string;
    permitExpiry?: string;
    isActive?: boolean;
    createdAt?: string;
}

// ═══════════════════════════════════════════
// GUIDE
// ═══════════════════════════════════════════
export interface Guide {
    id?: number;
    fullName: string;
    contactNumber?: string;
    emailAddress?: string;
    experienceYears?: number;
    languages: string[];
    specialization?: string;
    certifications?: string;
    pricePerDay: number;
    baseCurrency?: string;
    rating?: number;
    bio?: string;
    photo?: string;
    isActive?: boolean;
    createdAt?: string;
}

// ═══════════════════════════════════════════
// ACTIVITY
// ═══════════════════════════════════════════
export interface Activity {
    id?: number;
    name: string;
    activityType: string;
    location: string;
    locationId?: number;
    durationHours: number;
    difficultyLevel?: string;
    maxParticipants?: number;
    minParticipants?: number;
    equipment: string[];
    pricePerPerson: number;
    baseCurrency?: string;
    isMandatory?: boolean;
    description?: string;
    safetyInstructions?: string;
    images: string[];
    isActive?: boolean;
    createdAt?: string;
}

// ═══════════════════════════════════════════
// CURRENCY
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// EXCHANGE RATE
// ═══════════════════════════════════════════
export interface ExchangeRate {
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

// ═══════════════════════════════════════════
// SEASON
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// HOTEL SEASON PRICING
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// VEHICLE ROUTE
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// GUIDE LOCATION
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// ACTIVITY LOCATION
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class InventoryV2Service {
    private base = environment.apiBaseUrl;

    constructor(private http: HttpClient) {}

    // ─── LOCATIONS ───────────────────────────
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

    // ─── HOTELS ──────────────────────────────
    getHotels(includeInactive = false): Observable<Hotel[]> {
        return this.http.get<Hotel[]>(`${this.base}/inventory/hotels`, { params: { includeInactive } });
    }
    getHotel(id: number): Observable<Hotel> {
        return this.http.get<Hotel>(`${this.base}/inventory/hotels/${id}`);
    }
    createHotel(data: Hotel): Observable<Hotel> {
        return this.http.post<Hotel>(`${this.base}/inventory/hotels`, data);
    }
    updateHotel(id: number, data: Partial<Hotel>): Observable<Hotel> {
        return this.http.put<Hotel>(`${this.base}/inventory/hotels/${id}`, data);
    }
    deleteHotel(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/inventory/hotels/${id}`);
    }
    activateHotel(id: number): Observable<void> {
        return this.http.post<void>(`${this.base}/inventory/hotels/${id}/activate`, {});
    }

    // ─── VEHICLES ────────────────────────────
    getVehicles(includeInactive = false): Observable<Vehicle[]> {
        return this.http.get<Vehicle[]>(`${this.base}/inventory/vehicles`, { params: { includeInactive } });
    }
    getVehicle(id: number): Observable<Vehicle> {
        return this.http.get<Vehicle>(`${this.base}/inventory/vehicles/${id}`);
    }
    createVehicle(data: Vehicle): Observable<Vehicle> {
        return this.http.post<Vehicle>(`${this.base}/inventory/vehicles`, data);
    }
    updateVehicle(id: number, data: Partial<Vehicle>): Observable<Vehicle> {
        return this.http.put<Vehicle>(`${this.base}/inventory/vehicles/${id}`, data);
    }
    deleteVehicle(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/inventory/vehicles/${id}`);
    }
    activateVehicle(id: number): Observable<void> {
        return this.http.post<void>(`${this.base}/inventory/vehicles/${id}/activate`, {});
    }

    // ─── GUIDES ──────────────────────────────
    getGuides(includeInactive = false): Observable<Guide[]> {
        return this.http.get<Guide[]>(`${this.base}/inventory/guides`, { params: { includeInactive } });
    }
    getGuide(id: number): Observable<Guide> {
        return this.http.get<Guide>(`${this.base}/inventory/guides/${id}`);
    }
    createGuide(data: Guide): Observable<Guide> {
        return this.http.post<Guide>(`${this.base}/inventory/guides`, data);
    }
    updateGuide(id: number, data: Partial<Guide>): Observable<Guide> {
        return this.http.put<Guide>(`${this.base}/inventory/guides/${id}`, data);
    }
    deleteGuide(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/inventory/guides/${id}`);
    }
    activateGuide(id: number): Observable<void> {
        return this.http.post<void>(`${this.base}/inventory/guides/${id}/activate`, {});
    }

    // ─── ACTIVITIES ──────────────────────────
    getActivities(includeInactive = false): Observable<Activity[]> {
        return this.http.get<Activity[]>(`${this.base}/inventory/activities`, { params: { includeInactive } });
    }
    getActivity(id: number): Observable<Activity> {
        return this.http.get<Activity>(`${this.base}/inventory/activities/${id}`);
    }
    createActivity(data: Activity): Observable<Activity> {
        return this.http.post<Activity>(`${this.base}/inventory/activities`, data);
    }
    updateActivity(id: number, data: Partial<Activity>): Observable<Activity> {
        return this.http.put<Activity>(`${this.base}/inventory/activities/${id}`, data);
    }
    deleteActivity(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/inventory/activities/${id}`);
    }
    activateActivity(id: number): Observable<void> {
        return this.http.post<void>(`${this.base}/inventory/activities/${id}/activate`, {});
    }

    // ─── CURRENCIES ──────────────────────────
    getCurrencies(includeInactive = false): Observable<Currency[]> {
        return this.http.get<Currency[]>(`${this.base}/inventory/currencies`, { params: { includeInactive } });
    }
    createCurrency(data: CreateCurrencyRequest): Observable<Currency> {
        return this.http.post<Currency>(`${this.base}/inventory/currencies`, data);
    }
    setCurrencyActive(id: number, isActive: boolean): Observable<void> {
        return this.http.put<void>(`${this.base}/inventory/currencies/${id}/active`, null, { params: { isActive } });
    }

    // ─── EXCHANGE RATES ──────────────────────
    getLatestRates(): Observable<ExchangeRate[]> {
        return this.http.get<ExchangeRate[]>(`${this.base}/inventory/exchange-rates`);
    }
    getRate(currencyCode: string, date?: string): Observable<ExchangeRate> {
        let params = new HttpParams();
        if (date) params = params.set('date', date);
        return this.http.get<ExchangeRate>(`${this.base}/inventory/exchange-rates/${currencyCode}`, { params });
    }
    getRateHistory(currencyCode: string, limit = 30): Observable<ExchangeRate[]> {
        return this.http.get<ExchangeRate[]>(`${this.base}/inventory/exchange-rates/${currencyCode}/history`, { params: { limit } });
    }
    upsertRate(data: UpsertExchangeRateRequest): Observable<ExchangeRate> {
        return this.http.post<ExchangeRate>(`${this.base}/inventory/exchange-rates`, data);
    }

    // ─── SEASONS ─────────────────────────────
    getSeasons(includeInactive = false): Observable<Season[]> {
        return this.http.get<Season[]>(`${this.base}/inventory/seasons`, { params: { includeInactive } });
    }
    getSeason(id: number): Observable<Season> {
        return this.http.get<Season>(`${this.base}/inventory/seasons/${id}`);
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

    // ─── HOTEL SEASON PRICING ────────────────
    getHotelSeasonPricingByRoom(roomId: number): Observable<HotelSeasonPricing[]> {
        return this.http.get<HotelSeasonPricing[]>(`${this.base}/inventory/hotel-season-pricing/room/${roomId}`);
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

    // ─── VEHICLE ROUTES ──────────────────────
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

    // ─── GUIDE LOCATIONS ─────────────────────
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

    // ─── ACTIVITY LOCATIONS ──────────────────
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
