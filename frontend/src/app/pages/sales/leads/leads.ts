import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LeadCrmService, Lead, CreateFollowUpRequest } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-lead-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, InputTextModule,
        TagModule, DialogModule, SelectModule, InputNumberModule,
        TextareaModule, ToastModule, ConfirmDialogModule, TooltipModule,
        DatePickerModule, AvatarModule, BadgeModule, MenuModule,
        IconFieldModule, InputIconModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
<p-toast />
<p-confirmdialog />

<!-- HEADER CARD -->
<div class="card mb-4">
    <div class="flex justify-between items-center flex-wrap gap-3">
        <div>
            <div class="font-semibold text-2xl">Leads</div>
            <div class="text-surface-500 mt-1" style="font-size: 0.9375rem">All inquiries from different sources</div>
        </div>
        <div class="flex gap-2 flex-wrap items-center">
            <p-iconfield>
                <p-inputicon styleClass="pi pi-search"></p-inputicon>
                <input pInputText [(ngModel)]="searchText" placeholder="Search leads..." class="w-52" (input)="applyFilter()" />
            </p-iconfield>
            <p-button icon="pi pi-filter" severity="secondary" [outlined]="true" pTooltip="Filters"></p-button>
            <p-button icon="pi pi-plus" label="New Lead" (click)="openNew()"></p-button>
        </div>
    </div>
</div>

<!-- TABLE CARD -->
<div class="card">
    <!-- Status Tabs -->
    <div class="leads-tab-bar">
        <div class="leads-tabs">
            @for (tab of statusTabs; track tab.value) {
            <button class="leads-tab" [class.active]="activeTab === tab.value" (click)="activeTab = tab.value; applyFilter()">
                {{ tab.label }}
                <span class="leads-tab-count">{{ getTabCount(tab.value) }}</span>
            </button>
            }
        </div>
    </div>

    <!-- Table -->
    <div class="leads-table-wrap">
        <table class="leads-table">
            <thead>
                <tr>
                    <th>Lead</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Travel Date</th>
                    <th>Pax</th>
                    <th>Status</th>
                    <th>Next Follow Up</th>
                    <th>Owner</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @for (lead of filteredLeads; track lead.id) {
                <tr class="lead-row" (click)="openWorkspace(lead)">
                    <td>
                        <div class="td-lead-info">
                            <p-avatar [label]="getInitials(lead.name)" [style]="{ 'background-color': getAvatarColor(lead.name), 'color': '#fff', 'font-size': '0.75rem' }" shape="circle" size="normal" />
                            <div class="lead-name-col">
                                <span class="lead-name">{{ lead.name }}</span>
                                <span class="lead-email">{{ lead.email || '' }}</span>
                            </div>
                        </div>
                    </td>
                    <td><span class="source-badge" [attr.data-source]="lead.source">{{ lead.source }}</span></td>
                    <td class="td-text">{{ lead.country || '-' }}</td>
                    <td class="td-text">{{ lead.travelDateFrom ? formatShortDate(lead.travelDateFrom) : '-' }}</td>
                    <td class="td-text">{{ lead.pax || '-' }}</td>
                    <td><p-tag [value]="getStatusLabel(lead.status)" [severity]="getStatusSeverity(lead.status)" /></td>
                    <td>
                        @if (lead.lastFollowUpDate) {
                        <span class="td-followup" [class.overdue]="isOverdue(lead.lastFollowUpDate)">
                            {{ formatFollowUpDate(lead.lastFollowUpDate) }}
                        </span>
                        } @else {
                        <span class="td-muted">-</span>
                        }
                    </td>
                    <td>
                        <div class="td-owner">
                            <p-avatar [label]="getInitials(lead.assignedTo || 'U')" shape="circle" size="normal"
                                [style]="{ 'background-color': 'var(--surface-border)', 'color': 'var(--text-color-secondary)', 'font-size': '0.75rem', 'width': '30px', 'height': '30px' }" />
                        </div>
                    </td>
                    <td class="td-actions" (click)="$event.stopPropagation()">
                        <button pButton icon="pi pi-ellipsis-h" [text]="true" [rounded]="true" severity="secondary" size="small"
                            (click)="toggleMenu($event, lead)" pTooltip="Actions"></button>
                    </td>
                </tr>
                }
                @if (filteredLeads.length === 0) {
                <tr>
                    <td colspan="9" class="leads-empty">
                        <i class="pi pi-inbox" style="font-size: 2rem"></i>
                        <span>No leads found</span>
                    </td>
                </tr>
                }
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <div class="leads-pagination">
        <span class="pagination-info">Showing {{ paginationStart }} to {{ paginationEnd }} of {{ tabFilteredLeads.length }} leads</span>
        <div class="leads-page-btns">
            <button class="page-btn" (click)="prevPage()" [disabled]="currentPage === 1"><i class="pi pi-angle-left"></i></button>
            @for (p of pageNumbers; track p) {
            <button class="page-btn" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
            }
            <button class="page-btn" (click)="nextPage()" [disabled]="currentPage === totalPages"><i class="pi pi-angle-right"></i></button>
        </div>
    </div>
