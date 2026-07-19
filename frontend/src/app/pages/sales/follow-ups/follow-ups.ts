import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { AvatarModule } from 'primeng/avatar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { LeadCrmService, FollowUp, Lead, CreateFollowUpRequest } from '../../../shared/services/lead-crm.service';

interface LeadFollowUpGroup {
    leadId: number;
    followUps: FollowUp[];
}

@Component({
    selector: 'app-follow-up-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, InputTextModule,
        TagModule, DialogModule, SelectModule, TextareaModule,
        ToastModule, TooltipModule, DatePickerModule, AvatarModule,
        IconFieldModule, InputIconModule
    ],
    providers: [MessageService],
    template: `
<p-toast />

<!-- HEADER CARD -->
<div class="card mb-4">
    <div class="flex justify-between items-center flex-wrap gap-3">
        <div>
            <div class="font-semibold text-xl">Follow Ups</div>
            <div class="text-surface-500 text-sm mt-1">Track and manage all client follow-up activities</div>
        </div>
        <div class="flex gap-2 flex-wrap items-center">
            <p-iconfield>
                <p-inputicon styleClass="pi pi-search"></p-inputicon>
                <input pInputText [(ngModel)]="searchText" placeholder="Search follow-ups..." class="w-52" (input)="applyFilter()" />
            </p-iconfield>
            <p-select [(ngModel)]="filterStatus" [options]="statusFilterOptions" optionLabel="label" optionValue="value"
                      placeholder="All Status" [showClear]="true" (onChange)="applyFilter()" styleClass="w-40" />
            <p-button icon="pi pi-plus" label="New Follow Up" (click)="openNew()"></p-button>
        </div>
    </div>
</div>

<!-- STAT CARDS ROW -->
<div class="grid grid-cols-12 gap-4 mb-4">
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Total Follow Ups</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ allFollowUps.length }}</div>
                </div>
                <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-list text-blue-500 text-xl!"></i>
                </div>
            </div>
            <span class="text-primary font-medium">{{ allFollowUps.length }} </span>
            <span class="text-muted-color">total recorded</span>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Due Today</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ dueTodayCount }}</div>
                </div>
                <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-clock text-orange-500 text-xl!"></i>
                </div>
            </div>
            <span class="text-primary font-medium">{{ dueTodayCount }} </span>
            <span class="text-muted-color">need attention</span>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Overdue</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ overdueCount }}</div>
                </div>
                <div class="flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-exclamation-triangle text-red-500 text-xl!"></i>
                </div>
            </div>
            <span class="text-red-500 font-medium">{{ overdueCount }} </span>
            <span class="text-muted-color">past due date</span>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Upcoming</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ upcomingCount }}</div>
                </div>
                <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-calendar-plus text-green-500 text-xl!"></i>
                </div>
            </div>
            <span class="text-green-500 font-medium">{{ upcomingCount }} </span>
            <span class="text-muted-color">scheduled</span>
        </div>
    </div>
</div>

<!-- CONTENT CARD -->
<div class="card">
    <!-- TAB BAR -->
    <div class="fu-tab-bar">
        <div class="fu-tabs">
            @for (tab of tabs; track tab.value) {
            <button class="fu-tab" [class.active]="activeTab === tab.value" (click)="activeTab = tab.value; applyFilter()">
                {{ tab.label }}
                @if (tab.count !== undefined) {
                <span class="fu-tab-badge">{{ tab.count }}</span>
                }
            </button>
            }
        </div>
        <div class="fu-bar-actions">
            <button class="fu-expand-btn" (click)="toggleAll()">
                <i [class]="allExpanded ? 'pi pi-minus' : 'pi pi-plus'"></i>
                {{ allExpanded ? 'Collapse All' : 'Expand All' }}
            </button>
            <div class="fu-sort">
                <span class="text-sm text-color-secondary mr-2">Sort:</span>
                <p-select [(ngModel)]="sortBy" [options]="sortOptions" optionLabel="label" optionValue="value" size="small" (onChange)="applyFilter()" />
            </div>
        </div>
    </div>

    <!-- GROUPED LIST -->
    <div class="fu-groups-wrap">
        @for (group of paginatedGroups; track group.leadId) {
        <div class="fu-lead-group" [class.expanded]="expandedLeads.has(group.leadId)">
            <!-- Group Header -->
            <div class="fu-group-header" (click)="toggleGroup(group.leadId)">
                <div class="fu-group-left">
                    <i class="pi fu-chevron" [class.pi-chevron-right]="!expandedLeads.has(group.leadId)" [class.pi-chevron-down]="expandedLeads.has(group.leadId)"></i>
                    <p-avatar [label]="getLeadInitials(group.leadId)" shape="circle"
                        [style]="{ 'background-color': getLeadColor(group.leadId), 'color': '#fff', 'font-size': '0.8125rem', 'width': '38px', 'height': '38px' }" />
                    <div class="fu-group-info">
                        <div class="fu-group-name-row">
                            <span class="fu-group-name">{{ getLeadName(group.leadId) }}</span>
                            @if (getLeadCountry(group.leadId)) {
                            <span class="fu-group-country">{{ getLeadCountry(group.leadId) }}</span>
                            }
                        </div>
                        <span class="fu-group-meta">{{ getLeadEmail(group.leadId) }}@if (getLeadPhone(group.leadId)) { &middot; {{ getLeadPhone(group.leadId) }}}</span>
                    </div>
                </div>
                <div class="fu-group-right">
                    @if (getLeadInterest(group.leadId)) {
                    <span class="fu-group-interest"><i class="pi pi-compass"></i> {{ getLeadInterest(group.leadId) }}</span>
                    }
                    <p-tag [value]="getLeadStatus(group.leadId)" [severity]="getLeadStatusSeverity(group.leadId)" [rounded]="true" />
                    <span class="fu-group-badge">
                        <i class="pi pi-comments"></i>
                        {{ group.followUps.length }}
                    </span>
                </div>
            </div>

            <!-- Follow-Up Timeline -->
            @if (expandedLeads.has(group.leadId)) {
            <div class="fu-group-body">
                @for (fu of group.followUps; track fu.id; let last = $last) {
                <div class="fu-item" (click)="viewDetail(fu)">
                    <div class="fu-item-rail">
                        <div class="fu-rail-dot" [ngClass]="getTypeIconClass(fu.type)">
                            <i [class]="getTypeIcon(fu.type)" style="font-size: 0.625rem"></i>
                        </div>
                        @if (!last) {
                        <div class="fu-rail-line"></div>
                        }
                    </div>
                    <div class="fu-item-card">
                        <div class="fu-item-top">
                            <div class="fu-item-left">
                                <span class="fu-item-type">{{ fu.type }}</span>
                                <span class="fu-item-ago">{{ formatRelative(fu.createdAt) }}</span>
                            </div>
                            <div class="fu-item-right">
                                <p-tag [value]="getFollowUpStatus(fu)" [severity]="getFollowUpStatusSeverity(fu)" />
                                @if (fu.nextFollowUpDate) {
                                <span class="fu-item-next" [class.overdue]="isOverdue(fu.nextFollowUpDate)">
                                    <i class="pi pi-calendar"></i> {{ formatDate(fu.nextFollowUpDate) }}
                                </span>
                                }
                            </div>
                        </div>
                        <p class="fu-item-msg">{{ fu.message }}</p>
                        <div class="fu-item-footer">
                            @if (fu.createdBy) {
                            <span class="fu-item-by"><i class="pi pi-user"></i> {{ fu.createdBy }}</span>
                            }
                            <button pButton icon="pi pi-arrow-right" [text]="true" [rounded]="true" severity="secondary" size="small"
                                class="fu-item-action" (click)="$event.stopPropagation(); viewDetail(fu)" pTooltip="View Details"></button>
                        </div>
                    </div>
                </div>
                }
            </div>
            }
        </div>
        }

        @if (filteredGroups.length === 0) {
        <div class="fu-empty">
            <i class="pi pi-inbox" style="font-size: 2.5rem"></i>
            <span>No follow-ups found</span>
        </div>
        }
    </div>

    <!-- PAGINATION -->
    <div class="fu-pagination">
        <span class="text-sm text-color-secondary">{{ filteredGroups.length }} lead{{ filteredGroups.length !== 1 ? 's' : '' }} &middot; {{ filteredFollowUps.length }} follow-up{{ filteredFollowUps.length !== 1 ? 's' : '' }}</span>
        <div class="fu-page-btns">
            <button class="page-btn" (click)="prevPage()" [disabled]="currentPage === 1"><i class="pi pi-angle-left"></i></button>
            @for (p of pageNumbers; track p) {
            <button class="page-btn" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
            }
            <button class="page-btn" (click)="nextPage()" [disabled]="currentPage === totalPages"><i class="pi pi-angle-right"></i></button>
        </div>
    </div>
</div>

<!-- NEW FOLLOW-UP DIALOG -->
<p-dialog [(visible)]="fuDialog" [style]="{ width: '520px' }" header="New Follow Up" [modal]="true" styleClass="p-fluid">
    <ng-template #content>
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Lead *</label>
                <p-select [(ngModel)]="newFollowUp.leadId" [options]="leadOptions" optionLabel="label" optionValue="value" placeholder="Select lead" [filter]="true" filterPlaceholder="Search leads..." />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Type *</label>
                <p-select [(ngModel)]="newFollowUp.type" [options]="typeOptions" optionLabel="label" optionValue="value" placeholder="Select type" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Message *</label>
                <textarea pTextarea [(ngModel)]="newFollowUp.message" rows="4" placeholder="Describe the follow-up activity..."></textarea>
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Next Follow-up Date</label>
                <p-datepicker [(ngModel)]="newFollowUp.nextFollowUpDate" dateFormat="yy-mm-dd" [showIcon]="true" [showTime]="true" />
            </div>
        </div>
    </ng-template>
    <ng-template #footer>
        <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="fuDialog = false"></button>
        <button pButton label="Save" icon="pi pi-check" (click)="saveFollowUp()"></button>
    </ng-template>
</p-dialog>
    `,
    styles: [`
        /* Tab bar */
        .fu-tab-bar { display: flex; align-items: center; justify-content: space-between; padding: 0 0 0.75rem; margin: -0.25rem -1.25rem 1rem; padding: 0 1.25rem 0.75rem; border-bottom: 1px solid var(--surface-border); flex-wrap: wrap; gap: 0.5rem; }
        .fu-tabs { display: flex; gap: 0.125rem; }
        .fu-tab {
            padding: 0.4375rem 0.875rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600;
            border: none; background: transparent; cursor: pointer; color: var(--text-color-secondary); transition: all 0.15s;
            display: flex; align-items: center; gap: 0.375rem;
        }
        .fu-tab:hover { color: var(--text-color); background: var(--surface-hover); }
        .fu-tab.active { background: color-mix(in srgb, var(--primary-color) 12%, var(--surface-card)); color: var(--p-primary-600); }
        .fu-tab-badge {
            font-size: 0.75rem; font-weight: 700; background: var(--surface-border); color: var(--text-color-secondary);
            padding: 0.0625rem 0.375rem; border-radius: 999px; min-width: 1.25rem; text-align: center;
        }
        .fu-tab.active .fu-tab-badge { background: color-mix(in srgb, var(--primary-color) 20%, var(--surface-card)); color: var(--primary-color); }

        .fu-bar-actions { display: flex; align-items: center; gap: 0.75rem; }
        .fu-expand-btn {
            display: inline-flex; align-items: center; gap: 0.375rem;
            padding: 0.375rem 0.75rem; border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 600;
            border: 1px solid var(--surface-border); background: var(--surface-card); cursor: pointer;
            color: var(--text-color-secondary); transition: all 0.15s;
        }
        .fu-expand-btn:hover { background: var(--surface-hover); color: var(--text-color); }
        .fu-sort { display: flex; align-items: center; }

        /* Grouped list */
        .fu-groups-wrap { overflow-y: auto; max-height: 560px; display: flex; flex-direction: column; gap: 0.625rem; margin: 0 -1.25rem; padding: 0.75rem 1.25rem; }
        .fu-groups-wrap::-webkit-scrollbar { width: 4px; }
        .fu-groups-wrap::-webkit-scrollbar-thumb { background: var(--surface-border); border-radius: 4px; }

        /* Lead group card */
        .fu-lead-group {
            border: 1px solid var(--surface-border); border-radius: 0.75rem;
            overflow: hidden; transition: box-shadow 0.2s;
        }
        .fu-lead-group.expanded { box-shadow: 0 2px 12px color-mix(in srgb, var(--text-color) 5%, transparent); }

        /* Group header */
        .fu-group-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.75rem 1rem; cursor: pointer; gap: 0.75rem;
            background: var(--surface-hover); transition: background 0.15s;
        }
        .fu-group-header:hover { background: color-mix(in srgb, var(--text-color) 6%, var(--surface-card)); }
        .fu-chevron { font-size: 0.6875rem; color: var(--text-color-secondary); width: 16px; flex-shrink: 0; transition: transform 0.2s; }
        .fu-group-left { display: flex; align-items: center; gap: 0.625rem; flex: 1; min-width: 0; }
        .fu-group-info { display: flex; flex-direction: column; min-width: 0; }
        .fu-group-name-row { display: flex; align-items: center; gap: 0.5rem; }
        .fu-group-name { font-weight: 700; font-size: 0.9375rem; }
        .fu-group-country {
            font-size: 0.6875rem; color: var(--text-color-secondary);
            background: var(--surface-card); padding: 0.0625rem 0.4rem; border-radius: 0.25rem;
            border: 1px solid var(--surface-border);
        }
        .fu-group-meta { font-size: 0.8125rem; color: var(--text-color-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .fu-group-right { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
        .fu-group-interest {
            font-size: 0.75rem; color: var(--text-color-secondary);
            display: inline-flex; align-items: center; gap: 0.25rem;
        }
        .fu-group-badge {
            display: inline-flex; align-items: center; gap: 0.3rem;
            font-size: 0.8125rem; font-weight: 700; color: var(--text-color-secondary);
            background: var(--surface-card); padding: 0.25rem 0.625rem; border-radius: 999px;
            border: 1px solid var(--surface-border);
        }

        /* Timeline body */
        .fu-group-body { padding: 0.5rem 0.5rem 0.5rem 0; border-top: 1px solid var(--surface-border); }

        .fu-item {
            display: flex; align-items: stretch; gap: 0; cursor: pointer;
            border-radius: 0.5rem; transition: background 0.1s; margin-left: 0.5rem;
        }
        .fu-item:hover { background: var(--surface-hover); }

        /* Timeline rail */
        .fu-item-rail { display: flex; flex-direction: column; align-items: center; width: 40px; flex-shrink: 0; padding-top: 0.875rem; }
        .fu-rail-dot {
            width: 22px; height: 22px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; color: #fff;
        }
        .fu-rail-dot.fu-icon-phone { background: #22c55e; }
        .fu-rail-dot.fu-icon-email { background: #3b82f6; }
        .fu-rail-dot.fu-icon-meeting { background: #f97316; }
        .fu-rail-dot.fu-icon-whatsapp { background: #16a34a; }
        .fu-rail-dot.fu-icon-other { background: var(--text-color-secondary); }
        .fu-rail-line { flex: 1; width: 2px; background: var(--surface-border); margin-top: 0.25rem; min-height: 12px; }

        /* Item card */
        .fu-item-card { flex: 1; padding: 0.625rem 0.75rem; min-width: 0; }
        .fu-item-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
        .fu-item-left { display: flex; align-items: center; gap: 0.5rem; }
        .fu-item-type { font-weight: 700; font-size: 0.875rem; }
        .fu-item-ago { font-size: 0.75rem; color: var(--text-color-secondary); }
        .fu-item-right { display: flex; align-items: center; gap: 0.5rem; }
        .fu-item-next { font-size: 0.75rem; color: var(--text-color-secondary); display: inline-flex; align-items: center; gap: 0.25rem; }
        .fu-item-next.overdue { color: #ef4444; font-weight: 600; }
        .fu-item-msg {
            font-size: 0.8125rem; color: var(--text-color-secondary); margin: 0.25rem 0 0.125rem; line-height: 1.5;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .fu-item-footer { display: flex; align-items: center; justify-content: space-between; }
        .fu-item-by { font-size: 0.75rem; color: var(--text-color-secondary); display: inline-flex; align-items: center; gap: 0.25rem; opacity: 0.8; }
        .fu-item-action { opacity: 0; transition: opacity 0.15s; }
        .fu-item:hover .fu-item-action { opacity: 1; }

        /* Empty state */
        .fu-empty {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 0.75rem; padding: 3rem 1rem; color: var(--text-color-secondary); font-size: 0.9375rem;
        }

        /* Pagination */
        .fu-pagination { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0 0; margin: 0 -1.25rem; padding: 0.75rem 1.25rem 0; border-top: 1px solid var(--surface-border); }
        .fu-page-btns { display: flex; gap: 0.25rem; }
        .page-btn {
            width: 32px; height: 32px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;
            border: 1px solid var(--surface-border); background: var(--surface-card); cursor: pointer;
            font-size: 0.875rem; font-weight: 600; color: var(--text-color-secondary); transition: all 0.15s;
        }
        .page-btn:hover:not([disabled]) { background: var(--surface-hover); border-color: var(--surface-border); }
        .page-btn.active { background: var(--p-primary-500); color: #fff; border-color: var(--p-primary-500); }
        .page-btn[disabled] { opacity: 0.4; cursor: default; }
    `]
})
export class FollowUpList implements OnInit {
    allFollowUps: FollowUp[] = [];
    leads: Lead[] = [];
    leadMap: Map<number, Lead> = new Map();
    leadOptions: any[] = [];
    loading = true;
    searchText = '';
    activeTab = 'all';
    filterStatus = '';
    sortBy = 'newest';
    currentPage = 1;
    pageSize = 8;
    fuDialog = false;
    newFollowUp: any = {};
    expandedLeads: Set<number> = new Set();

