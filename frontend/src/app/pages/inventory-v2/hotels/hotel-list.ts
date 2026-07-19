import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { StatusBadge, StarRating, InvPageHeader, InvEmptyState } from '../shared/inventory-shared';
import { InventoryV2Service, Hotel } from '../inventory.service';

@Component({
    selector: 'inv-hotel-list',
    standalone: true,
    imports: [
        CommonModule, TableModule, ButtonModule, ToastModule, ConfirmDialogModule,
        TooltipModule, StatusBadge, StarRating, InvPageHeader, InvEmptyState
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <inv-page-header
            title="Hotels"
            icon="pi pi-building"
            [subtitle]="hotels.length + ' properties'"
            searchPlaceholder="Search hotels..."
            addLabel="Add Hotel"
            (searchChange)="onSearch($event)"
            (addClick)="router.navigate(['/inventory-v2/hotels/new'])"
        />

        <div class="card">
            <p-table #dt [value]="hotels" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,25,50]"
                     [globalFilterFields]="['name','location','category']" dataKey="id"
                     [loading]="loading" [showCurrentPageReport]="true"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name" style="min-width:14rem">Hotel <p-sortIcon field="name" /></th>
                        <th pSortableColumn="location" style="min-width:8rem">Location <p-sortIcon field="location" /></th>
                        <th pSortableColumn="category" style="min-width:8rem">Category <p-sortIcon field="category" /></th>
                        <th pSortableColumn="starRating" style="min-width:8rem">Stars <p-sortIcon field="starRating" /></th>
                        <th style="min-width:5rem">Rooms</th>
                        <th style="min-width:5rem">Status</th>
                        <th style="min-width:8rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-hotel>
                    <tr class="cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800" (click)="router.navigate(['/inventory-v2/hotels', hotel.id])">
                        <td>
                            <div class="font-semibold">{{ hotel.name }}</div>
                            <div class="text-sm text-muted-color mt-0.5">{{ hotel.phone }}</div>
                        </td>
                        <td>{{ hotel.location }}</td>
                        <td>{{ hotel.category || '—' }}</td>
                        <td><inv-star-rating [rating]="hotel.starRating || 0" /></td>
                        <td><span class="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm font-medium">{{ hotel.rooms?.length || 0 }}</span></td>
                        <td><inv-status-badge [active]="hotel.isActive ?? true" /></td>
                        <td>
                            <div class="flex gap-1" (click)="$event.stopPropagation()">
                                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info"
                                        (click)="router.navigate(['/inventory-v2/hotels/edit', hotel.id])" pTooltip="Edit"></button>
                                <button *ngIf="hotel.isActive" pButton icon="pi pi-ban" [rounded]="true" [text]="true" severity="danger"
                                        (click)="confirmDeactivate(hotel)" pTooltip="Deactivate"></button>
                                <button *ngIf="!hotel.isActive" pButton icon="pi pi-check-circle" [rounded]="true" [text]="true" severity="success"
                                        (click)="activate(hotel)" pTooltip="Activate"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7"><inv-empty-state icon="pi pi-building" message="No hotels found" hint="Add your first hotel to get started" /></td></tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class HotelList implements OnInit {
    @ViewChild('dt') dt!: Table;
    hotels: Hotel[] = [];
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
        this.svc.getHotels(true).subscribe({
            next: d => { this.hotels = d ?? []; this.loading = false; this.cdr.markForCheck(); },
            error: () => { this.hotels = []; this.loading = false; this.cdr.markForCheck(); }
        });
    }

    onSearch(val: string) { this.dt?.filterGlobal(val, 'contains'); }

    confirmDeactivate(hotel: Hotel) {
        this.confirm.confirm({
            message: `Deactivate "${hotel.name}"?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.svc.deleteHotel(hotel.id!).subscribe({
                    next: () => { this.msg.add({ severity: 'success', summary: 'Deactivated', detail: hotel.name }); this.load(); },
                    error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed' })
                });
            }
        });
    }

    activate(hotel: Hotel) {
        this.svc.activateHotel(hotel.id!).subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Activated', detail: hotel.name }); this.load(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed' })
        });
    }
}
