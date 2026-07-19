import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { LeadCrmService, FollowUp, Lead, CreateFollowUpRequest } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-follow-up-detail',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule,
        TagModule, SelectModule, TextareaModule, ToastModule, TooltipModule,
        AvatarModule, DialogModule, DatePickerModule
    ],
    providers: [MessageService],
    template: `
<p-toast />

@if (followUp && lead) {
<div class="fud-page">
    <!-- BREADCRUMB + HEADER -->
    <div class="fud-header-bar">
        <div class="fud-breadcrumb">
            <a class="fud-back" (click)="goBack()"><i class="pi pi-arrow-left"></i></a>
            <span class="fud-bc-text">Follow Ups</span>
            <i class="pi pi-angle-right fud-bc-sep"></i>
            <span class="fud-bc-current">Follow Up Details</span>
        </div>
    </div>

    <!-- TITLE BAR -->
    <div class="fud-title-bar">
        <div class="fud-title-left">
            <div class="fud-title-icon" [ngClass]="getTypeIconClass(followUp.type)">
                <i [class]="getTypeIcon(followUp.type)"></i>
            </div>
            <div>
                <div class="fud-title-row">
                    <h1 class="fud-title">Follow Up - {{ followUp.type }}</h1>
                    <p-tag [value]="getStatus()" [severity]="getStatusSeverity()" [rounded]="true" />
                </div>
                <div class="fud-title-meta">
                    <span><i class="pi pi-calendar mr-1"></i>{{ followUp.createdAt | date:'dd MMM yyyy' }}</span>
                    <span class="fud-meta-sep">·</span>
                    <span>{{ followUp.createdAt | date:'hh:mm a' }}</span>
                    @if (isUpcoming()) {
                    <span class="fud-countdown"><i class="pi pi-clock mr-1"></i>{{ getCountdown() }}</span>
                    }
                </div>
            </div>
        </div>
        <div class="fud-title-actions">
            <button pButton label="Edit" icon="pi pi-pencil" [outlined]="true" severity="secondary" size="small"></button>
            <button pButton label="Reschedule" icon="pi pi-calendar" [outlined]="true" severity="secondary" size="small"></button>
            <button pButton label="Mark Completed" icon="pi pi-check" severity="success" size="small" (click)="markCompleted()"></button>
            <button pButton icon="pi pi-ellipsis-h" [text]="true" [rounded]="true" severity="secondary" size="small"></button>
        </div>
    </div>

    <!-- QUICK INFO BAR -->
    <div class="fud-quick-bar">
        <div class="fud-quick-item">
            <span class="fud-quick-label">Lead</span>
            <a class="fud-quick-link" [routerLink]="['/sales/leads']">{{ lead.name }}</a>
            <span class="fud-quick-sub">{{ lead.email }}</span>
        </div>
        <div class="fud-quick-divider"></div>
        <div class="fud-quick-item">
            <span class="fud-quick-label">Pax</span>
            <span class="fud-quick-value">{{ lead.pax || '-' }} Adults</span>
        </div>
        <div class="fud-quick-divider"></div>
        <div class="fud-quick-item">
            <span class="fud-quick-label">Source</span>
            <span class="fud-quick-value">{{ lead.source }}</span>
        </div>
        <div class="fud-quick-divider"></div>
        <div class="fud-quick-item">
            <span class="fud-quick-label">Owner</span>
            <div class="fud-quick-owner">
                <p-avatar [label]="getOwnerInitials()" shape="circle" size="normal"
                    [style]="{ 'background-color': 'var(--surface-border)', 'color': 'var(--text-color-secondary)', 'font-size': '0.7rem' }" />
                <span>{{ followUp.createdBy || 'Unassigned' }}</span>
            </div>
        </div>
    </div>

    <!-- MAIN CONTENT: 3 COLUMNS -->
    <div class="fud-body">

        <!-- LEFT COLUMN -->
        <div class="fud-col-left">
            <!-- Follow Up Information -->
            <div class="fud-card">
                <h3 class="fud-card-title">Follow Up Information</h3>
                <div class="fud-info-rows">
                    <div class="fud-info-row">
                        <div class="fud-info-icon"><i class="pi pi-phone"></i></div>
                        <span class="fud-info-label">Follow Up Type</span>
                        <span class="fud-info-value">{{ followUp.type }}</span>
                    </div>
                    <div class="fud-info-row">
                        <div class="fud-info-icon"><i class="pi pi-flag"></i></div>
                        <span class="fud-info-label">Priority</span>
                        <p-tag [value]="lead.priority" [severity]="getPrioritySeverity()" [rounded]="true" />
                    </div>
                    <div class="fud-info-row">
                        <div class="fud-info-icon"><i class="pi pi-calendar"></i></div>
                        <span class="fud-info-label">Date & Time</span>
                        <span class="fud-info-value">{{ followUp.createdAt | date:'dd MMM yyyy, hh:mm a' }}</span>
                    </div>
                    <div class="fud-info-row">
                        <div class="fud-info-icon"><i class="pi pi-clock"></i></div>
                        <span class="fud-info-label">Duration</span>
                        <span class="fud-info-value">30 Minutes</span>
                    </div>
                    <div class="fud-info-row">
                        <div class="fud-info-icon"><i class="pi pi-user"></i></div>
                        <span class="fud-info-label">Assigned To</span>
                        <div class="fud-info-owner">
                            <p-avatar [label]="getOwnerInitials()" shape="circle" size="normal"
                                [style]="{ 'background-color': 'var(--surface-border)', 'color': 'var(--text-color-secondary)', 'font-size': '0.65rem' }" />
                            <span>{{ followUp.createdBy || lead.assignedTo || 'Unassigned' }}</span>
                        </div>
                    </div>
                    <div class="fud-info-row">
                        <div class="fud-info-icon"><i class="pi pi-bell"></i></div>
                        <span class="fud-info-label">Reminder</span>
                        <span class="fud-info-value">15 minutes before</span>
                    </div>
                    <div class="fud-info-row">
                        <div class="fud-info-icon"><i class="pi pi-info-circle"></i></div>
                        <span class="fud-info-label">Status</span>
                        <p-tag [value]="getStatus()" [severity]="getStatusSeverity()" [rounded]="true" />
                    </div>
                </div>
            </div>

            <!-- Previous Follow Ups -->
            <div class="fud-card">
                <h3 class="fud-card-title">Previous Follow Ups</h3>
                <div class="fud-timeline">
                    @for (pfu of previousFollowUps; track pfu.id) {
                    <div class="fud-timeline-item">
                        <div class="fud-timeline-icon" [ngClass]="getTypeIconClass(pfu.type)">
                            <i [class]="getTypeIcon(pfu.type)"></i>
                        </div>
                        <div class="fud-timeline-content">
                            <div class="fud-timeline-header">
                                <span class="fud-timeline-title">{{ pfu.type }}</span>
                                <p-tag value="Completed" severity="success" [rounded]="true" />
                            </div>
                            <span class="fud-timeline-date">{{ pfu.createdAt | date:'dd MMM yyyy, hh:mm a' }}</span>
                            <span class="fud-timeline-msg">{{ pfu.message }}</span>
                        </div>
                    </div>
                    }
                    @if (previousFollowUps.length === 0) {
                    <div class="text-center text-color-secondary py-3 text-sm">No previous follow-ups</div>
                    }
                </div>
                @if (allLeadFollowUps.length > 4) {
                <a class="fud-view-all">View All</a>
                }
            </div>
        </div>

        <!-- CENTER COLUMN -->
        <div class="fud-col-center">
            <!-- Purpose / Agenda -->
            <div class="fud-card">
                <h3 class="fud-card-title">Purpose / Agenda</h3>
                <div class="fud-agenda-text">{{ followUp.message }}</div>

                <h4 class="fud-sub-title">Discussion Points</h4>
                <div class="fud-discussion-points">
                    @for (point of discussionPoints; track point) {
                    <div class="fud-point">
                        <i class="pi pi-check-circle fud-point-icon"></i>
                        <span>{{ point }}</span>
                    </div>
                    }
                </div>
            </div>

            <!-- Next Follow Up -->
            <div class="fud-card">
                <h3 class="fud-card-title">Next Follow Up</h3>
                @if (nextFollowUp) {
                <div class="fud-next-fu">
                    <div class="fud-next-icon" [ngClass]="getTypeIconClass(nextFollowUp.type)">
                        <i [class]="getTypeIcon(nextFollowUp.type)"></i>
                    </div>
                    <div class="fud-next-info">
                        <span class="fud-next-title">Follow Up - {{ nextFollowUp.type }}</span>
                        <span class="fud-next-date">{{ nextFollowUp.nextFollowUpDate | date:'dd MMM yyyy, hh:mm a' }}</span>
                    </div>
                    <p-tag [value]="getFollowUpStatus(nextFollowUp)" [severity]="getFollowUpStatusSeverity(nextFollowUp)" [rounded]="true" />
                </div>
                } @else {
                <div class="text-color-secondary text-sm mb-3">No next follow-up scheduled</div>
                }

                <div class="fud-plan-section">
                    <p class="fud-plan-label">Plan your next action for this lead</p>
                    <textarea pTextarea [(ngModel)]="nextActionNote" rows="3" placeholder="Add notes about your next action..." class="w-full mb-3"></textarea>
                    <button pButton label="Schedule Next Follow Up" icon="pi pi-calendar-plus" (click)="scheduleNext()" class="fud-schedule-btn"></button>
                </div>
            </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="fud-col-right">
            <!-- Lead Card -->
            <div class="fud-card fud-lead-card">
                <div class="fud-lead-header">
                    <p-avatar [label]="getLeadInitials()" shape="circle" size="xlarge"
                        [style]="{ 'background-color': getLeadColor(), 'color': '#fff', 'font-size': '1.25rem' }" />
                    <div class="fud-lead-name-wrap">
                        <span class="fud-lead-name">{{ lead.name }}</span>
                        <p-tag [value]="lead.status" [severity]="getLeadStatusSeverity()" [rounded]="true" />
                    </div>
                    <span class="fud-lead-email">{{ lead.email }}</span>
                    <span class="fud-lead-phone">{{ lead.phone }}</span>
                </div>
                <div class="fud-lead-actions">
                    <button class="fud-lead-action"><i class="pi pi-phone"></i><span>Call</span></button>
                    <button class="fud-lead-action"><i class="pi pi-envelope"></i><span>Email</span></button>
                    <button class="fud-lead-action"><i class="pi pi-whatsapp"></i><span>WhatsApp</span></button>
                    <button class="fud-lead-action" [routerLink]="['/sales/leads']"><i class="pi pi-eye"></i><span>View Lead</span></button>
                </div>
            </div>

            <!-- Lead Information -->
            <div class="fud-card">
                <h3 class="fud-card-title">Lead Information</h3>
                <div class="fud-lead-info-grid">
                    <div class="fud-lead-field">
                        <span class="fud-lead-field-label">Destination</span>
                        <span class="fud-lead-field-value">{{ lead.country || 'Nepal' }}</span>
                    </div>
                    <div class="fud-lead-field">
                        <span class="fud-lead-field-label">Travel Date</span>
                        <span class="fud-lead-field-value">{{ lead.travelDateFrom ? (lead.travelDateFrom | date:'dd MMM yyyy') : '-' }}{{ lead.travelDateTo ? ' - ' + (lead.travelDateTo | date:'dd MMM yyyy') : '' }}</span>
                    </div>
                    <div class="fud-lead-field">
                        <span class="fud-lead-field-label">Pax</span>
                        <span class="fud-lead-field-value">{{ lead.pax || '-' }} Adults</span>
                    </div>
                    <div class="fud-lead-field">
                        <span class="fud-lead-field-label">Budget</span>
                        <span class="fud-lead-field-value">{{ lead.budget ? (lead.currency + ' ' + lead.budget) : '-' }}</span>
                    </div>
                </div>
                @if (lead.interestedIn) {
                <div class="fud-lead-interests">
                    <span class="fud-lead-field-label">Interest</span>
                    <div class="fud-interest-tags">
                        @for (tag of getInterestTags(); track tag) {
                        <span class="fud-interest-tag">{{ tag }}</span>
                        }
                    </div>
                </div>
                }
                <a class="fud-view-all" [routerLink]="['/sales/leads']">View Full Lead Details <i class="pi pi-arrow-right"></i></a>
            </div>

            <!-- Activity Timeline -->
            <div class="fud-card">
                <h3 class="fud-card-title">Activity Timeline</h3>
                <div class="fud-activity-timeline">
                    @for (fu of allLeadFollowUps | slice:0:5; track fu.id) {
                    <div class="fud-activity-item">
                        <div class="fud-activity-icon" [ngClass]="getTypeIconClass(fu.type)">
                            <i [class]="getTypeIcon(fu.type)"></i>
                        </div>
                        <div class="fud-activity-content">
                            <div class="fud-activity-header">
                                <span class="fud-activity-title">{{ fu.type }}</span>
                                <p-tag [value]="getFollowUpStatus(fu)" [severity]="getFollowUpStatusSeverity(fu)" [rounded]="true" />
                            </div>
                            <span class="fud-activity-msg">{{ fu.message | slice:0:50 }}{{ fu.message.length > 50 ? '...' : '' }}</span>
                            <span class="fud-activity-date">{{ fu.createdAt | date:'dd MMM yyyy, hh:mm a' }}</span>
                        </div>
                    </div>
                    }
                </div>
                @if (allLeadFollowUps.length > 5) {
                <a class="fud-view-all">View All Activities <i class="pi pi-arrow-right"></i></a>
                }
            </div>
        </div>
    </div>
</div>
} @else {
<div class="fud-loading">
    <i class="pi pi-spinner pi-spin text-4xl text-color-secondary"></i>
    <span class="text-color-secondary mt-2">Loading follow-up details...</span>
</div>
}

<!-- SCHEDULE DIALOG -->
<p-dialog [(visible)]="scheduleDialog" [style]="{ width: '480px' }" header="Schedule Next Follow Up" [modal]="true" styleClass="p-fluid">
    <ng-template #content>
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Type *</label>
                <p-select [(ngModel)]="scheduleData.type" [options]="typeOptions" optionLabel="label" optionValue="value" placeholder="Select type" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Message *</label>
                <textarea pTextarea [(ngModel)]="scheduleData.message" rows="3" placeholder="Describe the follow-up..."></textarea>
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Date & Time *</label>
                <p-datepicker [(ngModel)]="scheduleData.nextFollowUpDate" dateFormat="yy-mm-dd" [showIcon]="true" [showTime]="true" />
            </div>
        </div>
    </ng-template>
    <ng-template #footer>
        <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="scheduleDialog = false"></button>
        <button pButton label="Schedule" icon="pi pi-calendar-plus" (click)="saveSchedule()"></button>
    </ng-template>
</p-dialog>
    `,
    styles: [`
        .fud-page { display: flex; flex-direction: column; gap: 0; }
        .fud-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; }

        /* Header */
        .fud-header-bar { padding: 0.75rem 1.5rem 0; }
        .fud-breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-color-secondary); }
        .fud-back { cursor: pointer; width: 28px; height: 28px; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
        .fud-back:hover { background: var(--surface-hover); }
        .fud-bc-sep { font-size: 0.75rem; color: var(--surface-border); }
        .fud-bc-current { font-weight: 600; color: var(--text-color); }

        /* Title Bar */
        .fud-title-bar { display: flex; align-items: flex-start; justify-content: space-between; padding: 0.75rem 1.5rem; gap: 1rem; flex-wrap: wrap; }
        .fud-title-left { display: flex; align-items: flex-start; gap: 0.75rem; }
        .fud-title-icon { width: 44px; height: 44px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.125rem; flex-shrink: 0; }
        .fud-title-row { display: flex; align-items: center; gap: 0.5rem; }
        .fud-title { font-size: 1.375rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
        .fud-title-meta { display: flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; color: var(--text-color-secondary); margin-top: 0.25rem; }
        .fud-meta-sep { color: var(--surface-border); }
        .fud-countdown { color: var(--p-primary-600); font-weight: 600; background: var(--p-primary-50); padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.8125rem; }
        .fud-title-actions { display: flex; gap: 0.5rem; align-items: center; }

        /* Quick Info Bar */
        .fud-quick-bar {
            display: flex; align-items: center; gap: 0; padding: 0.875rem 1.5rem; margin: 0 1.5rem;
            background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 0.75rem;
        }
        .fud-quick-item { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; padding: 0 1rem; }
        .fud-quick-label { font-size: 0.75rem; font-weight: 600; color: var(--text-color-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
        .fud-quick-value { font-size: 0.9375rem; font-weight: 600; }
        .fud-quick-link { font-size: 0.9375rem; font-weight: 600; color: var(--p-primary-600); cursor: pointer; }
        .fud-quick-link:hover { text-decoration: underline; }
        .fud-quick-sub { font-size: 0.8125rem; color: var(--text-color-secondary); }
        .fud-quick-owner { display: flex; align-items: center; gap: 0.375rem; font-size: 0.9375rem; font-weight: 500; }
        .fud-quick-divider { width: 1px; height: 36px; background: var(--surface-border); flex-shrink: 0; }

        /* Body */
        .fud-body { display: grid; grid-template-columns: 1fr 1.2fr 0.9fr; gap: 1rem; padding: 1rem 1.5rem 1.5rem; }

        /* Cards */
        .fud-card {
            background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 0.75rem;
            padding: 1.125rem; margin-bottom: 1rem;
        }
        .fud-card:last-child { margin-bottom: 0; }
        .fud-card-title { font-size: 1.0625rem; font-weight: 700; margin: 0 0 0.875rem; }

        /* Follow Up Info */
        .fud-info-rows { display: flex; flex-direction: column; gap: 0.75rem; }
        .fud-info-row { display: flex; align-items: center; gap: 0.75rem; }
        .fud-info-icon { width: 32px; height: 32px; border-radius: 0.375rem; background: var(--surface-hover); display: flex; align-items: center; justify-content: center; color: var(--text-color-secondary); font-size: 0.875rem; flex-shrink: 0; }
        .fud-info-label { font-size: 0.9375rem; color: var(--text-color-secondary); min-width: 110px; }
        .fud-info-value { font-size: 0.9375rem; font-weight: 600; }
        .fud-info-owner { display: flex; align-items: center; gap: 0.375rem; font-size: 0.9375rem; font-weight: 600; }

        /* Timeline */
        .fud-timeline { display: flex; flex-direction: column; gap: 0; }
        .fud-timeline-item { display: flex; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--surface-border); }
        .fud-timeline-item:last-child { border-bottom: none; }
        .fud-timeline-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.875rem; }
        .fud-timeline-content { display: flex; flex-direction: column; flex: 1; }
        .fud-timeline-header { display: flex; align-items: center; justify-content: space-between; }
        .fud-timeline-title { font-size: 0.9375rem; font-weight: 600; }
        .fud-timeline-date { font-size: 0.8125rem; color: var(--text-color-secondary); }
        .fud-timeline-msg { font-size: 0.8125rem; color: var(--text-color-secondary); margin-top: 0.125rem; }

        /* Agenda */
        .fud-agenda-text { font-size: 0.9375rem; color: var(--text-color-secondary); line-height: 1.6; background: var(--surface-hover); padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .fud-sub-title { font-size: 0.9375rem; font-weight: 700; margin: 0 0 0.5rem; color: var(--text-color); }
        .fud-discussion-points { display: flex; flex-direction: column; gap: 0.5rem; }
        .fud-point { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9375rem; }
        .fud-point-icon { color: #22c55e; font-size: 1rem; }

        /* Next Follow Up */
        .fud-next-fu { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--surface-hover); border-radius: 0.5rem; margin-bottom: 1rem; }
        .fud-next-icon { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.9rem; }
        .fud-next-info { display: flex; flex-direction: column; flex: 1; }
        .fud-next-title { font-size: 0.9375rem; font-weight: 600; }
        .fud-next-date { font-size: 0.8125rem; color: var(--text-color-secondary); }

        .fud-plan-section { border-top: 1px solid var(--surface-border); padding-top: 0.875rem; }
        .fud-plan-label { font-size: 0.9375rem; color: var(--text-color-secondary); margin: 0 0 0.5rem; }
        .fud-schedule-btn { background: var(--p-primary-600) !important; border: none !important; }

        /* Lead Card */
        .fud-lead-card { text-align: center; }
        .fud-lead-header { display: flex; flex-direction: column; align-items: center; gap: 0.375rem; margin-bottom: 0.75rem; }
        .fud-lead-name-wrap { display: flex; align-items: center; gap: 0.375rem; }
        .fud-lead-name { font-size: 1.0625rem; font-weight: 700; }
        .fud-lead-email { font-size: 0.875rem; color: var(--text-color-secondary); }
        .fud-lead-phone { font-size: 0.875rem; color: var(--text-color-secondary); }

        .fud-lead-actions { display: flex; gap: 0.375rem; margin-top: 0.75rem; }
        .fud-lead-action {
            flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
            padding: 0.5rem 0.25rem; border-radius: 0.5rem; border: 1px solid var(--surface-border);
            background: var(--surface-card); cursor: pointer; transition: all 0.15s;
            font-size: 0.75rem; color: var(--text-color-secondary); font-weight: 500;
        }
        .fud-lead-action i { font-size: 0.9375rem; }
        .fud-lead-action:hover { background: var(--surface-hover); border-color: var(--surface-border); }

        /* Lead Info */
        .fud-lead-info-grid { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 0.75rem; }
        .fud-lead-field { display: flex; justify-content: space-between; align-items: center; }
        .fud-lead-field-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-color-secondary); }
        .fud-lead-field-value { font-size: 0.9375rem; font-weight: 500; text-align: right; }
        .fud-lead-interests { margin-bottom: 0.75rem; }
        .fud-interest-tags { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.375rem; }
        .fud-interest-tag { padding: 0.1875rem 0.5rem; border-radius: 999px; font-size: 0.8125rem; font-weight: 600; background: var(--surface-hover); color: var(--text-color-secondary); }

        .fud-view-all { display: block; font-size: 0.9375rem; font-weight: 600; color: var(--p-primary-600); cursor: pointer; margin-top: 0.5rem; text-decoration: none; }
        .fud-view-all:hover { text-decoration: underline; }

        /* Activity Timeline */
        .fud-activity-timeline { display: flex; flex-direction: column; }
        .fud-activity-item { display: flex; gap: 0.625rem; padding: 0.625rem 0; border-bottom: 1px solid var(--surface-border); }
        .fud-activity-item:last-child { border-bottom: none; }
        .fud-activity-icon { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.8125rem; }
        .fud-activity-content { display: flex; flex-direction: column; flex: 1; }
        .fud-activity-header { display: flex; align-items: center; justify-content: space-between; }
        .fud-activity-title { font-size: 0.9375rem; font-weight: 600; }
        .fud-activity-msg { font-size: 0.8125rem; color: var(--text-color-secondary); }
        .fud-activity-date { font-size: 0.75rem; color: var(--text-color-secondary); }

        /* Type Icon Classes */
        .fu-icon-phone { background: color-mix(in srgb, #22c55e 15%, var(--surface-card)); color: #22c55e; }
        .fu-icon-email { background: color-mix(in srgb, #3b82f6 15%, var(--surface-card)); color: #3b82f6; }
        .fu-icon-meeting { background: color-mix(in srgb, #f97316 15%, var(--surface-card)); color: #f97316; }
        .fu-icon-whatsapp { background: color-mix(in srgb, #16a34a 15%, var(--surface-card)); color: #16a34a; }
        .fu-icon-other { background: var(--surface-hover); color: var(--text-color-secondary); }
    `]
})
export class FollowUpDetail implements OnInit {
    followUp: FollowUp | null = null;
    lead: Lead | null = null;
    allLeadFollowUps: FollowUp[] = [];
    previousFollowUps: FollowUp[] = [];
    nextFollowUp: FollowUp | null = null;
    nextActionNote = '';
    scheduleDialog = false;
    scheduleData: any = {};
    followUpId = 0;

