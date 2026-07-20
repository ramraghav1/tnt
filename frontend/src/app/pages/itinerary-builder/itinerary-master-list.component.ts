import { Component, OnInit, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ItineraryBuilderService, BuilderListItem } from './itinerary-builder.service';
import { ItineraryBuilderDialogService } from './itinerary-builder-dialog.service';

@Component({
    selector: 'app-itinerary-master-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule, TooltipModule, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
    template: `
<p-toast />
<p-confirmDialog />

<div class="card">
    <div class="flex justify-between items-center mb-4">
        <div>
            <h2 class="text-2xl font-bold m-0">Itinerary Builder</h2>
            <p class="text-muted-color mt-1 mb-0">Create and manage reusable master itineraries</p>
        </div>
        <button pButton label="Add New" icon="pi pi-plus" (click)="createNew()"></button>
    </div>

    <p-table [value]="itineraries" [paginator]="true" [rows]="10" [loading]="loading" responsiveLayout="scroll">
        <ng-template pTemplate="header">
            <tr>
                <th>Title</th>
                <th style="width:110px">Duration</th>
                <th style="width:90px">Pax</th>
                <th style="width:110px">Currency</th>
                <th style="width:120px">Status</th>
                <th style="width:130px">Actions</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-itin>
            <tr>
                <td>{{ itin.title }}</td>
                <td>{{ itin.durationDays }} Days</td>
                <td>{{ itin.numPax }}</td>
                <td>{{ itin.defaultCurrency }}</td>
                <td><p-tag [value]="itin.status" [severity]="statusSeverity(itin.status)" [rounded]="true" /></td>
                <td class="flex gap-2">
                    <button pButton icon="pi pi-pencil" class="p-button-text p-button-rounded" (click)="edit(itin)" pTooltip="Edit"></button>
                    <button pButton icon="pi pi-trash" class="p-button-text p-button-rounded p-button-danger" (click)="remove(itin)" pTooltip="Delete"></button>
                </td>
            </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" class="text-center">No itineraries found. Click "Add New" to create one.</td></tr>
        </ng-template>
    </p-table>
</div>
`
})
export class ItineraryMasterList implements OnInit {
    itineraries: BuilderListItem[] = [];
    loading = false;

    constructor(
        private svc: ItineraryBuilderService,
        private builderDialog: ItineraryBuilderDialogService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
        private destroyRef: DestroyRef
    ) {}

    ngOnInit(): void {
        // Refresh the list whenever the global builder dialog is closed (create/edit may have happened)
        this.builderDialog.closed$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());
        this.load();
    }

    load(): void {
        this.loading = true;
        this.svc.getAll().subscribe({
            next: (data) => { this.itineraries = data || []; this.loading = false; this.cdr.markForCheck(); },
            error: () => { this.itineraries = []; this.loading = false; this.cdr.markForCheck(); }
        });
    }

    createNew(): void {
        this.builderDialog.open();
    }

    edit(itin: BuilderListItem): void {
        this.builderDialog.open({ itineraryId: itin.id });
    }

    remove(itin: BuilderListItem): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${itin.title}"?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.svc.delete(itin.id).subscribe({
                    next: () => {
                        this.itineraries = this.itineraries.filter((i) => i.id !== itin.id);
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${itin.title}" deleted` });
                        this.cdr.markForCheck();
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete itinerary' })
                });
            }
        });
    }

    statusSeverity(status: string): 'success' | 'info' | 'warn' | 'secondary' {
        const s = (status || '').toLowerCase();
        if (s === 'published') return 'success';
        if (s === 'draft') return 'warn';
        return 'info';
    }
}
