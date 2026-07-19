import { Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { RemittanceService, TransactionDetail } from '../remittance.service';

@Component({
    selector: 'app-transaction-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        TooltipModule,
        IconFieldModule,
        InputIconModule,
        ToolbarModule,
        TagModule
    ],
    providers: [MessageService],
    templateUrl: './transaction-report.html',
    styleUrls: ['./transaction-report.scss']
})
export class TransactionReport {
    @ViewChild('dt') dt!: Table;
    @ViewChild('filterInput') filterInput!: ElementRef;

    fromDate: string = '';
    toDate: string = '';
    transactions: TransactionDetail[] = [];
    loading = false;

    constructor(
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    fetchTransactions() {
        this.loading = true;
        this.remittanceService.getTransactions(this.fromDate, this.toDate).subscribe({
            next: (data) => {
                this.transactions = data;
                this.loading = false;
                this.messageService.add({ severity: 'success', summary: 'Loaded', detail: `${data.length} transactions found` });
                this.cdr.detectChanges();
            },
            error: () => {
                this.transactions = [];
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load transactions' });
                this.cdr.detectChanges();
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table) {
        table.clear();
        if (this.filterInput) this.filterInput.nativeElement.value = '';
    }
}
