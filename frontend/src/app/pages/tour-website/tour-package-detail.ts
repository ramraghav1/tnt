import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { TourNavbar } from './components/tour-navbar';
import { TourFooter } from './components/tour-footer';

interface DayItinerary {
    day: number;
    title: string;
    description: string;
    elevation?: string;
    meals: string;
    accommodation: string;
    activities: string[];
}

interface PackageData {
    slug: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    title: string;
    subtitle: string;
    heroImage: string;
    gallery: string[];
    badge: string;
    duration: string;
    difficulty: string;
    groupSize: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviews: number;
    maxAltitude?: string;
    startPoint: string;
    endPoint: string;
    bestSeason: string;
    overview: string;
    highlights: string[];
    includes: string[];
    excludes: string[];
    itinerary: DayItinerary[];
    faqs: { q: string; a: string }[];
}

@Component({
    selector: 'tour-package-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TourNavbar, TourFooter],
    template: `
        @if (pkg()) {
        <div class="package-detail-page">
            <tour-navbar />

            <!-- Hero -->
            <section class="pd-hero">
                <img [src]="pkg()!.heroImage" [alt]="pkg()!.title" class="pd-hero-img" />
                <div class="pd-hero-overlay">
                    <div class="pd-hero-content">
                        <div class="breadcrumb">
                            <a routerLink="/tour">Home</a>
                            <span>›</span>
                            <a routerLink="/tour">Packages</a>
                            <span>›</span>
                            <span>{{ pkg()!.title }}</span>
                        </div>
                        <div class="pd-badge">{{ pkg()!.badge }}</div>
                        <h1 class="pd-title">{{ pkg()!.title }}</h1>
                        <p class="pd-subtitle">{{ pkg()!.subtitle }}</p>
                        <div class="pd-meta-row">
                            <span class="meta-pill">🕐 {{ pkg()!.duration }}</span>
                            <span class="meta-pill">⛰️ {{ pkg()!.difficulty }}</span>
                            <span class="meta-pill">👥 {{ pkg()!.groupSize }}</span>
                            @if (pkg()!.maxAltitude) {
                                <span class="meta-pill">📐 Max {{ pkg()!.maxAltitude }}</span>
                            }
                            <span class="meta-pill">🌿 Best: {{ pkg()!.bestSeason }}</span>
                        </div>
                        <div class="pd-rating-row">
                            @for (s of [1,2,3,4,5]; track s) {
                                <span [class.filled]="s <= pkg()!.rating" class="star">★</span>
                            }
                            <span class="rating-count">{{ pkg()!.rating }}/5 ({{ pkg()!.reviews }} reviews)</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Main content -->
            <div class="pd-main">
                <div class="pd-container">
                    <div class="pd-layout">

                        <!-- LEFT: Content -->
                        <div class="pd-content">
                            <!-- Tabs -->
                            <div class="pd-tabs">
                                @for (tab of tabs; track tab) {
                                    <button class="pd-tab" [class.active]="activeTab === tab" (click)="activeTab = tab">{{ tab }}</button>
                                }
                            </div>

                            <!-- Overview tab -->
                            @if (activeTab === 'Overview') {
                                <div class="tab-content">
                                    <h2>Trip Overview</h2>
                                    <p class="overview-text">{{ pkg()!.overview }}</p>

                                    <h3>Trip Highlights</h3>
                                    <div class="highlights-grid">
                                        @for (h of pkg()!.highlights; track h) {
                                            <div class="highlight-item">
                                                <span class="h-check">✓</span>
                                                <span>{{ h }}</span>
                                            </div>
                                        }
                                    </div>

                                    <!-- Trip info boxes -->
                                    <div class="trip-info-grid">
                                        <div class="info-box">
                                            <span class="info-icon">🚀</span>
                                            <div><label>Start</label><strong>{{ pkg()!.startPoint }}</strong></div>
                                        </div>
                                        <div class="info-box">
                                            <span class="info-icon">🏁</span>
                                            <div><label>End</label><strong>{{ pkg()!.endPoint }}</strong></div>
                                        </div>
                                        <div class="info-box">
                                            <span class="info-icon">📅</span>
                                            <div><label>Duration</label><strong>{{ pkg()!.duration }}</strong></div>
                                        </div>
                                        <div class="info-box">
                                            <span class="info-icon">🌡️</span>
                                            <div><label>Best Season</label><strong>{{ pkg()!.bestSeason }}</strong></div>
                                        </div>
                                    </div>
                                </div>
                            }

                            <!-- Itinerary tab -->
                            @if (activeTab === 'Itinerary') {
                                <div class="tab-content">
                                    <h2>Day-by-Day Itinerary</h2>
                                    <div class="itinerary-list">
                                        @for (day of pkg()!.itinerary; track day.day) {
                                            <div class="itin-item" [class.open]="openDay === day.day" (click)="toggleDay(day.day)">
                                                <div class="itin-header">
                                                    <div class="day-badge">Day {{ day.day }}</div>
                                                    <h4>{{ day.title }}</h4>
                                                    <div class="itin-meta">
                                                        @if (day.elevation) { <span>⛰️ {{ day.elevation }}</span> }
                                                        <span>🍽️ {{ day.meals }}</span>
                                                    </div>
                                                    <span class="toggle-icon">{{ openDay === day.day ? '▲' : '▼' }}</span>
                                                </div>
                                                @if (openDay === day.day) {
                                                    <div class="itin-body">
                                                        <p>{{ day.description }}</p>
                                                        <div class="day-details">
                                                            <div class="day-detail"><span>🏕️ Stay:</span> {{ day.accommodation }}</div>
                                                            <div class="day-activities">
                                                                @for (act of day.activities; track act) {
                                                                    <span class="activity-tag">{{ act }}</span>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>
                            }

                            <!-- Includes/Excludes tab -->
                            @if (activeTab === 'Includes') {
                                <div class="tab-content">
                                    <div class="inc-exc-grid">
                                        <div>
                                            <h3 class="inc-title">✅ What's Included</h3>
                                            <ul class="inc-list">
                                                @for (item of pkg()!.includes; track item) {
                                                    <li>{{ item }}</li>
                                                }
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 class="exc-title">❌ What's Excluded</h3>
                                            <ul class="exc-list">
                                                @for (item of pkg()!.excludes; track item) {
                                                    <li>{{ item }}</li>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            }

                            <!-- FAQ tab -->
                            @if (activeTab === 'FAQ') {
                                <div class="tab-content">
                                    <h2>Frequently Asked Questions</h2>
                                    <div class="faq-list">
                                        @for (faq of pkg()!.faqs; track faq.q) {
                                            <div class="faq-item" [class.open]="openFaq === faq.q" (click)="openFaq = openFaq === faq.q ? '' : faq.q">
                                                <div class="faq-q">
                                                    <span>{{ faq.q }}</span>
                                                    <span class="faq-icon">{{ openFaq === faq.q ? '−' : '+' }}</span>
                                                </div>
                                                @if (openFaq === faq.q) {
                                                    <div class="faq-a">{{ faq.a }}</div>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>
                            }
                        </div>

                        <!-- RIGHT: Booking Sidebar -->
                        <div class="pd-sidebar">
                            <div class="sidebar-card">
                                <div class="price-section">
                                    <div class="price-row">
                                        <div>
                                            <span class="price-from">from</span>
                                            <div class="price-main">\${{ pkg()!.price | number }}</div>
                                            <span class="price-per">per person</span>
                                        </div>
                                        <div class="price-save">
                                            <span>Save \${{ pkg()!.originalPrice - pkg()!.price }}</span>
                                        </div>
                                    </div>
                                    <div class="original-price">Was \${{ pkg()!.originalPrice | number }}</div>
                                </div>

                                <div class="booking-form">
                                    <div class="bf-field">
                                        <label>📅 Travel Date</label>
                                        <input type="date" [(ngModel)]="bookingDate" />
                                    </div>
                                    <div class="bf-field">
                                        <label>👥 Travelers</label>
                                        <div class="counter">
                                            <button (click)="decreaseTravelers()">−</button>
                                            <span>{{ travelers }}</span>
                                            <button (click)="increaseTravelers()">+</button>
                                        </div>
                                    </div>
                                    <div class="total-price">
                                        Total: <strong>\${{ (pkg()!.price * travelers) | number }}</strong>
                                    </div>
                                    <button class="book-btn" (click)="bookNow()">
                                        🚀 Book This Trip
                                    </button>
                                    <button class="customize-btn" (click)="customize()">
                                        ✏️ Customize this Trip
                                    </button>
                                    <button class="quote-btn" (click)="getQuote()">
                                        💬 Get Free Quote
                                    </button>
                                </div>

                                <div class="sidebar-promises">
                                    <div class="sp-item">✅ Free Cancellation (30 days)</div>
                                    <div class="sp-item">🔒 Secure Payments</div>
                                    <div class="sp-item">⚡ Instant Confirmation</div>
                                    <div class="sp-item">🏆 Best Price Guarantee</div>
                                </div>

                                <div class="expert-card">
                                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80" alt="Travel Expert" class="expert-avatar" />
                                    <div>
                                        <div class="expert-name">Pemba Sherpa</div>
                                        <div class="expert-title">Your Travel Expert</div>
                                    </div>
                                    <a href="tel:+977-9800000000" class="expert-call">Call Now</a>
                                </div>
                            </div>

                            <!-- Share -->
                            <div class="share-section">
                                <h5>Share this trip</h5>
                                <div class="share-btns">
                                    <button class="share-btn fb">Facebook</button>
                                    <button class="share-btn wa">WhatsApp</button>
                                    <button class="share-btn tw">Twitter</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Related Packages -->
            <div class="related-section">
                <div class="pd-container">
                    <h3 class="related-title">You Might Also Like</h3>
                    <div class="related-grid">
                        @for (r of relatedPackages; track r.slug) {
                            <a [routerLink]="['/tour/package', r.slug]" class="related-card">
                                <img [src]="r.image" [alt]="r.title" loading="lazy" />
                                <div class="related-info">
                                    <h4>{{ r.title }}</h4>
                                    <div class="related-meta">
                                        <span>{{ r.duration }}</span>
                                        <span class="related-price">from \${{ r.price }}</span>
                                    </div>
                                </div>
                            </a>
                        }
                    </div>
                </div>
            </div>

            <tour-footer />
        </div>
        }
    `,
    styles: [`
        .package-detail-page {
            background: #0f172a;
            min-height: 100vh;
            font-family: 'Inter', system-ui, sans-serif;
        }
        .pd-hero {
            position: relative;
            height: 70vh;
            min-height: 500px;
        }
        .pd-hero-img {
            width: 100%; height: 100%;
            object-fit: cover;
        }
        .pd-hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(0deg, rgba(12,18,32,0.95) 0%, rgba(12,18,32,0.3) 60%, transparent 100%);
            display: flex;
            align-items: flex-end;
        }
        .pd-hero-content { padding: 3rem 2rem; max-width: 900px; }
        .breadcrumb {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            margin-bottom: 1rem;
            font-size: 0.8rem;
        }
        .breadcrumb a { color: rgba(255,255,255,0.5); text-decoration: none; }
        .breadcrumb a:hover { color: #f97316; }
        .breadcrumb span { color: rgba(255,255,255,0.3); }
        .pd-badge {
            display: inline-block;
            background: linear-gradient(135deg, #f97316, #ea580c);
            color: white;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 0.3rem 0.85rem;
            border-radius: 50px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.75rem;
        }
        .pd-title {
            font-size: clamp(1.8rem, 4vw, 3rem);
            font-weight: 900;
            color: white;
            margin-bottom: 0.5rem;
            line-height: 1.15;
        }
        .pd-subtitle { color: rgba(255,255,255,0.65); font-size: 1rem; margin-bottom: 1rem; }
        .pd-meta-row, .pd-rating-row {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            flex-wrap: wrap;
        }
        .pd-rating-row { margin-top: 0.5rem; }
        .meta-pill {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.15);
            color: rgba(255,255,255,0.85);
            font-size: 0.78rem;
            padding: 0.3rem 0.8rem;
            border-radius: 50px;
        }
        .star { font-size: 1rem; color: rgba(255,255,255,0.2); }
        .star.filled { color: #fbbf24; }
        .rating-count { color: rgba(255,255,255,0.5); font-size: 0.8rem; margin-left: 0.25rem; }

        .pd-main { padding: 3rem 0 5rem; }
        .pd-container { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }
        .pd-layout { display: grid; grid-template-columns: 1fr 380px; gap: 3rem; align-items: start; }
        .pd-tabs { display: flex; gap: 0.25rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0; }
        .pd-tab {
            background: none;
            border: none;
            color: rgba(255,255,255,0.5);
            font-size: 0.9rem;
            font-weight: 600;
            padding: 0.75rem 1.25rem;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
            position: relative;
            bottom: -1px;
        }
        .pd-tab.active { color: #f97316; border-bottom-color: #f97316; }
        .pd-tab:hover { color: white; }
        .tab-content h2 { color: white; font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
        .tab-content h3 { color: white; font-size: 1.1rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
        .overview-text { color: rgba(255,255,255,0.6); line-height: 1.8; font-size: 0.95rem; }
        .highlights-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.6rem;
            margin-bottom: 1.5rem;
        }
        .highlight-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: rgba(255,255,255,0.7);
            font-size: 0.85rem;
        }
        .h-check { color: #22c55e; font-weight: 700; }
        .trip-info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        .info-box {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 14px;
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .info-icon { font-size: 1.5rem; }
        .info-box label { display: block; color: rgba(255,255,255,0.4); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-box strong { color: white; font-size: 0.9rem; }

        /* Itinerary */
        .itinerary-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .itin-item {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 14px;
            overflow: hidden;
            cursor: pointer;
            transition: border-color 0.2s;
        }
        .itin-item.open { border-color: rgba(249,115,22,0.3); }
        .itin-item:hover { border-color: rgba(255,255,255,0.15); }
        .itin-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 1.25rem;
        }
        .day-badge {
            background: linear-gradient(135deg, #f97316, #ea580c);
            color: white;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 0.25rem 0.65rem;
            border-radius: 50px;
            white-space: nowrap;
        }
        .itin-header h4 { color: white; font-size: 0.9rem; font-weight: 700; flex: 1; }
        .itin-meta { display: flex; gap: 0.75rem; }
        .itin-meta span { color: rgba(255,255,255,0.4); font-size: 0.75rem; }
        .toggle-icon { color: rgba(255,255,255,0.4); font-size: 0.75rem; }
        .itin-body {
            padding: 0 1.25rem 1.25rem;
            border-top: 1px solid rgba(255,255,255,0.06);
        }
        .itin-body p { color: rgba(255,255,255,0.6); font-size: 0.875rem; line-height: 1.7; margin: 1rem 0 0.75rem; }
        .day-details { display: flex; flex-direction: column; gap: 0.5rem; }
        .day-detail { color: rgba(255,255,255,0.5); font-size: 0.8rem; display: flex; gap: 0.5rem; }
        .day-activities { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .activity-tag {
            background: rgba(249,115,22,0.1);
            border: 1px solid rgba(249,115,22,0.2);
            color: #fb923c;
            font-size: 0.72rem;
            padding: 0.2rem 0.65rem;
            border-radius: 50px;
        }

        /* Includes/Excludes */
        .inc-exc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .inc-title { color: #22c55e; }
        .exc-title { color: #f87171; }
        .inc-list, .exc-list {
            list-style: none;
            margin: 1rem 0 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
        }
        .inc-list li:before { content: '✓ '; color: #22c55e; font-weight: 700; }
        .exc-list li:before { content: '✗ '; color: #f87171; font-weight: 700; }
        .inc-list li, .exc-list li { color: rgba(255,255,255,0.6); font-size: 0.875rem; }

        /* FAQ */
        .faq-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .faq-item {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
        }
        .faq-q {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.25rem;
            color: white;
            font-size: 0.9rem;
            font-weight: 600;
        }
        .faq-icon { color: #f97316; font-size: 1.2rem; flex-shrink: 0; }
        .faq-a {
            padding: 0 1.25rem 1.25rem;
            color: rgba(255,255,255,0.6);
            font-size: 0.875rem;
            line-height: 1.7;
        }

        /* Sidebar */
        .pd-sidebar { position: sticky; top: 100px; }
        .sidebar-card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(249,115,22,0.2);
            border-radius: 20px;
            overflow: hidden;
        }
        .price-section {
            background: linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05));
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .price-row { display: flex; justify-content: space-between; align-items: center; }
        .price-from { color: rgba(255,255,255,0.5); font-size: 0.75rem; display: block; }
        .price-main { font-size: 2rem; font-weight: 900; color: #f97316; line-height: 1; }
        .price-per { color: rgba(255,255,255,0.5); font-size: 0.75rem; }
        .price-save {
            background: rgba(34,197,94,0.15);
            border: 1px solid rgba(34,197,94,0.3);
            color: #22c55e;
            font-size: 0.78rem;
            font-weight: 700;
            padding: 0.35rem 0.85rem;
            border-radius: 50px;
        }
        .original-price { color: rgba(255,255,255,0.3); font-size: 0.8rem; text-decoration: line-through; margin-top: 0.25rem; }
        .booking-form { padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .bf-field { margin-bottom: 1rem; }
        .bf-field label { display: block; color: rgba(255,255,255,0.5); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem; font-weight: 600; }
        .bf-field input {
            width: 100%;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 0.65rem 1rem;
            color: white;
            font-size: 0.875rem;
            outline: none;
        }
        .bf-field input:focus { border-color: rgba(249,115,22,0.5); }
        .counter {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 0.4rem 1rem;
            width: fit-content;
        }
        .counter button {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0 0.25rem;
            transition: color 0.2s;
        }
        .counter button:hover { color: #f97316; }
        .counter span { color: white; font-weight: 700; min-width: 24px; text-align: center; }
        .total-price {
            color: rgba(255,255,255,0.6);
            font-size: 0.875rem;
            margin-bottom: 1rem;
        }
        .total-price strong { color: #f97316; font-size: 1.1rem; }
        .book-btn, .customize-btn, .quote-btn {
            width: 100%;
            border: none;
            border-radius: 12px;
            padding: 0.85rem;
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 0.6rem;
        }
        .book-btn {
            background: linear-gradient(135deg, #f97316, #ea580c);
            color: white;
            box-shadow: 0 6px 20px rgba(249,115,22,0.4);
        }
        .book-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(249,115,22,0.6); }
        .customize-btn {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.15);
            color: rgba(255,255,255,0.8);
        }
        .customize-btn:hover { border-color: rgba(249,115,22,0.4); color: #f97316; }
        .quote-btn {
            background: transparent;
            border: 1px solid rgba(249,115,22,0.3);
            color: #fb923c;
        }
        .quote-btn:hover { background: rgba(249,115,22,0.08); }
        .sidebar-promises { padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .sp-item { color: rgba(255,255,255,0.55); font-size: 0.78rem; padding: 0.25rem 0; }
        .expert-card {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1.25rem;
        }
        .expert-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(249,115,22,0.3); }
        .expert-name { color: white; font-weight: 700; font-size: 0.875rem; }
        .expert-title { color: rgba(255,255,255,0.4); font-size: 0.72rem; }
        .expert-call {
            margin-left: auto;
            background: rgba(249,115,22,0.1);
            border: 1px solid rgba(249,115,22,0.3);
            color: #f97316;
            padding: 0.4rem 0.85rem;
            border-radius: 50px;
            font-size: 0.78rem;
            font-weight: 600;
            text-decoration: none;
            white-space: nowrap;
            transition: all 0.2s;
        }
        .expert-call:hover { background: rgba(249,115,22,0.2); }
        .share-section { margin-top: 1rem; }
        .share-section h5 { color: rgba(255,255,255,0.5); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.6rem; }
        .share-btns { display: flex; gap: 0.5rem; }
        .share-btn {
            flex: 1;
            border: none;
            border-radius: 8px;
            padding: 0.5rem;
            font-size: 0.75rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
        }
        .share-btn.fb { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.2); color: #60a5fa; }
        .share-btn.wa { background: rgba(37,211,102,0.15); border: 1px solid rgba(37,211,102,0.2); color: #25d366; }
        .share-btn.tw { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.2); color: #818cf8; }

        /* Related */
        .related-section { padding: 4rem 0; background: rgba(0,0,0,0.2); }
        .related-title { color: white; font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem; }
        .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
        .related-card {
            border-radius: 16px;
            overflow: hidden;
            text-decoration: none;
            display: block;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            transition: all 0.3s;
        }
        .related-card:hover { transform: translateY(-4px); border-color: rgba(249,115,22,0.25); }
        .related-card img { width: 100%; height: 140px; object-fit: cover; }
        .related-info { padding: 0.85rem; }
        .related-info h4 { color: white; font-size: 0.875rem; font-weight: 700; margin-bottom: 0.35rem; }
        .related-meta { display: flex; justify-content: space-between; color: rgba(255,255,255,0.4); font-size: 0.78rem; }
        .related-price { color: #f97316; font-weight: 700; }

        @media (max-width: 1024px) { .pd-layout { grid-template-columns: 1fr; } .pd-sidebar { position: static; } }
        @media (max-width: 768px) {
            .highlights-grid, .trip-info-grid, .inc-exc-grid { grid-template-columns: 1fr; }
            .itin-header { flex-wrap: wrap; }
        }
    `]
})
export class TourPackageDetail implements OnInit {
    pkg = signal<PackageData | null>(null);
    activeTab = 'Overview';
    openDay = 1;
    openFaq = '';
    bookingDate = '';
    travelers = 2;
    tabs = ['Overview', 'Itinerary', 'Includes', 'FAQ'];