    discussionPoints = [
        'Understand travel destination preference',
        'Discuss travel dates and duration',
        'Budget and accommodation type',
        'Travelers count and special requests',
        'Next steps and itinerary presentation'
    ];

    typeOptions = [
        { label: 'Phone Call', value: 'Phone Call' },
        { label: 'Email', value: 'Email' },
        { label: 'Meeting', value: 'Meeting' },
        { label: 'WhatsApp', value: 'WhatsApp' },
        { label: 'Other', value: 'Other' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private leadCrmService: LeadCrmService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        const state = history.state;
        this.followUpId = +this.route.snapshot.paramMap.get('id')!;

        if (state?.followUp && state?.lead) {
            this.followUp = state.followUp;
            this.lead = state.lead;
            this.loadLeadFollowUps();
        } else {
            this.loadFromApi();
        }
    }

    loadFromApi() {
        this.leadCrmService.getAllFollowUps().subscribe({
            next: (fus) => {
                this.followUp = fus.find(f => f.id === this.followUpId) || null;
                if (this.followUp) {
                    this.leadCrmService.getLead(this.followUp.leadId).subscribe({
                        next: (lead) => { this.lead = lead; this.loadLeadFollowUps(); this.cdr.markForCheck(); },
                        error: () => {
                            this.leadCrmService.getLeads().subscribe(leads => {
                                this.lead = leads.find(l => l.id === this.followUp!.leadId) || null;
                                this.loadLeadFollowUps();
                                this.cdr.markForCheck();
                            });
                        }
                    });
                }
                this.cdr.markForCheck();
            }
        });
    }

    loadLeadFollowUps() {
        if (!this.followUp) return;
        this.leadCrmService.getFollowUps(this.followUp.leadId).subscribe({
            next: (fus) => {
                this.allLeadFollowUps = fus ?? [];
                const idx = this.allLeadFollowUps.findIndex(f => f.id === this.followUp!.id);
                this.previousFollowUps = this.allLeadFollowUps.filter(f => f.id !== this.followUp!.id && new Date(f.createdAt) < new Date(this.followUp!.createdAt)).slice(0, 3);
                const upcoming = this.allLeadFollowUps.filter(f => f.id !== this.followUp!.id && f.nextFollowUpDate && new Date(f.nextFollowUpDate) > new Date());
                this.nextFollowUp = upcoming.length > 0 ? upcoming[0] : null;
                this.cdr.markForCheck();
            }
        });
    }

    goBack() { this.router.navigate(['/sales/follow-ups']); }

    markCompleted() {
        this.messageService.add({ severity: 'success', summary: 'Completed', detail: 'Follow-up marked as completed' });
    }

    scheduleNext() {
        this.scheduleData = { type: 'Phone Call', message: this.nextActionNote, nextFollowUpDate: null };
        this.scheduleDialog = true;
    }

    saveSchedule() {
        if (!this.lead || !this.scheduleData.message?.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Message is required' });
            return;
        }
        const req: CreateFollowUpRequest = {
            leadId: this.lead.id,
            type: this.scheduleData.type,
            message: this.scheduleData.message,
            nextFollowUpDate: this.scheduleData.nextFollowUpDate
        };
        this.leadCrmService.createFollowUp(req).subscribe({
            next: () => {
                this.scheduleDialog = false;
                this.nextActionNote = '';
                this.loadLeadFollowUps();
                this.messageService.add({ severity: 'success', summary: 'Scheduled', detail: 'Next follow-up scheduled' });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to schedule follow-up' })
        });
    }

    // Helpers
    getStatus(): string {
        if (!this.followUp?.nextFollowUpDate) return 'Completed';
        const d = new Date(this.followUp.nextFollowUpDate); d.setHours(0,0,0,0);
        const today = new Date(); today.setHours(0,0,0,0);
        if (d < today) return 'Overdue';
        if (d.getTime() === today.getTime()) return 'Upcoming';
        return 'Upcoming';
    }

    getStatusSeverity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
        switch (this.getStatus()) {
            case 'Overdue': return 'danger';
            case 'Upcoming': return 'info';
            case 'Completed': return 'success';
            default: return 'secondary';
        }
    }

    isUpcoming(): boolean { return this.getStatus() === 'Upcoming'; }

    getCountdown(): string {
        if (!this.followUp?.nextFollowUpDate) return '';
        const diff = new Date(this.followUp.nextFollowUpDate).getTime() - new Date().getTime();
        if (diff <= 0) return 'Now';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 24) return `In ${Math.floor(hours / 24)}d ${hours % 24}h`;
        return `In ${hours}h ${mins}m`;
    }

