import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FluidModule } from 'primeng/fluid';
import { MessageService } from 'primeng/api';

import {
    RemittanceService,
    Voucher,
    CreateVoucherRequest,
    Agent,
    AgentAccount,
    Branch
} from '../remittance.service';

@Component({
    selector: 'app-voucher-list',
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
        FluidModule
    ],
    providers: [MessageService],
    templateUrl: './voucher-list.html'
})
export class VoucherList implements OnInit {
    vouchers: Voucher[] = [];
    loading = false;
    dialogVisible = false;

    agents: Agent[] = [];
    agentAccounts: (AgentAccount & { accountLabel?: string })[] = [];
    branches: Branch[] = [];
    selectedAgentForBranch: number | null = null;

    newVoucher: any = {};

    entityTypes = [
        { label: 'Agent', value: 'AGENT' },
        { label: 'Branch', value: 'BRANCH' }
    ];

    modes = [
        { label: 'Credit (CR)', value: 'CR' },
        { label: 'Debit (DR)', value: 'DR' }
    ];

    referenceTypes = [
        { label: 'Deposit', value: 'DEPOSIT' },
        { label: 'Withdrawal', value: 'WITHDRAWAL' },
        { label: 'Adjustment', value: 'ADJUSTMENT' }
    ];

    constructor(
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadVouchers();
        this.remittanceService.getAgents().subscribe(agents => {
            this.agents = agents;
            this.cdr.detectChanges();
        });
    }

    loadVouchers() {
        this.loading = true;
        this.remittanceService.getVouchers().subscribe({
            next: (data) => {
                this.vouchers = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load vouchers' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    openNew() {
        this.newVoucher = {
            entityType: null,
            agentId: null,
            branchId: null,
            agentAccountId: null,
            amount: null,
            mode: null,
            referenceType: null,
            description: ''
        };
        this.agentAccounts = [];
        this.branches = [];
        this.selectedAgentForBranch = null;
        this.dialogVisible = true;
    }

    onEntityTypeChange() {
        this.newVoucher.agentId = null;
        this.newVoucher.branchId = null;
        this.newVoucher.agentAccountId = null;
        this.agentAccounts = [];
        this.branches = [];
        this.selectedAgentForBranch = null;
    }

    onAgentChange() {
        this.agentAccounts = [];
        this.newVoucher.agentAccountId = null;
        if (this.newVoucher.agentId) {
            this.remittanceService.getAgentAccountsByAgent(this.newVoucher.agentId).subscribe(accounts => {
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
        this.newVoucher.branchId = null;
        if (this.selectedAgentForBranch) {
            this.newVoucher.agentId = this.selectedAgentForBranch;
            this.remittanceService.getBranchesByAgent(this.selectedAgentForBranch).subscribe(branches => {
                this.branches = branches;
                this.cdr.detectChanges();
            });
        }
    }

    isFormValid(): boolean {
        if (!this.newVoucher.entityType || !this.newVoucher.mode || !this.newVoucher.amount || !this.newVoucher.referenceType) {
            return false;
        }
        if (this.newVoucher.entityType === 'AGENT' && !this.newVoucher.agentAccountId) return false;
        if (this.newVoucher.entityType === 'BRANCH' && !this.newVoucher.branchId) return false;
        return true;
    }

    submitVoucher() {
        const req: CreateVoucherRequest = {
            entityType: this.newVoucher.entityType,
            agentId: this.newVoucher.agentId,
            branchId: this.newVoucher.branchId,
            agentAccountId: this.newVoucher.agentAccountId,
            amount: this.newVoucher.amount,
            mode: this.newVoucher.mode,
            referenceType: this.newVoucher.referenceType,
            description: this.newVoucher.description || undefined,
            createdBy: 'admin'
        };

        this.remittanceService.postVoucher(req).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Voucher created successfully' });
                this.dialogVisible = false;
                this.loadVouchers();
                this.cdr.detectChanges();
            },
            error: (err) => {
                const msg = err.error?.message || 'Failed to create voucher';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
                this.cdr.detectChanges();
            }
        });
    }
}
