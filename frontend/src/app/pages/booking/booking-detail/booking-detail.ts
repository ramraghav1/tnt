import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

// PrimeNG
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { StepperModule } from 'primeng/stepper';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

import { TranslateModule } from '@ngx-translate/core';

import {
    BookingService,
    ItineraryDetail,
    ItineraryDay,
    CreateBookingRequest,
    TravelerRequest,
    CustomizeDayRequest,
    DayCostEntry,
    InventoryGuide,
    InventoryVehicle,
    InventoryHotel,
    InventoryHotelRoom,
    AssignInventoryRequest
} from '../booking.service';

import { PaymentDialog } from '../payment-dialog/payment-dialog';

interface BookingCostRow {
    name: string;
    category: string;
    price: number;
    enabled: boolean;
}

interface BookingDayCosts {
    dayNumber: number;
    dayId: number;
    title: string;
    costs: BookingCostRow[];
}

interface EditableDay extends ItineraryDay {
    newActivity: string;
}

interface TravelerFormRow extends TravelerRequest {
    isAdult: boolean;
    isChild: boolean;
    isSenior: boolean;
}

@Component({
    selector: 'app-booking-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        AccordionModule,
        TagModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
        CheckboxModule,
        DatePickerModule,
        InputNumberModule,
        ChipModule,
        ToastModule,
        DividerModule,
        StepperModule,
        ProgressSpinnerModule,
        ConfirmDialog,
        PaymentDialog,
        TooltipModule,
        TranslateModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './booking-detail.html',
    styleUrls: ['./booking-detail.scss']
})
export class BookingDetail implements OnInit {
    itinerary?: ItineraryDetail;
    loading = true;
    submitting = false;

    // Editable days
    editableDays: EditableDay[] = [];
    collapsedDayMap: { [key: number]: boolean } = {};
    collapsedTravelerMap: { [key: number]: boolean } = {};

    // Booking form fields
    startDate: Date | null = null;
    endDate: Date | null = null;
    minEndDate: Date = new Date();
    specialRequests = '';

    // Booker fields
    bookerName = '';
    bookerPhone = '';
    bookerEmail = '';
    bookerAddress = '';
    iAmTraveller = false;
    bookingMode: 'single' | 'all' = 'single';

    // Single-mode pax counts
    singleAdults = 1;
    singleChildren = 0;
    singleSeniors = 0;

    // Travelers
    travelers: TravelerFormRow[] = [];

    // Simple pricing (no cost config)
    perPersonAmount = 0;

    // Overall/Daily pricing mode
    itineraryPricingMode = 'DAILY_ACTIVITY';
    overallPriceAmount = 0;

    // Pricing
    bookingDayCosts: BookingDayCosts[] = [];
    costEditMode = false;
    discountType: 'percent' | 'flat' = 'percent';
    discountValue = 0;

    // Payment dialog
    showPaymentDialog = false;
    createdBookingId = 0;
    createdBookingRef = '';

