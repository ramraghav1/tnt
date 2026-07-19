import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

import {
    BookingService,
    BookingDetail,
    BookingDayDetail,
    BookingTravelerDetail,
    TravelerRequest,
    UpdateBookingRequest,
    UpdateBookingDayRequest
} from '../booking.service';

interface EditableDay extends BookingDayDetail {
    newActivity: string;
}

interface EditableTraveler {
    id?: number;
    fullName: string;
    contactNumber: string;
    email: string;
    nationality: string;
    adults: number;
    children: number;
    seniors: number;
    isAdult: boolean;
    isChild: boolean;
    isSenior: boolean;
}

@Component({
    selector: 'app-edit-booking',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule,
        CheckboxModule, DatePickerModule, InputNumberModule, ChipModule, ToastModule,
        DividerModule, TagModule, ProgressSpinnerModule, ConfirmDialog, TooltipModule,
        TranslateModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './edit-booking.html',
    styleUrls: ['./edit-booking.scss']
})
export class EditBooking implements OnInit {
    booking?: BookingDetail;
    loading = true;
    submitting = false;
    instanceId = 0;

    // Editable data
    editableDays: EditableDay[] = [];
    travelers: EditableTraveler[] = [];
    startDate: Date | null = null;
    endDate: Date | null = null;
    minEndDate: Date = new Date();
    specialRequests = '';
    totalAmount = 0;

