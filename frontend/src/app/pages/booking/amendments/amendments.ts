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
import { LeadCrmService, Amendment } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-amendment-list',
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
                            <i class="pi pi-file-edit text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Booking Amendments</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Amendment" icon="pi pi-plus" (click)="openNew()"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="amendments" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5,10,25]"
                     [globalFilterFields]="['bookingReference','amendmentType','description','status','requestedBy']"
                     dataKey="id" [loading]="loading" responsiveLayout="scroll">
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search amendments..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="bookingReference" style="min-width:10rem">Booking Ref <p-sortIcon field="bookingReference" /></th>
                        <th pSortableColumn="amendmentType" style="min-width:10rem">Type <p-sortIcon field="amendmentType" /></th>
                        <th style="min-width:14rem">Description</th>
                        <th style="min-width:8rem">Old Value</th>
                        <th style="min-width:8rem">New Value</th>
                        <th pSortableColumn="status" style="min-width:8rem">Status <p-sortIcon field="status" /></th>
                        <th pSortableColumn="feeAmount" style="min-width:7rem">Fee <p-sortIcon field="feeAmount" /></th>
                        <th pSortableColumn="createdAt" style="min-width:10rem">Requested <p-sortIcon field="createdAt" /></th>
                        <th style="min-width:10rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-a>
                    <tr>
                        <td class="font-semibold">{{ a.bookingReference || '#' + a.bookingInstanceId }}</td>
                        <td><p-tag [value]="a.amendmentType" severity="info" /></td>
                        <td>{{ a.description }}</td>
                        <td class="text-muted-color">{{ a.oldValue || '-' }}</td>
                        <td class="font-semibold">{{ a.newValue || '-' }}</td>
                        <td><p-tag [value]="a.status" [severity]="getStatusSeverity(a.status)" /></td>
                        <td>{{ a.feeAmount > 0 ? (a.feeAmount | number:'1.2-2') : '-' }}</td>
                        <td>{{ a.createdAt | date:'mediumDate' }}</td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-check" [rounded]="true" [text]="true" severity="success"
                                        (click)="updateStatus(a, 'Approved')" pTooltip="Approve" *ngIf="a.status === 'Pending'"></button>
                                <button pButton icon="pi pi-times" [rounded]="true" [text]="true" severity="danger"
                                        (click)="updateStatus(a, 'Rejected')" pTooltip="Reject" *ngIf="a.status === 'Pending'"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="9" class="text-center py-8 text-muted-color">No amendments found.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Amendment Dialog -->
        <p-dialog [(visible)]="amendDialog" [style]="{ width: '500px' }" header="New Amendment" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Booking Instance ID *</label>
                        <p-inputNumber [(ngModel)]="newAmendment.bookingInstanceId" [min]="1" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Amendment Type *</label>
                        <p-select [(ngModel)]="newAmendment.amendmentType" [options]="typeOptions" optionLabel="label" optionValue="value" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Description *</label>
                        <textarea pTextarea [(ngModel)]="newAmendment.description" rows="3"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Old Value</label>
                            <input pInputText [(ngModel)]="newAmendment.oldValue" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">New Value</label>
                            <input pInputText [(ngModel)]="newAmendment.newValue" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Fee Amount</label>
                        <p-inputNumber [(ngModel)]="newAmendment.feeAmount" mode="decimal" [minFractionDigits]="2" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Requested By</label>
                        <input pInputText [(ngModel)]="newAmendment.requestedBy" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="amendDialog = false"></button>
                <button pButton label="Submit" icon="pi pi-check" (click)="saveAmendment()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class AmendmentList implements OnInit {
    amendments: Amendment[] = [];
    loading = true;
    amendDialog = false;
    newAmendment: any = {};

    typeOptions = [
        { label: 'Date Change', value: 'DateChange' },
        { label: 'Name Change', value: 'NameChange' },
        { label: 'Pax Change', value: 'PaxChange' },
        { label: 'Service Change', value: 'ServiceChange' },
        { label: 'Cancellation', value: 'Cancellation' },
        { label: 'Other', value: 'Other' }
    ];

    constructor(
        private leadCrmService: LeadCrmService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadAmendments();
    }

    loadAmendments() {
        this.loading = true;
        this.leadCrmService.getAmendments().subscribe({
            next: (data) => { this.amendments = data; this.loading = false; },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load amendments' }); }
        });
    }

    openNew() {
        this.newAmendment = { amendmentType: 'DateChange', feeAmount: 0 };
        this.amendDialog = true;
    }

    saveAmendment() {
        if (!this.newAmendment.bookingInstanceId || !this.newAmendment.description?.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Booking ID and description required' });
            return;
        }
        this.leadCrmService.createAmendment(this.newAmendment).subscribe({
            next: () => { this.loadAmendments(); this.amendDialog = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Amendment submitted' }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to submit amendment' })
        });
    }

    updateStatus(a: Amendment, status: string) {
        this.confirmationService.confirm({
            message: `${status === 'Approved' ? 'Approve' : 'Reject'} this amendment?`,
            accept: () => {
                this.leadCrmService.updateAmendmentStatus(a.id, status).subscribe({
                    next: () => { this.loadAmendments(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Status updated' }); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
                });
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'Pending': return 'warn';
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            case 'Applied': return 'info';
            default: return 'secondary';
        }
    }
}
