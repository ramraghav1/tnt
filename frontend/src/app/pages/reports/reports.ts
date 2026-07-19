import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { LeadCrmService, Lead, Quotation, B2BAgent, SupplierPayment } from '../../shared/services/lead-crm.service';

@Component({
    selector: 'app-tnt-reports',
    standalone: true,
    imports: [CommonModule, ButtonModule, ToastModule, TagModule, CardModule, DividerModule],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <div class="flex items-center gap-3 mb-6">
                <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-chart-bar text-primary text-xl"></i>
                </div>
                <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">TNT Reports</h2>
            </div>

            <!-- KPI Summary -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <i class="pi pi-filter-fill text-blue-500"></i>
                        <span class="text-sm text-muted-color">Total Leads</span>
                    </div>
                    <div class="text-3xl font-bold">{{ totalLeads }}</div>
                    <div class="text-xs text-muted-color mt-1">{{ convertedLeads }} converted ({{ conversionRate }}%)</div>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <i class="pi pi-file-edit text-green-500"></i>
                        <span class="text-sm text-muted-color">Quotations</span>
                    </div>
                    <div class="text-3xl font-bold">{{ totalQuotations }}</div>
                    <div class="text-xs text-muted-color mt-1">{{ approvedQuotations }} approved</div>
                </div>
                <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <i class="pi pi-users text-orange-500"></i>
                        <span class="text-sm text-muted-color">B2B Agents</span>
                    </div>
                    <div class="text-3xl font-bold">{{ totalAgents }}</div>
                    <div class="text-xs text-muted-color mt-1">{{ activeAgents }} active</div>
                </div>
                <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <i class="pi pi-money-bill text-purple-500"></i>
                        <span class="text-sm text-muted-color">Supplier Payments</span>
                    </div>
                    <div class="text-3xl font-bold">{{ totalPaymentAmount | number:'1.0-0' }}</div>
                    <div class="text-xs text-muted-color mt-1">{{ totalPayments }} payments</div>
                </div>
            </div>

            <p-divider />

            <!-- Lead Sources Breakdown -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 class="text-lg font-semibold mb-4">Lead Sources</h3>
                    <div *ngFor="let s of leadSources" class="flex items-center justify-between p-3 mb-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                        <span>{{ s.source }}</span>
                        <div class="flex items-center gap-3">
                            <div class="bg-primary/20 rounded-full h-2" [style.width.px]="s.count * 10" style="min-width:20px"></div>
                            <span class="font-semibold w-8 text-right">{{ s.count }}</span>
                        </div>
                    </div>
                    <div *ngIf="leadSources.length === 0" class="text-muted-color py-4">No data.</div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold mb-4">Lead Status Distribution</h3>
                    <div *ngFor="let s of leadStatuses" class="flex items-center justify-between p-3 mb-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                        <p-tag [value]="s.status" [severity]="getStatusSeverity(s.status)" />
                        <div class="flex items-center gap-3">
                            <div class="bg-primary/20 rounded-full h-2" [style.width.px]="s.count * 10" style="min-width:20px"></div>
                            <span class="font-semibold w-8 text-right">{{ s.count }}</span>
                        </div>
                    </div>
                    <div *ngIf="leadStatuses.length === 0" class="text-muted-color py-4">No data.</div>
                </div>
            </div>

            <p-divider />

            <!-- Quotation Revenue -->
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-4">Quotation Revenue Summary</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 text-center">
                        <div class="text-sm text-muted-color">Total Quoted Value</div>
                        <div class="text-2xl font-bold mt-2">{{ totalQuotedValue | number:'1.2-2' }}</div>
                    </div>
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 text-center">
                        <div class="text-sm text-muted-color">Approved Value</div>
                        <div class="text-2xl font-bold mt-2 text-green-600">{{ approvedValue | number:'1.2-2' }}</div>
                    </div>
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 text-center">
                        <div class="text-sm text-muted-color">Avg per Quotation</div>
                        <div class="text-2xl font-bold mt-2">{{ avgQuotationValue | number:'1.2-2' }}</div>
                    </div>
                </div>
            </div>

            <p-divider />

            <!-- Top Agents -->
            <div>
                <h3 class="text-lg font-semibold mb-4">Top B2B Agents by Bookings</h3>
                <div *ngFor="let a of topAgents; let i = index" class="flex items-center justify-between p-3 mb-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                    <div class="flex items-center gap-3">
                        <span class="text-lg font-bold text-primary w-8">#{{ i + 1 }}</span>
                        <div>
                            <span class="font-semibold">{{ a.name }}</span>
                            <span class="text-muted-color text-sm ml-2">{{ a.country }}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="text-sm text-muted-color">{{ a.commissionRate }}% commission</span>
                        <span class="font-bold text-lg">{{ a.totalBookings }} bookings</span>
                    </div>
                </div>
                <div *ngIf="topAgents.length === 0" class="text-muted-color py-4 text-center">No agents data.</div>
            </div>
        </div>
    `
})
export class TntReports implements OnInit {
    totalLeads = 0;
    convertedLeads = 0;
    conversionRate = 0;
    totalQuotations = 0;
    approvedQuotations = 0;
    totalAgents = 0;
    activeAgents = 0;
    totalPayments = 0;
    totalPaymentAmount = 0;
    totalQuotedValue = 0;
    approvedValue = 0;
    avgQuotationValue = 0;

    leadSources: { source: string, count: number }[] = [];
    leadStatuses: { status: string, count: number }[] = [];
    topAgents: B2BAgent[] = [];

    constructor(private leadCrmService: LeadCrmService, private messageService: MessageService) {}

    ngOnInit() {
        this.leadCrmService.getLeads().subscribe({
            next: (leads: Lead[]) => {
                this.totalLeads = leads.length;
                this.convertedLeads = leads.filter((l: Lead) => l.status === 'Converted').length;
                this.conversionRate = this.totalLeads > 0 ? Math.round((this.convertedLeads / this.totalLeads) * 100) : 0;

                // Group by source
                const sourceMap = new Map<string, number>();
                leads.forEach((l: Lead) => sourceMap.set(l.source, (sourceMap.get(l.source) || 0) + 1));
                this.leadSources = Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);

                // Group by status
                const statusMap = new Map<string, number>();
                leads.forEach((l: Lead) => statusMap.set(l.status, (statusMap.get(l.status) || 0) + 1));
                this.leadStatuses = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count);
            }
        });

        this.leadCrmService.getQuotations().subscribe({
            next: (quotations: Quotation[]) => {
                this.totalQuotations = quotations.length;
                this.approvedQuotations = quotations.filter(q => q.status === 'Approved').length;
                this.totalQuotedValue = quotations.reduce((sum: number, q: Quotation) => sum + q.totalAmount, 0);
                this.approvedValue = quotations.filter(q => q.status === 'Approved').reduce((sum: number, q: Quotation) => sum + q.totalAmount, 0);
                this.avgQuotationValue = this.totalQuotations > 0 ? this.totalQuotedValue / this.totalQuotations : 0;
            }
        });

        this.leadCrmService.getAgents().subscribe({
            next: (agents: B2BAgent[]) => {
                this.totalAgents = agents.length;
                this.activeAgents = agents.filter(a => a.status === 'Active').length;
                this.topAgents = [...agents].sort((a, b) => b.totalBookings - a.totalBookings).slice(0, 5);
            }
        });

        this.leadCrmService.getSupplierPayments().subscribe({
            next: (payments: SupplierPayment[]) => {
                this.totalPayments = payments.length;
                this.totalPaymentAmount = payments.reduce((sum: number, p: SupplierPayment) => sum + p.amount, 0);
            }
        });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'New': return 'info';
            case 'InProgress': return 'warn';
            case 'Qualified': return 'success';
            case 'Converted': return 'success';
            case 'Lost': return 'danger';
            default: return 'secondary';
        }
    }
}
