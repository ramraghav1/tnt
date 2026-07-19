import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'tour-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <nav class="tour-nav" [class.scrolled]="isScrolled()">
            <div class="nav-container">
                <!-- Logo -->
                <a routerLink="/tour" class="nav-logo">
                    <div class="logo-icon">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 3C9.373 3 4 8.373 4 15c0 9.25 12 20 12 20s12-10.75 12-20c0-6.627-5.373-12-12-12z" fill="#c9a84c"/><circle cx="16" cy="15" r="4.5" fill="white"/></svg>
                    </div>
                    <span class="logo-text">TNT <span>Travels</span></span>
                </a>

                <!-- Desktop Nav Links -->
                <ul class="nav-links" [class.open]="menuOpen()">
                    <li><a routerLink="/tour" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
                    <li class="has-dropdown">
                        <a href="#packages">Packages <span class="arrow">▾</span></a>
                        <div class="dropdown">
                            <a routerLink="/tour/package/5-days-nepal-tour">5 Days Nepal Tour</a>
                            <a routerLink="/tour/package/pokhara-tour-package">Pokhara Tour Package</a>
                            <a routerLink="/tour/package/everest-base-camp-budget-trek">Everest Base Camp Trek</a>
                            <a routerLink="/tour/package/annapurna-circuit-trek">Annapurna Circuit Trek</a>
                            <a routerLink="/tour/package/chitwan-jungle-safari">Chitwan Jungle Safari</a>
                        </div>
                    </li>
                    <li><a href="#destinations">Destinations</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#gallery">Gallery</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>

                <!-- CTA Buttons -->
                <div class="nav-cta">
                    <a href="#quote" class="btn-quote">Get Free Quote</a>
                    <button class="hamburger" (click)="toggleMenu()" [class.active]="menuOpen()">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        </nav>
    `,
    styles: [`
        .tour-nav {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 1000;
            padding: 1rem 0;
            transition: all 0.3s ease;
            background: transparent;
        }
        .tour-nav.scrolled {
            background: rgba(12, 18, 32, 0.97);
            backdrop-filter: blur(20px);
            padding: 0.6rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 2rem;
        }
        .nav-logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            flex-shrink: 0;
        }
        .logo-text {
            font-size: 1.4rem;
            font-weight: 800;
            color: white;
            letter-spacing: -0.5px;
        }
        .logo-text span { color: #c9a84c; }
        .nav-links {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            list-style: none;
            margin: 0; padding: 0;
        }
        .nav-links li { position: relative; }
        .nav-links a {
            color: rgba(255,255,255,0.9);
            text-decoration: none;
            padding: 0.5rem 0.85rem;
            font-size: 0.9rem;
            font-weight: 500;
            border-radius: 8px;
            transition: all 0.2s;
            display: block;
        }
        .nav-links a:hover, .nav-links a.active {
            color: #f9fafb;
            background: rgba(255,255,255,0.06);
        }
        .has-dropdown:hover .dropdown { display: flex; }
        .dropdown {
            display: none;
            flex-direction: column;
            position: absolute;
            top: calc(100% + 0.5rem);
            left: 0;
            background: #111827;
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 12px;
            padding: 0.4rem;
            min-width: 220px;
            box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .dropdown a {
            font-size: 0.85rem;
            padding: 0.6rem 1rem;
            border-radius: 8px;
            white-space: nowrap;
        }
        .dropdown a:hover { color: #c9a84c; background: rgba(201,168,76,0.06); }
        .arrow { font-size: 0.7rem; margin-left: 2px; }
        .nav-cta { display: flex; align-items: center; gap: 1rem; }
        .btn-quote {
            background: #c9a84c;
            color: #0c1220;
            padding: 0.55rem 1.25rem;
            border-radius: 7px;
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 700;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .btn-quote:hover {
            background: #d4b55e;
        }
        .hamburger {
            display: none;
            flex-direction: column;
            gap: 5px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
        }
        .hamburger span {
            display: block;
            width: 24px; height: 2px;
            background: white;
            border-radius: 2px;
            transition: all 0.3s;
        }
        .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .hamburger.active span:nth-child(2) { opacity: 0; }
        .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        @media (max-width: 900px) {
            .hamburger { display: flex; }
            .nav-links {
                display: none;
                position: fixed;
                top: 65px; left: 0; right: 0;
                background: #0c1220;
                flex-direction: column;
                padding: 1rem 1.5rem;
                gap: 0.15rem;
                border-bottom: 1px solid rgba(255,255,255,0.06);
            }
            .nav-links.open { display: flex; }
            .dropdown { position: static; display: flex; background: rgba(201,168,76,0.04); border: none; box-shadow: none; }
            .has-dropdown:hover .dropdown { display: flex; }
        }
    `]
})
export class TourNavbar {
    isScrolled = signal(false);
    menuOpen = signal(false);

    @HostListener('window:scroll')
    onScroll() {
        this.isScrolled.set(window.scrollY > 50);
    }

    toggleMenu() {
        this.menuOpen.update(v => !v);
    }
}
