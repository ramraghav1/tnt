import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { environment } from '../../../../environments/environment';

interface OrganizationItem {
    organizationId: number;
    organizationName: string;
    organizationType: string;
    countryIso3: string;
    status: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
}

@Component({
    selector: 'app-organization-setup',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, InputTextModule,
        SelectModule, PasswordModule, DividerModule, Toast,
        TableModule, TagModule
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="grid grid-cols-12 gap-8">
            <!-- Setup Form -->
            <div class="col-span-12 lg:col-span-5">
                <div class="card">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                            <i class="pi pi-building text-white text-xl"></i>
                        </div>
                        <div>
                            <div class="text-xl font-semibold text-surface-900 dark:text-surface-0">Setup Organization</div>
                            <div class="text-surface-500 text-sm">Create a new client with manager account</div>
                        </div>
                    </div>

                    <!-- Organization Details -->
                    <div class="flex items-center gap-2 mb-4">
                        <i class="pi pi-building text-primary"></i>
                        <span class="font-semibold text-surface-700 dark:text-surface-200">Organization Details</span>
                    </div>

                    <div class="grid grid-cols-12 gap-4 mb-6">
                        <div class="col-span-12">
                            <label class="block text-sm font-medium mb-1">Organization Name *</label>
                            <input pInputText class="w-full" [(ngModel)]="form.organizationName" placeholder="e.g. ABC Remittance Pvt. Ltd." />
                            <small *ngIf="submitted && !form.organizationName" class="text-red-500">Required</small>
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block text-sm font-medium mb-1">Organization Type *</label>
                            <p-select [options]="orgTypes" [(ngModel)]="form.organizationType" optionLabel="label" optionValue="value" placeholder="Select type" class="w-full" [style]="{'width': '100%'}" />
                            <small *ngIf="submitted && !form.organizationType" class="text-red-500">Required</small>
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block text-sm font-medium mb-1">Country (ISO3) *</label>
                            <input pInputText class="w-full" [(ngModel)]="form.countryIso3" placeholder="e.g. NPL" maxlength="3" />
                            <small *ngIf="submitted && !form.countryIso3" class="text-red-500">Required</small>
                        </div>
                        <div class="col-span-12 md:col-span-4">
                            <label class="block text-sm font-medium mb-1">Contact Person</label>
                            <input pInputText class="w-full" [(ngModel)]="form.contactPerson" placeholder="Full name" />
                        </div>
                        <div class="col-span-12 md:col-span-4">
                            <label class="block text-sm font-medium mb-1">Contact Email</label>
                            <input pInputText class="w-full" [(ngModel)]="form.contactEmail" placeholder="org@example.com" />
                        </div>
                        <div class="col-span-12 md:col-span-4">
                            <label class="block text-sm font-medium mb-1">Contact Phone</label>
                            <input pInputText class="w-full" [(ngModel)]="form.contactPhone" placeholder="+977-..." />
                        </div>
                    </div>

                    <p-divider />

                    <!-- Manager Account -->
                    <div class="flex items-center gap-2 mb-4 mt-4">
                        <i class="pi pi-user text-primary"></i>
                        <span class="font-semibold text-surface-700 dark:text-surface-200">Manager Account</span>
                    </div>

                    <div class="grid grid-cols-12 gap-4 mb-6">
                        <div class="col-span-12 md:col-span-6">
                            <label class="block text-sm font-medium mb-1">Full Name *</label>
                            <input pInputText class="w-full" [(ngModel)]="form.managerFullName" placeholder="Manager full name" />
                            <small *ngIf="submitted && !form.managerFullName" class="text-red-500">Required</small>
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block text-sm font-medium mb-1">Email (Login Username) *</label>
                            <input pInputText class="w-full" [(ngModel)]="form.managerEmail" placeholder="manager@example.com" />
                            <small *ngIf="submitted && !form.managerEmail" class="text-red-500">Required</small>
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block text-sm font-medium mb-1">Password *</label>
                            <p-password [(ngModel)]="form.managerPassword" placeholder="Min 6 characters" [toggleMask]="true" [feedback]="false" [fluid]="true" />
                            <small *ngIf="submitted && !form.managerPassword" class="text-red-500">Required</small>
                            <small *ngIf="submitted && form.managerPassword && form.managerPassword.length < 6" class="text-red-500">Min 6 characters</small>
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block text-sm font-medium mb-1">Phone</label>
                            <input pInputText class="w-full" [(ngModel)]="form.managerPhone" placeholder="+977-..." />
                        </div>
                        <div class="col-span-12">
                            <label class="block text-sm font-medium mb-1">Address</label>
                            <input pInputText class="w-full" [(ngModel)]="form.managerAddress" placeholder="Manager address" />
                        </div>
                    </div>

                    <div class="flex justify-end gap-3">
                        <p-button label="Reset" icon="pi pi-refresh" severity="secondary" [outlined]="true" (click)="resetForm()" />
                        <p-button label="Create Organization" icon="pi pi-check" [loading]="saving" (click)="onSubmit()" />
                    </div>
                </div>
            </div>

            <!-- Organization List -->
            <div class="col-span-12 lg:col-span-7">
                <div class="card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="text-xl font-semibold text-surface-900 dark:text-surface-0">Organizations</div>
                        <p-button icon="pi pi-refresh" [rounded]="true" [text]="true" (click)="loadOrganizations()" />
                    </div>

                    <p-table [value]="organizations" [paginator]="true" [rows]="8" [loading]="loadingList"
                             [globalFilterFields]="['organizationName', 'organizationType', 'contactEmail']"
                             responsiveLayout="scroll" [rowHover]="true">
                        <ng-template pTemplate="header">
                            <tr>
                                <th pSortableColumn="organizationName">Name <p-sortIcon field="organizationName" /></th>
                                <th pSortableColumn="organizationType">Type <p-sortIcon field="organizationType" /></th>
                                <th>Country</th>
                                <th>Contact</th>
                                <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-org>
                            <tr>
                                <td class="font-medium">{{ org.organizationName }}</td>
                                <td>
                                    <p-tag [value]="org.organizationType"
                                           [severity]="getTypeSeverity(org.organizationType)" />
                                </td>
                                <td>{{ org.countryIso3 }}</td>
                                <td>
                                    <div class="text-sm">{{ org.contactPerson }}</div>
                                    <div class="text-xs text-surface-500">{{ org.contactEmail }}</div>
                                </td>
                                <td>
                                    <p-tag [value]="org.status"
                                           [severity]="org.status === 'ACTIVE' ? 'success' : 'danger'" />
                                </td>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="emptymessage">
                            <tr>
                                <td colspan="5" class="text-center text-surface-500 py-8">
                                    <i class="pi pi-building text-4xl mb-3 block"></i>
                                    No organizations yet. Create one to get started.
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>
        </div>
    `
})
export class OrganizationSetup {
    form = {
        organizationName: '',
        organizationType: '',
        countryIso3: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        managerFullName: '',
        managerEmail: '',
        managerPassword: '',
        managerPhone: '',
        managerAddress: ''
    };

    orgTypes = [
        { label: 'Tour & Travels', value: 'TourAndTravels' },
        { label: 'Remittance', value: 'Remittance' },
        { label: 'Clinic', value: 'Clinic' }
    ];

    submitted = false;
    saving = false;
    loadingList = false;
    organizations: OrganizationItem[] = [];

    constructor(
        private http: HttpClient,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadOrganizations();
    }

    loadOrganizations() {
        this.loadingList = true;
        this.http.get<OrganizationItem[]>(`${environment.apiBaseUrl}/Organization/list`, {
            params: { fromDate: '2020-01-01', toDate: '2030-01-01' }
        }).subscribe({
            next: (data) => {
                this.organizations = data;
                this.loadingList = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.organizations = [];
                this.loadingList = false;
                this.cdr.detectChanges();
            }
        });
    }

    onSubmit() {
        this.submitted = true;
        this.cdr.detectChanges();

        if (!this.form.organizationName || !this.form.organizationType ||
            !this.form.countryIso3 || !this.form.managerFullName ||
            !this.form.managerEmail || !this.form.managerPassword ||
            this.form.managerPassword.length < 6) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please fill all required fields' });
            return;
        }

        this.saving = true;
        this.http.post<any>(`${environment.apiBaseUrl}/Organization/setup`, this.form).subscribe({
            next: (res) => {
                this.saving = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Organization Created',
                    detail: `${res.organizationName} created with manager ${res.managerEmail}`
                });
                this.resetForm();
                this.loadOrganizations();
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err?.error?.message || 'Failed to create organization'
                });
                this.cdr.detectChanges();
            }
        });
    }

    resetForm() {
        this.form = {
            organizationName: '',
            organizationType: '',
            countryIso3: '',
            contactPerson: '',
            contactEmail: '',
            contactPhone: '',
            managerFullName: '',
            managerEmail: '',
            managerPassword: '',
            managerPhone: '',
            managerAddress: ''
        };
        this.submitted = false;
        this.cdr.detectChanges();
    }

    getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (type?.toLowerCase()) {
            case 'tourandtravels': return 'info';
            case 'remittance': return 'success';
            case 'clinic': return 'warn';
            default: return 'secondary';
        }
    }
}
