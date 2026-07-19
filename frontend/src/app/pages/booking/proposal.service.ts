import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ===========================
// Interfaces
// ===========================

export interface ProposalDayRequest {
    dayNumber: number;
    title: string;
    description?: string;
    location: string;
    accommodation: string;
    transport: string;
    breakfastIncluded: boolean;
    lunchIncluded: boolean;
    dinnerIncluded: boolean;
    activities: string[];
    dailyCost: number;
}

export interface CreateProposalRequest {
    itineraryId: number;
    leadId?: number;
    travelerName: string;
    travelerEmail: string;
    travelerPhone?: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    notes?: string;
    days: ProposalDayRequest[];
}

export interface ProposalDayResponse {
    id: number;
    dayNumber: number;
    title: string;
    description?: string;
    location: string;
    accommodation: string;
    transport: string;
    breakfastIncluded: boolean;
    lunchIncluded: boolean;
    dinnerIncluded: boolean;
    activities: string[];
    dailyCost: number;
}

export interface ProposalResponse {
    id: number;
    itineraryId: number;
    token: string;
    travelerName: string;
    travelerEmail: string;
    travelerPhone?: string;
    itineraryTitle: string;
    status: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    notes?: string;
    createdAt: string;
    expiresAt: string;
    days: ProposalDayResponse[];
}

export interface ProposalListItem {
    id: number;
    token: string;
    leadId?: number;
    travelerName: string;
    travelerEmail: string;
    itineraryTitle: string;
    status: string;
    totalAmount: number;
    startDate: string;
    endDate: string;
    createdAt: string;
    expiresAt: string;
}

export interface ProposalPaymentResponse {
    id: number;
    proposalId: number;
    paymentType: string;
    amount: number;
    screenshotPath?: string;
    transactionReference?: string;
    status: string;
    verifiedBy?: string;
    createdAt: string;
    verifiedAt?: string;
}

export interface ProposalFeedbackResponse {
    id: number;
    proposalId: number;
    message: string;
    createdAt: string;
}

// ===========================
// Service
// ===========================

@Injectable({ providedIn: 'root' })
export class ProposalService {
    private baseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) {}

    // ===== Admin Endpoints (Authenticated) =====

    private getPrimaryColor(): string {
        return getComputedStyle(document.documentElement)
            .getPropertyValue('--p-primary-color')?.trim()
            || getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color')?.trim()
            || '#6366f1';
    }

    createProposal(request: CreateProposalRequest): Observable<ProposalResponse> {
        return this.http.post<ProposalResponse>(`${this.baseUrl}/Proposals/create`, request, {
            headers: new HttpHeaders({
                'X-Frontend-Url': window.location.origin,
                'X-Primary-Color': this.getPrimaryColor()
            })
        });
    }

    getProposals(): Observable<ProposalListItem[]> {
        return this.http.get<ProposalListItem[]>(`${this.baseUrl}/Proposals`);
    }

    getProposalsByLead(leadId: number): Observable<ProposalListItem[]> {
        return this.http.get<ProposalListItem[]>(`${this.baseUrl}/Proposals/by-lead/${leadId}`);
    }

    getProposalById(id: number): Observable<ProposalResponse> {
        return this.http.get<ProposalResponse>(`${this.baseUrl}/Proposals/${id}`);
    }

    getProposalPayments(id: number): Observable<ProposalPaymentResponse[]> {
        return this.http.get<ProposalPaymentResponse[]>(`${this.baseUrl}/Proposals/${id}/payments`);
    }

    getProposalFeedback(id: number): Observable<ProposalFeedbackResponse[]> {
        return this.http.get<ProposalFeedbackResponse[]>(`${this.baseUrl}/Proposals/${id}/feedback`);
    }

    verifyPayment(paymentId: number, approved: boolean, remarks?: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/Proposals/payment/${paymentId}/verify`, { approved, remarks });
    }

    resendProposal(id: number, request: CreateProposalRequest): Observable<ProposalResponse> {
        return this.http.put<ProposalResponse>(`${this.baseUrl}/Proposals/${id}/resend`, request, {
            headers: new HttpHeaders({
                'X-Frontend-Url': window.location.origin,
                'X-Primary-Color': this.getPrimaryColor()
            })
        });
    }

    // ===== Public Endpoints (No Auth) =====

    getProposalByToken(token: string): Observable<ProposalResponse> {
        return this.http.get<ProposalResponse>(`${this.baseUrl}/Proposals/public/${token}`);
    }

    acceptProposal(token: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/Proposals/public/${token}/accept`, {});
    }

    rejectProposal(token: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/Proposals/public/${token}/reject`, {});
    }

    submitPayment(token: string, request: { paymentType: string; amount: number; transactionReference?: string }): Observable<ProposalPaymentResponse> {
        return this.http.post<ProposalPaymentResponse>(`${this.baseUrl}/Proposals/public/${token}/payment`, request);
    }

    uploadScreenshot(paymentId: number, file: File): Observable<{ path: string; message: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ path: string; message: string }>(`${this.baseUrl}/Proposals/public/payment/${paymentId}/screenshot`, formData);
    }

    submitFeedback(token: string, message: string): Observable<ProposalFeedbackResponse> {
        return this.http.post<ProposalFeedbackResponse>(`${this.baseUrl}/Proposals/public/${token}/feedback`, { message });
    }

    getPaymentsByToken(token: string): Observable<ProposalPaymentResponse[]> {
        return this.http.get<ProposalPaymentResponse[]>(`${this.baseUrl}/Proposals/public/${token}/payments`);
    }

    getInvoiceByToken(token: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Proposals/public/${token}/invoice`);
    }
}
