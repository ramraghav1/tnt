import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'tour-stats',
    standalone: true,
    imports: [CommonModule],
    template: `
        <section class="stats-section">
            <div class="stats-bg-glow"></div>
            <div class="stats-container">
                @for (stat of stats; track stat.label) {
                    <div class="stat-item">
                        <div class="stat-icon">{{ stat.icon }}</div>
                        <div class="stat-value">{{ stat.display }}</div>
                        <div class="stat-label">{{ stat.label }}</div>
                    </div>
                }
            </div>
        </section>
    `,
    styles: [`
        .stats-section {
            padding: 3.5rem 0;
            background: #111827;
            border-top: 1px solid rgba(255,255,255,0.06);
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .stats-bg-glow { display: none; }
        .stats-container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 2rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 0;
        }
        .stat-item {
            text-align: center;
            padding: 1.75rem 1.5rem;
            position: relative;
        }
        .stat-item::after {
            content: '';
            position: absolute;
            right: 0; top: 25%; bottom: 25%;
            width: 1px;
            background: rgba(255,255,255,0.07);
        }
        .stat-item:last-child::after { display: none; }
        .stat-icon {
            font-size: 1.5rem;
            margin-bottom: 0.6rem;
            opacity: 0.7;
        }
        .stat-value {
            font-size: clamp(1.75rem, 3.5vw, 2.5rem);
            font-weight: 800;
            color: #c9a84c;
            line-height: 1;
            margin-bottom: 0.4rem;
            letter-spacing: -0.5px;
        }
        .stat-label {
            font-size: 0.78rem;
            color: rgba(255,255,255,0.45);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        @media (max-width: 640px) {
            .stats-container { grid-template-columns: repeat(2, 1fr); }
            .stat-item::after { display: none; }
            .stat-item { border-bottom: 1px solid rgba(255,255,255,0.06); }
        }
    `]
})
export class TourStats {
    stats = [
        { icon: '✈️', display: '10,000+', label: 'Happy Travelers' },
        { icon: '🗺️', display: '50+', label: 'Destinations' },
        { icon: '⭐', display: '4.9/5', label: 'Average Rating' },
        { icon: '🏆', display: '15+', label: 'Years Experience' },
        { icon: '🛡️', display: '100%', label: 'Safe Journeys' }
    ];
}
