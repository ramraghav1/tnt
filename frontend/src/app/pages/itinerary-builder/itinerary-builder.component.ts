import { Component, ChangeDetectorRef, OnInit, OnDestroy, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { FluidModule } from 'primeng/fluid';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';

import {
    ItineraryBuilderService,
    BuilderDay, BuilderItem, SaveBuilderRequest, BuilderResponse,
    InventoryVehicle, InventoryActivity, InventoryGuide,
    LocationItem, SeasonItem, CurrencyItem, PricingSummary,
    AccommodationCategory
} from './itinerary-builder.service';

@Component({
    selector: 'app-itinerary-builder',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        ButtonModule, InputTextModule, SelectModule, InputNumberModule,
        TextareaModule, TooltipModule, BadgeModule, TagModule,
        ToastModule, ToggleSwitchModule, TabsModule, FluidModule,
        ProgressSpinnerModule, DividerModule, MenuModule
    ],
    providers: [MessageService],
    template: `
<p-toast />

<!-- ═══════════════════ TOP TOOLBAR ═══════════════════ -->
@if (leadContext) {
<div class="lead-context-banner">
    <div class="lead-context-inner">
        <i class="pi pi-user"></i>
        <span>Building itinerary for lead</span>
        <span class="lead-context-sep">|</span>
        <a class="lead-context-link" (click)="goBackToLead()"><i class="pi pi-arrow-left"></i> Back to Lead</a>
    </div>
    <button class="lead-context-close" (click)="leadContext = false" pTooltip="Dismiss" tooltipPosition="left"><i class="pi pi-times"></i></button>
</div>
}
<div class="builder-toolbar">
    <div class="flex items-center gap-3">
        <button pButton icon="pi pi-arrow-left" severity="secondary" [text]="true" (click)="goBack()" [pTooltip]="dialogMode ? 'Close' : 'Back to list'" tooltipPosition="bottom" class="toolbar-back-btn"></button>
        <div class="toolbar-breadcrumb">
            @if (leadContext) {
            <span class="text-color-secondary text-sm cursor-pointer" (click)="goBack()">Lead Workspace</span>
            <i class="pi pi-angle-right text-color-secondary text-xs mx-1"></i>
            <span class="text-sm font-semibold">{{ itineraryId ? 'Customize Itinerary' : 'Build Itinerary' }}</span>
            <i class="pi pi-angle-right text-color-secondary text-xs mx-1"></i>
            <span class="text-sm text-color-secondary">Continue to Proposal</span>
            } @else {
            <span class="text-color-secondary text-sm cursor-pointer" (click)="goBack()">Itineraries</span>
            <i class="pi pi-angle-right text-color-secondary text-xs mx-1"></i>
            <span class="text-sm font-semibold">{{ itineraryId ? 'Edit Itinerary' : 'Create New Itinerary' }}</span>
            }
        </div>
        <div class="toolbar-title-divider"></div>
        <span class="toolbar-title">Master Itinerary Builder</span>
    </div>
    <div class="flex items-center gap-2">
        <button pButton label="Save Draft" icon="pi pi-save" severity="secondary" [outlined]="true" (click)="saveDraft()" [loading]="saving" class="toolbar-btn"></button>
        <button pButton label="Preview" icon="pi pi-eye" class="toolbar-btn-preview" (click)="preview()"></button>
        @if (leadContext) {
        <button pButton label="Continue to Proposal" icon="pi pi-arrow-right" iconPos="right" class="toolbar-btn-proposal" (click)="continueToProposal()" [loading]="saving"></button>
        } @else {
        <button pButton label="Publish Itinerary" icon="pi pi-check" class="toolbar-btn-publish" (click)="publish()" [loading]="saving"></button>
        }
    </div>
</div>

<!-- ═══════════════════ 3-COLUMN LAYOUT ═══════════════════ -->
<div class="builder-body">

    <!-- ─────────── LEFT SIDEBAR: Inventory Library ─────────── -->
    <aside class="sidebar-left" [class.collapsed]="sidebarCollapsed">
        @if (!sidebarCollapsed) {
        <div class="sidebar-inner">
            <!-- Header -->
            <div class="sidebar-header">
                <span class="sidebar-title">Inventory Library</span>
                <button pButton icon="pi pi-angle-double-left" [text]="true" severity="secondary" size="small" (click)="sidebarCollapsed = true" pTooltip="Collapse" tooltipPosition="right"></button>
            </div>

            <!-- Search -->
            <div class="sidebar-search">
                <i class="pi pi-search sidebar-search-icon"></i>
                <input pInputText [(ngModel)]="inventorySearch" placeholder="Search inventory..." class="sidebar-search-input" />
                <button pButton icon="pi pi-sliders-h" [text]="true" severity="secondary" size="small" pTooltip="Filter"></button>
            </div>

            <!-- Category Tabs -->
            <div class="sidebar-tabs">
                @for (tab of inventoryTabs; track tab) {
                <button class="sidebar-tab" [class.active]="activeInventoryTab === tab" (click)="activeInventoryTab = tab">{{ tab }}</button>
                }
            </div>

            <!-- Inventory List -->
            <div class="sidebar-list">
                <!-- ACCOMMODATION CATEGORIES -->
                @if (activeInventoryTab === 'All' || activeInventoryTab === 'Accommodation') {
                <div class="inv-section">
                    <div class="inv-section-header">
                        <span class="inv-section-label">ACCOMMODATION</span>
                        <span class="inv-section-count">{{ accommodationCategories.length }}</span>
                    </div>
                    @for (cat of filteredAccommodation; track cat.id) {
                    <div class="inv-item" (click)="addAccommodationToDay(cat)">
                        <div class="inv-item-icon bg-blue-50">
                            <i class="pi pi-building text-blue-500"></i>
                        </div>
                        <div class="inv-item-info">
                            <span class="inv-item-name">{{ cat.name }}</span>
                            <span class="inv-item-meta">{{ cat.description }}</span>
                        </div>
                        <div class="inv-item-price-badge">
                            @if (cat.avgPricePerNight) {
                            <span class="inv-item-price">{{ cat.baseCurrency || 'USD' }} {{ cat.avgPricePerNight | number:'1.0-0' }}</span>
                            <span class="inv-item-price-label">/night · {{ cat.paxCount || 2 }} pax</span>
                            } @else if (cat.starRating) {
                            <div class="inv-item-badge">
                                @for (s of starArray(cat.starRating); track s) {
                                <i class="pi pi-star-fill text-yellow-500" style="font-size:0.6rem"></i>
                                }
                            </div>
                            }
                        </div>
                    </div>
                    }
                </div>
                }

                <!-- TRANSPORT -->
                @if (activeInventoryTab === 'All' || activeInventoryTab === 'Transport') {
                <div class="inv-section">
                    <div class="inv-section-header">
                        <span class="inv-section-label">TRANSPORT</span>
                        <span class="inv-section-action">View all</span>
                    </div>
                    @for (vehicle of filteredVehicles; track vehicle.id) {
                    <div class="inv-item" (click)="addVehicleToDay(vehicle)">
                        <div class="inv-item-icon bg-green-50">
                            <i class="pi pi-car text-green-600"></i>
                        </div>
                        <div class="inv-item-info">
                            <span class="inv-item-name">{{ vehicle.vehicleType }}</span>
                            <span class="inv-item-meta">{{ vehicle.model }}</span>
                        </div>
                        <span class="text-xs text-color-secondary font-medium">{{ vehicle.capacity }} seats</span>
                    </div>
                    }
                </div>
                }

                <!-- ACTIVITIES -->
                @if (activeInventoryTab === 'All' || activeInventoryTab === 'Activity') {
                <div class="inv-section">
                    <div class="inv-section-header">
                        <span class="inv-section-label">ACTIVITIES</span>
                        @if (activeLocationName) {
                        <span class="inv-section-suggested">{{ suggestedActivityCount }} for {{ activeLocationName }}</span>
                        }
                    </div>
                    @for (act of filteredActivities; track act.id; let i = $index) {
                    @if (activeLocationName && i === suggestedActivityCount && suggestedActivityCount > 0) {
                    <div class="inv-divider-label">Other Activities</div>
                    }
                    <div class="inv-item" [class.inv-item-suggested]="activeLocationName && act.location?.toLowerCase()?.includes(activeLocationName.toLowerCase())" (click)="addActivityToDay(act)">
                        <div class="inv-item-icon" [ngClass]="activeLocationName && act.location?.toLowerCase()?.includes(activeLocationName.toLowerCase()) ? 'bg-orange-100' : 'bg-orange-50'">
                            <i class="pi pi-flag text-orange-500"></i>
                        </div>
                        <div class="inv-item-info">
                            <span class="inv-item-name">{{ act.name }}</span>
                            <span class="inv-item-meta">{{ act.activityType }} · {{ act.location }}</span>
                        </div>
                        @if (activeLocationName && act.location?.toLowerCase()?.includes(activeLocationName.toLowerCase())) {
                        <span class="inv-suggested-badge">Suggested</span>
                        }
                    </div>
                    }
                </div>
                }

                <!-- GUIDES -->
                @if (activeInventoryTab === 'All' || activeInventoryTab === 'Guide') {
                <div class="inv-section">
                    <div class="inv-section-header">
                        <span class="inv-section-label">GUIDES</span>
                        <span class="inv-section-action">View all</span>
                    </div>
                    @for (g of filteredGuides; track g.id) {
                    <div class="inv-item" (click)="addGuideToDay(g)">
                        <div class="inv-item-icon bg-purple-50">
                            <i class="pi pi-user text-purple-500"></i>
                        </div>
                        <div class="inv-item-info">
                            <span class="inv-item-name">{{ g.fullName }}</span>
                            <span class="inv-item-meta">{{ g.specialization }}</span>
                        </div>
                        @if (g.rating) {
                        <span class="text-xs font-bold text-yellow-600">{{ g.rating }}★</span>
                        }
                    </div>
                    }
                </div>
                }
            </div>

            <!-- Bottom hint -->
            <div class="sidebar-footer">
                <i class="pi pi-info-circle mr-1"></i> Click items to add to the last expanded day
            </div>
        </div>
        } @else {
        <div class="sidebar-collapsed-inner">
            <button pButton icon="pi pi-angle-double-right" [text]="true" severity="secondary" (click)="sidebarCollapsed = false" pTooltip="Expand inventory" tooltipPosition="right"></button>
            <div class="collapsed-icons">
                <i class="pi pi-building" pTooltip="Accommodation" tooltipPosition="right"></i>
                <i class="pi pi-car" pTooltip="Transport" tooltipPosition="right"></i>
                <i class="pi pi-flag" pTooltip="Activities" tooltipPosition="right"></i>
                <i class="pi pi-user" pTooltip="Guides" tooltipPosition="right"></i>
            </div>
        </div>
        }
    </aside>

    <!-- ─────────── CENTER: Day Builder ─────────── -->
    <main class="builder-center">

        <!-- Header Fields -->
        <div class="center-header">
            <div class="center-header-fields">
                <div class="header-field flex-1">
                    <label>Itinerary Name *</label>
                    <input pInputText [(ngModel)]="itineraryTitle" placeholder="Amazing Nepal Tour - 7 Days" class="w-full" />
                </div>
                <div class="header-field" style="width:170px">
                    <label>Default Currency</label>
                    <p-select [(ngModel)]="defaultCurrency" [options]="currencyOptions" optionLabel="label" optionValue="value" class="w-full" />
                </div>
                <div class="header-field" style="width:210px">
                    <label>Season</label>
                    <p-select [(ngModel)]="selectedSeasonId" [options]="seasonOptions" optionLabel="label" optionValue="value"
                        placeholder="Select season" [showClear]="true" class="w-full" (onChange)="recalcPricing()" />
                </div>
            </div>
        </div>

        <!-- Timeline Day Cards -->
        <div class="day-scroll-area">
            <div class="timeline-container">

                @for (day of days; track day.dayNumber; let di = $index; let isLast = $last) {
                <!-- Day Card with Timeline -->
                <div class="timeline-row">
                    <!-- Timeline column -->
                    <div class="timeline-track">
                        <div class="timeline-number" [class.active]="day.expanded" (click)="day.expanded = !day.expanded">{{ day.dayNumber }}</div>
                        @if (!isLast) {
                        <div class="timeline-line"></div>
                        }
                    </div>

                    <!-- Day Card -->
                    <div class="day-card" [class.collapsed]="!day.expanded">
                        <!-- Day Header -->
                        <div class="day-card-header" (click)="day.expanded = !day.expanded">
                            <div class="day-card-title-area">
                                <div class="day-card-title">Day {{ day.dayNumber }}</div>
                                @if (day.location) {
                                <div class="day-card-location"><i class="pi pi-map-marker"></i> {{ day.location }}</div>
                                }
                            </div>
                            <div class="day-card-actions" (click)="$event.stopPropagation()">
                                <p-select [(ngModel)]="day.locationId" [options]="locationOptions" optionLabel="label" optionValue="value"
                                    placeholder="Set location" [showClear]="true" [filter]="true" filterBy="label" size="small" class="day-location-select"
                                    (onChange)="onDayLocationChange(day)" />
                                <button pButton icon="pi pi-trash" [text]="true" severity="danger" size="small"
                                    (click)="removeDay(di)" pTooltip="Remove day" tooltipPosition="top"></button>
                                <button pButton [icon]="day.expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" [text]="true" severity="secondary" size="small"
                                    (click)="day.expanded = !day.expanded"></button>
                            </div>
                        </div>

                        <!-- Day Content -->
                        @if (day.expanded) {
                        <div class="day-card-body">
                            <!-- Items row -->
                            <div class="day-items-row">
                                @for (item of day.items; track ii; let ii = $index) {
                                <div class="day-item" [attr.data-type]="item.itemType">
                                    <div class="day-item-icon-wrap" [ngClass]="getItemIconWrapClass(item.itemType)">
                                        <i [class]="getItemIcon(item.itemType)"></i>
                                    </div>
                                    <div class="day-item-content">
                                        <span class="day-item-name">{{ item.itemName }}</span>
                                        <span class="day-item-detail">{{ item.itemDetails || item.itemType }}</span>
                                    </div>
                                    <button class="day-item-remove" (click)="removeItem(day, ii)" pTooltip="Remove"><i class="pi pi-times"></i></button>
                                </div>
                                }

                                <!-- Add Meal placeholder -->
                                <div class="day-item-add" (click)="addMealToDay(day)">
                                    <div class="day-item-add-icon"><i class="pi pi-plus"></i></div>
                                    <div class="day-item-add-text">
                                        <span>Add Meal</span>
                                        <span class="sub">Drop meal here</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Note toggle -->
                            <div class="day-note-toggle" (click)="toggleNotes(day)">
                                <i class="pi" [ngClass]="day.showNotes ? 'pi-minus-circle' : 'pi-plus-circle'"></i>
                                <span>{{ day.showNotes ? 'Hide Note' : 'Add Note' }}</span>
                            </div>
                            @if (day.showNotes) {
                            <textarea pTextarea [(ngModel)]="day.notes" rows="2" placeholder="Add notes for this day..." class="w-full day-note-area"></textarea>
                            }
                        </div>
                        }
                    </div>
                </div>
                }

                <!-- Add New Day - Timeline Row -->
                <div class="timeline-row add-day-row">
                    <div class="timeline-track">
                        <div class="timeline-number add-day-number" (click)="addDay()"><i class="pi pi-plus"></i></div>
                    </div>
                    <div class="add-day-card" (click)="addDay()">
                        <i class="pi pi-plus-circle mr-2"></i>
                        <span>Add New Day</span>
                    </div>
                </div>

            </div>
        </div>

        <!-- Bottom Bar -->
        <div class="center-footer">
            <div class="footer-duration">
                Total Duration: <strong>{{ days.length }} Days / {{ days.length > 0 ? days.length - 1 : 0 }} Nights</strong>
            </div>
            <div class="footer-right">
                <i class="pi pi-map"></i>
                <span>Show Map View</span>
                <p-toggleSwitch [(ngModel)]="showMapView" />
            </div>
        </div>
    </main>

    <!-- ─────────── RIGHT SIDEBAR: Pricing ─────────── -->
    <aside class="sidebar-right">
        <div class="pricing-inner">

            <!-- Pricing Header -->
            <div class="pricing-header">
                <span class="pricing-header-title">Pricing Summary</span>
            </div>

            <!-- Estimated Costs -->
            <div class="pricing-section">
                <div class="pricing-section-header">
                    <span>Estimated Costs</span>
                    <button class="recalc-btn" (click)="recalcPricing()"><i class="pi pi-sync"></i> Recalculate</button>
                </div>
                <div class="pricing-breakdown">
                    <div class="pricing-row"><span class="pricing-row-icon bg-blue-50"><i class="pi pi-building text-blue-500"></i></span><span class="pricing-row-label">Accommodation <small class="text-color-secondary">(per room)</small></span><span class="pricing-row-value">{{ currSymbol }} {{ pricing.accommodation | number:'1.2-2' }}</span></div>
                    <div class="pricing-row"><span class="pricing-row-icon bg-green-50"><i class="pi pi-car text-green-500"></i></span><span class="pricing-row-label">Transport <small class="text-color-secondary">(×{{ numPax }} pax)</small></span><span class="pricing-row-value">{{ currSymbol }} {{ pricing.transport | number:'1.2-2' }}</span></div>
                    <div class="pricing-row"><span class="pricing-row-icon bg-orange-50"><i class="pi pi-flag text-orange-500"></i></span><span class="pricing-row-label">Activities <small class="text-color-secondary">(×{{ numPax }} pax)</small></span><span class="pricing-row-value">{{ currSymbol }} {{ pricing.activities | number:'1.2-2' }}</span></div>
                    <div class="pricing-row"><span class="pricing-row-icon bg-red-50"><i class="pi pi-heart text-red-500"></i></span><span class="pricing-row-label">Meals <small class="text-color-secondary">(×{{ numPax }} pax)</small></span><span class="pricing-row-value">{{ currSymbol }} {{ pricing.meals | number:'1.2-2' }}</span></div>
                    <div class="pricing-row"><span class="pricing-row-icon bg-purple-50"><i class="pi pi-user text-purple-500"></i></span><span class="pricing-row-label">Guide <small class="text-color-secondary">(flat)</small></span><span class="pricing-row-value">{{ currSymbol }} {{ pricing.guide | number:'1.2-2' }}</span></div>
                    <div class="pricing-row"><span class="pricing-row-icon others-icon"><i class="pi pi-box"></i></span><span class="pricing-row-label">Others</span><span class="pricing-row-value">{{ currSymbol }} {{ pricing.others | number:'1.2-2' }}</span></div>
                </div>
            </div>

            <!-- Totals -->
            <div class="pricing-totals">
                <div class="pricing-total-row"><span>Subtotal</span><span class="font-semibold">{{ currSymbol }} {{ pricing.subtotal | number:'1.2-2' }}</span></div>
                <div class="pricing-total-row"><span>Markup ({{ markupPercentage }}%)</span><span class="text-green-500 font-medium">{{ currSymbol }} {{ pricing.markupAmount | number:'1.2-2' }}</span></div>
                <div class="pricing-grand-total">
                    <span>Total Estimated Price</span>
                    <span>{{ currSymbol }} {{ pricing.totalEstimatedPrice | number:'1.2-2' }}</span>
                </div>
                <div class="pricing-perperson">
                    <span><i class="pi pi-users mr-1"></i> Price Per Person ({{ numPax }} Pax)</span>
                    <span>{{ currSymbol }} {{ pricing.pricePerPerson | number:'1.2-2' }}</span>
                </div>
            </div>

            <!-- Season & Location Impact -->
            <div class="pricing-section">
                <div class="pricing-section-header"><span>Season & Location Impact</span></div>
                <div class="impact-grid">
                    <div class="impact-row">
                        <span>Season</span>
                        @if (pricing.seasonName) {
                        <p-tag [value]="pricing.seasonName" severity="warn" [rounded]="true" />
                        } @else {
                        <span class="text-color-secondary text-sm">None</span>
                        }
                    </div>
                    <div class="impact-row">
                        <span>Location Multiplier</span>
                        <span class="font-medium">{{ pricing.locationMultiplier | number:'1.2-2' }}x</span>
                    </div>
                    <div class="impact-row highlight">
                        <span>Total Multiplier</span>
                        <span>{{ pricing.totalMultiplier | number:'1.2-2' }}x</span>
                    </div>
                </div>
            </div>

            <!-- Settings -->
            <div class="pricing-section">
                <div class="pricing-section-header"><span>Settings</span></div>
                <div class="settings-grid">
                    <div class="setting-field">
                        <label>Number of Pax</label>
                        <p-inputNumber [(ngModel)]="numPax" [min]="1" [showButtons]="true" [style]="{'width':'100%'}" (onInput)="recalcPricing()" />
                    </div>
                    <div class="setting-field">
                        <label>Markup %</label>
                        <p-inputNumber [(ngModel)]="markupPercentage" [min]="0" [max]="100" suffix="%" [style]="{'width':'100%'}" (onInput)="recalcPricing()" />
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="pricing-section">
                <div class="pricing-section-header"><span>Quick Actions</span></div>
                <div class="quick-actions">
                    <button class="qa-btn" (click)="duplicateItinerary()"><i class="pi pi-copy"></i><span>Duplicate Itinerary</span></button>
                    <button class="qa-btn danger" (click)="clearAll()"><i class="pi pi-trash"></i><span>Clear All</span></button>
                    <button class="qa-btn"><i class="pi pi-upload"></i><span>Import Itinerary</span></button>
                </div>
            </div>
        </div>
    </aside>
</div>
    `,
    styles: [`
        :host { display: flex; flex-direction: column; height: calc(100vh - 4.5rem); overflow: hidden; font-family: var(--font-family); }
        :host.dialog-mode { height: 100%; }

        /* ── Lead Context Banner ── */
        .lead-context-banner {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.625rem 1.25rem;
            background: color-mix(in srgb, var(--p-primary-500) 10%, var(--p-surface-0));
            border-bottom: 1px solid color-mix(in srgb, var(--p-primary-500) 20%, var(--p-surface-200));
        }
        .lead-context-inner {
            display: flex; align-items: center; gap: 0.5rem;
            font-size: 0.9375rem; font-weight: 500; color: var(--p-primary-700);
        }
        .lead-context-inner > i { font-size: 0.875rem; }
        .lead-context-sep { color: var(--p-surface-300); }
        .lead-context-link {
            display: inline-flex; align-items: center; gap: 0.375rem;
            color: var(--p-primary-600); font-weight: 600; cursor: pointer;
            text-decoration: none; transition: color 0.15s;
        }
        .lead-context-link:hover { color: var(--p-primary-800); text-decoration: underline; }
        .lead-context-link i { font-size: 0.75rem; }
        .lead-context-close {
            border: none; background: transparent; cursor: pointer;
            color: var(--p-surface-500); padding: 0.25rem; border-radius: 50%;
            transition: all 0.15s;
        }
        .lead-context-close:hover { background: var(--p-surface-100); color: var(--p-surface-700); }

        /* ── Toolbar ── */
        .builder-toolbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.625rem 1.25rem;
            background: var(--p-surface-0);
            border-bottom: 1px solid var(--p-surface-200);
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            z-index: 10; position: relative;
        }
        .toolbar-back-btn { border-radius: 50% !important; width: 2.25rem; height: 2.25rem; }
        .toolbar-breadcrumb { display: flex; align-items: center; }
        .toolbar-title-divider { width: 1px; height: 1.5rem; background: var(--p-surface-300); margin: 0 0.75rem; }
        .toolbar-title { font-size: 1.125rem; font-weight: 700; letter-spacing: -0.01em; }
        .toolbar-btn { border-radius: 0.5rem !important; }
        .toolbar-btn-preview { border-radius: 0.5rem !important; background: var(--p-primary-100) !important; color: var(--p-primary-700) !important; border: none !important; }
        .toolbar-btn-preview:hover { background: var(--p-primary-200) !important; }
        .toolbar-btn-publish { border-radius: 0.5rem !important; background: linear-gradient(135deg, var(--p-primary-500), var(--p-primary-700)) !important; border: none !important; }
        .toolbar-btn-proposal { border-radius: 0.5rem !important; background: linear-gradient(135deg, #22c55e, #16a34a) !important; border: none !important; color: #fff !important; font-weight: 600 !important; }
        .toolbar-btn-proposal:hover { background: linear-gradient(135deg, #16a34a, #15803d) !important; }

        /* ── Body layout ── */
        .builder-body { display: flex; flex: 1; overflow: hidden; min-height: 0; }

        /* ── Left sidebar ── */
        .sidebar-left {
            width: 310px; min-width: 310px; background: var(--p-surface-0);
            border-right: 1px solid var(--p-surface-200);
            display: flex; flex-direction: column;
            transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .sidebar-left.collapsed { width: 52px; min-width: 52px; }
        .sidebar-inner { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1rem 0.5rem; }
        .sidebar-title { font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.01em; }

        .sidebar-search {
            display: flex; align-items: center; gap: 0.5rem; padding: 0 1rem; margin-bottom: 0.75rem;
            position: relative;
        }
        .sidebar-search-icon { position: absolute; left: 1.75rem; color: var(--p-surface-400); font-size: 0.85rem; z-index: 1; }
        .sidebar-search-input { padding-left: 2.25rem !important; width: 100%; background: var(--p-surface-50) !important; border: 1px solid var(--p-surface-200) !important; border-radius: 0.5rem !important; }

        .sidebar-tabs { display: flex; gap: 0.25rem; padding: 0 1rem 0.75rem; flex-wrap: wrap; }
        .sidebar-tab {
            padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;
            border: 1px solid var(--p-surface-200); background: transparent; cursor: pointer;
            color: var(--p-surface-600); transition: all 0.15s;
        }
        .sidebar-tab:hover { border-color: var(--p-primary-300); color: var(--p-primary-500); }
        .sidebar-tab.active { background: var(--p-primary-500); color: #fff; border-color: var(--p-primary-500); }

        .sidebar-list { flex: 1; overflow-y: auto; padding: 0 0.75rem; }
        .sidebar-list::-webkit-scrollbar { width: 4px; }
        .sidebar-list::-webkit-scrollbar-thumb { background: var(--p-surface-300); border-radius: 4px; }

        .inv-section { margin-bottom: 1rem; }
        .inv-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.375rem; padding: 0 0.25rem; }
        .inv-section-label { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; color: var(--p-surface-500); }
        .inv-section-count { font-size: 0.6875rem; color: var(--p-surface-400); font-weight: 600; }
        .inv-section-suggested { font-size: 0.6875rem; color: var(--p-orange-600); font-weight: 600; }
        .inv-section-action { font-size: 0.6875rem; color: var(--p-primary-500); cursor: pointer; font-weight: 600; }
        .inv-section-action:hover { text-decoration: underline; }

        .inv-suggested-badge {
            font-size: 0.6rem; font-weight: 700; letter-spacing: 0.03em;
            padding: 0.125rem 0.375rem; border-radius: 999px;
            background: var(--p-orange-100); color: var(--p-orange-700);
            white-space: nowrap; flex-shrink: 0;
        }
        .inv-divider-label {
            font-size: 0.6875rem; font-weight: 600; color: var(--p-surface-400);
            padding: 0.5rem 0.25rem 0.25rem; letter-spacing: 0.03em;
        }

        .inv-item {
            display: flex; align-items: center; gap: 0.625rem; padding: 0.5rem; border-radius: 0.625rem;
            cursor: pointer; transition: all 0.15s; margin-bottom: 0.125rem;
        }
        .inv-item:hover { background: var(--p-surface-50); box-shadow: 0 1px 4px rgba(0,0,0,0.06); transform: translateX(2px); }
        .inv-item-suggested { background: var(--p-orange-50); border-left: 2px solid var(--p-orange-400); }
        .inv-item-suggested:hover { background: var(--p-orange-100) !important; }
        .inv-item-icon { width: 36px; height: 36px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .inv-item-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
        .inv-item-name { font-size: 0.8125rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .inv-item-meta { font-size: 0.6875rem; color: var(--p-surface-500); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .inv-item-badge { display: flex; gap: 1px; }
        .inv-item-price-badge { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; gap: 1px; }
        .inv-item-price { font-size: 0.75rem; font-weight: 700; color: var(--p-blue-600); white-space: nowrap; }
        .inv-item-price-label { font-size: 0.6rem; color: var(--p-surface-500); white-space: nowrap; }

        .sidebar-footer {
            padding: 0.625rem 1rem; border-top: 1px solid var(--p-surface-200);
            font-size: 0.6875rem; color: var(--p-surface-500); text-align: center;
            background: var(--p-surface-50);
        }

        .sidebar-collapsed-inner { display: flex; flex-direction: column; align-items: center; padding-top: 0.5rem; gap: 1.5rem; }
        .collapsed-icons { display: flex; flex-direction: column; gap: 1rem; align-items: center; color: var(--p-surface-400); font-size: 1rem; }

        /* ── Center ── */
        .builder-center { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--p-surface-50); }

        .center-header { padding: 0.875rem 1.25rem; background: var(--p-surface-0); border-bottom: 1px solid var(--p-surface-200); }
        .center-header-fields { display: flex; gap: 0.875rem; align-items: flex-end; }
        .header-field { display: flex; flex-direction: column; gap: 0.25rem; }
        .header-field label { font-size: 0.75rem; font-weight: 600; color: var(--p-surface-600); }

        .day-scroll-area { flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem; }
        .day-scroll-area::-webkit-scrollbar { width: 6px; }
        .day-scroll-area::-webkit-scrollbar-thumb { background: var(--p-surface-300); border-radius: 6px; }

        .timeline-container { display: flex; flex-direction: column; }

        /* Timeline row */
        .timeline-row { display: flex; gap: 1rem; min-height: 0; }
        .timeline-track { display: flex; flex-direction: column; align-items: center; width: 40px; flex-shrink: 0; }
        .timeline-number {
            width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-size: 0.875rem; font-weight: 700; cursor: pointer; flex-shrink: 0; z-index: 2;
            background: var(--p-surface-200); color: var(--p-surface-600); transition: all 0.2s;
            border: 2px solid var(--p-surface-0); box-shadow: 0 0 0 2px var(--p-surface-200);
        }
        .timeline-number.active {
            background: var(--p-primary-500); color: #fff;
            box-shadow: 0 0 0 3px var(--p-primary-100);
        }
        .timeline-line { width: 2px; flex: 1; background: var(--p-surface-300); margin: 2px 0; min-height: 12px; }

        /* Day card */
        .day-card {
            flex: 1; background: var(--p-surface-0); border-radius: 0.75rem;
            border: 1px solid var(--p-surface-200); margin-bottom: 0.75rem;
            transition: box-shadow 0.2s, border-color 0.2s;
            overflow: hidden;
        }
        .day-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); border-color: var(--p-surface-300); }

        .day-card-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.75rem 1rem; cursor: pointer; transition: background 0.15s;
        }
        .day-card-header:hover { background: var(--p-surface-50); }
        .day-card-title-area { display: flex; align-items: baseline; gap: 0.5rem; }
        .day-card-title { font-size: 0.9375rem; font-weight: 700; }
        .day-card-location { font-size: 0.75rem; color: var(--p-surface-500); display: flex; align-items: center; gap: 0.25rem; }
        .day-card-location i { font-size: 0.625rem; }
        .day-card-accommodation { font-size: 0.75rem; color: var(--p-blue-500); display: flex; align-items: center; gap: 0.25rem; font-weight: 500; }
        .day-card-accommodation i { font-size: 0.625rem; }
        .day-card-actions { display: flex; align-items: center; gap: 0.25rem; }
        .day-location-select { min-width: 150px; }
        .day-accommodation-select { min-width: 170px; }

        .day-card-body { padding: 0.75rem 1rem 1rem; border-top: 1px solid var(--p-surface-100); }

        /* Items inside day */
        .day-items-row { display: flex; gap: 0.625rem; flex-wrap: wrap; margin-bottom: 0.75rem; }

        .day-item {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem;
            border-radius: 0.625rem; background: var(--p-surface-0); min-width: 155px; max-width: 220px;
            position: relative; cursor: default;
            border: 1px solid var(--p-surface-200); transition: all 0.15s;
        }
        .day-item:hover { border-color: var(--p-surface-300); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .day-item[data-type="hotel"] { border-left: 3px solid var(--p-blue-500); }
        .day-item[data-type="transport"] { border-left: 3px solid var(--p-green-500); }
        .day-item[data-type="activity"] { border-left: 3px solid var(--p-orange-500); }
        .day-item[data-type="meal"] { border-left: 3px solid var(--p-red-500); }
        .day-item[data-type="guide"] { border-left: 3px solid var(--p-purple-500); }

        .day-item-icon-wrap {
            width: 30px; height: 30px; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; font-size: 0.8rem;
        }
        .day-item-content { display: flex; flex-direction: column; flex: 1; min-width: 0; }
        .day-item-name { font-size: 0.8125rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .day-item-detail { font-size: 0.6875rem; color: var(--p-surface-500); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .day-item-remove {
            position: absolute; top: -6px; right: -6px; width: 18px; height: 18px;
            border-radius: 50%; background: var(--p-red-500); color: #fff; border: 2px solid var(--p-surface-0);
            display: none; align-items: center; justify-content: center; cursor: pointer;
            font-size: 0.5rem; padding: 0;
        }
        .day-item:hover .day-item-remove { display: flex; }

        .day-item-add {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; min-width: 140px;
            border: 1.5px dashed var(--p-surface-300); border-radius: 0.625rem; cursor: pointer; transition: all 0.15s;
        }
        .day-item-add:hover { border-color: var(--p-primary-400); background: var(--p-primary-50); }
        .day-item-add-icon { color: var(--p-surface-400); font-size: 0.875rem; }
        .day-item-add:hover .day-item-add-icon { color: var(--p-primary-500); }
        .day-item-add-text { display: flex; flex-direction: column; font-size: 0.8125rem; color: var(--p-surface-500); line-height: 1.3; }
        .day-item-add-text .sub { font-size: 0.6875rem; color: var(--p-surface-400); }

        .day-note-toggle { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: var(--p-surface-500); cursor: pointer; padding: 0.25rem 0; }
        .day-note-toggle:hover { color: var(--p-primary-500); }
        .day-note-area { margin-top: 0.5rem; border-radius: 0.5rem !important; font-size: 0.8125rem; }

        /* Add Day Row */
        .add-day-row { align-items: flex-start; }
        .add-day-number {
            background: var(--p-green-500) !important; color: #fff !important;
            box-shadow: 0 0 0 3px var(--p-green-100) !important;
            cursor: pointer !important;
        }
        .add-day-number:hover { background: var(--p-green-600) !important; transform: scale(1.08); }
        .add-day-card {
            display: flex; align-items: center; justify-content: center; flex: 1;
            padding: 0.875rem; border: 1.5px dashed var(--p-green-300); border-radius: 0.75rem;
            color: var(--p-green-600); font-weight: 600; font-size: 0.875rem;
            cursor: pointer; transition: all 0.2s; background: transparent;
        }
        .add-day-card:hover { background: var(--p-green-50); border-color: var(--p-green-500); box-shadow: 0 2px 12px rgba(34,197,94,0.1); }

        /* ── Center footer ── */
        .center-footer {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.5rem 1.25rem; background: var(--p-surface-0);
            border-top: 1px solid var(--p-surface-200); font-size: 0.8125rem;
        }
        .footer-duration { color: var(--p-surface-600); }
        .footer-right { display: flex; align-items: center; gap: 0.5rem; color: var(--p-surface-500); }

        /* ── Right sidebar ── */
        .sidebar-right {
            width: 290px; min-width: 290px; background: var(--p-surface-0);
            border-left: 1px solid var(--p-surface-200); overflow-y: auto;
        }
        .sidebar-right::-webkit-scrollbar { width: 4px; }
        .sidebar-right::-webkit-scrollbar-thumb { background: var(--p-surface-300); border-radius: 4px; }
        .pricing-inner { padding: 1rem; display: flex; flex-direction: column; gap: 0; }

        .pricing-header { padding-bottom: 0.75rem; border-bottom: 1px solid var(--p-surface-200); margin-bottom: 0.75rem; }
        .pricing-header-title { font-size: 1rem; font-weight: 700; }

        .pricing-section { margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--p-surface-100); }
        .pricing-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.625rem; }
        .pricing-section-header span { font-size: 0.8125rem; font-weight: 700; color: var(--p-surface-700); }
        .recalc-btn {
            background: none; border: none; color: var(--p-primary-500); cursor: pointer;
            font-size: 0.6875rem; font-weight: 600; display: flex; align-items: center; gap: 0.25rem;
        }
        .recalc-btn:hover { text-decoration: underline; }

        .pricing-breakdown { display: flex; flex-direction: column; gap: 0.5rem; }
        .pricing-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
        .pricing-row-icon { width: 26px; height: 26px; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.75rem; }
        .pricing-row-icon.others-icon { background: var(--p-surface-100); color: var(--p-surface-600); }
        .pricing-row-label { flex: 1; color: var(--p-surface-600); }
        .pricing-row-value { font-weight: 600; font-variant-numeric: tabular-nums; }

        .pricing-totals { margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--p-surface-100); display: flex; flex-direction: column; gap: 0.375rem; }
        .pricing-total-row { display: flex; justify-content: space-between; font-size: 0.8125rem; color: var(--p-surface-600); }
        .pricing-grand-total {
            display: flex; justify-content: space-between; align-items: center; font-weight: 700;
            padding: 0.625rem 0.75rem; margin-top: 0.25rem; border-radius: 0.5rem;
            background: linear-gradient(135deg, var(--p-green-50), var(--p-green-100));
            color: var(--p-green-700); font-size: 0.875rem;
        }
        .pricing-perperson {
            display: flex; justify-content: space-between; align-items: center;
            padding: 0.5rem 0.75rem; border-radius: 0.5rem; background: var(--p-primary-50);
            color: var(--p-primary-700); font-size: 0.8125rem; font-weight: 600;
        }

        .impact-grid { display: flex; flex-direction: column; gap: 0.5rem; }
        .impact-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.8125rem; color: var(--p-surface-600); }
        .impact-row.highlight { color: var(--p-primary-600); font-weight: 700; padding: 0.375rem 0.5rem; border-radius: 0.375rem; background: var(--p-primary-50); }

        .settings-grid { display: flex; flex-direction: column; gap: 0.625rem; }
        .setting-field label { font-size: 0.6875rem; font-weight: 600; color: var(--p-surface-500); display: block; margin-bottom: 0.25rem; }

        .quick-actions { display: flex; flex-direction: column; gap: 0.25rem; }
        .qa-btn {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.625rem;
            border: none; background: transparent; cursor: pointer; border-radius: 0.5rem;
            font-size: 0.8125rem; color: var(--p-surface-600); transition: all 0.15s; width: 100%; text-align: left;
        }
        .qa-btn:hover { background: var(--p-surface-50); color: var(--p-primary-600); }
        .qa-btn.danger:hover { background: var(--p-red-50); color: var(--p-red-600); }
        .qa-btn i { font-size: 0.875rem; width: 1.25rem; text-align: center; }

        /* ══════════════════════ DARK MODE OVERRIDES ══════════════════════ */
        :host-context(.app-dark) .builder-toolbar {
            background: var(--p-surface-900);
            border-bottom-color: var(--p-surface-700);
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        :host-context(.app-dark) .lead-context-banner {
            background: color-mix(in srgb, var(--p-primary-500) 8%, var(--p-surface-900));
            border-bottom-color: var(--p-surface-700);
        }
        :host-context(.app-dark) .lead-context-close:hover { background: var(--p-surface-700); color: var(--p-surface-100); }

        :host-context(.app-dark) .sidebar-left {
            background: var(--p-surface-900);
            border-right-color: var(--p-surface-700);
        }
        :host-context(.app-dark) .sidebar-search-input {
            background: var(--p-surface-800) !important;
            border-color: var(--p-surface-700) !important;
            color: var(--p-surface-100) !important;
        }
        :host-context(.app-dark) .sidebar-tab {
            border-color: var(--p-surface-600);
            color: var(--p-surface-300);
        }
        :host-context(.app-dark) .sidebar-tab:hover { border-color: var(--p-primary-400); color: var(--p-primary-400); }
        :host-context(.app-dark) .sidebar-footer {
            background: var(--p-surface-800);
            border-top-color: var(--p-surface-700);
            color: var(--p-surface-400);
        }
        :host-context(.app-dark) .sidebar-list::-webkit-scrollbar-thumb { background: var(--p-surface-600); }
        :host-context(.app-dark) .inv-item:hover { background: var(--p-surface-800); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
        :host-context(.app-dark) .inv-item-suggested { background: color-mix(in srgb, var(--p-orange-500) 10%, var(--p-surface-900)); }
        :host-context(.app-dark) .inv-item-suggested:hover { background: color-mix(in srgb, var(--p-orange-500) 15%, var(--p-surface-900)) !important; }
        :host-context(.app-dark) .inv-suggested-badge { background: color-mix(in srgb, var(--p-orange-500) 15%, var(--p-surface-900)); color: var(--p-orange-400); }

        :host-context(.app-dark) .builder-center { background: var(--p-surface-950); }
        :host-context(.app-dark) .center-header {
            background: var(--p-surface-900);
            border-bottom-color: var(--p-surface-700);
        }
        :host-context(.app-dark) .day-scroll-area::-webkit-scrollbar-thumb { background: var(--p-surface-600); }

        :host-context(.app-dark) .timeline-number {
            background: var(--p-surface-700); color: var(--p-surface-200);
            border-color: var(--p-surface-900); box-shadow: 0 0 0 2px var(--p-surface-700);
        }
        :host-context(.app-dark) .timeline-number.active {
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--p-primary-500) 25%, var(--p-surface-900));
        }
        :host-context(.app-dark) .timeline-line { background: var(--p-surface-700); }

        :host-context(.app-dark) .day-card {
            background: var(--p-surface-900);
            border-color: var(--p-surface-700);
        }
        :host-context(.app-dark) .day-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.4); border-color: var(--p-surface-600); }
        :host-context(.app-dark) .day-card-header:hover { background: var(--p-surface-800); }
        :host-context(.app-dark) .day-card-body { border-top-color: var(--p-surface-700); }

        :host-context(.app-dark) .day-item {
            background: var(--p-surface-800);
            border-color: var(--p-surface-700);
        }
        :host-context(.app-dark) .day-item:hover { border-color: var(--p-surface-600); box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        :host-context(.app-dark) .day-item-remove { border-color: var(--p-surface-900); }
        :host-context(.app-dark) .day-item-add {
            border-color: var(--p-surface-600);
        }
        :host-context(.app-dark) .day-item-add:hover { border-color: var(--p-primary-400); background: color-mix(in srgb, var(--p-primary-500) 10%, var(--p-surface-900)); }

        :host-context(.app-dark) .add-day-card {
            border-color: var(--p-green-700);
            color: var(--p-green-400);
        }
        :host-context(.app-dark) .add-day-card:hover { background: color-mix(in srgb, var(--p-green-500) 10%, var(--p-surface-900)); border-color: var(--p-green-500); box-shadow: 0 2px 12px rgba(34,197,94,0.15); }
        :host-context(.app-dark) .add-day-number {
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--p-green-500) 20%, var(--p-surface-900)) !important;
        }

        :host-context(.app-dark) .center-footer {
            background: var(--p-surface-900);
            border-top-color: var(--p-surface-700);
        }

        :host-context(.app-dark) .sidebar-right {
            background: var(--p-surface-900);
            border-left-color: var(--p-surface-700);
        }
        :host-context(.app-dark) .sidebar-right::-webkit-scrollbar-thumb { background: var(--p-surface-600); }
        :host-context(.app-dark) .pricing-header { border-bottom-color: var(--p-surface-700); }
        :host-context(.app-dark) .pricing-section { border-bottom-color: var(--p-surface-700); }
        :host-context(.app-dark) .pricing-totals { border-bottom-color: var(--p-surface-700); }
        :host-context(.app-dark) .pricing-grand-total {
            background: color-mix(in srgb, var(--p-green-500) 12%, var(--p-surface-900));
            color: var(--p-green-400);
        }
        :host-context(.app-dark) .pricing-perperson {
            background: color-mix(in srgb, var(--p-primary-500) 12%, var(--p-surface-900));
            color: var(--p-primary-400);
        }
        :host-context(.app-dark) .impact-row.highlight {
            background: color-mix(in srgb, var(--p-primary-500) 10%, var(--p-surface-900));
            color: var(--p-primary-400);
        }
        :host-context(.app-dark) .qa-btn { color: var(--p-surface-300); }
        :host-context(.app-dark) .qa-btn:hover { background: var(--p-surface-800); color: var(--p-primary-400); }
        :host-context(.app-dark) .qa-btn.danger:hover { background: color-mix(in srgb, var(--p-red-500) 10%, var(--p-surface-900)); color: var(--p-red-400); }

        :host-context(.app-dark) .toolbar-btn-preview {
            background: color-mix(in srgb, var(--p-primary-500) 15%, var(--p-surface-900)) !important;
            color: var(--p-primary-400) !important;
        }
        :host-context(.app-dark) .toolbar-btn-preview:hover {
            background: color-mix(in srgb, var(--p-primary-500) 25%, var(--p-surface-900)) !important;
        }
        :host-context(.app-dark) .toolbar-title-divider { background: var(--p-surface-600); }

        /* ── Dark mode: Pricing text visibility ── */
        :host-context(.app-dark) .pricing-header-title { color: var(--p-surface-100); }
        :host-context(.app-dark) .pricing-section-header span { color: var(--p-surface-200) !important; }
        :host-context(.app-dark) .pricing-row-label { color: var(--p-surface-300); }
        :host-context(.app-dark) .pricing-row-value { color: var(--p-surface-100); }
        :host-context(.app-dark) .pricing-total-row { color: var(--p-surface-300); }
        :host-context(.app-dark) .pricing-total-row .font-semibold { color: var(--p-surface-100); }
        :host-context(.app-dark) .pricing-row-icon.bg-blue-50,
        :host-context(.app-dark) .pricing-row-icon[class*="bg-blue"] {
            background: color-mix(in srgb, var(--p-blue-500) 15%, var(--p-surface-900)) !important;
        }
        :host-context(.app-dark) .pricing-row-icon.bg-green-50,
        :host-context(.app-dark) .pricing-row-icon[class*="bg-green"] {
            background: color-mix(in srgb, var(--p-green-500) 15%, var(--p-surface-900)) !important;
        }
        :host-context(.app-dark) .pricing-row-icon.bg-orange-50,
        :host-context(.app-dark) .pricing-row-icon[class*="bg-orange"] {
            background: color-mix(in srgb, var(--p-orange-500) 15%, var(--p-surface-900)) !important;
        }
        :host-context(.app-dark) .pricing-row-icon.bg-red-50,
        :host-context(.app-dark) .pricing-row-icon[class*="bg-red"] {
            background: color-mix(in srgb, var(--p-red-500) 15%, var(--p-surface-900)) !important;
        }
        :host-context(.app-dark) .pricing-row-icon.bg-purple-50,
        :host-context(.app-dark) .pricing-row-icon[class*="bg-purple"] {
            background: color-mix(in srgb, var(--p-purple-500) 15%, var(--p-surface-900)) !important;
        }
        :host-context(.app-dark) .pricing-row-icon.others-icon {
            background: var(--p-surface-800) !important;
            color: var(--p-surface-300);
        }
        :host-context(.app-dark) .impact-row { color: var(--p-surface-300); }
        :host-context(.app-dark) .impact-row span.font-medium { color: var(--p-surface-100); }
        :host-context(.app-dark) .recalc-btn { color: var(--p-primary-400); }
        :host-context(.app-dark) .setting-field label { color: var(--p-surface-400); }
        :host-context(.app-dark) .footer-duration { color: var(--p-surface-300); }
        :host-context(.app-dark) .footer-right { color: var(--p-surface-400); }
        :host-context(.app-dark) .day-card-title { color: var(--p-surface-100); }
        :host-context(.app-dark) .day-card-location { color: var(--p-surface-400); }
        :host-context(.app-dark) .day-item-name { color: var(--p-surface-100); }
        :host-context(.app-dark) .day-item-detail { color: var(--p-surface-400); }
        :host-context(.app-dark) .day-item-add-text { color: var(--p-surface-400); }
        :host-context(.app-dark) .day-item-add-text .sub { color: var(--p-surface-500); }
        :host-context(.app-dark) .day-note-toggle { color: var(--p-surface-400); }
        :host-context(.app-dark) .inv-item-name { color: var(--p-surface-100); }
        :host-context(.app-dark) .inv-item-meta { color: var(--p-surface-400); }
        :host-context(.app-dark) .inv-section-label { color: var(--p-surface-400); }
        :host-context(.app-dark) .inv-section-count { color: var(--p-surface-500); }
        :host-context(.app-dark) .sidebar-title { color: var(--p-surface-100); }
        :host-context(.app-dark) .header-field label { color: var(--p-surface-400); }
        :host-context(.app-dark) .toolbar-title { color: var(--p-surface-100); }
    `]
})
export class ItineraryBuilderComponent implements OnInit, OnDestroy {
    // ── Embeddable dialog mode (e.g. hosted full-screen from Lead Workspace) ──
    /** When true, the component behaves as an embedded widget (e.g. inside a p-dialog) instead of a routed page. */
    @Input() dialogMode = false;
    /** Itinerary id to load when embedded (equivalent to the `:id` route param). */
    @Input() embeddedItineraryId: number | null = null;
    /** Lead id to attribute this itinerary to when embedded (equivalent to the `leadId` query param). */
    @Input() embeddedLeadId: number | null = null;
    /** Emitted when the user closes the embedded builder (back button, "Back to Lead", or after a successful save while in lead context). */
    @Output() closed = new EventEmitter<void>();

