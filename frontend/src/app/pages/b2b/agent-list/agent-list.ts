import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LeadCrmService, B2BAgent } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-b2b-agent-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        TagModule, DialogModule, SelectModule, InputNumberModule, TextareaModule, ToolbarModule,
        ConfirmDialogModule, IconFieldModule, InputIconModule, TooltipModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />

        <div class="card">
            <p-toolbar styleClass="mb-6 gap-2">
                <ng-template #start>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-users text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">B2B Agents</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Agent" icon="pi pi-plus" (click)="openNew()"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="agents" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5,10,25]"
                     [globalFilterFields]="['name','contactPerson','email','country','region','status']"
                     dataKey="id" [loading]="loading" responsiveLayout="scroll">
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search agents..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name" style="min-width:12rem">Agent Name <p-sortIcon field="name" /></th>
                        <th>Contact Person</th>
                        <th>Email</th>
                        <th pSortableColumn="country">Country <p-sortIcon field="country" /></th>
                        <th pSortableColumn="commissionRate">Commission % <p-sortIcon field="commissionRate" /></th>
                        <th pSortableColumn="creditLimit">Credit Limit <p-sortIcon field="creditLimit" /></th>
                        <th pSortableColumn="creditBalance">Balance <p-sortIcon field="creditBalance" /></th>
                        <th pSortableColumn="totalBookings">Bookings <p-sortIcon field="totalBookings" /></th>
                        <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-a>
                    <tr>
                        <td class="font-semibold">{{ a.name }}</td>
                        <td>{{ a.contactPerson || '-' }}</td>
                        <td>{{ a.email || '-' }}</td>
                        <td>{{ a.country || '-' }} {{ a.region ? '(' + a.region + ')' : '' }}</td>
                        <td>{{ a.commissionRate }}%</td>
                        <td>{{ a.creditLimit | number:'1.2-2' }}</td>
                        <td [class]="a.creditBalance < 0 ? 'text-red-500 font-semibold' : 'font-semibold'">{{ a.creditBalance | number:'1.2-2' }}</td>
                        <td>{{ a.totalBookings }}</td>
                        <td><p-tag [value]="a.status" [severity]="a.status === 'Active' ? 'success' : a.status === 'Suspended' ? 'danger' : 'secondary'" /></td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-ban" [rounded]="true" [text]="true" severity="danger"
                                        (click)="toggleStatus(a)" pTooltip="Suspend" *ngIf="a.status === 'Active'"></button>
                                <button pButton icon="pi pi-check" [rounded]="true" [text]="true" severity="success"
                                        (click)="toggleStatus(a)" pTooltip="Activate" *ngIf="a.status !== 'Active'"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="10" class="text-center py-8 text-muted-color">No agents found.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Agent Dialog -->
        <p-dialog [(visible)]="agentDialog" [style]="{ width: '550px' }" header="New B2B Agent" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Agent / Company Name *</label>
                        <input pInputText [(ngModel)]="newAgent.name" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Contact Person</label>
                            <input pInputText [(ngModel)]="newAgent.contactPerson" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Email</label>
                            <input pInputText [(ngModel)]="newAgent.email" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Phone</label>
                            <input pInputText [(ngModel)]="newAgent.phone" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Country</label>
                            <input pInputText [(ngModel)]="newAgent.country" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Region</label>
                            <input pInputText [(ngModel)]="newAgent.region" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Commission Rate (%)</label>
                            <p-inputNumber [(ngModel)]="newAgent.commissionRate" [min]="0" [max]="100" suffix="%" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Credit Limit</label>
                        <p-inputNumber [(ngModel)]="newAgent.creditLimit" mode="decimal" [minFractionDigits]="2" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Notes</label>
                        <textarea pTextarea [(ngModel)]="newAgent.notes" rows="3"></textarea>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="agentDialog = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="saveAgent()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class B2BAgentList implements OnInit {
    agents: B2BAgent[] = [];
    loading = true;
    agentDialog = false;
    newAgent: any = {};

    constructor(
        private leadCrmService: LeadCrmService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() { this.loadAgents(); }

    loadAgents() {
        this.loading = true;
        this.leadCrmService.getAgents().subscribe({
            next: (data) => { this.agents = data; this.loading = false; },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load agents' }); }
        });
    }

    openNew() {
        this.newAgent = { commissionRate: 10, creditLimit: 0 };
        this.agentDialog = true;
    }

    saveAgent() {
        if (!this.newAgent.name?.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Agent name is required' });
            return;
        }
        this.leadCrmService.createAgent(this.newAgent).subscribe({
            next: () => { this.loadAgents(); this.agentDialog = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Agent created' }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create agent' })
        });
    }

    toggleStatus(a: B2BAgent) {
        const newStatus = a.status === 'Active' ? 'Suspended' : 'Active';
        this.leadCrmService.updateAgentStatus(a.id, newStatus).subscribe({
            next: () => { this.loadAgents(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Status updated' }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
