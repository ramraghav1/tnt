import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { LeadCrmService, B2BAgent, LedgerEntry } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-agent-bookings',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule, SelectModule, ToolbarModule, CardModule],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <p-toolbar styleClass="mb-6 gap-2">
                <ng-template #start>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-briefcase text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Agent Bookings</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <p-select [(ngModel)]="selectedAgentId" [options]="agentOptions" optionLabel="label" optionValue="value"
                              placeholder="Select Agent" (onChange)="onAgentChange()" style="width:250px" />
                </ng-template>
            </p-toolbar>

            <!-- Agent Summary -->
            <div *ngIf="selectedAgent" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div class="text-sm text-muted-color">Agent</div>
                    <div class="text-lg font-bold">{{ selectedAgent.name }}</div>
                    <div class="text-xs text-muted-color mt-1">{{ selectedAgent.country }} {{ selectedAgent.region ? '(' + selectedAgent.region + ')' : '' }}</div>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <div class="text-sm text-muted-color">Total Bookings</div>
                    <div class="text-3xl font-bold">{{ selectedAgent.totalBookings }}</div>
                </div>
                <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                    <div class="text-sm text-muted-color">Commission Rate</div>
                    <div class="text-3xl font-bold">{{ selectedAgent.commissionRate }}%</div>
                </div>
                <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                    <div class="text-sm text-muted-color">Credit Balance</div>
                    <div class="text-3xl font-bold" [class]="selectedAgent.creditBalance < 0 ? 'text-red-500' : ''">{{ selectedAgent.creditBalance | number:'1.2-2' }}</div>
                </div>
            </div>

            <!-- Booking Transactions (from Ledger) -->
            <h3 *ngIf="selectedAgent" class="text-lg font-semibold mb-4">Booking Transactions (Debits)</h3>
            <p-table [value]="bookingEntries" [paginator]="true" [rows]="10" dataKey="id" [loading]="loading" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="createdAt">Date <p-sortIcon field="createdAt" /></th>
                        <th>Reference</th>
                        <th>Description</th>
                        <th pSortableColumn="amount">Amount <p-sortIcon field="amount" /></th>
                        <th>Balance After</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-e>
                    <tr>
                        <td>{{ e.createdAt | date:'mediumDate' }}</td>
                        <td class="font-mono">{{ e.reference || '-' }}</td>
                        <td>{{ e.description || '-' }}</td>
                        <td class="font-semibold text-red-500">-{{ e.amount | number:'1.2-2' }}</td>
                        <td class="font-semibold">{{ e.balanceAfter | number:'1.2-2' }}</td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="5" class="text-center py-8 text-muted-color">
                        {{ selectedAgentId ? 'No booking transactions found.' : 'Select an agent to view bookings.' }}
                    </td></tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class AgentBookings implements OnInit {
    agents: B2BAgent[] = [];
    agentOptions: any[] = [];
    selectedAgentId: number | null = null;
    selectedAgent: B2BAgent | null = null;
    bookingEntries: LedgerEntry[] = [];
    loading = false;

    constructor(private leadCrmService: LeadCrmService, private messageService: MessageService) {}

    ngOnInit() {
        this.leadCrmService.getAgents().subscribe({
            next: (data) => {
                this.agents = data;
                this.agentOptions = data.map(a => ({ label: `${a.name} (${a.totalBookings} bookings)`, value: a.id }));
            }
        });
    }

    onAgentChange() {
        if (!this.selectedAgentId) { this.selectedAgent = null; this.bookingEntries = []; return; }
        this.selectedAgent = this.agents.find(a => a.id === this.selectedAgentId) || null;
        this.loading = true;
        this.leadCrmService.getAgentLedger(this.selectedAgentId).subscribe({
            next: (data) => {
                this.bookingEntries = data.filter(e => e.transactionType === 'Debit');
                this.loading = false;
            },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' }); }
        });
    }
}
