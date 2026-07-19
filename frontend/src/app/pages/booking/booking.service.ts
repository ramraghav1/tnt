import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ===========================
// Interfaces
// ===========================

export interface Itinerary {
    id: number;
    title: string;
    description: string;
    durationDays: number;
    difficultyLevel: string;
    pricingMode: string;
    overallPrice: number;
}

export interface DayCostEntry {
    name: string;
    category: string;
    price: number;
}

export interface ItineraryDay {
    id: number;
    dayNumber: number;
    title: string;
    description: string;
    location: string;
    accommodation: string;
    transport: string;
    breakfastIncluded: boolean;
    lunchIncluded: boolean;
    dinnerIncluded: boolean;
    activities: string[];
    costs: DayCostEntry[];
    dailyCost: number;
}

export interface ItineraryDetail {
    id: number;
    title: string;
    description: string;
    durationDays: number;
    difficultyLevel: string;
    pricingMode: string;
    overallPrice: number;
    days: ItineraryDay[];
}

export interface TravelerRequest {
    fullName: string;
    contactNumber: string;
    email: string;
    nationality: string;
    adults: number;
    children: number;
    seniors: number;
}

export interface CreateBookingRequest {
    itineraryId: number;
    startDate: string;
    endDate: string;
    travelers: TravelerRequest[];
    specialRequests: string;
    totalAmount: number;
}

export interface CustomizeDayRequest {
    instanceDayId: number;
    title: string;
    location: string;
    accommodation: string;
    transport: string;
    breakfastIncluded: boolean;
    lunchIncluded: boolean;
    dinnerIncluded: boolean;
    activities: string[];
}

export interface CustomizeBookingRequest {
    days: CustomizeDayRequest[];
}

export interface UpdateBookingDayRequest {
    id: number;
    title: string;
    location: string;
    accommodation: string;
    transport: string;
    breakfastIncluded: boolean;
    lunchIncluded: boolean;
    dinnerIncluded: boolean;
    activities: string[];
}

export interface UpdateBookingRequest {
    startDate: string;
    endDate: string;
    specialRequests: string;
    totalAmount: number;
    travelers: TravelerRequest[];
    days: UpdateBookingDayRequest[];
}

// ===========================
// Pricing Interfaces
// ===========================

export interface CostItem {
    id: number;
    name: string;
    category: string;
    unitType: string;
    isActive: boolean;
    createdAt: string;
}

export interface CostItemRate {
    id: number;
    costItemId: number;
    costItemName: string;
    location: string | null;
    itineraryId: number | null;
    price: number;
    currency: string;
    effectiveFrom: string | null;
    effectiveTo: string | null;
}

