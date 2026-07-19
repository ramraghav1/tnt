import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { LeadCrmService, ServiceVoucher } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-tnt-voucher-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        TagModule, ToolbarModule, IconFieldModule, InputIconModule, TooltipModule
    ],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <p-toolbar styleClass="mb-6 gap-2">
                <ng-template #start>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-ticket text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Service Vouchers</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <button pButton label="Export" icon="pi pi-upload" severity="secondary" (click)="dt.exportCSV()"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="vouchers" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5,10,25,50]"
                     [globalFilterFields]="['voucherNumber','voucherType','supplierName','bookingReference','status']"
                     dataKey="id" [loading]="loading" responsiveLayout="scroll" [showCurrentPageReport]="true"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords} vouchers">
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search vouchers..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="voucherNumber" style="min-width:10rem">Voucher # <p-sortIcon field="voucherNumber" /></th>
                        <th pSortableColumn="voucherType" style="min-width:8rem">Type <p-sortIcon field="voucherType" /></th>
                        <th>Booking Ref</th>
                        <th>Supplier</th>
                        <th pSortableColumn="serviceDate">Service Date <p-sortIcon field="serviceDate" /></th>
                        <th style="min-width:14rem">Details</th>
                        <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
                        <th pSortableColumn="createdAt">Created <p-sortIcon field="createdAt" /></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-v>
                    <tr>
                        <td class="font-semibold font-mono">{{ v.voucherNumber }}</td>
                        <td><p-tag [value]="v.voucherType" severity="info" /></td>
                        <td>{{ v.bookingReference || '-' }}</td>
                        <td>{{ v.supplierName || '-' }}</td>
                        <td>{{ v.serviceDate ? (v.serviceDate | date:'mediumDate') : '-' }}</td>
                        <td class="text-sm">{{ v.details || '-' }}</td>
                        <td><p-tag [value]="v.status" [severity]="getStatusSeverity(v.status)" /></td>
                        <td>{{ v.createdAt | date:'mediumDate' }}</td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-check" [rounded]="true" [text]="true" severity="success"
                                        (click)="updateStatus(v, 'Confirmed')" pTooltip="Confirm" *ngIf="v.status === 'Issued'"></button>
                                <button pButton icon="pi pi-times" [rounded]="true" [text]="true" severity="danger"
                                        (click)="updateStatus(v, 'Cancelled')" pTooltip="Cancel" *ngIf="v.status !== 'Cancelled' && v.status !== 'Used'"></button>
                                <button pButton icon="pi pi-check-circle" [rounded]="true" [text]="true" severity="info"
                                        (click)="updateStatus(v, 'Used')" pTooltip="Mark Used" *ngIf="v.status === 'Confirmed'"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="9" class="text-center py-8 text-muted-color">No vouchers found.</td></tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class TntVoucherList implements OnInit {
    vouchers: ServiceVoucher[] = [];
    loading = true;

    constructor(private leadCrmService: LeadCrmService, private messageService: MessageService) {}

    ngOnInit() { this.loadVouchers(); }

    loadVouchers() {
        this.loading = true;
        this.leadCrmService.getVouchers().subscribe({
            next: (data) => { this.vouchers = data; this.loading = false; },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load vouchers' }); }
        });
    }

    updateStatus(v: ServiceVoucher, status: string) {
        this.leadCrmService.updateVoucherStatus(v.id, status).subscribe({
            next: () => { this.loadVouchers(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Status updated to ' + status }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'Draft': return 'secondary';
            case 'Issued': return 'info';
            case 'Confirmed': return 'success';
            case 'Used': return 'contrast';
            case 'Cancelled': return 'danger';
            default: return 'secondary';
        }
    }
}