    tabs: { label: string; value: string; count?: number }[] = [];

    sortOptions = [
        { label: 'Newest', value: 'newest' },
        { label: 'Oldest', value: 'oldest' },
        { label: 'Next Follow Up', value: 'next_date' }
    ];

    statusFilterOptions = [
        { label: 'All', value: '' },
        { label: 'Overdue', value: 'Overdue' },
        { label: 'Due Today', value: 'Due Today' },
        { label: 'Upcoming', value: 'Upcoming' },
        { label: 'Completed', value: 'Completed' }
    ];

    typeOptions = [
        { label: 'Phone Call', value: 'Phone Call' },
        { label: 'Email', value: 'Email' },
        { label: 'Meeting', value: 'Meeting' },
        { label: 'WhatsApp', value: 'WhatsApp' },
        { label: 'Other', value: 'Other' }
    ];

    constructor(
        private leadCrmService: LeadCrmService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {}

    ngOnInit() { this.loadData(); }

    loadData() {
        this.loading = true;
        this.leadCrmService.getLeads().subscribe({
            next: (leads) => {
                this.leads = leads ?? [];
                this.leadMap = new Map(this.leads.map(l => [l.id, l]));
                this.leadOptions = this.leads.map(l => ({ label: l.name, value: l.id }));
                this.cdr.markForCheck();
            }
        });
        this.leadCrmService.getAllFollowUps().subscribe({
            next: (data) => {
                this.allFollowUps = data ?? [];
                this.loading = false;
                this.updateTabs();
                // Expand all groups by default
                this.expandedLeads = new Set(this.allFollowUps.map(f => f.leadId));
                this.cdr.markForCheck();
            },
            error: () => { this.allFollowUps = []; this.loading = false; this.cdr.markForCheck(); }
        });
    }

    updateTabs() {
        this.tabs = [
            { label: 'All', value: 'all', count: this.allFollowUps.length },
            { label: 'Overdue', value: 'Overdue', count: this.overdueCount },
            { label: 'Due Today', value: 'Due Today', count: this.dueTodayCount },
            { label: 'Upcoming', value: 'Upcoming', count: this.upcomingCount },
            { label: 'Completed', value: 'Completed', count: this.completedCount }
        ];
    }

    // Counts
    get overdueCount(): number {
        return this.allFollowUps.filter(f => f.nextFollowUpDate && this.isOverdue(f.nextFollowUpDate)).length;
    }
    get dueTodayCount(): number {
        return this.allFollowUps.filter(f => f.nextFollowUpDate && this.isDueToday(f.nextFollowUpDate)).length;
    }
    get upcomingCount(): number {
        return this.allFollowUps.filter(f => f.nextFollowUpDate && this.isUpcoming(f.nextFollowUpDate)).length;
    }
    get completedCount(): number {
        return this.allFollowUps.filter(f => !f.nextFollowUpDate || (!this.isOverdue(f.nextFollowUpDate) && !this.isDueToday(f.nextFollowUpDate) && !this.isUpcoming(f.nextFollowUpDate))).length;
    }

    // Filtering (individual follow-ups)
    get filteredFollowUps(): FollowUp[] {
        let list = [...this.allFollowUps];
        if (this.activeTab !== 'all') {
            list = list.filter(f => this.getFollowUpStatus(f) === this.activeTab);
        }
        if (this.filterStatus) {
            list = list.filter(f => this.getFollowUpStatus(f) === this.filterStatus);
        }
        if (this.searchText) {
            const s = this.searchText.toLowerCase();
            list = list.filter(f =>
                f.message.toLowerCase().includes(s) ||
                f.type.toLowerCase().includes(s) ||
                (f.createdBy || '').toLowerCase().includes(s) ||
                this.getLeadName(f.leadId).toLowerCase().includes(s)
            );
        }
        switch (this.sortBy) {
            case 'oldest': list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
            case 'next_date': list.sort((a, b) => {
                if (!a.nextFollowUpDate) return 1;
                if (!b.nextFollowUpDate) return -1;
                return new Date(a.nextFollowUpDate).getTime() - new Date(b.nextFollowUpDate).getTime();
            }); break;
            default: list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
        }
        return list;
    }

    // Group filtered follow-ups by lead
    get filteredGroups(): LeadFollowUpGroup[] {
        const fus = this.filteredFollowUps;
        const map = new Map<number, FollowUp[]>();
        for (const fu of fus) {
            if (!map.has(fu.leadId)) map.set(fu.leadId, []);
            map.get(fu.leadId)!.push(fu);
        }
        const groups: LeadFollowUpGroup[] = [];
        for (const [leadId, fuList] of map) {
            groups.push({ leadId, followUps: fuList });
        }
        // Sort: most follow-ups first, then by most recent activity
        groups.sort((a, b) => {
            if (b.followUps.length !== a.followUps.length) return b.followUps.length - a.followUps.length;
            const aMax = Math.max(...a.followUps.map(f => new Date(f.createdAt).getTime()));
            const bMax = Math.max(...b.followUps.map(f => new Date(f.createdAt).getTime()));
            return bMax - aMax;
        });
        return groups;
    }

    get paginatedGroups(): LeadFollowUpGroup[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredGroups.slice(start, start + this.pageSize);
    }

    applyFilter() { this.currentPage = 1; }

    // Group expand/collapse
    toggleGroup(leadId: number) {
        if (this.expandedLeads.has(leadId)) {
            this.expandedLeads.delete(leadId);
        } else {
            this.expandedLeads.add(leadId);
        }
    }

    get allExpanded(): boolean {
        return this.filteredGroups.length > 0 && this.filteredGroups.every(g => this.expandedLeads.has(g.leadId));
    }

    toggleAll() {
        if (this.allExpanded) {
            this.expandedLeads.clear();
        } else {
            for (const g of this.filteredGroups) {
                this.expandedLeads.add(g.leadId);
            }
        }
    }

    // Pagination (based on groups)
    get totalPages(): number { return Math.ceil(this.filteredGroups.length / this.pageSize) || 1; }
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

    // Navigation
    viewDetail(fu: FollowUp) {
        this.router.navigate(['/sales/follow-ups', fu.id], { state: { followUp: fu, lead: this.leadMap.get(fu.leadId) } });
    }

    // CRUD
    openNew() { this.newFollowUp = { type: 'Phone Call' }; this.fuDialog = true; }

    saveFollowUp() {
        if (!this.newFollowUp.leadId || !this.newFollowUp.message?.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Lead and message are required' });
            return;
        }
        const req: CreateFollowUpRequest = {
            leadId: this.newFollowUp.leadId,
            type: this.newFollowUp.type,
            message: this.newFollowUp.message,
            nextFollowUpDate: this.newFollowUp.nextFollowUpDate
        };
        this.leadCrmService.createFollowUp(req).subscribe({
            next: () => { this.loadData(); this.fuDialog = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Follow-up created' }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create follow-up' })
        });
    }

