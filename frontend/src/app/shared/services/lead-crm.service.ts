import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ===========================
// Interfaces
// ===========================

export interface Lead {
    id: number;
    tenantId: number;
    name: string;
    email?: string;
    phone?: string;
    country?: string;
    source: string;
    status: string;
    priority: string;
    interestedIn?: string;
    travelDateFrom?: string;
    travelDateTo?: string;
    pax?: number;
    budget?: number;
    currency: string;
    assignedTo?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    convertedAt?: string;
    proposalId?: number;
    followUpCount: number;
    lastFollowUpDate?: string;
}

export interface CreateLeadRequest {
    name: string;
    email?: string;
    phone?: string;
    country?: string;
    source: string;
    priority: string;
    interestedIn?: string;
    travelDateFrom?: string;
    travelDateTo?: string;
    pax?: number;
    budget?: number;
    currency: string;
    assignedTo?: string;
    notes?: string;
}

export interface FollowUp {
    id: number;
    leadId: number;
    type: string;
    message: string;
    nextFollowUpDate?: string;
    createdBy?: string;
    createdAt: string;
}

export interface CreateFollowUpRequest {
    leadId: number;
    type: string;
    message: string;
    nextFollowUpDate?: string;
}

export interface Quotation {
    id: number;
    tenantId: number;
    quotationNumber: string;
    leadId?: number;
    leadName?: string;
    proposalId?: number;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    travelDateFrom?: string;
    travelDateTo?: string;
    pax: number;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    status: string;
    validUntil?: string;
    notes?: string;
    createdAt: string;
    lineItems: QuotationLineItem[];
}

export interface QuotationLineItem {
    id?: number;
    itemType: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
    sortOrder: number;
}

export interface Amendment {
    id: number;
    bookingInstanceId: number;
    bookingReference?: string;
    amendmentType: string;
    description: string;
    oldValue?: string;
    newValue?: string;
    status: string;
    requestedBy?: string;
    approvedBy?: string;
    feeAmount: number;
    createdAt: string;
    resolvedAt?: string;
}

export interface SupplierContract {
    id: number;
    tenantId: number;
    supplierType: string;
    supplierId: number;
    supplierName: string;
    contractNumber?: string;
    startDate: string;
    endDate: string;
    rateType: string;
    baseRate: number;
    currency: string;
    terms?: string;
    status: string;
    createdAt: string;
}

export interface B2BAgent {
    id: number;
    tenantId: number;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    country?: string;
    region?: string;
    commissionRate: number;
    creditLimit: number;
    creditBalance: number;
    status: string;
    notes?: string;
    createdAt: string;
    totalBookings: number;
}

export interface AgentPricing {
    id: number;
    agentId: number;
    itineraryId: number;
    itineraryTitle?: string;
    pricePerPerson: number;
    currency: string;
    validFrom?: string;
    validTo?: string;
}

export interface LedgerEntry {
    id: number;
    agentId: number;
    transactionType: string;
    amount: number;
    reference?: string;
    description?: string;
    balanceAfter: number;
    createdAt: string;
}

export interface SupplierPayment {
    id: number;
    tenantId: number;
    supplierType: string;
    supplierId: number;
    supplierName: string;
    bookingInstanceId?: number;
    bookingReference?: string;
    amount: number;
    currency: string;
    paymentMethod?: string;
    paymentDate: string;
    reference?: string;
    status: string;
    notes?: string;
    createdAt: string;
}

export interface ServiceVoucher {
    id: number;
    tenantId: number;
    voucherNumber: string;
    bookingInstanceId?: number;
    bookingReference?: string;
    voucherType: string;
    supplierType?: string;
    supplierId?: number;
    supplierName?: string;
    serviceDate?: string;
    details?: string;
    status: string;
    createdAt: string;
}

export interface RoomingAssignment {
    id: number;
    departureId: number;
    bookingInstanceId: number;
    bookingReference?: string;
    travelerId: number;
    travelerName?: string;
    hotelId?: number;
    hotelName?: string;
    roomType?: string;
    roomNumber?: string;
    checkInDate?: string;
    checkOutDate?: string;
    notes?: string;
}

@Injectable({ providedIn: 'root' })
export class LeadCrmService {
    private baseUrl = `${environment.apiBaseUrl}/LeadCrm`;

    constructor(private http: HttpClient) {}

    // ======================== LEADS ========================
    getLeads(): Observable<Lead[]> {
        return this.http.get<Lead[]>(`${this.baseUrl}/leads`);
    }

    getLead(id: number): Observable<Lead> {
        return this.http.get<Lead>(`${this.baseUrl}/leads/${id}`);
    }

    createLead(data: CreateLeadRequest): Observable<Lead> {
        return this.http.post<Lead>(`${this.baseUrl}/leads`, data);
    }

    updateLead(id: number, data: Partial<Lead>): Observable<Lead> {
        return this.http.put<Lead>(`${this.baseUrl}/leads/${id}`, data);
    }

