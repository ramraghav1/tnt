import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { LayoutService } from './app/layout/service/layout.service';
import { CurrencyService } from './app/shared/services/currency.service';

const DEFAULT_TITLE = 'Suryantra Technologies';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit, OnDestroy {
    constructor(
        private translate: TranslateService,
        private titleService: Title,
        private router: Router,
        private layoutService: LayoutService,
        private currencyService: CurrencyService
    ) {
        // Re-generate favicon whenever theme primary color or dark mode changes
        effect(() => {
            this.layoutService.layoutConfig(); // subscribe to signal
            // CSS variables are updated asynchronously after the signal fires
            setTimeout(() => this.updateFavicon(), 50);
        });
    }

    ngOnInit() {
        // Set up available languages
        this.translate.addLangs(['en', 'np']);
        
        // Set default language
        this.translate.setDefaultLang('en');
        
        // Use language from localStorage or default to English
        const savedLang = localStorage.getItem('language') || 'en';
        this.translate.use(savedLang);

        // Set initial title and favicon
        this.updateTitleAndFavicon();

        // Update title and favicon on every navigation (e.g. after login stores tenantName)
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => this.updateTitleAndFavicon());

        // Initialize multi-currency exchange rates
        this.currencyService.initialize();
    }

    ngOnDestroy(): void {
        this.currencyService.disconnect();
    }

    private updateTitleAndFavicon(): void {
        const tenantName = localStorage.getItem('tenantName') || DEFAULT_TITLE;
        this.titleService.setTitle(tenantName);
        this.updateFavicon();
    }

    private updateFavicon(): void {
        const tenantName = localStorage.getItem('tenantName') || DEFAULT_TITLE;
        this.setLetterFavicon(tenantName.charAt(0).toUpperCase());
    }

    private setLetterFavicon(letter: string): void {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Read PrimeNG theme primary color from CSS variable at runtime
        const primaryColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--p-primary-color').trim()
            || getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color').trim()
            || '#6366f1';

        // Background circle using theme primary color
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.fill();

        // Bold uppercase letter centered
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${size * 0.55}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, size / 2, size / 2);

        const dataUrl = canvas.toDataURL('image/png');

        // Replace all existing favicon link tags
        document.querySelectorAll('link[rel*="icon"]').forEach(el => el.remove());

        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = dataUrl;
        document.head.appendChild(link);
    }
}
