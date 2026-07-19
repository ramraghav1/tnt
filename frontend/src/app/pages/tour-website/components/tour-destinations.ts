import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'tour-destinations',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <section class="destinations-section" id="destinations">
            <div class="section-container">
                <div class="section-header">
                    <span class="section-tag">🌏 Explore by Region</span>
                    <h2 class="section-title">Top <span>Destinations</span></h2>
                    <p class="section-desc">From the Himalayan peaks to lush jungles and ancient cities — Nepal has it all</p>
                </div>

                <div class="destinations-grid">
                    <!-- Large featured destination -->
                    <div class="dest-card large" routerLink="/tour/package/everest-base-camp-budget-trek">
                        <img src="https://images.unsplash.com/photo-1544735716-ea9ef790244f?w=900&q=80" alt="Everest Region" loading="lazy" />
                        <div class="dest-overlay">
                            <div class="dest-content">
                                <span class="dest-region">Himalaya</span>
                                <h3>Everest Region</h3>
                                <p>24 tour packages</p>
                                <span class="explore-link">Explore →</span>
                            </div>
                        </div>
                    </div>
                    <!-- Other destinations -->
                    @for (dest of otherDestinations; track dest.name) {
                        <div class="dest-card" [routerLink]="dest.link">
                            <img [src]="dest.image" [alt]="dest.name" loading="lazy" />
                            <div class="dest-overlay">
                                <div class="dest-content">
                                    <span class="dest-region">{{ dest.region }}</span>
                                    <h3>{{ dest.name }}</h3>
                                    <p>{{ dest.packages }} tour packages</p>
                                    <span class="explore-link">Explore →</span>
                                </div>
                            </div>
                        </div>
                    }
                </div>

                <!-- Map / AR Feature teaser -->
                <div class="ar-teaser">
                    <div class="ar-teaser-content">
                        <div class="ar-icon">🗺️</div>
                        <div>
                            <h4>Interactive Destination Map</h4>
                            <p>Explore all our destinations on an interactive 3D map — coming soon!</p>
                        </div>
                        <button class="ar-btn">View Map Preview</button>
                    </div>
                </div>
            </div>
        </section>
    `,
    styles: [`
        .destinations-section {
            padding: 6rem 0;
            background: #111827;
        }
        .section-container { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }
        .section-header { text-align: center; margin-bottom: 3rem; }
        .section-tag {
            display: inline-block;
            background: rgba(201,168,76,0.15);
            border: 1px solid rgba(201,168,76,0.3);
            color: #d4b55e;
            padding: 0.35rem 1rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        .section-title {
            font-size: clamp(2rem, 4.5vw, 3rem);
            font-weight: 900;
            color: white;
            margin-bottom: 0.75rem;
        }
        .section-title span {
            background: linear-gradient(90deg, #c9a84c, #e8c97a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .section-desc { color: rgba(255,255,255,0.55); font-size: 1rem; max-width: 560px; margin: 0 auto; }

        .destinations-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(2, 240px);
            gap: 1.25rem;
        }
        .dest-card.large {
            grid-column: 1 / 3;
            grid-row: 1 / 3;
        }
        .dest-card {
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            cursor: pointer;
        }
        .dest-card img {
            width: 100%; height: 100%;
            object-fit: cover;
            transition: transform 0.6s ease;
        }
        .dest-card:hover img { transform: scale(1.08); }
        .dest-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(0deg, rgba(12,18,32,0.85) 0%, rgba(12,18,32,0.1) 60%, transparent 100%);
            display: flex;
            align-items: flex-end;
            transition: background 0.3s;
        }
        .dest-card:hover .dest-overlay {
            background: linear-gradient(0deg, rgba(201,168,76,0.7) 0%, rgba(12,18,32,0.3) 60%, transparent 100%);
        }
        .dest-content { padding: 1.5rem; width: 100%; }
        .dest-region {
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #d4b55e;
            background: rgba(201,168,76,0.2);
            border: 1px solid rgba(201,168,76,0.3);
            padding: 0.2rem 0.6rem;
            border-radius: 50px;
            display: inline-block;
            margin-bottom: 0.5rem;
        }
        .dest-content h3 {
            font-size: 1.3rem;
            font-weight: 800;
            color: white;
            margin-bottom: 0.25rem;
        }
        .dest-card.large .dest-content h3 { font-size: 1.8rem; }
        .dest-content p { font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem; }
        .explore-link {
            color: #d4b55e;
            font-size: 0.8rem;
            font-weight: 700;
            opacity: 0;
            transform: translateX(-10px);
            transition: all 0.3s;
            display: inline-block;
        }
        .dest-card:hover .explore-link { opacity: 1; transform: translateX(0); }

        .ar-teaser {
            margin-top: 2.5rem;
            background: linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03));
            border: 1px solid rgba(201,168,76,0.2);
            border-radius: 20px;
            padding: 1.5rem 2rem;
        }
        .ar-teaser-content {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }
        .ar-icon { font-size: 2.5rem; }
        .ar-teaser-content h4 {
            color: white;
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }
        .ar-teaser-content p {
            color: rgba(255,255,255,0.5);
            font-size: 0.85rem;
        }
        .ar-btn {
            margin-left: auto;
            background: #c9a84c;
            color: #0c1220;
            border: none;
            padding: 0.65rem 1.5rem;
            border-radius: 7px;
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
        }
        .ar-btn:hover { background: #d4b55e; }

        @media (max-width: 900px) {
            .destinations-grid {
                grid-template-columns: repeat(2, 1fr);
                grid-template-rows: auto;
            }
            .dest-card.large { grid-column: 1 / 3; grid-row: auto; height: 260px; }
            .dest-card { height: 200px; }
            .ar-teaser-content { flex-wrap: wrap; }
            .ar-btn { margin-left: 0; }
        }
        @media (max-width: 600px) {
            .destinations-grid { grid-template-columns: 1fr; }
            .dest-card.large { grid-column: auto; }
        }
    `]
})
export class TourDestinations {
    otherDestinations = [
        {
            name: 'Pokhara',
            region: 'Gandaki Province',
            packages: 18,
            image: 'https://images.pexels.com/photos/14989389/pexels-photo-14989389.jpeg',
            link: '/tour/package/pokhara-tour-package'
        },
        {
            name: 'Chitwan',
            region: 'Jungle Safari',
            packages: 12,
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
            link: '/tour/package/chitwan-jungle-safari'
        },
        {
            name: 'Kathmandu',
            region: 'Bagmati Province',
            packages: 32,
            image: 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=600&q=80',
            link: '/tour/package/5-days-nepal-tour'
        },
        {
            name: 'Mustang',
            region: 'Hidden Kingdom',
            packages: 8,
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
            link: '/tour/package/upper-mustang-hidden-kingdom'
        }
    ];
}