    @HostBinding('class.dialog-mode') get isDialogMode(): boolean { return this.dialogMode; }

    // ── State ──
    itineraryId: number | null = null;
    itineraryTitle = '';
    defaultCurrency = 'USD';
    selectedSeasonId: number | null = null;
    markupPercentage = 15;
    numPax = 2;
    showMapView = false;
    sidebarCollapsed = false;
    saving = false;
    selectedDayIndex = 0;

    /** Serialized snapshot of the last-saved state, used to detect unsaved changes (see canDeactivate). */
    private lastSavedSnapshot = '';

    // Lead context (when opened from lead detail)
    leadId: number | null = null;
    leadContext = false;

    // Days
    days: (BuilderDay & { expanded: boolean; showNotes?: boolean })[] = [];

    // Inventory data
    vehicles: InventoryVehicle[] = [];
    activities: InventoryActivity[] = [];
    guides: InventoryGuide[] = [];
    locations: LocationItem[] = [];
    seasons: SeasonItem[] = [];
    currencies: CurrencyItem[] = [];
    accommodationCategories: AccommodationCategory[] = [];

    // Inventory filters
    inventorySearch = '';
    activeInventoryTab = 'All';
    inventoryTabs = ['All', 'Accommodation', 'Transport', 'Activity', 'Guide'];