export interface DayCost {
    id: number;
    itineraryDayId: number;
    costItemId: number;
    costItemName: string;
    category: string;
    unitType: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface BookingCostItem {
    name: string;
    category: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface BookingDayCost {
    dayNumber: number;
    location: string | null;
    costItems: BookingCostItem[];
}

export interface BookingPricing {
    totalAmount: number;
    amountPaid: number;
    balanceAmount: number;
    dayCosts: BookingDayCost[];
}

export interface BookingListItem {
    instanceId: number;
    bookingReference: string;
    templateTitle: string;
    status: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
    primaryTravelerName?: string;
    primaryTravelerContact?: string;
    primaryTravelerEmail?: string;
}

// Full booking detail (returned by GET /Bookings/{id})
export interface BookingTravelerDetail {
    id: number;
    fullName: string;
    contactNumber?: string;
    email?: string;
    nationality?: string;
    adults: number;
    children: number;
    seniors: number;
}

export interface BookingPaymentDetail {
    id: number;
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionReference: string;
    paidAt: string;
}

export interface BookingDayDetail {
    id: number;
    dayNumber: number;
    date?: string;
    title?: string;
    location?: string;
    accommodation?: string;
    transport?: string;
    breakfastIncluded: boolean;
    lunchIncluded: boolean;
    dinnerIncluded: boolean;
    activities: string[];
}

export interface BookingDetail {
    instanceId: number;
    templateId: number;
    bookingReference: string;
    templateTitle: string;
    status: string;
    isCustomized: boolean;
    totalAmount: number;
    amountPaid: number;
    balanceAmount: number;
    paymentStatus: string;
    travelerApproved: boolean;
    adminApproved: boolean;
    startDate: string;
    endDate: string;
    createdAt: string;
    specialRequests?: string;
    days: BookingDayDetail[];
    travelers: BookingTravelerDetail[];
    payments: BookingPaymentDetail[];
}

export interface DashboardStats {
    totalBookings: number;
    confirmed: number;
    pending: number;
    draft: number;
    cancelled: number;
    totalRevenue: number;
    collectedRevenue: number;
    totalTravelers: number;
    totalItineraries: number;
    monthlyBookings: { month: string; count: number }[];
    monthlyRevenue: { month: string; amount: number }[];
    topItineraries: { title: string; bookingCount: number }[];
    recentBookings: { instanceId: number; bookingReference: string; templateTitle: string; status: string; paymentStatus: string; totalAmount: number; createdAt: string }[];
    paymentStatusBreakdown: { label: string; count: number }[];
}

// ===========================
// Operations Stats (Tour Operations Dashboard)
// ===========================
export interface OperationsStats {
    todayArrivals: number;
    activeTreks: number;
    pendingPayments: number;
    newInquiries: number;
    revenueToday: number;
    vehiclesAssigned: number;
    todayOperations: OperationItem[];
    upcomingTreks: UpcomingTrek[];
    alerts: DashboardAlert[];
}

export interface OperationItem {
    type: string;
    title: string;
    details?: string;
    time?: string;
    icon: string;
}

export interface UpcomingTrek {
    departureId: number;
    itineraryTitle: string;
    departureDate: string;
    bookedCount: number;
    capacity: number;
    guideName?: string;
    status: string;
}

export interface DashboardAlert {
    severity: string;
    icon: string;
    title: string;
    detail?: string;
    type: string;
}

// ===========================
// Inventory Interfaces
// ===========================

export interface InventoryGuide {
    id: number;
    fullName: string;
    specialization?: string;
    pricePerDay: number;
    rating?: number;
    photo?: string;
    languages?: string[];
    experienceYears?: number;
    isActive?: boolean;
}

export interface InventoryVehicle {
    id: number;
    vehicleType: string;
    model?: string;
    capacity?: number;
    pricePerDay: number;
    driverName?: string;
    features?: string[];
    isActive?: boolean;
}

export interface InventoryHotelRoom {
    id: number;
    roomType: string;
    capacity: number;
    pricePerNight: number;
    totalRooms: number;
}

export interface InventoryHotel {
    id: number;
    name: string;
    location?: string;
    starRating?: number;
    category?: string;
    rooms?: InventoryHotelRoom[];
    isActive?: boolean;
}

export interface AssignInventoryRequest {
    inventoryType: string;
    inventoryId: number;
    startDate: string;
    endDate: string;
    quantity: number;
    price: number;
    notes?: string;
}

export interface BookingInventoryItem {
    id: number;
    inventoryType: string;
    inventoryId: number;
    inventoryName: string;
    startDate: string;
    endDate: string;
    quantity: number;
    price: number;
    notes?: string;
}

// ===========================
// Service
// ===========================

@Injectable({ providedIn: 'root' })
export class BookingService {
    private baseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) {}

    // Itinerary
    getItineraries(): Observable<Itinerary[]> {
        return this.http.get<Itinerary[]>(`${this.baseUrl}/Itineraries/list`);
    }

    getItineraryDetail(id: number): Observable<ItineraryDetail> {
        return this.http.get<ItineraryDetail>(`${this.baseUrl}/Itineraries/detail?id=${id}`);
    }

    // Booking
    createBooking(request: CreateBookingRequest): Observable<any> {
        return this.http.post(`${this.baseUrl}/Bookings/create`, request);
    }

    getBookings(): Observable<BookingListItem[]> {
        return this.http.get<BookingListItem[]>(`${this.baseUrl}/Bookings`);
    }

    getBookingDetail(instanceId: number): Observable<BookingDetail> {
        return this.http.get<BookingDetail>(`${this.baseUrl}/Bookings/${instanceId}`);
    }

    addPayment(bookingId: number, request: { amount: number; currency: string; paymentMethod: string; transactionReference: string }): Observable<any> {
        return this.http.post(`${this.baseUrl}/Bookings/${bookingId}/payment`, request);
    }

    updateStatus(bookingId: number, status: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/Bookings/${bookingId}/status`, { status });
    }

    customizeBooking(bookingId: number, request: CustomizeBookingRequest): Observable<any> {
        return this.http.put(`${this.baseUrl}/Bookings/${bookingId}/customize`, request);
    }

    updateBooking(bookingId: number, request: UpdateBookingRequest): Observable<BookingDetail> {
        return this.http.put<BookingDetail>(`${this.baseUrl}/Bookings/${bookingId}`, request);
    }

    // Cost Items
    getCostItems(): Observable<CostItem[]> {
        return this.http.get<CostItem[]>(`${this.baseUrl}/Pricing/cost-items`);
    }

    createCostItem(request: { name: string; category: string; unitType: string }): Observable<CostItem> {
        return this.http.post<CostItem>(`${this.baseUrl}/Pricing/cost-items`, request);
    }

    // Cost Item Rates
    createRate(request: any): Observable<CostItemRate> {
        return this.http.post<CostItemRate>(`${this.baseUrl}/Pricing/rates`, request);
    }

    getRatesByItinerary(itineraryId: number): Observable<CostItemRate[]> {
        return this.http.get<CostItemRate[]>(`${this.baseUrl}/Pricing/rates/itinerary/${itineraryId}`);
    }

    // Day Costs
    assignDayCost(request: { itineraryDayId: number; costItemId: number; quantity: number }): Observable<DayCost> {
        return this.http.post<DayCost>(`${this.baseUrl}/Pricing/day-costs`, request);
    }

    getDayCostsByItinerary(itineraryId: number): Observable<DayCost[]> {
        return this.http.get<DayCost[]>(`${this.baseUrl}/Pricing/day-costs/itinerary/${itineraryId}`);
    }

    removeDayCost(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/Pricing/day-costs/${id}`);
    }

