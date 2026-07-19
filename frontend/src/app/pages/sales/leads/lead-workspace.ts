import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { MessageService } from 'primeng/api';
import { LeadCrmService, Lead, FollowUp, CreateFollowUpRequest } from '../../../shared/services/lead-crm.service';
import { ItineraryBuilderService, BuilderListItem } from '../../itinerary-builder/itinerary-builder.service';
import { ProposalService, ProposalListItem } from '../../booking/proposal.service';

@Component({
    selector: 'app-lead-workspace',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, InputTextModule,
        TagModule, DialogModule, SelectModule, TextareaModule,
        ToastModule, TooltipModule, DatePickerModule, AvatarModule
    ],
    providers: [MessageService],
    template: `
<p-toast />

<div *ngIf="lead">
    <!-- BACK NAV -->
    <a class="ws-back mb-3 inline-flex" (click)="goBack()"><i class="pi pi-arrow-left"></i> Back to Leads</a>

    <!-- HEADER CARD -->
    <div class="card mb-4 ws-header">
        <!-- Row 1: Identity + Actions -->
        <div class="ws-header-top">
            <div class="ws-header-identity">
                <p-avatar [label]="getInitials(lead.name)" [style]="{ 'background-color': getAvatarColor(lead.name), 'color': '#fff', 'font-size': '1.25rem', 'width': '52px', 'height': '52px' }" shape="circle" />
                <div class="ws-header-info">
                    <div class="ws-header-name-row">
                        <span class="ws-header-name">{{ lead.name }}</span>
                        <p-tag [value]="getStatusLabel(lead.status)" [severity]="getStatusSeverity(lead.status)" [rounded]="true" />
                        <p-tag [value]="lead.priority" [severity]="getPrioritySeverity(lead.priority)" [rounded]="true" />
                    </div>
                    <div class="ws-header-contact">
                        @if (lead.email) {
                        <span class="ws-contact-chip"><i class="pi pi-envelope"></i> {{ lead.email }}</span>
                        }
                        @if (lead.phone) {
                        <span class="ws-contact-chip"><i class="pi pi-phone"></i> {{ lead.phone }}</span>
                        }
                        @if (lead.source) {
                        <span class="ws-contact-chip ws-contact-source"><i class="pi pi-link"></i> {{ lead.source }}</span>
                        }
                    </div>
                </div>
            </div>
            <div class="ws-header-actions">
                <p-button label="Edit Lead" icon="pi pi-pencil" [outlined]="true" severity="secondary" size="small"></p-button>
                <p-button label="Actions" icon="pi pi-chevron-down" iconPos="right" [outlined]="true" severity="secondary" size="small"></p-button>
            </div>
        </div>
    </div>

    <!-- TABS + CONTENT CARD -->
    <div class="card">
        <!-- Tabs -->
        <div class="ws-tabs">
            @for (tab of tabs; track tab.key) {
            <button class="ws-tab" [class.active]="activeTab === tab.key" (click)="activeTab = tab.key">
                {{ tab.label }}
                @if (tab.count !== undefined && tab.count > 0) {
                <span class="ws-tab-count">{{ tab.count }}</span>
                }
            </button>
            }
        </div>

        <!-- TAB CONTENT -->
        <div class="ws-content">

            <!-- ==================== OVERVIEW TAB ==================== -->
            @if (activeTab === 'overview') {

            <!-- Trip Highlights -->
            <div class="ov-trip-highlights mb-5">
                <div class="ov-trip-card">
                    <div class="ov-trip-icon ov-trip-icon-dest"><i class="pi pi-map-marker"></i></div>
                    <div class="ov-trip-label">Destination</div>
                    <div class="ov-trip-value">{{ lead.country || 'Not specified' }}</div>
                </div>
                <div class="ov-trip-card">
                    <div class="ov-trip-icon ov-trip-icon-date"><i class="pi pi-calendar"></i></div>
                    <div class="ov-trip-label">Travel Dates</div>
                    <div class="ov-trip-value">{{ getTravelDates() }}</div>
                </div>
                <div class="ov-trip-card">
                    <div class="ov-trip-icon ov-trip-icon-pax"><i class="pi pi-users"></i></div>
                    <div class="ov-trip-label">Pax</div>
                    <div class="ov-trip-value">{{ lead.pax ? (lead.pax + ' Adults') : 'Not specified' }}</div>
                </div>
                <div class="ov-trip-card">
                    <div class="ov-trip-icon ov-trip-icon-budget"><i class="pi pi-wallet"></i></div>
                    <div class="ov-trip-label">Budget</div>
                    <div class="ov-trip-value">{{ lead.budget ? (lead.currency + ' ' + lead.budget) : 'Not specified' }}</div>
                </div>
                <div class="ov-trip-card">
                    <div class="ov-trip-icon ov-trip-icon-interest"><i class="pi pi-star"></i></div>
                    <div class="ov-trip-label">Interested In</div>
                    <div class="ov-trip-value">{{ lead.interestedIn || 'Not specified' }}</div>
                </div>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-12 gap-4 mb-4">
                <div class="col-span-6 md:col-span-3">
                    <div class="ov-stat-card">
                        <div class="ov-stat-icon ov-stat-blue"><i class="pi pi-comments"></i></div>
                        <div>
                            <div class="ov-stat-number">{{ followUps.length }}</div>
                            <div class="ov-stat-label">Follow Ups</div>
                        </div>
                    </div>
                </div>
                <div class="col-span-6 md:col-span-3">
                    <div class="ov-stat-card">
                        <div class="ov-stat-icon ov-stat-green"><i class="pi pi-calendar"></i></div>
                        <div>
                            <div class="ov-stat-number">{{ daysAsLead }}</div>
                            <div class="ov-stat-label">Days as Lead</div>
                        </div>
                    </div>
                </div>
                <div class="col-span-6 md:col-span-3">
                    <div class="ov-stat-card">
                        <div class="ov-stat-icon ov-stat-orange"><i class="pi pi-map"></i></div>
                        <div>
                            <div class="ov-stat-number">0</div>
                            <div class="ov-stat-label">Itineraries</div>
                        </div>
                    </div>
                </div>
                <div class="col-span-6 md:col-span-3">
                    <div class="ov-stat-card">
                        <div class="ov-stat-icon ov-stat-purple"><i class="pi pi-file"></i></div>
                        <div>
                            <div class="ov-stat-number">{{ proposals.length }}</div>
                            <div class="ov-stat-label">Proposals</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-4">
                <!-- LEFT COLUMN: Lead Info + Next Follow Up -->
                <div class="col-span-12 xl:col-span-8">
                    <!-- Lead Details -->
                    <div class="ov-section mb-4">
                        <div class="ov-section-header">
                            <div class="ov-section-title"><i class="pi pi-user"></i> Lead Details</div>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
                            <div class="ov-detail-item">
                                <span class="ov-detail-label">Source</span>
                                <span class="ov-detail-value">
                                    <span class="ov-source-badge" [attr.data-source]="lead.source">{{ lead.source }}</span>
                                </span>
                            </div>
                            <div class="ov-detail-item">
                                <span class="ov-detail-label">Priority</span>
                                <span class="ov-detail-value"><p-tag [value]="lead.priority" [severity]="getPrioritySeverity(lead.priority)" [rounded]="true" /></span>
                            </div>
                            <div class="ov-detail-item">
                                <span class="ov-detail-label">Lead Owner</span>
                                <span class="ov-detail-value">
                                    @if (lead.assignedTo) {
                                    <span class="flex items-center gap-2">
                                        <p-avatar [label]="getInitials(lead.assignedTo)" shape="circle" [style]="{ 'background-color': getAvatarColor(lead.assignedTo), 'color': '#fff', 'font-size': '0.65rem', 'width': '24px', 'height': '24px' }" />
                                        {{ lead.assignedTo }}
                                    </span>
                                    } @else {
                                    <span class="text-muted-color">Unassigned</span>
                                    }
                                </span>
                            </div>
                            <div class="ov-detail-item">
                                <span class="ov-detail-label">Interested In</span>
                                <span class="ov-detail-value">{{ lead.interestedIn || '-' }}</span>
                            </div>
                            <div class="ov-detail-item">
                                <span class="ov-detail-label">Status</span>
                                <span class="ov-detail-value"><p-tag [value]="getStatusLabel(lead.status)" [severity]="getStatusSeverity(lead.status)" [rounded]="true" /></span>
                            </div>
                            <div class="ov-detail-item">
                                <span class="ov-detail-label">Created</span>
                                <span class="ov-detail-value">{{ lead.createdAt | date:'d MMM yyyy' }}</span>
                            </div>
                            <div class="ov-detail-item">
                                <span class="ov-detail-label">Last Activity</span>
                                <span class="ov-detail-value">{{ lead.updatedAt | date:'d MMM yyyy' }}</span>
                            </div>
                            <div class="ov-detail-item">
                                <span class="ov-detail-label">Follow Up Count</span>
                                <span class="ov-detail-value">{{ followUps.length }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Next Follow Up -->
                    @if (nextFollowUp) {
                    <div class="ov-followup-banner mb-4">
                        <div class="flex items-center gap-3 flex-1">
                            <div class="ov-fu-icon"><i class="pi pi-bell"></i></div>
                            <div>
                                <div class="font-bold">Next Follow Up: {{ formatFollowUpDate(nextFollowUp.nextFollowUpDate!) }}</div>
                                <div class="text-sm mt-0.5" style="opacity: 0.85">{{ nextFollowUp.message }}</div>
                            </div>
                        </div>
                        <div class="flex gap-2 flex-shrink-0">
                            <p-button label="Done" [outlined]="true" severity="success" size="small" icon="pi pi-check" styleClass="ov-fu-action-btn"></p-button>
                            <p-button label="Reschedule" [outlined]="true" severity="secondary" size="small" icon="pi pi-calendar" styleClass="ov-fu-action-btn"></p-button>
                        </div>
                    </div>
                    }

                    <!-- Timeline -->
                    <div class="ov-section">
                        <div class="ov-section-header">
                            <div class="ov-section-title"><i class="pi pi-history"></i> Activity Timeline</div>
                        </div>
                        <div class="ws-timeline">
                            @for (event of timelineEvents; track event.id) {
                            <div class="tl-item">
                                <div class="tl-dot" [ngClass]="event.dotClass"></div>
                                <div class="tl-content">
                                    <span class="tl-date">{{ formatTimelineDate(event.date) }}</span>
                                    <span class="tl-text">{{ event.text }}</span>
                                </div>
                            </div>
                            }
                            @if (timelineEvents.length === 0) {
                            <div class="text-muted-color text-center py-6">No activity recorded yet</div>
                            }
                        </div>
                    </div>
                </div>

                <!-- RIGHT COLUMN: Notes -->
                <div class="col-span-12 xl:col-span-4">
                    <!-- Notes -->
                    <div class="ov-section">
                        <div class="ov-section-header">
                            <div class="ov-section-title"><i class="pi pi-bookmark"></i> Notes</div>
                            <a class="text-primary cursor-pointer text-sm font-semibold" (click)="activeTab = 'notes'">View all</a>
                        </div>
                        @if (lead.notes) {
                        <div class="ov-note-card">
                            <div class="text-muted-color text-xs font-semibold mb-1">{{ lead.updatedAt | date:'d MMM, hh:mm a' }}</div>
                            <p class="leading-relaxed" style="word-break: break-word">{{ lead.notes }}</p>
                        </div>
                        } @else {
                        <div class="ov-note-empty">
                            <i class="pi pi-pencil" style="font-size: 1.25rem; opacity: 0.4"></i>
                            <span>No notes added yet</span>
                            <a class="text-primary cursor-pointer text-sm font-semibold" (click)="activeTab = 'notes'">Add a note</a>
                        </div>
                        }
                    </div>
                </div>
            </div>
            }

            <!-- ==================== FOLLOW UPS TAB ==================== -->
            @if (activeTab === 'followups') {
            <div class="flex justify-between items-center mb-4">
                <div class="font-semibold text-lg">Follow Up Timeline</div>
                <p-button label="+ Add Follow Up" size="small" (click)="addFollowUpDialog = true"></p-button>
            </div>

            <div class="flex gap-4">
                <div class="flex-1 flex flex-col gap-0">
                    @for (fu of followUps; track fu.id) {
                    <div class="ws-fu-item">
                        <div class="ws-fu-rail">
                            <div class="ws-fu-dot" [ngClass]="getFuDotClass(fu.type)">
                                <i [class]="getFuIcon(fu.type)" style="font-size: 0.625rem"></i>
                            </div>
                            <div class="ws-fu-line"></div>
                        </div>
                        <div class="ws-fu-card" (click)="selectedFollowUp = fu">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-muted-color text-sm">{{ fu.createdAt | date:'d MMM yyyy, hh:mm a' }}</span>
                                <p-tag [value]="getFollowUpStatus(fu)" [severity]="getFuStatusSeverity(fu)" />
                            </div>
                            <span class="font-bold">{{ fu.type }}</span>
                            <p class="text-muted-color mt-1 leading-relaxed">{{ fu.message }}</p>
                            @if (fu.nextFollowUpDate) {
                            <div class="text-muted-color text-sm mt-2 flex items-center gap-1">
                                <i class="pi pi-calendar"></i>
                                Next: {{ formatFollowUpDate(fu.nextFollowUpDate) }}
                            </div>
                            }
                        </div>
                    </div>
                    }
                    @if (followUps.length === 0) {
                    <div class="ws-empty">
                        <i class="pi pi-comments" style="font-size: 2.5rem"></i>
                        <span style="font-weight: 600">No follow-ups yet</span>
                        <span class="text-sm text-center">Record calls, emails, and meetings with this lead</span>
                        <p-button label="Add First Follow Up" size="small" (click)="addFollowUpDialog = true"></p-button>
                    </div>
                    }
                </div>

                <!-- Follow Up Details sidebar -->
                @if (selectedFollowUp) {
                <div class="card mb-0 ws-fu-detail-card">
                    <div class="font-semibold text-base mb-3">Follow Up Details</div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1">
                            <span class="text-muted-color font-semibold text-xs uppercase tracking-wide">Type</span>
                            <span>{{ selectedFollowUp.type }}</span>
                        </div>
                        <div class="flex flex-col gap-1">
                            <span class="text-muted-color font-semibold text-xs uppercase tracking-wide">Date & Time</span>
                            <span>{{ selectedFollowUp.createdAt | date:'d MMM yyyy, hh:mm a' }}</span>
                        </div>
                        <div class="flex flex-col gap-1">
                            <span class="text-muted-color font-semibold text-xs uppercase tracking-wide">Owner</span>
                            <span>{{ selectedFollowUp.createdBy || '-' }}</span>
                        </div>
                    </div>
                    <div class="mt-4">
                        <span class="text-muted-color font-semibold text-xs uppercase tracking-wide">Notes</span>
                        <p class="text-muted-color mt-1 leading-relaxed">{{ selectedFollowUp.message }}</p>
                    </div>
                </div>
                }
            </div>
            }

            <!-- ==================== PROPOSALS TAB ==================== -->
            @if (activeTab === 'proposals') {
            <div class="flex justify-between items-center mb-4">
                <div class="font-semibold text-lg">Proposals</div>
                <p-button label="+ New Proposal" size="small" icon="pi pi-plus" (click)="openProposalPicker()"></p-button>
            </div>

            <!-- Existing Proposals List -->
            @if (proposals.length > 0) {
            <div class="prop-list">
                @for (prop of proposals; track prop.id) {
                <div class="prop-card">
                    <div class="prop-card-header">
                        <div class="prop-card-title">
                            <i class="pi pi-file-edit"></i>
                            <span>{{ prop.itineraryTitle }}</span>
                        </div>
                        <p-tag [value]="prop.status" [severity]="getProposalStatusSeverity(prop.status)" [rounded]="true" />
                    </div>
                    <div class="prop-card-meta">
                        <span><i class="pi pi-calendar"></i> {{ prop.createdAt | date:'d MMM yyyy' }}</span>
                        <span><i class="pi pi-map"></i> {{ prop.startDate | date:'d MMM' }} - {{ prop.endDate | date:'d MMM yyyy' }}</span>
                        @if (prop.totalAmount) {
                        <span><i class="pi pi-wallet"></i> USD {{ prop.totalAmount | number:'1.0-0' }}</span>
                        }
                    </div>
                    <div class="prop-card-actions">
                        <p-button label="View" icon="pi pi-eye" [text]="true" size="small" (click)="viewProposal(prop)"></p-button>
                        <p-button label="Send" icon="pi pi-send" [text]="true" size="small" severity="success" (click)="resendProposal(prop)"></p-button>
                        <p-button label="Download" icon="pi pi-download" [text]="true" size="small" severity="secondary" (click)="downloadProposal(prop)"></p-button>
                    </div>
                </div>
                }
            </div>
            } @else {
            <div class="ws-empty">
                <i class="pi pi-file" style="font-size: 2.5rem"></i>
                <span style="font-weight: 600">No proposals yet</span>
                <span class="text-sm text-center">Create a proposal from a master itinerary template or build one from scratch</span>
                <p-button label="Create First Proposal" size="small" icon="pi pi-plus" (click)="openProposalPicker()"></p-button>
            </div>
            }
            }

            <!-- ==================== PAYMENTS TAB ==================== -->
            @if (activeTab === 'payments') {
            <div class="font-semibold text-lg mb-4">Payments</div>
            <div class="ws-empty">
                <i class="pi pi-wallet" style="font-size: 2.5rem"></i>
                <span style="font-weight: 600">No payments yet</span>
                <span class="text-sm text-center">Payment records will appear here once invoices are generated</span>
            </div>
            }

            <!-- ==================== NOTES TAB ==================== -->
            @if (activeTab === 'notes') {
            <div class="font-semibold text-lg mb-4">Notes</div>
            <div style="max-width: 720px">
                <textarea pTextarea [(ngModel)]="lead.notes" rows="8" placeholder="Add notes about this lead..." class="w-full"></textarea>
                <p-button label="Save Notes" icon="pi pi-save" size="small" class="mt-2" (click)="saveNotes()"></p-button>
            </div>
            }

            <!-- ==================== TASKS TAB ==================== -->
            @if (activeTab === 'tasks') {
            <div class="flex justify-between items-center mb-4">
                <div class="font-semibold text-lg">Tasks</div>
                <p-button label="+ Add Task" size="small" icon="pi pi-plus"></p-button>
            </div>
            <div class="ws-empty">
                <i class="pi pi-check-square" style="font-size: 2.5rem"></i>
                <span style="font-weight: 600">No tasks yet</span>
                <span class="text-sm text-center">Add tasks to track action items for this lead</span>
            </div>
            }

            <!-- ==================== FILES TAB ==================== -->
            @if (activeTab === 'files') {
            <div class="flex justify-between items-center mb-4">
                <div class="font-semibold text-lg">Files</div>
                <p-button label="Upload" size="small" icon="pi pi-upload"></p-button>
            </div>
            <div class="ws-empty">
                <i class="pi pi-folder-open" style="font-size: 2.5rem"></i>
                <span style="font-weight: 600">No files yet</span>
                <span class="text-sm text-center">Upload documents, photos, or other files related to this lead</span>
            </div>
            }
        </div>
    </div>
</div>

<!-- PROPOSAL CREATION PICKER DIALOG -->
<p-dialog [(visible)]="showProposalPicker" [style]="{ width: '700px' }" header="Create New Proposal" [modal]="true" styleClass="proposal-picker-dialog">
    <ng-template #content>
        <div class="pp-options">
            <!-- Option 1: From Template -->
            <div class="pp-option-card" [class.pp-selected]="proposalCreateMode === 'template'" (click)="proposalCreateMode = 'template'">
                <div class="pp-option-icon pp-icon-template"><i class="pi pi-book"></i></div>
                <div class="pp-option-info">
                    <div class="pp-option-title">Start from Template</div>
                    <div class="pp-option-desc">Pick a master itinerary and customize it for this lead</div>
                </div>
                <i class="pi pi-chevron-right pp-option-arrow"></i>
            </div>

            <!-- Option 2: From Scratch -->
            <div class="pp-option-card" [class.pp-selected]="proposalCreateMode === 'scratch'" (click)="proposalCreateMode = 'scratch'">
                <div class="pp-option-icon pp-icon-scratch"><i class="pi pi-pencil"></i></div>
                <div class="pp-option-info">
                    <div class="pp-option-title">Build from Scratch</div>
                    <div class="pp-option-desc">Open the itinerary builder and create a custom trip for this lead</div>
                </div>
                <i class="pi pi-chevron-right pp-option-arrow"></i>
            </div>
        </div>

        <!-- Template List (shown when 'template' is selected) -->
        @if (proposalCreateMode === 'template') {
        <div class="pp-template-section">
            <div class="pp-template-header">
                <span class="font-semibold">Select a Master Itinerary</span>
                <span class="text-muted-color text-sm">{{ masterItineraries.length }} templates available</span>
            </div>
            @if (masterItineraries.length > 0) {
            <div class="pp-template-list">
                @for (itin of masterItineraries; track itin.id) {
                <div class="pp-template-item" [class.pp-template-selected]="selectedTemplateId === itin.id" (click)="selectedTemplateId = itin.id">
                    <div class="pp-tpl-radio">
                        <div class="pp-tpl-radio-dot" [class.active]="selectedTemplateId === itin.id"></div>
                    </div>
                    <div class="pp-tpl-info">
                        <div class="pp-tpl-title">{{ itin.title }}</div>
                        <div class="pp-tpl-meta">
                            <span><i class="pi pi-calendar"></i> {{ itin.durationDays }} Days</span>
                            <span><i class="pi pi-users"></i> {{ itin.numPax }} Pax</span>
                            <span><i class="pi pi-tag"></i> {{ itin.defaultCurrency }}</span>
                        </div>
                    </div>
                    <p-tag [value]="itin.status" severity="info" [rounded]="true" />
                </div>
                }
            </div>
            } @else {
            <div class="pp-template-empty">
                <i class="pi pi-info-circle"></i>
                <span>No master itineraries found. <a class="text-primary cursor-pointer" (click)="goToBuilder()">Create one first</a></span>
            </div>
            }
        </div>
        }
    </ng-template>
    <ng-template #footer>
        <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="showProposalPicker = false"></button>
        @if (proposalCreateMode === 'template') {
        <button pButton label="Use Template" icon="pi pi-arrow-right" [disabled]="!selectedTemplateId" (click)="createProposalFromTemplate()"></button>
        }
        @if (proposalCreateMode === 'scratch') {
        <button pButton label="Open Builder" icon="pi pi-external-link" (click)="createProposalFromScratch()"></button>
        }
    </ng-template>
</p-dialog>

<!-- ADD FOLLOW UP DIALOG -->
<p-dialog [(visible)]="addFollowUpDialog" [style]="{ width: '480px' }" header="Add Follow Up" [modal]="true" styleClass="p-fluid">
    <ng-template #content>
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Type *</label>
                <p-select [(ngModel)]="newFollowUp.type" [options]="followUpTypes" optionLabel="label" optionValue="value" placeholder="Select type" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Message *</label>
                <textarea pTextarea [(ngModel)]="newFollowUp.message" rows="4" placeholder="Describe the follow-up..."></textarea>
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm">Next Follow-up Date</label>
                <p-datepicker [(ngModel)]="newFollowUp.nextFollowUpDate" dateFormat="yy-mm-dd" [showIcon]="true" [showTime]="true" />
            </div>
        </div>
    </ng-template>
    <ng-template #footer>
        <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="addFollowUpDialog = false"></button>
        <button pButton label="Save" icon="pi pi-check" (click)="saveFollowUp()"></button>
    </ng-template>
</p-dialog>
    `,
    styles: [`
        /* Back link */
        .ws-back { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: var(--text-color-secondary); cursor: pointer; transition: color 0.15s; text-decoration: none; }
        .ws-back:hover { color: var(--primary-color); }

        /* ======================== HEADER CARD ======================== */
        .ws-header { padding: 0 !important; overflow: hidden; }
        .ws-header-top {
            display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
            padding: 1.25rem 1.5rem; flex-wrap: wrap;
        }
        .ws-header-identity { display: flex; align-items: center; gap: 1rem; min-width: 0; }
        .ws-header-info { display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; }
        .ws-header-name-row { display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap; }
        .ws-header-name { font-size: 1.625rem; font-weight: 800; line-height: 1.3; white-space: nowrap; }
        .ws-header-contact { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .ws-contact-chip {
            display: inline-flex; align-items: center; gap: 0.375rem;
            padding: 0.25rem 0.625rem; border-radius: 0.375rem;
            font-size: 0.9375rem; font-weight: 500; color: var(--text-color-secondary);
            background: var(--surface-hover); white-space: nowrap;
        }
        .ws-contact-chip i { font-size: 0.75rem; }
        .ws-contact-source { color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 10%, var(--surface-card)); }
        .ws-header-actions { display: flex; gap: 0.5rem; flex-shrink: 0; padding-top: 0.25rem; }

        /* Trip Highlights in Overview */
        .ov-trip-highlights {
            display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem;
        }
        @media (max-width: 768px) { .ov-trip-highlights { grid-template-columns: repeat(2, 1fr); } }
        .ov-trip-card {
            display: flex; flex-direction: column; align-items: center; text-align: center;
            padding: 1.5rem 1rem; border-radius: 0.875rem;
            background: var(--surface-card); border: 1px solid var(--surface-border);
            transition: all 0.2s;
        }
        .ov-trip-card:hover { box-shadow: 0 4px 20px color-mix(in srgb, var(--text-color) 7%, transparent); transform: translateY(-2px); }
        .ov-trip-icon {
            width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-size: 1.25rem; margin-bottom: 0.875rem;
        }
        .ov-trip-icon-dest { background: color-mix(in srgb, #ef4444 12%, var(--surface-card)); color: #ef4444; }
        .ov-trip-icon-date { background: color-mix(in srgb, #3b82f6 12%, var(--surface-card)); color: #3b82f6; }
        .ov-trip-icon-pax { background: color-mix(in srgb, #22c55e 12%, var(--surface-card)); color: #22c55e; }
        .ov-trip-icon-budget { background: color-mix(in srgb, #f97316 12%, var(--surface-card)); color: #f97316; }
        .ov-trip-icon-interest { background: color-mix(in srgb, #8b5cf6 12%, var(--surface-card)); color: #8b5cf6; }
        .ov-trip-label {
            font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
            color: var(--text-color-secondary); margin-bottom: 0.375rem;
        }
        .ov-trip-value { font-size: 1.125rem; font-weight: 700; line-height: 1.4; color: var(--text-color); }

        /* Tabs */
        .ws-tabs {
            display: flex; gap: 0; margin: -1.25rem -1.25rem 0; padding: 0 1.25rem;
            border-bottom: 1px solid var(--surface-border); overflow-x: auto;
        }
        .ws-tab {
            display: inline-flex; align-items: center; gap: 0.375rem;
            padding: 0.75rem 1rem; font-size: 1rem; font-weight: 600;
            border: none; background: transparent; cursor: pointer; color: var(--text-color-secondary);
            border-bottom: 2px solid transparent; transition: all 0.15s; white-space: nowrap;
        }
        .ws-tab:hover { color: var(--text-color); }
        .ws-tab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
        .ws-tab-count {
            font-size: 0.75rem; font-weight: 700; min-width: 1.125rem; text-align: center;
            padding: 0 0.3rem; border-radius: 999px;
            background: var(--surface-border); color: var(--text-color-secondary);
        }
        .ws-tab.active .ws-tab-count { background: color-mix(in srgb, var(--primary-color) 15%, var(--surface-card)); color: var(--primary-color); }

        /* Content area */
        .ws-content { padding: 1.25rem 0 0; }

        /* ======================== OVERVIEW STATS ======================== */
        .ov-stat-card {
            display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem;
            border-radius: 0.875rem; background: var(--surface-card);
            border: 1px solid var(--surface-border); transition: all 0.2s;
        }
        .ov-stat-card:hover { box-shadow: 0 4px 16px color-mix(in srgb, var(--text-color) 6%, transparent); }
        .ov-stat-icon {
            width: 44px; height: 44px; border-radius: 0.75rem;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.125rem; flex-shrink: 0;
        }
        .ov-stat-blue { background: color-mix(in srgb, #3b82f6 15%, var(--surface-card)); color: #3b82f6; }
        .ov-stat-green { background: color-mix(in srgb, #22c55e 15%, var(--surface-card)); color: #22c55e; }
        .ov-stat-orange { background: color-mix(in srgb, #f97316 15%, var(--surface-card)); color: #f97316; }
        .ov-stat-purple { background: color-mix(in srgb, #8b5cf6 15%, var(--surface-card)); color: #8b5cf6; }
        .ov-stat-number { font-size: 1.5rem; font-weight: 800; line-height: 1.2; }
        .ov-stat-label { font-size: 0.9375rem; color: var(--text-color-secondary); font-weight: 500; }

        /* ======================== SECTIONS ======================== */
        .ov-section {
            border: 1px solid var(--surface-border); border-radius: 0.875rem;
            background: var(--surface-card); overflow: hidden;
        }
        .ov-section-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 1rem 1.25rem; border-bottom: 1px solid var(--surface-border);
        }
        .ov-section-title {
            font-size: 1.0625rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;
        }
        .ov-section-title i { color: var(--text-color-secondary); font-size: 0.875rem; }

        /* Lead Details grid */
        .ov-detail-item { display: flex; flex-direction: column; gap: 0.5rem; padding: 1.125rem 1.25rem; }
        .ov-detail-label { font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-color-secondary); }
        .ov-detail-value { font-size: 1.125rem; font-weight: 600; }

        .ov-source-badge {
            display: inline-block; padding: 0.1875rem 0.625rem; border-radius: 0.375rem;
            font-size: 0.8125rem; font-weight: 600;
            background: var(--surface-hover); color: var(--text-color-secondary);
        }
        .ov-source-badge[data-source="Website"] { background: color-mix(in srgb, #3b82f6 12%, var(--surface-card)); color: #3b82f6; }
        .ov-source-badge[data-source="Referral"] { background: color-mix(in srgb, #22c55e 12%, var(--surface-card)); color: #22c55e; }
        .ov-source-badge[data-source="Facebook"] { background: color-mix(in srgb, #3b82f6 12%, var(--surface-card)); color: #1877f2; }
        .ov-source-badge[data-source="Instagram"] { background: color-mix(in srgb, #e1306c 12%, var(--surface-card)); color: #e1306c; }
        .ov-source-badge[data-source="Google Ads"] { background: color-mix(in srgb, #f97316 12%, var(--surface-card)); color: #f97316; }
        .ov-source-badge[data-source="Walk-in"] { background: color-mix(in srgb, #8b5cf6 12%, var(--surface-card)); color: #8b5cf6; }
        .ov-source-badge[data-source="WhatsApp"] { background: color-mix(in srgb, #22c55e 12%, var(--surface-card)); color: #16a34a; }

        /* ======================== FOLLOW UP BANNER ======================== */
        .ov-followup-banner {
            display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
            padding: 1rem 1.25rem; border-radius: 0.875rem;
            background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-card));
            border: 1px solid color-mix(in srgb, var(--primary-color) 20%, var(--surface-border));
            color: var(--text-color);
        }
        .ov-fu-icon {
            width: 40px; height: 40px; border-radius: 50%;
            background: color-mix(in srgb, var(--primary-color) 18%, var(--surface-card));
            color: var(--primary-color); display: flex; align-items: center; justify-content: center;
            font-size: 1rem; flex-shrink: 0;
        }

        /* ======================== NOTES ======================== */
        .ov-note-card {
            padding: 1rem 1.25rem; font-size: 1rem; color: var(--text-color-secondary); line-height: 1.7;
        }
        .ov-note-empty {
            display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
            padding: 2rem 1rem; text-align: center; color: var(--text-color-secondary); font-size: 0.875rem;
        }

        /* ======================== TIMELINE ======================== */
        .ws-timeline { display: flex; flex-direction: column; gap: 0; padding: 0.5rem 1.25rem 1rem; }
        .tl-item { display: flex; gap: 0.75rem; padding: 0.625rem 0; position: relative; }
        .tl-item::before {
            content: ''; position: absolute; left: 5px; top: 1.5rem; bottom: -0.5rem;
            width: 2px; background: var(--surface-border);
        }
        .tl-item:last-child::before { display: none; }
        .tl-dot {
            width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; margin-top: 0.25rem;
            border: 2px solid var(--surface-border); background: var(--surface-card); z-index: 1;
        }
        .tl-dot.dot-blue { border-color: #3b82f6; background: #3b82f6; }
        .tl-dot.dot-green { border-color: #22c55e; background: #22c55e; }
        .tl-dot.dot-orange { border-color: #f97316; background: #f97316; }
        .tl-dot.dot-purple { border-color: #8b5cf6; background: #8b5cf6; }
        .tl-dot.dot-red { border-color: #ef4444; background: #ef4444; }
        .tl-content { display: flex; flex-direction: column; gap: 0.25rem; }
        .tl-date { font-size: 1rem; font-weight: 600; color: var(--text-color-secondary); }
        .tl-text { font-size: 1.0625rem; color: var(--text-color); line-height: 1.6; }

        /* ======================== FOLLOW UPS TAB ======================== */
        .ws-fu-item { display: flex; gap: 0; }
        .ws-fu-rail { display: flex; flex-direction: column; align-items: center; width: 40px; flex-shrink: 0; padding-top: 0.75rem; }
        .ws-fu-dot {
            width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; color: #fff;
        }
        .ws-fu-dot.dot-phone { background: #22c55e; }
        .ws-fu-dot.dot-email { background: #3b82f6; }
        .ws-fu-dot.dot-meeting { background: #f97316; }
        .ws-fu-dot.dot-whatsapp { background: #16a34a; }
        .ws-fu-dot.dot-other { background: var(--text-color-secondary); }
        .ws-fu-line { flex: 1; width: 2px; background: var(--surface-border); margin-top: 0.25rem; min-height: 12px; }
        .ws-fu-card {
            flex: 1; padding: 1rem 1.25rem; margin-bottom: 0.5rem;
            border: 1px solid var(--surface-border); border-radius: 0.625rem;
            cursor: pointer; transition: all 0.15s;
        }
        .ws-fu-card:hover { background: var(--surface-hover); border-color: var(--primary-color); }
        .ws-fu-detail-card { width: 300px; min-width: 300px; align-self: flex-start; }

        /* ======================== EMPTY STATES ======================== */
        .ws-empty {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 1rem; padding: 3rem 2rem; color: var(--text-color-secondary); font-size: 1rem;
            border: 1px dashed var(--surface-border); border-radius: 0.75rem;
        }
        .ws-empty i { opacity: 0.5; }

        /* ======================== PROPOSALS LIST ======================== */
        .prop-list { display: flex; flex-direction: column; gap: 1rem; }
        .prop-card {
            border: 1px solid var(--surface-border); border-radius: 0.875rem;
            padding: 1.25rem 1.5rem; background: var(--surface-card); transition: all 0.2s;
        }
        .prop-card:hover { box-shadow: 0 4px 16px color-mix(in srgb, var(--text-color) 6%, transparent); }
        .prop-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .prop-card-title { display: flex; align-items: center; gap: 0.625rem; font-size: 1.0625rem; font-weight: 700; }
        .prop-card-title i { color: var(--primary-color); }
        .prop-card-meta {
            display: flex; align-items: center; gap: 1.25rem; font-size: 0.9375rem;
            color: var(--text-color-secondary); margin-bottom: 0.75rem;
        }
        .prop-card-meta span { display: inline-flex; align-items: center; gap: 0.375rem; }
        .prop-card-meta i { font-size: 0.8125rem; }
        .prop-card-actions { display: flex; gap: 0.25rem; }

        /* ======================== PROPOSAL PICKER DIALOG ======================== */
        .pp-options { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
        .pp-option-card {
            display: flex; align-items: center; gap: 1rem; padding: 1.25rem;
            border: 2px solid var(--surface-border); border-radius: 0.875rem;
            cursor: pointer; transition: all 0.2s; background: var(--surface-card);
        }
        .pp-option-card:hover { border-color: color-mix(in srgb, var(--primary-color) 40%, var(--surface-border)); background: var(--surface-hover); }
        .pp-option-card.pp-selected { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 5%, var(--surface-card)); }
        .pp-option-icon {
            width: 52px; height: 52px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center;
            font-size: 1.375rem; flex-shrink: 0;
        }
        .pp-icon-template { background: color-mix(in srgb, #3b82f6 12%, var(--surface-card)); color: #3b82f6; }
        .pp-icon-scratch { background: color-mix(in srgb, #8b5cf6 12%, var(--surface-card)); color: #8b5cf6; }
        .pp-option-info { flex: 1; }
        .pp-option-title { font-size: 1.0625rem; font-weight: 700; margin-bottom: 0.25rem; }
        .pp-option-desc { font-size: 0.9375rem; color: var(--text-color-secondary); line-height: 1.4; }
        .pp-option-arrow { color: var(--text-color-secondary); font-size: 0.875rem; }
        .pp-option-card.pp-selected .pp-option-arrow { color: var(--primary-color); }

        .pp-template-section { border-top: 1px solid var(--surface-border); padding-top: 1.25rem; }
        .pp-template-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .pp-template-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 320px; overflow-y: auto; }
        .pp-template-item {
            display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem;
            border: 1px solid var(--surface-border); border-radius: 0.75rem;
            cursor: pointer; transition: all 0.15s;
        }
        .pp-template-item:hover { background: var(--surface-hover); }
        .pp-template-item.pp-template-selected { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 5%, var(--surface-card)); }
        .pp-tpl-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--surface-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pp-tpl-radio-dot { width: 10px; height: 10px; border-radius: 50%; background: transparent; transition: all 0.15s; }
        .pp-tpl-radio-dot.active { background: var(--primary-color); }
        .pp-template-item.pp-template-selected .pp-tpl-radio { border-color: var(--primary-color); }
        .pp-tpl-info { flex: 1; }
        .pp-tpl-title { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }
        .pp-tpl-meta { display: flex; gap: 1rem; font-size: 0.8125rem; color: var(--text-color-secondary); }
        .pp-tpl-meta span { display: inline-flex; align-items: center; gap: 0.25rem; }
        .pp-tpl-meta i { font-size: 0.75rem; }
        .pp-template-empty {
            display: flex; align-items: center; gap: 0.5rem; padding: 1.25rem;
            background: var(--surface-hover); border-radius: 0.625rem;
            font-size: 0.9375rem; color: var(--text-color-secondary);
        }

        /* ── Readability overrides for Tailwind utilities ── */
        :host .text-sm { font-size: 0.9375rem !important; }
        :host .text-xs { font-size: 0.8125rem !important; }
    `]
})
export class LeadWorkspace implements OnInit {
    lead!: Lead;
    followUps: FollowUp[] = [];
    activeTab = 'overview';
    addFollowUpDialog = false;
    selectedFollowUp: FollowUp | null = null;
    newFollowUp: { type: string; message: string; nextFollowUpDate?: string } = { type: 'Phone Call', message: '' };

