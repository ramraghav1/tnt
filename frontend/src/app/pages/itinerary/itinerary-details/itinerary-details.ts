import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { MediaGalleryComponent } from '../media-gallery';

interface DayCost {
  name: string;
  category: string;
  price: number;
}

interface ItineraryDay {
  id: number;
  dayNumber: number;
  title: string;
  description: string;
  location: string;
  accommodation: string;
  transport: string;
  breakfastIncluded: boolean;
  lunchIncluded: boolean;
  dinnerIncluded: boolean;
  activities: string[];
  costs: DayCost[];
  dailyCost: number;
}

interface ItineraryDetail {
  id: number;
  title: string;
  description: string;
  durationDays: number;
  difficultyLevel: string;
  pricingMode: string;
  overallPrice: number;
  days: ItineraryDay[];
}

@Component({
  selector: 'app-itinerary-details',
  standalone: true,
  imports: [CommonModule, TagModule, ProgressSpinnerModule, ButtonModule, MediaGalleryComponent],
  templateUrl: './itinerary-details.html',
  styleUrls: ['./itinerary-details.scss']
})
export class ItineraryDetailsComponent implements OnInit {

  itinerary?: ItineraryDetail;
  loading = true;
  collapsedDays: boolean[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      return;
    }

    this.http.get<ItineraryDetail>(`${environment.apiBaseUrl}/Itineraries/detail?id=${id}`)
      .subscribe({
        next: (res) => {
          this.itinerary = res;
          this.collapsedDays = (res.days || []).map(() => false);
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.cd.detectChanges();
        }
      });
  }

  toggleDay(index: number) {
    this.collapsedDays[index] = !this.collapsedDays[index];
  }

  expandAll() {
    this.collapsedDays = this.collapsedDays.map(() => false);
  }

  collapseAll() {
    this.collapsedDays = this.collapsedDays.map(() => true);
  }

  getDifficultySeverity(level: string): 'success' | 'secondary' | 'danger' | 'info' {
    switch (level?.toLowerCase()) {
      case 'easy': return 'success';
      case 'moderate': return 'secondary';
      case 'hard': return 'danger';
      default: return 'info';
    }
  }

  getDayTotal(day: ItineraryDay): number {
    return (day.costs || []).reduce((sum, c) => sum + (c.price || 0), 0);
  }

  getGrandTotal(): number {
    if (!this.itinerary) return 0;
    switch (this.itinerary.pricingMode) {
      case 'OVERALL':
        return this.itinerary.overallPrice || 0;
      case 'DAILY':
        return this.itinerary.days.reduce((sum, day) => sum + (day.dailyCost || 0), 0);
      case 'DAILY_ACTIVITY':
      default:
        return this.itinerary.days.reduce((sum, day) => sum + this.getDayTotal(day), 0);
    }
  }

  getPricingModeLabel(): string {
    if (!this.itinerary) return '';
    switch (this.itinerary.pricingMode) {
      case 'OVERALL': return 'Overall Price';
      case 'DAILY': return 'Daily Cost';
      case 'DAILY_ACTIVITY': return 'Per Day & Activity';
      default: return '';
    }
  }

  getMeals(day: ItineraryDay): string[] {
    const meals: string[] = [];
    if (day.breakfastIncluded) meals.push('Breakfast');
    if (day.lunchIncluded) meals.push('Lunch');
    if (day.dinnerIncluded) meals.push('Dinner');
    return meals;
  }

  goBack() {
    this.router.navigate(['/itinerary-list']);
  }

  goEdit() {
    if (this.itinerary) {
      this.router.navigate(['/edit-itinerary', this.itinerary.id]);
    }
  }

  goSendProposal() {
    if (this.itinerary) {
      this.router.navigate(['/proposal-customize', this.itinerary.id]);
    }
  }
}