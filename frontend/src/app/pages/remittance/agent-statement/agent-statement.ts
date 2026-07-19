import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { FluidModule } from 'primeng/fluid';
import { MessageService } from 'primeng/api';

import {
    RemittanceService,
    StatementResponse,
    AgentLedgerEntry,
    CreateLedgerEntryRequest
} from '../remittance.service';

@Component({
    selector: 'app-agent-statement',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        DialogModule,
        TagModule,
        ToolbarModule,
        SelectModule,
        InputNumberModule,
        DatePickerModule,
        CardModule,
        FluidModule
    ],
    providers: [MessageService],
    templateUrl: './agent-statement.html'
})
export class AgentStatement implements OnInit {
    agentAccountId!: number;
    statement: StatementResponse | null = null;
    loading = false;

    fromDate: Date | null = null;
    toDate: Date | null = null;

    // Post entry dialog
    postDialogVisible = false;
    newEntry: any = {};

    transactionTypes = [
        { label: 'Credit', value: 'CREDIT' },
        { label: 'Debit', value: 'DEBIT' }
    ];

    referenceTypes = [
        { label: 'Deposit', value: 'DEPOSIT' },
        { label: 'Adjustment', value: 'ADJUSTMENT' },
        { label: 'Send', value: 'SEND' },
        { label: 'Payout', value: 'PAYOUT' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.agentAccountId = +this.route.snapshot.paramMap.get('accountId')!;
        this.loadStatement();
    }

    loadStatement() {
        this.loading = true;
        const from = this.fromDate ? this.formatDate(this.fromDate) : undefined;
        const to = this.toDate ? this.formatDate(this.toDate) : undefined;

        this.remittanceService.getStatement(this.agentAccountId, from, to).subscribe({
            next: (data) => {
                this.statement = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load statement' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    applyFilter() {
        this.loadStatement();
    }

    clearFilter() {
        this.fromDate = null;
        this.toDate = null;
        this.loadStatement();
    }

    openPostEntry() {
        this.newEntry = {
            agentAccountId: this.agentAccountId,
            transactionType: null,
            amount: null,
            referenceType: null,
            referenceId: '',
            description: '',
            createdBy: ''
        };
        this.postDialogVisible = true;
    }

    postEntry() {
        const req: CreateLedgerEntryRequest = {
            agentAccountId: this.agentAccountId,
            transactionType: this.newEntry.transactionType,
            amount: this.newEntry.amount,
            referenceType: this.newEntry.referenceType,
            referenceId: this.newEntry.referenceId || undefined,
            description: this.newEntry.description || undefined,
            createdBy: this.newEntry.createdBy || undefined
        };
        this.remittanceService.postLedgerEntry(req).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Entry posted' });
                this.postDialogVisible = false;
                this.loadStatement();
                this.cdr.detectChanges();
            },
            error: (err) => {
                const msg = err.error?.message || 'Failed to post entry';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
                this.cdr.detectChanges();
            }
        });
    }

    goBack() {
        this.router.navigate(['/remittance/agent-accounts']);
    }

    printStatement() {
        window.print();
    }

    private formatDate(d: Date): string {
        return d.toISOString().split('T')[0];
    }
}
