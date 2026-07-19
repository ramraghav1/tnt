import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface TourPackage {
    slug: string;
    title: string;
    subtitle: string;
    image: string;
    badge: string;
    badgeColor: string;
    duration: string;
    difficulty: string;
    groupSize: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviews: number;
    highlights: string[];
    featured?: boolean;
}

@Component({
    selector: 'tour-packages',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <section class="packages-section" id="packages">
            <div class="section-container">
                <!-- Section Header -->
                <div class="section-header">
                    <span class="section-tag">✨ Curated Experiences</span>
                    <h2 class="section-title">Popular Tour <span>Packages</span></h2>
                    <p class="section-desc">Hand-crafted itineraries for every kind of traveler — from luxury seekers to budget adventurers</p>
                </div>

                <!-- Filter Tabs -->
                <div class="filter-tabs">
                    @for (tab of filterTabs; track tab) {
                        <button class="filter-tab" [class.active]="activeFilter === tab" (click)="setFilter(tab)">{{ tab }}</button>
                    }
                </div>

                <!-- Packages Grid -->
                <div class="packages-grid">
                    @for (pkg of filteredPackages(); track pkg.slug) {
                        <div class="package-card" [class.featured]="pkg.featured">
                            @if (pkg.featured) {
                                <div class="featured-ribbon">⭐ Featured</div>
                            }
                            <div class="card-image-wrapper">
                                <img [src]="pkg.image" [alt]="pkg.title" class="card-image" loading="lazy" />
                                <div class="image-overlay">
                                    <a [routerLink]="['/tour/package', pkg.slug]" class="overlay-btn">View Details</a>
                                </div>
                                <div class="card-badge" [style.background]="pkg.badgeColor">{{ pkg.badge }}</div>
                                <div class="card-price-tag">
                                    <span class="from">from</span>
                                    <span class="price">{{ pkg.price | currency:'USD':'symbol':'1.0-0' }}</span>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="card-meta">
                                    <span class="meta-item">🕐 {{ pkg.duration }}</span>
                                    <span class="meta-item">👥 {{ pkg.groupSize }}</span>
                                    <span class="meta-item difficulty" [class]="pkg.difficulty.toLowerCase()">{{ pkg.difficulty }}</span>
                                </div>
                                <h3 class="card-title">
                                    <a [routerLink]="['/tour/package', pkg.slug]">{{ pkg.title }}</a>
                                </h3>
                                <p class="card-subtitle">{{ pkg.subtitle }}</p>
                                <ul class="highlights">
                                    @for (h of pkg.highlights.slice(0,3); track h) {
                                        <li><span class="check">✓</span> {{ h }}</li>
                                    }
                                </ul>
                                <div class="card-footer">
                                    <div class="rating">
                                        <div class="stars">
                                            @for (s of [1,2,3,4,5]; track s) {
                                                <span [class.filled]="s <= pkg.rating">★</span>
                                            }
                                        </div>
                                        <span class="rating-count">({{ pkg.reviews }})</span>
                                    </div>
                                    <div class="card-actions">
                                        <a [routerLink]="['/tour/package', pkg.slug]" class="btn-primary-sm">Book Now</a>
                                        <a [routerLink]="['/tour/package', pkg.slug]" [fragment]="'customize'" class="btn-outline-sm">Customize</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>

                <!-- View All -->
                <div class="view-all-wrapper">
                    <a href="#" class="btn-view-all">
                        Explore All Packages
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
            </div>
        </section>
    `,
    styles: [`
        .packages-section {
            padding: 6rem 0;
            background: #0c1220;
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
            line-height: 1.15;
        }
        .section-title span {
            background: linear-gradient(90deg, #c9a84c, #e8c97a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .section-desc { color: rgba(255,255,255,0.55); font-size: 1rem; max-width: 560px; margin: 0 auto; }

        .filter-tabs {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 2.5rem;
        }
        .filter-tab {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.7);
            padding: 0.45rem 1.25rem;
            border-radius: 50px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        .filter-tab.active, .filter-tab:hover {
            background: #c9a84c;
            border-color: #c9a84c;
            color: #0c1220;
            font-weight: 600;
        }

        .packages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 2rem;
        }
        .package-card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.35s ease;
            position: relative;
        }
        .package-card:hover {
            transform: translateY(-6px);
            border-color: rgba(201,168,76,0.25);
            box-shadow: 0 20px 50px rgba(0,0,0,0.4);
        }
        .package-card.featured {
            border-color: rgba(201,168,76,0.2);
        }
        .featured-ribbon {
            position: absolute;
            top: 1rem; right: 0;
            background: #c9a84c;
            color: #0c1220;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 0.3rem 0.85rem;
            z-index: 10;
            border-radius: 4px 0 0 4px;
        }
        .card-image-wrapper { position: relative; overflow: hidden; height: 220px; }
        .card-image {
            width: 100%; height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        .package-card:hover .card-image { transform: scale(1.08); }
        .image-overlay {
            position: absolute;
            inset: 0;
            background: rgba(12,18,32,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .package-card:hover .image-overlay { opacity: 1; }
        .overlay-btn {
            background: rgba(255,255,255,0.95);
            color: #0c1220;
            padding: 0.6rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
        }
        .overlay-btn:hover { background: #c9a84c; color: white; }
        .card-badge {
            position: absolute;
            top: 1rem; left: 1rem;
            color: white;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 0.3rem 0.75rem;
            border-radius: 50px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .card-price-tag {
            position: absolute;
            bottom: 1rem; right: 1rem;
            background: rgba(12,18,32,0.9);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(201,168,76,0.3);
            border-radius: 10px;
            padding: 0.4rem 0.75rem;
            text-align: right;
        }
        .from { display: block; font-size: 0.65rem; color: rgba(255,255,255,0.5); }
        .price { color: #c9a84c; font-size: 1.1rem; font-weight: 800; }

        .card-body { padding: 1.25rem; }
        .card-meta {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
        }
        .meta-item {
            font-size: 0.72rem;
            color: rgba(255,255,255,0.5);
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        .meta-item.difficulty {
            padding: 0.2rem 0.6rem;
            border-radius: 50px;
            font-weight: 600;
        }
        .meta-item.easy { background: rgba(34,197,94,0.15); color: #22c55e; }
        .meta-item.moderate { background: rgba(250,204,21,0.15); color: #facc15; }
        .meta-item.challenging { background: rgba(201,168,76,0.15); color: #c9a84c; }
        .meta-item.strenuous { background: rgba(239,68,68,0.15); color: #ef4444; }

        .card-title {
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 0.4rem;
            line-height: 1.3;
        }
        .card-title a { color: white; text-decoration: none; transition: color 0.2s; }
        .card-title a:hover { color: #c9a84c; }
        .card-subtitle { font-size: 0.8rem; color: rgba(255,255,255,0.45); margin-bottom: 0.85rem; line-height: 1.5; }

        .highlights { list-style: none; margin: 0 0 1rem; padding: 0; }
        .highlights li {
            font-size: 0.78rem;
            color: rgba(255,255,255,0.6);
            padding: 0.2rem 0;
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .check { color: #22c55e; font-weight: 700; }

        .card-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 1rem;
            border-top: 1px solid rgba(255,255,255,0.06);
        }
        .stars { display: flex; gap: 1px; }
        .stars span { color: rgba(255,255,255,0.2); font-size: 0.85rem; }
        .stars span.filled { color: #e8c97a; }
        .rating { display: flex; align-items: center; gap: 0.4rem; }
        .rating-count { font-size: 0.75rem; color: rgba(255,255,255,0.4); }
        .card-actions { display: flex; gap: 0.5rem; }
        .btn-primary-sm {
            background: #c9a84c;
            color: #0c1220;
            padding: 0.4rem 0.85rem;
            border-radius: 7px;
            font-size: 0.78rem;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
        }
        .btn-primary-sm:hover { background: #d4b55e; }
        .btn-outline-sm {
            background: transparent;
            color: rgba(255,255,255,0.7);
            border: 1px solid rgba(255,255,255,0.15);
            padding: 0.4rem 0.85rem;
            border-radius: 8px;
            font-size: 0.78rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }
        .btn-outline-sm:hover { border-color: #c9a84c; color: #c9a84c; }

        .view-all-wrapper { text-align: center; margin-top: 3rem; }
        .btn-view-all {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: transparent;
            border: 1px solid rgba(201,168,76,0.4);
            color: #c9a84c;
            padding: 0.85rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
            font-size: 0.9rem;
        }
        .btn-view-all:hover {
            background: #c9a84c;
            border-color: #c9a84c;
            color: #0c1220;
        }
        @media (max-width: 768px) {
            .packages-grid { grid-template-columns: 1fr; }
        }
    `]
})
export class TourPackages {
    filterTabs = ['All', 'Trekking', 'Cultural', 'Adventure', 'Luxury', 'Budget'];
    activeFilter = 'All';

    packages: TourPackage[] = [
        {
            slug: '5-days-nepal-tour',
            title: '5 Days Nepal Tour',
            subtitle: 'Kathmandu, Bhaktapur & Nagarkot — A perfect cultural immersion',
            image: 'https://images.unsplash.com/photo-1544735716-ea9ef790244f?w=700&q=80',
            badge: 'Best Seller',
            badgeColor: 'linear-gradient(135deg,#22c55e,#16a34a)',
            duration: '5 Days / 4 Nights',
            difficulty: 'Easy',
            groupSize: '2–15 People',
            price: 299,
            originalPrice: 399,
            rating: 5,
            reviews: 248,
            highlights: ['Pashupatinath Temple', 'Swayambhunath Stupa', 'Bhaktapur Durbar Square', 'Nagarkot Sunrise'],
            featured: true
        },
        {
            slug: 'pokhara-tour-package',
            title: 'Pokhara Tour Package',
            subtitle: 'The lake city at the foot of the Annapurna — serene & stunning',
            image: 'https://images.pexels.com/photos/14989389/pexels-photo-14989389.jpeg',
            badge: 'Popular',
            badgeColor: 'linear-gradient(135deg,#3b82f6,#2563eb)',
            duration: '4 Days / 3 Nights',
            difficulty: 'Easy',
            groupSize: '2–20 People',
            price: 199,
            originalPrice: 279,
            rating: 5,
            reviews: 312,
            highlights: ['Phewa Lake Boating', 'Davis Falls', 'Sarangkot Sunrise', 'Peace Stupa'],
            featured: false
        },
        {
            slug: 'everest-base-camp-budget-trek',
            title: 'Everest Base Camp Budget Trek',
            subtitle: 'Stand at the base of the world\'s highest peak without breaking the bank',
            image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=80',
            badge: 'Budget',
            badgeColor: 'linear-gradient(135deg,#c9a84c,#b8963e)',
            duration: '14 Days / 13 Nights',
            difficulty: 'Strenuous',
            groupSize: '4–12 People',
            price: 899,
            originalPrice: 1299,
            rating: 5,
            reviews: 189,
            highlights: ['Namche Bazaar', 'Tengboche Monastery', 'Kala Patthar View', 'Everest Base Camp 5364m'],
            featured: true
        },
        {
            slug: 'annapurna-circuit-trek',
            title: 'Annapurna Circuit Trek',
            subtitle: 'A classic circuit through diverse landscapes and high mountain passes',
            image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=700&q=80',
            badge: 'Adventure',
            badgeColor: 'linear-gradient(135deg,#a855f7,#7c3aed)',
            duration: '18 Days',
            difficulty: 'Challenging',
            groupSize: '2–10 People',
            price: 1099,
            originalPrice: 1499,
            rating: 4,
            reviews: 156,
            highlights: ['Thorong La Pass 5416m', 'Muktinath Temple', 'Poon Hill Sunrise', 'Manang Village']
        },
        {
            slug: 'chitwan-jungle-safari',
            title: 'Chitwan Jungle Safari',
            subtitle: 'Spot one-horned rhinos and Bengal tigers in their natural habitat',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=80',
            badge: 'Wildlife',
            badgeColor: 'linear-gradient(135deg,#10b981,#059669)',
            duration: '3 Days / 2 Nights',
            difficulty: 'Easy',
            groupSize: '4–16 People',
            price: 249,
            originalPrice: 329,
            rating: 4,
            reviews: 203,
            highlights: ['Elephant Safari', 'Canoe Ride', 'Jungle Walk', 'Cultural Program']
        },
        {
            slug: 'upper-mustang-hidden-kingdom',
            title: 'Upper Mustang Hidden Kingdom',
            subtitle: 'Explore the forbidden kingdom — a surreal Tibetan landscape',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80',
            badge: 'Exclusive',
            badgeColor: 'linear-gradient(135deg,#f59e0b,#d97706)',
            duration: '12 Days',
            difficulty: 'Moderate',
            groupSize: '4–8 People',
            price: 1599,
            originalPrice: 1999,
            rating: 5,
            reviews: 87,
            highlights: ['Lo Manthang Walled City', 'Ancient Monasteries', 'Red Cliffs of Mustang', 'Tibetan Culture']
        }
    ];

    filteredPackages() {
        if (this.activeFilter === 'All') return this.packages;
        const map: Record<string, string[]> = {
            'Trekking': ['everest-base-camp-budget-trek', 'annapurna-circuit-trek', 'upper-mustang-hidden-kingdom'],
            'Cultural': ['5-days-nepal-tour', 'pokhara-tour-package'],
            'Adventure': ['annapurna-circuit-trek', 'everest-base-camp-budget-trek'],
            'Luxury': ['upper-mustang-hidden-kingdom'],
            'Budget': ['everest-base-camp-budget-trek', 'pokhara-tour-package']
        };
        return this.packages.filter(p => (map[this.activeFilter] || []).includes(p.slug));
    }

    setFilter(tab: string) { this.activeFilter = tab; }
}
