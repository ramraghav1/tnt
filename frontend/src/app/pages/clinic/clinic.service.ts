import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ─── Tenant ────────────────────────────────────────
export interface Tenant {
    id: number;
    name: string;
    slug: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    timezone: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateTenantRequest {
    name: string;
    slug: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    timezone?: string;
}

export interface UpdateTenantRequest {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    timezone?: string;
    isActive?: boolean;
}

// ─── Practitioner ──────────────────────────────────
export interface Practitioner {
    id: number;
    tenantId: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    specialization?: string;
    bio?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreatePractitionerRequest {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    specialization?: string;
    bio?: string;
    role?: string;
}

export interface UpdatePractitionerRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    specialization?: string;
    bio?: string;
    role?: string;
    isActive?: boolean;
}

// ─── Patient ───────────────────────────────────────
export interface Patient {
    id: number;
    tenantId: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    medicalNotes?: string;
    allergies?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreatePatientRequest {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    medicalNotes?: string;
    allergies?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
}

export interface UpdatePatientRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    medicalNotes?: string;
    allergies?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    isActive?: boolean;
}

// ─── Clinic Service ────────────────────────────────
export interface ClinicServiceItem {
    id: number;
    tenantId: number;
    name: string;
    description?: string;
    durationMinutes: number;
    price: number;
    currency: string;
    category?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateClinicServiceRequest {
    name: string;
    description?: string;
    durationMinutes: number;
    price: number;
    currency?: string;
    category?: string;
}

export interface UpdateClinicServiceRequest {
    name?: string;
    description?: string;
    durationMinutes?: number;
    price?: number;
    currency?: string;
    category?: string;
    isActive?: boolean;
}

// ─── Appointment ───────────────────────────────────
export interface Appointment {
    id: number;
    tenantId: number;
    patientId: number;
    patientName?: string;
    practitionerId: number;
    practitionerName?: string;
    serviceId: number;
    serviceName?: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: string;
    notes?: string;
    recurrenceRule?: string;
    recurrenceGroupId?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateAppointmentRequest {
    patientId: number;
    practitionerId: number;
    serviceId: number;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status?: string;
    notes?: string;
    recurrenceRule?: string;
}

export interface UpdateAppointmentRequest {
    patientId?: number;
    practitionerId?: number;
    serviceId?: number;
    appointmentDate?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
    notes?: string;
    recurrenceRule?: string;
}

// ─── Invoice ───────────────────────────────────────
export interface Invoice {
    id: number;
    tenantId: number;
    invoiceNumber: string;
    patientId: number;
    patientName?: string;
    appointmentId?: number;
    amount: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
    status: string;
    paymentMethod?: string;
    paidAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateInvoiceRequest {
    invoiceNumber: string;
    patientId: number;
    appointmentId?: number;
    amount: number;
    tax: number;
    discount: number;
    total: number;
    currency?: string;
    status?: string;
    paymentMethod?: string;
    notes?: string;
}

export interface UpdateInvoiceRequest {
    amount?: number;
    tax?: number;
    discount?: number;
    total?: number;
    status?: string;
    paymentMethod?: string;
    paidAt?: string;
    notes?: string;
}

// ─── Service ───────────────────────────────────────
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClinicService {
    private baseUrl = `${environment.apiBaseUrl}/clinic`;

    constructor(private http: HttpClient) {}

    // ═══ Tenant ═══
    getTenants(): Observable<Tenant[]> {
        return this.http.get<Tenant[]>(`${this.baseUrl}/tenants`);
    }
    getTenant(id: number): Observable<Tenant> {
        return this.http.get<Tenant>(`${this.baseUrl}/tenants/${id}`);
    }
    getTenantBySlug(slug: string): Observable<Tenant> {
        return this.http.get<Tenant>(`${this.baseUrl}/tenants/by-slug/${slug}`);
    }
    createTenant(req: CreateTenantRequest): Observable<Tenant> {
        return this.http.post<Tenant>(`${this.baseUrl}/tenants`, req);
    }
    updateTenant(id: number, req: UpdateTenantRequest): Observable<Tenant> {
        return this.http.put<Tenant>(`${this.baseUrl}/tenants/${id}`, req);
    }
    deleteTenant(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/tenants/${id}`);
    }

    // ═══ Practitioner ═══
    getPractitioners(tenantId: number): Observable<Practitioner[]> {
        return this.http.get<Practitioner[]>(`${this.baseUrl}/tenants/${tenantId}/practitioners`);
    }
    getPractitioner(tenantId: number, id: number): Observable<Practitioner> {
        return this.http.get<Practitioner>(`${this.baseUrl}/tenants/${tenantId}/practitioners/${id}`);
    }
    createPractitioner(tenantId: number, req: CreatePractitionerRequest): Observable<Practitioner> {
        return this.http.post<Practitioner>(`${this.baseUrl}/tenants/${tenantId}/practitioners`, req);
    }
    updatePractitioner(tenantId: number, id: number, req: UpdatePractitionerRequest): Observable<Practitioner> {
        return this.http.put<Practitioner>(`${this.baseUrl}/tenants/${tenantId}/practitioners/${id}`, req);
    }
    deletePractitioner(tenantId: number, id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/tenants/${tenantId}/practitioners/${id}`);
    }