    // Pricing
    pricing: PricingSummary = {
        accommodation: 0, transport: 0, activities: 0, meals: 0, guide: 0, others: 0,
        subtotal: 0, markupPercentage: 15, markupAmount: 0,
        totalEstimatedPrice: 0, pricePerPerson: 0, numPax: 2,
        seasonMultiplier: 1, locationMultiplier: 1, totalMultiplier: 1
    };

    // Select options
    currencyOptions: { label: string; value: string }[] = [];
    seasonOptions: { label: string; value: number }[] = [];
    locationOptions: { label: string; value: number }[] = [];
    accommodationOptions: { label: string; value: number }[] = [];

    get currSymbol(): string {
        const c = this.currencies.find(c => c.code === this.defaultCurrency);
        return c?.symbol || '$';
    }

    get filteredAccommodation(): AccommodationCategory[] {
        const s = this.inventorySearch.toLowerCase();
        return s ? this.accommodationCategories.filter(c => c.name.toLowerCase().includes(s) || c.description?.toLowerCase().includes(s)) : this.accommodationCategories;
    }
    get filteredVehicles(): InventoryVehicle[] {
        const s = this.inventorySearch.toLowerCase();
        return s ? this.vehicles.filter(v => v.vehicleType.toLowerCase().includes(s) || v.model.toLowerCase().includes(s)) : this.vehicles;
    }
    get filteredActivities(): InventoryActivity[] {
        const s = this.inventorySearch.toLowerCase();
        let list = s ? this.activities.filter(a => a.name.toLowerCase().includes(s) || a.location?.toLowerCase().includes(s) || a.activityType?.toLowerCase().includes(s)) : [...this.activities];
        // Sort location-matched activities to top
        const loc = this.activeLocationName;
        if (loc) {
            list.sort((a, b) => {
                const aMatch = a.location?.toLowerCase().includes(loc.toLowerCase()) ? 0 : 1;
                const bMatch = b.location?.toLowerCase().includes(loc.toLowerCase()) ? 0 : 1;
                return aMatch - bMatch;
            });
        }
        return list;
    }

