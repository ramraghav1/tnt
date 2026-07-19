import {
    Component, Input, Output, EventEmitter, OnInit, OnChanges,
    SimpleChanges, ElementRef, HostListener, forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import {
    BsDate, BS_MONTHS, BS_MONTHS_NP, BS_DAYS_EN, BS_DAYS_NP,
    getDaysInBsMonth, getFirstDayOfBsMonth, adToBs, bsToAd,
    todayBs, getBsYearRange, formatBsDate, isSameBsDate, compareBsDate
} from './bs-date-utils';

interface CalendarCell {
    day: number;
    currentMonth: boolean;
    disabled: boolean;
    today: boolean;
    selected: boolean;
    bsDate: BsDate;
}

@Component({
    selector: 'app-nepali-datepicker',
    standalone: true,
    imports: [CommonModule, FormsModule, DatePickerModule, ToggleSwitchModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NepaliDatepicker),
            multi: true
        }
    ],
    templateUrl: './nepali-datepicker.html',
    styleUrls: ['./nepali-datepicker.scss']
})
export class NepaliDatepicker implements OnInit, OnChanges, ControlValueAccessor {
    @Input() placeholder = 'Select date';
    @Input() minDate: Date | null = null;
    @Input() showIcon = true;

    isBs = false;
    isOpen = false;

    // AD state
    adDate: Date | null = null;

    // BS state
    viewYear = 2082;
    viewMonth = 0;
    selectedBs: BsDate | null = null;
    todayBsDate: BsDate;

    // Calendar grid
    calendarWeeks: CalendarCell[][] = [];
    dayHeaders = BS_DAYS_EN;
    monthNames = BS_MONTHS;
    monthNamesNp = BS_MONTHS_NP;

    yearRange: { min: number; max: number };
    yearOptions: number[] = [];

    // Display
    displayValue = '';

    private onChange: (value: Date | null) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(private elRef: ElementRef) {
        this.todayBsDate = todayBs();
        this.yearRange = getBsYearRange();
        this.viewYear = this.todayBsDate.year;
        this.viewMonth = this.todayBsDate.month;

        for (let y = this.yearRange.min; y <= this.yearRange.max; y++) {
            this.yearOptions.push(y);
        }
    }

