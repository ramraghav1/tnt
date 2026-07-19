import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';
import { FluidModule } from 'primeng/fluid';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { forkJoin } from 'rxjs';

import {
    RemittanceService,
    PaymentType,
    Country,
    CalculateChargeRequest,
    CalculateChargeResponse,
    ConvertRequest,
    ConvertResponse,
    Agent,
    Branch,
    CreateTransactionRequest,
    CreateTransactionResponse,
    AdministrativeDivision,
    DomesticCalculateChargeRequest,
    DomesticCalculateChargeResponse,
    Configuration
} from '../remittance.service';

interface PersonInfo {
    name: string;
    address: string;
    mobile: string;
    showOther: boolean;
    selectedProvince?: AdministrativeDivision | null;
    selectedDistrict?: AdministrativeDivision | null;
    selectedLocalLevel?: AdministrativeDivision | null;
    wardNo?: string;
    idType?: string;
    idNumber?: string;
    issueDate?: string;
    expiryDate?: string;
}

@Component({
    selector: 'app-send-transaction',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        CheckboxModule,
        DialogModule,
        StepsModule,
        FluidModule,
        SelectModule,
        ToastModule,
        TagModule,
        ProgressSpinnerModule
    ],
    providers: [MessageService],
    templateUrl: './send-transaction.html',
    styleUrls: ['./send-transaction.scss']
})
export class SendTransaction implements OnInit {
    step = 1;
    steps = [
        { label: 'Transaction' },
        { label: 'Sender' },
        { label: 'Receiver' },
        { label: 'Confirm' }
    ];

    // Dropdowns from API
    countries: Country[] = [];
    paymentTypes: PaymentType[] = [];
    agents: Agent[] = [];
    locationCategories: Configuration[] = [];

    // Selected values
    sendingCountry: Country | null = null;
    receivingCountry: Country | null = null;
    selectedPaymentType: PaymentType | null = null;
    selectedAgent: Agent | null = null;
    selectedFromCategory: Configuration | null = null;
    selectedToCategory: Configuration | null = null;

    // Sender Agent & Branch
    selectedSenderAgent: Agent | null = null;
    senderBranches: Branch[] = [];
    selectedSenderBranch: Branch | null = null;

    // Payout Agent & Branch
    selectedPayoutAgent: Agent | null = null;
    payoutBranches: Branch[] = [];
    selectedPayoutBranch: Branch | null = null;

    // Payment-type-driven payout mode
    payoutMode: 'none' | 'cash' | 'bank' | 'wallet' | 'agent' = 'none';
    cashPayoutLabel = '';  // e.g. "Anywhere in Nepal"
    payoutAgentOptions: Agent[] = [];  // filtered agents for bank/wallet
    payoutBranchOptions: Branch[] = [];

    // Transaction amounts
    transaction = {
        transferAmount: null as number | null,
        serviceFee: null as number | null,
        collectedAmount: null as number | null
    };

    // FX rate info
    fxInfo: ConvertResponse | null = null;

    // Domestic fee info
    domesticFeeInfo: DomesticCalculateChargeResponse | null = null;
    loadingDomesticFee = false;

    // Loading states
    loadingFee = false;
    loadingFx = false;
    loadingPayout = false;
    submitting = false;

    // Sender / Receiver
    sender: PersonInfo = { name: '', address: '', mobile: '', showOther: false, selectedProvince: null, selectedDistrict: null, selectedLocalLevel: null };
    receiver: PersonInfo = { name: '', address: '', mobile: '', showOther: false, selectedProvince: null, selectedDistrict: null, selectedLocalLevel: null };

    // Administrative divisions for sender
    senderProvinces: AdministrativeDivision[] = [];
    senderDistricts: AdministrativeDivision[] = [];
    senderLocalLevels: AdministrativeDivision[] = [];

    // Administrative divisions for receiver
    receiverProvinces: AdministrativeDivision[] = [];
    receiverDistricts: AdministrativeDivision[] = [];
    receiverLocalLevels: AdministrativeDivision[] = [];

    // Receipt
    showReceipt = false;
    receiptData: CreateTransactionResponse | null = null;

    constructor(
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadDropdowns();
    }

