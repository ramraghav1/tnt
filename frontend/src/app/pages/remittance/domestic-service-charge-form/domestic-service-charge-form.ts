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
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import {
    RemittanceService,
    Configuration,
    PaymentType,
    Agent,
    DomesticServiceChargeSlab,
    CreateDomesticServiceChargeSetupRequest,
    UpdateDomesticServiceChargeSetupRequest
} from '../remittance.service';

@Component({
    selector: 'app-domestic-service-charge-form',
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
        RadioButtonModule,
        ToastModule,
        DividerModule,
        TagModule,
        TableModule,
        ToolbarModule,
        CardModule,
        TooltipModule
    ],
    providers: [MessageService],
    templateUrl: './domestic-service-charge-form.html',
    styleUrls: ['./domestic-service-charge-form.scss']
})
export class DomesticServiceChargeForm implements OnInit {
    // Reference data
    categories: Configuration[] = [];
    paymentTypes: PaymentType[] = [];
    agents: Agent[] = [];

    // Dropdown options
    chargeModeOptions = [
        { label: 'Flat (Same charge for all amounts)', value: 'Flat' },
        { label: 'Range (Different charges per amount slab)', value: 'Range' }
    ];
    chargeTypeOptions = [
        { label: 'Flat Amount', value: 'Flat' },
        { label: 'Percentage', value: 'Percentage' }
    ];

    // Form state
    editMode = false;
    editId: number | null = null;
    submitting = false;
    loading = false;

    // Form model
    fromCategoryId: number | null = null;
    toCategoryId: number | null = null;
    paymentTypeId: number | null = null;
    agentId: number | null = null;
    chargeMode: string = 'Flat';
    isActive: boolean = true;
    currency: string = 'NPR';

    // Slabs
    slabs: DomesticServiceChargeSlab[] = [];

    constructor(
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadReferenceData();

        // Check if editing
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.editMode = true;
                this.editId = +params['id'];
                this.loadSetup(this.editId);
            } else {
                // Initialize with one default slab for Flat mode
                this.addSlab();
            }
        });
    }

    loadReferenceData() {
        this.remittanceService.getConfigurations().subscribe({
            next: (data) => { this.categories = data.filter(c => c.isActive); this.cdr.detectChanges(); }
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
        this.remittanceService.getDomesticServiceCharge(id).subscribe({
            next: (setup) => {
                this.fromCategoryId = setup.fromCategoryId;
                this.toCategoryId = setup.toCategoryId;
                this.paymentTypeId = setup.paymentTypeId;
                this.agentId = setup.agentId;
                this.chargeMode = setup.chargeMode;
                this.isActive = setup.isActive;
                this.slabs = setup.slabs || [];
                if (this.slabs.length > 0) {
                    this.currency = this.slabs[0].currency || 'NPR';
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load setup' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    onChargeModeChange() {
        this.slabs = [];
        if (this.chargeMode === 'Flat') {
            this.slabs.push({
                minAmount: 0,
                maxAmount: 999999999,
                chargeType: 'Flat',
                chargeValue: 0,
                sendCommission: 0,
                payoutCommission: 0,
                currency: this.currency
            });
        } else {
            this.addSlab();
        }
    }

    addSlab() {
        const lastMax = this.slabs.length > 0 ? this.slabs[this.slabs.length - 1].maxAmount : 0;
        this.slabs.push({
            minAmount: lastMax > 0 ? lastMax + 0.01 : 0,
            maxAmount: 0,
            chargeType: 'Flat',
            chargeValue: 0,
            sendCommission: 0,
            payoutCommission: 0,
            currency: this.currency
        });
    }

    removeSlab(index: number) {
        if (this.slabs.length > 1) {
            this.slabs.splice(index, 1);
        }
    }

    trackBySlab(index: number, _slab: any): number {
        return index;
    }

    onCurrencyChange() {
        this.slabs.forEach(s => s.currency = this.currency);
    }

    isFormValid(): boolean {
        if (!this.fromCategoryId || !this.toCategoryId || !this.paymentTypeId || !this.chargeMode || !this.currency) {
            return false;
        }
        if (this.slabs.length === 0) return false;

        for (const slab of this.slabs) {
            if (this.chargeMode === 'Range') {
                if (slab.minAmount < 0 || slab.maxAmount <= 0 || slab.maxAmount <= slab.minAmount) return false;
            }
            if (slab.chargeValue <= 0) return false;
            if (!slab.chargeType) return false;
        }
        return true;
    }

    saveSetup() {
        if (!this.isFormValid()) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please fill all required fields correctly.' });
            return;
        }

        this.onCurrencyChange();
        this.submitting = true;

        if (this.editMode && this.editId) {
            const req: UpdateDomesticServiceChargeSetupRequest = {
                chargeMode: this.chargeMode,
                isActive: this.isActive,
                slabs: this.slabs
            };
            this.remittanceService.updateDomesticServiceCharge(this.editId, req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Domestic service charge updated' });
                    this.submitting = false;
                    this.cdr.detectChanges();
                    setTimeout(() => this.router.navigate(['/remittance/domestic-service-charges']), 1000);
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' });
                    this.submitting = false;
                    this.cdr.detectChanges();
                }
            });
        } else {
            const req: CreateDomesticServiceChargeSetupRequest = {
                fromCategoryId: this.fromCategoryId!,
                toCategoryId: this.toCategoryId!,
                paymentTypeId: this.paymentTypeId!,
                agentId: this.agentId,
                chargeMode: this.chargeMode,
                slabs: this.slabs
            };
            this.remittanceService.createDomesticServiceCharge(req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Domestic service charge created' });
                    this.submitting = false;
                    this.cdr.detectChanges();
                    setTimeout(() => this.router.navigate(['/remittance/domestic-service-charges']), 1000);
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' });
                    this.submitting = false;
                    this.cdr.detectChanges();
                }
            });
        }
    }

    goBack() {
        this.router.navigate(['/remittance/domestic-service-charges']);
    }

    getFromCategoryName(): string {
        const c = this.categories.find(x => x.id === this.fromCategoryId);
        return c ? c.displayName : '';
    }

    getToCategoryName(): string {
        const c = this.categories.find(x => x.id === this.toCategoryId);
        return c ? c.displayName : '';
    }

    getPaymentTypeName(): string {
        const pt = this.paymentTypes.find(x => x.id === this.paymentTypeId);
        return pt ? pt.name : '';
    }
}
