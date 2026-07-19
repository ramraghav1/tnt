import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LeadCrmService, Quotation } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-quotation-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        TagModule, ToolbarModule, IconFieldModule, InputIconModule, TooltipModule, ConfirmDialogModule
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
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Quotations</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Quotation" icon="pi pi-plus" routerLink="/quotations/create"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="quotations" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5,10,25,50]"
                     [globalFilterFields]="['quotationNumber','clientName','clientEmail','status']"
                     dataKey="id" [loading]="loading" responsiveLayout="scroll" [showCurrentPageReport]="true"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords} quotations">
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search quotations..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="quotationNumber" style="min-width:10rem">Quotation # <p-sortIcon field="quotationNumber" /></th>
                        <th pSortableColumn="clientName" style="min-width:12rem">Client <p-sortIcon field="clientName" /></th>
                        <th pSortableColumn="pax" style="min-width:5rem">Pax <p-sortIcon field="pax" /></th>
                        <th style="min-width:10rem">Travel Dates</th>
                        <th pSortableColumn="totalAmount" style="min-width:10rem">Total <p-sortIcon field="totalAmount" /></th>
                        <th pSortableColumn="status" style="min-width:8rem">Status <p-sortIcon field="status" /></th>
                        <th pSortableColumn="validUntil" style="min-width:10rem">Valid Until <p-sortIcon field="validUntil" /></th>
                        <th pSortableColumn="createdAt" style="min-width:10rem">Created <p-sortIcon field="createdAt" /></th>
                        <th style="min-width:12rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-q>
                    <tr>
                        <td><span class="font-semibold font-mono">{{ q.quotationNumber }}</span></td>
                        <td>
                            <span class="font-semibold">{{ q.clientName }}</span>
                            <div *ngIf="q.clientEmail" class="text-xs text-muted-color mt-1">{{ q.clientEmail }}</div>
                        </td>
                        <td>{{ q.pax }}</td>
                        <td>
                            <span *ngIf="q.travelDateFrom">{{ q.travelDateFrom | date:'mediumDate' }}</span>
                            <span *ngIf="q.travelDateFrom && q.travelDateTo"> - {{ q.travelDateTo | date:'mediumDate' }}</span>
                            <span *ngIf="!q.travelDateFrom" class="text-muted-color">-</span>
                        </td>
                        <td class="font-semibold">{{ q.totalAmount | number:'1.2-2' }} {{ q.currency }}</td>
                        <td><p-tag [value]="q.status" [severity]="getStatusSeverity(q.status)" /></td>
                        <td>
                            <span *ngIf="q.validUntil" [class]="isExpired(q.validUntil) ? 'text-red-500' : ''">{{ q.validUntil | date:'mediumDate' }}</span>
                            <span *ngIf="!q.validUntil" class="text-muted-color">-</span>
                        </td>
                        <td>{{ q.createdAt | date:'mediumDate' }}</td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-check" [rounded]="true" [text]="true" severity="success"
                                        (click)="updateStatus(q, 'Approved')" pTooltip="Approve" *ngIf="q.status === 'Draft' || q.status === 'Sent'"></button>
                                <button pButton icon="pi pi-send" [rounded]="true" [text]="true" severity="info"
                                        (click)="updateStatus(q, 'Sent')" pTooltip="Mark Sent" *ngIf="q.status === 'Draft'"></button>
                                <button pButton icon="pi pi-times" [rounded]="true" [text]="true" severity="danger"
                                        (click)="updateStatus(q, 'Rejected')" pTooltip="Reject" *ngIf="q.status === 'Draft' || q.status === 'Sent'"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="9" class="text-center py-8 text-muted-color">No quotations found.</td></tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class QuotationList implements OnInit {
    quotations: Quotation[] = [];
    loading = true;

    constructor(
        private leadCrmService: LeadCrmService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadQuotations();
    }

    loadQuotations() {
        this.loading = true;
        this.leadCrmService.getQuotations().subscribe({
            next: (data) => { this.quotations = data; this.loading = false; },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load quotations' }); }
        });
    }

    updateStatus(q: Quotation, status: string) {
        this.confirmationService.confirm({
            message: `Update quotation ${q.quotationNumber} status to "${status}"?`,
            header: 'Confirm',
            icon: 'pi pi-question-circle',
            accept: () => {
                this.leadCrmService.updateQuotationStatus(q.id, status).subscribe({
                    next: () => { this.loadQuotations(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Status updated' }); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status' })
                });
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    isExpired(date: string): boolean {
        return new Date(date) < new Date();
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'Draft': return 'secondary';
            case 'Sent': return 'info';
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            case 'Expired': return 'warn';
            default: return 'secondary';
        }
    }
}
