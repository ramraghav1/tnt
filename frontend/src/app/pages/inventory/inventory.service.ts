import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ===========================
// HOTEL INTERFACES
// ===========================

export interface HotelRoom {
    id?: number;
    roomType: string;
    capacity: number;
    totalRooms: number;
    pricePerNight: number;
    features: string[];
}

export interface Hotel {
    id?: number;
    name: string;
    location: string;
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

// ===========================
// VEHICLE INTERFACES
// ===========================

export interface Vehicle {
    id?: number;
    vehicleType: string;
    model: string;
    registrationNumber: string;
    capacity: number;
    features: string[];
    pricePerDay: number;
    driverName?: string;
    driverContact?: string;
    insuranceExpiry?: string;
    permitExpiry?: string;
    isActive?: boolean;
    createdAt?: string;
}

// ===========================
// GUIDE INTERFACES
// ===========================

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
    rating?: number;
    bio?: string;
    photo?: string;
    isActive?: boolean;
    createdAt?: string;
}

// ===========================
// ACTIVITY INTERFACES
// ===========================

export interface Activity {
    id?: number;
    name: string;
    activityType: string;
    location: string;
    durationHours: number;
    difficultyLevel?: string;
    maxParticipants?: number;
    minParticipants?: number;
    equipment: string[];
    pricePerPerson: number;
    description?: string;
    safetyInstructions?: string;
    images: string[];
    isActive?: boolean;
    createdAt?: string;
}

// ===========================
// AVAILABILITY INTERFACES
// ===========================

export interface CheckAvailabilityRequest {
    inventoryType: string;
    inventoryId?: number;
    startDate: string;
    endDate: string;
    requiredCapacity: number;
}

export interface AvailabilityResponse {
    date: string;
    inventoryType: string;
    inventoryId: number;
    inventoryName: string;
    totalCapacity: number;
    bookedCapacity: number;
    availableCapacity: number;
    status: string;
    price?: number;
    isAvailable: boolean;
}

export interface BlockAvailabilityRequest {
    inventoryType: string;
    inventoryId: number;
    startDate: string;
    endDate: string;
    reason: string;
    notes?: string;
}

export interface AvailabilityBlock {
    id: number;
    inventoryType: string;
    inventoryId: number;
    inventoryName: string;
    startDate: string;
    endDate: string;
    reason: string;
    notes?: string;
    createdAt: string;
}

export interface InitializeAvailabilityRequest {
    inventoryType: string;
    inventoryId: number;
    startDate: string;
    endDate: string;
    capacity: number;
}

// ===========================
// PACKAGE DEPARTURE INTERFACES
// ===========================

export interface CreatePackageDepartureRequest {
    itineraryId: number;
    departureDate: string;
    minGroupSize: number;
    maxGroupSize: number;
    packagePrice: number;
    isGuaranteedDeparture: boolean;
    notes?: string;
}

export interface PackageDeparture {
    id: number;
    itineraryId: number;
    itineraryTitle: string;
    departureDate: string;
    minGroupSize: number;
    maxGroupSize: number;
    currentBookings: number;
    availableSeats: number;
    status: string;
    packagePrice: number;
    isGuaranteedDeparture: boolean;
    canStillBook: boolean;
    notes?: string;
    createdAt: string;
}

// ===========================
// CALENDAR INTERFACES
// ===========================

export interface CalendarEvent {
    id: number;
    eventType: string;
    inventoryType?: string;
    inventoryId?: number;
    title: string;
    startDate: string;
    endDate: string;
    status: string;
    color?: string;
    description?: string;
    linkedBookingId?: number;
    // Assigned resources (populated for Booking events)
    guideName?: string;
    vehicleName?: string;
    hotelName?: string;
}

export interface CalendarViewRequest {
    startDate: string;
    endDate: string;
    inventoryType?: string;
    inventoryId?: number;
}

export interface CalendarViewResponse {
    events: CalendarEvent[];
}

// ===========================
// BOOKING INVENTORY INTERFACES
// ===========================

export interface AssignInventoryRequest {
    bookingInstanceId: number;
    inventoryType: string;
    inventoryId: number;
    startDate: string;
    endDate: string;
    quantity: number;
    price: number;
    notes?: string;
}

