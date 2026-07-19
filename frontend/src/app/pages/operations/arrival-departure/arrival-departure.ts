import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { LeadCrmService, ServiceVoucher } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-arrival-departure',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        TagModule, SelectModule, DatePickerModule, ToolbarModule, IconFieldModule, InputIconModule, TabsModule
    ],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-arrows-h text-primary text-xl"></i>
                    </div>
                    <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Arrival / Departure Board</h2>
                </div>
                <p-datepicker [(ngModel)]="filterDate" dateFormat="yy-mm-dd" [showIcon]="true" (onSelect)="filter()" placeholder="Filter by date" />
            </div>

            <p-tabs value="0">
                <p-tablist>
                    <p-tab value="0"><i class="pi pi-sign-in mr-2"></i>Arrivals (Flight Vouchers)</p-tab>
                    <p-tab value="1"><i class="pi pi-sign-out mr-2"></i>Transfers (Transport Vouchers)</p-tab>
                </p-tablist>
                <p-tabpanels>
                    <p-tabpanel value="0">
                        <p-table [value]="arrivals" [paginator]="true" [rows]="10" dataKey="id" [loading]="loading" responsiveLayout="scroll" class="mt-4">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Voucher #</th>
                                    <th>Booking Ref</th>
                                    <th>Supplier</th>
                                    <th>Service Date</th>
                                    <th>Details</th>
                                    <th>Status</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-v>
                                <tr>
                                    <td class="font-mono font-semibold">{{ v.voucherNumber }}</td>
                                    <td>{{ v.bookingReference || '-' }}</td>
                                    <td>{{ v.supplierName || '-' }}</td>
                                    <td>{{ v.serviceDate ? (v.serviceDate | date:'medium') : '-' }}</td>
                                    <td>{{ v.details || '-' }}</td>
                                    <td><p-tag [value]="v.status" [severity]="v.status === 'Confirmed' ? 'success' : v.status === 'Issued' ? 'info' : 'secondary'" /></td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr><td colspan="6" class="text-center py-8 text-muted-color">No flight vouchers found.</td></tr>
                            </ng-template>
                        </p-table>
                    </p-tabpanel>

                    <p-tabpanel value="1">
                        <p-table [value]="transfers" [paginator]="true" [rows]="10" dataKey="id" [loading]="loading" responsiveLayout="scroll" class="mt-4">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Voucher #</th>
                                    <th>Booking Ref</th>
                                    <th>Supplier</th>
                                    <th>Service Date</th>
                                    <th>Details</th>
                                    <th>Status</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-v>
                                <tr>
                                    <td class="font-mono font-semibold">{{ v.voucherNumber }}</td>
                                    <td>{{ v.bookingReference || '-' }}</td>
                                    <td>{{ v.supplierName || '-' }}</td>
                                    <td>{{ v.serviceDate ? (v.serviceDate | date:'medium') : '-' }}</td>
                                    <td>{{ v.details || '-' }}</td>
                                    <td><p-tag [value]="v.status" [severity]="v.status === 'Confirmed' ? 'success' : v.status === 'Issued' ? 'info' : 'secondary'" /></td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr><td colspan="6" class="text-center py-8 text-muted-color">No transport vouchers found.</td></tr>
                            </ng-template>
                        </p-table>
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>
    `
})
export class ArrivalDeparture implements OnInit {
    allVouchers: ServiceVoucher[] = [];
    arrivals: ServiceVoucher[] = [];
    transfers: ServiceVoucher[] = [];
    filterDate: Date | null = null;
    loading = true;

    constructor(private leadCrmService: LeadCrmService, private messageService: MessageService) {}

    ngOnInit() {
        this.leadCrmService.getVouchers().subscribe({
            next: (data) => {
                this.allVouchers = data;
                this.arrivals = data.filter(v => v.voucherType === 'Flight');
                this.transfers = data.filter(v => v.voucherType === 'Transport');
                this.loading = false;
            },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' }); }
        });
    }

    filter() {
        if (!this.filterDate) {
            this.arrivals = this.allVouchers.filter(v => v.voucherType === 'Flight');
            this.transfers = this.allVouchers.filter(v => v.voucherType === 'Transport');
            return;
        }
        const dateStr = this.filterDate.getFullYear() + '-' + String(this.filterDate.getMonth() + 1).padStart(2, '0') + '-' + String(this.filterDate.getDate()).padStart(2, '0');
        this.arrivals = this.allVouchers.filter(v => v.voucherType === 'Flight' && v.serviceDate?.substring(0, 10) === dateStr);
        this.transfers = this.allVouchers.filter(v => v.voucherType === 'Transport' && v.serviceDate?.substring(0, 10) === dateStr);
    }
}
