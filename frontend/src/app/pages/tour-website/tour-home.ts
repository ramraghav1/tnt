import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TourNavbar } from './components/tour-navbar';
import { TourHero } from './components/tour-hero';
import { TourStats } from './components/tour-stats';
import { TourPackages } from './components/tour-packages';
import { TourDestinations } from './components/tour-destinations';
import { TourWhyUs } from './components/tour-why-us';
import { TourTestimonials } from './components/tour-testimonials';
import { TourGallery } from './components/tour-gallery';
import { TourCta } from './components/tour-cta';
import { TourFooter } from './components/tour-footer';

@Component({
    selector: 'tour-home',
    standalone: true,
    imports: [
        CommonModule, RouterModule,
        TourNavbar, TourHero, TourStats, TourPackages,
        TourDestinations, TourWhyUs, TourTestimonials,
        TourGallery, TourCta, TourFooter
    ],
    template: `
        <div class="tour-website">
            <tour-navbar />
            <tour-hero />
            <tour-stats />
            <tour-packages />
            <tour-destinations />
            <tour-why-us />
            <tour-testimonials />
            <tour-gallery />
            <tour-cta />
            <tour-footer />

            <!-- Floating sticky CTA (mobile) -->
            <div class="sticky-cta">
                <a href="#quote" class="sticky-btn">
                    <span>💬 Get Free Quote</span>
                </a>
                <a href="https://wa.me/9779800000000" target="_blank" class="sticky-btn whatsapp">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01a1.093 1.093 0 0 0-.79.372C7 8.002 6 9.26 6 11.67c0 2.41 1.762 4.74 2.008 5.068.247.327 3.465 5.29 8.4 7.42 1.174.507 2.09.81 2.804 1.036 1.178.375 2.25.322 3.097.195.944-.14 2.908-1.19 3.32-2.337.41-1.147.41-2.13.287-2.337-.121-.207-.447-.33-.744-.479z"/></svg>
                    <span>WhatsApp</span>
                </a>
            </div>
        </div>
    `,
    styles: [`
        .tour-website {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            background: #0c1220;
            min-height: 100vh;
        }
        .sticky-cta {
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            z-index: 999;
        }
        .sticky-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: #c9a84c;
            color: #0c1220;
            padding: 0.75rem 1.25rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
        }
        .sticky-btn.whatsapp {
            background: #25d366;
            color: white;
        }
        .sticky-btn:hover { opacity: 0.9; }
        @media (min-width: 769px) { .sticky-cta { display: none; } }
    `]
})
export class TourHome {}
