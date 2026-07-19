import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { FinanceService, FinanceSummary as FinanceSummaryData } from '../finance.service';

@Component({
    selector: 'app-finance-summary',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, ToastModule, ProgressSpinnerModule],
    providers: [MessageService],
    templateUrl: './finance-summary.html',
    styleUrls: ['./finance-summary.scss']
})
export class FinanceSummary implements OnInit {
    summary: FinanceSummaryData | null = null;
    loading = false;

    constructor(
        private financeService: FinanceService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadSummary();
    }

    loadSummary(): void {
        this.loading = true;
        this.financeService.getSummary().subscribe({
            next: (data) => { this.summary = data; this.loading = false; },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load finance summary' });
            }
        });
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount);
    }
}
