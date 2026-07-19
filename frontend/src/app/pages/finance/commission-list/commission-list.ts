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
import { FinanceService, Commission, CreateCommissionRequest } from '../finance.service';

@Component({
    selector: 'app-commission-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, SelectModule, DialogModule, InputNumberModule, ProgressSpinnerModule
    ],
    providers: [MessageService],
    templateUrl: './commission-list.html',
    styleUrls: ['./commission-list.scss']
})
export class CommissionList implements OnInit {
    commissions: Commission[] = [];
    loading = false;
    showDialog = false;
    saving = false;
    form: CreateCommissionRequest = this.emptyForm();

    currencyOptions = [
        { label: 'NPR', value: 'NPR' },
        { label: 'USD', value: 'USD' }
    ];

    constructor(
        private financeService: FinanceService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void { this.loadCommissions(); }

    private emptyForm(): CreateCommissionRequest {
        return { bookingId: 0, agentName: '', commissionRate: 0, commissionAmount: 0, currency: 'NPR' };
    }

    loadCommissions(): void {
        this.loading = true;
        this.financeService.getCommissions().subscribe({
            next: (data) => { this.commissions = data; this.loading = false; this.cdr.detectChanges(); },
            error: (err) => { console.error(err); this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load commissions' }); }
        });
    }

    openAddDialog(): void { this.form = this.emptyForm(); this.showDialog = true; }

    saveCommission(): void {
        this.saving = true;
        this.financeService.createCommission(this.form).subscribe({
            next: () => { this.saving = false; this.showDialog = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Commission recorded' }); this.loadCommissions(); },
            error: () => { this.saving = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save' }); }
        });
    }

    updateStatus(commission: Commission, status: string): void {
        this.financeService.updateCommissionStatus(commission.id, status).subscribe({
            next: () => { commission.status = status; this.cdr.detectChanges(); this.messageService.add({ severity: 'success', summary: 'Updated', detail: `Status: ${status}` }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
        });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status?.toLowerCase()) {
            case 'paid': return 'success';
            case 'pending': return 'warn';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    }
}