    // Proposals
    proposals: ProposalListItem[] = [];
    showProposalPicker = false;
    proposalCreateMode: 'template' | 'scratch' | null = null;
    masterItineraries: BuilderListItem[] = [];
    selectedTemplateId: number | null = null;

    tabs: { key: string; label: string; count?: number }[] = [];

    followUpTypes = [
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
        private itineraryService: ItineraryBuilderService,
        private proposalService: ProposalService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        // Reset scroll position (fixes stuck scroll after returning from itinerary builder)
        window.scrollTo(0, 0);

        const id = +this.route.snapshot.paramMap.get('id')!;
        // Check if a specific tab was requested (e.g. returning from builder)
        const tabParam = this.route.snapshot.queryParams['tab'];
        if (tabParam) this.activeTab = tabParam;

        // Try router state first
        const state = history.state;
        if (state?.lead) {
            this.lead = state.lead;
            this.loadFollowUps();
            this.loadProposals();
        } else {
            this.leadCrmService.getLead(id).subscribe({
                next: (lead) => { this.lead = lead; this.loadFollowUps(); this.loadProposals(); this.cdr.markForCheck(); },
                error: () => this.router.navigate(['/sales/leads'])
            });
        }
    }

    loadFollowUps() {
        this.leadCrmService.getFollowUps(this.lead.id).subscribe({
            next: (data) => {
                this.followUps = (data ?? []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                this.updateTabs();
                this.cdr.markForCheck();
            },
            error: () => { this.followUps = []; this.updateTabs(); }
        });
    }

    loadProposals() {
        this.proposalService.getProposalsByLead(this.lead.id).subscribe({
            next: (data) => {
                this.proposals = data || [];
                this.updateTabs();
                this.cdr.markForCheck();
            },
            error: () => { this.proposals = []; this.updateTabs(); }
        });
    }

    updateTabs() {
        this.tabs = [
            { key: 'overview', label: 'Overview' },
            { key: 'followups', label: 'Follow Ups', count: this.followUps.length },
            { key: 'proposals', label: 'Proposals', count: this.proposals.length },
            { key: 'payments', label: 'Payments' },
            { key: 'notes', label: 'Notes' },
            { key: 'tasks', label: 'Tasks' },
            { key: 'files', label: 'Files' }
        ];
    }

    openProposalPicker() {
        this.proposalCreateMode = null;
        this.selectedTemplateId = null;
        this.showProposalPicker = true;
        this.loadMasterItineraries();
    }

    loadMasterItineraries() {
        this.itineraryService.getAll().subscribe({
            next: (data) => { this.masterItineraries = (data || []).filter(i => i.isActive); this.cdr.markForCheck(); },
            error: () => { this.masterItineraries = []; }
        });
    }

    createProposalFromTemplate() {
        if (!this.selectedTemplateId) return;
        this.showProposalPicker = false;
        // Navigate to itinerary builder with the template pre-loaded + lead context
        // User can view/edit itinerary, then click "Continue to Proposal"
        this.router.navigate(['/itinerary-builder', this.selectedTemplateId], {
            queryParams: { leadId: this.lead.id }
        });
    }

    createProposalFromScratch() {
        this.showProposalPicker = false;
        // Open itinerary builder in lead context (new blank itinerary)
        this.router.navigate(['/itinerary-builder'], {
            queryParams: { leadId: this.lead.id }
        });
    }

    goToBuilder() {
        this.showProposalPicker = false;
        this.router.navigate(['/itinerary-builder']);
    }

    viewProposal(prop: any) {
        this.router.navigate(['/proposal-document', prop.id], {
            queryParams: { returnUrl: '/sales/leads/' + this.lead.id + '?tab=proposals' }
        });
    }

    resendProposal(prop: any) {
        // Navigate to proposal-customize with resend mode
        this.router.navigate(['/proposal-customize', prop.id], {
            queryParams: { proposalId: prop.id, leadId: this.lead.id }
        });
    }

    sendProposal(prop: any) {
        this.messageService.add({ severity: 'info', summary: 'Sending...', detail: 'Proposal email will be sent to ' + this.lead.email });
    }

    downloadProposal(prop: any) {
        // Open the proposal document view in a new window for print/download
        const url = '/proposal-document/' + prop.id;
        window.open(url, '_blank');
    }

    getProposalStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
        switch (status?.toLowerCase()) {
            case 'sent': return 'info';
            case 'accepted': return 'success';
            case 'rejected': return 'danger';
            case 'draft': return 'secondary';
            case 'expired': return 'warn';
            default: return 'secondary';
        }
    }

