import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'tour-cta',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <section class="cta-section" id="quote">
            <!-- Background -->
            <div class="cta-bg">
                <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&q=80" alt="Mountains" />
                <div class="cta-overlay"></div>
                <!-- animated orbs -->
                <div class="orb orb-1"></div>
                <div class="orb orb-2"></div>
            </div>

            <div class="cta-container">
                <div class="cta-layout">
                    <!-- Left: Main CTA -->
                    <div class="cta-left">
                        <span class="cta-tag">🚀 Ready to Explore?</span>
                        <h2 class="cta-title">Start Your <span>Dream Journey</span> Today</h2>
                        <p class="cta-desc">Get a personalized quote within 2 hours. No commitment, no hidden fees — just your perfect adventure awaiting.</p>

                        <div class="cta-buttons">
                            <a href="#quote-form" class="btn-get-quote">
                                <span>💬 Get Free Quote</span>
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </a>
                            <a href="tel:+977-9800000000" class="btn-call">
                                <span>📞 Call Now</span>
                            </a>
                            <a href="https://wa.me/9779800000000" target="_blank" class="btn-whatsapp">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01a1.093 1.093 0 0 0-.79.372C7 8.002 6 9.26 6 11.67c0 2.41 1.762 4.74 2.008 5.068.247.327 3.465 5.29 8.4 7.42 1.174.507 2.09.81 2.804 1.036 1.178.375 2.25.322 3.097.195.944-.14 2.908-1.19 3.32-2.337.41-1.147.41-2.13.287-2.337-.121-.207-.447-.33-.744-.479z"/></svg>
                                <span>WhatsApp</span>
                            </a>
                        </div>

                        <div class="promise-badges">
                            <div class="promise-badge">⚡ 2hr Response</div>
                            <div class="promise-badge">💯 Free Cancellation</div>
                            <div class="promise-badge">🔒 Secure Payment</div>
                        </div>
                    </div>

                    <!-- Right: Quote Form -->
                    <div class="quote-form" id="quote-form">
                        <div class="form-header">
                            <h3>Plan My Trip</h3>
                            <p>Fill in the details and we'll craft your perfect itinerary</p>
                        </div>

                        <form (ngSubmit)="submitQuote()" class="form-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Full Name *</label>
                                    <input type="text" [(ngModel)]="form.name" name="name" placeholder="John Smith" required />
                                </div>
                                <div class="form-group">
                                    <label>Email *</label>
                                    <input type="email" [(ngModel)]="form.email" name="email" placeholder="you@email.com" required />
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Phone / WhatsApp</label>
                                    <input type="tel" [(ngModel)]="form.phone" name="phone" placeholder="+1 234 567 890" />
                                </div>
                                <div class="form-group">
                                    <label>No. of Travelers</label>
                                    <input type="number" [(ngModel)]="form.travelers" name="travelers" placeholder="2" min="1" />
                                </div>
                            </div>
                            <div class="form-group full-width">
                                <label>Destination / Package</label>
                                <select [(ngModel)]="form.destination" name="destination">
                                    <option value="">Select a destination...</option>
                                    <option value="ebc">Everest Base Camp Trek</option>
                                    <option value="pokhara">Pokhara Tour</option>
                                    <option value="nepal">5 Days Nepal Tour</option>
                                    <option value="annapurna">Annapurna Circuit</option>
                                    <option value="chitwan">Chitwan Safari</option>
                                    <option value="mustang">Upper Mustang</option>
                                    <option value="custom">Custom Trip</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Travel Date</label>
                                    <input type="date" [(ngModel)]="form.date" name="date" />
                                </div>
                                <div class="form-group">
                                    <label>Budget (USD)</label>
                                    <select [(ngModel)]="form.budget" name="budget">
                                        <option value="">Select budget</option>
                                        <option>Under $500</option>
                                        <option>$500 – $1000</option>
                                        <option>$1000 – $2000</option>
                                        <option>$2000+</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group full-width">
                                <label>Special Requests</label>
                                <textarea [(ngModel)]="form.notes" name="notes" rows="3" placeholder="Vegetarian meals, wheelchair access, honeymoon setup..."></textarea>
                            </div>
                            <button type="submit" class="submit-btn" [class.loading]="submitting">
                                @if (submitting) { <span class="spinner"></span> Sending... }
                                @else if (submitted) { ✅ Quote Sent! We'll contact you shortly }
                                @else { 🚀 Get My Free Quote }
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    `,
    styles: [`
        .cta-section {
            position: relative;
            padding: 7rem 0;
            overflow: hidden;
        }
        .cta-bg {
            position: absolute;
            inset: 0;
        }
        .cta-bg img {
            width: 100%; height: 100%;
            object-fit: cover;
        }
        .cta-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to right,
                rgba(12,18,32,0.97) 0%,
                rgba(12,18,32,0.85) 50%,
                rgba(12,18,32,0.7) 100%
            );
        }
        .orb { display: none; }
        .orb-1 { display: none; }
        .orb-2 { display: none; }
        @keyframes orb-move { from {} to {} }
        .cta-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 2rem;
            position: relative;
            z-index: 10;
        }
        .cta-layout {
            display: grid;
            grid-template-columns: 1fr 1.3fr;
            gap: 5rem;
            align-items: center;
        }
        .cta-tag {
            display: inline-block;
            background: rgba(201,168,76,0.15);
            border: 1px solid rgba(201,168,76,0.3);
            color: #d4b55e;
            padding: 0.35rem 1rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1.25rem;
        }
        .cta-title {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 900;
            color: white;
            line-height: 1.2;
            margin-bottom: 1rem;
        }
        .cta-title span {
            background: linear-gradient(90deg, #c9a84c, #e8c97a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .cta-desc { color: rgba(255,255,255,0.6); font-size: 1rem; line-height: 1.7; margin-bottom: 2rem; }
        .cta-buttons {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-bottom: 2rem;
        }
        .btn-get-quote {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: #c9a84c;
            color: #0c1220;
            padding: 0.85rem 1.75rem;
            border-radius: 8px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
        }
        .btn-get-quote:hover {
            background: #d4b55e;
            transform: translateY(-2px);
        }
        .btn-call {
            display: flex;
            align-items: center;
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.15);
            color: rgba(255,255,255,0.85);
            padding: 0.85rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }
        .btn-call:hover { background: rgba(255,255,255,0.12); color: white; }
        .btn-whatsapp {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            background: rgba(37,211,102,0.1);
            border: 1px solid rgba(37,211,102,0.25);
            color: #25d366;
            padding: 0.85rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }
        .btn-whatsapp:hover { background: rgba(37,211,102,0.18); }
        .promise-badges { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .promise-badge {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.6);
            font-size: 0.72rem;
            font-weight: 600;
            padding: 0.35rem 0.85rem;
            border-radius: 50px;
        }
        .quote-form {
            background: #111827;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
            padding: 2rem;
        }
        .form-header { margin-bottom: 1.5rem; }
        .form-header h3 { color: white; font-size: 1.3rem; font-weight: 800; margin-bottom: 0.25rem; }
        .form-header p { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
        .form-body { display: flex; flex-direction: column; gap: 0.85rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
        .form-group.full-width { grid-column: 1 / -1; }
        .form-group label {
            color: rgba(255,255,255,0.6);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 0.7rem 1rem;
            color: white;
            font-size: 0.875rem;
            outline: none;
            transition: border-color 0.2s;
            width: 100%;
        }
        .form-group input::placeholder,
        .form-group textarea::placeholder { color: rgba(255,255,255,0.3); }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            border-color: rgba(201,168,76,0.5);
            background: rgba(201,168,76,0.05);
        }
        .form-group select { appearance: none; cursor: pointer; }
        .form-group select option { background: #0c1220; }
        .form-group textarea { resize: vertical; }
        .submit-btn {
            width: 100%;
            background: #c9a84c;
            color: #0c1220;
            border: none;
            border-radius: 10px;
            padding: 1rem;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        .submit-btn:hover:not([disabled]) { background: #d4b55e; }
        .spinner {
            width: 18px; height: 18px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
            .cta-layout { grid-template-columns: 1fr; gap: 3rem; }
        }
        @media (max-width: 640px) {
            .form-row { grid-template-columns: 1fr; }
            .cta-buttons { flex-direction: column; }
        }
    `]
})
export class TourCta {
    submitting = false;
    submitted = false;

    form = {
        name: '', email: '', phone: '', travelers: '',
        destination: '', date: '', budget: '', notes: ''
    };

    submitQuote() {
        this.submitting = true;
        setTimeout(() => {
            this.submitting = false;
            this.submitted = true;
        }, 2000);
    }
}