    get suggestedActivityCount(): number {
        const loc = this.activeLocationName;
        if (!loc) return 0;
        return this.filteredActivities.filter(a => a.location?.toLowerCase().includes(loc.toLowerCase())).length;
    }

    get activeLocationName(): string | null {
        const expanded = this.days.filter(d => d.expanded);
        const day = expanded.length > 0 ? expanded[expanded.length - 1] : null;
        return day?.location || null;
    }
    get filteredGuides(): InventoryGuide[] {
        const s = this.inventorySearch.toLowerCase();
        return s ? this.guides.filter(g => g.fullName.toLowerCase().includes(s) || g.specialization?.toLowerCase().includes(s)) : this.guides;
    }

    constructor(
        private svc: ItineraryBuilderService,
        private msg: MessageService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        // Add class to body to signal builder is active (hides footer, adjusts layout).
        // Not applicable/needed when embedded in a dialog over another page.
        if (!this.dialogMode) document.body.classList.add('itinerary-builder-active');

        if (this.dialogMode) {
            // Embedded usage: context comes from @Input()s instead of the route.
            if (this.embeddedLeadId) {
                this.leadId = this.embeddedLeadId;
                this.leadContext = true;
            }
            if (this.embeddedItineraryId) {
                this.itineraryId = this.embeddedItineraryId;
                this.loadItinerary(this.itineraryId);
            } else {
                this.addDay();
                this.markSaved();
            }
        } else {
            // Check lead context from query params
            const leadIdParam = this.route.snapshot.queryParams['leadId'];
            if (leadIdParam) {
                this.leadId = +leadIdParam;
                this.leadContext = true;
            }

            // Check if editing
            const id = this.route.snapshot.params['id'];
            if (id) {
                this.itineraryId = +id;
                this.loadItinerary(this.itineraryId);
            } else {
                // Start with one day
                this.addDay();
                this.markSaved();
            }
        }
        this.loadInventory();
    }

