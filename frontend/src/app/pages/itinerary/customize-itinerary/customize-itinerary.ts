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
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { DatePickerModule } from 'primeng/datepicker';
import { ProposalService, CreateProposalRequest } from '../../booking/proposal.service';
import { environment } from '../../../../environments/environment';

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
    selector: 'app-customize-itinerary',
    standalone: true,
    imports: [
        FormsModule, FluidModule, InputTextModule, ButtonModule, SelectModule, TextareaModule,
        MultiSelectModule, CheckboxModule, RadioButtonModule, CommonModule, Toast, ConfirmDialog,
        ProgressSpinnerModule, TooltipModule, MenuModule, DatePickerModule
    ],
    providers: [MessageService, ConfirmationService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './customize-itinerary.html',
    styleUrls: ['./customize-itinerary.scss']
})
export class CustomizeItinerary implements OnInit {
    itineraryId!: number;
    loading = true;
    sending = false;

    // Traveler / Booking person info
    travelerName = '';
    travelerEmail = '';
    travelerPhone = '';
    startDate: Date | null = null;
    endDate: Date | null = null;
    notes = '';
    minEndDate: Date | null = null;
    today = new Date();

    form: ItineraryForm = {
        title: '',
        description: '',
        durationDays: 0,
        difficultyLevel: '',
        pricingMode: 'OVERALL',
        overallPrice: 0,
        days: []
    };