    get nextFollowUp(): FollowUp | null {
        const upcoming = this.followUps.filter(f => f.nextFollowUpDate && new Date(f.nextFollowUpDate) >= new Date());
        if (upcoming.length === 0) return null;
        return upcoming.sort((a, b) => new Date(a.nextFollowUpDate!).getTime() - new Date(b.nextFollowUpDate!).getTime())[0];
    }

    get daysAsLead(): number {
        if (!this.lead?.createdAt) return 0;
        return Math.floor((Date.now() - new Date(this.lead.createdAt).getTime()) / 86400000);
    }

    get timelineEvents(): { id: number; date: string; text: string; dotClass: string }[] {
        const events: { id: number; date: string; text: string; dotClass: string }[] = [];
        // Lead creation
        events.push({ id: -1, date: this.lead.createdAt, text: 'Lead created from ' + this.lead.source.toLowerCase() + ' inquiry', dotClass: 'dot-blue' });
        // Follow ups
        for (const fu of this.followUps) {
            const colors: Record<string, string> = { 'Phone Call': 'dot-green', 'Email': 'dot-blue', 'Meeting': 'dot-orange', 'WhatsApp': 'dot-green' };
            events.push({ id: fu.id, date: fu.createdAt, text: fu.message, dotClass: colors[fu.type] || 'dot-purple' });
        }
        return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    goBack() { this.router.navigate(['/sales/leads']); }

    quickAction(action: string) {
        switch (action) {
            case 'call': case 'email': case 'whatsapp':
                this.newFollowUp = { type: action === 'call' ? 'Phone Call' : action === 'email' ? 'Email' : 'WhatsApp', message: '' };
                this.addFollowUpDialog = true;
                break;
            case 'itinerary':
                this.router.navigate(['/itinerary/customize/new']);
                break;
            case 'proposal':
                this.router.navigate(['/proposals/create']);
                break;
        }
    }

    saveFollowUp() {
        if (!this.newFollowUp.message?.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Message is required' });
            return;
        }
        const req: CreateFollowUpRequest = {
            leadId: this.lead.id,
            type: this.newFollowUp.type,
            message: this.newFollowUp.message,
            nextFollowUpDate: this.newFollowUp.nextFollowUpDate
        };
        this.leadCrmService.createFollowUp(req).subscribe({
            next: () => {
                this.addFollowUpDialog = false;
                this.newFollowUp = { type: 'Phone Call', message: '' };
                this.loadFollowUps();
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Follow-up added' });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add follow-up' })
        });
    }

