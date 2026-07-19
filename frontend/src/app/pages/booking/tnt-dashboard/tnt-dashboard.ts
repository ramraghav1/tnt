import { Component, OnInit, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

import { BookingService, DashboardStats, OperationsStats, OperationItem, UpcomingTrek, DashboardAlert } from '../booking.service';
import { DepartureManagementService, DepartureListItem } from '../departure-management.service';
import { LayoutService } from '../../../layout/service/layout.service';

@Component({
    selector: 'app-tnt-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ChartModule,
        TableModule,
        ButtonModule,
        TagModule,
        ToastModule,
        SkeletonModule,
        TooltipModule,
        BadgeModule,
        TranslateModule
    ],
    providers: [MessageService],
    templateUrl: './tnt-dashboard.html',
    styleUrls: ['./tnt-dashboard.scss']
})
export class TntDashboard implements OnInit {
    stats: DashboardStats | null = null;
    opsStats: OperationsStats | null = null;
    loading = true;
    opsLoading = true;

    departures: DepartureListItem[] = [];
    departuresLoading = true;
    departureStatusChartData: any;
    departureStatusChartOptions: any;

    // Chart data
    bookingChartData: any;
    bookingChartOptions: any;
    revenueChartData: any;
    revenueChartOptions: any;
    statusChartData: any;
    statusChartOptions: any;
    paymentChartData: any;
    paymentChartOptions: any;

    constructor(
        private bookingService: BookingService,
        private departureService: DepartureManagementService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
        private layoutService: LayoutService
    ) {
        // React to theme/primary/dark mode changes
        effect(() => {
            this.layoutService.layoutConfig();
            setTimeout(() => {
                if (this.stats) this.buildCharts();
                if (this.departures.length) this.buildDepartureStatusChart();
                this.cdr.detectChanges();
            }, 50);
        });
    }

    ngOnInit(): void {
        this.loadStats();
        this.loadOperationsStats();
        this.loadDepartures();
    }

