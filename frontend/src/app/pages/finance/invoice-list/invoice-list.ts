import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FinanceService, InvoiceListItem } from '../finance.service';

@Component({
    selector: 'app-invoice-list',
    standalone: true,
    imports: [
        CommonModule, RouterModule, FormsModule,
        TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, SelectModule, IconFieldModule, InputIconModule,
        DialogModule, InputNumberModule, ProgressSpinnerModule, ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './invoice-list.html',
    styleUrls: ['./invoice-list.scss']
})
export class FinanceInvoiceList implements OnInit {
    invoices: InvoiceListItem[] = [];
    loading = false;
    globalFilter = '';

    showGenerateDialog = false;
    bookingIdInput: number | null = null;
    generating = false;

    statusOptions = [
        { label: 'All', value: '' },
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Cancelled', value: 'cancelled' }
    ];
    selectedStatus = '';

    constructor(
        private financeService: FinanceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadInvoices();
    }

    loadInvoices(): void {
        this.loading = true;
        this.financeService.getInvoices(1, 100, this.selectedStatus || undefined).subscribe({
            next: (data) => { this.invoices = data; this.loading = false; this.cdr.detectChanges(); },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load invoices' });
            }
        });
    }

    onStatusFilter(): void { this.loadInvoices(); }

    openGenerateDialog(): void {
        this.bookingIdInput = null;
        this.showGenerateDialog = true;
    }

    generateInvoice(): void {
        if (!this.bookingIdInput) return;
        this.generating = true;
        this.financeService.generateInvoiceFromBooking(this.bookingIdInput).subscribe({
            next: () => {
                this.generating = false;
                this.showGenerateDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Invoice generated successfully' });
                this.loadInvoices();
            },
            error: (err) => {
                console.error(err);
                this.generating = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to generate invoice' });
            }
        });
    }

    updateStatus(invoice: InvoiceListItem, status: string): void {
        this.financeService.updateInvoiceStatus(invoice.id, status).subscribe({
            next: () => {
                invoice.status = status;
                this.cdr.detectChanges();
                this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Invoice status updated' });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status' })
        });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status?.toLowerCase()) {
            case 'paid': return 'success';
            case 'sent': return 'info';
            case 'draft': return 'secondary';
            case 'overdue': return 'danger';
            case 'cancelled': return 'warn';
            default: return 'secondary';
        }
    }

    getBalanceDue(invoice: InvoiceListItem): number {
        return invoice.totalAmount - invoice.paidAmount;
    }
}
