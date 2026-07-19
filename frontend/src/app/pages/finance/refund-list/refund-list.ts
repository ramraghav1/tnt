import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { FinanceService, Refund, CreateRefundRequest, ProcessRefundRequest } from '../finance.service';

@Component({
    selector: 'app-refund-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, SelectModule, DialogModule, InputNumberModule, ProgressSpinnerModule
    ],
    providers: [MessageService],
    templateUrl: './refund-list.html',
    styleUrls: ['./refund-list.scss']
})
export class RefundList implements OnInit {
    refunds: Refund[] = [];
    loading = false;
    showCreateDialog = false;
    showProcessDialog = false;
    saving = false;
    processingId: number | null = null;
    createForm: CreateRefundRequest = this.emptyCreateForm();
    processForm: ProcessRefundRequest = { transactionReference: '' };

    currencyOptions = [
        { label: 'NPR', value: 'NPR' },
        { label: 'USD', value: 'USD' }
    ];

    constructor(
        private financeService: FinanceService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void { this.loadRefunds(); }

    private emptyCreateForm(): CreateRefundRequest {
        return { bookingId: 0, refundAmount: 0, currency: 'NPR', reason: '' };
    }

    loadRefunds(): void {
        this.loading = true;
        this.financeService.getRefunds().subscribe({
            next: (data) => { this.refunds = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load refunds' }); }
        });
    }

    openCreateDialog(): void { this.createForm = this.emptyCreateForm(); this.showCreateDialog = true; }

    openProcessDialog(refund: Refund): void { this.processingId = refund.id; this.processForm = { transactionReference: '' }; this.showProcessDialog = true; }

    createRefund(): void {
        this.saving = true;
        this.financeService.createRefund(this.createForm).subscribe({
            next: () => { this.saving = false; this.showCreateDialog = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Refund request created' }); this.loadRefunds(); },
            error: () => { this.saving = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create refund' }); }
        });
    }

    processRefund(): void {
        if (!this.processingId) return;
        this.saving = true;
        this.financeService.processRefund(this.processingId, this.processForm).subscribe({
            next: () => { this.saving = false; this.showProcessDialog = false; this.messageService.add({ severity: 'success', summary: 'Processed', detail: 'Refund processed' }); this.loadRefunds(); },
            error: () => { this.saving = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to process' }); }
        });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status?.toLowerCase()) {
            case 'processed': return 'success';
            case 'pending': return 'warn';
            case 'rejected': return 'danger';
            default: return 'secondary';
        }
    }
}
