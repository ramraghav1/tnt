import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { LeadCrmService, Lead, QuotationLineItem } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-quotation-create',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, ToastModule, InputTextModule,
        InputNumberModule, TextareaModule, SelectModule, DatePickerModule, DividerModule, CardModule
    ],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <div class="flex items-center gap-3 mb-6">
                <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-file-plus text-primary text-xl"></i>
                </div>
                <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Create Quotation</h2>
            </div>

            <!-- Client Info -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="flex flex-col gap-2">
                    <label class="font-semibold">Link to Lead</label>
                    <p-select [(ngModel)]="quotation.leadId" [options]="leadOptions" optionLabel="label" optionValue="value"
                              placeholder="Optional - select lead" [showClear]="true" (onChange)="onLeadSelected()" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold">Client Name *</label>
                    <input pInputText [(ngModel)]="quotation.clientName" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold">Client Email</label>
                    <input pInputText [(ngModel)]="quotation.clientEmail" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold">Client Phone</label>
                    <input pInputText [(ngModel)]="quotation.clientPhone" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold">Pax *</label>
                    <p-inputNumber [(ngModel)]="quotation.pax" [min]="1" [max]="999" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold">Currency</label>
                    <p-select [(ngModel)]="quotation.currency" [options]="currencyOptions" optionLabel="label" optionValue="value" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold">Travel Date From</label>
                    <p-datepicker [(ngModel)]="quotation.travelDateFrom" dateFormat="yy-mm-dd" [showIcon]="true" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold">Travel Date To</label>
                    <p-datepicker [(ngModel)]="quotation.travelDateTo" dateFormat="yy-mm-dd" [showIcon]="true" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold">Valid Until</label>
                    <p-datepicker [(ngModel)]="quotation.validUntil" dateFormat="yy-mm-dd" [showIcon]="true" />
                </div>
            </div>

            <p-divider />

            <!-- Line Items -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold m-0">Line Items</h3>
                    <button pButton label="Add Item" icon="pi pi-plus" severity="secondary" size="small" (click)="addLineItem()"></button>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-surface-50 dark:bg-surface-800">
                                <th class="text-left p-3 font-semibold" style="width:120px">Type</th>
                                <th class="text-left p-3 font-semibold">Description</th>
                                <th class="text-right p-3 font-semibold" style="width:80px">Qty</th>
                                <th class="text-right p-3 font-semibold" style="width:140px">Unit Price</th>
                                <th class="text-right p-3 font-semibold" style="width:140px">Total</th>
                                <th class="text-center p-3" style="width:60px"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let item of lineItems; let i = index" class="border-b border-surface-200 dark:border-surface-700">
                                <td class="p-2">
                                    <p-select [(ngModel)]="item.itemType" [options]="itemTypeOptions" optionLabel="label" optionValue="value" placeholder="Type" appendTo="body" />
                                </td>
                                <td class="p-2">
                                    <input pInputText [(ngModel)]="item.description" class="w-full" placeholder="Description" />
                                </td>
                                <td class="p-2">
                                    <p-inputNumber [(ngModel)]="item.quantity" [min]="1" (onInput)="calculateTotals()" [inputStyle]="{'text-align':'right', 'width':'70px'}" />
                                </td>
                                <td class="p-2">
                                    <p-inputNumber [(ngModel)]="item.unitPrice" mode="decimal" [minFractionDigits]="2" (onInput)="calculateTotals()" [inputStyle]="{'text-align':'right', 'width':'120px'}" />
                                </td>
                                <td class="p-2 text-right font-semibold">{{ (item.quantity || 0) * (item.unitPrice || 0) | number:'1.2-2' }}</td>
                                <td class="p-2 text-center">
                                    <button pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (click)="removeLineItem(i)"></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <p-divider />

            <!-- Totals -->
            <div class="flex justify-end mb-6">
                <div class="w-72">
                    <div class="flex justify-between py-2">
                        <span class="text-muted-color">Subtotal</span>
                        <span class="font-semibold">{{ quotation.subtotal | number:'1.2-2' }} {{ quotation.currency }}</span>
                    </div>
                    <div class="flex justify-between py-2 items-center">
                        <span class="text-muted-color">Discount</span>
                        <p-inputNumber [(ngModel)]="quotation.discountAmount" mode="decimal" [minFractionDigits]="2" (onInput)="calculateTotals()" [inputStyle]="{'text-align':'right', 'width':'100px'}" />
                    </div>
                    <div class="flex justify-between py-2 items-center">
                        <span class="text-muted-color">Tax</span>
                        <p-inputNumber [(ngModel)]="quotation.taxAmount" mode="decimal" [minFractionDigits]="2" (onInput)="calculateTotals()" [inputStyle]="{'text-align':'right', 'width':'100px'}" />
                    </div>
                    <p-divider />
                    <div class="flex justify-between py-2">
                        <span class="text-lg font-bold">Total</span>
                        <span class="text-lg font-bold text-primary">{{ quotation.totalAmount | number:'1.2-2' }} {{ quotation.currency }}</span>
                    </div>
                </div>
            </div>

            <!-- Notes -->
            <div class="flex flex-col gap-2 mb-6">
                <label class="font-semibold">Notes</label>
                <textarea pTextarea [(ngModel)]="quotation.notes" rows="3" placeholder="Additional notes or terms..."></textarea>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3">
                <button pButton label="Cancel" icon="pi pi-times" severity="secondary" (click)="cancel()"></button>
                <button pButton label="Save Quotation" icon="pi pi-check" (click)="save()" [loading]="saving"></button>
            </div>
        </div>
    `
})
export class QuotationCreate implements OnInit {
    quotation: any = { pax: 1, currency: 'USD', subtotal: 0, discountAmount: 0, taxAmount: 0, totalAmount: 0 };
    lineItems: QuotationLineItem[] = [];
    leads: Lead[] = [];
    leadOptions: any[] = [];
    saving = false;

    currencyOptions = [
        { label: 'USD', value: 'USD' }, { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' }, { label: 'NPR', value: 'NPR' }, { label: 'AUD', value: 'AUD' }
    ];

    itemTypeOptions = [
        { label: 'Accommodation', value: 'Accommodation' },
        { label: 'Transport', value: 'Transport' },
        { label: 'Activity', value: 'Activity' },
        { label: 'Guide', value: 'Guide' },
        { label: 'Meal', value: 'Meal' },
        { label: 'Permit', value: 'Permit' },
        { label: 'Flight', value: 'Flight' },
        { label: 'Other', value: 'Other' }
    ];

    constructor(
        private leadCrmService: LeadCrmService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit() {
        this.leadCrmService.getLeads().subscribe({
            next: (leads) => {
                this.leads = leads;
                this.leadOptions = leads.map(l => ({ label: `#${l.id} - ${l.name}`, value: l.id }));
            }
        });
        this.addLineItem();
    }

    onLeadSelected() {
        if (this.quotation.leadId) {
            const lead = this.leads.find(l => l.id === this.quotation.leadId);
            if (lead) {
                this.quotation.clientName = lead.name;
                this.quotation.clientEmail = lead.email;
                this.quotation.clientPhone = lead.phone;
                this.quotation.pax = lead.pax || 1;
                this.quotation.travelDateFrom = lead.travelDateFrom;
                this.quotation.travelDateTo = lead.travelDateTo;
                this.quotation.currency = lead.currency || 'USD';
            }
        }
    }

    addLineItem() {
        this.lineItems.push({ itemType: 'Accommodation', description: '', quantity: 1, unitPrice: 0, sortOrder: this.lineItems.length + 1 });
    }

    removeLineItem(index: number) {
        this.lineItems.splice(index, 1);
        this.calculateTotals();
    }

    calculateTotals() {
        this.quotation.subtotal = this.lineItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
        this.quotation.totalAmount = this.quotation.subtotal - (this.quotation.discountAmount || 0) + (this.quotation.taxAmount || 0);
    }

    save() {
        if (!this.quotation.clientName?.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Client name is required' });
            return;
        }
        if (this.lineItems.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Add at least one line item' });
            return;
        }
        this.saving = true;
        this.calculateTotals();
        const payload = { ...this.quotation, lineItems: this.lineItems };
        this.leadCrmService.createQuotation(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Quotation created' });
                setTimeout(() => this.router.navigate(['/quotations']), 1000);
            },
            error: () => { this.saving = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create quotation' }); }
        });
    }

    cancel() {
        this.router.navigate(['/quotations']);
    }
}