    // Inventory selection
    guides: InventoryGuide[] = [];
    vehicles: InventoryVehicle[] = [];
    hotels: InventoryHotel[] = [];
    selectedGuide: InventoryGuide | null = null;
    selectedVehicle: InventoryVehicle | null = null;
    selectedHotel: InventoryHotel | null = null;
    selectedRoomType: InventoryHotelRoom | null = null;
    inventoryLoading = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookingService: BookingService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.loading = false;
            return;
        }

        this.bookingService.getItineraryDetail(+id).subscribe({
            next: (res) => {
                this.itinerary = res;
                this.itineraryPricingMode = res.pricingMode || 'DAILY_ACTIVITY';
                this.overallPriceAmount = res.overallPrice || 0;
                this.editableDays = res.days.map((d) => ({
                    ...d,
                    activities: [...d.activities],
                    newActivity: ''
                }));
                // All days collapsed by default
                this.editableDays.forEach((_, i) => this.collapsedDayMap[i] = true);
                // Set default dates
                this.startDate = new Date();
                this.minEndDate = new Date(this.startDate);
                this.minEndDate.setDate(this.minEndDate.getDate() + 1);
                const end = new Date();
                end.setDate(end.getDate() + res.durationDays);
                this.endDate = end;
                // Add one default traveler
                this.addTraveler();
                // Build cost data from itinerary
                this.buildCostData();
                // Load inventory options
                this.loadInventory();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load itinerary details' });
                this.cdr.detectChanges();
            }
        });
    }

    // ---- Date validation ----

    onStartDateChange() {
        if (this.startDate) {
            this.minEndDate = new Date(this.startDate);
            this.minEndDate.setDate(this.minEndDate.getDate() + 1);
            // Reset end date if it's now before the new minimum
            if (this.endDate && this.endDate <= this.startDate) {
                this.endDate = null;
            }
        }
    }

    // ---- Day accordion toggle ----

    toggleDayAccordion(index: number) {
        this.collapsedDayMap[index] = !this.collapsedDayMap[index];
    }

    expandAllDays() {
        this.editableDays.forEach((_, i) => this.collapsedDayMap[i] = false);
    }

    collapseAllDays() {
        this.editableDays.forEach((_, i) => this.collapsedDayMap[i] = true);
    }

    // ---- Traveler accordion toggle ----

    toggleTravelerAccordion(index: number) {
        this.collapsedTravelerMap[index] = !this.collapsedTravelerMap[index];
    }

    expandAllTravelers() {
        this.travelers.forEach((_, i) => this.collapsedTravelerMap[i] = false);
    }

    collapseAllTravelers() {
        this.travelers.forEach((_, i) => this.collapsedTravelerMap[i] = true);
    }

    // ---- Traveler management ----

    setBookingMode(mode: 'single' | 'all') {
        this.bookingMode = mode;
        if (mode === 'all' && this.travelers.length === 0) {
            this.addTraveler();
        }
        this.cdr.detectChanges();
    }

    onIAmTravellerChange() {
        if (this.iAmTraveller) {
            if (this.travelers.length === 0) this.addTraveler();
            this.travelers[0].fullName      = this.bookerName;
            this.travelers[0].contactNumber = this.bookerPhone;
            this.travelers[0].email         = this.bookerEmail;
        }
        this.cdr.detectChanges();
    }

    onTravelerTypeChange(traveler: TravelerFormRow, type: 'adult' | 'child' | 'senior', value: boolean) {
        if (value) {
            // mutually exclusive
            if (type !== 'adult')  traveler.isAdult  = false;
            if (type !== 'child')  traveler.isChild  = false;
            if (type !== 'senior') traveler.isSenior = false;
        }
        traveler.adults   = traveler.isAdult  ? 1 : 0;
        traveler.children = traveler.isChild  ? 1 : 0;
        traveler.seniors  = traveler.isSenior ? 1 : 0;
    }

    addTraveler() {
        this.travelers.push({
            fullName: '',
            contactNumber: '',
            email: '',
            nationality: '',
            adults: 1,
            children: 0,
            seniors: 0,
            isAdult: true,
            isChild: false,
            isSenior: false
        });
        const ti = this.travelers.length - 1;
        this.collapsedTravelerMap[ti] = false;
    }

    removeTraveler(index: number) {
        this.travelers.splice(index, 1);
    }

    // ---- Activity management ----

    addActivity(day: EditableDay) {
        if (day.newActivity?.trim()) {
            day.activities.push(day.newActivity.trim());
            day.newActivity = '';
        }
    }

    removeActivity(day: EditableDay, index: number) {
        day.activities.splice(index, 1);
    }

    // ---- Difficulty tag ----

    getDifficultySeverity(level: string): 'success' | 'secondary' | 'danger' | 'info' {
        switch (level?.toLowerCase()) {
            case 'easy': return 'success';
            case 'moderate': return 'secondary';
            case 'hard': return 'danger';
            default: return 'info';
        }
    }

    // ---- Traveller count helper ----

    getTotalTravellers(): number {
        if (this.bookingMode === 'single') {
            return (this.singleAdults || 0) + (this.singleChildren || 0) + (this.singleSeniors || 0) || 1;
        }
        return this.travelers.length || 1;
    }

    // ---- Simple pricing helpers (no cost config) ----

    getSimpleDiscountAmount(): number {
        const subtotal = this.perPersonAmount * this.getTotalTravellers();
        if (this.discountType === 'percent') return subtotal * (this.discountValue || 0) / 100;
        return this.discountValue || 0;
    }

    getSimpleTotal(): number {
        return Math.max(0, this.perPersonAmount * this.getTotalTravellers() - this.getSimpleDiscountAmount());
    }

    // ---- Form validation ----

    isFormValid(): boolean {
        if (!this.startDate || !this.endDate) return false;
        if (!this.bookerName.trim()) return false;
        if (this.bookingMode === 'all') {
            if (this.travelers.length === 0) return false;
            return this.travelers.every((t) => t.fullName.trim().length > 0);
        }
        return true;
    }

    // ---- Submit booking ----

    continueBooking() {
        if (!this.itinerary) return;

        if (!this.isFormValid()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'Please fill in all required fields (start date, end date, and at least one traveler with a name).'
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Are you sure you want to create this booking for "${this.itinerary.title}"? This will reserve the itinerary for the selected dates and travelers.`,
            header: 'Confirm Booking',
            icon: 'pi pi-check-circle',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
            accept: () => {
                this.submitBooking();
            }
        });
    }

    private submitBooking() {
        this.submitting = true;

        // Build the traveller list — in single mode use booker details
        const travellerPayload: TravelerRequest[] = this.bookingMode === 'all'
            ? this.travelers
            : [{
                fullName: this.bookerName,
                contactNumber: this.bookerPhone,
                email: this.bookerEmail,
                nationality: '',
                adults: this.singleAdults,
                children: this.singleChildren,
                seniors: this.singleSeniors
            }];

        const totalAmt = this.hasCosts() ? this.getGrandTotal() : this.getSimpleTotal();

        const request: CreateBookingRequest = {
            itineraryId: this.itinerary!.id,
            startDate: this.startDate!.toISOString(),
            endDate: this.endDate!.toISOString(),
            travelers: travellerPayload,
            specialRequests: this.specialRequests,
            totalAmount: totalAmt
        };

        this.bookingService.createBooking(request).subscribe({
            next: (res) => {
                this.createdBookingId = res.instanceId;
                this.createdBookingRef = res.bookingReference || '';
                this.assignInventoryAfterBooking(res.instanceId);
            },
            error: (err) => {
                console.error(err);
                this.submitting = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to create booking. Please try again.'
                });
                this.cdr.detectChanges();
            }
        });
    }

    private assignInventoryAfterBooking(bookingId: number): void {
        const assignments = this.buildInventoryAssignments();
        if (assignments.length === 0) {
            this.onBookingCreationComplete();
            return;
        }
        forkJoin(assignments.map(req => this.bookingService.assignInventory(bookingId, req))).subscribe({
            next: () => this.onBookingCreationComplete(),
            error: () => this.onBookingCreationComplete() // non-fatal
        });
    }

    private onBookingCreationComplete(): void {
        this.submitting = false;
        this.messageService.add({
            severity: 'success',
            summary: 'Booking Created',
            detail: 'Your booking has been created successfully!'
        });
        this.cdr.detectChanges();
        this.confirmationService.confirm({
            message: 'Would you like to pay now or skip for later?',
            header: 'Payment',
            icon: 'pi pi-credit-card',
            acceptLabel: 'Pay Now',
            rejectLabel: 'Skip for Now',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
            accept: () => {
                this.showPaymentDialog = true;
                this.cdr.detectChanges();
            },
            reject: () => {
                this.router.navigate(['/my-bookings']);
            }
        });
    }

    onPaymentComplete() {
        this.showPaymentDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Payment Received', detail: 'Your booking is confirmed!' });
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/my-bookings']), 1500);
    }

    goBack() {
        this.router.navigate(['/booking-list']);
    }

    // ---- Pricing / Cost Management ----

    buildCostData() {
        if (!this.itinerary) return;

        if (this.itineraryPricingMode === 'OVERALL') {
            // For overall pricing, set per-person amount directly
            this.perPersonAmount = this.overallPriceAmount;
            this.bookingDayCosts = [];
            return;
        }

        if (this.itineraryPricingMode === 'DAILY') {
            // For daily pricing, create one cost row per day with the daily total
            this.bookingDayCosts = this.editableDays.map(day => ({
                dayNumber: day.dayNumber,
                dayId: day.id,
                title: day.title,
                costs: day.dailyCost > 0 ? [{
                    name: `Day ${day.dayNumber} Cost`,
                    category: 'Daily',
                    price: day.dailyCost,
                    enabled: true
                }] : []
            }));
            return;
        }

        // DAILY_ACTIVITY mode — existing behavior
        this.bookingDayCosts = this.editableDays.map(day => ({
            dayNumber: day.dayNumber,
            dayId: day.id,
            title: day.title,
            costs: (day.costs || []).map(c => ({
                name: c.name,
                category: c.category,
                price: c.price,
                enabled: true
            }))
        }));
    }

    toggleCostEdit() {
        this.costEditMode = !this.costEditMode;
        this.cdr.detectChanges();
    }

    addCostRow(dayIndex: number) {
        this.bookingDayCosts[dayIndex].costs.push({
            name: '',
            category: 'Other',
            price: 0,
            enabled: true
        });
    }

    removeCostRow(dayIndex: number, costIndex: number) {
        this.bookingDayCosts[dayIndex].costs.splice(costIndex, 1);
    }

    // Sync meals/activities changes to cost rows
    onMealChange(dayIndex: number, mealName: string, included: boolean) {
        const dayCost = this.bookingDayCosts[dayIndex];
        if (!dayCost) return;
        const existing = dayCost.costs.find(c => c.name.toLowerCase() === mealName.toLowerCase());
        if (included && !existing) {
            dayCost.costs.push({ name: mealName, category: 'Meal', price: 0, enabled: true });
        } else if (!included && existing) {
            const idx = dayCost.costs.indexOf(existing);
            dayCost.costs.splice(idx, 1);
        }
    }

    onActivityRemove(day: EditableDay, actIndex: number) {
        const activityName = day.activities[actIndex];
        day.activities.splice(actIndex, 1);
        // Remove matching cost row
        const dayIdx = this.editableDays.indexOf(day);
        const dayCost = this.bookingDayCosts[dayIdx];
        if (dayCost) {
            const costIdx = dayCost.costs.findIndex(c => c.name.toLowerCase() === activityName.toLowerCase());
            if (costIdx >= 0) dayCost.costs.splice(costIdx, 1);
        }
    }

    onActivityAdd(day: EditableDay) {
        if (!day.newActivity?.trim()) return;
        const name = day.newActivity.trim();
        day.activities.push(name);
        // Add matching cost row
        const dayIdx = this.editableDays.indexOf(day);
        const dayCost = this.bookingDayCosts[dayIdx];
        if (dayCost) {
            const exists = dayCost.costs.find(c => c.name.toLowerCase() === name.toLowerCase());
            if (!exists) {
                dayCost.costs.push({ name, category: 'Activity', price: 0, enabled: true });
            }
        }
        day.newActivity = '';
    }

    // Pricing calculations
    getBookingDayTotal(dayIndex: number): number {
        return this.bookingDayCosts[dayIndex]?.costs
            .filter(c => c.enabled)
            .reduce((sum, c) => sum + (c.price || 0), 0) || 0;
    }

    getSubtotal(): number {
        return this.bookingDayCosts.reduce((sum, d) =>
            sum + d.costs.filter(c => c.enabled).reduce((s, c) => s + (c.price || 0), 0), 0);
    }

    getDiscountAmount(): number {
        const subtotal = this.getSubtotal();
        if (this.discountType === 'percent') {
            return subtotal * (this.discountValue || 0) / 100;
        }
        return this.discountValue || 0;
    }

    getGrandTotal(): number {
        return Math.max(0, this.getSubtotal() - this.getDiscountAmount());
    }

    hasCosts(): boolean {
        // OVERALL mode uses simple pricing section
        if (this.itineraryPricingMode === 'OVERALL') return false;
        return this.bookingDayCosts.some(d => d.costs.length > 0);
    }

    // ===========================
    // Inventory helpers
    // ===========================

    loadInventory(): void {
        this.inventoryLoading = true;
        forkJoin({
            guides: this.bookingService.getGuides(),
            vehicles: this.bookingService.getVehicles(),
            hotels: this.bookingService.getHotels()
        }).subscribe({
            next: ({ guides, vehicles, hotels }) => {
                this.guides = guides.filter(g => g.isActive !== false);
                this.vehicles = vehicles.filter(v => v.isActive !== false);
                this.hotels = hotels.filter(h => h.isActive !== false);
                this.inventoryLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.inventoryLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    toggleGuide(guide: InventoryGuide): void {
        this.selectedGuide = this.selectedGuide?.id === guide.id ? null : guide;
    }

    toggleVehicle(vehicle: InventoryVehicle): void {
        this.selectedVehicle = this.selectedVehicle?.id === vehicle.id ? null : vehicle;
    }

    toggleHotel(hotel: InventoryHotel): void {
        if (this.selectedHotel?.id === hotel.id) {
            this.selectedHotel = null;
            this.selectedRoomType = null;
        } else {
            this.selectedHotel = hotel;
            this.selectedRoomType = null;
        }
    }

    getStars(n: number): number[] {
        return Array.from({ length: Math.min(n, 5) });
    }

    private getTripDays(): number {
        if (!this.startDate || !this.endDate) return this.itinerary?.durationDays || 1;
        const ms = this.endDate.getTime() - this.startDate.getTime();
        return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    }

    private buildInventoryAssignments(): AssignInventoryRequest[] {
        const result: AssignInventoryRequest[] = [];
        if (!this.startDate || !this.endDate) return result;
        const startStr = this.startDate.toISOString().split('T')[0];
        const endStr = this.endDate.toISOString().split('T')[0];
        const days = this.getTripDays();

        if (this.selectedGuide) {
            result.push({
                inventoryType: 'guide',
                inventoryId: this.selectedGuide.id,
                startDate: startStr,
                endDate: endStr,
                quantity: 1,
                price: this.selectedGuide.pricePerDay * days,
                notes: `Guide: ${this.selectedGuide.fullName}`
            });
        }
        if (this.selectedVehicle) {
            result.push({
                inventoryType: 'vehicle',
                inventoryId: this.selectedVehicle.id,
                startDate: startStr,
                endDate: endStr,
                quantity: 1,
                price: this.selectedVehicle.pricePerDay * days,
                notes: `Vehicle: ${this.selectedVehicle.vehicleType}${this.selectedVehicle.model ? ' ' + this.selectedVehicle.model : ''}`
            });
        }
        if (this.selectedHotel) {
            const roomPrice = this.selectedRoomType ? this.selectedRoomType.pricePerNight * days : 0;
            result.push({
                inventoryType: 'hotel',
                inventoryId: this.selectedHotel.id,
                startDate: startStr,
                endDate: endStr,
                quantity: 1,
                price: roomPrice,
                notes: this.selectedRoomType
                    ? `Hotel: ${this.selectedHotel.name}, Room: ${this.selectedRoomType.roomType}`
                    : `Hotel: ${this.selectedHotel.name}`
            });
        }
        return result;
    }
}
