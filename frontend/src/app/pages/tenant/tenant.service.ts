import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    Tenant,
    TenantResponse,
    CreateTenantRequest,
    UpdateTenantRequest,
    Product
} from './tenant.model';

@Injectable({
    providedIn: 'root'
})
export class TenantService {
    private baseUrl = `${environment.apiBaseUrl}/multitenancy`;

    constructor(private http: HttpClient) { }

    /**
     * ADMIN: Get all tenants
     */
    getAllTenants(): Observable<TenantResponse[]> {
        return this.http.get<TenantResponse[]>(`${this.baseUrl}/all`);
    }

    /**
     * ADMIN: Get tenant by ID
     */
    getTenantById(id: number): Observable<TenantResponse> {
        return this.http.get<TenantResponse>(`${this.baseUrl}/${id}`);
    }

    /**
     * ADMIN: Update tenant by ID
     */
    updateTenantById(id: number, request: UpdateTenantRequest): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.baseUrl}/${id}`, request);
    }

    /**
     * Get current user's tenant information
     */
    getCurrentTenant(): Observable<TenantResponse> {
        return this.http.get<TenantResponse>(`${this.baseUrl}/current`);
    }

    /**
     * Update current tenant information
     */
    updateCurrentTenant(request: UpdateTenantRequest): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.baseUrl}/current`, request);
    }

    /**
     * Get current tenant's subscribed products
     */
    getCurrentTenantProducts(): Observable<{ products: string[] }> {
        return this.http.get<{ products: string[] }>(`${this.baseUrl}/current/products`);
    }

    /**
     * ADMIN ONLY: Get tenant by subdomain
     */
    getTenantBySubdomain(subdomain: string): Observable<Tenant> {
        return this.http.get<Tenant>(`${this.baseUrl}/by-subdomain/${subdomain}`);
    }

    /**
     * ADMIN ONLY: Create new tenant
     */
    createTenant(request: CreateTenantRequest): Observable<{ tenantId: number; message: string }> {
        return this.http.post<{ tenantId: number; message: string }>(`${this.baseUrl}`, request);
    }

    /**
     * Get available products for tenant subscription
     */
    getAvailableProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${environment.apiBaseUrl}/products`);
    }

    /**
     * ADMIN ONLY: Activate product for tenant
     */
    activateProduct(tenantId: number, productId: number, subscriptionTier?: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            `${this.baseUrl}/${tenantId}/products/${productId}/activate`,
            { subscriptionTier }
        );
    }

    /**
     * ADMIN ONLY: Deactivate product for tenant
     */
    deactivateProduct(tenantId: number, productId: number): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            `${this.baseUrl}/${tenantId}/products/${productId}/deactivate`,
            {}
        );
    }

    /**
     * Update tenant settings (timezone, currency, limits, etc.)
     */
    updateTenantSettings(settings: any): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.baseUrl}/current/settings`, settings);
    }

    /**
     * Check if subdomain is available
     */
    checkSubdomainAvailability(subdomain: string): Observable<{ available: boolean }> {
        return this.http.get<{ available: boolean }>(
            `${this.baseUrl}/check-subdomain/${subdomain}`
        );
    }

    /**
     * Upload tenant logo
     */
    uploadLogo(file: File): Observable<{ logoUrl: string }> {
        const formData = new FormData();
        formData.append('logo', file);
        return this.http.post<{ logoUrl: string }>(`${this.baseUrl}/current/logo`, formData);
    }
}
