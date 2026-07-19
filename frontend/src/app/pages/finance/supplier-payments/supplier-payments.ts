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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LeadCrmService, SupplierPayment } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-supplier-payment-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        TagModule, DialogModule, SelectModule, InputNumberModule, TextareaModule, ToolbarModule,
        ConfirmDialogModule, IconFieldModule, InputIconModule, DatePickerModule, TooltipModule
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
                            <i class="pi pi-money-bill text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Supplier Payments</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Payment" icon="pi pi-plus" (click)="openNew()"></button>
                </ng-template>
            </p-toolbar>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div class="text-sm text-muted-color">Total Payments</div>
                    <div class="text-2xl font-bold">{{ payments.length }}</div>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <div class="text-sm text-muted-color">Completed</div>
                    <div class="text-2xl font-bold text-green-600">{{ completedCount }}</div>
                </div>
                <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                    <div class="text-sm text-muted-color">Pending</div>
                    <div class="text-2xl font-bold text-orange-600">{{ pendingCount }}</div>
                </div>
                <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                    <div class="text-sm text-muted-color">Total Amount</div>
                    <div class="text-2xl font-bold">{{ totalAmount | number:'1.2-2' }}</div>
                </div>
            </div>

            <p-table #dt [value]="payments" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5,10,25]"
                     [globalFilterFields]="['supplierName','supplierType','reference','status','paymentMethod']"
                     dataKey="id" [loading]="loading" responsiveLayout="scroll">
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search payments..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="supplierName" style="min-width:12rem">Supplier <p-sortIcon field="supplierName" /></th>
                        <th pSortableColumn="supplierType">Type <p-sortIcon field="supplierType" /></th>
                        <th>Booking Ref</th>
                        <th pSortableColumn="amount">Amount <p-sortIcon field="amount" /></th>
                        <th>Method</th>
                        <th pSortableColumn="paymentDate">Payment Date <p-sortIcon field="paymentDate" /></th>
                        <th>Reference</th>
                        <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-p>
                    <tr>
                        <td class="font-semibold">{{ p.supplierName }}</td>
                        <td><p-tag [value]="p.supplierType" severity="info" /></td>
                        <td class="font-mono text-sm">{{ p.bookingReference || '-' }}</td>
                        <td class="font-semibold">{{ p.amount | number:'1.2-2' }} {{ p.currency }}</td>
                        <td>{{ p.paymentMethod || '-' }}</td>
                        <td>{{ p.paymentDate | date:'mediumDate' }}</td>
                        <td class="font-mono text-sm">{{ p.reference || '-' }}</td>
                        <td><p-tag [value]="p.status" [severity]="getStatusSeverity(p.status)" /></td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-check" [rounded]="true" [text]="true" severity="success"
                                        (click)="updateStatus(p, 'Completed')" pTooltip="Complete" *ngIf="p.status === 'Pending'"></button>
                                <button pButton icon="pi pi-times" [rounded]="true" [text]="true" severity="danger"
                                        (click)="updateStatus(p, 'Cancelled')" pTooltip="Cancel" *ngIf="p.status === 'Pending'"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="9" class="text-center py-8 text-muted-color">No supplier payments found.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Payment Dialog -->
        <p-dialog [(visible)]="paymentDialog" [style]="{ width: '550px' }" header="New Supplier Payment" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Supplier Type *</label>
                            <p-select [(ngModel)]="newPayment.supplierType" [options]="supplierTypeOptions" optionLabel="label" optionValue="value" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Supplier ID *</label>
                            <p-inputNumber [(ngModel)]="newPayment.supplierId" [min]="1" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Supplier Name *</label>
                        <input pInputText [(ngModel)]="newPayment.supplierName" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Booking Instance ID</label>
                        <p-inputNumber [(ngModel)]="newPayment.bookingInstanceId" [min]="1" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Amount *</label>
                            <p-inputNumber [(ngModel)]="newPayment.amount" mode="decimal" [minFractionDigits]="2" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Currency</label>
                            <p-select [(ngModel)]="newPayment.currency" [options]="currencyOptions" optionLabel="label" optionValue="value" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Payment Method</label>
                            <p-select [(ngModel)]="newPayment.paymentMethod" [options]="methodOptions" optionLabel="label" optionValue="value" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Payment Date</label>
                            <p-datepicker [(ngModel)]="newPayment.paymentDate" dateFormat="yy-mm-dd" [showIcon]="true" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Reference</label>
                        <input pInputText [(ngModel)]="newPayment.reference" placeholder="Invoice / check number" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Notes</label>
                        <textarea pTextarea [(ngModel)]="newPayment.notes" rows="2"></textarea>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="paymentDialog = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="savePayment()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class SupplierPaymentList implements OnInit {
    payments: SupplierPayment[] = [];
    loading = true;
    paymentDialog = false;
    newPayment: any = {};
    completedCount = 0;
    pendingCount = 0;
    totalAmount = 0;

    supplierTypeOptions = [
        { label: 'Hotel', value: 'Hotel' }, { label: 'Transport', value: 'Transport' },
        { label: 'Activity', value: 'Activity' }, { label: 'Airline', value: 'Airline' }, { label: 'Other', value: 'Other' }
    ];

    methodOptions = [
        { label: 'Bank Transfer', value: 'BankTransfer' }, { label: 'Cash', value: 'Cash' },
        { label: 'Check', value: 'Check' }, { label: 'Online', value: 'Online' }
    ];

    currencyOptions = [
        { label: 'USD', value: 'USD' }, { label: 'EUR', value: 'EUR' },
        { label: 'NPR', value: 'NPR' }, { label: 'GBP', value: 'GBP' }
    ];

    constructor(
        private leadCrmService: LeadCrmService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() { this.loadPayments(); }

    loadPayments() {
        this.loading = true;
        this.leadCrmService.getSupplierPayments().subscribe({
            next: (data) => {
                this.payments = data;
                this.completedCount = data.filter(p => p.status === 'Completed').length;
                this.pendingCount = data.filter(p => p.status === 'Pending').length;
                this.totalAmount = data.reduce((sum, p) => sum + p.amount, 0);
                this.loading = false;
            },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load payments' }); }
        });
    }

    openNew() {
        this.newPayment = { supplierType: 'Hotel', currency: 'USD', paymentMethod: 'BankTransfer', amount: 0 };
        this.paymentDialog = true;
    }

    savePayment() {
        if (!this.newPayment.supplierName?.trim() || !this.newPayment.amount) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Supplier name and amount required' });
            return;
        }
        this.leadCrmService.createSupplierPayment(this.newPayment).subscribe({
            next: () => { this.loadPayments(); this.paymentDialog = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment recorded' }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to record payment' })
        });
    }

    updateStatus(p: SupplierPayment, status: string) {
        this.confirmationService.confirm({
            message: `Mark payment to "${p.supplierName}" as ${status}?`,
            accept: () => {
                this.leadCrmService.updateSupplierPaymentStatus(p.id, status).subscribe({
                    next: () => { this.loadPayments(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Status updated' }); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
                });
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'Pending': return 'warn';
            case 'Completed': return 'success';
            case 'Cancelled': return 'danger';
            default: return 'secondary';
        }
    }
}