</div>

<!-- LEAD DIALOG -->
<p-dialog [(visible)]="leadDialog" [style]="{ width: '620px' }" header="Lead Details" [modal]="true" styleClass="p-fluid">
    <ng-template #content>
        <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Name *</label>
                <input pInputText [(ngModel)]="lead.name" required autofocus />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Email</label>
                <input pInputText [(ngModel)]="lead.email" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Phone</label>
                <input pInputText [(ngModel)]="lead.phone" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Country</label>
                <input pInputText [(ngModel)]="lead.country" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Source *</label>
                <p-select [(ngModel)]="lead.source" [options]="sourceOptions" optionLabel="label" optionValue="value" placeholder="Select source" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Priority *</label>
                <p-select [(ngModel)]="lead.priority" [options]="priorityOptions" optionLabel="label" optionValue="value" placeholder="Select priority" />
            </div>
            <div class="flex flex-col gap-2 col-span-2">
                <label class="font-semibold text-sm">Interested In</label>
                <input pInputText [(ngModel)]="lead.interestedIn" placeholder="e.g. Everest Base Camp Trek" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Travel Date From</label>
                <p-datepicker [(ngModel)]="lead.travelDateFrom" dateFormat="yy-mm-dd" [showIcon]="true" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Travel Date To</label>
                <p-datepicker [(ngModel)]="lead.travelDateTo" dateFormat="yy-mm-dd" [showIcon]="true" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Pax</label>
                <p-inputNumber [(ngModel)]="lead.pax" [min]="1" [max]="999" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Budget</label>
                <p-inputNumber [(ngModel)]="lead.budget" mode="currency" [currency]="lead.currency || 'USD'" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Currency</label>
                <p-select [(ngModel)]="lead.currency" [options]="currencyOptions" optionLabel="label" optionValue="value" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Assigned To</label>
                <input pInputText [(ngModel)]="lead.assignedTo" />
            </div>
            <div class="flex flex-col gap-2 col-span-2">
                <label class="font-semibold text-sm">Notes</label>
                <textarea pTextarea [(ngModel)]="lead.notes" rows="3"></textarea>
            </div>
        </div>
    </ng-template>
    <ng-template #footer>
        <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="hideDialog()"></button>
        <button pButton label="Save" icon="pi pi-check" (click)="saveLead()"></button>
    </ng-template>
