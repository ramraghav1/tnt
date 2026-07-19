import { Routes } from '@angular/router';

export const tenantRoutes: Routes = [
    {
        path: 'manage',
        loadComponent: () => import('./manage-tenants/manage-tenants').then(m => m.ManageTenantsComponent),
        data: { breadcrumb: 'Manage Tenants' }
    },
    {
        path: 'settings',
        loadComponent: () => import('./tenant-settings/tenant-settings').then(m => m.TenantSettingsComponent),
        data: { breadcrumb: 'Settings' }
    },
    {
        path: 'products',
        loadComponent: () => import('./product-subscriptions/product-subscriptions').then(m => m.ProductSubscriptionsComponent),
        data: { breadcrumb: 'Products' }
    },
    {
        path: 'create',
        loadComponent: () => import('./create-tenant/create-tenant').then(m => m.CreateTenantComponent),
        data: { breadcrumb: 'Create Tenant' }
    },
    {
        path: '',
        redirectTo: 'manage',
        pathMatch: 'full'
    }
];
