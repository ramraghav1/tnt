import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ===========================
// INTERFACES
// ===========================

export interface UnassignedBookingItem {
    instanceId: number;
    bookingReference?: string;
    itineraryId: number;
    itineraryTitle: string;
    startDate?: string;
    endDate?: string;
    totalPerson: number;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
    leadTravelerName?: string;
    leadTravelerEmail?: string;
    leadTravelerPhone?: string;
}

export interface BookingGroupByItinerary {
    itineraryId: number;
    itineraryTitle: string;
    totalBookings: number;
    totalPersons: number;
    bookings: UnassignedBookingItem[];
}

/** Sub-group within an itinerary, bookings sharing the same start date */
export interface DateSubGroup {
    startDate: string;          // ISO date string or 'unset'
    bookings: UnassignedBookingItem[];
    totalPersons: number;
}

export interface SuggestedDepartureItem {
    id: number;
    itineraryTitle: string;
    departureDate: string;
    endDate?: string;
    availableSeats: number;
    bookedCount: number;
    capacity: number;
    status: string;
    guideName?: string;
    vehicleInfo?: string;
}

export interface CreateDepartureRequest {
    itineraryId: number;
    startDate: string;
    endDate: string;
    capacity: number;
    guideId?: number;
    vehicleId?: number;
    bookingIds: number[];
    packagePrice: number;
    notes?: string;
}

export interface AssignBookingsToDepartureRequest {
    departureId: number;
    bookingIds: number[];
}

export interface DepartureDetailResponse {
    id: number;
    itineraryId: number;
    itineraryTitle: string;
    departureDate: string;
    endDate?: string;
    capacity: number;
    bookedCount: number;
    availableSeats: number;
    status: string;
    packagePrice: number;
    guideId?: number;
    guideName?: string;
    vehicleId?: number;
    vehicleInfo?: string;
    notes?: string;
    createdAt: string;
    assignedBookings: UnassignedBookingItem[];
}

export interface DepartureListItem {
    id: number;
    itineraryId: number;
    itineraryTitle: string;
    departureDate: string;
    endDate?: string;
    capacity: number;
    bookedCount: number;
    availableSeats: number;
    status: string;
    computedStatus: string;   // Upcoming | Ongoing | Completed | Cancelled
    packagePrice: number;
    guideId?: number;
    guideName?: string;
    guideSpecialization?: string;
    vehicleId?: number;
    vehicleInfo?: string;
    hasInventory: boolean;
    travelerCount: number;
    travelerNames?: string;
    notes?: string;
    createdAt: string;
}

// ===========================
// SERVICE
// ===========================
@Injectable({ providedIn: 'root' })
export class DepartureManagementService {
    private baseUrl = `${environment.apiBaseUrl}/departure-management`;

    constructor(private http: HttpClient) {}

    getUnassignedBookings(): Observable<BookingGroupByItinerary[]> {
        return this.http.get<BookingGroupByItinerary[]>(`${this.baseUrl}/unassigned-bookings`);
    }

    getSuggestedDepartures(itineraryId: number, requiredSeats: number): Observable<SuggestedDepartureItem[]> {
        const params = new HttpParams()
            .set('itineraryId', itineraryId)
            .set('requiredSeats', requiredSeats);
        return this.http.get<SuggestedDepartureItem[]>(`${this.baseUrl}/suggest`, { params });
    }

    createDeparture(request: CreateDepartureRequest): Observable<DepartureDetailResponse> {
        return this.http.post<DepartureDetailResponse>(`${this.baseUrl}/create`, request);
    }

    assignBookings(request: AssignBookingsToDepartureRequest): Observable<DepartureDetailResponse> {
        return this.http.post<DepartureDetailResponse>(`${this.baseUrl}/assign`, request);
    }

    getDepartureById(id: number): Observable<DepartureDetailResponse> {
        return this.http.get<DepartureDetailResponse>(`${this.baseUrl}/${id}`);
    }

    getAllDepartures(): Observable<DepartureListItem[]> {
        return this.http.get<DepartureListItem[]>(`${this.baseUrl}/all`);
    }
}
