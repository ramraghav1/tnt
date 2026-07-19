import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';

import { StatusBadge, InvPageHeader, InvEmptyState } from '../shared/inventory-shared';
import { InventoryV2Service, Vehicle } from '../inventory.service';

@Component({
    selector: 'inv-vehicle-list',
    standalone: true,
    imports: [
        CommonModule, TableModule, ButtonModule, ToastModule, ConfirmDialogModule,
        TooltipModule, TagModule, StatusBadge, InvPageHeader, InvEmptyState
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <inv-page-header
            title="Vehicles"
            icon="pi pi-car"
            [subtitle]="vehicles.length + ' vehicles'"
            searchPlaceholder="Search vehicles..."
            addLabel="Add Vehicle"
            (searchChange)="onSearch($event)"
            (addClick)="router.navigate(['/inventory-v2/vehicles/new'])"
        />

        <div class="card">
            <p-table #dt [value]="vehicles" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,25,50]"
                     [globalFilterFields]="['vehicleType','model','registrationNumber','driverName']" dataKey="id"
                     [loading]="loading" [showCurrentPageReport]="true" [rowGroupMode]="'subheader'" groupRowsBy="vehicleType"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="vehicleType" style="min-width:8rem">Type <p-sortIcon field="vehicleType" /></th>
                        <th pSortableColumn="model" style="min-width:10rem">Model <p-sortIcon field="model" /></th>
                        <th style="min-width:8rem">Registration</th>
                        <th style="min-width:5rem">Capacity</th>
                        <th style="min-width:8rem">Base Rate (USD/day)</th>
                        <th style="min-width:6rem">Driver</th>
                        <th style="min-width:5rem">Status</th>
                        <th style="min-width:8rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="groupheader" let-vehicle>
                    <tr class="bg-surface-50 dark:bg-surface-800">
                        <td colspan="8">
                            <div class="flex items-center gap-2 font-semibold">
                                <p-tag [value]="vehicle.vehicleType" severity="info" [rounded]="true" />
                                <span class="text-muted-color text-sm">({{ getTypeCount(vehicle.vehicleType) }} vehicles)</span>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-v>
                    <tr>
                        <td>{{ v.vehicleType }}</td>
                        <td class="font-semibold">{{ v.model }}</td>
                        <td><span class="font-mono bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded text-sm">{{ v.registrationNumber }}</span></td>
                        <td>{{ v.capacity }} pax</td>
                        <td class="font-mono font-semibold">\${{ v.pricePerDay | number:'1.2-2' }}</td>
                        <td>{{ v.driverName || '—' }}</td>
                        <td><inv-status-badge [active]="v.isActive ?? true" /></td>
                        <td>
                            <div class="flex gap-1">
                                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info"
                                        (click)="router.navigate(['/inventory-v2/vehicles/edit', v.id])" pTooltip="Edit"></button>
                                <button *ngIf="v.isActive" pButton icon="pi pi-ban" [rounded]="true" [text]="true" severity="danger"
                                        (click)="deactivate(v)" pTooltip="Deactivate"></button>
                                <button *ngIf="!v.isActive" pButton icon="pi pi-check-circle" [rounded]="true" [text]="true" severity="success"
                                        (click)="activate(v)" pTooltip="Activate"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="8"><inv-empty-state icon="pi pi-car" message="No vehicles found" hint="Add your first vehicle" /></td></tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class VehicleList implements OnInit {
    @ViewChild('dt') dt!: Table;
    vehicles: Vehicle[] = [];
    loading = true;

    constructor(
        public router: Router,
        private svc: InventoryV2Service,
        private msg: MessageService,
        private confirm: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() { this.load(); }

    load() {
        this.loading = true;
        this.svc.getVehicles(true).subscribe({
            next: d => { this.vehicles = (d ?? []).sort((a, b) => a.vehicleType.localeCompare(b.vehicleType)); this.loading = false; this.cdr.markForCheck(); },
            error: () => { this.vehicles = []; this.loading = false; this.cdr.markForCheck(); }
        });
    }

    onSearch(val: string) { this.dt?.filterGlobal(val, 'contains'); }

    getTypeCount(type: string): number { return this.vehicles.filter(v => v.vehicleType === type).length; }

    deactivate(v: Vehicle) {
        this.confirm.confirm({
            message: `Deactivate "${v.model}"?`, header: 'Confirm', icon: 'pi pi-exclamation-triangle',
            accept: () => this.svc.deleteVehicle(v.id!).subscribe({
                next: () => { this.msg.add({ severity: 'success', summary: 'Deactivated' }); this.load(); },
                error: () => this.msg.add({ severity: 'error', summary: 'Error' })
            })
        });
    }

    activate(v: Vehicle) {
        this.svc.activateVehicle(v.id!).subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Activated' }); this.load(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error' })
        });
    }
}
