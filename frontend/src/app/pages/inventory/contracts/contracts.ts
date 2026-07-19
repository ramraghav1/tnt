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
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LeadCrmService, SupplierContract } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-contract-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        TagModule, DialogModule, SelectModule, InputNumberModule, TextareaModule, ToolbarModule,
        ConfirmDialogModule, IconFieldModule, InputIconModule, DatePickerModule, TooltipModule
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
                            <i class="pi pi-file text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Supplier Contracts</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Contract" icon="pi pi-plus" (click)="openNew()"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="contracts" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5,10,25]"
                     [globalFilterFields]="['supplierName','supplierType','contractNumber','status','rateType']"
                     dataKey="id" [loading]="loading" responsiveLayout="scroll">
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search contracts..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="supplierName" style="min-width:12rem">Supplier <p-sortIcon field="supplierName" /></th>
                        <th pSortableColumn="supplierType" style="min-width:8rem">Type <p-sortIcon field="supplierType" /></th>
                        <th>Contract #</th>
                        <th pSortableColumn="startDate">Start <p-sortIcon field="startDate" /></th>
                        <th pSortableColumn="endDate">End <p-sortIcon field="endDate" /></th>
                        <th>Rate</th>
                        <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-c>
                    <tr>
                        <td class="font-semibold">{{ c.supplierName }}</td>
                        <td><p-tag [value]="c.supplierType" severity="info" /></td>
                        <td class="font-mono">{{ c.contractNumber || '-' }}</td>
                        <td>{{ c.startDate | date:'mediumDate' }}</td>
                        <td [class]="isExpired(c.endDate) ? 'text-red-500 font-semibold' : ''">{{ c.endDate | date:'mediumDate' }}</td>
                        <td>{{ c.baseRate | number:'1.2-2' }} {{ c.currency }} ({{ c.rateType }})</td>
                        <td><p-tag [value]="c.status" [severity]="getStatusSeverity(c.status)" /></td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-ban" [rounded]="true" [text]="true" severity="danger"
                                        (click)="updateStatus(c, 'Terminated')" pTooltip="Terminate" *ngIf="c.status === 'Active'"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="8" class="text-center py-8 text-muted-color">No contracts found.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Contract Dialog -->
        <p-dialog [(visible)]="contractDialog" [style]="{ width: '550px' }" header="New Supplier Contract" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Supplier Type *</label>
                            <p-select [(ngModel)]="newContract.supplierType" [options]="supplierTypeOptions" optionLabel="label" optionValue="value" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Supplier ID *</label>
                            <p-inputNumber [(ngModel)]="newContract.supplierId" [min]="1" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Supplier Name *</label>
                        <input pInputText [(ngModel)]="newContract.supplierName" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Contract Number</label>
                        <input pInputText [(ngModel)]="newContract.contractNumber" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Start Date *</label>
                            <p-datepicker [(ngModel)]="newContract.startDate" dateFormat="yy-mm-dd" [showIcon]="true" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">End Date *</label>
                            <p-datepicker [(ngModel)]="newContract.endDate" dateFormat="yy-mm-dd" [showIcon]="true" />
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Rate Type</label>
                            <p-select [(ngModel)]="newContract.rateType" [options]="rateTypeOptions" optionLabel="label" optionValue="value" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Base Rate</label>
                            <p-inputNumber [(ngModel)]="newContract.baseRate" mode="decimal" [minFractionDigits]="2" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Currency</label>
                            <p-select [(ngModel)]="newContract.currency" [options]="currencyOptions" optionLabel="label" optionValue="value" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Terms</label>
                        <textarea pTextarea [(ngModel)]="newContract.terms" rows="3"></textarea>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="contractDialog = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="saveContract()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class ContractList implements OnInit {
    contracts: SupplierContract[] = [];
    loading = true;
    contractDialog = false;
    newContract: any = {};

    supplierTypeOptions = [
        { label: 'Hotel', value: 'Hotel' }, { label: 'Transport', value: 'Transport' },
        { label: 'Activity', value: 'Activity' }, { label: 'Airline', value: 'Airline' }, { label: 'Other', value: 'Other' }
    ];

    rateTypeOptions = [
        { label: 'Per Night', value: 'PerNight' }, { label: 'Per Person', value: 'PerPerson' },
        { label: 'Per Trip', value: 'PerTrip' }, { label: 'Per Day', value: 'PerDay' }, { label: 'Flat', value: 'Flat' }
    ];

    currencyOptions = [
        { label: 'USD', value: 'USD' }, { label: 'EUR', value: 'EUR' },
        { label: 'NPR', value: 'NPR' }, { label: 'GBP', value: 'GBP' }
    ];

    constructor(
        private leadCrmService: LeadCrmService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() { this.loadContracts(); }

    loadContracts() {
        this.loading = true;
        this.leadCrmService.getContracts().subscribe({
            next: (data) => { this.contracts = data; this.loading = false; },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load contracts' }); }
        });
    }

    openNew() {
        this.newContract = { supplierType: 'Hotel', rateType: 'PerNight', currency: 'USD', baseRate: 0 };
        this.contractDialog = true;
    }

    saveContract() {
        if (!this.newContract.supplierName?.trim() || !this.newContract.supplierId) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Supplier name and ID required' });
            return;
        }
        this.leadCrmService.createContract(this.newContract).subscribe({
            next: () => { this.loadContracts(); this.contractDialog = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contract created' }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create contract' })
        });
    }

    updateStatus(c: SupplierContract, status: string) {
        this.confirmationService.confirm({
            message: `Terminate contract for "${c.supplierName}"?`,
            accept: () => {
                this.leadCrmService.updateContractStatus(c.id, status).subscribe({
                    next: () => { this.loadContracts(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contract terminated' }); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
                });
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    isExpired(date: string): boolean { return new Date(date) < new Date(); }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'Active': return 'success';
            case 'Expired': return 'warn';
            case 'Terminated': return 'danger';
            case 'Draft': return 'secondary';
            default: return 'secondary';
        }
    }
}
