import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'tour-why-us',
    standalone: true,
    imports: [CommonModule],
    template: `
        <section class="why-section" id="about">
            <div class="section-container">
                <div class="why-layout">
                    <!-- Left content -->
                    <div class="why-content">
                        <span class="section-tag">🏅 Why Choose Us</span>
                        <h2 class="section-title">Your Journey, <span>Our Passion</span></h2>
                        <p class="why-desc">
                            We are not just a travel agency — we are your journey architects. With 15+ years weaving unforgettable experiences across Nepal and beyond, we bring you authenticity, safety, and memories that last a lifetime.
                        </p>

                        <div class="features-list">
                            @for (feature of features; track feature.title) {
                                <div class="feature-item">
                                    <div class="feature-icon">{{ feature.icon }}</div>
                                    <div>
                                        <h4>{{ feature.title }}</h4>
                                        <p>{{ feature.desc }}</p>
                                    </div>
                                </div>
                            }
                        </div>

                        <div class="certs">
                            @for (cert of certifications; track cert) {
                                <div class="cert-badge">{{ cert }}</div>
                            }
                        </div>
                    </div>

                    <!-- Right visual / AI Planner teaser -->
                    <div class="why-visual">
                        <div class="visual-main">
                            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80" alt="Mountain adventure" loading="lazy" />
                            <!-- Floating info cards -->
                            <div class="float-card card-1">
                                <span class="float-icon">🌡️</span>
                                <div>
                                    <div class="float-val">22°C</div>
                                    <div class="float-lbl">Best Season</div>
                                </div>
                            </div>
                            <div class="float-card card-2">
                                <span class="float-icon">⚡</span>
                                <div>
                                    <div class="float-val">24/7</div>
                                    <div class="float-lbl">Support</div>
                                </div>
                            </div>
                        </div>

                        <!-- AI Trip Planner Teaser -->
                        <div class="ai-planner-card">
                            <div class="ai-header">
                                <div class="ai-badge">🤖 AI-Powered</div>
                                <span>Trip Planner</span>
                            </div>
                            <p class="ai-desc">Tell us your dream trip and our AI will craft a personalized itinerary in seconds</p>
                            <div class="ai-prompt">
                                <input type="text" placeholder="e.g. 7 days trekking in Nepal with budget $800..." readonly />
                                <button class="ai-generate-btn">✨ Generate</button>
                            </div>
                            <div class="ai-tags">
                                <span>🏔️ Adventure</span>
                                <span>🌿 Nature</span>
                                <span>🏛️ Culture</span>
                                <span>💰 Budget</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `,
    styles: [`
        .why-section {
            padding: 7rem 0;
            background: #0c1220;
        }
        .section-container { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }
        .why-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5rem;
            align-items: center;
        }
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
            font-size: clamp(1.8rem, 3.5vw, 2.75rem);
            font-weight: 900;
            color: white;
            margin-bottom: 1rem;
            line-height: 1.2;
        }
        .section-title span {
            background: linear-gradient(90deg, #c9a84c, #e8c97a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .why-desc { color: rgba(255,255,255,0.6); line-height: 1.8; margin-bottom: 2rem; font-size: 0.95rem; }
        .features-list { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 2rem; }
        .feature-item { display: flex; gap: 1rem; align-items: flex-start; }
        .feature-icon {
            width: 48px; height: 48px;
            background: rgba(201,168,76,0.1);
            border: 1px solid rgba(201,168,76,0.25);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            flex-shrink: 0;
        }
        .feature-item h4 { color: white; font-size: 0.95rem; font-weight: 700; margin-bottom: 0.2rem; }
        .feature-item p { color: rgba(255,255,255,0.5); font-size: 0.8rem; line-height: 1.5; }
        .certs { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .cert-badge {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.6);
            font-size: 0.72rem;
            font-weight: 600;
            padding: 0.35rem 0.85rem;
            border-radius: 50px;
        }
        .why-visual { position: relative; }
        .visual-main {
            border-radius: 24px;
            overflow: hidden;
            height: 420px;
            position: relative;
        }
        .visual-main img { width: 100%; height: 100%; object-fit: cover; }
        .visual-main::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(201,168,76,0.15) 0%, transparent 60%);
            z-index: 1;
        }
        .float-card {
            position: absolute;
            z-index: 2;
            background: rgba(12,18,32,0.9);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(201,168,76,0.25);
            border-radius: 16px;
            padding: 0.75rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        .card-1 { top: 1.5rem; left: -1.5rem; }
        .card-2 { bottom: 2rem; right: -1.5rem; }
        .float-icon { font-size: 1.5rem; }
        .float-val { color: white; font-size: 1.1rem; font-weight: 800; }
        .float-lbl { color: rgba(255,255,255,0.5); font-size: 0.7rem; }

        .ai-planner-card {
            margin-top: 1.5rem;
            background: linear-gradient(135deg, rgba(201,168,76,0.08), rgba(99,102,241,0.05));
            border: 1px solid rgba(201,168,76,0.2);
            border-radius: 20px;
            padding: 1.5rem;
        }
        .ai-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
        }
        .ai-badge {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
        }
        .ai-header span { color: white; font-weight: 700; font-size: 1rem; }
        .ai-desc { color: rgba(255,255,255,0.5); font-size: 0.8rem; margin-bottom: 1rem; line-height: 1.6; }
        .ai-prompt {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
        }
        .ai-prompt input {
            flex: 1;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 0.6rem 1rem;
            color: rgba(255,255,255,0.6);
            font-size: 0.8rem;
            outline: none;
        }
        .ai-generate-btn {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            border: none;
            border-radius: 10px;
            padding: 0.6rem 1rem;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
        }
        .ai-generate-btn:hover { box-shadow: 0 4px 20px rgba(99,102,241,0.5); }
        .ai-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .ai-tags span {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.5);
            font-size: 0.72rem;
            padding: 0.25rem 0.65rem;
            border-radius: 50px;
        }

        @media (max-width: 900px) {
            .why-layout { grid-template-columns: 1fr; gap: 3rem; }
            .card-1 { left: 0.5rem; }
            .card-2 { right: 0.5rem; }
        }
    `]
})
export class TourWhyUs {
    features = [
        { icon: '🧭', title: 'Expert Local Guides', desc: 'Certified, multilingual guides with deep knowledge of every trail and cultural site' },
        { icon: '🛡️', title: 'Safety First Always', desc: 'Emergency protocols, insurance coverage, and real-time tracking for every trip' },
        { icon: '💡', title: 'Fully Customizable', desc: 'No cookie-cutter tours — every itinerary is tailored to your preferences and budget' },
        { icon: '🌱', title: 'Sustainable Travel', desc: 'We offset carbon, support local communities, and practice responsible tourism' }
    ];

    certifications = [
        '✓ Nepal Tourism Board',
        '✓ TAAN Certified',
        '✓ ISO 9001:2015',
        '✓ NMA Registered'
    ];
}
