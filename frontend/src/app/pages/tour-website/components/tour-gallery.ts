import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'tour-gallery',
    standalone: true,
    imports: [CommonModule],
    template: `
        <section class="gallery-section" id="gallery">
            <div class="section-container">
                <div class="section-header">
                    <span class="section-tag">📸 Captured Moments</span>
                    <h2 class="section-title">Travel <span>Gallery</span></h2>
                    <p class="section-desc">Real photos from real trips — every frame tells a story</p>
                </div>

                <div class="gallery-masonry">
                    @for (img of galleryImages; track img.src) {
                        <div class="gallery-item" [class]="img.size">
                            <img [src]="img.src" [alt]="img.caption" loading="lazy" />
                            <div class="gallery-hover">
                                <div class="gallery-info">
                                    <span class="gallery-location">📍 {{ img.location }}</span>
                                    <p>{{ img.caption }}</p>
                                </div>
                                <button class="gallery-expand">⤢</button>
                            </div>
                        </div>
                    }
                </div>

                <!-- Instagram CTA -->
                <div class="instagram-cta">
                    <span class="insta-icon">📷</span>
                    <div>
                        <h4>Follow Our Adventures</h4>
                        <p>Share your trip with <strong>#TNTTravels</strong> and get featured</p>
                    </div>
                    <a href="https://instagram.com" target="_blank" class="insta-btn">
                        Follow on Instagram
                    </a>
                </div>
            </div>
        </section>
    `,
    styles: [`
        .gallery-section {
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
        }
        .section-title span {
            background: linear-gradient(90deg, #c9a84c, #e8c97a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .section-desc { color: rgba(255,255,255,0.55); font-size: 1rem; }
        .gallery-masonry {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-auto-rows: 200px;
            gap: 1rem;
        }
        .gallery-item {
            position: relative;
            border-radius: 16px;
            overflow: hidden;
            cursor: pointer;
        }
        .gallery-item.tall { grid-row: span 2; }
        .gallery-item.wide { grid-column: span 2; }
        .gallery-item img {
            width: 100%; height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        .gallery-item:hover img { transform: scale(1.08); }
        .gallery-hover {
            position: absolute;
            inset: 0;
            background: linear-gradient(0deg, rgba(12,18,32,0.9) 0%, transparent 60%);
            opacity: 0;
            transition: opacity 0.3s;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 1rem;
        }
        .gallery-item:hover .gallery-hover { opacity: 1; }
        .gallery-info .gallery-location {
            color: #d4b55e;
            font-size: 0.72rem;
            font-weight: 700;
            display: block;
            margin-bottom: 0.25rem;
        }
        .gallery-info p { color: rgba(255,255,255,0.9); font-size: 0.8rem; margin: 0; }
        .gallery-expand {
            position: absolute;
            top: 0.75rem; right: 0.75rem;
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(5px);
            border: none;
            color: white;
            width: 32px; height: 32px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        .gallery-expand:hover { background: rgba(201,168,76,0.5); }
        .instagram-cta {
            margin-top: 2.5rem;
            background: linear-gradient(135deg, rgba(233,30,99,0.06), rgba(201,168,76,0.04));
            border: 1px solid rgba(233,30,99,0.15);
            border-radius: 20px;
            padding: 1.5rem 2rem;
            display: flex;
            align-items: center;
            gap: 1.25rem;
        }
        .insta-icon { font-size: 2rem; }
        .instagram-cta h4 { color: white; font-weight: 700; margin-bottom: 0.25rem; }
        .instagram-cta p { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
        .instagram-cta strong { color: #d4b55e; }
        .insta-btn {
            margin-left: auto;
            background: #111827;
            border: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.7);
            padding: 0.65rem 1.5rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .insta-btn:hover { border-color: rgba(255,255,255,0.25); color: white; }
        @media (max-width: 900px) {
            .gallery-masonry { grid-template-columns: repeat(2, 1fr); }
            .gallery-item.wide { grid-column: span 1; }
        }
        @media (max-width: 600px) {
            .gallery-masonry { grid-template-columns: 1fr; }
            .gallery-item.tall { grid-row: span 1; }
            .instagram-cta { flex-direction: column; }
            .insta-btn { margin-left: 0; width: 100%; text-align: center; }
        }
    `]
})
export class TourGallery {
    galleryImages = [
        { src: 'https://images.pexels.com/photos/20824634/pexels-photo-20824634.jpeg', caption: 'Sunrise over Everest', location: 'Kala Patthar, Nepal', size: 'tall' },
        { src: 'https://images.pexels.com/photos/14989389/pexels-photo-14989389.jpeg', caption: 'Phewa Lake reflections', location: 'Pokhara, Nepal', size: '' },
        { src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80', caption: 'Himalayan landscape', location: 'Annapurna, Nepal', size: '' },
        { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', caption: 'Mountain peaks at golden hour', location: 'Mustang, Nepal', size: 'wide' },
        { src: 'https://images.pexels.com/photos/14367176/pexels-photo-14367176.jpeg', caption: 'Ancient Durbar Square', location: 'Kathmandu, Nepal', size: '' },
        { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80', caption: 'Jungle safari adventure', location: 'Chitwan, Nepal', size: 'tall' },
        { src: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80', caption: 'Trekking through rhododendrons', location: 'Ghorepani, Nepal', size: '' },
        { src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80', caption: 'City lights and mountains', location: 'Kathmandu Valley', size: '' }
    ];
}