</p-dialog>
    `,
    styles: [`
        /* Tab bar */
        .leads-tab-bar { display: flex; align-items: center; justify-content: space-between; margin: -1.25rem -1.25rem 1rem; padding: 0 1.25rem; border-bottom: 1px solid var(--surface-border); }
        .leads-tabs { display: flex; gap: 0; }
        .leads-tab {
            display: inline-flex; align-items: center; gap: 0.375rem;
            padding: 0.75rem 1rem; font-size: 0.9375rem; font-weight: 600;
            border: none; background: transparent; cursor: pointer; color: var(--text-color-secondary);
            border-bottom: 2px solid transparent; transition: all 0.15s;
        }
        .leads-tab:hover { color: var(--text-color); }
        .leads-tab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
        .leads-tab-count {
            font-size: 0.75rem; font-weight: 700; min-width: 1.125rem; text-align: center;
            padding: 0 0.3rem; border-radius: 999px;
            background: var(--surface-border); color: var(--text-color-secondary);
        }
        .leads-tab.active .leads-tab-count {
            background: color-mix(in srgb, var(--primary-color) 15%, var(--surface-card)); color: var(--primary-color);
        }

        /* Table */
        .leads-table-wrap { overflow-y: auto; max-height: 560px; margin: 0 -1.25rem; padding: 0; }
        .leads-table-wrap::-webkit-scrollbar { width: 4px; }
        .leads-table-wrap::-webkit-scrollbar-thumb { background: var(--surface-border); border-radius: 4px; }
        .leads-table { width: 100%; border-collapse: collapse; }
        .leads-table th {
            text-align: left; padding: 0.75rem 1rem; font-size: 0.8125rem; font-weight: 600;
            color: var(--text-color-secondary); text-transform: uppercase; letter-spacing: 0.04em;
            border-bottom: 1px solid var(--surface-border); background: var(--surface-hover);
            position: sticky; top: 0; z-index: 1;
        }
        .leads-table tbody tr { border-bottom: 1px solid var(--surface-border); cursor: pointer; transition: background 0.1s; }
        .leads-table tbody tr:hover { background: var(--surface-hover); }
        .leads-table td { padding: 0.75rem 1rem; font-size: 0.9375rem; vertical-align: middle; }

        .td-lead-info { display: flex; align-items: center; gap: 0.625rem; min-width: 180px; }
        .lead-name-col { display: flex; flex-direction: column; }
        .lead-name { font-weight: 600; font-size: 0.9375rem; }
        .lead-email { font-size: 0.8125rem; color: var(--text-color-secondary); }
        .td-text { color: var(--text-color); font-size: 0.9375rem; }
        .td-muted { color: var(--text-color-secondary); }

        .source-badge {
            display: inline-block; padding: 0.25rem 0.5rem; border-radius: 0.3125rem;
            font-size: 0.8125rem; font-weight: 600;
            background: var(--surface-hover); color: var(--text-color-secondary);
        }
        .source-badge[data-source="Website"] { background: color-mix(in srgb, #3b82f6 12%, var(--surface-card)); color: #3b82f6; }
        .source-badge[data-source="Referral"] { background: color-mix(in srgb, #22c55e 12%, var(--surface-card)); color: #22c55e; }
        .source-badge[data-source="Facebook"] { background: color-mix(in srgb, #3b82f6 12%, var(--surface-card)); color: #1877f2; }
        .source-badge[data-source="Instagram"] { background: color-mix(in srgb, #e1306c 12%, var(--surface-card)); color: #e1306c; }
        .source-badge[data-source="Google Ads"] { background: color-mix(in srgb, #f97316 12%, var(--surface-card)); color: #f97316; }
        .source-badge[data-source="Walk-in"] { background: color-mix(in srgb, #8b5cf6 12%, var(--surface-card)); color: #8b5cf6; }
        .source-badge[data-source="WhatsApp"] { background: color-mix(in srgb, #22c55e 12%, var(--surface-card)); color: #16a34a; }

        .td-followup { font-size: 0.875rem; color: var(--text-color-secondary); }
        .td-followup.overdue { color: #ef4444; font-weight: 600; }
        .td-owner { display: flex; align-items: center; }
        .td-actions { text-align: center; }

        .leads-empty {
            text-align: center; padding: 3rem 1rem !important;
            display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
            color: var(--text-color-secondary);
        }

        /* Pagination */
        .leads-pagination { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0 0; margin: 0 -1.25rem; padding: 0.75rem 1.25rem 0; border-top: 1px solid var(--surface-border); }
        .pagination-info { font-size: 0.875rem; color: var(--text-color-secondary); }
        .leads-page-btns { display: flex; gap: 0.25rem; }
        .page-btn {
            width: 32px; height: 32px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;
            border: 1px solid var(--surface-border); background: var(--surface-card); cursor: pointer;
            font-size: 0.875rem; font-weight: 600; color: var(--text-color-secondary); transition: all 0.15s;
        }
        .page-btn:hover:not([disabled]) { background: var(--surface-hover); }
        .page-btn.active { background: var(--p-primary-500); color: #fff; border-color: var(--p-primary-500); }
        .page-btn[disabled] { opacity: 0.4; cursor: default; }
    `]
})
export class LeadList implements OnInit {
    leads: Lead[] = [];
    lead: any = {};
    leadDialog = false;
    loading = true;
    editMode = false;
    searchText = '';
    activeTab = 'all';
    sortBy = 'newest';
    currentPage = 1;
    pageSize = 7;

    statusTabs = [
        { label: 'All', value: 'all' },
        { label: 'New', value: 'New' },
        { label: 'Follow Up', value: 'FollowUp' },
        { label: 'Proposal Sent', value: 'ProposalSent' },
        { label: 'Negotiate', value: 'Negotiate' },
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Lost', value: 'Lost' }
    ];

    sourceOptions = [
        { label: 'Website', value: 'Website' },
        { label: 'Referral', value: 'Referral' },
        { label: 'Facebook', value: 'Facebook' },
        { label: 'Instagram', value: 'Instagram' },
        { label: 'Google Ads', value: 'Google Ads' },
        { label: 'Walk-in', value: 'Walk-in' },
        { label: 'WhatsApp', value: 'WhatsApp' },
        { label: 'Email', value: 'Email' },
        { label: 'Phone', value: 'Phone' },
        { label: 'Travel Agent', value: 'TravelAgent' },
        { label: 'Other', value: 'Other' }
    ];

    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
        { label: 'Urgent', value: 'Urgent' }
    ];

    currencyOptions = [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
        { label: 'NPR', value: 'NPR' },
        { label: 'AUD', value: 'AUD' }
    ];

    constructor(
        private leadCrmService: LeadCrmService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
        public router: Router
    ) {}

    ngOnInit() { this.loadLeads(); }

    loadLeads() {
        this.loading = true;
        this.leadCrmService.getLeads().subscribe({
            next: (data) => { this.leads = data ?? []; this.loading = false; this.cdr.markForCheck(); },
            error: () => { this.leads = []; this.loading = false; this.cdr.markForCheck(); }
        });
    }

    // Tab counts
    getTabCount(tab: string): number {
        if (tab === 'all') return this.leads.length;
        return this.leads.filter(l => l.status === tab).length;
    }
    get tabFilteredLeads(): Lead[] {
        let list = this.leads;
        if (this.activeTab !== 'all') {
            list = list.filter(l => l.status === this.activeTab);
        }
        if (this.searchText) {
            const s = this.searchText.toLowerCase();
            list = list.filter(l =>
                l.name.toLowerCase().includes(s) ||
                (l.email?.toLowerCase().includes(s)) ||
                (l.phone?.toLowerCase().includes(s)) ||
                (l.source?.toLowerCase().includes(s)) ||
                (l.country?.toLowerCase().includes(s))
            );
        }
        return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    get filteredLeads(): Lead[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.tabFilteredLeads.slice(start, start + this.pageSize);
    }

    applyFilter() { this.currentPage = 1; }

    get totalPages(): number { return Math.ceil(this.tabFilteredLeads.length / this.pageSize) || 1; }
    get paginationStart(): number { return this.tabFilteredLeads.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
    get paginationEnd(): number { return Math.min(this.currentPage * this.pageSize, this.tabFilteredLeads.length); }
    get pageNumbers(): number[] {
        const total = this.totalPages;
        if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
        const pages: number[] = [1];
        const start = Math.max(2, this.currentPage - 1);
        const end = Math.min(total - 1, this.currentPage + 1);
        if (start > 2) pages.push(-1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < total - 1) pages.push(-1);
        pages.push(total);
        return pages;
    }
    prevPage() { if (this.currentPage > 1) this.currentPage--; }
    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
    goToPage(p: number) { if (p > 0) this.currentPage = p; }

    openWorkspace(lead: Lead) {
        this.router.navigate(['/sales/leads', lead.id]);
    }

    toggleMenu(event: Event, lead: Lead) {
        // Future: show context menu
    }

    // CRUD
    openNew() {
        this.lead = { source: 'Website', priority: 'Medium', currency: 'USD' };
        this.editMode = false;
        this.leadDialog = true;
    }

    saveLead() {
        if (!this.lead.name?.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Name is required' });
            return;
        }
        if (this.editMode) {
            this.leadCrmService.updateLead(this.lead.id, this.lead).subscribe({
                next: () => { this.loadLeads(); this.leadDialog = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Lead updated' }); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update lead' })
            });
        } else {
            this.leadCrmService.createLead(this.lead).subscribe({
                next: () => { this.loadLeads(); this.leadDialog = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Lead created' }); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create lead' })
            });
        }
    }

    hideDialog() { this.leadDialog = false; }

    // Helpers
    getInitials(name: string): string {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    }

    getAvatarColor(name: string): string {
        const colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'InProgress': return 'In Process';
            case 'FollowUp': return 'Follow Up';
            case 'ProposalSent': return 'Proposal Sent';
            case 'Negotiate': return 'Negotiate';
            case 'Confirmed': return 'Confirmed';
            default: return status;
        }
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'New': return 'info';
            case 'FollowUp': return 'warn';
            case 'ProposalSent': return 'secondary';
            case 'Negotiate': return 'warn';
            case 'Confirmed': return 'success';
            case 'Converted': return 'success';
            case 'Lost': return 'danger';
            default: return 'secondary';
        }
    }

    formatShortDate(dateStr: string): string {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    formatFollowUpDate(dateStr: string): string {
        const d = new Date(dateStr);
        const today = new Date(); today.setHours(0,0,0,0);
        const target = new Date(d); target.setHours(0,0,0,0);
        const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        if (diff === 0) return 'Today ' + time;
        if (diff === 1) return 'Tomorrow ' + time;
        if (diff === -1) return 'Yesterday';
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + '\n' + time;
    }

    isOverdue(dateStr: string): boolean {
        const d = new Date(dateStr); d.setHours(0,0,0,0);
        const today = new Date(); today.setHours(0,0,0,0);
        return d < today;
    }

    isDueToday(dateStr: string): boolean {
        const d = new Date(dateStr); d.setHours(0,0,0,0);
        const today = new Date(); today.setHours(0,0,0,0);
        return d.getTime() === today.getTime();
    }

    isDueTomorrow(dateStr: string): boolean {
        const d = new Date(dateStr); d.setHours(0,0,0,0);
        const tomorrow = new Date(); tomorrow.setHours(0,0,0,0); tomorrow.setDate(tomorrow.getDate() + 1);
        return d.getTime() === tomorrow.getTime();
    }
}
