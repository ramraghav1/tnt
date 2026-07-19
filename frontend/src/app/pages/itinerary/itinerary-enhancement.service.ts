import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ===========================
// MEDIA INTERFACES
// ===========================

export interface ItineraryMedia {
    id: number;
    itineraryId: number;
    mediaType: string; // 'Image', 'Video', 'VideoLink'
    mediaUrl: string;
    caption?: string;
    displayOrder: number;
    isFeatured: boolean;
    createdAt: string;
}

export interface CreateMediaRequest {
    mediaType: string;
    mediaUrl: string;
    caption?: string;
    displayOrder: number;
    isFeatured: boolean;
}

// ===========================
// ASSIGNMENT INTERFACES
// ===========================

export interface InstanceDayAssignment {
    id: number;
    instanceDayId: number;
    dayNumber: number;
    date?: string;
    hotelId?: number;
    hotelName?: string;
    roomType?: string;
    numberOfRooms?: number;
    guideId?: number;
    guideName?: string;
    vehicleId?: number;
    vehicleName?: string;
    notes?: string;
    assignedAt: string;
}

export interface CreateAssignmentRequest {
    instanceDayId: number;
    hotelId?: number;
    roomType?: string;
    numberOfRooms?: number;
    guideId?: number;
    vehicleId?: number;
    notes?: string;
}

// ===========================
// AVAILABILITY INTERFACES
// ===========================

export interface CheckAvailabilityRequest {
    inventoryType: string; // 'Hotel', 'Vehicle', 'Guide'
    inventoryId: number;
    startDate: string;
    endDate: string;
    requiredQuantity: number;
}

export interface AvailabilityResponse {
    available: boolean;
    message: string;
    conflicts?: Array<{
        date: string;
        available: number;
        required: number;
    }>;
}

// ===========================
// BOOKING WITH ASSIGNMENTS
// ===========================

export interface DayAssignment {
    dayNumber: number;
    hotelId?: number;
    roomType?: string;
    numberOfRooms?: number;
    guideId?: number;
    vehicleId?: number;
    notes?: string;
}

export interface CreateBookingWithAssignmentsRequest {
    itineraryId: number;
    departureDate: string;
    numberOfTravelers: number;
    leadTravelerName: string;
    leadTravelerEmail: string;
    leadTravelerPhone?: string;
    paymentStatus: string;
    totalAmount: number;
    paidAmount: number;
    specialRequirements?: string;
    assignments: DayAssignment[];
}

@Injectable({
    providedIn: 'root'
})
export class ItineraryEnhancementService {
    private baseUrl = `${environment.apiBaseUrl}/inventory/itinerary-enhancements`;

    constructor(private http: HttpClient) { }

    // ============================================================
    // MEDIA MANAGEMENT
    // ============================================================

    addMedia(itineraryId: number, request: CreateMediaRequest): Observable<{ mediaId: number; message: string }> {
        return this.http.post<{ mediaId: number; message: string }>(
            `${this.baseUrl}/itineraries/${itineraryId}/media`,
            request
        );
    }

    getMedia(itineraryId: number): Observable<ItineraryMedia[]> {
        return this.http.get<ItineraryMedia[]>(`${this.baseUrl}/itineraries/${itineraryId}/media`);
    }

    deleteMedia(mediaId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/media/${mediaId}`);
    }

    reorderMedia(itineraryId: number, mediaIds: number[]): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(
            `${this.baseUrl}/itineraries/${itineraryId}/media/reorder`,
            mediaIds
        );
    }

    setFeaturedMedia(mediaId: number): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.baseUrl}/media/${mediaId}/featured`, {});
    }

    // ============================================================
    // ASSIGNMENTS
    // ============================================================

    createBookingWithAssignments(request: CreateBookingWithAssignmentsRequest): Observable<any> {
        return this.http.post(`${this.baseUrl}/bookings/create-with-assignments`, request);
    }

    getAssignments(instanceDayId: number): Observable<InstanceDayAssignment> {
        return this.http.get<InstanceDayAssignment>(`${this.baseUrl}/assignments/instance-day/${instanceDayId}`);
    }

    updateAssignment(assignmentId: number, request: CreateAssignmentRequest): Observable<any> {
        return this.http.put(`${this.baseUrl}/assignments/${assignmentId}`, request);
    }

    deleteAssignment(assignmentId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/assignments/${assignmentId}`);
    }

    // ============================================================
    // AVAILABILITY
    // ============================================================

    checkAvailability(request: CheckAvailabilityRequest): Observable<AvailabilityResponse> {
        return this.http.post<AvailabilityResponse>(`${this.baseUrl}/availability/check`, request);
    }
}
