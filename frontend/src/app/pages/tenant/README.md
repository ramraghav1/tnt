# Tenant Management Module

This module provides frontend tenant management capabilities for the multi-tenant SaaS application.

## Overview

The Tenant Management module allows users to:
- View and edit their tenant information
- Manage tenant settings (user limits, timezone, currency)
- View subscribed products
- Upload tenant logos

## File Structure

```
src/app/pages/tenant/
├── tenant.model.ts                    # TypeScript interfaces
├── tenant.service.ts                  # HTTP service for API calls
├── tenant.routes.ts                   # Routing configuration
├── tenant-settings/                   # Tenant settings component
│   ├── tenant-settings.ts    
│   ├── tenant-settings.html
│   └── tenant-settings.scss
└── product-subscriptions/             # Product subscription component
    ├── product-subscriptions.ts
    ├── product-subscriptions.html
    └── product-subscriptions.scss
```

## Components

### 1. Tenant Settings Component
**Route:** `/pages/tenant/settings`

**Features:**
- Display current tenant information (name, subdomain, status, products)
- Edit tenant details (name, contact phone, logo URL)
- Upload tenant logo
- Configure tenant settings:
  - Max Users
  - Max Bookings Per Month
  - Timezone
  - Currency
- Trial account warning banner

**Dependencies:**
- PrimeNG: Card, Button, InputText, InputNumber, Select, FileUpload, Toast, ProgressSpinner, Tag
- Services: TenantService, MessageService
- Translations: tenant.* keys

### 2. Product Subscriptions Component
**Route:** `/pages/tenant/products`

**Features:**
- Display all subscribed products with details
- Show available products (not subscribed)
- Visual distinction between subscribed and available products
- Product information cards with icons and descriptions

**Available Products:**
- **Tour & Travel Management**: Complete booking system with itinerary management
- **Clinic Management**: Healthcare appointments and patient records
- **Remittance Services**: Money transfer with multi-currency support

**Dependencies:**
- PrimeNG: Card, Button, Toast, ProgressSpinner, Tag, DataView
- Services: TenantService, MessageService

## Services

### TenantService

**Location:** `src/app/pages/tenant/tenant.service.ts`

**Base URL:** `/api/multitenancy`

**Methods:**

#### Current Tenant Operations
- `getCurrentTenant()` - Get current tenant information
- `updateCurrentTenant(request)` - Update current tenant basic info
- `getCurrentTenantProducts()` - Get products for current tenant
- `updateTenantSettings(settings)` - Update current tenant settings
- `uploadLogo(file)` - Upload logo for current tenant

#### Admin Operations (require admin role)
- `getTenantBySubdomain(subdomain)` - Get specific tenant by subdomain
- `createTenant(request)` - Create new tenant
- `getAvailableProducts()` - Get all available products
- `activateProduct(productName)` - Activate product for tenant
- `deactivateProduct(productName)` - Deactivate product for tenant
- `checkSubdomainAvailability(subdomain)` - Check if subdomain is available

## Models

### Tenant
```typescript
interface Tenant {
    id: number;
    name: string;
    subdomain: string;
    status: 'Active' | 'Trial' | 'Suspended' | 'Inactive';
    contactEmail: string;
    contactPhone?: string;
    logoUrl?: string;
    createdAt: Date;
    settings: TenantSettings;
}
```

### TenantSettings
```typescript
interface TenantSettings {
    maxUsers: number;
    maxBookingsPerMonth: number;
    timeZone: string;
    currency: string;
    isTrialAccount: boolean;
    trialExpiresAt?: Date;
    customDomain?: string;
}
```

### Product
```typescript
interface Product {
    name: string;
    displayName: string;
    description: string;
    isActive: boolean;
}
```

## Routing

The tenant routes are configured in `tenant.routes.ts` and integrated into the main pages router:

```typescript
{
    path: 'tenant',
    children: tenantRoutes,
    data: { breadcrumb: 'Tenant Management' }
}
```

**Available Routes:**
- `/pages/tenant/settings` - Tenant settings page (default)
- `/pages/tenant/products` - Product subscriptions page

## Translations

All text content uses the ngx-translate library with the `tenant.*` translation keys.

**English (en.json)** and **Nepali (np.json)** translations are provided for:
- Form labels and placeholders
- Button text
- Status labels
- Error and success messages
- Product descriptions

**Key namespaces:**
- `tenant.settings` - Settings page labels
- `tenant.products` - Product page labels
- `tenant.messages` - Success/error messages

## Styling

Components use PrimeNG theming with custom SCSS:
- Full-width form controls
- Responsive grid layouts (12/6/4 columns)
- Hover effects on product cards
- Status-based color coding (success/warn/danger)
- Visual distinction for subscribed/available products

## Security

- TenantId is extracted from JWT token on backend only
- Frontend never manually sets TenantId
- Admin operations require appropriate role claims in JWT
- All API calls are authenticated via HTTP interceptor

## Backend Integration

This module communicates with the following backend endpoints:

### Multi-Tenancy Controller (`/api/multitenancy`)

**GET** `/current` - Get current tenant  
**PUT** `/current` - Update current tenant  
**GET** `/current/products` - Get current tenant products  
**PUT** `/current/settings` - Update current tenant settings  
**POST** `/current/logo` - Upload tenant logo  

**Admin Endpoints:**  
**GET** `/{subdomain}` - Get tenant by subdomain  
**POST** `/create` - Create new tenant  
**GET** `/products` - Get available products  
**POST** `/{subdomain}/products/{productName}/activate` - Activate product  
**DELETE** `/{subdomain}/products/{productName}/deactivate` - Deactivate product  
**GET** `/check-subdomain/{subdomain}` - Check subdomain availability

## Usage Example

### Navigating to Tenant Settings
```typescript
import { Router } from '@angular/router';

constructor(private router: Router) {}

goToSettings() {
    this.router.navigate(['/pages/tenant/settings']);
}
```

### Using Tenant Service
```typescript
import { TenantService } from './tenant/tenant.service';

constructor(private tenantService: TenantService) {}

ngOnInit() {
    this.tenantService.getCurrentTenant().subscribe(response => {
        console.log('Current tenant:', response.tenant);
    });
}
```

## Future Enhancements

Potential features for future development:
- Admin tenant creation form
- Bulk user management
- Usage analytics dashboard
- Billing and subscription management
- Custom domain configuration
- Tenant-level feature flags
- Audit logs and activity history

## Development Guidelines

When extending this module:

1. **Add new API methods** to TenantService
2. **Create corresponding interfaces** in tenant.model.ts
3. **Update translations** in both en.json and np.json
4. **Follow PrimeNG patterns** for UI components
5. **Maintain responsive design** using PrimeNG grid
6. **Add error handling** with MessageService toasts
7. **Use standalone components** (Angular 14+ best practice)
8. **Keep tenant ID handling on backend** - never expose in frontend

## Support

For issues or questions regarding the tenant module:
- Check backend logs for API errors
- Verify JWT token contains TenantId claim
- Ensure user has appropriate permissions for admin operations
- Confirm translations are loaded correctly
