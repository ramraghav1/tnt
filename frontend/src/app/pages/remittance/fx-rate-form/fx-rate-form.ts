import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';

import {
    RemittanceService,
    Country,
    PaymentType,
    Agent,
    FxRateSetup,
    FxRateHistoryItem,
    CreateFxRateRequest,
    UpdateFxRateRequest,
    ConvertRequest,
    ConvertResponse
} from '../remittance.service';

@Component({
    selector: 'app-fx-rate-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FluidModule,
        InputTextModule,
        ButtonModule,
        SelectModule,
        ToggleSwitchModule,
        InputNumberModule,
        ToastModule,
        DividerModule,
        TagModule,
        TableModule,
        ToolbarModule,
        CardModule,
        DatePickerModule
    ],
    providers: [MessageService],
    templateUrl: './fx-rate-form.html',
    styleUrls: ['./fx-rate-form.scss']
})
export class FxRateForm implements OnInit {
    // Reference data
    countries: Country[] = [];
    paymentTypes: PaymentType[] = [];
    agents: Agent[] = [];
    filteredAgents: Agent[] = [];

    // Dropdown options
    marginTypeOptions = [
        { label: 'Flat Amount', value: 'Flat' },
        { label: 'Percentage', value: 'Percentage' }
    ];

    // Form state
    editMode = false;
    editId: number | null = null;
    submitting = false;
    loading = false;

    // Form model
    sendingCountryId: number | null = null;
    receivingCountryId: number | null = null;
    paymentTypeId: number | null = null;
    agentId: number | null = null;
    sendingCurrency: string = '';
    receivingCurrency: string = '';
    settlementCurrency: string = '';
    customerRate: number | null = null;
    settlementRate: number | null = null;
    crossRate: number | null = null;
    marginType: string | null = null;
    marginValue: number | null = null;
    validFrom: Date | null = null;
    validTo: Date | null = null;
    isActive: boolean = true;

    // Rate history (edit mode)
    history: FxRateHistoryItem[] = [];

    // Rate calculator
    calcAmount: number | null = null;
    calcResult: ConvertResponse | null = null;
    calcLoading = false;