    // Keep the original title for display
    originalItineraryTitle = '';

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
        public router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private proposalService: ProposalService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.itineraryId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadItinerary();
    }

    onStartDateChange() {
        if (this.startDate) {
            const min = new Date(this.startDate);
            min.setDate(min.getDate() + Math.max(this.form.days.length - 1, 0));
            this.minEndDate = min;
            // Auto-set end date based on days count
            const auto = new Date(this.startDate);
            auto.setDate(auto.getDate() + Math.max(this.form.days.length - 1, 0));
            this.endDate = auto;
        }
    }

    loadItinerary() {
        this.loading = true;
        this.http.get<any>(`${environment.apiBaseUrl}/Itineraries/detail?id=${this.itineraryId}`)
            .subscribe({
                next: (data) => {
                    this.originalItineraryTitle = data.title || '';
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
                            dailyCost: d.dailyCost || 0
                        }))
                    };

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

    // ===== DAY MANAGEMENT =====

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
            dailyCost: 0
        });

        this.collapsedDays.push(false);
        this.showPricing.push(false);
        this.form.durationDays = this.form.days.length;

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
                this.renumberDays();
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

    // ===== MERGE DAYS =====

    /**
     * Merge current day with the day above (index - 1).
     * Combines activities, locations, costs, etc. into the upper day and removes the current day.
     */
    mergeWithUp(index: number) {
        if (index <= 0) return;

        const currentDay = this.form.days[index];
        const targetDay = this.form.days[index - 1];

        this.confirmationService.confirm({
            message: `Merge Day ${currentDay.dayNumber} into Day ${targetDay.dayNumber}? Activities, locations, and costs will be combined.`,
            header: 'Merge Days',
            icon: 'pi pi-arrows-v',
            acceptButtonStyleClass: 'p-button-warning',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
            accept: () => {
                this.performMerge(index - 1, index);
            }
        });
    }

    /**
     * Merge current day with the day below (index + 1).
     * Combines activities, locations, costs, etc. into the current day and removes the lower day.
     */
    mergeWithDown(index: number) {
        if (index >= this.form.days.length - 1) return;

        const currentDay = this.form.days[index];
        const targetDay = this.form.days[index + 1];

        this.confirmationService.confirm({
            message: `Merge Day ${targetDay.dayNumber} into Day ${currentDay.dayNumber}? Activities, locations, and costs will be combined.`,
            header: 'Merge Days',
            icon: 'pi pi-arrows-v',
            acceptButtonStyleClass: 'p-button-warning',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
            accept: () => {
                this.performMerge(index, index + 1);
            }
        });
    }

    /**
     * Core merge logic: merge sourceIndex day INTO targetIndex day, then remove sourceIndex.
     */
    private performMerge(targetIndex: number, sourceIndex: number) {
        const target = this.form.days[targetIndex];
        const source = this.form.days[sourceIndex];

        // Merge title: combine if both have titles
        if (source.title) {
            target.title = target.title
                ? `${target.title} + ${source.title}`
                : source.title;
        }

        // Merge description: combine with newline
        if (source.description) {
            target.description = target.description
                ? `${target.description}\n${source.description}`
                : source.description;
        }

        // Merge location: combine with " → " if different
        if (source.location) {
            if (!target.location) {
                target.location = source.location;
            } else if (target.location !== source.location) {
                target.location = `${target.location} → ${source.location}`;
            }
        }

        // Merge accommodation: keep target if present, else use source
        if (!target.accommodation && source.accommodation) {
            target.accommodation = source.accommodation;
        } else if (target.accommodation && source.accommodation && target.accommodation !== source.accommodation) {
            target.accommodation = `${target.accommodation} / ${source.accommodation}`;
        }

        // Merge transport: combine
        if (source.transport) {
            if (!target.transport) {
                target.transport = source.transport;
            } else if (target.transport !== source.transport) {
                target.transport = `${target.transport}, ${source.transport}`;
            }
        }

        // Merge meals: OR logic (if either day has it, merged day has it)
        target.breakfastIncluded = target.breakfastIncluded || source.breakfastIncluded;
        target.lunchIncluded = target.lunchIncluded || source.lunchIncluded;
        target.dinnerIncluded = target.dinnerIncluded || source.dinnerIncluded;

        // Merge activities: union of both (no duplicates)
        const activitySet = new Set([...target.activities, ...source.activities]);
        target.activities = Array.from(activitySet);

        // Merge costs: combine all costs, sum duplicates by name
        if (source.costs.length > 0) {
            const costMap = new Map<string, DayCostEntry>();
            for (const c of target.costs) {
                costMap.set(c.name, { ...c });
            }
            for (const c of source.costs) {
                if (costMap.has(c.name)) {
                    costMap.get(c.name)!.price += c.price;
                } else {
                    costMap.set(c.name, { ...c });
                }
            }
            target.costs = Array.from(costMap.values());
        }

        // Merge dailyCost: sum
        target.dailyCost = (target.dailyCost || 0) + (source.dailyCost || 0);

        // Remove source day
        this.form.days.splice(sourceIndex, 1);
        this.collapsedDays.splice(sourceIndex, 1);
        this.showPricing.splice(sourceIndex, 1);

        // Renumber and update
        this.renumberDays();

        // Expand the merged target day so user can see the result
        this.collapsedDays[targetIndex] = false;
        if (target.costs.length > 0) {
            this.showPricing[targetIndex] = true;
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Days Merged',
            detail: `Combined into Day ${target.dayNumber} successfully`
        });
    }

    private renumberDays() {
        this.form.days.forEach((day, i) => day.dayNumber = i + 1);
        this.form.durationDays = this.form.days.length;
    }

    // ===== PRICING =====

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

    // ===== SAVE & SEND QUOTATION =====

    confirmSave() {
        if (!this.form.title || this.form.days.length === 0) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill the itinerary title and add at least one day' });
            return;
        }
        if (!this.travelerName || !this.travelerEmail) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill traveler name and email' });
            return;
        }
        if (!this.startDate) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a start date' });
            return;
        }

        this.confirmationService.confirm({
            message: `Send a customized quotation to ${this.travelerName} (${this.travelerEmail})? The original itinerary will NOT be modified.`,
            header: 'Confirm Send Quotation',
            icon: 'pi pi-send',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
            accept: () => {
                this.submitQuotation();
            }
        });
    }

    submitQuotation() {
        this.sending = true;

        // Build proposal days from customized form
        const proposalDays = this.form.days.map(day => ({
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description,
            location: day.location,
            accommodation: day.accommodation,
            transport: day.transport,
            breakfastIncluded: day.breakfastIncluded,
            lunchIncluded: day.lunchIncluded,
            dinnerIncluded: day.dinnerIncluded,
            activities: day.activities,
            dailyCost: this.getDayCost(day)
        }));

        // Calculate end date if not set
        const end = this.endDate || (() => {
            const d = new Date(this.startDate!);
            d.setDate(d.getDate() + Math.max(this.form.days.length - 1, 0));
            return d;
        })();

        const request: CreateProposalRequest = {
            itineraryId: this.itineraryId,
            travelerName: this.travelerName,
            travelerEmail: this.travelerEmail,
            travelerPhone: this.travelerPhone || undefined,
            startDate: this.formatDate(this.startDate!),
            endDate: this.formatDate(end),
            totalAmount: this.getGrandTotal(),
            notes: this.notes || undefined,
            days: proposalDays
        };

        this.proposalService.createProposal(request).subscribe({
            next: (response) => {
                this.sending = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Quotation Sent!',
                    detail: `Quotation sent to ${this.travelerEmail}. The traveler can view, accept and pay online.`,
                    life: 5000
                });
                this.cdr.detectChanges();
                setTimeout(() => this.router.navigate(['/proposals']), 2000);
            },
            error: (err) => {
                this.sending = false;
                const detail = err?.status === 401
                    ? 'Session expired. Please login again and retry.'
                    : err?.error?.detail || err?.error?.message || 'Failed to send quotation. Please try again.';
                this.messageService.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
                console.error('Quotation send error:', err);
                this.cdr.detectChanges();
            }
        });
    }

    /** Get daily cost for a day depending on pricing mode */
    private getDayCost(day: ItineraryDayForm): number {
        switch (this.form.pricingMode) {
            case 'OVERALL':
                // Distribute overall price equally across days
                return this.form.days.length > 0 ? Math.round((this.form.overallPrice || 0) / this.form.days.length) : 0;
            case 'DAILY':
                return day.dailyCost || 0;
            case 'DAILY_ACTIVITY':
                return day.costs.reduce((sum, c) => sum + (c.price || 0), 0);
            default:
                return 0;
        }
    }

    private formatDate(d: Date): string {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    goBack() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to go back? All unsaved changes will be lost.',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
            accept: () => {
                this.router.navigate(['/customize-itinerary-list']);
            }
        });
    }
}
