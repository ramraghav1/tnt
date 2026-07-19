import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'tour-testimonials',
    standalone: true,
    imports: [CommonModule],
    template: `
        <section class="testimonials-section">
            <div class="section-container">
                <div class="section-header">
                    <span class="section-tag">💬 Real Stories</span>
                    <h2 class="section-title">What Our <span>Travelers Say</span></h2>
                    <p class="section-desc">Thousands of adventurers have trusted us with their dream trips</p>
                </div>

                <div class="testimonials-grid">
                    @for (t of testimonials; track t.name) {
                        <div class="testimonial-card" [class.featured]="t.featured">
                            <div class="t-header">
                                <img [src]="t.avatar" [alt]="t.name" class="t-avatar" loading="lazy" />
                                <div class="t-info">
                                    <h4>{{ t.name }}</h4>
                                    <p class="t-from">{{ t.from }}</p>
                                    <div class="t-stars">
                                        @for (s of [1,2,3,4,5]; track s) {
                                            <span [class.filled]="s <= t.rating">★</span>
                                        }
                                    </div>
                                </div>
                                <div class="t-trip-tag">{{ t.trip }}</div>
                            </div>
                            <blockquote class="t-quote">
                                <span class="quote-mark">"</span>
                                {{ t.text }}
                            </blockquote>
                            @if (t.image) {
                                <div class="t-trip-image">
                                    <img [src]="t.image" [alt]="'Trip by ' + t.name" loading="lazy" />
                                </div>
                            }
                            <div class="t-footer">
                                <span class="t-verified">✓ Verified Traveler</span>
                                <span class="t-date">{{ t.date }}</span>
                            </div>
                        </div>
                    }
                </div>

                <!-- Trust bar -->
                <div class="trust-bar">
                    <div class="trust-item">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/TripAdvisor_Certificate_of_Excellence.svg" alt="TripAdvisor" class="trust-logo" />
                        <span>TripAdvisor<br><strong>Certificate of Excellence</strong></span>
                    </div>
                    <div class="trust-divider"></div>
                    <div class="trust-item">
                        <span class="big-stars">★★★★★</span>
                        <span>4.9/5 on Google<br><strong>1,200+ Reviews</strong></span>
                    </div>
                    <div class="trust-divider"></div>
                    <div class="trust-item">
                        <span style="font-size:2rem">🏆</span>
                        <span>Booking.com<br><strong>Top Rated 2024</strong></span>
                    </div>
                </div>
            </div>
        </section>
    `,
    styles: [`
        .testimonials-section {
            padding: 7rem 0;
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
        .section-desc { color: rgba(255,255,255,0.55); font-size: 1rem; }

        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
        }
        .testimonial-card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
            padding: 1.5rem;
            transition: all 0.3s;
        }
        .testimonial-card:hover {
            border-color: rgba(201,168,76,0.25);
            transform: translateY(-4px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        .testimonial-card.featured {
            border-color: rgba(201,168,76,0.3);
            background: rgba(201,168,76,0.04);
        }
        .t-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }
        .t-avatar {
            width: 52px; height: 52px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(201,168,76,0.3);
            flex-shrink: 0;
        }
        .t-info h4 { color: white; font-size: 0.95rem; font-weight: 700; margin-bottom: 0.1rem; }
        .t-from { color: rgba(255,255,255,0.4); font-size: 0.75rem; margin-bottom: 0.2rem; }
        .t-stars { display: flex; gap: 1px; }
        .t-stars span { font-size: 0.8rem; color: rgba(255,255,255,0.2); }
        .t-stars span.filled { color: #e8c97a; }
        .t-trip-tag {
            margin-left: auto;
            background: rgba(201,168,76,0.1);
            border: 1px solid rgba(201,168,76,0.25);
            color: #d4b55e;
            font-size: 0.68rem;
            font-weight: 700;
            padding: 0.25rem 0.6rem;
            border-radius: 50px;
            white-space: nowrap;
        }
        .t-quote {
            position: relative;
            color: rgba(255,255,255,0.7);
            font-size: 0.875rem;
            line-height: 1.7;
            padding-left: 1.5rem;
            margin: 0 0 1rem;
        }
        .quote-mark {
            position: absolute;
            left: 0; top: -0.25rem;
            font-size: 2rem;
            color: #c9a84c;
            line-height: 1;
            font-family: Georgia, serif;
        }
        .t-trip-image {
            border-radius: 12px;
            overflow: hidden;
            height: 140px;
            margin-bottom: 1rem;
        }
        .t-trip-image img { width: 100%; height: 100%; object-fit: cover; }
        .t-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 0.75rem;
            border-top: 1px solid rgba(255,255,255,0.06);
        }
        .t-verified { color: #22c55e; font-size: 0.72rem; font-weight: 600; }
        .t-date { color: rgba(255,255,255,0.3); font-size: 0.72rem; }

        .trust-bar {
            margin-top: 4rem;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
            padding: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0;
        }
        .trust-item {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            padding: 0 2rem;
        }
        .trust-item span {
            color: rgba(255,255,255,0.5);
            font-size: 0.8rem;
            line-height: 1.5;
        }
        .trust-item strong { color: white; }
        .trust-logo { width: 40px; height: 40px; object-fit: contain; }
        .big-stars { color: #e8c97a; font-size: 1.5rem !important; }
        .trust-divider { width: 1px; height: 50px; background: rgba(255,255,255,0.08); flex-shrink: 0; }

        @media (max-width: 768px) {
            .testimonials-grid { grid-template-columns: 1fr; }
            .trust-bar { flex-direction: column; gap: 1.5rem; }
            .trust-divider { width: 100%; height: 1px; }
        }
    `]
})
export class TourTestimonials {
    testimonials = [
        {
            name: 'Sarah Mitchell',
            from: '🇺🇸 Boston, USA',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
            trip: 'EBC Trek',
            rating: 5,
            text: 'Absolutely life-changing! The TNT Travels team organized every detail perfectly. Our guide Pemba was knowledgeable, funny, and kept us safe throughout the entire Everest Base Camp trek. 10/10 would book again!',
            image: 'https://images.unsplash.com/photo-1544735716-ea9ef790244f?w=400&q=80',
            date: 'March 2026',
            featured: true
        },
        {
            name: 'Johannes Weber',
            from: '🇩🇪 Munich, Germany',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
            trip: 'Annapurna Circuit',
            rating: 5,
            text: 'Wunderschön! The Annapurna Circuit was beyond anything I imagined. Professional team, great food, comfortable lodges. The crossing of Thorong La pass at 5416m was the highlight of my life.',
            image: null,
            date: 'January 2026',
            featured: false
        },
        {
            name: 'Priya Sharma',
            from: '🇮🇳 Mumbai, India',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
            trip: '5 Days Nepal Tour',
            rating: 5,
            text: 'We were a family of 5 and couldn\'t be happier. The cultural tour was perfectly paced — Pashupatinath at sunrise, Bhaktapur\'s ancient streets, and the Nagarkot sunrise. Pure magic.',
            image: 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=400&q=80',
            date: 'February 2026',
            featured: false
        },
        {
            name: 'Thomas Laurent',
            from: '🇫🇷 Paris, France',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
            trip: 'Pokhara Tour',
            rating: 4,
            text: 'Pokhara is simply magical. The Phewa Lake, the Annapurna reflections at dawn, the paragliding over the valley — TNT made it all seamless. Great value for money!',
            image: null,
            date: 'December 2025',
            featured: false
        },
        {
            name: 'Elena Volkov',
            from: '🇷🇺 Moscow, Russia',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
            trip: 'Chitwan Safari',
            rating: 5,
            text: 'We spotted two one-horned rhinos on our first elephant safari! The naturalist guide was exceptional. The traditional Tharu cultural show at night was unforgettable.',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
            date: 'November 2025',
            featured: true
        },
        {
            name: 'Carlos Mendez',
            from: '🇲🇽 Mexico City, Mexico',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
            trip: 'Upper Mustang',
            rating: 5,
            text: 'The hidden kingdom of Mustang blew my mind. Ancient cave monasteries, red cliffs, and a culture untouched by time. TNT Travels got us the restricted area permit hassle-free.',
            image: null,
            date: 'October 2025',
            featured: false
        }
    ];
}
