import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

interface Itinerary {
  id: number;
  title: string;
  description: string;
  durationDays: number;
  difficultyLevel: string;
}

@Component({
  selector: 'app-itinerary-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    ConfirmDialogModule,
    DialogModule,
    TooltipModule,
    TagModule,
    TranslateModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './itinerary-list.html'
})
export class ItineraryList implements OnInit {
  itineraries: Itinerary[] = [];
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
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

          // ✅ Trigger change detection manually to avoid NG0100
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

  viewDetails(itinerary: Itinerary) {
    this.router.navigate(['itinerary-details', itinerary.id]);
  }

  editItinerary(itinerary: Itinerary) {
    this.router.navigate(['edit-itinerary', itinerary.id]);
  }

  sendProposal(itinerary: Itinerary) {
    this.router.navigate(['proposal-customize', itinerary.id]);
  }

  difficultyTag(level: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const l = (level ?? '').toLowerCase();
    if (l.includes('easy'))      return 'success';
    if (l.includes('moderate'))  return 'info';
    if (l.includes('strenuous') || l.includes('hard') || l.includes('difficult')) return 'danger';
    return 'secondary';
  }

  deleteItinerary(itinerary: Itinerary) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${itinerary.title}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`${environment.apiBaseUrl}/Itineraries/delete/${itinerary.id}`).subscribe({
          next: () => {
            this.itineraries = this.itineraries.filter(i => i.id !== itinerary.id);
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `Itinerary ${itinerary.title} deleted` });
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete itinerary' });
          }
        });
      }
    });
  }
}