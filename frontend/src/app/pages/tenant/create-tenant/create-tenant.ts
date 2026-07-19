import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FluidModule } from 'primeng/fluid';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabsModule } from 'primeng/tabs';
import { FileUploadModule } from 'primeng/fileupload';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePicker } from 'primeng/datepicker';
import { ColorPicker } from 'primeng/colorpicker';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';

import { TenantService } from '../tenant.service';
import { CreateTenantRequest, Product } from '../tenant.model';

@Component({
    selector: 'app-create-tenant',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        FluidModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        Select,
        CheckboxModule,
        ToastModule,
        ProgressSpinnerModule,
        TabsModule,
        FileUploadModule,
        MultiSelectModule,
        DatePicker,
        ColorPicker,
        PasswordModule,
        DividerModule
    ],
    providers: [MessageService],
    templateUrl: './create-tenant.html',
    styleUrls: ['./create-tenant.scss']
})
export class CreateTenantComponent implements OnInit {
    loading = false;
    saving = false;
    
    // Basic Information
    tenantName = '';
    subdomain = '';
    contactEmail = '';
    contactPhone = '';
    
    // Settings
    maxUsers = 10;
    maxBookingsPerMonth = 100;
    isTrialAccount = false;
    trialExpiresAt: Date | null = null;
    timeZone = 'UTC';
    currency = 'USD';
    
    // Branding
    primaryColor = '#3B82F6';
    secondaryColor = '#10B981';
    accentColor = '#F59E0B';
    logoUrl = '';
    faviconUrl = '';
    
    // Database Configuration
    databaseType = 'Shared';
    databaseConnectionString = '';
    databaseName = '';
    
    // Contract Information
    contractStartDate: Date | null = null;
    contractEndDate: Date | null = null;
    contractType = 'Monthly';
    monthlyFee: number | null = null;
    billingEmail = '';
    paymentStatus = 'Active';
    
    // Products
    availableProducts: { id: number; name: string; value: number }[] = [];
    selectedProducts: number[] = [];
    
    // Manager Account
    managerFullName = '';
    managerEmail = '';
    managerPassword = '';
    managerPhone = '';
    managerAddress = '';
    
    // Dropdown options
    timezones = [
        { label: 'UTC', value: 'UTC' },
        { label: 'Asia/Kathmandu', value: 'Asia/Kathmandu' },
        { label: 'America/New_York', value: 'America/New_York' },
        { label: 'Europe/London', value: 'Europe/London' },
        { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
        { label: 'Australia/Sydney', value: 'Australia/Sydney' }
    ];
    
    currencies = [
        { label: 'USD ($)', value: 'USD' },
        { label: 'NPR (रू)', value: 'NPR' },
        { label: 'EUR (€)', value: 'EUR' },
        { label: 'GBP (£)', value: 'GBP' },
        { label: 'INR (₹)', value: 'INR' }
    ];
    
    databaseTypes = [
        { label: 'Shared Database', value: 'Shared' },
        { label: 'Dedicated Database', value: 'Dedicated' }
    ];
    
    contractTypes = [
        { label: 'Monthly', value: 'Monthly' },
        { label: 'Yearly', value: 'Yearly' },
        { label: 'Custom', value: 'Custom' }
    ];
    
    paymentStatuses = [
        { label: 'Active', value: 'Active' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Overdue', value: 'Overdue' },
        { label: 'Cancelled', value: 'Cancelled' }
    ];

    constructor(
        private tenantService: TenantService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadAvailableProducts();
    }

    loadAvailableProducts(): void {
        this.loading = true;
        this.tenantService.getAvailableProducts().subscribe({
            next: (products) => {
                this.availableProducts = products.map(p => ({
                    id: p.id,
                    name: p.displayName,
                    value: p.id
                }));
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load products:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load available products'
                });
                this.loading = false;
            }
        });
    }

    checkSubdomainAvailability(): void {
        if (!this.subdomain || this.subdomain.length < 3) return;
        
        this.tenantService.checkSubdomainAvailability(this.subdomain).subscribe({
            next: (response: any) => {
                if (!response.available) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Subdomain Taken',
                        detail: 'This subdomain is already in use'
                    });
                }
            },
            error: () => {
                // Subdomain is available
            }
        });
    }

    createTenant(): void {
        if (!this.validateForm()) return;

        this.saving = true;
        
        const request: CreateTenantRequest = {
            name: this.tenantName,
            subdomain: this.subdomain,
            contactEmail: this.contactEmail,
            contactPhone: this.contactPhone || undefined,
            productIds: this.selectedProducts,
            managerFullName: this.managerFullName,
            managerEmail: this.managerEmail,
            managerPassword: this.managerPassword,
            managerPhone: this.managerPhone || undefined,
            managerAddress: this.managerAddress || undefined,
            settings: {
                maxUsers: this.maxUsers,
                maxBookingsPerMonth: this.maxBookingsPerMonth,
                isTrialAccount: this.isTrialAccount,
                trialExpiresAt: this.trialExpiresAt || undefined,
                timeZone: this.timeZone,
                currency: this.currency,
                primaryColor: this.primaryColor,
                secondaryColor: this.secondaryColor,
                accentColor: this.accentColor,
                logoUrl: this.logoUrl || undefined,
                faviconUrl: this.faviconUrl || undefined,
                databaseType: this.databaseType,
                databaseConnectionString: this.databaseConnectionString || undefined,
                databaseName: this.databaseName || undefined,
                contractStartDate: this.contractStartDate || undefined,
                contractEndDate: this.contractEndDate || undefined,
                contractType: this.contractType,
                monthlyFee: this.monthlyFee || undefined,
                billingEmail: this.billingEmail || undefined,
                paymentStatus: this.paymentStatus
            }
        };

        this.tenantService.createTenant(request).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Tenant "${this.tenantName}" created successfully`
                });
                this.saving = false;
                
                // Navigate to tenant list or settings
                setTimeout(() => {
                    this.router.navigate(['/pages/tenant/settings']);
                }, 1500);
            },
            error: (err) => {
                console.error('Failed to create tenant:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.message || 'Failed to create tenant'
                });
                this.saving = false;
            }
        });
    }

    validateForm(): boolean {
        if (!this.tenantName || this.tenantName.trim().length < 2) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Tenant name is required (minimum 2 characters)'
            });
            return false;
        }

        if (!this.subdomain || this.subdomain.trim().length < 3) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Subdomain is required (minimum 3 characters)'
            });
            return false;
        }

        if (!this.contactEmail || !this.isValidEmail(this.contactEmail)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Valid contact email is required'
            });
            return false;
        }

        if (this.selectedProducts.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Please select at least one product/module'
            });
            return false;
        }

        // Manager account validation
        if (!this.managerFullName || this.managerFullName.trim().length < 2) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Manager full name is required (minimum 2 characters)'
            });
            return false;
        }

        if (!this.managerEmail || !this.isValidEmail(this.managerEmail)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Valid manager email is required'
            });
            return false;
        }

        if (!this.managerPassword || this.managerPassword.length < 6) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Manager password is required (minimum 6 characters)'
            });
            return false;
        }

        return true;
    }

    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    cancel(): void {
        this.router.navigate(['/pages/tenant/settings']);
    }

    previewTheme(): void {
        // Preview the selected colors
        document.documentElement.style.setProperty('--primary-color', this.primaryColor);
        document.documentElement.style.setProperty('--surface-ground', this.secondaryColor);
    }

    resetTheme(): void {
        // Reset to default theme
        this.primaryColor = '#3B82F6';
        this.secondaryColor = '#10B981';
        this.accentColor = '#F59E0B';
    }
}
