import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { environment } from '../../../../environments/environment';
import { InventoryService, Hotel, Guide } from '../../inventory/inventory.service';

type PricingMode = 'OVERALL' | 'DAILY' | 'DAILY_ACTIVITY';

interface DayCostEntry {
  name: string;
  category: string;
  price: number;
}

interface ItineraryDayForm {
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
  costs: DayCostEntry[];
  dailyCost: number;
  hotelId: number | null;
  guideId: number | null;
  guideNeeded: boolean;
  hotelNeeded: boolean;
}

interface ItineraryForm {
  title: string;
  description: string;
  durationDays: number;
  difficultyLevel: string;
  pricingMode: PricingMode;
  overallPrice: number;
  days: ItineraryDayForm[];
}

@Component({
  selector: 'app-edit-itinerary',
  standalone: true,
  imports: [
    FormsModule, FluidModule, InputTextModule, ButtonModule, SelectModule, TextareaModule,
    MultiSelectModule, CheckboxModule, RadioButtonModule, CommonModule, Toast, ConfirmDialog,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './edit-itinerary.html',
  styleUrls: ['./edit-itinerary.scss']
})
export class EditItinerary implements OnInit {
  itineraryId!: number;
  loading = true;

  form: ItineraryForm = {
    title: '',
    description: '',
    durationDays: 0,
    difficultyLevel: '',
    pricingMode: 'OVERALL',
    overallPrice: 0,
    days: []
  };

  pricingModeOptions: { label: string; value: PricingMode; description: string }[] = [
    { label: 'Overall Price', value: 'OVERALL', description: 'Single total price for the entire itinerary' },
    { label: 'Daily Cost', value: 'DAILY', description: 'Set a total cost per day (no activity breakdown)' },
    { label: 'Per Day & Activity', value: 'DAILY_ACTIVITY', description: 'Detailed cost per activity within each day' }
  ];

  difficultyLevelOptions = [
    { label: 'Easy', value: 'Easy' },
    { label: 'Moderate', value: 'Moderate' },
    { label: 'Hard', value: 'Hard' }
  ];

  activityOptions = [
    { label: 'Hiking', value: 'Hiking' },
    { label: 'Sightseeing', value: 'Sightseeing' },
    { label: 'Cultural Tour', value: 'Cultural Tour' },
    { label: 'Adventure Sports', value: 'Adventure Sports' },
    { label: 'Relaxation', value: 'Relaxation' }
  ];

  collapsedDays: boolean[] = [];
  showPricing: boolean[] = [];

  // Inventory data for hotel/guide selection
  hotels: Hotel[] = [];
  guides: Guide[] = [];
  hotelOptions: { label: string; value: number }[] = [];
  guideOptions: { label: string; value: number }[] = [];

  predefinedCosts = [
    { name: 'Breakfast', category: 'Meal' },
    { name: 'Lunch', category: 'Meal' },
    { name: 'Dinner', category: 'Meal' },
    { name: 'Hotel/Resort', category: 'Accommodation' },
    { name: 'Transport', category: 'Transport' },
    { name: 'Sightseeing', category: 'Activity' },
    { name: 'Cultural Dance', category: 'Activity' },
    { name: 'Guide', category: 'Service' }
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    this.itineraryId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadInventory();
    this.loadItinerary();
  }

  loadInventory() {
    this.inventoryService.getHotels().subscribe({
      next: (data) => {
        this.hotels = data;
        this.hotelOptions = data.map(h => ({ label: `${h.name} - ${h.location}`, value: h.id! }));
      }
    });
    this.inventoryService.getGuides().subscribe({
      next: (data) => {
        this.guides = data;
        this.guideOptions = data.map(g => ({ label: `${g.fullName} (${g.languages?.join(', ') || 'N/A'}) - Rs.${g.pricePerDay}/day`, value: g.id! }));
      }
    });
  }

  getSelectedHotel(hotelId: number | null): Hotel | undefined {
    return this.hotels.find(h => h.id === hotelId);
  }

  getSelectedGuide(guideId: number | null): Guide | undefined {
    return this.guides.find(g => g.id === guideId);
  }

  loadItinerary() {
    this.loading = true;
    this.http.get<any>(`${environment.apiBaseUrl}/Itineraries/detail?id=${this.itineraryId}`)
      .subscribe({
        next: (data) => {
          this.form = {
            title: data.title || '',
            description: data.description || '',
            durationDays: data.durationDays || 0,
            difficultyLevel: data.difficultyLevel || '',
            pricingMode: data.pricingMode || 'DAILY_ACTIVITY',
            overallPrice: data.overallPrice || 0,
            days: (data.days || []).map((d: any) => ({
              dayNumber: d.dayNumber,
              title: d.title || '',
              description: d.description || '',
              location: d.location || '',
              accommodation: d.accommodation || '',
              transport: d.transport || '',
              breakfastIncluded: d.breakfastIncluded || false,
              lunchIncluded: d.lunchIncluded || false,
              dinnerIncluded: d.dinnerIncluded || false,
              activities: d.activities || [],
              costs: (d.costs || []).map((c: any) => ({
                name: c.name || '',
                category: c.category || '',
                price: c.price || 0
              })),
              dailyCost: d.dailyCost || 0,
              hotelId: d.hotelId || null,
              guideId: d.guideId || null,
              hotelNeeded: !!d.hotelId,
              guideNeeded: !!d.guideId
            }))
          };

          // Initialize collapse/pricing state
          this.collapsedDays = this.form.days.map(() => true);
          this.showPricing = this.form.days.map(d => d.costs.length > 0);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load itinerary' });
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  addDay() {
    this.collapsedDays = this.collapsedDays.map(() => true);

    const dayNum = this.form.days.length + 1;
    this.form.days.push({
      dayNumber: dayNum,
      title: '',
      description: '',
      location: '',
      accommodation: '',
      transport: '',
      breakfastIncluded: false,
      lunchIncluded: false,
      dinnerIncluded: false,
      activities: [],
      costs: [],
      dailyCost: 0,
      hotelId: null,
      guideId: null,
      guideNeeded: false,
      hotelNeeded: false
    });

    this.collapsedDays.push(false);
    this.showPricing.push(false);

    setTimeout(() => {
      const el = document.querySelector(`[data-day-index="${dayNum - 1}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  removeDay(index: number) {
    const dayNum = this.form.days[index].dayNumber;
    this.confirmationService.confirm({
      message: `Are you sure you want to delete Day ${dayNum}? All entered data for this day will be lost.`,
      header: 'Delete Day ' + dayNum,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        this.form.days.splice(index, 1);
        this.collapsedDays.splice(index, 1);
        this.showPricing.splice(index, 1);
        this.form.days.forEach((day, i) => day.dayNumber = i + 1);
        this.messageService.add({ severity: 'info', summary: 'Deleted', detail: `Day ${dayNum} removed` });
      }
    });
  }

  toggleDay(index: number) {
    this.collapsedDays[index] = !this.collapsedDays[index];
  }

  expandAllDays() {
    this.collapsedDays = this.collapsedDays.map(() => false);
  }

  collapseAllDays() {
    this.collapsedDays = this.collapsedDays.map(() => true);
  }

  togglePricing(index: number) {
    this.showPricing[index] = !this.showPricing[index];
    if (this.showPricing[index] && this.form.days[index].costs.length === 0) {
      this.form.days[index].costs = this.predefinedCosts.map(c => ({
        name: c.name,
        category: c.category,
        price: 0
      }));
    }
  }

  addCustomCost(dayIndex: number) {
    this.form.days[dayIndex].costs.push({ name: '', category: 'Other', price: 0 });
  }

  removeCost(dayIndex: number, costIndex: number) {
    this.form.days[dayIndex].costs.splice(costIndex, 1);
  }

  getDayTotal(dayIndex: number): number {
    return this.form.days[dayIndex].costs.reduce((sum, c) => sum + (c.price || 0), 0);
  }

  getDailyCostTotal(): number {
    return this.form.days.reduce((sum, day) => sum + (day.dailyCost || 0), 0);
  }

  getGrandTotal(): number {
    switch (this.form.pricingMode) {
      case 'OVERALL':
        return this.form.overallPrice || 0;
      case 'DAILY':
        return this.getDailyCostTotal();
      case 'DAILY_ACTIVITY':
        return this.form.days.reduce((sum, day) => sum + day.costs.reduce((s, c) => s + (c.price || 0), 0), 0);
      default:
        return 0;
    }
  }

  getDayInventoryCost(day: ItineraryDayForm): number {
    let cost = 0;
    if (day.hotelNeeded && day.hotelId) {
      const hotel = this.getSelectedHotel(day.hotelId);
      if (hotel && hotel.rooms && hotel.rooms.length > 0) {
        cost += hotel.rooms[0].pricePerNight || 0;
      }
    }
    if (day.guideNeeded && day.guideId) {
      const guide = this.getSelectedGuide(day.guideId);
      if (guide) {
        cost += guide.pricePerDay || 0;
      }
    }
    return cost;
  }

  getTotalInventoryCost(): number {
    return this.form.days.reduce((sum, day) => sum + this.getDayInventoryCost(day), 0);
  }

  confirmSave() {
    if (!this.form.title || !this.form.durationDays || this.form.days.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields' });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to update this itinerary?',
      header: 'Confirm Update',
      icon: 'pi pi-save',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        this.submitUpdate();
      }
    });
  }

  submitUpdate() {
    const payload = {
      ...this.form,
      totalPrice: this.getGrandTotal(),
      overallPrice: this.form.pricingMode === 'OVERALL' ? this.form.overallPrice : null,
      days: this.form.days.map(day => {
        const { guideNeeded, hotelNeeded, ...dayData } = day;
        return {
          ...dayData,
          hotelId: day.hotelNeeded ? day.hotelId : null,
          guideId: day.guideNeeded ? day.guideId : null,
          dailyCost: this.form.pricingMode === 'DAILY' ? day.dailyCost : null,
          costs: this.form.pricingMode === 'DAILY_ACTIVITY'
            ? day.costs.filter(c => c.name && c.price > 0)
            : []
        };
      })
    };

    this.http.put(`${environment.apiBaseUrl}/Itineraries/update/${this.itineraryId}`, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Itinerary updated successfully' });
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/itinerary-list']), 1500);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update itinerary' });
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  confirmCancel() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel? All unsaved changes will be lost.',
      header: 'Confirm Cancel',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        this.router.navigate(['/itinerary-list']);
      }
    });
  }
}