    loadOperationsStats() {
        this.opsLoading = true;
        this.bookingService.getOperationsStats().subscribe({
            next: (data) => {
                this.opsStats = data;
                this.opsLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.opsLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadDepartures() {
        this.departuresLoading = true;
        this.departureService.getAllDepartures().subscribe({
            next: (data) => {
                this.departures = data || [];
                this.buildDepartureStatusChart();
                this.departuresLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.departuresLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadStats() {
        this.loading = true;
        this.bookingService.getDashboardStats().subscribe({
            next: (data) => {
                this.stats = data;
                this.buildCharts();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load dashboard data' });
                this.cdr.detectChanges();
            }
        });
    }

    getAlertSeverityClass(severity: string): string {
        switch (severity) {
            case 'danger': return 'bg-red-50 dark:bg-red-400/10 border-red-200 dark:border-red-400/20';
            case 'warn': return 'bg-orange-50 dark:bg-orange-400/10 border-orange-200 dark:border-orange-400/20';
            case 'info': return 'bg-blue-50 dark:bg-blue-400/10 border-blue-200 dark:border-blue-400/20';
            default: return 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700';
        }
    }

    getAlertIconClass(severity: string): string {
        switch (severity) {
            case 'danger': return 'text-red-500';
            case 'warn': return 'text-orange-500';
            case 'info': return 'text-blue-500';
            default: return 'text-surface-500';
        }
    }

    getAlertIconBgClass(severity: string): string {
        switch (severity) {
            case 'danger': return 'bg-red-100 dark:bg-red-400/20';
            case 'warn': return 'bg-orange-100 dark:bg-orange-400/20';
            case 'info': return 'bg-blue-100 dark:bg-blue-400/20';
            default: return 'bg-surface-100 dark:bg-surface-700';
        }
    }

    getOperationIconBg(type: string): string {
        switch (type) {
            case 'airport_pickup': return 'bg-blue-100 dark:bg-blue-400/10';
            case 'trek_departure': return 'bg-green-100 dark:bg-green-400/10';
            case 'hotel_checkin': return 'bg-purple-100 dark:bg-purple-400/10';
            default: return 'bg-surface-100 dark:bg-surface-700';
        }
    }

    getOperationIconColor(type: string): string {
        switch (type) {
            case 'airport_pickup': return 'text-blue-500';
            case 'trek_departure': return 'text-green-500';
            case 'hotel_checkin': return 'text-purple-500';
            default: return 'text-surface-500';
        }
    }

    private buildDepartureStatusChart() {
        const docStyle = getComputedStyle(document.documentElement);
        const textColor = docStyle.getPropertyValue('--p-text-color') || '#495057';

        const p600 = docStyle.getPropertyValue('--p-primary-600')?.trim() || '#4f46e5';
        const p500 = docStyle.getPropertyValue('--p-primary-500')?.trim() || '#6366f1';
        const p300 = docStyle.getPropertyValue('--p-primary-300')?.trim() || '#a5b4fc';
        const p200 = docStyle.getPropertyValue('--p-primary-200')?.trim() || '#c7d2fe';
        const p400 = docStyle.getPropertyValue('--p-primary-400')?.trim() || '#818cf8';
        const p100 = docStyle.getPropertyValue('--p-primary-100')?.trim() || '#e0e7ff';

        const sec500 = docStyle.getPropertyValue('--p-amber-500')?.trim() || '#f59e0b';
        const sec400 = docStyle.getPropertyValue('--p-amber-400')?.trim() || '#fbbf24';

        const counts = { Upcoming: 0, Ongoing: 0, Completed: 0, Cancelled: 0 };
        for (const d of this.departures) {
            const s = d.computedStatus as keyof typeof counts;
            if (s in counts) counts[s]++;
        }

        this.departureStatusChartData = {
            labels: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
            datasets: [{
                data: [counts.Upcoming, counts.Ongoing, counts.Completed, counts.Cancelled],
                backgroundColor: [p500, p300, sec400, p100],
                hoverBackgroundColor: [p600, p400, sec500, p200],
                borderWidth: 2,
                borderColor: 'transparent',
                hoverBorderColor: '#fff',
                hoverBorderWidth: 2
            }]
        };
        this.departureStatusChartOptions = {
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true, padding: 16 } }
            },
            maintainAspectRatio: false
        };
    }

    getDepartureStatusSeverity(status: string): 'info' | 'success' | 'secondary' | 'danger' {
        switch (status?.toLowerCase()) {
            case 'upcoming': return 'info';
            case 'ongoing': return 'success';
            case 'completed': return 'secondary';
            case 'cancelled': return 'danger';
            default: return 'info';
        }
    }

    getDepartureFill(dep: DepartureListItem): number {
        return dep.capacity > 0 ? Math.round((dep.bookedCount / dep.capacity) * 100) : 0;
    }

    formatDepartureDate(dateStr: string): string {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    private buildCharts() {
        if (!this.stats) return;

        const docStyle = getComputedStyle(document.documentElement);
        const textColor = docStyle.getPropertyValue('--p-text-color') || '#495057';
        const surfaceBorder = docStyle.getPropertyValue('--p-content-border-color') || '#dee2e6';
        const primaryColor = docStyle.getPropertyValue('--p-primary-color')?.trim() || '#6366f1';

        const withAlpha = (color: string, alpha: number): string => {
            const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (rgbMatch) return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
            const hex = color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const p700 = docStyle.getPropertyValue('--p-primary-700')?.trim() || withAlpha(primaryColor, 1.0);
        const p600 = docStyle.getPropertyValue('--p-primary-600')?.trim() || withAlpha(primaryColor, 0.88);
        const p500 = docStyle.getPropertyValue('--p-primary-500')?.trim() || primaryColor;
        const p400 = docStyle.getPropertyValue('--p-primary-400')?.trim() || withAlpha(primaryColor, 0.72);
        const p300 = docStyle.getPropertyValue('--p-primary-300')?.trim() || withAlpha(primaryColor, 0.55);
        const p200 = docStyle.getPropertyValue('--p-primary-200')?.trim() || withAlpha(primaryColor, 0.38);
        const p100 = docStyle.getPropertyValue('--p-primary-100')?.trim() || withAlpha(primaryColor, 0.22);

        const sec600 = docStyle.getPropertyValue('--p-amber-600')?.trim() || '#d97706';
        const sec500 = docStyle.getPropertyValue('--p-amber-500')?.trim() || '#f59e0b';
        const sec300 = docStyle.getPropertyValue('--p-amber-300')?.trim() || '#fcd34d';
        const sec200 = docStyle.getPropertyValue('--p-amber-200')?.trim() || '#fde68a';

        // Bar chart: Booking trend
        this.bookingChartData = {
            labels: this.stats.monthlyBookings.map(m => m.month),
            datasets: [{
                label: 'Bookings',
                data: this.stats.monthlyBookings.map(m => m.count),
                backgroundColor: withAlpha(primaryColor, 0.6),
                borderColor: p500,
                borderWidth: 1,
                borderRadius: 6
            }]
        };
        this.bookingChartOptions = {
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: textColor, stepSize: 1 }, grid: { color: surfaceBorder } },
                x: { ticks: { color: textColor }, grid: { display: false } }
            },
            maintainAspectRatio: false
        };

        // Line chart: Revenue trend
        this.revenueChartData = {
            labels: this.stats.monthlyRevenue.map(m => m.month),
            datasets: [{
                label: 'Revenue (NPR)',
                data: this.stats.monthlyRevenue.map(m => m.amount),
                fill: true,
                backgroundColor: withAlpha(primaryColor, 0.1),
                borderColor: p500,
                tension: 0.4,
                pointBackgroundColor: p500,
                pointRadius: 5
            }]
        };
        this.revenueChartOptions = {
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: surfaceBorder } },
                x: { ticks: { color: textColor }, grid: { display: false } }
            },
            maintainAspectRatio: false
        };

        // Doughnut: Booking status
        this.statusChartData = {
            labels: ['Confirmed', 'Pending', 'Draft', 'Cancelled'],
            datasets: [{
                data: [this.stats.confirmed, this.stats.pending, this.stats.draft, this.stats.cancelled],
                backgroundColor: [p500, p300, p100, sec500],
                hoverBackgroundColor: [p600, p400, p200, sec600],
                borderWidth: 2,
                borderColor: 'transparent',
                hoverBorderColor: '#fff',
                hoverBorderWidth: 2
            }]
        };
        this.statusChartOptions = {
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true, padding: 16 } }
            },
            maintainAspectRatio: false
        };

        // Doughnut: Payment status
        const payBg: string[] = [];
        const payHov: string[] = [];
        this.stats.paymentStatusBreakdown.forEach((p, i) => {
            const lbl = (p.label || '').toLowerCase();
            if (lbl === 'paid') { payBg.push(p500); payHov.push(p600); }
            else if (lbl === 'partial') { payBg.push(sec200); payHov.push(sec300); }
            else if (lbl === 'unpaid') { payBg.push(sec500); payHov.push(sec600); }
            else {
                const fallbackBg = [p500, p300, p100, sec500];
                const fallbackHov = [p600, p400, p200, sec600];
                payBg.push(fallbackBg[i % fallbackBg.length]);
                payHov.push(fallbackHov[i % fallbackHov.length]);
            }
        });
        this.paymentChartData = {
            labels: this.stats.paymentStatusBreakdown.map(p => p.label || 'Unknown'),
            datasets: [{
                data: this.stats.paymentStatusBreakdown.map(p => p.count),
                backgroundColor: payBg,
                hoverBackgroundColor: payHov,
                borderWidth: 2,
                borderColor: 'transparent',
                hoverBorderColor: '#fff',
                hoverBorderWidth: 2
            }]
        };
        this.paymentChartOptions = {
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true, padding: 16 } }
            },
            maintainAspectRatio: false
        };
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'success';
            case 'pending': return 'warn';
            case 'draft': return 'info';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    }

    getPaymentSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status?.toLowerCase()) {
            case 'paid': return 'success';
            case 'partial': return 'warn';
            case 'unpaid': return 'danger';
            default: return 'secondary';
        }
    }

    formatCurrency(amount: number): string {
        return amount?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0';
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
}