    ngOnDestroy(): void {
        if (this.dialogMode) return;
        // Remove the builder-active class and restore normal layout
        document.body.classList.remove('itinerary-builder-active');
        // Scroll to top so next page isn't stuck
        window.scrollTo(0, 0);
    }

    // ── Load Inventory ──
    loadInventory(): void {
        this.svc.getVehicles().subscribe({
            next: d => { this.vehicles = d || []; this.cdr.markForCheck(); },
            error: e => console.error('Failed to load vehicles', e)
        });
        this.svc.getActivities().subscribe({
            next: d => { this.activities = d || []; this.cdr.markForCheck(); },
            error: e => console.error('Failed to load activities', e)
        });
        this.svc.getGuides().subscribe({
            next: d => { this.guides = d || []; this.cdr.markForCheck(); },
            error: e => console.error('Failed to load guides', e)
        });
        this.svc.getLocations().subscribe({
            next: d => {
                this.locations = d || [];
                this.locationOptions = this.locations.map(l => ({ label: `${l.name}, ${l.country}`, value: l.id }));
                this.cdr.markForCheck();
            },
            error: e => console.error('Failed to load locations', e)
        });
        this.svc.getSeasons().subscribe({
            next: d => {
                this.seasons = d || [];
                this.seasonOptions = this.seasons.map(s => ({ label: `${s.name} (${s.seasonType})`, value: s.id }));
                this.cdr.markForCheck();
            },
            error: e => console.error('Failed to load seasons', e)
        });
        this.svc.getCurrencies().subscribe({
            next: d => {
                this.currencies = d || [];
                this.currencyOptions = this.currencies.map(c => ({ label: `${c.code} (${c.symbol})`, value: c.code }));
                this.cdr.markForCheck();
            },
            error: e => console.error('Failed to load currencies', e)
        });
        this.svc.getAccommodationCategories().subscribe({
            next: d => {
                this.accommodationCategories = d || [];
                this.accommodationOptions = this.accommodationCategories.map(ac => ({
                    label: ac.name,
                    value: ac.id
                }));
                this.cdr.markForCheck();
            },
            error: e => console.error('Failed to load accommodation categories', e)
        });
    }

