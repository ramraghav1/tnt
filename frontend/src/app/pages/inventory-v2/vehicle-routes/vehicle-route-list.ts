import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { StatusBadge, InvPageHeader, InvEmptyState } from '../shared/inventory-shared';
import { InventoryV2Service, VehicleRoute, Location, CreateVehicleRouteRequest } from '../inventory.service';

@Component({
    selector: 'inv-vehicle-route-list',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, InputNumberModule, TextareaModule, SelectModule, TagModule,
        ToastModule, ConfirmDialogModule, TooltipModule,
        StatusBadge, InvPageHeader, InvEmptyState
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <inv-page-header
            title="Vehicle Routes"
            icon="pi pi-directions"
            [subtitle]="routes.length + ' routes'"
            searchPlaceholder="Search routes..."
            addLabel="Add Route"
            (searchChange)="onSearch($event)"
            (addClick)="openNew()"
        />

        <div class="card">
            <p-table #dt [value]="routes" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,25,50]"
                     [globalFilterFields]="['vehicleType','locationFromName','locationToName']" dataKey="id"
                     [loading]="loading" [showCurrentPageReport]="true"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="vehicleType" style="min-width:8rem">Type <p-sortIcon field="vehicleType" /></th>
                        <th style="min-width:14rem">Route</th>
                        <th style="min-width:5rem">Distance</th>
                        <th style="min-width:5rem">Duration</th>
                        <th pSortableColumn="basePrice" style="min-width:8rem">Base Price (USD) <p-sortIcon field="basePrice" /></th>
                        <th style="min-width:5rem">Capacity</th>
                        <th style="min-width:5rem">Status</th>
                        <th style="min-width:8rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-r>
                    <tr>
                        <td><p-tag [value]="r.vehicleType" severity="info" [rounded]="true" /></td>
                        <td>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold">{{ r.locationFromName || 'Unknown' }}</span>
                                <i class="pi pi-arrow-right text-muted-color"></i>
                                <span class="font-semibold">{{ r.locationToName || 'Unknown' }}</span>
                            </div>
                        </td>
                        <td>{{ r.distanceKm ? r.distanceKm + ' km' : '—' }}</td>
                        <td>{{ r.durationHours ? r.durationHours + 'h' : '—' }}</td>
                        <td class="font-mono font-semibold">\${{ r.basePrice | number:'1.2-2' }}</td>
                        <td>{{ r.capacity }} pax</td>
                        <td><inv-status-badge [active]="r.isActive" /></td>
                        <td>
                            <div class="flex gap-1">
                                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (click)="editRoute(r)" pTooltip="Edit"></button>
                                <button *ngIf="r.isActive" pButton icon="pi pi-ban" [rounded]="true" [text]="true" severity="danger" (click)="deactivate(r)" pTooltip="Deactivate"></button>
                                <button *ngIf="!r.isActive" pButton icon="pi pi-check-circle" [rounded]="true" [text]="true" severity="success" (click)="activate(r)" pTooltip="Activate"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="8"><inv-empty-state icon="pi pi-directions" message="No vehicle routes" hint="Define route-based pricing for vehicles" /></td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Route Dialog -->
        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Route' : 'New Route'" [modal]="true" [style]="{ width: '540px' }" styleClass="p-fluid">
            <ng-template #content>
                <form [formGroup]="form" class="flex flex-col gap-4 pt-2">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Vehicle Type *</label>
                        <p-select formControlName="vehicleType" [options]="typeOptions" optionLabel="label" optionValue="value" placeholder="Select" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">From Location *</label>
                            <p-select formControlName="locationFromId" [options]="locationOptions" optionLabel="label" optionValue="value" [filter]="true" placeholder="Select" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">To Location *</label>
                            <p-select formControlName="locationToId" [options]="locationOptions" optionLabel="label" optionValue="value" [filter]="true" placeholder="Select" />
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Distance (km)</label>
                            <p-inputNumber formControlName="distanceKm" [min]="0" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Duration (hours)</label>
                            <p-inputNumber formControlName="durationHours" [min]="0" [minFractionDigits]="1" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Capacity *</label>
                            <p-inputNumber formControlName="capacity" [min]="1" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Base Price (USD) *</label>
                        <p-inputNumber formControlName="basePrice" mode="currency" currency="USD" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Notes</label>
                        <textarea pTextarea formControlName="notes" rows="2"></textarea>
                    </div>
                </form>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="dialogVisible = false"></button>
                <button pButton [label]="editMode ? 'Update' : 'Create'" icon="pi pi-check" [disabled]="form.invalid" (click)="save()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class VehicleRouteList implements OnInit {
    @ViewChild('dt') dt!: Table;
    routes: VehicleRoute[] = [];
    locations: Location[] = [];
    locationOptions: any[] = [];
    loading = true;
    dialogVisible = false;
    editMode = false;
    editId = 0;
    form!: FormGroup;

    typeOptions = [
        { label: 'Car', value: 'Car' }, { label: 'SUV', value: 'SUV' }, { label: 'Jeep', value: 'Jeep' },
        { label: 'Van', value: 'Van' }, { label: 'Bus', value: 'Bus' }, { label: 'Minibus', value: 'Minibus' }
    ];

    constructor(
        private svc: InventoryV2Service,
        private fb: FormBuilder,
        private msg: MessageService,
        private confirm: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            vehicleType: ['', Validators.required],
            locationFromId: [null, Validators.required],
            locationToId: [null, Validators.required],
            distanceKm: [null],
            durationHours: [null],
            basePrice: [0, [Validators.required, Validators.min(0)]],
            currency: ['USD'],
            capacity: [4, [Validators.required, Validators.min(1)]],
            notes: ['']
        });
        this.loadLocations();
        this.load();
    }

    loadLocations() {
        this.svc.getLocations().subscribe({
            next: d => { this.locations = d ?? []; this.locationOptions = this.locations.map(l => ({ label: `${l.name}, ${l.country}`, value: l.id })); this.cdr.markForCheck(); }
        });
    }

    load() {
        this.loading = true;
        this.svc.getVehicleRoutes(true).subscribe({
            next: d => { this.routes = d ?? []; this.loading = false; this.cdr.markForCheck(); },
            error: () => { this.routes = []; this.loading = false; this.cdr.markForCheck(); }
        });
    }

    onSearch(val: string) { this.dt?.filterGlobal(val, 'contains'); }

    openNew() {
        this.editMode = false;
        this.form.reset({ currency: 'USD', capacity: 4, basePrice: 0 });
        this.dialogVisible = true;
    }

    editRoute(r: VehicleRoute) {
        this.editMode = true;
        this.editId = r.id;
        this.form.patchValue(r);
        this.dialogVisible = true;
    }

    save() {
        if (this.form.invalid) return;
        const data = this.form.value as CreateVehicleRouteRequest;
        const obs = this.editMode ? this.svc.updateVehicleRoute(this.editId, data) : this.svc.createVehicleRoute(data);
        obs.subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Success' }); this.dialogVisible = false; this.load(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to save route' })
        });
    }

    deactivate(r: VehicleRoute) {
        this.confirm.confirm({
            message: `Deactivate this route?`, header: 'Confirm',
            accept: () => this.svc.deleteVehicleRoute(r.id).subscribe({
                next: () => { this.msg.add({ severity: 'success', summary: 'Deactivated' }); this.load(); },
                error: () => this.msg.add({ severity: 'error', summary: 'Error' })
            })
        });
    }

    activate(r: VehicleRoute) {
        this.svc.activateVehicleRoute(r.id).subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Activated' }); this.load(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error' })
        });
    }
}