    relatedPackages = [
        { slug: 'pokhara-tour-package', title: 'Pokhara Tour Package', duration: '4 Days', price: 199, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
        { slug: '5-days-nepal-tour', title: '5 Days Nepal Tour', duration: '5 Days', price: 299, image: 'https://images.unsplash.com/photo-1544735716-ea9ef790244f?w=400&q=80' },
        { slug: 'chitwan-jungle-safari', title: 'Chitwan Safari', duration: '3 Days', price: 249, image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80' }
    ];

    private packages: PackageData[] = [
        {
            slug: 'everest-base-camp-budget-trek',
            seoTitle: 'Everest Base Camp Budget Trek 2026 | Nepal | from $899',
            seoDescription: 'Trek to Everest Base Camp (5364m) on a budget. 14-day guided trek starting from $899 per person. Best price guaranteed, experienced Sherpa guides, acclimatization days included.',
            seoKeywords: 'Everest Base Camp Trek, EBC trek budget, Nepal trekking cheap, Everest trek cost, Khumbu valley trek',
            title: 'Everest Base Camp Budget Trek',
            subtitle: 'Stand at the foot of the world\'s highest peak — the adventure of a lifetime at an unbeatable price',
            heroImage: 'https://images.unsplash.com/photo-1544735716-ea9ef790244f?w=1920&q=80',
            gallery: [],
            badge: 'Best Value',
            duration: '14 Days / 13 Nights',
            difficulty: 'Strenuous',
            groupSize: '4–12 People',
            price: 899,
            originalPrice: 1299,
            rating: 5,
            reviews: 189,
            maxAltitude: '5,364m',
            startPoint: 'Kathmandu, Nepal',
            endPoint: 'Kathmandu, Nepal',
            bestSeason: 'Mar–May, Sep–Nov',
            overview: 'The Everest Base Camp Trek is the ultimate Himalayan adventure — traversing Sherpa villages, ancient monasteries, and breathtaking glacial landscapes before reaching the legendary base camp at 5,364 meters. This budget-friendly 14-day journey takes you through the heart of the Khumbu valley, with ample acclimatization days to ensure your safety and enjoyment. You\'ll stay in comfortable teahouses, guided by experienced Sherpa guides who know every inch of these trails.',
            highlights: [
                'Reach Everest Base Camp at 5,364m', 'Summit Kala Patthar (5,545m) for the ultimate Everest panorama',
                'Explore Namche Bazaar — the Sherpa capital', 'Visit Tengboche Monastery with Everest backdrop',
                'Cross the famous Hillary Suspension Bridge', 'Acclimatization at Namche & Dingboche',
                'Panoramic Himalayan views all the way', 'Interact with Sherpa culture and communities'
            ],
            includes: [
                'Airport transfers (arrival & departure)', 'Kathmandu hotel (2 nights, twin sharing)',
                'Lukla flight (round trip)', 'All teahouse accommodation on trek',
                'Three meals per day throughout trek', 'Experienced English-speaking trekking guide',
                'Porter (1 porter per 2 trekkers)', 'Sagarmatha National Park entry permit',
                'TIMS (Trekkers\' Information Management System) card', 'All government taxes and service charges',
                'Emergency evacuation insurance', 'Welcome dinner in Kathmandu'
            ],
            excludes: [
                'International airfare', 'Nepal visa fee ($50 USD on arrival)',
                'Personal travel insurance (mandatory)', 'Tips for guides and porters',
                'Personal trekking gear (available to rent)', 'Hot shower, charging, and WiFi on trail (payable locally)',
                'Bar bills and personal expenses', 'Meals in Kathmandu (except welcome dinner)'
            ],
            itinerary: [
                { day: 1, title: 'Arrive Kathmandu — Welcome Dinner', description: 'Arrive at Tribhuvan International Airport in Kathmandu. Our representative will transfer you to your hotel. Evening briefing and welcome dinner at a traditional Nepali restaurant.', elevation: '1,400m', meals: 'Dinner', accommodation: '3-star Hotel Kathmandu', activities: ['Airport pickup', 'Equipment check', 'Trip briefing', 'Welcome dinner'] },
                { day: 2, title: 'Fly Kathmandu to Lukla — Trek to Phakding', description: 'Early flight to Lukla (2,840m) — one of the world\'s most exciting mountain airstrips. Begin trek through pine forests and mani walls, descending to the Dudh Koshi valley.', elevation: '2,610m', meals: 'Breakfast, Lunch, Dinner', accommodation: 'Himalaya Lodge, Phakding', activities: ['Lukla flight', 'Trek to Phakding 3–4 hrs', 'Visit mani walls'] },
                { day: 3, title: 'Phakding to Namche Bazaar', description: 'Cross the famous Hillary Suspension Bridge (3,450m) multiple times along the Dudh Koshi river. Steep ascent to Namche Bazaar — first sighting of Everest if skies are clear.', elevation: '3,440m', meals: 'All meals', accommodation: 'Mountain Lodge, Namche', activities: ['Hillary Bridge crossing', '5–6 hr trek', 'Everest first view', 'Namche exploration'] },
                { day: 4, title: 'Acclimatization Day — Namche Bazaar', description: 'A crucial acclimatization day. Hike up to the Everest View Hotel (3,880m) for panoramic views of Everest, Lhotse, Ama Dablam. Explore the local Sherpa museum and market.', elevation: '3,440–3,880m', meals: 'All meals', accommodation: 'Mountain Lodge, Namche', activities: ['Acclimatization hike', 'Everest View Hotel', 'Sherpa Museum', 'Local market'] },
                { day: 5, title: 'Namche to Tengboche', description: 'Trek through rhododendron forests with stunning views of Ama Dablam (6,812m). Visit the famous Tengboche Monastery, the largest in the Khumbu region, with a backdrop of Everest.', elevation: '3,860m', meals: 'All meals', accommodation: 'Himalayan Hotel, Tengboche', activities: ['5 hr trek', 'Tengboche Monastery', 'Ama Dablam view', 'Khumbu glacier view'] },
                { day: 6, title: 'Tengboche to Dingboche', description: 'Descend to Pangboche, home to the oldest monastery in Khumbu, then climb through pastures to Dingboche. Panoramic views of Lhotse and Island Peak.', elevation: '4,360m', meals: 'All meals', accommodation: 'Mountain Lodges, Dingboche', activities: ['5 hr trek', 'Pangboche Monastery', 'Island Peak views'] },
                { day: 7, title: 'Acclimatization — Dingboche', description: 'Second acclimatization day. Optional hike up Nagarjun Hill (5,100m) for views of Makalu, Lhotse, and Ama Dablam faces. Rest and acclimatize for higher altitude.', elevation: '4,360–5,100m', meals: 'All meals', accommodation: 'Mountain Lodges, Dingboche', activities: ['Optional Nagarjun hike', 'Rest day', 'Makalu views'] },
                { day: 8, title: 'Dingboche to Lobuche', description: 'Hike through the Khumbu glacier moraine. Pass the moving Everest memorial stones at Thukla Pass — a tribute to climbers lost on Everest. Lobuche sits in the shadow of the Khumbu glacier.', elevation: '4,940m', meals: 'All meals', accommodation: 'Lobuche Teahouse', activities: ['4 hr trek', 'Thukla Pass memorial', 'Khumbu glacier walk'] },
                { day: 9, title: 'Lobuche to Gorak Shep — EBC!', description: 'The big day! Trek to Gorak Shep, drop bags at the lodge, and continue to EVEREST BASE CAMP at 5,364 meters. Touch the famous EBC sign and be surrounded by the Khumbu Icefall. Return to Gorak Shep.', elevation: '5,364m', meals: 'All meals', accommodation: 'Everest Inn, Gorak Shep', activities: ['EVEREST BASE CAMP', 'Khumbu Icefall view', 'EBC photo', 'Glacier exploration'] },
                { day: 10, title: 'Sunrise Kala Patthar — Descend to Pheriche', description: 'Wake at 4am for the breathtaking sunrise from Kala Patthar (5,545m) — the best view of Everest available without climbing it. Descend to Pheriche for well-deserved rest.', elevation: '5,545m–4,280m', meals: 'All meals', accommodation: 'Himalayan Hotel, Pheriche', activities: ['Kala Patthar sunrise', 'Best Everest panorama', 'Descend 1,200m'] },
                { day: 11, title: 'Pheriche to Namche Bazaar', description: 'Long but beautiful descent through familiar terrain. Your legs will enjoy going down! Stop for lunch at Tengboche and continue to Namche.', elevation: '3,440m', meals: 'All meals', accommodation: 'Mountain Lodge, Namche', activities: ['7 hr descent', 'Tengboche lunch stop'] },
                { day: 12, title: 'Namche to Lukla', description: 'Final day of trekking — a moderate descent through Phakding back to Lukla. Celebrate your achievement with guides and porters at the Lukla bakeries!', elevation: '2,840m', meals: 'All meals', accommodation: 'Nirvana Lodge, Lukla', activities: ['6 hr descent', 'Celebration dinner', 'Lukla town exploration'] },
                { day: 13, title: 'Fly Lukla to Kathmandu', description: 'Early morning flight back to Kathmandu. Rest of the day free for shopping, exploring Thamel, or visiting Pashupatinath. Farewell dinner in Kathmandu.', elevation: '1,400m', meals: 'Breakfast, Farewell Dinner', accommodation: '3-star Hotel Kathmandu', activities: ['Lukla flight', 'Thamel shopping', 'Farewell dinner'] },
                { day: 14, title: 'Departure Day', description: 'Transfer to Tribhuvan International Airport for your flight home, carrying memories of the world\'s most iconic trek. Safe travels!', elevation: '1,400m', meals: 'Breakfast', accommodation: '', activities: ['Airport transfer', 'Departure'] }
            ],
            faqs: [
                { q: 'Do I need mountaineering experience for Everest Base Camp Trek?', a: 'No mountaineering experience is required. EBC is a trekking route, not a climbing expedition. However, you should have good physical fitness and ability to walk 5–7 hours daily for multiple consecutive days.' },
                { q: 'What is altitude sickness?', a: 'Altitude sickness (AMS) can affect anyone above 2,500m. Symptoms include headache, nausea, and fatigue. Our itinerary includes acclimatization days, and our guides carry emergency oxygen and are trained in altitude sickness management.' },
                { q: 'What is included in the budget price?', a: 'Our $899 budget package includes all accommodation in teahouses along the route, three meals per day, an experienced guide, one porter per two trekkers, and all permits. International flights and personal insurance are not included.' },
                { q: 'What is the best time for Everest Base Camp Trek?', a: 'Spring (March–May) and Autumn (September–November) are the best seasons. Spring offers rhododendron blooms; Autumn offers the clearest mountain views. December–February is possible but cold.' },
                { q: 'Can I get WiFi and charge devices on the trek?', a: 'WiFi is available in most teahouses at a cost (typically $1–3 per session). Charging is available at most teahouses (additional cost). We recommend power banks for higher altitudes where services may be unreliable.' },
                { q: 'Is travel insurance mandatory?', a: 'Yes, travel insurance covering emergency helicopter evacuation up to 6,000m is mandatory. Please ensure your policy covers high-altitude trekking. We can recommend providers if needed.' }
            ]
        },
        {
            slug: 'pokhara-tour-package',
            seoTitle: 'Pokhara Tour Package 2026 | Lake City Nepal | from $199',
            seoDescription: 'Explore Pokhara — Nepal\'s most beautiful city with Phewa Lake, Sarangkot sunrise, paragliding, and Annapurna views. 4-day package from $199. Book now!',
            seoKeywords: 'Pokhara tour, Pokhara package, Nepal tour Pokhara, Phewa Lake, Annapurna view, Pokhara paragliding',
            title: 'Pokhara Tour Package',
            subtitle: 'Nepal\'s most beautiful city — Himalayan reflections, lakeside serenity, and endless adventure',
            heroImage: 'https://images.pexels.com/photos/14989389/pexels-photo-14989389.jpeg',
            gallery: [],
            badge: 'Most Popular',
            duration: '4 Days / 3 Nights',
            difficulty: 'Easy',
            groupSize: '2–20 People',
            price: 199,
            originalPrice: 279,
            rating: 5,
            reviews: 312,
            startPoint: 'Pokhara Airport',
            endPoint: 'Pokhara Airport',
            bestSeason: 'Oct–Apr',
            overview: 'Pokhara is Nepal\'s second-largest city and its adventure capital, nestled beside the serene Phewa Lake with the Annapurna and Machhapuchhre (Fishtail) peaks dramatically reflected in its waters. This 4-day package gives you the perfect taste of the city — sunrise from Sarangkot, peaceful lake boating, mystical caves, roaring waterfalls, and optional adrenaline activities like paragliding over the valley.',
            highlights: [
                'Sunrise from Sarangkot with Annapurna panorama', 'Peaceful boating on Phewa Lake',
                'Visit Davis Falls and Gupteshwor Cave', 'Bindhyabasini Temple blessing',
                'World Peace Stupa hike and lake view', 'Optional paragliding over Pokhara valley',
                'Mahendra Cave exploration', 'Tibetan refugee camp visit'
            ],
            includes: [
                '3 nights hotel accommodation (twin sharing)', 'Daily breakfast',
                'Private vehicle for all sightseeing', 'Experienced local guide',
                'Phewa Lake boating (private boat)', 'Entry fees to all sites on itinerary',
                'Airport transfers', 'All government taxes'
            ],
            excludes: [
                'Airfare to/from Pokhara', 'Paragliding ($80–100 per person)',
                'Meals other than breakfast', 'Personal expenses',
                'Tips for driver and guide', 'Travel insurance'
            ],
            itinerary: [
                { day: 1, title: 'Arrive Pokhara — Lakeside Exploration', description: 'Arrive at Pokhara airport and transfer to your hotel in the Lakeside district. Afternoon leisurely walk along the Lakeside Promenade with stunning Fishtail Mountain views. Sunset boat ride on Phewa Lake.', elevation: '822m', meals: 'Dinner', accommodation: 'Hotel Pokhara Grande', activities: ['Airport transfer', 'Phewa Lake sunset', 'Lakeside walk', 'Local dinner'] },
                { day: 2, title: 'Sarangkot Sunrise — Davis Falls — Cave', description: 'Wake at 4:30am for the magical Sarangkot sunrise over the Annapurna range — one of Nepal\'s most spectacular views. After breakfast, visit Davis Falls, Gupteshwor Cave, Tibetan Refugee Camp, and Mahendra Cave.', elevation: '822–1,592m', meals: 'Breakfast, Lunch', accommodation: 'Hotel Pokhara Grande', activities: ['Sarangkot sunrise hike', 'Davis Falls', 'Gupteshwor Cave', 'Tibetan Camp', 'Mahendra Cave'] },
                { day: 3, title: 'Phewa Lake — Peace Stupa — Bindhyabasini', description: 'Morning boat ride to World Peace Stupa island — a beautiful pagoda with 360° lake and mountain views. Afternoon visit to Bindhyabasini Temple and the old Pokhara Bazaar. Optional: Paragliding from Sarangkot!', elevation: '822–1,100m', meals: 'Breakfast', accommodation: 'Hotel Pokhara Grande', activities: ['Peace Stupa visit', 'Temple blessing', 'Old Bazaar', 'Optional paragliding'] },
                { day: 4, title: 'Sunrise Photo Walk — Departure', description: 'Final morning for a sunrise walk and photography along Phewa Lake before checking out. Transfer to the airport or continue to Kathmandu/trekking destination.', elevation: '822m', meals: 'Breakfast', accommodation: '', activities: ['Farewell lake walk', 'Airport transfer'] }
            ],
            faqs: [
                { q: 'Can I do paragliding in Pokhara?', a: 'Absolutely! Pokhara is one of the world\'s top paragliding destinations. Flights over the Phewa Lake and Pokhara valley are available year-round (weather permitting) for $80–100 USD. We can arrange this as an add-on.' },
                { q: 'How do I get to Pokhara from Kathmandu?', a: 'You can fly (25 min, ~$90 one-way) or take a tourist bus (6–7 hrs, $15–25) or private car (5–6 hrs). We recommend flying for comfort. We can arrange your Kathmandu–Pokhara transport.' },
                { q: 'What is the best time to visit Pokhara?', a: 'October–April offers the clearest mountain views. October–November and March–April are peak tourist season with perfect weather. December–February is clear but cold. Monsoon (June–August) brings green landscapes but rain.' }
            ]
        },
        {
            slug: '5-days-nepal-tour',
            seoTitle: '5 Days Nepal Tour 2026 | Kathmandu Cultural Package | from $299',
            seoDescription: 'Explore the best of Kathmandu in 5 days. UNESCO World Heritage Sites, Pashupatinath temple, Swayambhunath, Bhaktapur, and the Nagarkot sunrise. from $299 per person.',
            seoKeywords: '5 days Nepal tour, Kathmandu tour package, Nepal cultural tour, Bhaktapur, Nagarkot, Pashupatinath',
            title: '5 Days Nepal Tour',
            subtitle: 'An immersive cultural journey through the ancient temples, durbar squares, and mountain sunrises of Nepal',
            heroImage: 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=1920&q=80',
            gallery: [],
            badge: 'Best Seller',
            duration: '5 Days / 4 Nights',
            difficulty: 'Easy',
            groupSize: '2–15 People',
            price: 299,
            originalPrice: 399,
            rating: 5,
            reviews: 248,
            startPoint: 'Kathmandu Airport',
            endPoint: 'Kathmandu Airport',
            bestSeason: 'Year Round',
            overview: 'This classic 5-day Nepal tour takes you through the heart of Kathmandu Valley — a UNESCO World Heritage landscape filled with ancient temples, medieval palace squares, and beautiful mountain vistas. You\'ll experience the living Hindu tradition at Pashupatinath, Buddhist tranquility at Boudhanath, medieval architecture in Bhaktapur, and culminate with the magical sunrise over the Himalayas from Nagarkot hill station.',
            highlights: [
                'Pashupatinath Temple & Hindu rituals', 'Boudhanath Stupa — the world\'s largest',
                'Swayambhunath (Monkey Temple) panorama', 'Bhaktapur Durbar Square (medieval city)',
                'Patan Museum of Art', 'Nagarkot sunrise over 8 Himalayan peaks',
                'Chandragiri Hills cable car', 'Local Newari food experience'
            ],
            includes: [
                '4 nights hotel (3-star, twin sharing)', 'Daily breakfast + 1 farewell dinner',
                'All sightseeing by private vehicle', 'Experienced English-speaking guide',
                'All UNESCO site entry fees', 'Airport transfers', 'Nagarkot overnight stay',
                'Cable car ticket (Chandragiri)', 'All taxes and service charges'
            ],
            excludes: [
                'International airfare', 'Nepal visa ($50 on arrival)',
                'Lunches and dinners (except farewell)', 'Personal expenses',
                'Tips', 'Travel insurance', 'Drinks and beverages'
            ],
            itinerary: [
                { day: 1, title: 'Arrive Kathmandu — Swayambhunath', description: 'Arrive at TIA Kathmandu. Transfer to hotel. Afternoon visit to Swayambhunath Stupa (Monkey Temple) perched on a hillock with panoramic view of Kathmandu valley. Evening at leisure in Thamel.', elevation: '1,400m', meals: 'Dinner', accommodation: 'Hotel Yak & Yeti, Kathmandu', activities: ['Airport pickup', 'Swayambhunath Stupa', 'Thamel exploration'] },
                { day: 2, title: 'Pashupatinath — Boudhanath — Patan', description: 'Morning at Pashupatinath temple — Nepal\'s holiest Hindu shrine on the Bagmati River. Witness Aarti ceremony and cremation ghats. Then Boudhanath Stupa — the world\'s largest Buddhist stupa. Afternoon in medieval Patan.', elevation: '1,400m', meals: 'Breakfast', accommodation: 'Hotel Yak & Yeti', activities: ['Pashupatinath Temple', 'Boudhanath Stupa', 'Patan Durbar Square', 'Patan Museum'] },
                { day: 3, title: 'Bhaktapur — Changu Narayan — Nagarkot', description: 'Explore Bhaktapur — Nepal\'s best-preserved medieval city with its 55-Window Palace and pottery square. Drive to Changu Narayan, Nepal\'s oldest Vishnu temple (UNESCO). Arrive Nagarkot for sunset.', elevation: '2,175m', meals: 'Breakfast, Dinner', accommodation: 'Club Himalaya, Nagarkot', activities: ['Bhaktapur Durbar Square', 'Pottery Square', 'Changu Narayan', 'Nagarkot sunset'] },
                { day: 4, title: 'Nagarkot Sunrise — Kathmandu Valley', description: 'Wake before dawn for a magnificent sunrise over 8 peaks including Everest, Lhotse, Langtang, and Annapurna ranges. Return to Kathmandu via Dhulikhel. Afternoon Chandragiri cable car for valley views.', elevation: '2,175m–1,400m', meals: 'Breakfast, Dinner', accommodation: 'Hotel Yak & Yeti', activities: ['Himalayan sunrise', 'Dhulikhel views', 'Chandragiri cable car'] },
                { day: 5, title: 'Last Morning — Departure', description: 'Final breakfast at hotel. Optional morning visit to Kathmandu\'s bustling Asan Market. Transfer to airport. Farewell and safe travels!', elevation: '1,400m', meals: 'Breakfast', accommodation: '', activities: ['Asan Market', 'Airport transfer', 'Departure'] }
            ],
            faqs: [
                { q: 'Is Nepal visa on arrival available?', a: 'Yes, Nepal visa is available on arrival at Tribhuvan International Airport in Kathmandu. Tourist visa costs $50 USD for 30 days. Bring 2 passport-size photos and the visa application form (available at airport).' },
                { q: 'What should I wear to temples in Nepal?', a: 'Modest clothing covering shoulders and knees is required to enter most temples. Women should ideally carry a scarf. Some temples (like Pashupatinath) restrict entry to non-Hindus in certain inner sanctuaries.' },
                { q: 'Is this tour suitable for families with children?', a: 'Yes! This cultural tour is very family-friendly. The activities are not strenuous and the temples are fascinating for people of all ages. Children particularly love the Monkey Temple and Changu Narayan.' }
            ]
        }
    ];

    // Default fallback for unknown slugs
    private defaultPackage: PackageData = this.packages[0];

    constructor(
        private route: ActivatedRoute,
        private titleService: Title,
        private meta: Meta
    ) {}

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const slug = params.get('slug') || '';
            const found = this.packages.find(p => p.slug === slug) || { ...this.defaultPackage, slug };
            this.pkg.set(found);
            this.titleService.setTitle(found.seoTitle);
            this.meta.updateTag({ name: 'description', content: found.seoDescription });
            this.meta.updateTag({ name: 'keywords', content: found.seoKeywords });
            this.meta.updateTag({ property: 'og:title', content: found.seoTitle });
            this.meta.updateTag({ property: 'og:description', content: found.seoDescription });
            this.meta.updateTag({ property: 'og:image', content: found.heroImage });
        });
    }

    toggleDay(day: number) {
        this.openDay = this.openDay === day ? -1 : day;
    }

    decreaseTravelers() { if (this.travelers > 1) { this.travelers--; } }
    increaseTravelers() { this.travelers++; }
    bookNow() { alert('Booking system coming soon! Please use "Get Free Quote" or call us.'); }
    customize() { document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' }); }
    getQuote() { document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' }); }
}
