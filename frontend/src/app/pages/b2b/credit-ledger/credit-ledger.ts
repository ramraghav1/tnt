import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { LeadCrmService, B2BAgent, LedgerEntry } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-credit-ledger',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        TagModule, DialogModule, SelectModule, InputNumberModule, TextareaModule, ToolbarModule, DividerModule
    ],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <p-toolbar styleClass="mb-6 gap-2">
                <ng-template #start>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-wallet text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Credit Ledger</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <div class="flex items-center gap-3">
                        <p-select [(ngModel)]="selectedAgentId" [options]="agentOptions" optionLabel="label" optionValue="value"
                                  placeholder="Select Agent" (onChange)="loadLedger()" style="width:250px" />
                        <button pButton label="New Entry" icon="pi pi-plus" (click)="openNew()" [disabled]="!selectedAgentId"></button>
                    </div>
                </ng-template>
            </p-toolbar>

            <!-- Agent Balance Summary -->
            <div *ngIf="selectedAgent" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div class="text-sm text-muted-color">Credit Limit</div>
                    <div class="text-2xl font-bold">{{ selectedAgent.creditLimit | number:'1.2-2' }}</div>
                </div>
                <div class="rounded-xl p-4" [class]="selectedAgent.creditBalance >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
                    <div class="text-sm text-muted-color">Current Balance</div>
                    <div class="text-2xl font-bold" [class]="selectedAgent.creditBalance < 0 ? 'text-red-500' : ''">{{ selectedAgent.creditBalance | number:'1.2-2' }}</div>
                </div>
                <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                    <div class="text-sm text-muted-color">Total Transactions</div>
                    <div class="text-2xl font-bold">{{ ledgerEntries.length }}</div>
                </div>
            </div>

            <p-table [value]="ledgerEntries" [paginator]="true" [rows]="15" dataKey="id" [loading]="loading" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="createdAt">Date <p-sortIcon field="createdAt" /></th>
                        <th pSortableColumn="transactionType">Type <p-sortIcon field="transactionType" /></th>
                        <th pSortableColumn="amount">Amount <p-sortIcon field="amount" /></th>
                        <th>Reference</th>
                        <th>Description</th>
                        <th pSortableColumn="balanceAfter">Balance After <p-sortIcon field="balanceAfter" /></th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-e>
                    <tr>
                        <td>{{ e.createdAt | date:'medium' }}</td>
                        <td>
                            <p-tag [value]="e.transactionType"
                                   [severity]="e.transactionType === 'Credit' ? 'success' : e.transactionType === 'Debit' ? 'danger' : 'info'" />
                        </td>
                        <td [class]="e.transactionType === 'Credit' ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'">
                            {{ e.transactionType === 'Credit' ? '+' : '-' }}{{ e.amount | number:'1.2-2' }}
                        </td>
                        <td class="font-mono text-sm">{{ e.reference || '-' }}</td>
                        <td>{{ e.description || '-' }}</td>
                        <td class="font-semibold">{{ e.balanceAfter | number:'1.2-2' }}</td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="6" class="text-center py-8 text-muted-color">
                        {{ selectedAgentId ? 'No ledger entries.' : 'Select an agent to view ledger.' }}
                    </td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Ledger Entry Dialog -->
        <p-dialog [(visible)]="entryDialog" [style]="{ width: '450px' }" header="New Ledger Entry" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Transaction Type *</label>
                        <p-select [(ngModel)]="newEntry.transactionType" [options]="typeOptions" optionLabel="label" optionValue="value" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Amount *</label>
                        <p-inputNumber [(ngModel)]="newEntry.amount" mode="decimal" [minFractionDigits]="2" [min]="0.01" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Reference</label>
                        <input pInputText [(ngModel)]="newEntry.reference" placeholder="Invoice or booking ref" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Description</label>
                        <textarea pTextarea [(ngModel)]="newEntry.description" rows="2"></textarea>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="entryDialog = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="saveEntry()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class CreditLedger implements OnInit {
    agents: B2BAgent[] = [];
    agentOptions: any[] = [];
    selectedAgentId: number | null = null;
    selectedAgent: B2BAgent | null = null;
    ledgerEntries: LedgerEntry[] = [];
    loading = false;
    entryDialog = false;
    newEntry: any = {};

    typeOptions = [
        { label: 'Credit (Payment Received)', value: 'Credit' },
        { label: 'Debit (Booking Charge)', value: 'Debit' },
        { label: 'Adjustment', value: 'Adjustment' }
    ];

    constructor(private leadCrmService: LeadCrmService, private messageService: MessageService) {}

    ngOnInit() {
        this.leadCrmService.getAgents().subscribe({
            next: (data) => {
                this.agents = data;
                this.agentOptions = data.map(a => ({ label: `${a.name} (Bal: ${a.creditBalance})`, value: a.id }));
            }
        });
    }

    loadLedger() {
        if (!this.selectedAgentId) return;
        this.selectedAgent = this.agents.find(a => a.id === this.selectedAgentId) || null;
        this.loading = true;
        this.leadCrmService.getAgentLedger(this.selectedAgentId).subscribe({
            next: (data) => { this.ledgerEntries = data; this.loading = false; },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load ledger' }); }
        });
    }

    openNew() {
        this.newEntry = { agentId: this.selectedAgentId, transactionType: 'Credit', amount: 0 };
        this.entryDialog = true;
    }

    saveEntry() {
        if (!this.newEntry.amount || this.newEntry.amount <= 0) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Amount must be greater than 0' });
            return;
        }
        this.newEntry.agentId = this.selectedAgentId;
        this.leadCrmService.createLedgerEntry(this.newEntry).subscribe({
            next: () => {
                this.loadLedger();
                // Refresh agent data to update balance
                this.leadCrmService.getAgents().subscribe(data => {
                    this.agents = data;
                    this.selectedAgent = data.find(a => a.id === this.selectedAgentId) || null;
                    this.agentOptions = data.map(a => ({ label: `${a.name} (Bal: ${a.creditBalance})`, value: a.id }));
                });
                this.entryDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Entry recorded' });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to record entry' })
        });
    }
}
