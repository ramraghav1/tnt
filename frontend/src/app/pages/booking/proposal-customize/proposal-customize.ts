import { Component, OnInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG
import { FluidModule } from 'primeng/fluid';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services
import { BookingService, ItineraryDetail, DayCostEntry } from '../booking.service';
import { ProposalService, CreateProposalRequest } from '../proposal.service';
import { LeadCrmService } from '../../../shared/services/lead-crm.service';

type PricingMode = 'OVERALL' | 'DAILY' | 'DAILY_ACTIVITY';

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
    selector: 'app-proposal-customize',
    standalone: true,
    imports: [
        FormsModule, FluidModule, InputTextModule, ButtonModule, SelectModule, TextareaModule,
        MultiSelectModule, CheckboxModule, RadioButtonModule, CommonModule, Toast, ConfirmDialog,
        ProgressSpinnerModule, TooltipModule, DatePickerModule
    ],
    providers: [MessageService, ConfirmationService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './proposal-customize.html',
    styleUrls: ['./proposal-customize.scss']
})
export class ProposalCustomize implements OnInit {
    itinerary?: ItineraryDetail;
    loading = true;
    sending = false;

    // Traveler info
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

    // Resend mode
    proposalId: number | null = null;
    isResendMode = false;

    // Lead context (passed from lead workspace)
    leadId: number | null = null;

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
        private route: ActivatedRoute,
        public router: Router,
        private bookingService: BookingService,
        private proposalService: ProposalService,
        private leadCrmService: LeadCrmService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Scroll to top (fixes stuck scroll when redirected from itinerary builder)
        window.scrollTo(0, 0);

        const itineraryId = this.route.snapshot.paramMap.get('itineraryId');
        const proposalIdParam = this.route.snapshot.queryParamMap.get('proposalId');
        const leadIdParam = this.route.snapshot.queryParamMap.get('leadId');
        if (leadIdParam) this.leadId = +leadIdParam;