    loadDropdowns() {
        this.remittanceService.getCountries().subscribe({
            next: (data) => {
                this.countries = data.filter(c => c.isActive);
                // Auto-select first country for FX rate calculation
                if (this.countries.length > 0) {
                    this.sendingCountry = this.countries[0];
                    this.receivingCountry = this.countries[0];
                }
                this.cdr.detectChanges();
            }
        });
        this.remittanceService.getPaymentTypes().subscribe({
            next: (data) => {
                this.paymentTypes = data.filter(pt => pt.isActive);
                this.cdr.detectChanges();
            }
        });
        this.remittanceService.getAgents().subscribe({
            next: (data) => {
                this.agents = data.filter(a => a.isActive);
                this.cdr.detectChanges();
            }
        });
        this.remittanceService.getConfigurationsByType(1).subscribe({
            next: (data) => {
                this.locationCategories = data.filter(c => c.isActive);
                this.cdr.detectChanges();
            },
            error: () => { this.locationCategories = []; }
        });
    }

    // When user changes transfer amount -> auto-calculate service fee
    onAmountChange() {
        const amount = Number(this.transaction.transferAmount) || 0;
        if (amount <= 0) {
            this.transaction.serviceFee = null;
            this.transaction.collectedAmount = null;
            this.fxInfo = null;
            this.domesticFeeInfo = null;
            return;
        }
        this.calculateDomesticServiceFee(amount);
        this.calculateFxRate(amount);
    }

    calculateServiceFee(amount: number) {
        if (!this.sendingCountry || !this.receivingCountry || !this.selectedPaymentType) {
            return;
        }
        this.loadingFee = true;
        const req: CalculateChargeRequest = {
            sendingCountryId: this.sendingCountry.id,
            receivingCountryId: this.receivingCountry.id,
            paymentTypeId: this.selectedPaymentType.id,
            agentId: this.selectedAgent?.id ?? null,
            amount
        };
        this.remittanceService.calculateCharge(req).subscribe({
            next: (res: CalculateChargeResponse) => {
                this.transaction.serviceFee = res.calculatedCharge;
                this.transaction.collectedAmount = amount + res.calculatedCharge;
                this.loadingFee = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.transaction.serviceFee = 0;
                this.transaction.collectedAmount = amount;
                this.loadingFee = false;
                this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Could not calculate service fee. It may not be configured for this corridor.' });
                this.cdr.detectChanges();
            }
        });
    }

    calculateFxRate(amount: number) {
        if (!this.sendingCountry || !this.receivingCountry || !this.selectedPaymentType) {
            return;
        }
        this.loadingFx = true;
        const req: ConvertRequest = {
            sendingCountryId: this.sendingCountry.id,
            receivingCountryId: this.receivingCountry.id,
            paymentTypeId: this.selectedPaymentType.id,
            agentId: this.selectedAgent?.id ?? null,
            amount
        };
        this.remittanceService.convertAmount(req).subscribe({
            next: (res: ConvertResponse) => {
                this.fxInfo = res;
                this.loadingFx = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.fxInfo = null;
                this.loadingFx = false;
                this.cdr.detectChanges();
            }
        });
    }

    calculateDomesticServiceFee(amount: number) {
        if (!this.selectedFromCategory || !this.selectedToCategory || !this.selectedPaymentType) {
            this.domesticFeeInfo = null;
            this.transaction.serviceFee = 0;
            this.transaction.collectedAmount = amount;
            return;
        }
        this.loadingFee = true;
        this.loadingDomesticFee = true;
        const req: DomesticCalculateChargeRequest = {
            fromCategoryId: this.selectedFromCategory.id,
            toCategoryId: this.selectedToCategory.id,
            paymentTypeId: this.selectedPaymentType.id,
            agentId: this.selectedAgent?.id ?? null,
            amount
        };
        this.remittanceService.calculateDomesticCharge(req).subscribe({
            next: (res: DomesticCalculateChargeResponse) => {
                this.domesticFeeInfo = res;
                this.transaction.serviceFee = res.serviceCharge;
                this.transaction.collectedAmount = amount + res.serviceCharge;
                this.loadingFee = false;
                this.loadingDomesticFee = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.domesticFeeInfo = null;
                this.transaction.serviceFee = 0;
                this.transaction.collectedAmount = amount;
                this.loadingFee = false;
                this.loadingDomesticFee = false;
                this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Could not calculate domestic service charge.' });
                this.cdr.detectChanges();
            }
        });
    }

