import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

import { BookingService, BookingDetail, BookingInventoryItem } from '../booking.service';

@Component({
    selector: 'app-booking-view',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ButtonModule,
        TagModule,
        DividerModule,
        ToastModule,
        TooltipModule,
        ProgressSpinnerModule,
        TranslateModule
    ],
    providers: [MessageService],
    templateUrl: './booking-view.html',
    styleUrls: ['./booking-view.scss']
})
export class BookingView implements OnInit {
    booking?: BookingDetail;
    inventoryItems: BookingInventoryItem[] = [];
    loading = true;
    notFound = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookingService: BookingService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        const ref = this.route.snapshot.paramMap.get('ref') ?? '';
        if (!ref) {
            this.notFound = true;
            this.loading = false;
            return;
        }

        const numericId = Number(ref);
        if (!isNaN(numericId) && numericId > 0) {
            this.loadById(numericId);
        } else {
            this.loadByRef(ref.toUpperCase());
        }
    }

    private loadById(id: number) {
        this.bookingService.getBookingDetail(id).subscribe({
            next: (data) => {
                this.booking = data;
                this.loading = false;
                this.loadInventory(id);
                this.cdr.detectChanges();
            },
            error: () => {
                this.notFound = true;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private loadInventory(id: number) {
        this.bookingService.getBookingInventory(id).subscribe({
            next: (items) => {
                this.inventoryItems = items || [];
                this.cdr.detectChanges();
            },
            error: () => { this.inventoryItems = []; }
        });
    }

    private loadByRef(ref: string) {
        this.bookingService.getBookings().subscribe({
            next: (list) => {
                const match = list.find(b => b.bookingReference?.toUpperCase() === ref);
                if (match) {
                    this.loadById(match.instanceId);
                } else {
                    this.notFound = true;
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            },
            error: () => {
                this.notFound = true;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    goBack() {
        this.router.navigate(['/my-bookings']);
    }

    print() {
        window.print();
    }

    getInventoryByType(type: string): BookingInventoryItem[] {
        return this.inventoryItems.filter(i => i.inventoryType?.toLowerCase() === type.toLowerCase());
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'success';
            case 'pending':   return 'warn';
            case 'draft':     return 'info';
            case 'cancelled': return 'danger';
            default:          return 'secondary';
        }
    }

    getPaymentSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
        switch (status?.toLowerCase()) {
            case 'paid':    return 'success';
            case 'partial': return 'warn';
            case 'unpaid':  return 'danger';
            default:        return 'secondary';
        }
    }

    formatDate(d?: string): string {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    formatDateTime(d?: string): string {
        if (!d) return '—';
        return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    formatAmount(n?: number): string {
        return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    getMeals(day: BookingDetail['days'][0]): string {
        const m: string[] = [];
        if (day.breakfastIncluded) m.push('Breakfast');
        if (day.lunchIncluded)     m.push('Lunch');
        if (day.dinnerIncluded)    m.push('Dinner');
        return m.length ? m.join(', ') : 'None';
    }

    getTravelerType(t: BookingDetail['travelers'][0]): string {
        const parts: string[] = [];
        if (t.adults   > 0) parts.push(`${t.adults} Adult${t.adults   > 1 ? 's' : ''}`);
        if (t.children > 0) parts.push(`${t.children} Child${t.children > 1 ? 'ren' : ''}`);
        if (t.seniors  > 0) parts.push(`${t.seniors} Senior${t.seniors  > 1 ? 's' : ''}`);
        return parts.length ? parts.join(', ') : '—';
    }
}
