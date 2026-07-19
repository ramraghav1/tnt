import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// ═══════════════════════════════════════════
// STATUS BADGE — consistent active/inactive
// ═══════════════════════════════════════════
@Component({
    selector: 'inv-status-badge',
    standalone: true,
    imports: [TagModule],
    template: `<p-tag [value]="active ? 'Active' : 'Inactive'" [severity]="active ? 'success' : 'danger'" [rounded]="true" />`
})
export class StatusBadge {
    @Input() active = true;
}

// ═══════════════════════════════════════════
// STAR RATING — visual star display
// ═══════════════════════════════════════════
@Component({
    selector: 'inv-star-rating',
    standalone: true,
    imports: [CommonModule],
    template: `<span class="text-yellow-500">{{ stars }}</span>`
})
export class StarRating {
    @Input() rating = 0;
    get stars(): string { return '★'.repeat(this.rating) + '☆'.repeat(Math.max(0, 5 - this.rating)); }
}

// ═══════════════════════════════════════════
// SEASON TYPE TAG — color-coded
// ═══════════════════════════════════════════
@Component({
    selector: 'inv-season-tag',
    standalone: true,
    imports: [TagModule],
    template: `<p-tag [value]="type" [severity]="severity" [rounded]="true" />`
})
export class SeasonTag {
    @Input() type = '';
    get severity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, any> = { Peak: 'danger', Normal: 'info', Off: 'success', Monsoon: 'warn', Festival: 'contrast' };
        return map[this.type] ?? 'secondary';
    }
}

// ═══════════════════════════════════════════
// INVENTORY PAGE HEADER — consistent toolbar
// ═══════════════════════════════════════════
@Component({
    selector: 'inv-page-header',
    standalone: true,
    imports: [CommonModule, ToolbarModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule],
    template: `
        <p-toolbar styleClass="mb-6 gap-2">
            <ng-template #start>
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                        <i [class]="'text-primary text-xl ' + icon"></i>
                    </div>
                    <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">{{ title }}</h2>
                    <span *ngIf="subtitle" class="text-sm text-muted-color">({{ subtitle }})</span>
                </div>
            </ng-template>
            <ng-template #center>
                <p-iconfield *ngIf="showSearch" class="w-full max-w-sm">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" [placeholder]="searchPlaceholder" class="w-full"
                           (input)="searchChange.emit($any($event.target).value)" />
                </p-iconfield>
            </ng-template>
            <ng-template #end>
                <button *ngIf="showAdd" pButton [label]="addLabel" icon="pi pi-plus" (click)="addClick.emit()"></button>
            </ng-template>
        </p-toolbar>
    `
})
export class InvPageHeader {
    @Input() title = '';
    @Input() subtitle = '';
    @Input() icon = 'pi pi-box';
    @Input() showSearch = true;
    @Input() searchPlaceholder = 'Search...';
    @Input() showAdd = true;
    @Input() addLabel = 'Add New';
    @Output() searchChange = new EventEmitter<string>();
    @Output() addClick = new EventEmitter<void>();
}

// ═══════════════════════════════════════════
// EMPTY STATE — consistent empty message
// ═══════════════════════════════════════════
@Component({
    selector: 'inv-empty-state',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="flex flex-col items-center justify-center py-12 text-muted-color">
            <i [class]="icon + ' text-4xl mb-3 opacity-40'"></i>
            <p class="text-lg font-medium mb-1">{{ message }}</p>
            <p *ngIf="hint" class="text-sm opacity-60">{{ hint }}</p>
        </div>
    `
})
export class InvEmptyState {
    @Input() icon = 'pi pi-inbox';
    @Input() message = 'No data found';
    @Input() hint = '';
}

// ═══════════════════════════════════════════
// BARREL EXPORT
// ═══════════════════════════════════════════
export const SHARED_INVENTORY_COMPONENTS = [
    StatusBadge,
    StarRating,
    SeasonTag,
    InvPageHeader,
    InvEmptyState
] as const;
