import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { TranslateModule } from '@ngx-translate/core';

import { DepartureManagementService, DepartureListItem } from '../departure-management.service';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
    selector: 'app-departure-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        TableModule, ButtonModule, TagModule, ToastModule, TooltipModule,
        ProgressSpinnerModule, InputTextModule, DialogModule, DividerModule,
        SelectModule, IconFieldModule, InputIconModule,
        TranslateModule
    ],
    providers: [MessageService],
    templateUrl: './departure-list.html'
})
export class DepartureList implements OnInit {
    departures: DepartureListItem[] = [];
    loading = false;
    searchText = '';

    // Detail dialog
    selectedDeparture: DepartureListItem | null = null;
    showDetailDialog = false;

    // Filter
    statusFilter: string = 'All';
    statusFilterOptions = [
        { label: 'All', value: 'All' },
        { label: 'Upcoming', value: 'Upcoming' },
        { label: 'Ongoing', value: 'Ongoing' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Cancelled', value: 'Cancelled' }
    ];

    constructor(
        private svc: DepartureManagementService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;
        this.svc.getAllDepartures().subscribe({
            next: (data) => { this.departures = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load departures' });
            }
        });
    }

    get filtered(): DepartureListItem[] {
        return this.departures.filter(d => {
            const matchStatus = this.statusFilter === 'All' || d.computedStatus === this.statusFilter;
            const q = this.searchText.toLowerCase();
            const matchSearch = !q ||
                d.itineraryTitle.toLowerCase().includes(q) ||
                (d.guideName ?? '').toLowerCase().includes(q) ||
                (d.vehicleInfo ?? '').toLowerCase().includes(q) ||
                (d.travelerNames ?? '').toLowerCase().includes(q);
            return matchStatus && matchSearch;
        });
    }

    openDetail(dep: DepartureListItem): void {
        this.selectedDeparture = dep;
        this.showDetailDialog = true;
    }

    goToManageBookings(): void {
        this.router.navigate(['/manage-bookings']);
    }

    // ── Severity helpers ──────────────────────────────────────────
    computedStatusSeverity(s: string): Severity {
        const m: Record<string, Severity> = {
            Upcoming: 'info', Ongoing: 'success', Completed: 'secondary', Cancelled: 'danger'
        };
        return m[s] ?? 'secondary';
    }

    computedStatusIcon(s: string): string {
        const m: Record<string, string> = {
            Upcoming: 'pi-clock', Ongoing: 'pi-play-circle', Completed: 'pi-check-circle', Cancelled: 'pi-times-circle'
        };
        return m[s] ?? 'pi-circle';
    }

    capacityPercent(d: DepartureListItem): number {
        return d.capacity > 0 ? Math.round((d.bookedCount / d.capacity) * 100) : 0;
    }

    capacityColor(d: DepartureListItem): string {
        const p = this.capacityPercent(d);
        if (p >= 90) return 'text-red-500';
        if (p >= 60) return 'text-yellow-500';
        return 'text-green-600';
    }
}
