import NepaliDate from 'nepali-date-converter';
import { dateConfigMap } from 'nepali-date-converter';

export const BS_MONTHS = [
    'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export const BS_MONTHS_NP = [
    'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत्र'
];

export const BS_DAYS_NP = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];
export const BS_DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface BsDate {
    year: number;
    month: number; // 0-indexed
    day: number;
}

/**
 * Get the number of days in a given BS month.
 */
export function getDaysInBsMonth(year: number, month: number): number {
    const config = (dateConfigMap as any)[year];
    if (!config) return 30;
    const monthName = BS_MONTHS[month];
    return config[monthName] || 30;
}

/**
 * Get the day of week (0=Sun..6=Sat) for BS date 1st of given month/year.
 */
export function getFirstDayOfBsMonth(year: number, month: number): number {
    try {
        const nd = new NepaliDate(year, month, 1);
        return nd.toJsDate().getDay();
    } catch {
        return 0;
    }
}

/**
 * Convert AD Date to BS date object.
 */
export function adToBs(date: Date): BsDate {
    const nd = new NepaliDate(date);
    return { year: nd.getYear(), month: nd.getMonth(), day: nd.getDate() };
}

/**
 * Convert BS date object to AD Date.
 */
export function bsToAd(bs: BsDate): Date {
    const nd = new NepaliDate(bs.year, bs.month, bs.day);
    return nd.toJsDate();
}

/**
 * Get today's BS date.
 */
export function todayBs(): BsDate {
    return adToBs(new Date());
}

/**
 * Get available BS year range from the library data.
 */
export function getBsYearRange(): { min: number; max: number } {
    const years = Object.keys(dateConfigMap).map(Number).sort((a, b) => a - b);
    return { min: years[0], max: years[years.length - 1] };
}

/**
 * Format BS date as string.
 */
export function formatBsDate(bs: BsDate): string {
    const m = (bs.month + 1).toString().padStart(2, '0');
    const d = bs.day.toString().padStart(2, '0');
    return `${bs.year}-${m}-${d}`;
}

/**
 * Check if two BS dates are equal.
 */
export function isSameBsDate(a: BsDate | null, b: BsDate | null): boolean {
    if (!a || !b) return false;
    return a.year === b.year && a.month === b.month && a.day === b.day;
}

/**
 * Compare BS dates: returns -1, 0, or 1.
 */
export function compareBsDate(a: BsDate, b: BsDate): number {
    if (a.year !== b.year) return a.year < b.year ? -1 : 1;
    if (a.month !== b.month) return a.month < b.month ? -1 : 1;
    if (a.day !== b.day) return a.day < b.day ? -1 : 1;
    return 0;
}