    saveNotes() {
        this.leadCrmService.updateLead(this.lead.id, { notes: this.lead.notes } as any).subscribe({
            next: () => this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Notes updated' }),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save notes' })
        });
    }

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
            default: return status;
        }
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
        switch (status) {
            case 'New': return 'info';
            case 'FollowUp': return 'warn';
            case 'ProposalSent': return 'secondary';
            case 'Negotiate': return 'warn';
            case 'Confirmed': case 'Converted': return 'success';
            case 'Lost': return 'danger';
            default: return 'secondary';
        }
    }

    getPrioritySeverity(priority: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
        switch (priority) {
            case 'Low': return 'secondary';
            case 'Medium': return 'info';
            case 'High': return 'warn';
            case 'Urgent': return 'danger';
            default: return 'secondary';
        }
    }

    getTravelDates(): string {
        if (!this.lead.travelDateFrom) return '-';
        const from = new Date(this.lead.travelDateFrom).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        if (!this.lead.travelDateTo) return from;
        const to = new Date(this.lead.travelDateTo).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        return from + ' - ' + to;
    }

    formatFollowUpDate(dateStr: string): string {
        const d = new Date(dateStr);
        const today = new Date(); today.setHours(0,0,0,0);
        const target = new Date(d); target.setHours(0,0,0,0);
        const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        if (diff === 0) return 'Today, ' + time;
        if (diff === 1) return 'Tomorrow, ' + time;
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + time;
    }

    formatTimelineDate(dateStr: string): string {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
               d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    getFollowUpStatus(fu: FollowUp): string {
        if (!fu.nextFollowUpDate) return 'Completed';
        const d = new Date(fu.nextFollowUpDate); d.setHours(0,0,0,0);
        const today = new Date(); today.setHours(0,0,0,0);
        if (d < today) return 'Overdue';
        if (d.getTime() === today.getTime()) return 'Due Today';
        return 'Upcoming';
    }

    getFuStatusSeverity(fu: FollowUp): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
        switch (this.getFollowUpStatus(fu)) {
            case 'Completed': return 'success';
            case 'Overdue': return 'danger';
            case 'Due Today': return 'warn';
            case 'Upcoming': return 'info';
            default: return 'secondary';
        }
    }

    getFuIcon(type: string): string {
        switch (type) {
            case 'Phone Call': return 'pi pi-phone';
            case 'Email': return 'pi pi-envelope';
            case 'Meeting': return 'pi pi-users';
            case 'WhatsApp': return 'pi pi-whatsapp';
            default: return 'pi pi-comment';
        }
    }

    getFuDotClass(type: string): string {
        switch (type) {
            case 'Phone Call': return 'dot-phone';
            case 'Email': return 'dot-email';
            case 'Meeting': return 'dot-meeting';
            case 'WhatsApp': return 'dot-whatsapp';
            default: return 'dot-other';
        }
    }
}
