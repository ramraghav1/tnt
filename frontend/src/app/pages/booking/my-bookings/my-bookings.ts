import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

import { BookingService, BookingListItem } from '../booking.service';
import { PaymentDialog } from '../payment-dialog/payment-dialog';

@Component({
    selector: 'app-my-bookings',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        TagModule,
        TooltipModule,
        IconFieldModule,
        InputIconModule,
        PaymentDialog,
        TranslateModule
    ],
    providers: [MessageService],
    templateUrl: './my-bookings.html',
    styleUrls: ['./my-bookings.scss']
})
export class MyBookings implements OnInit {
    bookings: BookingListItem[] = [];
    loading = false;

    @ViewChild('dt') dt!: Table;

    // Payment dialog
    showPaymentDialog = false;
    payBookingId = 0;
    payBookingRef = '';
    payTotalAmount = 0;
    payDiscountAmount = 0;

    constructor(
        private bookingService: BookingService,
        private router: Router,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadBookings();
    }

    loadBookings() {
        this.loading = true;
        this.bookingService.getBookings().subscribe({
            next: (data) => {
                this.bookings = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load bookings' });
                this.cdr.detectChanges();
            }
        });
    }

    onGlobalFilter(event: Event) {
        this.dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'success';
            case 'pending': return 'warn';
            case 'draft': return 'info';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    }

    getCountByStatus(status: string): number {
        return this.bookings.filter(b => b.status?.toLowerCase() === status.toLowerCase()).length;
    }

    getPaymentSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status?.toLowerCase()) {
            case 'paid': return 'success';
            case 'partial': return 'warn';
            case 'unpaid': return 'danger';
            default: return 'secondary';
        }
    }

    viewBooking(booking: BookingListItem) {
        this.router.navigate(['/booking-view', booking.instanceId]);
    }

    payNow(booking: BookingListItem) {
        this.payBookingId = booking.instanceId;
        this.payBookingRef = booking.bookingReference;
        this.payTotalAmount = booking.totalAmount;
        this.payDiscountAmount = 0;
        this.showPaymentDialog = true;
        this.cdr.detectChanges();
    }

    onPaymentComplete() {
        this.showPaymentDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Payment Received', detail: 'Booking payment confirmed!' });
        this.loadBookings();
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    formatCurrency(amount: number): string {
        return amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
    }
}
