import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'tour-footer',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
        <footer class="tour-footer" id="contact">
            <!-- Newsletter banner -->
            <div class="newsletter-bar">
                <div class="nl-container">
                    <div class="nl-content">
                        <div class="nl-text">
                            <h4>✈️ Travel Deals & Inspiration</h4>
                            <p>Subscribe for exclusive deals, hidden gems, and expert travel tips</p>
                        </div>
                        <div class="nl-form">
                            <input type="email" [(ngModel)]="email" placeholder="Enter your email address" />
                            <button (click)="subscribe()">{{ subscribed ? '✅ Subscribed!' : 'Subscribe' }}</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main footer -->
            <div class="footer-main">
                <div class="footer-container">
                    <div class="footer-grid">
                        <!-- Brand column -->
                        <div class="footer-brand">
                            <div class="footer-logo">
                                <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M16 3C9.373 3 4 8.373 4 15c0 9.25 12 20 12 20s12-10.75 12-20c0-6.627-5.373-12-12-12z" fill="#c9a84c"/><circle cx="16" cy="15" r="4.5" fill="white"/></svg>
                                <span>TNT <span class="orange">Travels</span></span>
                            </div>
                            <p class="brand-desc">Your trusted partner for unforgettable Nepal adventures. Crafting memories since 2010.</p>
                            <div class="contact-list">
                                <div class="contact-item">
                                    <span>📞</span><span>+977-9800-000-000</span>
                                </div>
                                <div class="contact-item">
                                    <span>📧</span><span>info&#64;tnttravels.com.np</span>
                                </div>
                                <div class="contact-item">
                                    <span>📍</span><span>Thamel, Kathmandu, Nepal</span>
                                </div>
                                <div class="contact-item">
                                    <span>🕐</span><span>Open 24/7 for inquiries</span>
                                </div>
                            </div>
                            <div class="social-links">
                                <a href="#" class="social-link" aria-label="Facebook">
                                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                                </a>
                                <a href="#" class="social-link" aria-label="Instagram">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                                </a>
                                <a href="#" class="social-link" aria-label="YouTube">
                                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
                                </a>
                                <a href="#" class="social-link" aria-label="TripAdvisor">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                                </a>
                            </div>
                        </div>

                        <!-- Quick Links -->
                        <div class="footer-col">
                            <h5>Popular Packages</h5>
                            <ul>
                                <li><a routerLink="/tour/package/everest-base-camp-budget-trek">Everest Base Camp Trek</a></li>
                                <li><a routerLink="/tour/package/annapurna-circuit-trek">Annapurna Circuit</a></li>
                                <li><a routerLink="/tour/package/5-days-nepal-tour">5 Days Nepal Tour</a></li>
                                <li><a routerLink="/tour/package/pokhara-tour-package">Pokhara Tour</a></li>
                                <li><a routerLink="/tour/package/chitwan-jungle-safari">Chitwan Safari</a></li>
                                <li><a routerLink="/tour/package/upper-mustang-hidden-kingdom">Upper Mustang</a></li>
                            </ul>
                        </div>

                        <!-- Destinations -->
                        <div class="footer-col">
                            <h5>Destinations</h5>
                            <ul>
                                <li><a href="#">Kathmandu Valley</a></li>
                                <li><a href="#">Pokhara Region</a></li>
                                <li><a href="#">Everest Region</a></li>
                                <li><a href="#">Annapurna Region</a></li>
                                <li><a href="#">Mustang</a></li>
                                <li><a href="#">Chitwan & Bardia</a></li>
                            </ul>
                        </div>

                        <!-- Company -->
                        <div class="footer-col">
                            <h5>Company</h5>
                            <ul>
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Our Team</a></li>
                                <li><a href="#">Blog & Travel Tips</a></li>
                                <li><a href="#">Travel Insurance</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a [routerLink]="['/login']">Partner Login</a></li>
                            </ul>
                            <div class="payment-methods">
                                <h6>We Accept</h6>
                                <div class="payment-icons">
                                    <span class="pay-badge">💳 Visa</span>
                                    <span class="pay-badge">🏦 Mastercard</span>
                                    <span class="pay-badge">📱 eSewa</span>
                                    <span class="pay-badge">🔵 Khalti</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom bar -->
            <div class="footer-bottom">
                <div class="footer-container">
                    <div class="bottom-content">
                        <p>© 2026 TNT Travels. All rights reserved. | Registered with Nepal Tourism Board</p>
                        <div class="bottom-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Cookie Policy</a>
                            <a href="#">Sitemap</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    `,
    styles: [`
        .tour-footer { background: #0c1220; }
        .newsletter-bar {
            background: #111827;
            border-top: 1px solid rgba(201,168,76,0.15);
            border-bottom: 1px solid rgba(255,255,255,0.06);
            padding: 2.5rem 0;
        }
        .nl-container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
        .nl-content { display: flex; align-items: center; gap: 2rem; flex-wrap: wrap; }
        .nl-text h4 { color: #f9fafb; font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .nl-text p { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
        .nl-form { display: flex; gap: 0.5rem; flex: 1; max-width: 460px; margin-left: auto; }
        .nl-form input {
            flex: 1;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 0.65rem 1.1rem;
            color: white;
            font-size: 0.875rem;
            outline: none;
            transition: border-color 0.2s;
        }
        .nl-form input:focus { border-color: rgba(201,168,76,0.4); }
        .nl-form input::placeholder { color: rgba(255,255,255,0.3); }
        .nl-form button {
            background: #c9a84c;
            color: #0c1220;
            border: none;
            border-radius: 8px;
            padding: 0.65rem 1.4rem;
            font-weight: 700;
            font-size: 0.875rem;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
        }
        .nl-form button:hover { background: #d4b55e; }


        .footer-main { padding: 4rem 0 2rem; }
        .footer-container { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }
        .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 3rem;
        }
        .footer-logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            font-size: 1.3rem;
            font-weight: 800;
            color: white;
        }
        .orange { color: #c9a84c; }
        .brand-desc { color: rgba(255,255,255,0.5); font-size: 0.85rem; line-height: 1.7; margin-bottom: 1.25rem; }
        .contact-list { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; }
        .contact-item { display: flex; align-items: center; gap: 0.75rem; color: rgba(255,255,255,0.5); font-size: 0.82rem; }
        .social-links { display: flex; gap: 0.6rem; }
        .social-link {
            width: 36px; height: 36px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255,255,255,0.6);
            text-decoration: none;
            transition: all 0.2s;
        }
        .social-link:hover {
            background: rgba(201,168,76,0.2);
            border-color: rgba(201,168,76,0.4);
            color: #c9a84c;
            transform: translateY(-2px);
        }
        .footer-col h5 {
            color: white;
            font-size: 0.875rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1.25rem;
            position: relative;
            padding-bottom: 0.75rem;
        }
        .footer-col h5::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0;
            width: 30px; height: 2px;
            background: #c9a84c;
            border-radius: 2px;
        }
        .footer-col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
        .footer-col a {
            color: rgba(255,255,255,0.5);
            text-decoration: none;
            font-size: 0.85rem;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .footer-col a:hover { color: #c9a84c; padding-left: 4px; }
        .payment-methods { margin-top: 1.5rem; }
        .payment-methods h6 { color: rgba(255,255,255,0.4); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.6rem; }
        .payment-icons { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .pay-badge {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.08);
            color: rgba(255,255,255,0.5);
            font-size: 0.68rem;
            padding: 0.25rem 0.6rem;
            border-radius: 6px;
        }
        .footer-bottom {
            border-top: 1px solid rgba(255,255,255,0.06);
            padding: 1.5rem 0;
        }
        .bottom-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .bottom-content p { color: rgba(255,255,255,0.3); font-size: 0.78rem; }
        .bottom-links { display: flex; gap: 1.5rem; flex-wrap: wrap; }
        .bottom-links a { color: rgba(255,255,255,0.3); font-size: 0.78rem; text-decoration: none; transition: color 0.2s; }
        .bottom-links a:hover { color: #c9a84c; }
        @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }
        @media (max-width: 640px) {
            .footer-grid { grid-template-columns: 1fr; }
            .nl-form { flex-direction: column; }
            .bottom-content { flex-direction: column; text-align: center; }
        }
    `]
})
export class TourFooter {
    email = '';
    subscribed = false;

    subscribe() {
        if (this.email) {
            this.subscribed = true;
            this.email = '';
            setTimeout(() => this.subscribed = false, 4000);
        }
    }
}