    onCorridorChange() {
        // Reset amounts when corridor changes
        this.transaction.serviceFee = null;
        this.transaction.collectedAmount = null;
        this.fxInfo = null;
        this.domesticFeeInfo = null;
        if (this.transaction.transferAmount && this.transaction.transferAmount > 0) {
            this.onAmountChange();
        }
    }

    // ===== Payment Type Change: drives payout section =====
    onPaymentTypeChange() {
        // Reset payout selections
        this.payoutMode = 'none';
        this.cashPayoutLabel = '';
        this.selectedPayoutAgent = null;
        this.selectedPayoutBranch = null;
        this.payoutAgentOptions = [];
        this.payoutBranchOptions = [];
        this.payoutBranches = [];

        if (!this.selectedPaymentType) {
            this.onCorridorChange();
            return;
        }

        const name = this.selectedPaymentType.name.toLowerCase();

        if (name.includes('cash')) {
            this.payoutMode = 'cash';
            this.loadingPayout = true;
            // Fetch configured cash payout agent & branch from Configuration
            forkJoin({
                agentConfigs: this.remittanceService.getConfigurationsByTypeName('AnywhereNepalCashPayoutAgent'),
                branchConfigs: this.remittanceService.getConfigurationsByTypeName('AnywhereNepalCashPayoutBranch')
            }).subscribe({
                next: ({ agentConfigs, branchConfigs }) => {
                    const agentCode = agentConfigs.length > 0 ? agentConfigs[0].code : null;
                    const branchCode = branchConfigs.length > 0 ? branchConfigs[0].code : null;

                    if (agentCode) {
                        const agentId = Number(agentCode);
                        this.selectedPayoutAgent = this.agents.find(a => a.id === agentId) ?? null;
                    }
                    if (branchCode && this.selectedPayoutAgent) {
                        const branchId = Number(branchCode);
                        // Load branches for this agent to find the matching one
                        this.remittanceService.getBranchesByAgent(this.selectedPayoutAgent.id).subscribe({
                            next: (branches) => {
                                this.payoutBranches = branches;
                                this.selectedPayoutBranch = branches.find(b => b.id === branchId) ?? null;
                                this.cashPayoutLabel = agentConfigs[0]?.displayName || 'Anywhere in Nepal';
                                this.loadingPayout = false;
                                this.cdr.detectChanges();
                            },
                            error: () => {
                                this.cashPayoutLabel = agentConfigs[0]?.displayName || 'Anywhere in Nepal';
                                this.loadingPayout = false;
                                this.cdr.detectChanges();
                            }
                        });
                    } else {
                        this.cashPayoutLabel = agentConfigs.length > 0 ? (agentConfigs[0].displayName || 'Anywhere in Nepal') : 'Anywhere in Nepal';
                        this.loadingPayout = false;
                        this.cdr.detectChanges();
                    }
                },
                error: () => {
                    this.cashPayoutLabel = 'Anywhere in Nepal';
                    this.loadingPayout = false;
                    this.cdr.detectChanges();
                }
            });
        } else if (name.includes('bank')) {
            this.payoutMode = 'bank';
            // Filter agents that are banks (agentType contains 'bank')
            this.payoutAgentOptions = this.agents.filter(a => a.agentType?.toLowerCase().includes('bank'));
        } else if (name.includes('wallet')) {
            this.payoutMode = 'wallet';
            // Filter agents that are wallets
            this.payoutAgentOptions = this.agents.filter(a => a.agentType?.toLowerCase().includes('wallet'));
        } else {
            // Generic: show all agents as payout
            this.payoutMode = 'agent';
            this.payoutAgentOptions = this.agents;
        }

        this.onCorridorChange();
    }

    onSenderAgentChange() {
        this.senderBranches = [];
        this.selectedSenderBranch = null;
        if (this.selectedSenderAgent) {
            this.remittanceService.getBranchesByAgent(this.selectedSenderAgent.id).subscribe({
                next: (data) => {
                    this.senderBranches = data.filter(b => b.isActive);
                    this.cdr.detectChanges();
                }
            });
        }
    }

    onPayoutAgentChange() {
        this.payoutBranches = [];
        this.selectedPayoutBranch = null;
        if (this.selectedPayoutAgent) {
            this.remittanceService.getBranchesByAgent(this.selectedPayoutAgent.id).subscribe({
                next: (data) => {
                    this.payoutBranches = data.filter(b => b.isActive);
                    this.payoutBranchOptions = this.payoutBranches;
                    this.cdr.detectChanges();
                }
            });
        }
    }