    // ── Load existing itinerary ──
    loadItinerary(id: number): void {
        this.svc.getById(id).subscribe({
            next: data => {
                this.itineraryTitle = data.title;
                this.defaultCurrency = data.defaultCurrency || 'USD';
                this.selectedSeasonId = data.seasonId ?? null;
                this.markupPercentage = data.markupPercentage || 15;
                this.numPax = data.numPax || 2;
                this.days = data.days.map(d => ({
                    ...d,
                    accommodationCategoryId: (d as any).accommodationCategoryId ?? undefined,
                    accommodationCategoryName: (d as any).accommodationCategoryName ?? undefined,
                    items: d.items.map(i => ({ ...i })),
                    expanded: true,
                    showNotes: !!d.notes
                }));
                this.recalcPricing();
                this.markSaved();
                this.cdr.markForCheck();
            },
            error: () => {
                this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load itinerary. It may have been deleted or you may not have access.' });
                this.cdr.markForCheck();
                setTimeout(() => this.goBack(), 1500);
            }
        });
    }

    // ── Day Management ──
    addDay(): void {
        const num = this.days.length + 1;
        this.days.push({
            dayNumber: num,
            items: [],
            expanded: true
        });
        this.selectedDayIndex = this.days.length - 1;
    }

    removeDay(index: number): void {
        this.days.splice(index, 1);
        this.days.forEach((d, i) => d.dayNumber = i + 1);
        this.recalcPricing();
    }