    deleteLead(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/leads/${id}`);
    }

    convertLead(leadId: number, proposalId: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/leads/${leadId}/convert/${proposalId}`, {});
    }

    // ======================== FOLLOW-UPS ========================
    getAllFollowUps(): Observable<FollowUp[]> {
        return this.http.get<FollowUp[]>(`${this.baseUrl}/follow-ups`);
    }

    getFollowUps(leadId: number): Observable<FollowUp[]> {
        return this.http.get<FollowUp[]>(`${this.baseUrl}/leads/${leadId}/follow-ups`);
    }

    createFollowUp(data: CreateFollowUpRequest): Observable<FollowUp> {
        return this.http.post<FollowUp>(`${this.baseUrl}/follow-ups`, data);
    }

    // ======================== QUOTATIONS ========================
    getQuotations(): Observable<Quotation[]> {
        return this.http.get<Quotation[]>(`${this.baseUrl}/quotations`);
    }

    getQuotation(id: number): Observable<Quotation> {
        return this.http.get<Quotation>(`${this.baseUrl}/quotations/${id}`);
    }

    createQuotation(data: any): Observable<Quotation> {
        return this.http.post<Quotation>(`${this.baseUrl}/quotations`, data);
    }

    updateQuotationStatus(id: number, status: string): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/quotations/${id}/status`, { status });
    }

    // ======================== AMENDMENTS ========================
    getAmendments(): Observable<Amendment[]> {
        return this.http.get<Amendment[]>(`${this.baseUrl}/amendments`);
    }

    createAmendment(data: any): Observable<Amendment> {
        return this.http.post<Amendment>(`${this.baseUrl}/amendments`, data);
    }

    updateAmendmentStatus(id: number, status: string): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/amendments/${id}/status`, { status });
    }

    // ======================== CONTRACTS ========================
    getContracts(): Observable<SupplierContract[]> {
        return this.http.get<SupplierContract[]>(`${this.baseUrl}/contracts`);
    }

    createContract(data: any): Observable<SupplierContract> {
        return this.http.post<SupplierContract>(`${this.baseUrl}/contracts`, data);
    }

    updateContractStatus(id: number, status: string): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/contracts/${id}/status`, { status });
    }

    // ======================== B2B AGENTS ========================
    getAgents(): Observable<B2BAgent[]> {
        return this.http.get<B2BAgent[]>(`${this.baseUrl}/agents`);
    }

    getAgent(id: number): Observable<B2BAgent> {
        return this.http.get<B2BAgent>(`${this.baseUrl}/agents/${id}`);
    }

    createAgent(data: any): Observable<B2BAgent> {
        return this.http.post<B2BAgent>(`${this.baseUrl}/agents`, data);
    }

    updateAgentStatus(id: number, status: string): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/agents/${id}/status`, { status });
    }

    // ======================== B2B PRICING ========================
    getAgentPricing(agentId: number): Observable<AgentPricing[]> {
        return this.http.get<AgentPricing[]>(`${this.baseUrl}/agents/${agentId}/pricing`);
    }

    createAgentPricing(data: any): Observable<AgentPricing> {
        return this.http.post<AgentPricing>(`${this.baseUrl}/agent-pricing`, data);
    }

    deleteAgentPricing(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/agent-pricing/${id}`);
    }

    // ======================== B2B LEDGER ========================
    getAgentLedger(agentId: number): Observable<LedgerEntry[]> {
        return this.http.get<LedgerEntry[]>(`${this.baseUrl}/agents/${agentId}/ledger`);
    }

    createLedgerEntry(data: any): Observable<LedgerEntry> {
        return this.http.post<LedgerEntry>(`${this.baseUrl}/ledger`, data);
    }

    // ======================== SUPPLIER PAYMENTS ========================
    getSupplierPayments(): Observable<SupplierPayment[]> {
        return this.http.get<SupplierPayment[]>(`${this.baseUrl}/supplier-payments`);
    }

    createSupplierPayment(data: any): Observable<SupplierPayment> {
        return this.http.post<SupplierPayment>(`${this.baseUrl}/supplier-payments`, data);
    }

    updateSupplierPaymentStatus(id: number, status: string): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/supplier-payments/${id}/status`, { status });
    }

    // ======================== VOUCHERS ========================
    getVouchers(): Observable<ServiceVoucher[]> {
        return this.http.get<ServiceVoucher[]>(`${this.baseUrl}/vouchers`);
    }

    createVoucher(data: any): Observable<ServiceVoucher> {
        return this.http.post<ServiceVoucher>(`${this.baseUrl}/vouchers`, data);
    }

    updateVoucherStatus(id: number, status: string): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/vouchers/${id}/status`, { status });
    }

    // ======================== ROOMING ========================
    getRooming(departureId: number): Observable<RoomingAssignment[]> {
        return this.http.get<RoomingAssignment[]>(`${this.baseUrl}/rooming/${departureId}`);
    }

    createRooming(data: any): Observable<RoomingAssignment> {
        return this.http.post<RoomingAssignment>(`${this.baseUrl}/rooming`, data);
    }

    deleteRooming(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/rooming/${id}`);
    }
}
