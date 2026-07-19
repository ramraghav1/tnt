import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ProposalService, ProposalResponse, ProposalDayResponse } from '../proposal.service';

@Component({
    selector: 'app-proposal-document',
    standalone: true,
    imports: [CommonModule, ButtonModule, ProgressSpinnerModule, TagModule, TooltipModule, DividerModule],
    template: `
<div class="doc-toolbar no-print">
    <div class="doc-toolbar-left">
        <button pButton icon="pi pi-arrow-left" label="Back" class="p-button-text" (click)="goBack()"></button>
    </div>
    <div class="doc-toolbar-right">
        <button pButton icon="pi pi-print" label="Print" class="p-button-outlined p-button-sm" (click)="printDocument()"></button>
        <button pButton icon="pi pi-download" label="Download PDF" class="p-button-outlined p-button-sm" (click)="printDocument()"></button>
        <button pButton icon="pi pi-send" label="Resend" class="p-button-sm" (click)="resend()"></button>
    </div>
</div>

<div *ngIf="loading" class="flex justify-center items-center" style="min-height: 400px;">
    <p-progressSpinner [style]="{ width: '50px', height: '50px' }" strokeWidth="4"></p-progressSpinner>
</div>

<div *ngIf="!loading && proposal" class="doc-page" id="proposal-document">
    <!-- ═══════════════════════════════════════ -->
    <!-- HEADER / COMPANY BRANDING -->
    <!-- ═══════════════════════════════════════ -->
    <div class="doc-header">
        <div class="doc-header-brand">
            <div class="doc-logo">T</div>
            <div class="doc-company">
                <span class="doc-company-name">TNT Nepal</span>
                <span class="doc-company-tagline">Tours & Travels Pvt. Ltd.</span>
            </div>
        </div>
        <div class="doc-header-ref">
            <div class="doc-ref-label">QUOTATION</div>
            <div class="doc-ref-number">QTN-{{ proposal.id | number:'4.0-0' }}</div>
            <div class="doc-ref-date">{{ proposal.createdAt | date:'MMMM d, yyyy' }}</div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- HERO SECTION -->
    <!-- ═══════════════════════════════════════ -->
    <div class="doc-hero">
        <h1 class="doc-hero-title">{{ proposal.itineraryTitle }}</h1>
        <p class="doc-hero-subtitle">Prepared exclusively for <strong>{{ proposal.travelerName }}</strong></p>
    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- TRIP OVERVIEW GRID -->
    <!-- ═══════════════════════════════════════ -->
    <div class="doc-overview-grid">
        <div class="doc-overview-item">
            <div class="doc-ov-icon"><i class="pi pi-calendar"></i></div>
            <div class="doc-ov-content">
                <span class="doc-ov-label">Travel Dates</span>
                <span class="doc-ov-value">{{ proposal.startDate | date:'dd MMM' }} — {{ proposal.endDate | date:'dd MMM yyyy' }}</span>
            </div>
        </div>
        <div class="doc-overview-item">
            <div class="doc-ov-icon"><i class="pi pi-sun"></i></div>
            <div class="doc-ov-content">
                <span class="doc-ov-label">Duration</span>
                <span class="doc-ov-value">{{ proposal.days.length }} Days / {{ proposal.days.length - 1 }} Nights</span>
            </div>
        </div>
        <div class="doc-overview-item">
            <div class="doc-ov-icon"><i class="pi pi-user"></i></div>
            <div class="doc-ov-content">
                <span class="doc-ov-label">Traveler</span>
                <span class="doc-ov-value">{{ proposal.travelerName }}</span>
            </div>
        </div>
        <div class="doc-overview-item doc-ov-highlight">
            <div class="doc-ov-icon"><i class="pi pi-wallet"></i></div>
            <div class="doc-ov-content">
                <span class="doc-ov-label">Total Cost</span>
                <span class="doc-ov-value doc-ov-price">NPR {{ proposal.totalAmount | number:'1.0-0' }}</span>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- ITINERARY SUMMARY -->
    <!-- ═══════════════════════════════════════ -->
    <div class="doc-section">
        <div class="doc-section-header">
            <i class="pi pi-map"></i>
            <h2>Itinerary Summary</h2>
        </div>

        <div class="doc-itinerary-table">
            <div class="doc-itin-header-row">
                <span class="doc-itin-col-day">Day</span>
                <span class="doc-itin-col-title">Program</span>
                <span class="doc-itin-col-hotel">Accommodation</span>
                <span class="doc-itin-col-meals">Meals</span>
            </div>
            <div *ngFor="let day of proposal.days" class="doc-itin-row">
                <span class="doc-itin-col-day">
                    <span class="doc-day-badge">{{ day.dayNumber }}</span>
                </span>
                <span class="doc-itin-col-title">
                    <strong>{{ day.title || 'Day ' + day.dayNumber }}</strong>
                    <small *ngIf="day.location"><i class="pi pi-map-marker"></i> {{ day.location }}</small>
                </span>
                <span class="doc-itin-col-hotel">{{ day.accommodation || '—' }}</span>
                <span class="doc-itin-col-meals">
                    <span *ngFor="let m of getMealIcons(day)" class="doc-meal-icon" [pTooltip]="m.label">{{ m.icon }}</span>
                    <span *ngIf="!getMealIcons(day).length" class="doc-no-meal">—</span>
                </span>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- DETAILED ITINERARY -->
    <!-- ═══════════════════════════════════════ -->
    <div class="doc-section">
        <div class="doc-section-header">
            <i class="pi pi-list"></i>
            <h2>Detailed Itinerary</h2>
        </div>

        <div class="doc-day-details">
            <div *ngFor="let day of proposal.days; let last = last" class="doc-day-card" [class.last]="last">
                <div class="doc-day-marker">
                    <div class="doc-day-num">{{ day.dayNumber }}</div>
                    <div class="doc-day-line" *ngIf="!last"></div>
                </div>
                <div class="doc-day-body">
                    <div class="doc-day-title-row">
                        <h3>{{ day.title || 'Day ' + day.dayNumber }}</h3>
                        <span class="doc-day-cost" *ngIf="day.dailyCost">NPR {{ day.dailyCost | number:'1.0-0' }}</span>
                    </div>
                    <p *ngIf="day.description" class="doc-day-desc">{{ day.description }}</p>

                    <div class="doc-day-chips">
                        <span *ngIf="day.location" class="doc-chip"><i class="pi pi-map-marker"></i> {{ day.location }}</span>
                        <span *ngIf="day.accommodation" class="doc-chip"><i class="pi pi-building"></i> {{ day.accommodation }}</span>
                        <span *ngIf="day.transport" class="doc-chip"><i class="pi pi-car"></i> {{ day.transport }}</span>
                        <span *ngIf="getMeals(day).length" class="doc-chip"><i class="pi pi-star"></i> {{ getMeals(day).join(', ') }}</span>
                    </div>

                    <div *ngIf="day.activities.length" class="doc-day-activities">
                        <span *ngFor="let act of day.activities" class="doc-activity-pill">{{ act }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- COST SUMMARY -->
    <!-- ═══════════════════════════════════════ -->
    <div class="doc-section">
        <div class="doc-section-header">
            <i class="pi pi-wallet"></i>
            <h2>Cost Summary</h2>
        </div>

        <div class="doc-cost-table">
            <div class="doc-cost-row doc-cost-header">
                <span>Description</span>
                <span>Amount (NPR)</span>
            </div>
            <div *ngFor="let day of proposal.days" class="doc-cost-row">
                <span>Day {{ day.dayNumber }}: {{ day.title || day.location || '-' }}</span>
                <span>{{ day.dailyCost | number:'1.0-0' }}</span>
            </div>
            <div class="doc-cost-row doc-cost-total">
                <span>Grand Total</span>
                <span>NPR {{ proposal.totalAmount | number:'1.2-2' }}</span>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- INCLUSIONS & EXCLUSIONS -->
    <!-- ═══════════════════════════════════════ -->
    <div class="doc-section doc-inc-exc">
        <div class="doc-inc-exc-grid">
            <div class="doc-inc-box">
                <h3><i class="pi pi-check-circle"></i> Inclusions</h3>
                <ul>
                    <li *ngFor="let item of inclusions">{{ item }}</li>
                </ul>
            </div>
            <div class="doc-exc-box">
                <h3><i class="pi pi-times-circle"></i> Exclusions</h3>
                <ul>
                    <li *ngFor="let item of exclusions">{{ item }}</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- IMPORTANT NOTES -->
    <!-- ═══════════════════════════════════════ -->
    <div class="doc-section" *ngIf="proposal.notes">
        <div class="doc-section-header">
            <i class="pi pi-info-circle"></i>
            <h2>Important Notes</h2>
        </div>
        <div class="doc-notes-content">
            <p>{{ proposal.notes }}</p>
        </div>
    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- VALIDITY & PAYMENT TERMS -->
    <!-- ═══════════════════════════════════════ -->
    <div class="doc-section">
        <div class="doc-section-header">
            <i class="pi pi-clock"></i>
            <h2>Validity & Payment Terms</h2>
        </div>
        <div class="doc-terms">
            <div class="doc-terms-row">
                <span class="doc-terms-label">Quotation Valid Until</span>
                <span class="doc-terms-value">{{ proposal.expiresAt | date:'MMMM d, yyyy' }}</span>
            </div>
            <div class="doc-terms-row">
                <span class="doc-terms-label">Advance Payment</span>
                <span class="doc-terms-value">30% at the time of confirmation</span>
            </div>
            <div class="doc-terms-row">
                <span class="doc-terms-label">Balance Payment</span>
                <span class="doc-terms-value">70% before trip start date</span>
            </div>
            <div class="doc-terms-row">
                <span class="doc-terms-label">Payment Methods</span>
                <span class="doc-terms-value">Bank Transfer, eSewa, Khalti, Credit Card</span>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- FOOTER -->
    <!-- ═══════════════════════════════════════ -->
    <div class="doc-footer">
        <div class="doc-footer-brand">
            <div class="doc-logo doc-logo-sm">T</div>
            <span class="doc-footer-company">TNT Nepal — Tours & Travels Pvt. Ltd.</span>
        </div>
        <div class="doc-footer-contact">
            <span><i class="pi pi-envelope"></i> info&#64;tntnepal.com</span>
            <span><i class="pi pi-phone"></i> +977-1-4XXXXXX</span>
            <span><i class="pi pi-globe"></i> www.tntnepal.com</span>
        </div>
        <div class="doc-footer-note">
            Thank you for choosing TNT Nepal. We look forward to making your trip memorable!
        </div>
    </div>
</div>
    `,
    styles: [`
        /* ══════════════════════ TOOLBAR ══════════════════════ */
        .doc-toolbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.75rem 1.5rem; margin: -1.25rem -1.25rem 1.5rem;
            background: var(--surface-card); border-bottom: 1px solid var(--surface-border);
            position: sticky; top: 0; z-index: 10;
        }
        .doc-toolbar-left { display: flex; align-items: center; gap: 0.5rem; }
        .doc-toolbar-right { display: flex; align-items: center; gap: 0.5rem; }

        /* ══════════════════════ PAGE ══════════════════════ */
        .doc-page {
            max-width: 900px; margin: 0 auto; padding: 2.5rem;
            background: var(--surface-card); border-radius: 1rem;
            box-shadow: 0 4px 40px color-mix(in srgb, var(--text-color) 6%, transparent);
            border: 1px solid var(--surface-border);
        }

        /* ══════════════════════ HEADER ══════════════════════ */
        .doc-header {
            display: flex; align-items: flex-start; justify-content: space-between;
            padding-bottom: 1.5rem; border-bottom: 2px solid var(--primary-color);
            margin-bottom: 2rem;
        }
        .doc-header-brand { display: flex; align-items: center; gap: 0.875rem; }
        .doc-logo {
            width: 52px; height: 52px; border-radius: 0.75rem;
            background: var(--primary-color); color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.5rem; font-weight: 900;
        }
        .doc-logo-sm { width: 32px; height: 32px; font-size: 1rem; border-radius: 0.5rem; }
        .doc-company { display: flex; flex-direction: column; }
        .doc-company-name { font-size: 1.5rem; font-weight: 800; color: var(--text-color); line-height: 1.2; }
        .doc-company-tagline { font-size: 0.875rem; color: var(--text-color-secondary); font-weight: 500; }
        .doc-header-ref { text-align: right; }
        .doc-ref-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: var(--primary-color); text-transform: uppercase; }
        .doc-ref-number { font-size: 1.5rem; font-weight: 800; color: var(--text-color); }
        .doc-ref-date { font-size: 0.875rem; color: var(--text-color-secondary); margin-top: 0.25rem; }

        /* ══════════════════════ HERO ══════════════════════ */
        .doc-hero {
            text-align: center; padding: 2rem 1rem 2.5rem;
            background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 6%, var(--surface-card)), color-mix(in srgb, var(--primary-color) 3%, var(--surface-card)));
            border-radius: 0.875rem; margin-bottom: 2rem;
        }
        .doc-hero-title {
            font-size: 2rem; font-weight: 800; line-height: 1.3;
            color: var(--text-color); margin: 0 0 0.5rem;
        }
        .doc-hero-subtitle { font-size: 1.125rem; color: var(--text-color-secondary); margin: 0; }

        /* ══════════════════════ OVERVIEW GRID ══════════════════════ */
        .doc-overview-grid {
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2.5rem;
        }
        @media (max-width: 768px) { .doc-overview-grid { grid-template-columns: repeat(2, 1fr); } }
        .doc-overview-item {
            display: flex; align-items: center; gap: 0.75rem;
            padding: 1rem 1.25rem; border-radius: 0.75rem;
            border: 1px solid var(--surface-border); background: var(--surface-card);
        }
        .doc-ov-highlight { border-color: color-mix(in srgb, var(--primary-color) 30%, var(--surface-border)); background: color-mix(in srgb, var(--primary-color) 4%, var(--surface-card)); }
        .doc-ov-icon {
            width: 40px; height: 40px; border-radius: 50%;
            background: color-mix(in srgb, var(--primary-color) 10%, var(--surface-card));
            color: var(--primary-color); display: flex; align-items: center; justify-content: center;
            font-size: 1rem; flex-shrink: 0;
        }
        .doc-ov-content { display: flex; flex-direction: column; gap: 0.125rem; }
        .doc-ov-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-color-secondary); }
        .doc-ov-value { font-size: 0.9375rem; font-weight: 700; color: var(--text-color); }
        .doc-ov-price { color: var(--primary-color); font-size: 1.125rem; }

        /* ══════════════════════ SECTIONS ══════════════════════ */
        .doc-section { margin-bottom: 2.5rem; }
        .doc-section-header {
            display: flex; align-items: center; gap: 0.625rem;
            margin-bottom: 1.25rem; padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--surface-border);
        }
        .doc-section-header i { font-size: 1.125rem; color: var(--primary-color); }
        .doc-section-header h2 { margin: 0; font-size: 1.25rem; font-weight: 700; }

        /* ══════════════════════ ITINERARY TABLE ══════════════════════ */
        .doc-itinerary-table { border: 1px solid var(--surface-border); border-radius: 0.75rem; overflow: hidden; }
        .doc-itin-header-row {
            display: grid; grid-template-columns: 60px 1fr 180px 120px;
            padding: 0.75rem 1rem; background: color-mix(in srgb, var(--primary-color) 6%, var(--surface-card));
            font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
            color: var(--text-color-secondary); border-bottom: 1px solid var(--surface-border);
        }
        .doc-itin-row {
            display: grid; grid-template-columns: 60px 1fr 180px 120px;
            padding: 0.875rem 1rem; border-bottom: 1px solid var(--surface-border);
            align-items: center; transition: background 0.15s;
        }
        .doc-itin-row:last-child { border-bottom: none; }
        .doc-itin-row:hover { background: var(--surface-hover); }
        .doc-day-badge {
            display: inline-flex; align-items: center; justify-content: center;
            width: 28px; height: 28px; border-radius: 50%;
            background: var(--primary-color); color: #fff;
            font-size: 0.75rem; font-weight: 700;
        }
        .doc-itin-col-title { display: flex; flex-direction: column; gap: 0.25rem; }
        .doc-itin-col-title strong { font-size: 0.9375rem; }
        .doc-itin-col-title small { font-size: 0.8125rem; color: var(--text-color-secondary); display: flex; align-items: center; gap: 0.25rem; }
        .doc-itin-col-title small i { font-size: 0.6875rem; }
        .doc-itin-col-hotel { font-size: 0.875rem; color: var(--text-color-secondary); }
        .doc-itin-col-meals { display: flex; gap: 0.375rem; }
        .doc-meal-icon { font-size: 1rem; cursor: default; }
        .doc-no-meal { color: var(--text-color-secondary); font-size: 0.875rem; }

        /* ══════════════════════ DAY DETAILS ══════════════════════ */
        .doc-day-details { padding-left: 0.5rem; }
        .doc-day-card { display: flex; gap: 1rem; margin-bottom: 0; }
        .doc-day-card.last .doc-day-line { display: none; }
        .doc-day-marker { display: flex; flex-direction: column; align-items: center; width: 44px; flex-shrink: 0; }
        .doc-day-num {
            width: 36px; height: 36px; border-radius: 50%;
            background: var(--primary-color); color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.875rem; font-weight: 700;
        }
        .doc-day-line { flex: 1; width: 2px; background: color-mix(in srgb, var(--primary-color) 25%, var(--surface-border)); margin-top: 0.25rem; min-height: 16px; }
        .doc-day-body { flex: 1; padding-bottom: 1.75rem; }
        .doc-day-title-row { display: flex; align-items: center; justify-content: space-between; }
        .doc-day-title-row h3 { margin: 0; font-size: 1.0625rem; font-weight: 700; }
        .doc-day-cost { font-size: 0.9375rem; font-weight: 700; color: var(--primary-color); }
        .doc-day-desc { font-size: 0.9375rem; color: var(--text-color-secondary); margin: 0.5rem 0; line-height: 1.6; }
        .doc-day-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.625rem; }
        .doc-chip {
            display: inline-flex; align-items: center; gap: 0.375rem;
            padding: 0.3rem 0.75rem; border-radius: 2rem;
            font-size: 0.8125rem; font-weight: 500;
            background: var(--surface-hover); color: var(--text-color-secondary);
            border: 1px solid var(--surface-border);
        }
        .doc-chip i { font-size: 0.6875rem; color: var(--primary-color); }
        .doc-day-activities { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.625rem; }
        .doc-activity-pill {
            padding: 0.25rem 0.625rem; border-radius: 2rem;
            background: color-mix(in srgb, var(--primary-color) 10%, var(--surface-card));
            color: var(--primary-color); font-size: 0.8125rem; font-weight: 600;
        }

        /* ══════════════════════ COST TABLE ══════════════════════ */
        .doc-cost-table { border: 1px solid var(--surface-border); border-radius: 0.75rem; overflow: hidden; }
        .doc-cost-row {
            display: flex; justify-content: space-between; padding: 0.75rem 1.25rem;
            border-bottom: 1px solid var(--surface-border); font-size: 0.9375rem;
        }
        .doc-cost-row:last-child { border-bottom: none; }
        .doc-cost-header {
            background: color-mix(in srgb, var(--primary-color) 6%, var(--surface-card));
            font-weight: 700; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.04em;
            color: var(--text-color-secondary);
        }
        .doc-cost-total {
            background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-card));
            font-weight: 800; font-size: 1.0625rem; color: var(--primary-color);
            border-top: 2px solid var(--primary-color); border-bottom: none;
        }

        /* ══════════════════════ INCLUSIONS / EXCLUSIONS ══════════════════════ */
        .doc-inc-exc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 600px) { .doc-inc-exc-grid { grid-template-columns: 1fr; } }
        .doc-inc-box, .doc-exc-box {
            padding: 1.25rem; border-radius: 0.75rem; border: 1px solid var(--surface-border);
        }
        .doc-inc-box { background: color-mix(in srgb, #22c55e 4%, var(--surface-card)); border-color: color-mix(in srgb, #22c55e 20%, var(--surface-border)); }
        .doc-exc-box { background: color-mix(in srgb, #ef4444 4%, var(--surface-card)); border-color: color-mix(in srgb, #ef4444 20%, var(--surface-border)); }
        .doc-inc-box h3, .doc-exc-box h3 { margin: 0 0 0.75rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .doc-inc-box h3 i { color: #22c55e; }
        .doc-exc-box h3 i { color: #ef4444; }
        .doc-inc-box ul, .doc-exc-box ul {
            margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.5rem;
        }
        .doc-inc-box li, .doc-exc-box li {
            font-size: 0.9375rem; padding-left: 1.25rem; position: relative; color: var(--text-color-secondary);
        }
        .doc-inc-box li::before { content: '✓'; position: absolute; left: 0; color: #22c55e; font-weight: 700; }
        .doc-exc-box li::before { content: '✗'; position: absolute; left: 0; color: #ef4444; font-weight: 700; }

        /* ══════════════════════ NOTES ══════════════════════ */
        .doc-notes-content {
            padding: 1.25rem; border-radius: 0.75rem;
            background: color-mix(in srgb, #f59e0b 5%, var(--surface-card));
            border-left: 4px solid #f59e0b;
        }
        .doc-notes-content p { margin: 0; font-size: 0.9375rem; line-height: 1.7; color: var(--text-color-secondary); }

        /* ══════════════════════ TERMS ══════════════════════ */
        .doc-terms { border: 1px solid var(--surface-border); border-radius: 0.75rem; overflow: hidden; }
        .doc-terms-row {
            display: flex; justify-content: space-between; padding: 0.875rem 1.25rem;
            border-bottom: 1px solid var(--surface-border);
        }
        .doc-terms-row:last-child { border-bottom: none; }
        .doc-terms-label { font-size: 0.9375rem; font-weight: 600; color: var(--text-color-secondary); }
        .doc-terms-value { font-size: 0.9375rem; font-weight: 600; color: var(--text-color); }

        /* ══════════════════════ FOOTER ══════════════════════ */
        .doc-footer {
            margin-top: 2.5rem; padding-top: 2rem;
            border-top: 2px solid var(--primary-color);
            text-align: center;
        }
        .doc-footer-brand { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.75rem; }
        .doc-footer-company { font-size: 1rem; font-weight: 700; color: var(--text-color); }
        .doc-footer-contact {
            display: flex; align-items: center; justify-content: center; gap: 1.5rem;
            font-size: 0.875rem; color: var(--text-color-secondary); margin-bottom: 1rem;
        }
        .doc-footer-contact span { display: inline-flex; align-items: center; gap: 0.375rem; }
        .doc-footer-contact i { font-size: 0.75rem; color: var(--primary-color); }
        .doc-footer-note { font-size: 0.875rem; color: var(--text-color-secondary); font-style: italic; }

        /* ══════════════════════ PRINT STYLES ══════════════════════ */
        @media print {
            .no-print { display: none !important; }
            .doc-page { box-shadow: none; border: none; max-width: 100%; padding: 1.5rem; }
            .doc-hero { background: #f8f9fa !important; }
            .doc-overview-item { border-color: #dee2e6 !important; }
        }
    `]
})
export class ProposalDocument implements OnInit {
    proposal?: ProposalResponse;
    loading = true;
    proposalId = 0;