    // Lead helpers
    getLeadName(leadId: number): string { return this.leadMap.get(leadId)?.name || `Lead #${leadId}`; }
    getLeadEmail(leadId: number): string { return this.leadMap.get(leadId)?.email || ''; }
    getLeadPhone(leadId: number): string { return this.leadMap.get(leadId)?.phone || ''; }
    getLeadCountry(leadId: number): string { return this.leadMap.get(leadId)?.country || ''; }
    getLeadInterest(leadId: number): string { return this.leadMap.get(leadId)?.interestedIn || ''; }
    getLeadStatus(leadId: number): string { return this.leadMap.get(leadId)?.status || 'Unknown'; }
    getLeadInitials(leadId: number): string {
        const name = this.getLeadName(leadId);
        const parts = name.trim().split(/\s+/);
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    }
    getLeadColor(leadId: number): string {
        const colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
        return colors[leadId % colors.length];
    }
    getLeadStatusSeverity(leadId: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
        const s = this.getLeadStatus(leadId);
        switch (s) {
            case 'Converted': return 'success';
            case 'Interested': case 'Qualified': return 'info';
            case 'New': return 'warn';
            case 'Lost': return 'danger';
            default: return 'secondary';
        }
    }

    // Follow-up helpers
    getFollowUpStatus(fu: FollowUp): string {
        if (!fu.nextFollowUpDate) return 'Completed';
        if (this.isOverdue(fu.nextFollowUpDate)) return 'Overdue';
        if (this.isDueToday(fu.nextFollowUpDate)) return 'Due Today';
        return 'Upcoming';
    }