    // Accordion state
    collapsedDayMap: { [key: number]: boolean } = {};
    collapsedTravelerMap: { [key: number]: boolean } = {};

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
        if (!id) { this.loading = false; return; }
        this.instanceId = +id;
        this.loadBooking();
    }

    loadBooking(): void {
        this.loading = true;
        this.bookingService.getBookingDetail(this.instanceId).subscribe({
            next: (res) => {
                this.booking = res;
                this.mapToForm(res);
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load booking' });
                this.cdr.detectChanges();
            }
        });
    }

    private mapToForm(b: BookingDetail): void {
        // Dates
        this.startDate = b.startDate ? new Date(b.startDate) : null;
        this.endDate = b.endDate ? new Date(b.endDate) : null;
        if (this.startDate) {
            this.minEndDate = new Date(this.startDate);
            this.minEndDate.setDate(this.minEndDate.getDate() + 1);
        }
        this.specialRequests = b.specialRequests || '';
        this.totalAmount = b.totalAmount;

        // Days
        this.editableDays = (b.days || []).map(d => ({
            ...d,
            activities: [...(d.activities || [])],
            newActivity: ''
        }));
        this.editableDays.forEach((_, i) => this.collapsedDayMap[i] = true);

        // Travelers
        this.travelers = (b.travelers || []).map(t => ({
            id: t.id,
            fullName: t.fullName,
            contactNumber: t.contactNumber || '',
            email: t.email || '',
            nationality: t.nationality || '',
            adults: t.adults,
            children: t.children,
            seniors: t.seniors,
            isAdult: t.adults > 0,
            isChild: t.children > 0,
            isSenior: t.seniors > 0
        }));
        this.travelers.forEach((_, i) => this.collapsedTravelerMap[i] = false);
    }

    // ---- Day accordion ----
    toggleDay(i: number) { this.collapsedDayMap[i] = !this.collapsedDayMap[i]; }
    expandAllDays() { this.editableDays.forEach((_, i) => this.collapsedDayMap[i] = false); }
    collapseAllDays() { this.editableDays.forEach((_, i) => this.collapsedDayMap[i] = true); }

    // ---- Traveler accordion ----
    toggleTraveler(i: number) { this.collapsedTravelerMap[i] = !this.collapsedTravelerMap[i]; }
    expandAllTravelers() { this.travelers.forEach((_, i) => this.collapsedTravelerMap[i] = false); }
    collapseAllTravelers() { this.travelers.forEach((_, i) => this.collapsedTravelerMap[i] = true); }

    // ---- Traveler management ----
    addTraveler(): void {
        this.travelers.push({
            fullName: '', contactNumber: '', email: '', nationality: '',
            adults: 1, children: 0, seniors: 0,
            isAdult: true, isChild: false, isSenior: false
        });
        this.collapsedTravelerMap[this.travelers.length - 1] = false;
    }

    removeTraveler(index: number): void {
        this.travelers.splice(index, 1);
    }

    onTravelerTypeChange(t: EditableTraveler, type: 'adult' | 'child' | 'senior', value: boolean): void {
        if (value) {
            if (type !== 'adult') t.isAdult = false;
            if (type !== 'child') t.isChild = false;
            if (type !== 'senior') t.isSenior = false;
        }
        t.adults = t.isAdult ? 1 : 0;
        t.children = t.isChild ? 1 : 0;
        t.seniors = t.isSenior ? 1 : 0;
    }

    getTotalTravellers(): number {
        return this.travelers.reduce((sum, t) => sum + t.adults + t.children + t.seniors, 0) || 1;
    }

    // ---- Activity management ----
    addActivity(day: EditableDay): void {
        if (day.newActivity?.trim()) {
            day.activities.push(day.newActivity.trim());
            day.newActivity = '';
        }
    }

    removeActivity(day: EditableDay, index: number): void {
        day.activities.splice(index, 1);
    }

    // ---- Date validation ----
    onStartDateChange(): void {
        if (this.startDate) {
            this.minEndDate = new Date(this.startDate);
            this.minEndDate.setDate(this.minEndDate.getDate() + 1);
            if (this.endDate && this.endDate <= this.startDate) {
                this.endDate = null;
            }
        }
    }

    // ---- Helpers ----
    statusSeverity(s: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const map: Record<string, any> = { Confirmed: 'success', Draft: 'secondary', Pending: 'warn', Cancelled: 'danger' };
        return map[s] ?? 'secondary';
    }

    paymentSeverity(s: string): 'success' | 'warn' | 'danger' | 'secondary' {
        if (s === 'Paid') return 'success';
        if (s === 'Partial') return 'warn';
        if (s === 'Unpaid') return 'danger';
        return 'secondary';
    }

    isFormValid(): boolean {
        if (!this.startDate || !this.endDate) return false;
        if (this.travelers.length === 0) return false;
        return this.travelers.every(t => t.fullName.trim().length > 0);
    }

    // ---- Submit ----
    confirmUpdate(): void {
        if (!this.isFormValid()) {
            this.messageService.add({
                severity: 'warn', summary: 'Validation',
                detail: 'Please fill in all required fields (dates, at least one traveler with a name).'
            });
            return;
        }

        this.confirmationService.confirm({
            message: 'Are you sure you want to update this booking? Only this booking instance will be modified — the original itinerary template and other bookings are not affected.',
            header: 'Confirm Update',
            icon: 'pi pi-save',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
            accept: () => this.submitUpdate()
        });
    }

    private submitUpdate(): void {
        this.submitting = true;

        const request: UpdateBookingRequest = {
            startDate: this.startDate!.toISOString(),
            endDate: this.endDate!.toISOString(),
            specialRequests: this.specialRequests,
            totalAmount: this.totalAmount,
            travelers: this.travelers.map(t => ({
                fullName: t.fullName,
                contactNumber: t.contactNumber,
                email: t.email,
                nationality: t.nationality,
                adults: t.adults,
                children: t.children,
                seniors: t.seniors
            })),
            days: this.editableDays.map(d => ({
                id: d.id,
                title: d.title || '',
                location: d.location || '',
                accommodation: d.accommodation || '',
                transport: d.transport || '',
                breakfastIncluded: d.breakfastIncluded,
                lunchIncluded: d.lunchIncluded,
                dinnerIncluded: d.dinnerIncluded,
                activities: d.activities
            }))
        };

        this.bookingService.updateBooking(this.instanceId, request).subscribe({
            next: () => {
                this.submitting = false;
                this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Booking updated successfully!' });
                this.cdr.detectChanges();
                setTimeout(() => this.router.navigate(['/manage-bookings']), 1200);
            },
            error: (err) => {
                this.submitting = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to update booking.' });
                this.cdr.detectChanges();
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/manage-bookings']);
    }
}