    constructor(
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadReferenceData();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.editMode = true;
                this.editId = +params['id'];
                this.loadSetup(this.editId);
            }
        });
    }

    loadReferenceData() {
        this.remittanceService.getCountries().subscribe({
            next: (data) => { this.countries = data.filter(c => c.isActive); this.cdr.detectChanges(); }
        });
        this.remittanceService.getPaymentTypes().subscribe({
            next: (data) => { this.paymentTypes = data.filter(pt => pt.isActive); this.cdr.detectChanges(); }
        });
        this.remittanceService.getAgents().subscribe({
            next: (data) => { this.agents = data.filter(a => a.isActive); this.cdr.detectChanges(); }
        });
    }

    loadSetup(id: number) {
        this.loading = true;
        this.remittanceService.getFxRate(id).subscribe({
            next: (setup: FxRateSetup) => {
                this.sendingCountryId = setup.sendingCountryId;
                this.receivingCountryId = setup.receivingCountryId;
                this.paymentTypeId = setup.paymentTypeId;
                this.agentId = setup.agentId;
                this.sendingCurrency = setup.sendingCurrency;
                this.receivingCurrency = setup.receivingCurrency;
                this.settlementCurrency = setup.settlementCurrency || '';
                this.customerRate = setup.customerRate;
                this.settlementRate = setup.settlementRate;
                this.crossRate = setup.crossRate;
                this.marginType = setup.marginType;
                this.marginValue = setup.marginValue;
                this.validFrom = setup.validFrom ? new Date(setup.validFrom) : null;
                this.validTo = setup.validTo ? new Date(setup.validTo) : null;
                this.isActive = setup.isActive;
                this.history = setup.history || [];

                this.onSendingCountryChange();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load FX rate setup' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    onSendingCountryChange() {
        if (this.sendingCountryId) {
            this.filteredAgents = this.agents.filter(a => a.countryId === this.sendingCountryId);
            // Auto-set sending currency from country
            const country = this.countries.find(c => c.id === this.sendingCountryId);
            if (country && !this.sendingCurrency) {
                this.sendingCurrency = country.currencyCode;
            }
        } else {
            this.filteredAgents = [];
            this.sendingCurrency = '';
        }
        // Reset agent if not in filtered list
        if (this.agentId && !this.filteredAgents.find(a => a.id === this.agentId)) {
            this.agentId = null;
        }
    }

    onReceivingCountryChange() {
        if (this.receivingCountryId) {
            const country = this.countries.find(c => c.id === this.receivingCountryId);
            if (country && !this.receivingCurrency) {
                this.receivingCurrency = country.currencyCode;
            }
        } else {
            this.receivingCurrency = '';
        }
    }

    get needsSettlement(): boolean {
        return !!this.settlementCurrency && this.settlementCurrency !== this.sendingCurrency && this.settlementCurrency !== this.receivingCurrency;
    }

    get needsCrossRate(): boolean {
        return this.needsSettlement;
    }

    isFormValid(): boolean {
        if (!this.sendingCountryId || !this.receivingCountryId || !this.paymentTypeId) return false;
        if (!this.sendingCurrency || !this.receivingCurrency) return false;
        if (this.customerRate == null || this.customerRate <= 0) return false;
        return true;
    }

    saveSetup() {
        if (!this.isFormValid()) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please fill all required fields correctly.' });
            return;
        }

        this.submitting = true;

        if (this.editMode && this.editId) {
            const req: UpdateFxRateRequest = {
                sendingCurrency: this.sendingCurrency,
                receivingCurrency: this.receivingCurrency,
                settlementCurrency: this.settlementCurrency || null,
                customerRate: this.customerRate!,
                settlementRate: this.settlementRate,
                crossRate: this.crossRate,
                marginType: this.marginType,
                marginValue: this.marginValue,
                validFrom: this.validFrom ? this.validFrom.toISOString() : null,
                validTo: this.validTo ? this.validTo.toISOString() : null,
                isActive: this.isActive,
                updatedBy: 'admin'
            };
            this.remittanceService.updateFxRate(this.editId, req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'FX rate updated' });
                    this.submitting = false;
                    this.cdr.detectChanges();
                    setTimeout(() => this.router.navigate(['/remittance/fx-rates']), 1000);
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' });
                    this.submitting = false;
                    this.cdr.detectChanges();
                }
            });
        } else {
            const req: CreateFxRateRequest = {
                sendingCountryId: this.sendingCountryId!,
                receivingCountryId: this.receivingCountryId!,
                paymentTypeId: this.paymentTypeId!,
                agentId: this.agentId,
                sendingCurrency: this.sendingCurrency,
                receivingCurrency: this.receivingCurrency,
                settlementCurrency: this.settlementCurrency || null,
                customerRate: this.customerRate!,
                settlementRate: this.settlementRate,
                crossRate: this.crossRate,
                marginType: this.marginType,
                marginValue: this.marginValue,
                validFrom: this.validFrom ? this.validFrom.toISOString() : null,
                validTo: this.validTo ? this.validTo.toISOString() : null,
                createdBy: 'admin'
            };
            this.remittanceService.createFxRate(req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'FX rate created' });
                    this.submitting = false;
                    this.cdr.detectChanges();
                    setTimeout(() => this.router.navigate(['/remittance/fx-rates']), 1000);
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' });
                    this.submitting = false;
                    this.cdr.detectChanges();
                }
            });
        }
    }

    // Rate Calculator
    calculateConversion() {
        if (!this.sendingCountryId || !this.receivingCountryId || !this.paymentTypeId || !this.calcAmount) {
            this.messageService.add({ severity: 'warn', summary: 'Calculator', detail: 'Fill corridor details and enter an amount.' });
            return;
        }

        this.calcLoading = true;
        const req: ConvertRequest = {
            sendingCountryId: this.sendingCountryId!,
            receivingCountryId: this.receivingCountryId!,
            paymentTypeId: this.paymentTypeId!,
            agentId: this.agentId,
            amount: this.calcAmount!
        };
        this.remittanceService.convertAmount(req).subscribe({
            next: (result) => {
                this.calcResult = result;
                this.calcLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Calculator', detail: 'Conversion failed. Rate may not exist.' });
                this.calcLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    goBack() {
        this.router.navigate(['/remittance/fx-rates']);
    }

    getSendingCountryName(): string {
        const c = this.countries.find(x => x.id === this.sendingCountryId);
        return c ? c.name : '';
    }

    getReceivingCountryName(): string {
        const c = this.countries.find(x => x.id === this.receivingCountryId);
        return c ? c.name : '';
    }

    getPaymentTypeName(): string {
        const pt = this.paymentTypes.find(x => x.id === this.paymentTypeId);
        return pt ? pt.name : '';
    }

    formatRate(rate: number | null): string {
        if (rate == null) return '—';
        return rate.toFixed(6);
    }
}
