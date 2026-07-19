import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InventoryRedesignService, VehicleRoute, CreateVehicleRouteRequest, Location } from '../inventory-redesign.service';

@Component({
    selector: 'app-vehicle-route-management',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        TagModule, DialogModule, InputNumberModule, TextareaModule, ToolbarModule,
        ConfirmDialogModule, IconFieldModule, InputIconModule, TooltipModule, SelectModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />

        <div class="card">
            <p-toolbar styleClass="mb-6 gap-2">
                <ng-template #start>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-directions text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Vehicle Routes</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Route" icon="pi pi-plus" class="mr-2" (click)="openNew()"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="routes" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5,10,25,50]"
                     [globalFilterFields]="['vehicleType','locationFromName','locationToName']"
                     dataKey="id" [loading]="loading" responsiveLayout="scroll" [showCurrentPageReport]="true"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords} routes">
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" #filterInput (input)="dt.filterGlobal(filterInput.value, 'contains')" placeholder="Search routes..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="vehicleType" style="min-width:8rem">Vehicle Type <p-sortIcon field="vehicleType" /></th>
                        <th pSortableColumn="locationFromName" style="min-width:10rem">From <p-sortIcon field="locationFromName" /></th>
                        <th pSortableColumn="locationToName" style="min-width:10rem">To <p-sortIcon field="locationToName" /></th>
                        <th pSortableColumn="distanceKm" style="min-width:7rem">Distance <p-sortIcon field="distanceKm" /></th>
                        <th pSortableColumn="durationHours" style="min-width:7rem">Duration <p-sortIcon field="durationHours" /></th>
                        <th pSortableColumn="basePrice" style="min-width:8rem">Price <p-sortIcon field="basePrice" /></th>
                        <th pSortableColumn="capacity" style="min-width:6rem">Seats <p-sortIcon field="capacity" /></th>
                        <th style="min-width:6rem">Status</th>
                        <th style="min-width:10rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-route>
                    <tr>
                        <td><p-tag [value]="route.vehicleType" severity="info" /></td>
                        <td><span class="font-semibold">{{ route.locationFromName || '—' }}</span></td>
                        <td><span class="font-semibold">{{ route.locationToName || '—' }}</span></td>
                        <td>{{ route.distanceKm ? (route.distanceKm | number:'1.0-1') + ' km' : '-' }}</td>
                        <td>{{ route.durationHours ? (route.durationHours | number:'1.0-1') + ' hrs' : '-' }}</td>
                        <td class="font-semibold">{{ route.currency }} {{ route.basePrice | number:'1.2-2' }}</td>
                        <td>{{ route.capacity }}</td>
                        <td><p-tag [value]="route.isActive ? 'Active' : 'Inactive'" [severity]="route.isActive ? 'success' : 'danger'" /></td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (click)="editRoute(route)" pTooltip="Edit"></button>
                                <button *ngIf="route.isActive" pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (click)="deactivate(route)" pTooltip="Deactivate"></button>
                                <button *ngIf="!route.isActive" pButton icon="pi pi-check" [rounded]="true" [text]="true" severity="success" (click)="activateRoute(route)" pTooltip="Activate"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="9" class="text-center py-8">
                            <div class="flex flex-col items-center gap-3">
                                <i class="pi pi-directions text-4xl text-muted-color"></i>
                                <span class="text-lg text-muted-color">No vehicle routes defined</span>
                                <span class="text-sm text-muted-color">Define route pricing between locations</span>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Route Dialog -->
        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '600px' }" header="Vehicle Route" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Vehicle Type *</label>
                        <p-select [(ngModel)]="item.vehicleType" [options]="vehicleTypes" optionLabel="label" optionValue="value" placeholder="Select type" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Capacity (seats)</label>
                        <p-inputNumber [(ngModel)]="item.capacity" [min]="1" [max]="60" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">From Location *</label>
                        <p-select [(ngModel)]="item.locationFromId" [options]="locationOptions" optionLabel="label" optionValue="value" placeholder="Select origin" [filter]="true" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">To Location *</label>
                        <p-select [(ngModel)]="item.locationToId" [options]="locationOptions" optionLabel="label" optionValue="value" placeholder="Select destination" [filter]="true" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Distance (km)</label>
                        <p-inputNumber [(ngModel)]="item.distanceKm" [minFractionDigits]="0" [maxFractionDigits]="1" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Duration (hours)</label>
                        <p-inputNumber [(ngModel)]="item.durationHours" [minFractionDigits]="0" [maxFractionDigits]="1" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Base Price *</label>
                        <p-inputNumber [(ngModel)]="item.basePrice" mode="currency" [currency]="item.currency || 'USD'" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Currency</label>
                        <p-select [(ngModel)]="item.currency" [options]="currencyOptions" optionLabel="label" optionValue="value" />
                    </div>
                    <div class="flex flex-col gap-2 col-span-2">
                        <label class="font-semibold">Notes</label>
                        <textarea pTextarea [(ngModel)]="item.notes" rows="2"></textarea>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="dialogVisible = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="save()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class VehicleRouteManagement implements OnInit {
    routes: VehicleRoute[] = [];
    locations: Location[] = [];
    locationOptions: any[] = [];
    item: any = {};
    dialogVisible = false;
    loading = true;
    editMode = false;

    vehicleTypes = [
        { label: 'Car', value: 'Car' },
        { label: 'Jeep', value: 'Jeep' },
        { label: 'Bus', value: 'Bus' },
        { label: 'Minibus', value: 'Minibus' },
        { label: 'Van', value: 'Van' },
        { label: 'SUV', value: 'SUV' }
    ];

    currencyOptions = [
        { label: 'USD', value: 'USD' },
        { label: 'NPR', value: 'NPR' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
        { label: 'INR', value: 'INR' }
    ];

    constructor(
        private svc: InventoryRedesignService,
        private msg: MessageService,
        private confirm: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() { this.loadAll(); }

    loadAll() {
        this.loading = true;
        this.svc.getLocations().subscribe({
            next: (locs) => {
                this.locations = locs ?? [];
                this.locationOptions = this.locations.map(l => ({ label: `${l.name} (${l.country})`, value: l.id }));
                this.cdr.markForCheck();
            }
        });
        this.svc.getVehicleRoutes(true).subscribe({
            next: (data) => { this.routes = data ?? []; this.loading = false; this.cdr.markForCheck(); },
            error: () => { this.routes = []; this.loading = false; this.cdr.markForCheck(); this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load routes' }); }
        });
    }

    openNew() {
        this.item = { vehicleType: 'Car', capacity: 4, currency: 'USD', basePrice: 0 };
        this.editMode = false;
        this.dialogVisible = true;
    }

    editRoute(route: VehicleRoute) {
        this.item = { ...route };
        this.editMode = true;
        this.dialogVisible = true;
    }

    save() {
        if (!this.item.vehicleType || !this.item.locationFromId || !this.item.locationToId || !this.item.basePrice) {
            this.msg.add({ severity: 'warn', summary: 'Warning', detail: 'Vehicle type, locations, and price are required' });
            return;
        }
        const obs = this.editMode
            ? this.svc.updateVehicleRoute(this.item.id, this.item)
            : this.svc.createVehicleRoute(this.item);
        obs.subscribe({
            next: () => { this.loadAll(); this.dialogVisible = false; this.msg.add({ severity: 'success', summary: 'Success', detail: this.editMode ? 'Route updated' : 'Route created' }); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to save route' })
        });
    }

    deactivate(route: VehicleRoute) {
        this.confirm.confirm({
            message: `Deactivate this route?`,
            header: 'Confirm', icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.svc.deleteVehicleRoute(route.id).subscribe({
                    next: () => { this.loadAll(); this.msg.add({ severity: 'success', summary: 'Success', detail: 'Route deactivated' }); },
                    error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to deactivate' })
                });
            }
        });
    }

    activateRoute(route: VehicleRoute) {
        this.svc.activateVehicleRoute(route.id).subscribe({
            next: () => { this.loadAll(); this.msg.add({ severity: 'success', summary: 'Success', detail: 'Route activated' }); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to activate' })
        });
    }
}
