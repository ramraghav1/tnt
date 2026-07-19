export interface Tenant {
    id: number;
    name: string;
    subdomain: string;
    logoUrl?: string;
    contactEmail: string;
    contactPhone?: string;
    status: 'Active' | 'Suspended' | 'Inactive';
    settings: TenantSettings;
    products: string[];
    createdAt: Date;
    updatedAt?: Date;
}

export interface TenantSettings {
    maxUsers: number;
    maxBookingsPerMonth: number;
    isTrialAccount: boolean;
    trialExpiresAt?: Date;
    customDomain?: string;
    timeZone: string;
    currency: string;
    
    // Branding/Theme
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    
    // Database Configuration
    databaseType?: string; // 'Shared' | 'Dedicated'
    databaseConnectionString?: string;
    databaseName?: string;
    
    // Contract/Subscription
    contractStartDate?: Date;
    contractEndDate?: Date;
    contractType?: string; // 'Monthly' | 'Yearly' | 'Custom'
    monthlyFee?: number;
    billingEmail?: string;
    paymentStatus?: string; // 'Active' | 'Pending' | 'Overdue' | 'Cancelled'
}

export interface CreateTenantRequest {
    name: string;
    subdomain: string;
    contactEmail: string;
    contactPhone?: string;
    productIds: number[];
    settings?: Partial<TenantSettings>;
    // Manager Account
    managerFullName?: string;
    managerEmail?: string;
    managerPassword?: string;
    managerPhone?: string;
    managerAddress?: string;
}

export interface UpdateTenantRequest {
    name: string;
    logoUrl?: string;
    contactPhone?: string;
}

export interface TenantResponse {
    id: number;
    name: string;
    subdomain: string;
    status: string;
    settings: TenantSettings;
    products: string[];
}

export interface Product {
    id: number;
    name: string;
    displayName: string;
    description?: string;
    isActive: boolean;
}

export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
    maxUsers: 10,
    maxBookingsPerMonth: 100,
    isTrialAccount: false,
    timeZone: 'UTC',
    currency: 'USD'
};
