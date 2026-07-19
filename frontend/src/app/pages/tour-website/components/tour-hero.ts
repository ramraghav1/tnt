import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'tour-hero',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <section class="hero-section">
            <!-- Animated Background Slideshow -->
            <div class="hero-bg-slider">
                @for (slide of slides; track $index) {
                    <div class="hero-slide" [class.active]="currentSlide() === $index" [style.backgroundImage]="'url(' + slide.bg + ')'"></div>
                }
                <div class="hero-overlay"></div>
            </div>

            <!-- Floating Particles -->
            <div class="particles">
                @for (p of particles; track $index) {
                    <div class="particle" [ngStyle]="p"></div>
                }
            </div>

            <!-- Hero Content -->
            <div class="hero-content">
                <div class="hero-badge">
                    <span class="pulse-dot"></span>
                    <span>✈️ Trusted by 10,000+ Travelers</span>
                </div>

                <h1 class="hero-title">
                    <span class="line1">Discover the World's</span>
                    <span class="line2 gradient-text">Most Beautiful</span>
                    <span class="line3">Destinations</span>
                </h1>

                <p class="hero-subtitle">
                    {{ slides[currentSlide()].tagline }}
                </p>

                <!-- Search / Quick Booking Widget -->
                <div class="search-widget">
                    <div class="search-field">
                        <span class="field-icon">📍</span>
                        <div>
                            <label>Destination</label>
                            <input type="text" placeholder="Where do you want to go?" />
                        </div>
                    </div>
                    <div class="search-divider"></div>
                    <div class="search-field">
                        <span class="field-icon">📅</span>
                        <div>
                            <label>Travel Date</label>
                            <input type="date" />
                        </div>
                    </div>
                    <div class="search-divider"></div>
                    <div class="search-field">
                        <span class="field-icon">👥</span>
                        <div>
                            <label>Travelers</label>
                            <input type="number" placeholder="2 Adults" min="1" />
                        </div>
                    </div>
                    <button class="search-btn">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        Search
                    </button>
                </div>

                <!-- Quick Links -->
                <div class="quick-links">
                    <span class="quick-label">Popular:</span>
                    <a routerLink="/tour/package/everest-base-camp-budget-trek">Everest Trek</a>
                    <a routerLink="/tour/package/pokhara-tour-package">Pokhara</a>
                    <a routerLink="/tour/package/5-days-nepal-tour">Nepal Tour</a>
                    <a routerLink="/tour/package/annapurna-circuit-trek">Annapurna</a>
                </div>
            </div>

            <!-- Slide Indicators -->
            <div class="slide-dots">
                @for (slide of slides; track $index) {
                    <button class="dot" [class.active]="currentSlide() === $index" (click)="goToSlide($index)"></button>
                }
            </div>

            <!-- Scroll Indicator -->
            <div class="scroll-indicator">
                <div class="scroll-mouse"><div class="scroll-wheel"></div></div>
                <span>Scroll to explore</span>
            </div>
        </section>
    `,
    styles: [`
        .hero-section {
            position: relative;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .hero-bg-slider {
            position: absolute;
            inset: 0;
        }
        .hero-slide {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            opacity: 0;
            transform: scale(1.08);
            transition: opacity 1.2s ease, transform 6s ease;
        }
        .hero-slide.active {
            opacity: 1;
            transform: scale(1);
        }
        .hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to bottom,
                rgba(12,18,32,0.55) 0%,
                rgba(12,18,32,0.3) 40%,
                rgba(12,18,32,0.7) 100%
            );
        }
        .particles { display: none; }
        .particle { display: none; }
        @keyframes float-particle { from {} to {} }
        .hero-content {
            position: relative;
            z-index: 10;
            max-width: 900px;
            margin: 0 auto;
            padding: 8rem 2rem 4rem;
            text-align: center;
        }
        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(201,168,76,0.15);
            border: 1px solid rgba(201,168,76,0.4);
            color: #d4b55e;
            padding: 0.4rem 1rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            backdrop-filter: blur(10px);
        }
        .pulse-dot {
            width: 8px; height: 8px;
            background: #22c55e;
            border-radius: 50%;
            animation: pulse 2s infinite;
            display: inline-block;
        }
        @keyframes pulse {
            0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
            50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        .hero-title {
            font-size: clamp(2.5rem, 7vw, 5.5rem);
            font-weight: 900;
            line-height: 1.05;
            margin-bottom: 1.25rem;
            color: white;
        }
        .hero-title span { display: block; }
        .gradient-text {
            background: linear-gradient(90deg, #c9a84c, #d4b55e, #e8c97a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .hero-subtitle {
            font-size: 1.1rem;
            color: rgba(255,255,255,0.8);
            margin-bottom: 2.5rem;
            min-height: 1.6em;
            transition: opacity 0.5s;
        }
        .search-widget {
            display: flex;
            align-items: center;
            background: rgba(255,255,255,0.98);
            border-radius: 20px;
            padding: 0.5rem;
            box-shadow: 0 16px 40px rgba(0,0,0,0.35);
            gap: 0;
            margin-bottom: 1.5rem;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        .search-field {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
        }
        .field-icon { font-size: 1.2rem; flex-shrink: 0; }
        .search-field label {
            display: block;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 2px;
        }
        .search-field input {
            border: none;
            outline: none;
            font-size: 0.9rem;
            color: #0c1220;
            background: transparent;
            width: 100%;
            font-weight: 500;
        }
        .search-field input::placeholder { color: #94a3b8; }
        .search-divider {
            width: 1px; height: 40px;
            background: #e2e8f0;
            flex-shrink: 0;
        }
        .search-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: #c9a84c;
            color: #0c1220;
            border: none;
            border-radius: 12px;
            padding: 0.9rem 1.75rem;
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .search-btn:hover {
            background: #b8963e;
            transform: translateY(-1px);
        }
        .quick-links {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        .quick-label {
            color: rgba(255,255,255,0.6);
            font-size: 0.8rem;
            font-weight: 500;
        }
        .quick-links a {
            color: rgba(255,255,255,0.85);
            text-decoration: none;
            font-size: 0.8rem;
            padding: 0.3rem 0.85rem;
            border: 1px solid rgba(255,255,255,0.25);
            border-radius: 50px;
            transition: all 0.2s;
        }
        .quick-links a:hover {
            background: rgba(201,168,76,0.2);
            border-color: #c9a84c;
            color: #d4b55e;
        }
        .slide-dots {
            position: absolute;
            bottom: 5rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 0.5rem;
            z-index: 10;
        }
        .dot {
            width: 8px; height: 8px;
            border-radius: 50%;
            background: rgba(255,255,255,0.4);
            border: none;
            cursor: pointer;
            transition: all 0.3s;
        }
        .dot.active {
            background: #c9a84c;
            width: 24px;
            border-radius: 4px;
        }
        .scroll-indicator {
            position: absolute;
            bottom: 1.5rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.4rem;
            z-index: 10;
            color: rgba(255,255,255,0.5);
            font-size: 0.7rem;
        }
        .scroll-mouse {
            width: 24px; height: 38px;
            border: 2px solid rgba(255,255,255,0.4);
            border-radius: 12px;
            display: flex;
            justify-content: center;
            padding-top: 6px;
        }
        .scroll-wheel {
            width: 4px; height: 8px;
            background: rgba(255,255,255,0.6);
            border-radius: 2px;
            animation: scroll-anim 2s infinite;
        }
        @keyframes scroll-anim {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(12px); opacity: 0; }
        }
        @media (max-width: 768px) {
            .search-widget { flex-direction: column; gap: 0.25rem; }
            .search-divider { width: 100%; height: 1px; }
            .search-field { width: 100%; }
        }
    `]
})
export class TourHero implements OnInit, OnDestroy {
    currentSlide = signal(0);
    private interval: any;

    slides = [
        {
            bg: 'https://images.unsplash.com/photo-1544735716-ea9ef790244f?w=1920&q=80',
            tagline: 'Trek to the roof of the world — Everest Base Camp awaits'
        },
        {
                bg: 'https://images.pexels.com/photos/14989389/pexels-photo-14989389.jpeg',
            tagline: 'Sail on the serene Phewa Lake in the city of Pokhara'
        },
        {
            bg: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80',
            tagline: 'Experience vibrant cultures and timeless traditions'
        },
        {
            bg: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80',
            tagline: 'Immerse in breathtaking Himalayan landscapes'
        }
    ];

    particles = Array.from({ length: 15 }, (_, i) => ({
        width: (Math.random() * 8 + 4) + 'px',
        height: (Math.random() * 8 + 4) + 'px',
        left: (Math.random() * 100) + '%',
        animationDuration: (Math.random() * 15 + 10) + 's',
        animationDelay: (Math.random() * 10) + 's',
        opacity: Math.random() * 0.6 + 0.2
    }));

    ngOnInit() {
        this.interval = setInterval(() => {
            this.currentSlide.update(v => (v + 1) % this.slides.length);
        }, 5000);
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    goToSlide(index: number) {
        this.currentSlide.set(index);
    }
}