    get payoutModeLabel(): string {
        switch (this.payoutMode) {
            case 'cash': return this.cashPayoutLabel;
            case 'bank': return this.selectedPayoutAgent?.name ?? 'Select Bank';
            case 'wallet': return this.selectedPayoutAgent?.name ?? 'Select Wallet';
            default: return this.selectedPayoutAgent?.name ?? '-';
        }
    }

    get payoutSummaryLabel(): string {
        if (this.payoutMode === 'cash') return this.cashPayoutLabel;
        const parts: string[] = [];
        if (this.selectedPayoutAgent) parts.push(this.selectedPayoutAgent.name);
        if (this.selectedPayoutBranch) parts.push(this.selectedPayoutBranch.branchName);
        return parts.length > 0 ? parts.join(' / ') : '-';
    }

    // --- Administrative Division cascading ---
    loadProvinces(countryId: number, target: 'sender' | 'receiver') {
        countryId=121;
        this.remittanceService.getAdminDivisionsByCountryAndLevel(countryId, 1).subscribe({
            next: (data) => {
                if (target === 'sender') {
                    this.senderProvinces = data;
                    this.senderDistricts = [];
                    this.senderLocalLevels = [];
                    this.sender.selectedProvince = null;
                    this.sender.selectedDistrict = null;
                    this.sender.selectedLocalLevel = null;
                } else {
                    this.receiverProvinces = data;
                    this.receiverDistricts = [];
                    this.receiverLocalLevels = [];
                    this.receiver.selectedProvince = null;
                    this.receiver.selectedDistrict = null;
                    this.receiver.selectedLocalLevel = null;
                }
                this.cdr.detectChanges();
            }
        });
    }

    onProvinceChange(target: 'sender' | 'receiver') {
        const person = target === 'sender' ? this.sender : this.receiver;
        if (target === 'sender') {
            this.senderDistricts = [];
            this.senderLocalLevels = [];
        } else {
            this.receiverDistricts = [];
            this.receiverLocalLevels = [];
        }
        person.selectedDistrict = null;
        person.selectedLocalLevel = null;

        if (person.selectedProvince) {
            this.remittanceService.getAdminDivisionChildren(person.selectedProvince.id).subscribe({
                next: (data) => {
                    if (target === 'sender') {
                        this.senderDistricts = data;
                    } else {
                        this.receiverDistricts = data;
                    }
                    this.cdr.detectChanges();
                }
            });
        }
        this.updateAddress(target);
    }

    onDistrictChange(target: 'sender' | 'receiver') {
        const person = target === 'sender' ? this.sender : this.receiver;
        if (target === 'sender') {
            this.senderLocalLevels = [];
        } else {
            this.receiverLocalLevels = [];
        }
        person.selectedLocalLevel = null;

        if (person.selectedDistrict) {
            this.remittanceService.getAdminDivisionChildren(person.selectedDistrict.id).subscribe({
                next: (data) => {
                    if (target === 'sender') {
                        this.senderLocalLevels = data;
                    } else {
                        this.receiverLocalLevels = data;
                    }
                    this.cdr.detectChanges();
                }
            });
        }
        this.updateAddress(target);
    }

    onLocalLevelChange(target: 'sender' | 'receiver') {
        this.updateAddress(target);
    }

    updateAddress(target: 'sender' | 'receiver') {
        const person = target === 'sender' ? this.sender : this.receiver;
        const parts: string[] = [];
        if (person.selectedLocalLevel) parts.push(person.selectedLocalLevel.name);
        if (person.wardNo) parts.push(`Ward ${person.wardNo}`);
        if (person.selectedDistrict) parts.push(person.selectedDistrict.name);
        if (person.selectedProvince) parts.push(person.selectedProvince.name);
        person.address = parts.join(', ');
    }

    onWardChange(target: 'sender' | 'receiver') {
        this.updateAddress(target);
    }

    get paymentTypeName(): string {
        return this.selectedPaymentType?.name ?? '-';
    }

    get fromCategoryName(): string {
        return this.selectedFromCategory?.displayName ?? '-';
    }

    get toCategoryName(): string {
        return this.selectedToCategory?.displayName ?? '-';
    }

    get agentName(): string {
        return this.selectedAgent?.name ?? '-';
    }

