import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { DatePicker } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

import {
    DepartureManagementService,
    BookingGroupByItinerary,
    UnassignedBookingItem,
    SuggestedDepartureItem,
    CreateDepartureRequest,
    DepartureDetailResponse,
    DateSubGroup
} from '../departure-management.service';
import { InventoryService, Guide, Vehicle } from '../../inventory/inventory.service';

/** A row in the flat table: either a date-separator header or a booking */
export type TableRow =
    | { type: 'date-header'; subGroup: DateSubGroup; booking?: undefined }
    | { type: 'booking'; booking: UnassignedBookingItem; subGroup: DateSubGroup };

@Component({
    selector: 'app-manage-bookings',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        DialogModule,
        TagModule,
        TooltipModule,
        PanelModule,
        AccordionModule,
        InputTextModule,
        InputNumberModule,
        Select,
        CheckboxModule,
        ProgressSpinnerModule,
        MessageModule,
        DatePicker,
        TextareaModule,
        DividerModule,
        TranslateModule
    ],
    providers: [MessageService],
    templateUrl: './manage-bookings.html'
})
export class ManageBookings implements OnInit {
    // ── Data ──────────────────────────────────────────────────────
    groups: BookingGroupByItinerary[] = [];
    /** Map of itineraryId → DateSubGroup[] for date-based sub-grouping */
    dateSubGroups: Map<number, DateSubGroup[]> = new Map();
    /** Flat table rows per itinerary: date-separator rows + booking rows */
    tableRows: Map<number, TableRow[]> = new Map();
    guides: Guide[] = [];
    vehicles: Vehicle[] = [];
    loading = false;

    // ── Selection ─────────────────────────────────────────────────
    selectedGroup: BookingGroupByItinerary | null = null;
    selectedBookings: UnassignedBookingItem[] = [];

    // ── Departure dialog ───────────────────────────────────────────
    showDepartureDialog = false;
    suggestions: SuggestedDepartureItem[] = [];
    loadingSuggestions = false;
    selectedSuggestion: SuggestedDepartureItem | null = null;
    mode: 'new' | 'assign' = 'new';

    newDeparture: CreateDepartureRequest = this.blankDeparture();
    dateRange: Date[] = [];
    startDateObj: Date | null = null;
    endDateObj: Date | null = null;

    // ── Result dialog ──────────────────────────────────────────────
    showSuccessDialog = false;
    createdDeparture: DepartureDetailResponse | null = null;

    constructor(
        private svc: DepartureManagementService,
        private inventorySvc: InventoryService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadData();
    }

