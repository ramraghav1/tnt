import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { LeadCrmService, ServiceVoucher, RoomingAssignment } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-daily-plan',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, ToastModule, TagModule, CardModule, DatePickerModule, DividerModule],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar text-primary text-xl"></i>
                    </div>
                    <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Daily Plan</h2>
                </div>
                <div class="flex items-center gap-3">
                    <p-datepicker [(ngModel)]="selectedDate" dateFormat="yy-mm-dd" [showIcon]="true" (onSelect)="filterByDate()" />
                    <button pButton label="Today" icon="pi pi-clock" severity="secondary" (click)="goToday()"></button>
                </div>
            </div>

            <div class="text-lg font-semibold mb-4">{{ selectedDate | date:'fullDate' }}</div>

            <!-- Today's Vouchers / Services -->
            <div class="mb-6">
                <h3 class="text-base font-semibold mb-3 text-primary"><i class="pi pi-ticket mr-2"></i>Services Scheduled</h3>
                <div *ngIf="todayVouchers.length === 0" class="text-muted-color py-4 text-center bg-surface-50 dark:bg-surface-800 rounded-lg">
                    No services scheduled for this date.
                </div>
                <div *ngFor="let v of todayVouchers" class="flex items-center justify-between p-3 mb-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                    <div class="flex items-center gap-3">
                        <i [class]="getVoucherIcon(v.voucherType) + ' text-xl text-primary'"></i>
                        <div>
                            <span class="font-semibold">{{ v.voucherType }}</span>
                            <span *ngIf="v.supplierName" class="text-muted-color"> — {{ v.supplierName }}</span>
                            <div *ngIf="v.details" class="text-sm text-muted-color mt-1">{{ v.details }}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-sm">{{ v.voucherNumber }}</span>
                        <p-tag [value]="v.status" [severity]="v.status === 'Confirmed' ? 'success' : v.status === 'Issued' ? 'info' : 'secondary'" />
                    </div>
                </div>
            </div>

            <p-divider />

            <!-- Summary -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                    <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">{{ todayVouchers.length }}</div>
                    <div class="text-sm text-muted-color mt-1">Services Today</div>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                    <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">{{ confirmedCount }}</div>
                    <div class="text-sm text-muted-color mt-1">Confirmed</div>
                </div>
                <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
                    <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">{{ pendingCount }}</div>
                    <div class="text-sm text-muted-color mt-1">Pending Confirmation</div>
                </div>
            </div>
        </div>
    `
})
export class DailyPlan implements OnInit {
    selectedDate: Date = new Date();
    allVouchers: ServiceVoucher[] = [];
    todayVouchers: ServiceVoucher[] = [];
    confirmedCount = 0;
    pendingCount = 0;

    constructor(private leadCrmService: LeadCrmService, private messageService: MessageService) {}

    ngOnInit() {
        this.leadCrmService.getVouchers().subscribe({
            next: (data) => { this.allVouchers = data; this.filterByDate(); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' })
        });
    }

    filterByDate() {
        const dateStr = this.formatDate(this.selectedDate);
        this.todayVouchers = this.allVouchers.filter(v => {
            if (!v.serviceDate) return false;
            return v.serviceDate.substring(0, 10) === dateStr;
        });
        this.confirmedCount = this.todayVouchers.filter(v => v.status === 'Confirmed').length;
        this.pendingCount = this.todayVouchers.filter(v => v.status === 'Issued' || v.status === 'Draft').length;
    }

    goToday() {
        this.selectedDate = new Date();
        this.filterByDate();
    }

    formatDate(d: Date): string {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    getVoucherIcon(type: string): string {
        switch (type) {
            case 'Hotel': return 'pi pi-building';
            case 'Transport': return 'pi pi-car';
            case 'Activity': return 'pi pi-flag';
            case 'Guide': return 'pi pi-user';
            case 'Meal': return 'pi pi-shopping-bag';
            case 'Flight': return 'pi pi-send';
            default: return 'pi pi-ticket';
        }
    }
}
