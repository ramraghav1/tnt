import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { FluidModule } from 'primeng/fluid';
import { MessageService } from 'primeng/api';

import {
    RemittanceService,
    AccountStatementResponse,
    Agent,
    AgentAccount,
    Branch
} from '../remittance.service';

@Component({
    selector: 'app-statement-of-account',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        TagModule,
        SelectModule,
        DatePickerModule,
        CardModule,
        FluidModule
    ],
    providers: [MessageService],
    templateUrl: './statement-of-account.html'
})
export class StatementOfAccount implements OnInit {
    entityType: string | null = null;
    selectedAgentId: number | null = null;
    selectedAccountId: number | null = null;
    selectedBranchId: number | null = null;
    fromDate: Date | null = null;
    toDate: Date | null = null;

    agents: Agent[] = [];
    agentAccounts: (AgentAccount & { accountLabel?: string })[] = [];
    branches: Branch[] = [];

    statement: AccountStatementResponse | null = null;
    loading = false;

    entityTypes = [
        { label: 'Agent', value: 'AGENT' },
        { label: 'Branch', value: 'BRANCH' }
    ];

    constructor(
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.remittanceService.getAgents().subscribe(agents => {
            this.agents = agents;
            this.cdr.detectChanges();
        });
    }

    onEntityTypeChange() {
        this.selectedAgentId = null;
        this.selectedAccountId = null;
        this.selectedBranchId = null;
        this.agentAccounts = [];
        this.branches = [];
        this.statement = null;
    }

    onAgentChange() {
        this.agentAccounts = [];
        this.selectedAccountId = null;
        if (this.selectedAgentId && this.entityType === 'AGENT') {
            this.remittanceService.getAgentAccountsByAgent(this.selectedAgentId).subscribe(accounts => {
                this.agentAccounts = accounts.map(a => ({
                    ...a,
                    accountLabel: `${a.currencyCode} - ${a.accountName || 'Default'} (Bal: ${a.balance})`
                }));
                this.cdr.detectChanges();
            });
        }
    }

    loadBranches() {
        this.branches = [];
        this.selectedBranchId = null;
        if (this.selectedAgentId) {
            this.remittanceService.getBranchesByAgent(this.selectedAgentId).subscribe(branches => {
                this.branches = branches;
                this.cdr.detectChanges();
            });
        }
    }

    canLoad(): boolean {
        if (!this.entityType) return false;
        if (this.entityType === 'AGENT' && !this.selectedAccountId) return false;
        if (this.entityType === 'BRANCH' && !this.selectedBranchId) return false;
        return true;
    }

    loadStatement() {
        if (!this.canLoad()) return;

        this.loading = true;
        const from = this.fromDate ? this.formatDate(this.fromDate) : undefined;
        const to = this.toDate ? this.formatDate(this.toDate) : undefined;

        this.remittanceService.getAccountStatement(
            this.entityType!,
            this.selectedAgentId ?? undefined,
            this.selectedBranchId ?? undefined,
            this.selectedAccountId ?? undefined,
            from, to
        ).subscribe({
            next: (data) => {
                this.statement = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                const msg = err.error?.message || 'Failed to load statement';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    clearFilter() {
        this.entityType = null;
        this.selectedAgentId = null;
        this.selectedAccountId = null;
        this.selectedBranchId = null;
        this.fromDate = null;
        this.toDate = null;
        this.agentAccounts = [];
        this.branches = [];
        this.statement = null;
    }

    private formatDate(d: Date): string {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
