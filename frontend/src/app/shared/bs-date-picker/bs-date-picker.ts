import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import NepaliDate from 'nepali-date-converter';
import { dateConfigMap } from 'nepali-date-converter';

const BS_MONTHS = [
    'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

@Component({
    selector: 'app-bs-date-picker',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule, DatePickerModule, ToggleSwitchModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BsDatePicker),
            multi: true
        }
    ],
    template: `
        <div class="bs-date-picker">
            <!-- Toggle -->
            <div class="date-toggle">
                <span class="toggle-label" [class.active]="!isBs">AD</span>
                <p-toggleswitch [(ngModel)]="isBs" (ngModelChange)="onModeChange()"></p-toggleswitch>
                <span class="toggle-label" [class.active]="isBs">BS</span>
            </div>

            <!-- AD Date Picker -->
            <div *ngIf="!isBs">
                <p-datepicker
                    [(ngModel)]="adDate"
                    [showIcon]="true"
                    dateFormat="yy-mm-dd"
                    [placeholder]="placeholder"
                    [minDate]="minDate"
                    (ngModelChange)="onAdDateChange()">
                </p-datepicker>
            </div>

            <!-- BS Date Picker (dropdowns) -->
            <div *ngIf="isBs" class="bs-selectors">
                <p-select
                    [(ngModel)]="bsYear"
                    [options]="yearOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Year"
                    (ngModelChange)="onBsChange()"
                    class="bs-select-year">
                </p-select>
                <p-select
                    [(ngModel)]="bsMonth"
                    [options]="monthOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Month"
                    (ngModelChange)="onBsMonthChange()"
                    class="bs-select-month">
                </p-select>
                <p-select
                    [(ngModel)]="bsDay"
                    [options]="dayOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Day"
                    (ngModelChange)="onBsChange()"
                    class="bs-select-day">
                </p-select>
            </div>

            <!-- Display converted date -->
            <div *ngIf="adDate" class="converted-date">
                <span *ngIf="isBs && adDate">AD: {{ adDate | date:'yyyy-MM-dd' }}</span>
                <span *ngIf="!isBs && adDate && bsYear">BS: {{ bsYear }}-{{ padZero(bsMonth + 1) }}-{{ padZero(bsDay) }}</span>
            </div>
        </div>
    `,
    styles: [`
        .bs-date-picker {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .date-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.25rem;
        }

        .toggle-label {
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--p-surface-400, #94a3b8);
            transition: color 0.2s;

            &.active {
                color: var(--p-primary-500, #3b82f6);
            }
        }

        .bs-selectors {
            display: flex;
            gap: 0.5rem;
        }

        .bs-select-year {
            flex: 2;
        }

        .bs-select-month {
            flex: 3;
        }

        .bs-select-day {
            flex: 1.5;
        }

        .converted-date {
            font-size: 0.78rem;
            color: var(--p-surface-500, #64748b);
            padding-left: 0.25rem;
        }
    `]
})
export class BsDatePicker implements OnInit, OnChanges, ControlValueAccessor {
    @Input() placeholder = 'Select date';
    @Input() minDate: Date | null = null;

    isBs = false;

    // AD
    adDate: Date | null = null;

    // BS
    bsYear: number | null = null;
    bsMonth: number = 0; // 0-indexed
    bsDay: number = 1;

    yearOptions: { label: string; value: number }[] = [];
    monthOptions: { label: string; value: number }[] = [];
    dayOptions: { label: string; value: number }[] = [];

    private onChange: (value: Date | null) => void = () => {};
    private onTouched: () => void = () => {};

    ngOnInit() {
        this.buildYearOptions();
        this.buildMonthOptions();
        this.buildDayOptions();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['minDate'] && this.minDate && this.adDate) {
            if (this.adDate < this.minDate) {
                this.adDate = null;
                this.bsYear = null;
                this.bsMonth = 0;
                this.bsDay = 1;
                this.emitValue();
            }
        }
    }

    // ControlValueAccessor
    writeValue(value: Date | null) {
        this.adDate = value;
        if (value) {
            this.syncBsFromAd(value);
        }
    }

    registerOnChange(fn: (value: Date | null) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void) {
        this.onTouched = fn;
    }

    // Build options
    private buildYearOptions() {
        const years = Object.keys(dateConfigMap).map(Number).sort((a, b) => a - b);
        this.yearOptions = years.map(y => ({ label: y.toString(), value: y }));
    }

    private buildMonthOptions() {
        this.monthOptions = BS_MONTHS.map((m, i) => ({ label: m, value: i }));
    }

    buildDayOptions() {
        let maxDays = 30;
        if (this.bsYear && dateConfigMap[this.bsYear]) {
            const monthName = BS_MONTHS[this.bsMonth];
            maxDays = (dateConfigMap as any)[this.bsYear][monthName] || 30;
        }
        this.dayOptions = [];
        for (let d = 1; d <= maxDays; d++) {
            this.dayOptions.push({ label: d.toString(), value: d });
        }
        // Adjust current day if it exceeds max
        if (this.bsDay > maxDays) {
            this.bsDay = maxDays;
        }
    }

    // Mode toggle
    onModeChange() {
        if (this.isBs && this.adDate) {
            this.syncBsFromAd(this.adDate);
        } else if (!this.isBs && this.bsYear) {
            this.syncAdFromBs();
        }
    }

    // AD changed
    onAdDateChange() {
        if (this.adDate) {
            this.syncBsFromAd(this.adDate);
        }
        this.emitValue();
    }

    // BS month changed (need to rebuild days)
    onBsMonthChange() {
        this.buildDayOptions();
        this.onBsChange();
    }

    // BS changed
    onBsChange() {
        if (this.bsYear != null && this.bsMonth != null && this.bsDay) {
            this.buildDayOptions();
            this.syncAdFromBs();
            this.emitValue();
        }
    }

    // Sync BS from AD
    private syncBsFromAd(date: Date) {
        try {
            const nd = new NepaliDate(date);
            this.bsYear = nd.getYear();
            this.bsMonth = nd.getMonth();
            this.bsDay = nd.getDate();
            this.buildDayOptions();
        } catch (e) {
            console.warn('BS conversion failed:', e);
        }
    }

    // Sync AD from BS
    private syncAdFromBs() {
        try {
            if (this.bsYear != null) {
                const nd = new NepaliDate(this.bsYear, this.bsMonth, this.bsDay);
                this.adDate = nd.toJsDate();

                // Validate against minDate
                if (this.minDate && this.adDate < this.minDate) {
                    this.adDate = null;
                }
            }
        } catch (e) {
            console.warn('AD conversion failed:', e);
            this.adDate = null;
        }
    }

    private emitValue() {
        this.onChange(this.adDate);
        this.onTouched();
    }

    padZero(n: number): string {
        return n < 10 ? '0' + n : n.toString();
    }
}
