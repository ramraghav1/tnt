import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FluidModule } from 'primeng/fluid';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService, ConfirmationService } from 'primeng/api';

import {
    RemittanceService,
    AgentAccount,
    Agent,
    CreateAgentAccountRequest,
    UpdateAgentAccountRequest
} from '../remittance.service';

@Component({
    selector: 'app-agent-account-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        DialogModule,
        ToggleSwitchModule,
        ConfirmDialogModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        ToolbarModule,
        SelectModule,
        InputNumberModule,
        FluidModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './agent-account-list.html'
})
export class AgentAccountList implements OnInit {
    accounts: AgentAccount[] = [];
    agents: Agent[] = [];
    loading = false;
    dialogVisible = false;
    detailDialogVisible = false;
    editMode = false;
    selectedItem: any = {};
    detailItem: AgentAccount | null = null;

    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadData();
        this.loadAgents();
    }

    loadData() {
        this.loading = true;
        this.remittanceService.getAgentAccounts().subscribe({
            next: (data) => { this.accounts = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load agent accounts' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadAgents() {
        this.remittanceService.getAgents().subscribe({
            next: (data) => { this.agents = data.filter(a => a.isActive); this.cdr.detectChanges(); }
        });
    }

    openNew() {
        this.selectedItem = {
            agentId: null,
            accountName: '',
            accountNumber: '',
            bankName: '',
            bankBranch: '',
            bankDetails: '',
            currencyCode: '',
            balance: 0,
            isActive: true
        };
        this.editMode = false;
        this.dialogVisible = true;
    }

    editItem(item: AgentAccount) {
        this.selectedItem = { ...item };
        this.editMode = true;
        this.dialogVisible = true;
    }

    viewDetail(item: AgentAccount) {
        this.detailItem = item;
        this.detailDialogVisible = true;
    }

    viewStatement(item: AgentAccount) {
        this.router.navigate(['/remittance/agent-statement', item.id]);
    }

    saveItem() {
        if (this.editMode) {
            const req: UpdateAgentAccountRequest = {
                accountName: this.selectedItem.accountName,
                accountNumber: this.selectedItem.accountNumber,
                bankName: this.selectedItem.bankName,
                bankBranch: this.selectedItem.bankBranch,
                bankDetails: this.selectedItem.bankDetails,
                isActive: this.selectedItem.isActive
            };
            this.remittanceService.updateAgentAccount(this.selectedItem.id, req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Account updated' });
                    this.dialogVisible = false;
                    this.loadData();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' }); this.cdr.detectChanges(); }
            });
        } else {
            const req: CreateAgentAccountRequest = {
                agentId: this.selectedItem.agentId,
                accountName: this.selectedItem.accountName,
                accountNumber: this.selectedItem.accountNumber,
                bankName: this.selectedItem.bankName,
                bankBranch: this.selectedItem.bankBranch,
                bankDetails: this.selectedItem.bankDetails,
                currencyCode: this.selectedItem.currencyCode,
                balance: this.selectedItem.balance || 0
            };
            this.remittanceService.createAgentAccount(req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Account created' });
                    this.dialogVisible = false;
                    this.loadData();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' }); this.cdr.detectChanges(); }
            });
        }
    }

    deleteItem(item: AgentAccount) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete account "${item.accountName}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.remittanceService.deleteAgentAccount(item.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Account deleted' });
                        this.loadData();
                        this.cdr.detectChanges();
                    },
                    error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' }); this.cdr.detectChanges(); }
                });
            }
        });
    }

    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: any) {
        table.clear();
        if (this.filterInput) this.filterInput.nativeElement.value = '';
    }
}
