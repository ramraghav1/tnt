import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { LeadCrmService, Quotation, ServiceVoucher } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-document-downloads',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, ToastModule, TagModule, CardModule, InputTextModule, DividerModule],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <div class="flex items-center gap-3 mb-6">
                <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-download text-primary text-xl"></i>
                </div>
                <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Document Downloads</h2>
            </div>

            <!-- Quotation Documents -->
            <h3 class="text-lg font-semibold mb-4"><i class="pi pi-file-edit mr-2"></i>Quotation Documents</h3>
            <div *ngIf="quotations.length === 0" class="text-muted-color py-4 text-center bg-surface-50 dark:bg-surface-800 rounded-lg mb-6">
                No quotations available for download.
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div *ngFor="let q of quotations" class="border border-surface-200 dark:border-surface-700 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-mono font-semibold">{{ q.quotationNumber }}</span>
                            <p-tag [value]="q.status" [severity]="q.status === 'Approved' ? 'success' : q.status === 'Sent' ? 'info' : 'secondary'" />
                        </div>
                        <div class="font-semibold">{{ q.clientName }}</div>
                        <div class="text-sm text-muted-color mt-1">{{ q.totalAmount | number:'1.2-2' }} {{ q.currency }} · {{ q.pax }} pax</div>
                        <div class="text-xs text-muted-color mt-1">Created: {{ q.createdAt | date:'mediumDate' }}</div>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button pButton label="Download PDF" icon="pi pi-file-pdf" size="small" severity="danger" (click)="downloadQuotation(q)" class="flex-1"></button>
                    </div>
                </div>
            </div>

            <p-divider />

            <!-- Voucher Documents -->
            <h3 class="text-lg font-semibold mb-4"><i class="pi pi-ticket mr-2"></i>Service Vouchers</h3>
            <div *ngIf="vouchers.length === 0" class="text-muted-color py-4 text-center bg-surface-50 dark:bg-surface-800 rounded-lg mb-6">
                No vouchers available for download.
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div *ngFor="let v of vouchers" class="border border-surface-200 dark:border-surface-700 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-mono font-semibold">{{ v.voucherNumber }}</span>
                            <p-tag [value]="v.voucherType" severity="info" />
                        </div>
                        <div *ngIf="v.supplierName" class="font-semibold">{{ v.supplierName }}</div>
                        <div *ngIf="v.bookingReference" class="text-sm text-muted-color mt-1">Booking: {{ v.bookingReference }}</div>
                        <div *ngIf="v.serviceDate" class="text-xs text-muted-color mt-1">Service Date: {{ v.serviceDate | date:'mediumDate' }}</div>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button pButton label="Download" icon="pi pi-download" size="small" (click)="downloadVoucher(v)" class="flex-1"></button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class DocumentDownloads implements OnInit {
    quotations: Quotation[] = [];
    vouchers: ServiceVoucher[] = [];

    constructor(private leadCrmService: LeadCrmService, private messageService: MessageService) {}

    ngOnInit() {
        this.leadCrmService.getQuotations().subscribe({
            next: (data) => this.quotations = data,
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load quotations' })
        });
        this.leadCrmService.getVouchers().subscribe({
            next: (data) => this.vouchers = data.filter(v => v.status !== 'Cancelled'),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load vouchers' })
        });
    }

    downloadQuotation(q: Quotation) {
        // Generate a simple text-based download for now
        const content = `QUOTATION: ${q.quotationNumber}\nClient: ${q.clientName}\nEmail: ${q.clientEmail || '-'}\nPax: ${q.pax}\nTotal: ${q.totalAmount} ${q.currency}\nStatus: ${q.status}\nCreated: ${q.createdAt}\nNotes: ${q.notes || '-'}`;
        this.downloadFile(`${q.quotationNumber}.txt`, content);
        this.messageService.add({ severity: 'info', summary: 'Downloaded', detail: `${q.quotationNumber} document generated` });
    }

    downloadVoucher(v: ServiceVoucher) {
        const content = `SERVICE VOUCHER: ${v.voucherNumber}\nType: ${v.voucherType}\nSupplier: ${v.supplierName || '-'}\nBooking: ${v.bookingReference || '-'}\nService Date: ${v.serviceDate || '-'}\nDetails: ${v.details || '-'}\nStatus: ${v.status}`;
        this.downloadFile(`${v.voucherNumber}.txt`, content);
        this.messageService.add({ severity: 'info', summary: 'Downloaded', detail: `${v.voucherNumber} voucher generated` });
    }

    private downloadFile(filename: string, content: string) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