    // Booking Pricing
    getBookingPricing(instanceId: number): Observable<BookingPricing> {
        return this.http.get<BookingPricing>(`${this.baseUrl}/Pricing/booking/${instanceId}`);
    }

    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.baseUrl}/Bookings/dashboard-stats`);
    }

    getOperationsStats(): Observable<OperationsStats> {
        return this.http.get<OperationsStats>(`${this.baseUrl}/Bookings/operations-stats`);
    }

    // ===========================
    // Inventory
    // ===========================
    getGuides(): Observable<InventoryGuide[]> {
        return this.http.get<InventoryGuide[]>(`${this.baseUrl}/inventory/guides`);
    }

    getVehicles(): Observable<InventoryVehicle[]> {
        return this.http.get<InventoryVehicle[]>(`${this.baseUrl}/inventory/vehicles`);
    }

    getHotels(): Observable<InventoryHotel[]> {
        return this.http.get<InventoryHotel[]>(`${this.baseUrl}/inventory/hotels`);
    }

    assignInventory(bookingId: number, request: AssignInventoryRequest): Observable<any> {
        return this.http.post(`${this.baseUrl}/Bookings/${bookingId}/inventory`, request);
    }

    getBookingInventory(bookingId: number): Observable<BookingInventoryItem[]> {
        return this.http.get<BookingInventoryItem[]>(`${this.baseUrl}/Bookings/${bookingId}/inventory`);
    }

    removeInventoryItem(itemId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/Bookings/inventory/${itemId}`);
    }
}
