import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface Itinerary {
    id: number;
    title: string;
    description: string;
    durationDays: number;
    difficultyLevel: string;
    pricingMode: string;
    overallPrice: number;
}

@Component({
    selector: 'app-customize-itinerary-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        ConfirmDialogModule,
        TooltipModule,
        TagModule,
        TranslateModule,
        ProgressSpinnerModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './customize-itinerary-list.html',
    styleUrls: ['./customize-itinerary-list.scss']
})
export class CustomizeItineraryList implements OnInit {
    itineraries: Itinerary[] = [];
    loading = true;

    constructor(
        private http: HttpClient,
        public router: Router,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadItineraries();
    }

    loadItineraries() {
        this.loading = true;
        this.http.get<Itinerary[]>(`${environment.apiBaseUrl}/Itineraries/list`)
            .subscribe({
                next: (data) => {
                    this.itineraries = data;
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error(err);
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load itineraries' });
                    this.cdr.detectChanges();
                }
            });
    }

    customizeItinerary(itinerary: Itinerary) {
        this.router.navigate(['/customize-itinerary', itinerary.id]);
    }

    viewDetails(itinerary: Itinerary) {
        this.router.navigate(['/itinerary-details', itinerary.id]);
    }

    difficultyTag(level: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const l = (level ?? '').toLowerCase();
        if (l.includes('easy')) return 'success';
        if (l.includes('moderate')) return 'info';
        if (l.includes('strenuous') || l.includes('hard') || l.includes('difficult')) return 'danger';
        return 'secondary';
    }
}
