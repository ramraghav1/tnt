import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { LeadCrmService, Amendment, ServiceVoucher } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-trip-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, ToastModule, TagModule, CardModule, DividerModule, ProgressBarModule],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <div class="flex items-center gap-3 mb-6">
                <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-compass text-primary text-xl"></i>
                </div>
                <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Trip Operations Dashboard</h2>
            </div>

            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div class="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-1">Pending Amendments</div>
                    <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">{{ pendingAmendments }}</div>
                    <div class="text-xs text-muted-color mt-1">Need approval</div>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <div class="text-green-600 dark:text-green-400 text-sm font-semibold mb-1">Active Vouchers</div>
                    <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">{{ activeVouchers }}</div>
                    <div class="text-xs text-muted-color mt-1">Issued & confirmed</div>
                </div>
                <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                    <div class="text-orange-600 dark:text-orange-400 text-sm font-semibold mb-1">Total Amendments</div>
                    <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">{{ totalAmendments }}</div>
                    <div class="text-xs text-muted-color mt-1">All time</div>
                </div>
                <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                    <div class="text-purple-600 dark:text-purple-400 text-sm font-semibold mb-1">Total Vouchers</div>
                    <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">{{ totalVouchers }}</div>
                    <div class="text-xs text-muted-color mt-1">All time</div>
                </div>
            </div>

            <!-- Recent Amendments -->
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-4">Recent Amendments</h3>
                <div *ngIf="amendments.length === 0" class="text-muted-color py-4">No amendments data.</div>
                <div *ngFor="let a of amendments.slice(0, 5)" class="flex items-center justify-between p-3 mb-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                    <div>
                        <span class="font-semibold">{{ a.bookingReference || '#' + a.bookingInstanceId }}</span>
                        <span class="text-muted-color mx-2">—</span>
                        <span>{{ a.amendmentType }}: {{ a.description }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-tag [value]="a.status" [severity]="a.status === 'Pending' ? 'warn' : a.status === 'Approved' ? 'success' : 'danger'" />
                        <span class="text-xs text-muted-color">{{ a.createdAt | date:'short' }}</span>
                    </div>
                </div>
            </div>

            <p-divider />

            <!-- Recent Vouchers -->
            <div>
                <h3 class="text-lg font-semibold mb-4">Recent Vouchers</h3>
                <div *ngIf="vouchers.length === 0" class="text-muted-color py-4">No voucher data.</div>
                <div *ngFor="let v of vouchers.slice(0, 5)" class="flex items-center justify-between p-3 mb-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                    <div>
                        <span class="font-semibold font-mono">{{ v.voucherNumber }}</span>
                        <span class="text-muted-color mx-2">—</span>
                        <span>{{ v.voucherType }} {{ v.supplierName ? '| ' + v.supplierName : '' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-tag [value]="v.status" [severity]="v.status === 'Issued' ? 'info' : v.status === 'Confirmed' ? 'success' : 'secondary'" />
                        <span class="text-xs text-muted-color">{{ v.serviceDate ? (v.serviceDate | date:'mediumDate') : '' }}</span>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class TripDashboard implements OnInit {
    amendments: Amendment[] = [];
    vouchers: ServiceVoucher[] = [];
    pendingAmendments = 0;
    activeVouchers = 0;
    totalAmendments = 0;
    totalVouchers = 0;

    constructor(private leadCrmService: LeadCrmService, private messageService: MessageService) {}

    ngOnInit() {
        this.leadCrmService.getAmendments().subscribe({
            next: (data) => {
                this.amendments = data;
                this.totalAmendments = data.length;
                this.pendingAmendments = data.filter(a => a.status === 'Pending').length;
            }
        });
        this.leadCrmService.getVouchers().subscribe({
            next: (data) => {
                this.vouchers = data;
                this.totalVouchers = data.length;
                this.activeVouchers = data.filter(v => v.status === 'Issued' || v.status === 'Confirmed').length;
            }
        });
    }
}