        if (proposalIdParam) {
            this.proposalId = +proposalIdParam;
            this.isResendMode = true;
            this.loadProposalForResend();
        } else if (itineraryId) {
            this.loadItinerary(+itineraryId);
        } else {
            this.loading = false;
        }
    }

    // ===== DATA LOADING =====

    private loadProposalForResend(): void {
        this.proposalService.getProposalById(this.proposalId!).subscribe({
            next: (proposal) => {
                this.travelerName = proposal.travelerName;
                this.travelerEmail = proposal.travelerEmail;
                this.travelerPhone = proposal.travelerPhone || '';
                this.startDate = new Date(proposal.startDate);
                this.endDate = new Date(proposal.endDate);
                this.notes = proposal.notes || '';

                this.bookingService.getItineraryDetail(proposal.itineraryId).subscribe({
                    next: (res) => {
                        this.itinerary = res;
                        this.buildFormFromProposal(res, proposal.days);
                        this.loading = false;
                        this.cdr.detectChanges();
                    },
                    error: () => {
                        this.loading = false;
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load itinerary.' });
                    }
                });
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load proposal.' });
            }
        });
    }

    private loadItinerary(id: number): void {
        this.bookingService.getItineraryDetail(id).subscribe({
            next: (res) => {
                this.itinerary = res;
                this.buildFormFromItinerary(res);
                this.startDate = new Date();
                const end = new Date();
                end.setDate(end.getDate() + Math.max(res.durationDays - 1, 0));
                this.endDate = end;
                this.loading = false;

                // Pre-fill traveler info from lead if leadId is present
                if (this.leadId) {
                    this.leadCrmService.getLead(this.leadId).subscribe({
                        next: (lead) => {
                            if (!this.travelerName) this.travelerName = lead.name || '';
                            if (!this.travelerEmail) this.travelerEmail = lead.email || '';
                            if (!this.travelerPhone) this.travelerPhone = lead.phone || '';
                            if (lead.travelDateFrom) this.startDate = new Date(lead.travelDateFrom);
                            if (lead.travelDateTo) this.endDate = new Date(lead.travelDateTo);
                            this.cdr.detectChanges();
                        }
                    });
                }

                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load itinerary.' });
            }
        });
    }

    private buildFormFromItinerary(res: ItineraryDetail): void {
        this.form = {
            title: res.title || '',
            description: res.description || '',
            durationDays: res.durationDays || 0,
            difficultyLevel: res.difficultyLevel || '',
            pricingMode: (res.pricingMode as PricingMode) || 'OVERALL',
            overallPrice: res.overallPrice || 0,
            days: (res.days || []).map(d => ({
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
                costs: (d.costs || []).map(c => ({ name: c.name || '', category: c.category || '', price: c.price || 0 })),
                dailyCost: d.dailyCost || 0
            }))
        };
        this.collapsedDays = this.form.days.map(() => true);
        this.showPricing = this.form.days.map(d => d.costs.length > 0);
    }

    private buildFormFromProposal(res: ItineraryDetail, proposalDays: any[]): void {
        this.form = {
            title: res.title || '',
            description: res.description || '',
            durationDays: proposalDays.length || res.durationDays || 0,
            difficultyLevel: res.difficultyLevel || '',
            pricingMode: (res.pricingMode as PricingMode) || 'OVERALL',
            overallPrice: res.overallPrice || 0,
            days: proposalDays.map(d => ({
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
                costs: [],
                dailyCost: d.dailyCost || 0
            }))
        };
        this.collapsedDays = this.form.days.map(() => true);
        this.showPricing = this.form.days.map(() => false);
    }

    // ===== DATE HANDLING =====

    onStartDateChange(): void {
        if (this.startDate) {
            const min = new Date(this.startDate);
            min.setDate(min.getDate() + Math.max(this.form.days.length - 1, 0));
            this.minEndDate = min;
            const auto = new Date(this.startDate);
            auto.setDate(auto.getDate() + Math.max(this.form.days.length - 1, 0));
            this.endDate = auto;
        }
    }

    // ===== DAY MANAGEMENT =====

    addDay(): void {
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

    removeDay(index: number): void {
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

    toggleDay(index: number): void {
        this.collapsedDays[index] = !this.collapsedDays[index];
    }

    expandAllDays(): void {
        this.collapsedDays = this.collapsedDays.map(() => false);
    }

    collapseAllDays(): void {
        this.collapsedDays = this.collapsedDays.map(() => true);
    }

    // ===== MERGE DAYS =====

    mergeWithUp(index: number): void {
        if (index <= 0) return;
        const currentDay = this.form.days[index];
        const targetDay = this.form.days[index - 1];
        this.confirmationService.confirm({
            message: `Merge Day ${currentDay.dayNumber} into Day ${targetDay.dayNumber}? Activities, locations, and costs will be combined.`,
            header: 'Merge Days',
            icon: 'pi pi-arrows-v',
            acceptButtonStyleClass: 'p-button-warning',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
            accept: () => this.performMerge(index - 1, index)
        });
    }

    mergeWithDown(index: number): void {
        if (index >= this.form.days.length - 1) return;
        const currentDay = this.form.days[index];
        const targetDay = this.form.days[index + 1];
        this.confirmationService.confirm({
            message: `Merge Day ${targetDay.dayNumber} into Day ${currentDay.dayNumber}? Activities, locations, and costs will be combined.`,
            header: 'Merge Days',
            icon: 'pi pi-arrows-v',
            acceptButtonStyleClass: 'p-button-warning',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
            accept: () => this.performMerge(index, index + 1)
        });
    }

    private performMerge(targetIndex: number, sourceIndex: number): void {
        const target = this.form.days[targetIndex];
        const source = this.form.days[sourceIndex];

        // Merge title
        if (source.title) {
            target.title = target.title ? `${target.title} + ${source.title}` : source.title;
        }

        // Merge description
        if (source.description) {
            target.description = target.description ? `${target.description}\n${source.description}` : source.description;
        }

        // Merge location
        if (source.location) {
            if (!target.location) target.location = source.location;
            else if (target.location !== source.location) target.location = `${target.location} → ${source.location}`;
        }

        // Merge accommodation
        if (!target.accommodation && source.accommodation) {
            target.accommodation = source.accommodation;
        } else if (target.accommodation && source.accommodation && target.accommodation !== source.accommodation) {
            target.accommodation = `${target.accommodation} / ${source.accommodation}`;
        }

        // Merge transport
        if (source.transport) {
            if (!target.transport) target.transport = source.transport;
            else if (target.transport !== source.transport) target.transport = `${target.transport}, ${source.transport}`;
        }

        // Merge meals (OR logic)
        target.breakfastIncluded = target.breakfastIncluded || source.breakfastIncluded;
        target.lunchIncluded = target.lunchIncluded || source.lunchIncluded;
        target.dinnerIncluded = target.dinnerIncluded || source.dinnerIncluded;

        // Merge activities (union)
        const activitySet = new Set([...target.activities, ...source.activities]);
        target.activities = Array.from(activitySet);

        // Merge costs (sum duplicates)
        if (source.costs.length > 0) {
            const costMap = new Map<string, DayCostEntry>();
            for (const c of target.costs) costMap.set(c.name, { ...c });
            for (const c of source.costs) {
                if (costMap.has(c.name)) costMap.get(c.name)!.price += c.price;
                else costMap.set(c.name, { ...c });
            }
            target.costs = Array.from(costMap.values());
        }

        // Sum daily costs
        target.dailyCost = (target.dailyCost || 0) + (source.dailyCost || 0);

        // Remove source day
        this.form.days.splice(sourceIndex, 1);
        this.collapsedDays.splice(sourceIndex, 1);
        this.showPricing.splice(sourceIndex, 1);
        this.renumberDays();

        // Expand merged day
        this.collapsedDays[targetIndex] = false;
        if (target.costs.length > 0) this.showPricing[targetIndex] = true;

        this.messageService.add({ severity: 'success', summary: 'Days Merged', detail: `Combined into Day ${target.dayNumber} successfully` });
    }

    private renumberDays(): void {
        this.form.days.forEach((day, i) => day.dayNumber = i + 1);
        this.form.durationDays = this.form.days.length;
    }

    // ===== PRICING =====

    togglePricing(index: number): void {
        this.showPricing[index] = !this.showPricing[index];
        if (this.showPricing[index] && this.form.days[index].costs.length === 0) {
            this.form.days[index].costs = this.predefinedCosts.map(c => ({ name: c.name, category: c.category, price: 0 }));
        }
    }

    addCustomCost(dayIndex: number): void {
        this.form.days[dayIndex].costs.push({ name: '', category: 'Other', price: 0 });
    }

    removeCost(dayIndex: number, costIndex: number): void {
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
            case 'OVERALL': return this.form.overallPrice || 0;
            case 'DAILY': return this.getDailyCostTotal();
            case 'DAILY_ACTIVITY': return this.form.days.reduce((sum, day) => sum + day.costs.reduce((s, c) => s + (c.price || 0), 0), 0);
            default: return 0;
        }
    }

    private getDayCost(day: ItineraryDayForm): number {
        switch (this.form.pricingMode) {
            case 'OVERALL':
                return this.form.days.length > 0 ? Math.round((this.form.overallPrice || 0) / this.form.days.length) : 0;
            case 'DAILY':
                return day.dailyCost || 0;
            case 'DAILY_ACTIVITY':
                return day.costs.reduce((sum, c) => sum + (c.price || 0), 0);
            default:
                return 0;
        }
    }

    // ===== SUBMIT =====

    confirmSend(): void {
        if (!this.form.title || this.form.days.length === 0) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill the itinerary title and add at least one day.' });
            return;
        }
        if (!this.travelerName || !this.travelerEmail) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill traveler name and email.' });
            return;
        }
        if (!this.startDate) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a start date.' });
            return;
        }

        this.confirmationService.confirm({
            message: `${this.isResendMode ? 'Re-send' : 'Send'} a customized quotation to ${this.travelerName} (${this.travelerEmail})? The original itinerary will NOT be modified.`,
            header: this.isResendMode ? 'Confirm Re-send' : 'Confirm Send Quotation',
            icon: 'pi pi-send',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
            accept: () => this.submitProposal()
        });
    }

    private submitProposal(): void {
        this.sending = true;

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
            itineraryId: this.itinerary!.id,
            leadId: this.leadId || undefined,
            travelerName: this.travelerName,
            travelerEmail: this.travelerEmail,
            travelerPhone: this.travelerPhone || undefined,
            startDate: this.formatDate(this.startDate!),
            endDate: this.formatDate(end),
            totalAmount: this.getGrandTotal(),
            notes: this.notes || undefined,
            days: proposalDays
        };

        const obs = this.isResendMode && this.proposalId
            ? this.proposalService.resendProposal(this.proposalId, request)
            : this.proposalService.createProposal(request);

        obs.subscribe({
            next: () => {
                this.sending = false;
                this.messageService.add({
                    severity: 'success',
                    summary: this.isResendMode ? 'Proposal Re-sent!' : 'Proposal Sent!',
                    detail: `Quotation sent to ${this.travelerEmail}. The traveler can view, accept and pay online.`,
                    life: 5000
                });
                this.cdr.detectChanges();
                // Navigate back to lead workspace if from lead context, else proposals list
                const target = this.leadId
                    ? ['/sales/leads', this.leadId]
                    : ['/proposals'];
                const extras = this.leadId ? { queryParams: { tab: 'proposals' } } : {};
                setTimeout(() => this.router.navigate(target, extras), 2000);
            },
            error: (err) => {
                this.sending = false;
                const detail = err?.status === 401
                    ? 'Session expired. Please login again.'
                    : err?.error?.detail || err?.error?.message || 'Failed to send. Please try again.';
                this.messageService.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
                this.cdr.detectChanges();
            }
        });
    }

    private formatDate(d: Date): string {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    goBack(): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to go back? All unsaved changes will be lost.',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
            accept: () => this.router.navigate(['/proposals'])
        });
    }
}
