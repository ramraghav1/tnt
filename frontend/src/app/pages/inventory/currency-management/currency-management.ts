import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { InventoryRedesignService, Currency, ExchangeRateV2, CreateCurrencyRequest, UpsertExchangeRateRequest } from '../inventory-redesign.service';

@Component({
    selector: 'app-currency-management',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        TagModule, DialogModule, InputNumberModule, ToolbarModule, IconFieldModule,
        InputIconModule, TooltipModule, CheckboxModule, DatePickerModule, SelectModule
    ],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <!-- Currencies Card -->
            <div class="card">
                <p-toolbar styleClass="mb-6 gap-2">
                    <ng-template #start>
                        <div class="flex items-center gap-3">
                            <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-dollar text-primary text-xl"></i>
                            </div>
                            <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Currencies</h2>
                        </div>
                    </ng-template>
                    <ng-template #end>
                        <button pButton label="Add Currency" icon="pi pi-plus" (click)="openNewCurrency()"></button>
                    </ng-template>
                </p-toolbar>

                <p-table [value]="currencies" dataKey="id" [loading]="loadingCurrencies" responsiveLayout="scroll">
                    <ng-template pTemplate="header">
                        <tr>
                            <th style="min-width:5rem">Code</th>
                            <th style="min-width:10rem">Name</th>
                            <th style="min-width:4rem">Symbol</th>
                            <th style="min-width:5rem">Base</th>
                            <th style="min-width:5rem">Status</th>
                            <th style="min-width:6rem">Actions</th>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-c>
                        <tr>
                            <td class="font-semibold">{{ c.code }}</td>
                            <td>{{ c.name }}</td>
                            <td>{{ c.symbol }}</td>
                            <td><p-tag *ngIf="c.isBase" value="BASE" severity="contrast" /></td>
                            <td><p-tag [value]="c.isActive ? 'Active' : 'Inactive'" [severity]="c.isActive ? 'success' : 'danger'" /></td>
                            <td>
                                <button *ngIf="c.isActive && !c.isBase" pButton icon="pi pi-ban" [rounded]="true" [text]="true" severity="danger" (click)="toggleCurrency(c, false)" pTooltip="Deactivate"></button>
                                <button *ngIf="!c.isActive" pButton icon="pi pi-check" [rounded]="true" [text]="true" severity="success" (click)="toggleCurrency(c, true)" pTooltip="Activate"></button>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="emptymessage">
                        <tr><td colspan="6" class="text-center py-4 text-muted-color">No currencies configured</td></tr>
                    </ng-template>
                </p-table>
            </div>

            <!-- Exchange Rates Card -->
            <div class="card">
                <p-toolbar styleClass="mb-6 gap-2">
                    <ng-template #start>
                        <div class="flex items-center gap-3">
                            <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-chart-line text-primary text-xl"></i>
                            </div>
                            <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Exchange Rates (Base: USD)</h2>
                        </div>
                    </ng-template>
                    <ng-template #end>
                        <button pButton label="Update Rate" icon="pi pi-refresh" (click)="openRateDialog()"></button>
                    </ng-template>
                </p-toolbar>

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
                        <tr>
                            <td class="font-semibold">{{ r.currencyCode }}</td>
                            <td>{{ r.rateToUsd | number:'1.4-8' }}</td>
                            <td>{{ r.rateFromUsd | number:'1.2-4' }}</td>
                            <td>{{ r.effectiveDate | date:'mediumDate' }}</td>
                            <td>{{ r.source || '-' }}</td>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="emptymessage">
                        <tr><td colspan="5" class="text-center py-4 text-muted-color">No exchange rates found</td></tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- New Currency Dialog -->
        <p-dialog [(visible)]="currencyDialog" [style]="{ width: '400px' }" header="New Currency" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Code * (3 letters)</label>
                        <input pInputText [(ngModel)]="newCurrency.code" maxlength="3" style="text-transform:uppercase" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Name *</label>
                        <input pInputText [(ngModel)]="newCurrency.name" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Symbol *</label>
                        <input pInputText [(ngModel)]="newCurrency.symbol" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Decimal Places</label>
                        <p-inputNumber [(ngModel)]="newCurrency.decimalPlaces" [min]="0" [max]="4" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="currencyDialog = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="saveCurrency()"></button>
            </ng-template>
        </p-dialog>

        <!-- Update Rate Dialog -->
        <p-dialog [(visible)]="rateDialog" [style]="{ width: '450px' }" header="Update Exchange Rate" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Currency *</label>
                        <p-select [(ngModel)]="newRate.currencyCode" [options]="currencyCodeOptions" optionLabel="label" optionValue="value" placeholder="Select currency" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">1 unit of this currency = ? USD</label>
                        <p-inputNumber [(ngModel)]="newRate.rateToUsd" [minFractionDigits]="4" [maxFractionDigits]="8" (onInput)="autoCalcReverse()" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">1 USD = ? units of this currency</label>
                        <p-inputNumber [(ngModel)]="newRate.rateFromUsd" [minFractionDigits]="2" [maxFractionDigits]="4" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Effective Date *</label>
                        <p-datepicker [(ngModel)]="newRate.effectiveDate" dateFormat="yy-mm-dd" [showIcon]="true" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Source</label>
                        <input pInputText [(ngModel)]="newRate.source" placeholder="e.g. Nepal Rastra Bank" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="rateDialog = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="saveRate()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class CurrencyManagement implements OnInit {
    currencies: Currency[] = [];
    rates: ExchangeRateV2[] = [];
    loadingCurrencies = true;
    loadingRates = true;

    currencyDialog = false;
    rateDialog = false;
    newCurrency: any = {};
    newRate: any = {};
    currencyCodeOptions: any[] = [];

    constructor(
        private svc: InventoryRedesignService,
        private msg: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() { this.loadAll(); }

    loadAll() {
        this.loadingCurrencies = true;
        this.loadingRates = true;
        this.svc.getCurrencies(true).subscribe({
            next: (data) => {
                this.currencies = data ?? [];
                this.currencyCodeOptions = this.currencies.filter(c => c.isActive && !c.isBase).map(c => ({ label: `${c.code} - ${c.name}`, value: c.code }));
                this.loadingCurrencies = false;
                this.cdr.markForCheck();
            },
            error: () => { this.currencies = []; this.loadingCurrencies = false; this.cdr.markForCheck(); }
        });
        this.svc.getLatestRates().subscribe({
            next: (data) => { this.rates = data ?? []; this.loadingRates = false; this.cdr.markForCheck(); },
            error: () => { this.rates = []; this.loadingRates = false; this.cdr.markForCheck(); }
        });
    }

    openNewCurrency() {
        this.newCurrency = { decimalPlaces: 2, isBase: false };
        this.currencyDialog = true;
    }

    saveCurrency() {
        if (!this.newCurrency.code?.trim() || !this.newCurrency.name?.trim() || !this.newCurrency.symbol?.trim()) {
            this.msg.add({ severity: 'warn', summary: 'Warning', detail: 'Code, name, and symbol are required' });
            return;
        }
        this.newCurrency.code = this.newCurrency.code.toUpperCase();
        this.svc.createCurrency(this.newCurrency).subscribe({
            next: () => { this.loadAll(); this.currencyDialog = false; this.msg.add({ severity: 'success', summary: 'Success', detail: 'Currency created' }); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to create currency' })
        });
    }

    toggleCurrency(c: Currency, isActive: boolean) {
        this.svc.setCurrencyActive(c.id, isActive).subscribe({
            next: () => { this.loadAll(); this.msg.add({ severity: 'success', summary: 'Success', detail: `Currency ${isActive ? 'activated' : 'deactivated'}` }); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to update currency' })
        });
    }

    openRateDialog() {
        const today = new Date().toISOString().substring(0, 10);
        this.newRate = { effectiveDate: today };
        this.rateDialog = true;
    }

    autoCalcReverse() {
        if (this.newRate.rateToUsd && this.newRate.rateToUsd > 0) {
            this.newRate.rateFromUsd = parseFloat((1 / this.newRate.rateToUsd).toFixed(4));
        }
    }

    saveRate() {
        if (!this.newRate.currencyCode || !this.newRate.rateToUsd || !this.newRate.rateFromUsd) {
            this.msg.add({ severity: 'warn', summary: 'Warning', detail: 'Currency, rates, and date are required' });
            return;
        }
        this.svc.upsertRate(this.newRate).subscribe({
            next: () => { this.loadAll(); this.rateDialog = false; this.msg.add({ severity: 'success', summary: 'Success', detail: 'Exchange rate updated' }); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to update rate' })
        });
    }
}