export interface BookingInventory {
    id: number;
    bookingInstanceId: number;
    inventoryType: string;
    inventoryId: number;
    inventoryName: string;
    startDate: string;
    endDate: string;
    quantity: number;
    price: number;
    notes?: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private baseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) { }

    // ============================================================
    // HOTELS
    // ============================================================

    getHotels(includeInactive = false): Observable<Hotel[]> {
        const params = new HttpParams().set('includeInactive', includeInactive);
        return this.http.get<Hotel[]>(`${this.baseUrl}/inventory/hotels`, { params });
    }

    getHotelById(id: number): Observable<Hotel> {
        return this.http.get<Hotel>(`${this.baseUrl}/inventory/hotels/${id}`);
    }

    createHotel(hotel: Hotel): Observable<Hotel> {
        return this.http.post<Hotel>(`${this.baseUrl}/inventory/hotels`, hotel);
    }

    updateHotel(id: number, hotel: Partial<Hotel>): Observable<Hotel> {
        return this.http.put<Hotel>(`${this.baseUrl}/inventory/hotels/${id}`, hotel);
    }

    deleteHotel(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/inventory/hotels/${id}`);
    }

    activateHotel(id: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/inventory/hotels/${id}/activate`, {});
    }

    // ============================================================
    // VEHICLES
    // ============================================================

    getVehicles(includeInactive = false): Observable<Vehicle[]> {
        const params = new HttpParams().set('includeInactive', includeInactive);
        return this.http.get<Vehicle[]>(`${this.baseUrl}/inventory/vehicles`, { params });
    }

    getVehicleById(id: number): Observable<Vehicle> {
        return this.http.get<Vehicle>(`${this.baseUrl}/inventory/vehicles/${id}`);
    }

    createVehicle(vehicle: Vehicle): Observable<Vehicle> {
        return this.http.post<Vehicle>(`${this.baseUrl}/inventory/vehicles`, vehicle);
    }

    updateVehicle(id: number, vehicle: Partial<Vehicle>): Observable<Vehicle> {
        return this.http.put<Vehicle>(`${this.baseUrl}/inventory/vehicles/${id}`, vehicle);
    }

    deleteVehicle(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/inventory/vehicles/${id}`);
    }

    activateVehicle(id: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/inventory/vehicles/${id}/activate`, {});
    }

    // ============================================================
    // GUIDES
    // ============================================================

    getGuides(includeInactive = false): Observable<Guide[]> {
        const params = new HttpParams().set('includeInactive', includeInactive);
        return this.http.get<Guide[]>(`${this.baseUrl}/inventory/guides`, { params });
    }

    getGuideById(id: number): Observable<Guide> {
        return this.http.get<Guide>(`${this.baseUrl}/inventory/guides/${id}`);
    }

    createGuide(guide: Guide): Observable<Guide> {
        return this.http.post<Guide>(`${this.baseUrl}/inventory/guides`, guide);
    }

    updateGuide(id: number, guide: Partial<Guide>): Observable<Guide> {
        return this.http.put<Guide>(`${this.baseUrl}/inventory/guides/${id}`, guide);
    }

    deleteGuide(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/inventory/guides/${id}`);
    }

    activateGuide(id: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/inventory/guides/${id}/activate`, {});
    }

    // ============================================================
    // ACTIVITIES
    // ============================================================

    getActivities(includeInactive = false): Observable<Activity[]> {
        const params = new HttpParams().set('includeInactive', includeInactive);
        return this.http.get<Activity[]>(`${this.baseUrl}/inventory/activities`, { params });
    }

    getActivityById(id: number): Observable<Activity> {
        return this.http.get<Activity>(`${this.baseUrl}/inventory/activities/${id}`);
    }

    createActivity(activity: Activity): Observable<Activity> {
        return this.http.post<Activity>(`${this.baseUrl}/inventory/activities`, activity);
    }

    updateActivity(id: number, activity: Partial<Activity>): Observable<Activity> {
        return this.http.put<Activity>(`${this.baseUrl}/inventory/activities/${id}`, activity);
    }

    deleteActivity(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/inventory/activities/${id}`);
    }

    activateActivity(id: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/inventory/activities/${id}/activate`, {});
    }

    // ============================================================
    // AVAILABILITY
    // ============================================================

    checkAvailability(request: CheckAvailabilityRequest): Observable<AvailabilityResponse[]> {
        return this.http.post<AvailabilityResponse[]>(`${this.baseUrl}/availability/check`, request);
    }

    initializeAvailability(request: InitializeAvailabilityRequest): Observable<any> {
        return this.http.post(`${this.baseUrl}/availability/initialize`, request);
    }

    createBlock(request: BlockAvailabilityRequest): Observable<AvailabilityBlock> {
        return this.http.post<AvailabilityBlock>(`${this.baseUrl}/availability/blocks`, request);
    }

    getBlocks(startDate?: string, endDate?: string): Observable<AvailabilityBlock[]> {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        return this.http.get<AvailabilityBlock[]>(`${this.baseUrl}/availability/blocks`, { params });
    }

    deleteBlock(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/availability/blocks/${id}`);
    }

    getCalendarView(request: CalendarViewRequest): Observable<CalendarViewResponse> {
        return this.http.post<CalendarViewResponse>(`${this.baseUrl}/availability/calendar`, request);
    }

    // ============================================================
    // PACKAGE DEPARTURES
    // ============================================================

    createPackageDeparture(request: CreatePackageDepartureRequest): Observable<PackageDeparture> {
        return this.http.post<PackageDeparture>(`${this.baseUrl}/availability/departures`, request);
    }

    getPackageDepartures(itineraryId?: number): Observable<PackageDeparture[]> {
        let params = new HttpParams();
        if (itineraryId) params = params.set('itineraryId', itineraryId);
        return this.http.get<PackageDeparture[]>(`${this.baseUrl}/availability/departures`, { params });
    }

    getPackageDepartureById(id: number): Observable<PackageDeparture> {
        return this.http.get<PackageDeparture>(`${this.baseUrl}/availability/departures/${id}`);
    }

    updatePackageDeparture(id: number, request: Partial<CreatePackageDepartureRequest>): Observable<PackageDeparture> {
        return this.http.put<PackageDeparture>(`${this.baseUrl}/availability/departures/${id}`, request);
    }

    deletePackageDeparture(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/availability/departures/${id}`);
    }

    // ============================================================
    // BOOKING INVENTORY
    // ============================================================

    assignInventoryToBooking(request: AssignInventoryRequest): Observable<BookingInventory> {
        return this.http.post<BookingInventory>(`${this.baseUrl}/availability/booking-inventory`, request);
    }

    getBookingInventory(bookingInstanceId: number): Observable<BookingInventory[]> {
        return this.http.get<BookingInventory[]>(`${this.baseUrl}/availability/booking-inventory/${bookingInstanceId}`);
    }

    removeInventoryFromBooking(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/availability/booking-inventory/${id}`);
    }
}
