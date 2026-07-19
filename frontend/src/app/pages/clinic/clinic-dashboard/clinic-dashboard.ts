import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { TenantSelector } from '../tenant-selector/tenant-selector';
import { ClinicService, Appointment, Patient, Practitioner, ClinicServiceItem, Invoice } from '../clinic.service';

@Component({
    selector: 'app-clinic-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TableModule, TagModule, CardModule, ToastModule, TenantSelector],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-semibold m-0">Clinic Dashboard</h2>
                <app-tenant-selector (tenantChanged)="onTenantChange($event)"></app-tenant-selector>
            </div>

            @if (!tenantId) {
                <div class="text-center py-8 text-surface-500">
                    <i class="pi pi-building text-4xl mb-4 block"></i>
                    <p class="text-lg">Select a tenant to view the dashboard</p>
                </div>
            }

            @if (tenantId) {
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div class="card bg-blue-50 dark:bg-blue-900/20 cursor-pointer" routerLink="/clinic/appointments">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-surface-500 dark:text-surface-400 text-sm mb-1">Today's Appointments</div>
                                <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ todayAppointments }}</div>
                            </div>
                            <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                <i class="pi pi-calendar text-blue-600 dark:text-blue-400 text-xl"></i>
                            </div>
                        </div>
                    </div>

                    <div class="card bg-green-50 dark:bg-green-900/20 cursor-pointer" routerLink="/clinic/patients">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-surface-500 dark:text-surface-400 text-sm mb-1">Total Patients</div>
                                <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ totalPatients }}</div>
                            </div>
                            <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                <i class="pi pi-users text-green-600 dark:text-green-400 text-xl"></i>
                            </div>
                        </div>
                    </div>

                    <div class="card bg-orange-50 dark:bg-orange-900/20 cursor-pointer" routerLink="/clinic/practitioners">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-surface-500 dark:text-surface-400 text-sm mb-1">Practitioners</div>
                                <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">{{ totalPractitioners }}</div>
                            </div>
                            <div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                                <i class="pi pi-user text-orange-600 dark:text-orange-400 text-xl"></i>
                            </div>
                        </div>
                    </div>

                    <div class="card bg-purple-50 dark:bg-purple-900/20 cursor-pointer" routerLink="/clinic/invoices">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-surface-500 dark:text-surface-400 text-sm mb-1">Revenue (Paid)</div>
                                <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ totalRevenue | currency }}</div>
                            </div>
                            <div class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                                <i class="pi pi-dollar text-purple-600 dark:text-purple-400 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Appointments & Services -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <!-- Upcoming Appointments -->
                    <div class="card">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold m-0">Upcoming Appointments</h3>
                            <button pButton label="View All" class="p-button-text p-button-sm" icon="pi pi-arrow-right" iconPos="right" routerLink="/clinic/appointments"></button>
                        </div>
                        @if (upcomingAppointments.length === 0) {
                            <div class="text-center py-4 text-surface-500">
                                <i class="pi pi-calendar-times text-2xl mb-2 block"></i>
                                <p>No upcoming appointments</p>
                            </div>
                        }
                        @if (upcomingAppointments.length > 0) {
                            <p-table [value]="upcomingAppointments" [rows]="5" responsiveLayout="scroll">
                                <ng-template pTemplate="header">
                                    <tr>
                                        <th>Patient</th>
                                        <th>Practitioner</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                    </tr>
                                </ng-template>
                                <ng-template pTemplate="body" let-appt>
                                    <tr>
                                        <td>{{ appt.patientName }}</td>
                                        <td>{{ appt.practitionerName }}</td>
                                        <td>{{ appt.appointmentDate }}</td>
                                        <td>{{ appt.startTime }}</td>
                                        <td><p-tag [value]="appt.status" [severity]="getStatusSeverity(appt.status)"></p-tag></td>
                                    </tr>
                                </ng-template>
                            </p-table>
                        }
                    </div>

                    <!-- Services Overview -->
                    <div class="card">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold m-0">Services</h3>
                            <button pButton label="Manage" class="p-button-text p-button-sm" icon="pi pi-arrow-right" iconPos="right" routerLink="/clinic/services"></button>
                        </div>
                        @if (services.length === 0) {
                            <div class="text-center py-4 text-surface-500">
                                <i class="pi pi-briefcase text-2xl mb-2 block"></i>
                                <p>No services configured</p>
                            </div>
                        }
                        @if (services.length > 0) {
                            <p-table [value]="services" [rows]="5" responsiveLayout="scroll">
                                <ng-template pTemplate="header">
                                    <tr>
                                        <th>Service</th>
                                        <th>Category</th>
                                        <th>Duration</th>
                                        <th>Price</th>
                                    </tr>
                                </ng-template>
                                <ng-template pTemplate="body" let-svc>
                                    <tr>
                                        <td>{{ svc.name }}</td>
                                        <td><p-tag [value]="svc.category" severity="info"></p-tag></td>
                                        <td>{{ svc.durationMinutes }} min</td>
                                        <td>{{ svc.price | currency }}</td>
                                    </tr>
                                </ng-template>
                            </p-table>
                        }
                    </div>
                </div>

                <!-- Recent Invoices -->
                <div class="card mt-4">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold m-0">Recent Invoices</h3>
                        <button pButton label="View All" class="p-button-text p-button-sm" icon="pi pi-arrow-right" iconPos="right" routerLink="/clinic/invoices"></button>
                    </div>
                    @if (recentInvoices.length === 0) {
                        <div class="text-center py-4 text-surface-500">
                            <i class="pi pi-file text-2xl mb-2 block"></i>
                            <p>No invoices found</p>
                        </div>
                    }
                    @if (recentInvoices.length > 0) {
                        <p-table [value]="recentInvoices" [rows]="5" responsiveLayout="scroll">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Patient</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Issue Date</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-inv>
                                <tr>
                                    <td class="font-mono">{{ inv.invoiceNumber }}</td>
                                    <td>{{ inv.patientName }}</td>
                                    <td class="font-semibold">{{ inv.total | currency }}</td>
                                    <td><p-tag [value]="inv.status" [severity]="getInvoiceSeverity(inv.status)"></p-tag></td>
                                    <td>{{ inv.createdAt }}</td>
                                </tr>
                            </ng-template>
                        </p-table>
                    }
                </div>
            }
        </div>
    `
})
export class ClinicDashboard implements OnInit {
    tenantId: number = 0;
    loading = false;

    // Summary stats
    todayAppointments = 0;
    totalPatients = 0;
    totalPractitioners = 0;
    totalRevenue = 0;

    // Lists
    upcomingAppointments: Appointment[] = [];
    services: ClinicServiceItem[] = [];
    recentInvoices: Invoice[] = [];

    constructor(
        private clinicService: ClinicService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {}

    onTenantChange(tenantId: number) {
        this.tenantId = tenantId;
        if (tenantId) {
            this.loadDashboard();
        }
    }

    loadDashboard() {
        this.loading = true;

        // Load all data in parallel
        let pending = 4;
        const done = () => {
            pending--;
            if (pending === 0) {
                this.loading = false;
                this.cdr.detectChanges();
            }
        };

        // Appointments
        this.clinicService.getAppointments(this.tenantId).subscribe({
            next: (appts) => {
                const today = new Date().toISOString().split('T')[0];
                this.todayAppointments = appts.filter(a => a.appointmentDate === today).length;
                // Upcoming: scheduled appointments from today onward, up to 5
                this.upcomingAppointments = appts
                    .filter(a => a.status === 'Scheduled' && a.appointmentDate >= today)
                    .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate) || a.startTime.localeCompare(b.startTime))
                    .slice(0, 5);
                done();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load appointments' });
                done();
            }
        });

        // Patients
        this.clinicService.getPatients(this.tenantId).subscribe({
            next: (patients) => {
                this.totalPatients = patients.length;
                done();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load patients' });
                done();
            }
        });

        // Practitioners
        this.clinicService.getPractitioners(this.tenantId).subscribe({
            next: (practitioners) => {
                this.totalPractitioners = practitioners.filter(p => p.isActive).length;
                done();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load practitioners' });
                done();
            }
        });

        // Services + Invoices (sequential since we need both)
        this.clinicService.getClinicServices(this.tenantId).subscribe({
            next: (svcs) => {
                this.services = svcs.filter(s => s.isActive).slice(0, 5);
                // Now load invoices
                this.clinicService.getInvoices(this.tenantId).subscribe({
                    next: (invoices) => {
                        this.totalRevenue = invoices
                            .filter(i => i.status === 'Paid')
                            .reduce((sum, i) => sum + i.total, 0);
                        this.recentInvoices = invoices
                            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                            .slice(0, 5);
                        done();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load invoices' });
                        done();
                    }
                });
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load services' });
                done();
            }
        });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'Scheduled': return 'info';
            case 'Confirmed': return 'success';
            case 'InProgress': return 'warn';
            case 'Completed': return 'success';
            case 'Cancelled': return 'danger';
            case 'NoShow': return 'secondary';
            default: return undefined;
        }
    }

    getInvoiceSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'Paid': return 'success';
            case 'Sent': return 'info';
            case 'Draft': return 'secondary';
            case 'Overdue': return 'danger';
            case 'Void': return 'warn';
            default: return undefined;
        }
    }
}
