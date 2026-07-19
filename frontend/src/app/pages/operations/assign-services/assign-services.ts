import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { LeadCrmService, ServiceVoucher } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-assign-services',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        TagModule, DialogModule, SelectModule, InputNumberModule, TextareaModule, ToolbarModule,
        IconFieldModule, InputIconModule, DatePickerModule
    ],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <p-toolbar styleClass="mb-6 gap-2">
                <ng-template #start>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-cog text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Assign Services</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Service Voucher" icon="pi pi-plus" (click)="openNew()"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="vouchers" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5,10,25]"
                     [globalFilterFields]="['voucherNumber','voucherType','supplierName','bookingReference','status']"
                     dataKey="id" [loading]="loading" responsiveLayout="scroll">
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search services..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="voucherNumber">Voucher # <p-sortIcon field="voucherNumber" /></th>
                        <th pSortableColumn="voucherType">Type <p-sortIcon field="voucherType" /></th>
                        <th>Supplier</th>
                        <th>Booking Ref</th>
                        <th pSortableColumn="serviceDate">Service Date <p-sortIcon field="serviceDate" /></th>
                        <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
                        <th>Details</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-v>
                    <tr>
                        <td class="font-semibold font-mono">{{ v.voucherNumber }}</td>
                        <td><p-tag [value]="v.voucherType" severity="info" /></td>
                        <td>{{ v.supplierName || '-' }}</td>
                        <td>{{ v.bookingReference || '-' }}</td>
                        <td>{{ v.serviceDate ? (v.serviceDate | date:'mediumDate') : '-' }}</td>
                        <td><p-tag [value]="v.status" [severity]="getStatusSeverity(v.status)" /></td>
                        <td class="text-sm">{{ v.details || '-' }}</td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-check-circle" [rounded]="true" [text]="true" severity="success"
                                        (click)="updateStatus(v, 'Confirmed')" *ngIf="v.status === 'Issued'"></button>
                                <button pButton icon="pi pi-times-circle" [rounded]="true" [text]="true" severity="danger"
                                        (click)="updateStatus(v, 'Cancelled')" *ngIf="v.status !== 'Cancelled'"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="8" class="text-center py-8 text-muted-color">No service vouchers found.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Voucher Dialog -->
        <p-dialog [(visible)]="voucherDialog" [style]="{ width: '500px' }" header="New Service Voucher" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Voucher Type *</label>
                        <p-select [(ngModel)]="newVoucher.voucherType" [options]="voucherTypeOptions" optionLabel="label" optionValue="value" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Booking Instance ID</label>
                        <p-inputNumber [(ngModel)]="newVoucher.bookingInstanceId" [min]="1" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Supplier Type</label>
                            <p-select [(ngModel)]="newVoucher.supplierType" [options]="supplierTypeOptions" optionLabel="label" optionValue="value" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Supplier ID</label>
                            <p-inputNumber [(ngModel)]="newVoucher.supplierId" [min]="1" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Service Date</label>
                        <p-datepicker [(ngModel)]="newVoucher.serviceDate" dateFormat="yy-mm-dd" [showIcon]="true" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Details</label>
                        <textarea pTextarea [(ngModel)]="newVoucher.details" rows="3"></textarea>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="voucherDialog = false"></button>
                <button pButton label="Issue Voucher" icon="pi pi-check" (click)="saveVoucher()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class AssignServices implements OnInit {
    vouchers: ServiceVoucher[] = [];
    loading = true;
    voucherDialog = false;
    newVoucher: any = {};

    voucherTypeOptions = [
        { label: 'Hotel', value: 'Hotel' }, { label: 'Transport', value: 'Transport' },
        { label: 'Activity', value: 'Activity' }, { label: 'Guide', value: 'Guide' },
        { label: 'Meal', value: 'Meal' }, { label: 'Flight', value: 'Flight' }, { label: 'Other', value: 'Other' }
    ];

    supplierTypeOptions = [
        { label: 'Hotel', value: 'Hotel' }, { label: 'Transport', value: 'Transport' },
        { label: 'Activity', value: 'Activity' }, { label: 'Airline', value: 'Airline' }, { label: 'Other', value: 'Other' }
    ];

    constructor(private leadCrmService: LeadCrmService, private messageService: MessageService) {}

    ngOnInit() { this.loadVouchers(); }

    loadVouchers() {
        this.loading = true;
        this.leadCrmService.getVouchers().subscribe({
            next: (data) => { this.vouchers = data; this.loading = false; },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load vouchers' }); }
        });
    }

    openNew() {
        this.newVoucher = { voucherType: 'Hotel' };
        this.voucherDialog = true;
    }

    saveVoucher() {
        if (!this.newVoucher.voucherType) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Voucher type required' });
            return;
        }
        this.leadCrmService.createVoucher(this.newVoucher).subscribe({
            next: () => { this.loadVouchers(); this.voucherDialog = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Voucher issued' }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to issue voucher' })
        });
    }

    updateStatus(v: ServiceVoucher, status: string) {
        this.leadCrmService.updateVoucherStatus(v.id, status).subscribe({
            next: () => { this.loadVouchers(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Status updated' }); },
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
            case 'Cancelled': return 'danger';
            default: return 'secondary';
        }
    }
}
