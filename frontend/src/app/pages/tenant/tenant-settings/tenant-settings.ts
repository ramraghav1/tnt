import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { FluidModule } from 'primeng/fluid';

import { TenantService } from '../tenant.service';
import { TenantResponse, UpdateTenantRequest } from '../tenant.model';

@Component({
    selector: 'app-tenant-settings',
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
        TagModule,
        DividerModule,
        FileUploadModule
    ],
    providers: [MessageService],
    templateUrl: './tenant-settings.html',
    styleUrls: ['./tenant-settings.scss']
})
export class TenantSettingsComponent implements OnInit {
    tenant: TenantResponse | null = null;
    loading = false;
    saving = false;

    // Form data
    name: string = '';
    logoUrl: string = '';
    contactPhone: string = '';

    // Settings
    maxUsers: number = 10;
    maxBookingsPerMonth: number = 100;
    timeZone: string = 'UTC';
    currency: string = 'USD';

    timezones = [
        { label: 'UTC', value: 'UTC' },
        { label: 'Asia/Kathmandu', value: 'Asia/Kathmandu' },
        { label: 'America/New_York', value: 'America/New_York' },
        { label: 'Europe/London', value: 'Europe/London' },
        { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
        { label: 'Australia/Sydney', value: 'Australia/Sydney' }
    ];

    currencies = [
        { label: 'USD - US Dollar', value: 'USD' },
        { label: 'NPR - Nepali Rupee', value: 'NPR' },
        { label: 'EUR - Euro', value: 'EUR' },
        { label: 'GBP - British Pound', value: 'GBP' },
        { label: 'INR - Indian Rupee', value: 'INR' }
    ];

    constructor(
        private tenantService: TenantService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadTenant();
    }

    loadTenant(): void {
        this.loading = true;
        this.tenantService.getCurrentTenant().subscribe({
            next: (data) => {
                this.tenant = data;
                this.populateForm(data);
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load tenant information'
                });
                this.loading = false;
            }
        });
    }

    populateForm(data: TenantResponse): void {
        this.name = data.name;
        this.logoUrl = data.settings.customDomain || '';
        this.maxUsers = data.settings.maxUsers;
        this.maxBookingsPerMonth = data.settings.maxBookingsPerMonth;
        this.timeZone = data.settings.timeZone;
        this.currency = data.settings.currency;
    }

    saveTenantInfo(): void {
        this.saving = true;
        const request: UpdateTenantRequest = {
            name: this.name,
            logoUrl: this.logoUrl || undefined,
            contactPhone: this.contactPhone || undefined
        };

        this.tenantService.updateCurrentTenant(request).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message
                });
                this.saving = false;
                this.loadTenant(); // Reload to get updated data
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update tenant information'
                });
                this.saving = false;
            }
        });
    }

    saveSettings(): void {
        this.saving = true;
        const settings = {
            maxUsers: this.maxUsers,
            maxBookingsPerMonth: this.maxBookingsPerMonth,
            timeZone: this.timeZone,
            currency: this.currency
        };

        this.tenantService.updateTenantSettings(settings).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Settings updated successfully'
                });
                this.saving = false;
                this.loadTenant();
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update settings'
                });
                this.saving = false;
            }
        });
    }

    onLogoUpload(event: any): void {
        // Handle file selection from p-fileUpload onSelect event
        const file = event.currentFiles ? event.currentFiles[0] : (event.files ? event.files[0] : null);
        
        if (!file) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'No file selected'
            });
            return;
        }

        // Upload the file
        this.tenantService.uploadLogo(file).subscribe({
            next: (response) => {
                this.logoUrl = response.logoUrl || '';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Logo uploaded successfully'
                });
                // Optionally reload tenant data to see updated logo
                this.loadTenant();
            },
            error: (err) => {
                console.error('Logo upload error:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.message || 'Failed to upload logo'
                });
            }
        });
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Suspended':
                return 'warn';
            case 'Inactive':
                return 'danger';
            default:
                return 'warn';
        }
    }
}