    next() {
        if (this.step < 4) {
            const nextStep = this.step + 1;
            // Load provinces when entering Sender page (step 2) - default to first country (Nepal)
            if (nextStep === 2 && this.countries.length > 0 && this.senderProvinces.length === 0) {
                this.loadProvinces(this.countries[0].id, 'sender');
            }
            // Load provinces when entering Receiver page (step 3)
            if (nextStep === 3 && this.countries.length > 0 && this.receiverProvinces.length === 0) {
                this.loadProvinces(this.countries[0].id, 'receiver');
            }
            this.step = nextStep;
        }
    }

    prev() {
        if (this.step > 1) this.step--;
    }

    get canProceedStep1(): boolean {
        const hasPaymentType = !!this.selectedPaymentType;
        const hasCategories = !!(this.selectedFromCategory && this.selectedToCategory);
        const hasAmount = !!(this.transaction.transferAmount && this.transaction.transferAmount > 0);
        const hasSender = !!(this.selectedSenderAgent && this.selectedSenderBranch);

        // For cash pay, payout is auto-assigned, no need for user selection
        let hasPayout = false;
        if (this.payoutMode === 'cash') {
            hasPayout = true; // auto-assigned from config
        } else if (this.payoutMode === 'bank' || this.payoutMode === 'wallet' || this.payoutMode === 'agent') {
            hasPayout = !!this.selectedPayoutAgent;
        }

        return hasPaymentType && hasCategories && hasAmount && hasSender && hasPayout;
    }

    confirm() {
        if (this.submitting) return;
        this.submitting = true;

        const payload: CreateTransactionRequest = {
            paymentType: this.paymentTypeName,
            payoutLocation: `${this.fromCategoryName} → ${this.toCategoryName}`,
            collectedAmount: this.transaction.collectedAmount!,
            serviceFee: this.transaction.serviceFee!,
            transferAmount: this.transaction.transferAmount!,
            senderName: this.sender.name,
            senderAddress: this.sender.address,
            senderMobile: this.sender.mobile,
            receiverName: this.receiver.name,
            receiverAddress: this.receiver.address,
            receiverMobile: this.receiver.mobile,
            senderAgentId: this.selectedSenderAgent?.id ?? null,
            senderBranchId: this.selectedSenderBranch?.id ?? null,
            payoutAgentId: this.selectedPayoutAgent?.id ?? null,
            payoutBranchId: this.selectedPayoutBranch?.id ?? null
        };

        this.remittanceService.createTransaction(payload).subscribe({
            next: (res) => {
                this.receiptData = res;
                this.showReceipt = true;
                this.submitting = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `Transaction #${res.transactionId} created` });
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.submitting = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create transaction' });
                this.cdr.detectChanges();
            }
        });
    }

    printReceipt() {
        setTimeout(() => window.print(), 100);
    }

    closeReceipt() {
        this.showReceipt = false;
        this.resetForm();
    }

    resetForm() {
        this.step = 1;
        this.selectedPaymentType = null;
        this.selectedAgent = null;
        this.selectedFromCategory = null;
        this.selectedToCategory = null;
        // Re-select first country for FX rate
        if (this.countries.length > 0) {
            this.sendingCountry = this.countries[0];
            this.receivingCountry = this.countries[0];
        }
        this.transaction = { transferAmount: null, serviceFee: null, collectedAmount: null };
        this.fxInfo = null;
        this.domesticFeeInfo = null;
        this.sender = { name: '', address: '', mobile: '', showOther: false, selectedProvince: null, selectedDistrict: null, selectedLocalLevel: null };
        this.receiver = { name: '', address: '', mobile: '', showOther: false, selectedProvince: null, selectedDistrict: null, selectedLocalLevel: null };
        this.senderProvinces = []; this.senderDistricts = []; this.senderLocalLevels = [];
        this.receiverProvinces = []; this.receiverDistricts = []; this.receiverLocalLevels = [];
        this.selectedSenderAgent = null;
        this.senderBranches = [];
        this.selectedSenderBranch = null;
        this.selectedPayoutAgent = null;
        this.payoutBranches = [];
        this.selectedPayoutBranch = null;
        this.payoutMode = 'none';
        this.cashPayoutLabel = '';
        this.payoutAgentOptions = [];
        this.payoutBranchOptions = [];
        this.receiptData = null;
    }
}
