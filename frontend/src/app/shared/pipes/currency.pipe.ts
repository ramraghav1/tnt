import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '@/app/shared/services/currency.service';

/**
 * Converts NPR amount to the user's selected currency for display.
 *
 * Usage:
 *   {{ 50000 | ccyConvert }}          → converts to selected currency
 *   {{ 50000 | ccyConvert:'USD' }}    → converts to specific currency
 *
 * Note: This is for DISPLAY ONLY. Backend is the final authority for pricing.
 */
@Pipe({
    name: 'ccyConvert',
    standalone: true,
    pure: false  // Re-evaluate when currency changes
})
export class CurrencyConvertPipe implements PipeTransform {
    private currencyService = inject(CurrencyService);

    transform(amountNpr: number | null | undefined, targetCurrency?: string): number {
        if (amountNpr == null) return 0;
        return this.currencyService.convert(amountNpr, targetCurrency);
    }
}

/**
 * Formats NPR amount with currency symbol in selected currency.
 *
 * Usage:
 *   {{ 50000 | ccyFormat }}           → "Rs 50,000" or "$375.00"
 *   {{ 50000 | ccyFormat:'USD' }}     → "$375.00"
 */
@Pipe({
    name: 'ccyFormat',
    standalone: true,
    pure: false
})
export class CurrencyFormatPipe implements PipeTransform {
    private currencyService = inject(CurrencyService);

    transform(amountNpr: number | null | undefined, targetCurrency?: string): string {
        if (amountNpr == null) return '';
        return this.currencyService.format(amountNpr, targetCurrency);
    }
}

/**
 * Formats NPR amount with currency symbol + base reference.
 *
 * Usage:
 *   {{ 50000 | ccyFormatWithBase }}   → "$375.00 (~Rs 50,000)"
 */
@Pipe({
    name: 'ccyFormatWithBase',
    standalone: true,
    pure: false
})
export class CurrencyFormatWithBasePipe implements PipeTransform {
    private currencyService = inject(CurrencyService);

    transform(amountNpr: number | null | undefined, targetCurrency?: string): string {
        if (amountNpr == null) return '';
        return this.currencyService.formatWithBase(amountNpr, targetCurrency);
    }
}
