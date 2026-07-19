import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';

import { StatusBadge, InvPageHeader, InvEmptyState } from '../shared/inventory-shared';
import { InventoryV2Service, Currency, ExchangeRate, CreateCurrencyRequest, UpsertExchangeRateRequest } from '../inventory.service';

@Component({
    selector: 'inv-currency-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, InputNumberModule, SelectModule, DatePickerModule, TabsModule,
        TagModule, ToastModule, TooltipModule, DividerModule,
        StatusBadge, InvPageHeader, InvEmptyState
    ],
    providers: [MessageService],
    template: `
        <p-toast />

        <inv-page-header title="Currencies & Exchange Rates" icon="pi pi-dollar" [showSearch]="false" [showAdd]="false" />

        <p-tabs value="0">
            <p-tablist>
                <p-tab value="0"><i class="pi pi-dollar mr-2"></i>Currencies</p-tab>
                <p-tab value="1"><i class="pi pi-chart-line mr-2"></i>Exchange Rates</p-tab>
                <p-tab value="2"><i class="pi pi-history mr-2"></i>Rate History</p-tab>
            </p-tablist>
            <p-tabpanels>
                <!-- CURRENCIES TAB -->
                <p-tabpanel value="0">
                    <div class="card mt-4">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold m-0">Supported Currencies</h3>
                            <button pButton label="Add Currency" icon="pi pi-plus" (click)="openCurrencyDialog()"></button>
                        </div>

                        <p-table [value]="currencies" dataKey="id" [loading]="loadingCurrencies" responsiveLayout="scroll">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th style="min-width:5rem">Code</th>
                                    <th style="min-width:10rem">Name</th>
                                    <th style="min-width:4rem">Symbol</th>
                                    <th style="min-width:5rem">Decimals</th>
                                    <th style="min-width:5rem">Base</th>
                                    <th style="min-width:5rem">Status</th>
                                    <th style="min-width:6rem">Actions</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-c>
                                <tr>
                                    <td><span class="font-mono font-semibold bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded">{{ c.code }}</span></td>
                                    <td>{{ c.name }}</td>
                                    <td class="text-lg">{{ c.symbol }}</td>
                                    <td>{{ c.decimalPlaces }}</td>
                                    <td><p-tag *ngIf="c.isBase" value="BASE" severity="contrast" [rounded]="true" /></td>
                                    <td><inv-status-badge [active]="c.isActive" /></td>
                                    <td>
                                        <button *ngIf="c.isActive && !c.isBase" pButton icon="pi pi-ban" [rounded]="true" [text]="true" severity="danger" (click)="toggleCurrency(c, false)" pTooltip="Deactivate"></button>
                                        <button *ngIf="!c.isActive" pButton icon="pi pi-check-circle" [rounded]="true" [text]="true" severity="success" (click)="toggleCurrency(c, true)" pTooltip="Activate"></button>
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr><td colspan="7"><inv-empty-state icon="pi pi-dollar" message="No currencies" /></td></tr>
                            </ng-template>
                        </p-table>
                    </div>
                </p-tabpanel>

                <!-- EXCHANGE RATES TAB -->
                <p-tabpanel value="1">
                    <div class="card mt-4">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <h3 class="text-lg font-semibold m-0">Latest Exchange Rates</h3>
                                <p class="text-sm text-muted-color mt-1">All rates are relative to USD (base currency)</p>
                            </div>
                            <div class="flex gap-2">
                                <button pButton label="Refresh" icon="pi pi-refresh" severity="secondary" [outlined]="true" (click)="loadRates()" pTooltip="Future: Auto-sync with central bank APIs"></button>
                                <button pButton label="Update Rate" icon="pi pi-pencil" (click)="openRateDialog()"></button>
                            </div>
                        </div>

                        <p-table [value]="rates" dataKey="id" [loading]="loadingRates" responsiveLayout="scroll">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th style="min-width:6rem">Currency</th>
                                    <th style="min-width:8rem">1 unit → USD</th>
                                    <th style="min-width:8rem">1 USD → unit</th>
                                    <th style="min-width:8rem">Effective Date</th>
                                    <th style="min-width:6rem">Source</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-r>
                                <tr class="cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800" (click)="loadHistory(r.currencyCode)">
                                    <td class="font-semibold">{{ r.currencyCode }}</td>
                                    <td class="font-mono">{{ r.rateToUsd | number:'1.4-8' }}</td>
                                    <td class="font-mono">{{ r.rateFromUsd | number:'1.2-4' }}</td>
                                    <td>{{ r.effectiveDate | date:'mediumDate' }}</td>
                                    <td><span class="text-sm text-muted-color">{{ r.source || '—' }}</span></td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr><td colspan="5"><inv-empty-state icon="pi pi-chart-line" message="No exchange rates" /></td></tr>
                            </ng-template>
                        </p-table>
                    </div>
                </p-tabpanel>

                <!-- HISTORY TAB -->
                <p-tabpanel value="2">
                    <div class="card mt-4">
                        <div class="flex items-center gap-4 mb-4">
                            <h3 class="text-lg font-semibold m-0">Rate History</h3>
                            <p-select [(ngModel)]="selectedHistoryCurrency" [options]="currencyCodeOptions" optionLabel="label" optionValue="value"
                                      placeholder="Select currency" (onChange)="loadHistory($event.value)" />
                        </div>

                        <p-table [value]="history" dataKey="id" [loading]="loadingHistory" [paginator]="history.length > 10" [rows]="10" responsiveLayout="scroll">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Currency</th>
                                    <th>1 unit → USD</th>
                                    <th>1 USD → unit</th>
                                    <th>Effective Date</th>
                                    <th>Source</th>
                                    <th>Recorded</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-r>
                                <tr>
                                    <td>{{ r.currencyCode }}</td>
                                    <td class="font-mono">{{ r.rateToUsd | number:'1.4-8' }}</td>
                                    <td class="font-mono">{{ r.rateFromUsd | number:'1.2-4' }}</td>
                                    <td>{{ r.effectiveDate | date:'mediumDate' }}</td>
                                    <td>{{ r.source || '—' }}</td>
                                    <td>{{ r.createdAt | date:'medium' }}</td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr><td colspan="6"><inv-empty-state icon="pi pi-history" message="Select a currency to view history" /></td></tr>
                            </ng-template>
                        </p-table>
                    </div>
                </p-tabpanel>
            </p-tabpanels>
        </p-tabs>

        <!-- Add Currency Dialog -->
        <p-dialog [(visible)]="currencyDialogVisible" header="New Currency" [modal]="true" [style]="{ width: '420px' }" styleClass="p-fluid">
            <ng-template #content>
                <form [formGroup]="currencyForm" class="flex flex-col gap-4 pt-2">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Code * (3 letters)</label>
                        <input pInputText formControlName="code" maxlength="3" style="text-transform:uppercase" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Name *</label>
                        <input pInputText formControlName="name" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Symbol *</label>
                            <input pInputText formControlName="symbol" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Decimals</label>
                            <p-inputNumber formControlName="decimalPlaces" [min]="0" [max]="4" />
                        </div>
                    </div>
                </form>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="currencyDialogVisible = false"></button>
                <button pButton label="Create" icon="pi pi-check" [disabled]="currencyForm.invalid" (click)="saveCurrency()"></button>
            </ng-template>
        </p-dialog>

        <!-- Update Rate Dialog -->
        <p-dialog [(visible)]="rateDialogVisible" header="Update Exchange Rate" [modal]="true" [style]="{ width: '480px' }" styleClass="p-fluid">
            <ng-template #content>
                <form [formGroup]="rateForm" class="flex flex-col gap-4 pt-2">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Currency *</label>
                        <p-select formControlName="currencyCode" [options]="currencyCodeOptions" optionLabel="label" optionValue="value" placeholder="Select" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">1 unit → USD</label>
                            <p-inputNumber formControlName="rateToUsd" [minFractionDigits]="4" [maxFractionDigits]="8" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">1 USD → unit</label>
                            <p-inputNumber formControlName="rateFromUsd" [minFractionDigits]="2" [maxFractionDigits]="4" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Effective Date *</label>
                        <p-datepicker formControlName="effectiveDate" dateFormat="yy-mm-dd" [showIcon]="true" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Source</label>
                        <input pInputText formControlName="source" placeholder="e.g. Nepal Rastra Bank" />
                    </div>
                </form>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="rateDialogVisible = false"></button>
                <button pButton label="Save" icon="pi pi-check" [disabled]="rateForm.invalid" (click)="saveRate()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class CurrencyList implements OnInit {
    currencies: Currency[] = [];
    rates: ExchangeRate[] = [];
    history: ExchangeRate[] = [];
    loadingCurrencies = true;
    loadingRates = true;
    loadingHistory = false;
    selectedHistoryCurrency = '';
    currencyCodeOptions: any[] = [];

    currencyDialogVisible = false;
    rateDialogVisible = false;
    currencyForm!: FormGroup;
    rateForm!: FormGroup;

    constructor(
        private svc: InventoryV2Service,
        private fb: FormBuilder,
        private msg: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.currencyForm = this.fb.group({
            code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
            name: ['', Validators.required],
            symbol: ['', Validators.required],
            decimalPlaces: [2]
        });

        this.rateForm = this.fb.group({
            currencyCode: ['', Validators.required],
            rateToUsd: [null, [Validators.required, Validators.min(0.0001)]],
            rateFromUsd: [null, [Validators.required, Validators.min(0.01)]],
            effectiveDate: [null, Validators.required],
            source: ['']
        });

        // Auto-calculate reverse rate
        this.rateForm.get('rateToUsd')?.valueChanges.subscribe(val => {
            if (val && val > 0) {
                this.rateForm.patchValue({ rateFromUsd: parseFloat((1 / val).toFixed(4)) }, { emitEvent: false });
            }
        });

        this.loadCurrencies();
        this.loadRates();
    }

    loadCurrencies() {
        this.loadingCurrencies = true;
        this.svc.getCurrencies(true).subscribe({
            next: d => {
                this.currencies = d ?? [];
                this.currencyCodeOptions = this.currencies.filter(c => c.isActive && !c.isBase)
                    .map(c => ({ label: `${c.code} — ${c.name}`, value: c.code }));
                this.loadingCurrencies = false;
                this.cdr.markForCheck();
            },
            error: () => { this.currencies = []; this.loadingCurrencies = false; this.cdr.markForCheck(); }
        });
    }

    loadRates() {
        this.loadingRates = true;
        this.svc.getLatestRates().subscribe({
            next: d => { this.rates = d ?? []; this.loadingRates = false; this.cdr.markForCheck(); },
            error: () => { this.rates = []; this.loadingRates = false; this.cdr.markForCheck(); }
        });
    }

    loadHistory(code: string) {
        this.selectedHistoryCurrency = code;
        this.loadingHistory = true;
        this.svc.getRateHistory(code, 50).subscribe({
            next: d => { this.history = d ?? []; this.loadingHistory = false; this.cdr.markForCheck(); },
            error: () => { this.history = []; this.loadingHistory = false; this.cdr.markForCheck(); }
        });
    }

    openCurrencyDialog() {
        this.currencyForm.reset({ decimalPlaces: 2 });
        this.currencyDialogVisible = true;
    }

    saveCurrency() {
        if (this.currencyForm.invalid) return;
        const val = this.currencyForm.value;
        val.code = val.code.toUpperCase();
        this.svc.createCurrency({ ...val, isBase: false }).subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Created' }); this.currencyDialogVisible = false; this.loadCurrencies(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error' })
        });
    }

    toggleCurrency(c: Currency, active: boolean) {
        this.svc.setCurrencyActive(c.id, active).subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: active ? 'Activated' : 'Deactivated' }); this.loadCurrencies(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error' })
        });
    }

    openRateDialog() {
        this.rateForm.reset();
        this.rateDialogVisible = true;
    }

    saveRate() {
        if (this.rateForm.invalid) return;
        const val = this.rateForm.value;
        const data: UpsertExchangeRateRequest = {
            currencyCode: val.currencyCode,
            rateToUsd: val.rateToUsd,
            rateFromUsd: val.rateFromUsd,
            effectiveDate: val.effectiveDate instanceof Date ? val.effectiveDate.toISOString().substring(0, 10) : val.effectiveDate,
            source: val.source
        };
        this.svc.upsertRate(data).subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Rate updated' }); this.rateDialogVisible = false; this.loadRates(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error' })
        });
    }
}
