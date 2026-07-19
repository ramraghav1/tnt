import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '@/app/shared/services/currency.service';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-currency-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule, TooltipModule],
    template: `
        <div class="currency-selector-wrap" [pTooltip]="staleMessage()" tooltipPosition="bottom">
            <p-select
                [options]="currencyService.supportedCurrencies()"
                [ngModel]="currencyService.selectedCurrency()"
                (ngModelChange)="onCurrencyChange($event)"
                optionLabel="code"
                optionValue="code"
                [style]="{ width: '90px' }"
                styleClass="currency-select"
                appendTo="body"
            >
                <ng-template #selectedItem let-item>
                    <span class="currency-selected">{{ item?.symbol }} {{ item?.code }}</span>
                </ng-template>
                <ng-template #item let-item>
                    <span>{{ item.symbol }} {{ item.code }}</span>
                    <span *ngIf="item.isBase" class="text-xs text-gray-400 ml-2">(base)</span>
                </ng-template>
            </p-select>
            <i *ngIf="currencyService.isStale()" class="pi pi-exclamation-triangle text-yellow-500 ml-1" style="font-size: 0.75rem;"></i>
        </div>
    `,
    styles: [`
        .currency-selector-wrap {
            display: inline-flex;
            align-items: center;
        }
        :host ::ng-deep .currency-select .p-select-label {
            padding: 0.35rem 0.5rem;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .currency-selected {
            font-weight: 600;
        }
    `]
})
export class CurrencySelectorComponent {
    currencyService = inject(CurrencyService);

    onCurrencyChange(code: string): void {
        this.currencyService.changeCurrency(code);
    }

    staleMessage(): string {
        if (this.currencyService.isStale()) {
            return 'Exchange rates may be outdated. Rates last updated over 12 hours ago.';
        }
        return '';
    }
}