    // ── LOAD ──────────────────────────────────────────────────────
    loadData(): void {
        this.loading = true;
        this.svc.getUnassignedBookings().subscribe({
            next: (data) => {
                this.groups = data;
                this.buildDateSubGroups();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load bookings' }); }
        });
        this.inventorySvc.getGuides().subscribe({ next: (g) => { this.guides = g; } });
        this.inventorySvc.getVehicles().subscribe({ next: (v) => { this.vehicles = v; } });
    }

    /** Build date-based sub-groups within each itinerary group */
    private buildDateSubGroups(): void {
        this.dateSubGroups = new Map();
        this.tableRows = new Map();
        for (const group of this.groups) {
            const map = new Map<string, UnassignedBookingItem[]>();
            for (const b of group.bookings) {
                const key = b.startDate ? b.startDate.split('T')[0] : 'unset';
                if (!map.has(key)) map.set(key, []);
                map.get(key)!.push(b);
            }
            const subGroups: DateSubGroup[] = Array.from(map.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, bookings]) => ({
                    startDate: date,
                    bookings,
                    totalPersons: bookings.reduce((s, bk) => s + bk.totalPerson, 0)
                }));
            this.dateSubGroups.set(group.itineraryId, subGroups);

            // Build flat table rows: date-separator + booking rows
            const rows: TableRow[] = [];
            for (const sub of subGroups) {
                rows.push({ type: 'date-header', subGroup: sub });
                for (const bk of sub.bookings) {
                    rows.push({ type: 'booking', booking: bk, subGroup: sub });
                }
            }
            this.tableRows.set(group.itineraryId, rows);
        }
    }

    getTableRows(group: BookingGroupByItinerary): TableRow[] {
        return this.tableRows.get(group.itineraryId) ?? [];
    }

    getDateSubGroups(group: BookingGroupByItinerary): DateSubGroup[] {
        return this.dateSubGroups.get(group.itineraryId) ?? [];
    }

    /** Navigate to edit-booking page */
    editBooking(booking: UnassignedBookingItem, event: Event): void {
        event.stopPropagation();
        this.router.navigate(['/edit-booking', booking.instanceId]);
    }

    /** Select all bookings in a date sub-group */
    toggleDateGroup(subGroup: DateSubGroup): void {
        const allSelected = subGroup.bookings.every(b => this.isBookingSelected(b));
        if (allSelected) {
            this.selectedBookings = this.selectedBookings.filter(s => !subGroup.bookings.some(b => b.instanceId === s.instanceId));
        } else {
            subGroup.bookings.forEach(b => { if (!this.isBookingSelected(b)) this.selectedBookings.push(b); });
        }
    }

    isDateGroupFullySelected(subGroup: DateSubGroup): boolean {
        return subGroup.bookings.length > 0 && subGroup.bookings.every(b => this.isBookingSelected(b));
    }

    isDateGroupPartiallySelected(subGroup: DateSubGroup): boolean {
        const count = subGroup.bookings.filter(b => this.isBookingSelected(b)).length;
        return count > 0 && count < subGroup.bookings.length;
    }

    // ── SELECTION ─────────────────────────────────────────────────
    get totalSelectedPersons(): number {
        return this.selectedBookings.reduce((s, b) => s + b.totalPerson, 0);
    }

    get currentSelectedGroup(): BookingGroupByItinerary | null {
        if (this.selectedBookings.length === 0) return null;
        const firstId = this.selectedBookings[0].itineraryId;
        return this.groups.find(g => g.itineraryId === firstId) ?? null;
    }

    isBookingSelected(b: UnassignedBookingItem): boolean {
        return this.selectedBookings.some(s => s.instanceId === b.instanceId);
    }

    toggleBooking(b: UnassignedBookingItem): void {
        const idx = this.selectedBookings.findIndex(s => s.instanceId === b.instanceId);
        idx >= 0 ? this.selectedBookings.splice(idx, 1) : this.selectedBookings.push(b);
    }

    toggleAllInGroup(group: BookingGroupByItinerary): void {
        const allSelected = group.bookings.every(b => this.isBookingSelected(b));
        if (allSelected) {
            this.selectedBookings = this.selectedBookings.filter(s => !group.bookings.some(b => b.instanceId === s.instanceId));
        } else {
            group.bookings.forEach(b => { if (!this.isBookingSelected(b)) this.selectedBookings.push(b); });
        }
    }

    isGroupFullySelected(group: BookingGroupByItinerary): boolean {
        return group.bookings.length > 0 && group.bookings.every(b => this.isBookingSelected(b));
    }

    hasAnySelected(group: BookingGroupByItinerary): boolean {
        return group.bookings.some(b => this.isBookingSelected(b));
    }

    isGroupPartiallySelected(group: BookingGroupByItinerary): boolean {
        const count = group.bookings.filter(b => this.isBookingSelected(b)).length;
        return count > 0 && count < group.bookings.length;
    }

    // ── OPEN MANAGE DIALOG ────────────────────────────────────────
    openManageDialog(group: BookingGroupByItinerary): void {
        if (this.selectedBookings.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'No Selection', detail: 'Select at least one booking first.' });
            return;
        }
        const ids = this.selectedBookings.map(b => b.itineraryId);
        const allSameItinerary = ids.every(id => id === group.itineraryId);
        if (!allSameItinerary) {
            this.messageService.add({ severity: 'warn', summary: 'Mixed Itineraries', detail: 'Please select bookings from the same itinerary only.' });
            return;
        }
        this.selectedGroup = group;
        this.newDeparture = this.blankDeparture();
        this.newDeparture.itineraryId = group.itineraryId;
        this.newDeparture.capacity = this.totalSelectedPersons;
        this.dateRange = [];
        this.startDateObj = null;
        this.endDateObj = null;
        this.selectedSuggestion = null;
        this.mode = 'new';
        this.loadSuggestions(group.itineraryId);
        this.showDepartureDialog = true;
    }

    // ── SUGGESTIONS ───────────────────────────────────────────────
    loadSuggestions(itineraryId: number): void {
        this.loadingSuggestions = true;
        this.suggestions = [];
        this.svc.getSuggestedDepartures(itineraryId, this.totalSelectedPersons).subscribe({
            next: (s) => { this.suggestions = s; this.loadingSuggestions = false; this.cdr.detectChanges(); },
            error: () => { this.loadingSuggestions = false; }
        });
    }

    selectSuggestion(s: SuggestedDepartureItem): void {
        this.selectedSuggestion = this.selectedSuggestion?.id === s.id ? null : s;
        this.mode = this.selectedSuggestion ? 'assign' : 'new';
    }

    // ── DATE PICKERS ──────────────────────────────────────────
    onStartDateSelect(date: Date): void {
        this.newDeparture.startDate = this.toIsoDate(date);
        // clear end date if it's before the new start
        if (this.endDateObj && this.endDateObj < date) {
            this.endDateObj = null;
            this.newDeparture.endDate = '';
        }
    }

    onEndDateSelect(date: Date): void {
        this.newDeparture.endDate = this.toIsoDate(date);
    }

    private toIsoDate(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    // ── CONFIRM ───────────────────────────────────────────────────
    confirm(): void {
        if (this.mode === 'assign' && this.selectedSuggestion) {
            this.loading = true;
            this.svc.assignBookings({
                departureId: this.selectedSuggestion.id,
                bookingIds:  this.selectedBookings.map(b => b.instanceId)
            }).subscribe({
                next: (dep) => this.onSuccess(dep),
                error: (err) => this.onError(err)
            });
        } else {
            if (!this.newDeparture.startDate || !this.newDeparture.endDate) {
                this.messageService.add({ severity: 'warn', summary: 'Dates Required', detail: 'Please select a start and end date.' });
                return;
            }
            this.newDeparture.bookingIds = this.selectedBookings.map(b => b.instanceId);
            this.loading = true;
            this.svc.createDeparture(this.newDeparture).subscribe({
                next: (dep) => this.onSuccess(dep),
                error: (err) => this.onError(err)
            });
        }
    }

    private onSuccess(dep: DepartureDetailResponse): void {
        this.createdDeparture = dep;
        this.showDepartureDialog = false;
        this.showSuccessDialog = true;
        this.selectedBookings = [];
        this.selectedGroup = null;
        this.loading = false;
        this.loadData();
        this.messageService.add({ severity: 'success', summary: 'Done', detail: 'Departure created & traveler(s) notified.' });
        this.cdr.detectChanges();
    }

    private onError(err: any): void {
        this.loading = false;
        const msg = err?.error?.message ?? 'An error occurred.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
        this.cdr.detectChanges();
    }

    // ── HELPERS ───────────────────────────────────────────────────
    blankDeparture(): CreateDepartureRequest {
        return { itineraryId: 0, startDate: '', endDate: '', capacity: 1, bookingIds: [], packagePrice: 0, notes: '' };
    }

    statusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const map: Record<string, any> = {
            Confirmed: 'success', Draft: 'secondary', Pending: 'warn',
            Cancelled: 'danger', Completed: 'info'
        };
        return map[status] ?? 'secondary';
    }

    paymentSeverity(s: string): 'success' | 'warn' | 'danger' | 'secondary' {
        if (s === 'Paid') return 'success';
        if (s === 'Partial') return 'warn';
        if (s === 'Unpaid') return 'danger';
        return 'secondary';
    }

    guideOptions(): { label: string; value: number }[] {
        return this.guides.map(g => ({ label: g.fullName, value: g.id! }));
    }

    vehicleOptions(): { label: string; value: number }[] {
        return this.vehicles.map(v => ({
            label: v.model ? `${v.vehicleType} – ${v.model}` : v.vehicleType,
            value: v.id!
        }));
    }
}