    toggleNotes(day: any): void {
        day.showNotes = !day.showNotes;
    }

    onDayLocationChange(day: BuilderDay): void {
        if (day.locationId) {
            const loc = this.locations.find(l => l.id === day.locationId);
            if (loc) day.location = loc.name;
        } else {
            day.location = undefined;
        }
        this.recalcPricing();
    }

    onAccommodationChange(day: any): void {
        if (day.accommodationCategoryId) {
            const cat = this.accommodationCategories.find(c => c.id === day.accommodationCategoryId);
            if (cat) day.accommodationCategoryName = cat.name;
        } else {
            day.accommodationCategoryName = undefined;
        }
    }

    getAccommodationLabel(categoryId: number): string {
        const cat = this.accommodationCategories.find(c => c.id === categoryId);
        return cat?.name || 'Accommodation';
    }

    // ── Add items to selected day ──
    private getTargetDay(): BuilderDay & { expanded: boolean } {
        if (this.days.length === 0) this.addDay();
        // Use the last expanded day, or the last day
        const expanded = this.days.filter(d => d.expanded);
        return expanded.length > 0 ? expanded[expanded.length - 1] : this.days[this.days.length - 1];
    }

    addAccommodationToDay(cat: AccommodationCategory): void {
        const day = this.getTargetDay();
        // Remove any existing hotel item on this day first (one accommodation per day)
        const existingIdx = day.items.findIndex(i => i.itemType === 'hotel');
        if (existingIdx >= 0) day.items.splice(existingIdx, 1);
        (day as any).accommodationCategoryId = cat.id;
        (day as any).accommodationCategoryName = cat.name;
        // Use avg price per night from the category
        const pricePerNight = cat.avgPricePerNight || 0;
        const paxCount = cat.paxCount || 2;
        // Add as a BuilderItem so it renders in the day card
        day.items.push({
            itemType: 'hotel',
            inventoryItemId: cat.id,
            itemName: cat.name,
            itemDetails: pricePerNight > 0
                ? `${cat.baseCurrency || 'USD'} ${pricePerNight}/night · ${paxCount} pax/room`
                : (cat.description || 'Accommodation'),
            sortOrder: day.items.length,
            quantity: 1,
            unitPrice: pricePerNight,
            currency: cat.baseCurrency || this.defaultCurrency,
            paxCount: paxCount
        });
        day.expanded = true;
        this.recalcPricing();
        this.msg.add({ severity: 'success', summary: 'Added', detail: `${cat.name} added to Day ${day.dayNumber}`, life: 2000 });
        this.cdr.markForCheck();
    }

    addVehicleToDay(vehicle: InventoryVehicle): void {
        const day = this.getTargetDay();
        day.items.push({
            itemType: 'transport',
            inventoryItemId: vehicle.id,
            itemName: vehicle.vehicleType,
            itemDetails: vehicle.model,
            sortOrder: day.items.length,
            quantity: 1,
            unitPrice: vehicle.pricePerDay || 0,
            currency: this.defaultCurrency
        });
        day.expanded = true;
        this.recalcPricing();
        this.msg.add({ severity: 'success', summary: 'Added', detail: `${vehicle.vehicleType} added to Day ${day.dayNumber}`, life: 2000 });
        this.cdr.markForCheck();
    }

    addActivityToDay(activity: InventoryActivity): void {
        const day = this.getTargetDay();
        day.items.push({
            itemType: 'activity',
            inventoryItemId: activity.id,
            itemName: activity.name,
            itemDetails: activity.activityType,
            sortOrder: day.items.length,
            quantity: 1,
            unitPrice: activity.pricePerPerson || 0,
            currency: this.defaultCurrency
        });
        day.expanded = true;
        this.recalcPricing();
        this.msg.add({ severity: 'success', summary: 'Added', detail: `${activity.name} added to Day ${day.dayNumber}`, life: 2000 });
        this.cdr.markForCheck();
    }

    addGuideToDay(guide: InventoryGuide): void {
        const day = this.getTargetDay();
        day.items.push({
            itemType: 'guide',
            inventoryItemId: guide.id,
            itemName: guide.fullName,
            itemDetails: guide.specialization || 'Guide',
            sortOrder: day.items.length,
            quantity: 1,
            unitPrice: guide.pricePerDay || 0,
            currency: this.defaultCurrency
        });
        day.expanded = true;
        this.recalcPricing();
        this.msg.add({ severity: 'success', summary: 'Added', detail: `${guide.fullName} added to Day ${day.dayNumber}`, life: 2000 });
        this.cdr.markForCheck();
    }

    addMealToDay(day: BuilderDay & { expanded: boolean }): void {
        day.items.push({
            itemType: 'meal',
            itemName: 'Meal',
            itemDetails: 'Breakfast/Lunch/Dinner',
            sortOrder: day.items.length,
            quantity: 1,
            unitPrice: 15,
            currency: this.defaultCurrency
        });
        this.recalcPricing();
    }

    removeItem(day: BuilderDay, index: number): void {
        day.items.splice(index, 1);
        day.items.forEach((item, i) => item.sortOrder = i);
        this.recalcPricing();
    }

