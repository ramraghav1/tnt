import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LeadCrmService, B2BAgent, AgentPricing } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-b2b-pricing',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        DialogModule, SelectModule, InputNumberModule, ToolbarModule, ConfirmDialogModule, DatePickerModule
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
                            <i class="pi pi-dollar text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Agent Pricing</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <div class="flex items-center gap-3">
                        <p-select [(ngModel)]="selectedAgentId" [options]="agentOptions" optionLabel="label" optionValue="value"
                                  placeholder="Select Agent" (onChange)="loadPricing()" style="width:250px" />
                        <button pButton label="Add Pricing" icon="pi pi-plus" (click)="openNew()" [disabled]="!selectedAgentId"></button>
                    </div>
                </ng-template>
            </p-toolbar>

            <p-table [value]="pricings" [paginator]="true" [rows]="10" dataKey="id" [loading]="loading" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Itinerary</th>
                        <th>Price Per Person</th>
                        <th>Currency</th>
                        <th>Valid From</th>
                        <th>Valid To</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-p>
                    <tr>
                        <td class="font-semibold">{{ p.itineraryTitle || 'Itinerary #' + p.itineraryId }}</td>
                        <td class="font-semibold">{{ p.pricePerPerson | number:'1.2-2' }}</td>
                        <td>{{ p.currency }}</td>
                        <td>{{ p.validFrom ? (p.validFrom | date:'mediumDate') : '-' }}</td>
                        <td>{{ p.validTo ? (p.validTo | date:'mediumDate') : '-' }}</td>
                        <td>
                            <button pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (click)="deletePricing(p)"></button>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="6" class="text-center py-8 text-muted-color">
                        {{ selectedAgentId ? 'No pricing entries for this agent.' : 'Select an agent to view pricing.' }}
                    </td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Pricing Dialog -->
        <p-dialog [(visible)]="pricingDialog" [style]="{ width: '450px' }" header="Add Agent Pricing" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Itinerary ID *</label>
                        <p-inputNumber [(ngModel)]="newPricing.itineraryId" [min]="1" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Price Per Person *</label>
                        <p-inputNumber [(ngModel)]="newPricing.pricePerPerson" mode="decimal" [minFractionDigits]="2" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Currency</label>
                        <p-select [(ngModel)]="newPricing.currency" [options]="currencyOptions" optionLabel="label" optionValue="value" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Valid From</label>
                            <p-datepicker [(ngModel)]="newPricing.validFrom" dateFormat="yy-mm-dd" [showIcon]="true" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Valid To</label>
                            <p-datepicker [(ngModel)]="newPricing.validTo" dateFormat="yy-mm-dd" [showIcon]="true" />
                        </div>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="pricingDialog = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="savePricing()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class B2BPricing implements OnInit {
    agents: B2BAgent[] = [];
    agentOptions: any[] = [];
    selectedAgentId: number | null = null;
    pricings: AgentPricing[] = [];
    loading = false;
    pricingDialog = false;
    newPricing: any = {};

    currencyOptions = [
        { label: 'USD', value: 'USD' }, { label: 'EUR', value: 'EUR' },
        { label: 'NPR', value: 'NPR' }, { label: 'GBP', value: 'GBP' }
    ];

    constructor(
        private leadCrmService: LeadCrmService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.leadCrmService.getAgents().subscribe({
            next: (data) => {
                this.agents = data;
                this.agentOptions = data.map(a => ({ label: a.name, value: a.id }));
            }
        });
    }

    loadPricing() {
        if (!this.selectedAgentId) return;
        this.loading = true;
        this.leadCrmService.getAgentPricing(this.selectedAgentId).subscribe({
            next: (data) => { this.pricings = data; this.loading = false; },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load pricing' }); }
        });
    }

    openNew() {
        this.newPricing = { agentId: this.selectedAgentId, currency: 'USD', pricePerPerson: 0 };
        this.pricingDialog = true;
    }

    savePricing() {
        if (!this.newPricing.itineraryId || !this.newPricing.pricePerPerson) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Itinerary ID and price required' });
            return;
        }
        this.newPricing.agentId = this.selectedAgentId;
        this.leadCrmService.createAgentPricing(this.newPricing).subscribe({
            next: () => { this.loadPricing(); this.pricingDialog = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Pricing added' }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add pricing' })
        });
    }

    deletePricing(p: AgentPricing) {
        this.confirmationService.confirm({
            message: 'Remove this pricing entry?',
            accept: () => {
                this.leadCrmService.deleteAgentPricing(p.id).subscribe({
                    next: () => { this.loadPricing(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Pricing removed' }); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove' })
                });
            }
        });
    }
}
