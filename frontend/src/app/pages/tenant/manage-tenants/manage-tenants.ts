import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

import { TenantService } from '../tenant.service';
import { TenantResponse, UpdateTenantRequest } from '../tenant.model';

@Component({
    selector: 'app-manage-tenants',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule,
        InputTextModule, DialogModule, TagModule, IconFieldModule, InputIconModule,
        ToolbarModule, TooltipModule, CardModule, DividerModule
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <span class="font-semibold text-xl">Manage Tenants</span>
                </ng-template>
                <ng-template #end>
                    <button pButton label="Create Tenant" icon="pi pi-plus" severity="success"
                            (click)="navigateToCreate()"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="tenants" [paginator]="true" [rows]="10" [loading]="loading"
                     [showGridlines]="true" [rowHover]="true" responsiveLayout="scroll"
                     [globalFilterFields]="['name', 'subdomain', 'status']">
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center flex-wrap gap-2">
                        <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash"
                                (click)="clear(dt)"></button>
                        <p-iconfield iconPosition="left">
                            <p-inputicon><i class="pi pi-search"></i></p-inputicon>
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)"
                                   placeholder="Search tenants..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name">Name <p-sortIcon field="name"></p-sortIcon></th>
                        <th pSortableColumn="subdomain">Subdomain <p-sortIcon field="subdomain"></p-sortIcon></th>
                        <th pSortableColumn="status">Status <p-sortIcon field="status"></p-sortIcon></th>
                        <th>Products</th>
                        <th>Currency</th>
                        <th>Max Users</th>
                        <th style="min-width: 10rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-tenant>
                    <tr>
                        <td class="font-semibold">{{ tenant.name }}</td>
                        <td><code class="text-sm">{{ tenant.subdomain }}</code></td>
                        <td>
                            <p-tag [value]="tenant.status"
                                   [severity]="getStatusSeverity(tenant.status)"></p-tag>
                        </td>
                        <td>
                            <div class="flex gap-1 flex-wrap">
                                @for (product of tenant.products; track product) {
                                    <p-tag [value]="product" severity="info" styleClass="text-xs"></p-tag>
                                }
                                @if (!tenant.products || tenant.products.length === 0) {
                                    <span class="text-color-secondary text-sm">None</span>
                                }
                            </div>
                        </td>
                        <td>{{ tenant.settings?.currency || 'N/A' }}</td>
                        <td>{{ tenant.settings?.maxUsers || 'N/A' }}</td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-eye"
                                        class="p-button-rounded p-button-info p-button-sm"
                                        pTooltip="View Details" (click)="viewTenant(tenant)"></button>
                                <button pButton icon="pi pi-pencil"
                                        class="p-button-rounded p-button-success p-button-sm"
                                        pTooltip="Edit Tenant" (click)="editTenant(tenant)"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="7" class="text-center py-6">
                            <i class="pi pi-building text-4xl text-color-secondary"></i><br>
                            No tenants found.
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- View Tenant Dialog -->
        <p-dialog [(visible)]="viewDialogVisible" [header]="'Tenant Details — ' + (selectedTenant?.name || '')"
                  [modal]="true" [style]="{ width: '750px' }" [closable]="true">
            @if (selectedTenant) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Basic Info -->
                    <p-card header="Basic Information" styleClass="col-span-2">
                        <div class="grid grid-cols-2 gap-y-3 gap-x-6">
                            <div>
                                <label class="text-color-secondary text-sm block mb-1">Name</label>
                                <span class="font-semibold">{{ selectedTenant.name }}</span>
                            </div>
                            <div>
                                <label class="text-color-secondary text-sm block mb-1">Subdomain</label>
                                <code>{{ selectedTenant.subdomain }}</code>
                            </div>
                            <div>
                                <label class="text-color-secondary text-sm block mb-1">Status</label>
                                <p-tag [value]="selectedTenant.status"
                                       [severity]="getStatusSeverity(selectedTenant.status)"></p-tag>
                            </div>
                            <div>
                                <label class="text-color-secondary text-sm block mb-1">Products</label>
                                <div class="flex gap-1 flex-wrap">
                                    @for (product of selectedTenant.products; track product) {
                                        <p-tag [value]="product" severity="info"></p-tag>
                                    }
                                    @if (!selectedTenant.products || selectedTenant.products.length === 0) {
                                        <span class="text-color-secondary">None</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </p-card>

                    <!-- Settings -->
                    @if (selectedTenant.settings) {
                        <p-card header="Configuration" styleClass="col-span-2">
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                                <div>
                                    <label class="text-color-secondary text-sm block mb-1">Max Users</label>
                                    <span class="font-semibold">{{ selectedTenant.settings.maxUsers }}</span>
                                </div>
                                <div>
                                    <label class="text-color-secondary text-sm block mb-1">Max Bookings/Month</label>
                                    <span class="font-semibold">{{ selectedTenant.settings.maxBookingsPerMonth }}</span>
                                </div>
                                <div>
                                    <label class="text-color-secondary text-sm block mb-1">Currency</label>
                                    <span class="font-semibold">{{ selectedTenant.settings.currency }}</span>
                                </div>
                                <div>
                                    <label class="text-color-secondary text-sm block mb-1">Timezone</label>
                                    <span class="font-semibold">{{ selectedTenant.settings.timeZone }}</span>
                                </div>
                                <div>
                                    <label class="text-color-secondary text-sm block mb-1">Trial Account</label>
                                    <p-tag [value]="selectedTenant.settings.isTrialAccount ? 'Yes' : 'No'"
                                           [severity]="selectedTenant.settings.isTrialAccount ? 'warn' : 'secondary'"></p-tag>
                                </div>
                                @if (selectedTenant.settings.contractType) {
                                    <div>
                                        <label class="text-color-secondary text-sm block mb-1">Contract Type</label>
                                        <span class="font-semibold">{{ selectedTenant.settings.contractType }}</span>
                                    </div>
                                }
                                @if (selectedTenant.settings.monthlyFee != null) {
                                    <div>
                                        <label class="text-color-secondary text-sm block mb-1">Monthly Fee</label>
                                        <span class="font-semibold">{{ selectedTenant.settings.currency }} {{ selectedTenant.settings.monthlyFee }}</span>
                                    </div>
                                }
                                @if (selectedTenant.settings.paymentStatus) {
                                    <div>
                                        <label class="text-color-secondary text-sm block mb-1">Payment Status</label>
                                        <p-tag [value]="selectedTenant.settings.paymentStatus"
                                               [severity]="getPaymentSeverity(selectedTenant.settings.paymentStatus)"></p-tag>
                                    </div>
                                }
                                @if (selectedTenant.settings.billingEmail) {
                                    <div>
                                        <label class="text-color-secondary text-sm block mb-1">Billing Email</label>
                                        <span class="font-semibold">{{ selectedTenant.settings.billingEmail }}</span>
                                    </div>
                                }
                            </div>
                        </p-card>

                        <!-- Branding -->
                        @if (selectedTenant.settings.primaryColor || selectedTenant.settings.logoUrl) {
                            <p-card header="Branding" styleClass="col-span-2">
                                <div class="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                                    @if (selectedTenant.settings.primaryColor) {
                                        <div>
                                            <label class="text-color-secondary text-sm block mb-1">Primary Color</label>
                                            <div class="flex items-center gap-2">
                                                <span class="inline-block w-5 h-5 rounded border"
                                                      [style.background-color]="selectedTenant.settings.primaryColor"></span>
                                                <span>{{ selectedTenant.settings.primaryColor }}</span>
                                            </div>
                                        </div>
                                    }
                                    @if (selectedTenant.settings.secondaryColor) {
                                        <div>
                                            <label class="text-color-secondary text-sm block mb-1">Secondary Color</label>
                                            <div class="flex items-center gap-2">
                                                <span class="inline-block w-5 h-5 rounded border"
                                                      [style.background-color]="selectedTenant.settings.secondaryColor"></span>
                                                <span>{{ selectedTenant.settings.secondaryColor }}</span>
                                            </div>
                                        </div>
                                    }
                                    @if (selectedTenant.settings.logoUrl) {
                                        <div>
                                            <label class="text-color-secondary text-sm block mb-1">Logo</label>
                                            <img [src]="selectedTenant.settings.logoUrl" alt="Logo"
                                                 class="max-h-12 rounded" />
                                        </div>
                                    }
                                </div>
                            </p-card>
                        }
                    }
                </div>

                <ng-template pTemplate="footer">
                    <button pButton label="Close" icon="pi pi-times" class="p-button-text"
                            (click)="viewDialogVisible = false"></button>
                    <button pButton label="Edit" icon="pi pi-pencil" severity="success"
                            (click)="viewDialogVisible = false; editTenant(selectedTenant!)"></button>
                </ng-template>
            }
        </p-dialog>

        <!-- Edit Tenant Dialog -->
        <p-dialog [(visible)]="editDialogVisible" header="Edit Tenant" [modal]="true"
                  [style]="{ width: '550px' }">
            <div class="flex flex-col gap-4 pt-2">
                <div class="flex flex-col gap-2">
                    <label for="editName" class="font-semibold">Name *</label>
                    <input pInputText id="editName" [(ngModel)]="editForm.name"
                           placeholder="Tenant name" required />
                </div>

                <div class="flex flex-col gap-2">
                    <label for="editLogoUrl" class="font-semibold">Logo URL</label>
                    <input pInputText id="editLogoUrl" [(ngModel)]="editForm.logoUrl"
                           placeholder="https://..." />
                </div>

                <div class="flex flex-col gap-2">
                    <label for="editPhone" class="font-semibold">Contact Phone</label>
                    <input pInputText id="editPhone" [(ngModel)]="editForm.contactPhone"
                           placeholder="+1 234 567 890" />
                </div>
            </div>

            <ng-template pTemplate="footer">
                <button pButton label="Cancel" icon="pi pi-times" class="p-button-text"
                        (click)="editDialogVisible = false"></button>
                <button pButton label="Save" icon="pi pi-check" severity="success"
                        [loading]="saving" [disabled]="!editForm.name"
                        (click)="saveTenant()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class ManageTenantsComponent implements OnInit {
    tenants: TenantResponse[] = [];
    loading = false;
    saving = false;

    // View dialog
    viewDialogVisible = false;
    selectedTenant: TenantResponse | null = null;

    // Edit dialog
    editDialogVisible = false;
    editTenantId: number | null = null;
    editForm: UpdateTenantRequest = { name: '', logoUrl: '', contactPhone: '' };

    @ViewChild('dt') table!: Table;

    constructor(
        private tenantService: TenantService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadTenants();
    }

    loadTenants(): void {
        this.loading = true;
        this.tenantService.getAllTenants().subscribe({
            next: (data) => {
                this.tenants = data;
                this.loading = false;
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load tenants'
                });
                this.loading = false;
                console.error(err);
            }
        });
    }

    // --- View ---
    viewTenant(tenant: TenantResponse): void {
        this.selectedTenant = tenant;
        this.viewDialogVisible = true;
    }

    // --- Edit ---
    editTenant(tenant: TenantResponse): void {
        this.editTenantId = tenant.id;
        this.editForm = {
            name: tenant.name,
            logoUrl: (tenant as any).logoUrl || '',
            contactPhone: (tenant as any).contactPhone || ''
        };
        this.editDialogVisible = true;
    }

    saveTenant(): void {
        if (!this.editTenantId || !this.editForm.name) return;

        this.saving = true;
        this.tenantService.updateTenantById(this.editTenantId, this.editForm).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Tenant updated successfully'
                });
                this.editDialogVisible = false;
                this.saving = false;
                this.loadTenants();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update tenant'
                });
                this.saving = false;
                console.error(err);
            }
        });
    }

    // --- Navigation ---
    navigateToCreate(): void {
        this.router.navigate(['/pages/tenant/create']);
    }

    // --- Table helpers ---
    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table): void {
        table.clear();
    }

    getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'Active': return 'success';
            case 'Suspended': return 'warn';
            case 'Inactive': return 'danger';
            default: return 'info';
        }
    }

    getPaymentSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'Active': return 'success';
            case 'Pending': return 'warn';
            case 'Overdue': return 'danger';
            case 'Cancelled': return 'secondary';
            default: return 'info';
        }
    }
}