    // ── Pricing (local calculation) ──
    recalcPricing(): void {
        let accommodation = 0, transport = 0, activities = 0, meals = 0, guide = 0, others = 0;
        const pax = this.numPax > 0 ? this.numPax : 2;

        for (const day of this.days) {
            for (const item of day.items) {
                const basePrice = (item.unitPrice || 0) * (item.quantity || 1);

                switch (item.itemType) {
                    case 'hotel':
                        // Accommodation: price is per room per night.
                        // Calculate rooms needed based on total pax and paxCount per room.
                        const paxPerRoom = item.paxCount || 2;
                        const roomsNeeded = Math.ceil(pax / paxPerRoom);
                        accommodation += (item.unitPrice || 0) * (item.quantity || 1) * roomsNeeded;
                        break;
                    case 'meal':
                        // Meals: per person — multiply by pax
                        meals += basePrice * pax;
                        break;
                    case 'activity':
                        // Activities: per person — multiply by pax
                        activities += basePrice * pax;
                        break;
                    case 'transport':
                        // Transport: per person — multiply by pax
                        transport += basePrice * pax;
                        break;
                    case 'guide':
                        // Guide: flat rate for the group (not per person)
                        guide += basePrice;
                        break;
                    default:
                        others += basePrice;
                        break;
                }
            }
        }

        // Season multiplier
        let seasonMultiplier = 1;
        let seasonName: string | undefined;
        if (this.selectedSeasonId) {
            const season = this.seasons.find(s => s.id === this.selectedSeasonId);
            if (season) {
                seasonMultiplier = season.priceMultiplier;
                seasonName = `${season.name} (${season.priceMultiplier.toFixed(2)}x)`;
            }
        }

        // Location multiplier
        let locationMultiplier = 1;
        const locIds = [...new Set(this.days.filter(d => d.locationId).map(d => d.locationId!))];
        if (locIds.length > 0) {
            const locs = this.locations.filter(l => locIds.includes(l.id));
            if (locs.length > 0) {
                locationMultiplier = locs.reduce((sum, l) => sum + l.costMultiplier, 0) / locs.length;
            }
        }

        const totalMultiplier = seasonMultiplier * locationMultiplier;
        const subtotal = (accommodation + transport + activities + meals + guide + others) * totalMultiplier;
        const markupAmount = subtotal * this.markupPercentage / 100;
        const total = subtotal + markupAmount;

        this.pricing = {
            accommodation, transport, activities, meals, guide, others,
            subtotal: Math.round(subtotal * 100) / 100,
            markupPercentage: this.markupPercentage,
            markupAmount: Math.round(markupAmount * 100) / 100,
            totalEstimatedPrice: Math.round(total * 100) / 100,
            pricePerPerson: Math.round(total / pax * 100) / 100,
            numPax: pax,
            seasonName,
            seasonMultiplier,
            locationMultiplier: Math.round(locationMultiplier * 100) / 100,
            totalMultiplier: Math.round(totalMultiplier * 100) / 100
        };
        this.cdr.markForCheck();
    }

    // ── Item styling helpers ──
    getItemIcon(type: string): string {
        switch (type) {
            case 'hotel': return 'pi pi-building';
            case 'transport': return 'pi pi-car';
            case 'activity': return 'pi pi-flag';
            case 'meal': return 'pi pi-heart';
            case 'guide': return 'pi pi-user';
            default: return 'pi pi-box';
        }
    }

    getItemIconColor(type: string): string {
        switch (type) {
            case 'hotel': return 'text-blue-500';
            case 'transport': return 'text-green-500';
            case 'activity': return 'text-orange-500';
            case 'meal': return 'text-red-500';
            case 'guide': return 'text-purple-500';
            default: return 'text-gray-500';
        }
    }

    getItemBg(type: string): string {
        switch (type) {
            case 'hotel': return 'bg-blue-50';
            case 'transport': return 'bg-green-50';
            case 'activity': return 'bg-orange-50';
            case 'meal': return 'bg-red-50';
            case 'guide': return 'bg-purple-50';
            default: return '';
        }
    }

    getItemIconWrapClass(type: string): string {
        switch (type) {
            case 'hotel': return 'bg-blue-50 text-blue-500';
            case 'transport': return 'bg-green-50 text-green-600';
            case 'activity': return 'bg-orange-50 text-orange-500';
            case 'meal': return 'bg-red-50 text-red-500';
            case 'guide': return 'bg-purple-50 text-purple-500';
            default: return 'bg-gray-50 text-gray-500';
        }
    }

    starArray(count: number): number[] {
        return Array.from({ length: count || 0 }, (_, i) => i);
    }

    // ── Save / Publish ──
    private buildRequest(status: string): SaveBuilderRequest {
        return {
            title: this.itineraryTitle,
            durationDays: this.days.length,
            defaultCurrency: this.defaultCurrency,
            seasonId: this.selectedSeasonId ?? undefined,
            markupPercentage: this.markupPercentage,
            numPax: this.numPax > 0 ? this.numPax : 2,
            status,
            days: this.days.map(d => ({
                dayNumber: d.dayNumber,
                title: d.title,
                location: d.location,
                locationId: d.locationId,
                accommodationCategoryId: (d as any).accommodationCategoryId,
                notes: d.notes,
                items: d.items.map(i => ({
                    itemType: i.itemType,
                    inventoryItemId: i.inventoryItemId,
                    itemName: i.itemName,
                    itemDetails: i.itemDetails,
                    sortOrder: i.sortOrder,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    currency: i.currency || this.defaultCurrency,
                    notes: i.notes,
                    paxCount: i.paxCount
                }))
            }))
        };
    }

    /** Snapshot of the persisted state, excluding `status` (draft vs published doesn't count as a "change"). */
    private snapshot(): string {
        const { status, ...rest } = this.buildRequest('draft');
        return JSON.stringify(rest);
    }

    /** Marks the current state as the saved baseline for unsaved-changes detection. */
    private markSaved(): void {
        this.lastSavedSnapshot = this.snapshot();
    }

    /** Whether the builder has edits that haven't been persisted yet. Used by the unsaved-changes route guard. */
    hasUnsavedChanges(): boolean {
        return this.snapshot() !== this.lastSavedSnapshot;
    }

    /**
     * Shared save/publish flow — saveDraft(), publish() and continueToProposal() only differ
     * in the status they persist and what happens after a successful save.
     */
    private submit(status: string, onSuccess: (res: BuilderResponse) => void, failureMessage: string): void {
        if (!this.itineraryTitle) {
            this.msg.add({ severity: 'warn', summary: 'Required', detail: 'Please enter an itinerary name' });
            return;
        }
        this.saving = true;
        const req = this.buildRequest(status);

        const obs = this.itineraryId
            ? this.svc.update(this.itineraryId, req)
            : this.svc.save(req);

        obs.subscribe({
            next: res => {
                this.itineraryId = res.id;
                this.saving = false;
                this.markSaved();
                this.cdr.markForCheck();
                onSuccess(res);
            },
            error: () => {
                this.saving = false;
                this.msg.add({ severity: 'error', summary: 'Error', detail: failureMessage });
                this.cdr.markForCheck();
            }
        });
    }

    saveDraft(): void {
        this.submit('draft', () => {
            this.msg.add({ severity: 'success', summary: 'Saved', detail: 'Draft saved successfully' });
            if (this.leadContext && this.leadId) {
                setTimeout(() => this.goBackToLead(), 1200);
            }
        }, 'Failed to save');
    }

    publish(): void {
        this.submit('published', () => {
            this.msg.add({ severity: 'success', summary: 'Published', detail: 'Itinerary published!' });
            if (this.leadContext && this.leadId) {
                setTimeout(() => this.goBackToLead(), 1200);
            }
        }, 'Failed to publish');
    }

    preview(): void {
        this.msg.add({ severity: 'info', summary: 'Preview', detail: 'Preview mode coming soon' });
    }

    // ── Continue to Proposal (lead context) ──
    continueToProposal(): void {
        this.submit('published', res => {
            this.msg.add({ severity: 'success', summary: 'Saved', detail: 'Itinerary saved. Redirecting to proposal...' });
            // Navigate to proposal-customize with itinerary + lead context
            setTimeout(() => {
                this.router.navigate(['/proposal-customize', res.id], {
                    queryParams: { leadId: this.leadId }
                });
            }, 800);
        }, 'Failed to save itinerary');
    }

    // ── Quick Actions ──
    duplicateItinerary(): void {
        // Deep clone days
        const cloned = this.days.map(d => ({
            ...d,
            id: undefined,
            items: d.items.map(i => ({ ...i, id: undefined }))
        }));
        this.itineraryId = null;
        this.itineraryTitle = this.itineraryTitle + ' (Copy)';
        this.days = cloned as any;
        this.msg.add({ severity: 'info', summary: 'Duplicated', detail: 'Itinerary duplicated. Save to create a new copy.' });
    }

    clearAll(): void {
        this.days = [];
        this.addDay();
        this.recalcPricing();
        this.msg.add({ severity: 'info', summary: 'Cleared', detail: 'All days cleared' });
    }

    goBack(): void {
        if (this.dialogMode) {
            this.requestClose();
            return;
        }
        if (this.leadContext && this.leadId) {
            this.goBackToLead();
        } else {
            this.router.navigate(['/itinerary-list']);
        }
    }

    goBackToLead(): void {
        if (this.dialogMode) {
            this.requestClose();
            return;
        }
        if (this.leadId) {
            this.router.navigate(['/sales/leads', this.leadId], { queryParams: { tab: 'proposals' } });
        }
    }

    /** Closes the embedded builder (dialog mode only), confirming first if there are unsaved changes. */
    requestClose(): void {
        if (this.hasUnsavedChanges() && !window.confirm('You have unsaved changes. Close and discard them?')) {
            return;
        }
        this.closed.emit();
    }

    // ── Unsaved changes guard hook (see unsaved-changes.guard.ts) ──
    canDeactivate(): boolean {
        if (!this.hasUnsavedChanges()) return true;
        return window.confirm('You have unsaved changes. Leave this page and discard them?');
    }
}

