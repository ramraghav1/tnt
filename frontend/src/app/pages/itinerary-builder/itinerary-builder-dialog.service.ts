import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface OpenItineraryBuilderOptions {
    /** Itinerary id to load (omit for a new blank itinerary). */
    itineraryId?: number | null;
    /** Lead id to attribute the itinerary to (omit for a standalone/master template). */
    leadId?: number | null;
}

/**
 * Drives the single, app-wide full-screen "Itinerary Builder" dialog hosted in `AppLayout`.
 * Any page/menu can call `open()` to launch the builder over whatever it's currently showing,
 * instead of navigating away to the routed `/itinerary-builder` page.
 */
@Injectable({ providedIn: 'root' })
export class ItineraryBuilderDialogService {
    readonly visible = signal(false);
    readonly itineraryId = signal<number | null>(null);
    readonly leadId = signal<number | null>(null);

    private readonly closedSource = new Subject<void>();
    /** Emits whenever the dialog is closed, so callers can refresh any data the builder may have changed. */
    readonly closed$ = this.closedSource.asObservable();

    open(options: OpenItineraryBuilderOptions = {}): void {
        this.itineraryId.set(options.itineraryId ?? null);
        this.leadId.set(options.leadId ?? null);
        this.visible.set(true);
    }

    close(): void {
        this.visible.set(false);
        this.itineraryId.set(null);
        this.leadId.set(null);
        this.closedSource.next();
    }
}