    ngOnInit() {
        this.buildCalendar();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['minDate'] && this.minDate && this.adDate) {
            if (this.adDate < this.minDate) {
                this.adDate = null;
                this.selectedBs = null;
                this.updateDisplay();
                this.emitValue();
            }
            this.buildCalendar();
        }
    }

    // ── ControlValueAccessor ──

    writeValue(value: Date | null) {
        this.adDate = value;
        if (value) {
            this.selectedBs = adToBs(value);
            this.viewYear = this.selectedBs.year;
            this.viewMonth = this.selectedBs.month;
        } else {
            this.selectedBs = null;
        }
        this.updateDisplay();
        this.buildCalendar();
    }

    registerOnChange(fn: (value: Date | null) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void) {
        this.onTouched = fn;
    }

    // ── Toggle AD/BS ──

    onModeChange() {
        if (this.isBs && this.adDate) {
            this.selectedBs = adToBs(this.adDate);
            this.viewYear = this.selectedBs.year;
            this.viewMonth = this.selectedBs.month;
            this.buildCalendar();
        }
        this.updateDisplay();
    }

    // ── AD picker change ──

    onAdDateChange() {
        if (this.adDate) {
            this.selectedBs = adToBs(this.adDate);
            this.viewYear = this.selectedBs.year;
            this.viewMonth = this.selectedBs.month;
            this.buildCalendar();
        } else {
            this.selectedBs = null;
        }
        this.updateDisplay();
        this.emitValue();
    }

    // ── Calendar open/close ──

    toggleCalendar() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.onTouched();
            if (this.selectedBs) {
                this.viewYear = this.selectedBs.year;
                this.viewMonth = this.selectedBs.month;
            }
            this.buildCalendar();
        }
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        if (!this.elRef.nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    }

    // ── Navigation ──

    prevMonth() {
        this.viewMonth--;
        if (this.viewMonth < 0) {
            this.viewMonth = 11;
            this.viewYear--;
            if (this.viewYear < this.yearRange.min) {
                this.viewYear = this.yearRange.min;
                this.viewMonth = 0;
            }
        }
        this.buildCalendar();
    }

    nextMonth() {
        this.viewMonth++;
        if (this.viewMonth > 11) {
            this.viewMonth = 0;
            this.viewYear++;
            if (this.viewYear > this.yearRange.max) {
                this.viewYear = this.yearRange.max;
                this.viewMonth = 11;
            }
        }
        this.buildCalendar();
    }

    onYearChange(year: number) {
        this.viewYear = year;
        this.buildCalendar();
    }

    onMonthChange(month: number) {
        this.viewMonth = month;
        this.buildCalendar();
    }

    // ── Select date ──

    selectDay(cell: CalendarCell) {
        if (cell.disabled || !cell.currentMonth) return;

        this.selectedBs = { ...cell.bsDate };
        try {
            this.adDate = bsToAd(this.selectedBs);
        } catch {
            return;
        }

        this.updateDisplay();
        this.buildCalendar();
        this.emitValue();
        this.isOpen = false;
    }

    selectToday() {
        this.selectedBs = { ...this.todayBsDate };
        this.adDate = new Date();
        this.viewYear = this.todayBsDate.year;
        this.viewMonth = this.todayBsDate.month;
        this.updateDisplay();
        this.buildCalendar();
        this.emitValue();
        this.isOpen = false;
    }

    clearDate() {
        this.selectedBs = null;
        this.adDate = null;
        this.updateDisplay();
        this.buildCalendar();
        this.emitValue();
    }

    // ── Build calendar grid ──

    buildCalendar() {
        const daysInMonth = getDaysInBsMonth(this.viewYear, this.viewMonth);
        const firstDow = getFirstDayOfBsMonth(this.viewYear, this.viewMonth);

        // Previous month info
        let prevMonth = this.viewMonth - 1;
        let prevYear = this.viewYear;
        if (prevMonth < 0) { prevMonth = 11; prevYear--; }
        const daysInPrevMonth = getDaysInBsMonth(prevYear, prevMonth);

        const cells: CalendarCell[] = [];

        // Fill leading days from previous month
        for (let i = 0; i < firstDow; i++) {
            const day = daysInPrevMonth - firstDow + 1 + i;
            cells.push({
                day,
                currentMonth: false,
                disabled: true,
                today: false,
                selected: false,
                bsDate: { year: prevYear, month: prevMonth, day }
            });
        }

        // Current month days
        const minBs = this.minDate ? adToBs(this.minDate) : null;
        for (let d = 1; d <= daysInMonth; d++) {
            const bsDate: BsDate = { year: this.viewYear, month: this.viewMonth, day: d };
            const isDisabled = minBs ? compareBsDate(bsDate, minBs) < 0 : false;

            cells.push({
                day: d,
                currentMonth: true,
                disabled: isDisabled,
                today: isSameBsDate(bsDate, this.todayBsDate),
                selected: isSameBsDate(bsDate, this.selectedBs),
                bsDate
            });
        }

        // Fill trailing days
        let nextMonth = this.viewMonth + 1;
        let nextYear = this.viewYear;
        if (nextMonth > 11) { nextMonth = 0; nextYear++; }
        let trailing = 1;
        while (cells.length % 7 !== 0) {
            cells.push({
                day: trailing,
                currentMonth: false,
                disabled: true,
                today: false,
                selected: false,
                bsDate: { year: nextYear, month: nextMonth, day: trailing }
            });
            trailing++;
        }

        // Split into weeks
        this.calendarWeeks = [];
        for (let i = 0; i < cells.length; i += 7) {
            this.calendarWeeks.push(cells.slice(i, i + 7));
        }
    }

    // ── Display ──

    private updateDisplay() {
        if (this.isBs && this.selectedBs) {
            this.displayValue = `${formatBsDate(this.selectedBs)} BS`;
        } else if (!this.isBs && this.adDate) {
            const y = this.adDate.getFullYear();
            const m = (this.adDate.getMonth() + 1).toString().padStart(2, '0');
            const d = this.adDate.getDate().toString().padStart(2, '0');
            this.displayValue = `${y}-${m}-${d}`;
        } else {
            this.displayValue = '';
        }
    }

    // ── Conversion display ──

    get convertedText(): string {
        if (!this.adDate || !this.selectedBs) return '';
        if (this.isBs) {
            const y = this.adDate.getFullYear();
            const m = (this.adDate.getMonth() + 1).toString().padStart(2, '0');
            const d = this.adDate.getDate().toString().padStart(2, '0');
            return `AD: ${y}-${m}-${d}`;
        } else {
            return `BS: ${formatBsDate(this.selectedBs)}`;
        }
    }

    private emitValue() {
        this.onChange(this.adDate);
        this.onTouched();
    }
}