    getPrioritySeverity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
        switch (this.lead?.priority) {
            case 'Low': return 'secondary';
            case 'Medium': return 'warn';
            case 'High': return 'warn';
            case 'Urgent': return 'danger';
            default: return 'secondary';
        }
    }

    getLeadStatusSeverity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
        switch (this.lead?.status) {
            case 'New': return 'info';
            case 'InProgress': return 'warn';
            case 'Converted': return 'success';
            case 'Lost': return 'danger';
            default: return 'secondary';
        }
    }

    getFollowUpStatus(fu: FollowUp): string {
        if (!fu.nextFollowUpDate) return 'Completed';
        const d = new Date(fu.nextFollowUpDate); d.setHours(0,0,0,0);
        const today = new Date(); today.setHours(0,0,0,0);
        if (d < today) return 'Overdue';
        if (d.getTime() === today.getTime()) return 'Due Today';
        return 'Scheduled';
    }

    getFollowUpStatusSeverity(fu: FollowUp): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
        switch (this.getFollowUpStatus(fu)) {
            case 'Overdue': return 'danger';
            case 'Due Today': return 'warn';
            case 'Scheduled': return 'info';
            case 'Completed': return 'success';
            default: return 'secondary';
        }
    }

    getLeadInitials(): string {
        const name = this.lead?.name || '?';
        const parts = name.trim().split(/\s+/);
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    }

    getLeadColor(): string {
        const colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
        const id = this.lead?.id || 0;
        return colors[id % colors.length];
    }

    getOwnerInitials(): string {
        const name = this.followUp?.createdBy || this.lead?.assignedTo || 'U';
        const parts = name.trim().split(/\s+/);
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    }

    getInterestTags(): string[] {
        return (this.lead?.interestedIn || '').split(',').map(s => s.trim()).filter(s => s.length > 0);
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