    inclusions: string[] = [];
    exclusions: string[] = [];

    private returnUrl: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private proposalService: ProposalService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.proposalId = +(this.route.snapshot.paramMap.get('id') || 0);
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;

        if (this.proposalId) {
            this.loadProposal();
        }
    }

    loadProposal(): void {
        this.proposalService.getProposalById(this.proposalId).subscribe({
            next: (res) => {
                this.proposal = res;
                this.buildInclusionsExclusions();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => { this.loading = false; }
        });
    }

    buildInclusionsExclusions(): void {
        if (!this.proposal) return;

        const incSet = new Set<string>();
        const excSet = new Set<string>();

        // Derive from day data
        let hasAccomm = false, hasTransport = false;
        let hasBreakfast = false, hasLunch = false, hasDinner = false;

        for (const day of this.proposal.days) {
            if (day.accommodation) hasAccomm = true;
            if (day.transport) hasTransport = true;
            if (day.breakfastIncluded) hasBreakfast = true;
            if (day.lunchIncluded) hasLunch = true;
            if (day.dinnerIncluded) hasDinner = true;
        }

        if (hasAccomm) incSet.add('Accommodation as per itinerary');
        if (hasTransport) incSet.add('Transportation as per itinerary');
        if (hasBreakfast) incSet.add('Breakfast as mentioned');
        if (hasLunch) incSet.add('Lunch as mentioned');
        if (hasDinner) incSet.add('Dinner as mentioned');
        incSet.add('Professional English-speaking guide');
        incSet.add('All necessary permits and entry fees');
        incSet.add('Airport transfers');

        excSet.add('International airfare');
        excSet.add('Nepal visa fees');
        excSet.add('Travel insurance');
        excSet.add('Personal expenses (laundry, phone calls, etc.)');
        excSet.add('Tips and gratuities');
        if (!hasBreakfast && !hasLunch && !hasDinner) {
            excSet.add('Meals');
        } else {
            if (!hasLunch) excSet.add('Lunch (where not mentioned)');
            if (!hasDinner) excSet.add('Dinner (where not mentioned)');
        }
        excSet.add('Beverages and alcoholic drinks');

        this.inclusions = Array.from(incSet);
        this.exclusions = Array.from(excSet);
    }

    getMeals(day: ProposalDayResponse): string[] {
        const meals: string[] = [];
        if (day.breakfastIncluded) meals.push('Breakfast');
        if (day.lunchIncluded) meals.push('Lunch');
        if (day.dinnerIncluded) meals.push('Dinner');
        return meals;
    }

    getMealIcons(day: ProposalDayResponse): { icon: string; label: string }[] {
        const icons: { icon: string; label: string }[] = [];
        if (day.breakfastIncluded) icons.push({ icon: '🌅', label: 'Breakfast' });
        if (day.lunchIncluded) icons.push({ icon: '☀️', label: 'Lunch' });
        if (day.dinnerIncluded) icons.push({ icon: '🌙', label: 'Dinner' });
        return icons;
    }

    printDocument(): void {
        window.print();
    }

    resend(): void {
        if (this.proposal) {
            this.router.navigate(['/proposal-customize', this.proposal.itineraryId], {
                queryParams: { proposalId: this.proposal.id }
            });
        }
    }

    goBack(): void {
        if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
        } else {
            this.router.navigate(['/proposals']);
        }
    }
}