    // ═══ Patient ═══
    getPatients(tenantId: number): Observable<Patient[]> {
        return this.http.get<Patient[]>(`${this.baseUrl}/tenants/${tenantId}/patients`);
    }
    getPatient(tenantId: number, id: number): Observable<Patient> {
        return this.http.get<Patient>(`${this.baseUrl}/tenants/${tenantId}/patients/${id}`);
    }
    createPatient(tenantId: number, req: CreatePatientRequest): Observable<Patient> {
        return this.http.post<Patient>(`${this.baseUrl}/tenants/${tenantId}/patients`, req);
    }
    updatePatient(tenantId: number, id: number, req: UpdatePatientRequest): Observable<Patient> {
        return this.http.put<Patient>(`${this.baseUrl}/tenants/${tenantId}/patients/${id}`, req);
    }
    deletePatient(tenantId: number, id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/tenants/${tenantId}/patients/${id}`);
    }

    // ═══ Clinic Services ═══
    getClinicServices(tenantId: number): Observable<ClinicServiceItem[]> {
        return this.http.get<ClinicServiceItem[]>(`${this.baseUrl}/tenants/${tenantId}/services`);
    }
    getClinicServiceItem(tenantId: number, id: number): Observable<ClinicServiceItem> {
        return this.http.get<ClinicServiceItem>(`${this.baseUrl}/tenants/${tenantId}/services/${id}`);
    }
    createClinicService(tenantId: number, req: CreateClinicServiceRequest): Observable<ClinicServiceItem> {
        return this.http.post<ClinicServiceItem>(`${this.baseUrl}/tenants/${tenantId}/services`, req);
    }
    updateClinicService(tenantId: number, id: number, req: UpdateClinicServiceRequest): Observable<ClinicServiceItem> {
        return this.http.put<ClinicServiceItem>(`${this.baseUrl}/tenants/${tenantId}/services/${id}`, req);
    }
    deleteClinicService(tenantId: number, id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/tenants/${tenantId}/services/${id}`);
    }

    // ═══ Appointment ═══
    getAppointments(tenantId: number): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.baseUrl}/tenants/${tenantId}/appointments`);
    }
    getAppointmentsByDateRange(tenantId: number, from: string, to: string): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.baseUrl}/tenants/${tenantId}/appointments/by-date-range?from=${from}&to=${to}`);
    }
    getAppointmentsByPractitioner(tenantId: number, practitionerId: number, date?: string): Observable<Appointment[]> {
        let url = `${this.baseUrl}/tenants/${tenantId}/appointments/by-practitioner/${practitionerId}`;
        if (date) url += `?date=${date}`;
        return this.http.get<Appointment[]>(url);
    }
    getAppointmentsByPatient(tenantId: number, patientId: number): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.baseUrl}/tenants/${tenantId}/appointments/by-patient/${patientId}`);
    }
    getAppointment(tenantId: number, id: number): Observable<Appointment> {
        return this.http.get<Appointment>(`${this.baseUrl}/tenants/${tenantId}/appointments/${id}`);
    }
    createAppointment(tenantId: number, req: CreateAppointmentRequest): Observable<Appointment> {
        return this.http.post<Appointment>(`${this.baseUrl}/tenants/${tenantId}/appointments`, req);
    }
    updateAppointment(tenantId: number, id: number, req: UpdateAppointmentRequest): Observable<Appointment> {
        return this.http.put<Appointment>(`${this.baseUrl}/tenants/${tenantId}/appointments/${id}`, req);
    }
    deleteAppointment(tenantId: number, id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/tenants/${tenantId}/appointments/${id}`);
    }

    // ═══ Invoice ═══
    getInvoices(tenantId: number): Observable<Invoice[]> {
        return this.http.get<Invoice[]>(`${this.baseUrl}/tenants/${tenantId}/invoices`);
    }
    getInvoicesByPatient(tenantId: number, patientId: number): Observable<Invoice[]> {
        return this.http.get<Invoice[]>(`${this.baseUrl}/tenants/${tenantId}/invoices/by-patient/${patientId}`);
    }
    getInvoice(tenantId: number, id: number): Observable<Invoice> {
        return this.http.get<Invoice>(`${this.baseUrl}/tenants/${tenantId}/invoices/${id}`);
    }
    createInvoice(tenantId: number, req: CreateInvoiceRequest): Observable<Invoice> {
        return this.http.post<Invoice>(`${this.baseUrl}/tenants/${tenantId}/invoices`, req);
    }
    updateInvoice(tenantId: number, id: number, req: UpdateInvoiceRequest): Observable<Invoice> {
        return this.http.put<Invoice>(`${this.baseUrl}/tenants/${tenantId}/invoices/${id}`, req);
    }
    deleteInvoice(tenantId: number, id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/tenants/${tenantId}/invoices/${id}`);
    }
}
