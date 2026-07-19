import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FluidModule } from 'primeng/fluid';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TenantSelector } from '../tenant-selector/tenant-selector';
import { ClinicService, Invoice, Patient } from '../clinic.service';

@Component({
    selector: 'app-invoice-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule, InputNumberModule,
        DialogModule, ConfirmDialogModule, TagModule, IconFieldModule, InputIconModule,
        ToolbarModule, FluidModule, TextareaModule, SelectModule, TenantSelector
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <span class="font-semibold text-xl mr-4">Invoices</span>
                    <app-tenant-selector (tenantChanged)="onTenantChange($event)"></app-tenant-selector>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Invoice" icon="pi pi-plus" severity="success" (click)="openNew()" [disabled]="!tenantId"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="items" [paginator]="true" [rows]="10" [loading]="loading"
                     [showGridlines]="true" [rowHover]="true" responsiveLayout="scroll"
                     [globalFilterFields]="['invoiceNumber', 'patientName', 'status']">
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center flex-wrap gap-2">
                        <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
                        <p-iconfield iconPosition="left">
                            <p-inputicon><i class="pi pi-search"></i></p-inputicon>
                            <input #filterInput pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search invoices..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="invoiceNumber">Invoice # <p-sortIcon field="invoiceNumber"></p-sortIcon></th>
                        <th pSortableColumn="patientName">Patient <p-sortIcon field="patientName"></p-sortIcon></th>
                        <th>Amount</th>
                        <th>Tax</th>
                        <th>Discount</th>
                        <th pSortableColumn="total">Total <p-sortIcon field="total"></p-sortIcon></th>
                        <th pSortableColumn="status">Status <p-sortIcon field="status"></p-sortIcon></th>
                        <th>Payment</th>
                        <th style="min-width: 8rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-item>
                    <tr>
                        <td class="font-semibold">{{ item.invoiceNumber }}</td>
                        <td>{{ item.patientName }}</td>
                        <td>{{ item.currency }} {{ item.amount | number:'1.2-2' }}</td>
                        <td>{{ item.tax | number:'1.2-2' }}</td>
                        <td>{{ item.discount | number:'1.2-2' }}</td>
                        <td class="font-semibold">{{ item.currency }} {{ item.total | number:'1.2-2' }}</td>
                        <td><p-tag [value]="item.status" [severity]="getStatusSeverity(item.status)"></p-tag></td>
                        <td>{{ item.paymentMethod || '-' }}</td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-check" class="p-button-rounded p-button-sm" severity="success"
                                        *ngIf="item.status === 'Pending'" pTooltip="Mark Paid" (click)="markPaid(item)"></button>
                                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-sm" (click)="edit(item)"></button>
                                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" (click)="remove(item)"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="9" class="text-center py-6"><i class="pi pi-file text-4xl text-color-secondary"></i><br>No invoices found.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Invoice' : 'New Invoice'" [modal]="true" [style]="{ width: '650px' }">
            <p-fluid>
                <div class="flex flex-col gap-4 mt-2">
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Invoice # *</label><input pInputText [(ngModel)]="selected.invoiceNumber" /></div>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">Patient *</label>
                            <p-select [options]="patientOptions" [(ngModel)]="selected.patientId" optionLabel="label" optionValue="value" placeholder="Select patient"></p-select>
                        </div>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Amount *</label><p-inputNumber [(ngModel)]="selected.amount" mode="decimal" [minFractionDigits]="2" (onInput)="calcTotal()"></p-inputNumber></div>
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Tax</label><p-inputNumber [(ngModel)]="selected.tax" mode="decimal" [minFractionDigits]="2" (onInput)="calcTotal()"></p-inputNumber></div>
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Discount</label><p-inputNumber [(ngModel)]="selected.discount" mode="decimal" [minFractionDigits]="2" (onInput)="calcTotal()"></p-inputNumber></div>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Total</label><p-inputNumber [(ngModel)]="selected.total" mode="decimal" [minFractionDigits]="2" [readonly]="true"></p-inputNumber></div>
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Currency</label><input pInputText [(ngModel)]="selected.currency" /></div>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">Status</label>
                            <p-select [options]="statusOptions" [(ngModel)]="selected.status" optionLabel="label" optionValue="value"></p-select>
                        </div>
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Payment Method</label><input pInputText [(ngModel)]="selected.paymentMethod" placeholder="Cash / Card / eSewa" /></div>
                    </div>
                    <div class="flex flex-col gap-2"><label class="font-semibold">Notes</label><textarea pTextarea [(ngModel)]="selected.notes" rows="2"></textarea></div>
                </div>
            </p-fluid>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="dialogVisible = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="save()" [disabled]="!selected.invoiceNumber || !selected.patientId"></button>
            </ng-template>
        </p-dialog>
    `
})
export class InvoiceList implements OnInit {
    items: Invoice[] = [];
    tenantId: number | null = null;
    loading = false;
    dialogVisible = false;
    editMode = false;
    selected: any = {};

    patientOptions: { label: string; value: number }[] = [];
    statusOptions = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Paid', value: 'Paid' },
        { label: 'Overdue', value: 'Overdue' },
        { label: 'Cancelled', value: 'Cancelled' }
    ];

    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(private clinicService: ClinicService, private messageService: MessageService, private confirmationService: ConfirmationService, private cdr: ChangeDetectorRef) {}

    ngOnInit() {}

    onTenantChange(tenantId: number) {
        this.tenantId = tenantId;
        this.load();
        this.clinicService.getPatients(tenantId).subscribe({
            next: (d) => { this.patientOptions = d.map(p => ({ label: `${p.firstName} ${p.lastName}`, value: p.id })); this.cdr.detectChanges(); }
        });
    }

    load() {
        if (!this.tenantId) return;
        this.loading = true;
        this.clinicService.getInvoices(this.tenantId).subscribe({
            next: (data) => { this.items = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load' }); this.loading = false; this.cdr.detectChanges(); }
        });
    }

    openNew() {
        const nextNum = `INV-${String(this.items.length + 1).padStart(3, '0')}`;
        this.selected = { invoiceNumber: nextNum, patientId: null, amount: 0, tax: 0, discount: 0, total: 0, currency: 'NPR', status: 'Pending', paymentMethod: '', notes: '' };
        this.editMode = false;
        this.dialogVisible = true;
    }

    edit(item: Invoice) { this.selected = { ...item }; this.editMode = true; this.dialogVisible = true; }

    calcTotal() {
        this.selected.total = (this.selected.amount || 0) + (this.selected.tax || 0) - (this.selected.discount || 0);
    }

    save() {
        if (this.editMode) {
            this.clinicService.updateInvoice(this.tenantId!, this.selected.id, this.selected).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Updated' }); this.dialogVisible = false; this.load(); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
            });
        } else {
            this.clinicService.createInvoice(this.tenantId!, this.selected).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Created' }); this.dialogVisible = false; this.load(); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' })
            });
        }
    }

    markPaid(item: Invoice) {
        this.clinicService.updateInvoice(this.tenantId!, item.id, { status: 'Paid', paymentMethod: 'Cash' }).subscribe({
            next: () => { this.messageService.add({ severity: 'success', summary: 'Paid', detail: 'Invoice marked as paid' }); this.load(); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
        });
    }

    remove(item: Invoice) {
        this.confirmationService.confirm({
            message: `Delete invoice ${item.invoiceNumber}?`, header: 'Confirm', icon: 'pi pi-exclamation-triangle',
            accept: () => { this.clinicService.deleteInvoice(this.tenantId!, item.id).subscribe({ next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted' }); this.load(); } }); }
        });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'Paid': return 'success';
            case 'Pending': return 'warn';
            case 'Overdue': return 'danger';
            case 'Cancelled': return 'secondary';
            default: return 'info';
        }
    }

    onGlobalFilter(table: any, event: Event) { table.filterGlobal((event.target as HTMLInputElement).value, 'contains'); }
    clear(table: any) { table.clear(); if (this.filterInput) this.filterInput.nativeElement.value = ''; }
}