    getFollowUpStatusSeverity(fu: FollowUp): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
        const s = this.getFollowUpStatus(fu);
        switch (s) {
            case 'Overdue': return 'danger';
            case 'Due Today': return 'warn';
            case 'Upcoming': return 'info';
            case 'Completed': return 'success';
            default: return 'secondary';
        }
    }

    // Date helpers
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
    isUpcoming(dateStr: string): boolean {
        const d = new Date(dateStr); d.setHours(0,0,0,0);
        const today = new Date(); today.setHours(0,0,0,0);
        return d > today;
    }

    formatDate(dateStr: string): string {
        const d = new Date(dateStr);
        const today = new Date(); today.setHours(0,0,0,0);
        const target = new Date(d); target.setHours(0,0,0,0);
        const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff === -1) return 'Yesterday';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    formatRelative(dateStr: string): string {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Type helpers
    getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
        switch (type) {
            case 'Phone Call': case 'Phone': return 'success';
            case 'Email': return 'info';
            case 'Meeting': return 'warn';
            case 'WhatsApp': return 'success';
            default: return 'secondary';
        }
    }

    getTypeIcon(type: string): string {
        switch (type) {
            case 'Phone Call': case 'Phone': return 'pi pi-phone';
            case 'Email': return 'pi pi-envelope';
            case 'Meeting': return 'pi pi-users';
            case 'WhatsApp': return 'pi pi-whatsapp';
            default: return 'pi pi-comment';
        }
    }

    getTypeIconClass(type: string): string {
        switch (type) {
            case 'Phone Call': case 'Phone': return 'fu-icon-phone';
            case 'Email': return 'fu-icon-email';
            case 'Meeting': return 'fu-icon-meeting';
            case 'WhatsApp': return 'fu-icon-whatsapp';
            default: return 'fu-icon-other';
        }
    }
}
