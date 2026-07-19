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
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InventoryRedesignService, Season, CreateSeasonRequest } from '../inventory-redesign.service';

@Component({
    selector: 'app-season-management',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        TagModule, DialogModule, InputNumberModule, TextareaModule, ToolbarModule,
        ConfirmDialogModule, IconFieldModule, InputIconModule, TooltipModule, SelectModule, DatePickerModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />

        <div class="card">
            <p-toolbar styleClass="mb-6 gap-2">
                <ng-template #start>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-sun text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Seasons</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Season" icon="pi pi-plus" class="mr-2" (click)="openNew()"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="seasons" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5,10,25,50]"
                     [globalFilterFields]="['name','seasonType']"
                     dataKey="id" [loading]="loading" responsiveLayout="scroll" [showCurrentPageReport]="true"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords} seasons">
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" #filterInput (input)="dt.filterGlobal(filterInput.value, 'contains')" placeholder="Search seasons..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name" style="min-width:12rem">Name <p-sortIcon field="name" /></th>
                        <th pSortableColumn="seasonType" style="min-width:8rem">Type <p-sortIcon field="seasonType" /></th>
                        <th pSortableColumn="year" style="min-width:6rem">Year <p-sortIcon field="year" /></th>
                        <th pSortableColumn="startDate" style="min-width:10rem">Start Date <p-sortIcon field="startDate" /></th>
                        <th pSortableColumn="endDate" style="min-width:10rem">End Date <p-sortIcon field="endDate" /></th>
                        <th pSortableColumn="priceMultiplier" style="min-width:8rem">Price Multiplier <p-sortIcon field="priceMultiplier" /></th>
                        <th style="min-width:6rem">Status</th>
                        <th style="min-width:10rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-season>
                    <tr>
                        <td><span class="font-semibold">{{ season.name }}</span></td>
                        <td><p-tag [value]="season.seasonType" [severity]="getSeasonSeverity(season.seasonType)" /></td>
                        <td>{{ season.year }}</td>
                        <td>{{ season.startDate | date:'mediumDate' }}</td>
                        <td>{{ season.endDate | date:'mediumDate' }}</td>
                        <td>
                            <span [class]="season.priceMultiplier > 1 ? 'text-red-500 font-semibold' : season.priceMultiplier < 1 ? 'text-green-500 font-semibold' : ''">
                                {{ season.priceMultiplier | number:'1.2-2' }}x
                            </span>
                        </td>
                        <td><p-tag [value]="season.isActive ? 'Active' : 'Inactive'" [severity]="season.isActive ? 'success' : 'danger'" /></td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (click)="editSeason(season)" pTooltip="Edit"></button>
                                <button *ngIf="season.isActive" pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (click)="deactivate(season)" pTooltip="Deactivate"></button>
                                <button *ngIf="!season.isActive" pButton icon="pi pi-check" [rounded]="true" [text]="true" severity="success" (click)="activate(season)" pTooltip="Activate"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="8" class="text-center py-8">
                            <div class="flex flex-col items-center gap-3">
                                <i class="pi pi-sun text-4xl text-muted-color"></i>
                                <span class="text-lg text-muted-color">No seasons defined</span>
                                <span class="text-sm text-muted-color">Define seasonal periods for pricing</span>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Season Dialog -->
        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '550px' }" header="Season Details" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2 col-span-2">
                        <label class="font-semibold">Name *</label>
                        <input pInputText [(ngModel)]="item.name" autofocus placeholder="e.g. Peak Season 2026" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Season Type *</label>
                        <p-select [(ngModel)]="item.seasonType" [options]="seasonTypes" optionLabel="label" optionValue="value" placeholder="Select type" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Year *</label>
                        <p-inputNumber [(ngModel)]="item.year" [min]="2024" [max]="2035" [useGrouping]="false" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Start Date *</label>
                        <p-datepicker [(ngModel)]="item.startDate" dateFormat="yy-mm-dd" [showIcon]="true" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">End Date *</label>
                        <p-datepicker [(ngModel)]="item.endDate" dateFormat="yy-mm-dd" [showIcon]="true" />
                    </div>
                    <div class="flex flex-col gap-2 col-span-2">
                        <label class="font-semibold">Price Multiplier</label>
                        <p-inputNumber [(ngModel)]="item.priceMultiplier" [min]="0.1" [max]="5" [minFractionDigits]="2" [maxFractionDigits]="2" />
                        <small class="text-muted-color">1.00 = normal | 1.50 = 50% surcharge | 0.80 = 20% discount</small>
                    </div>
                    <div class="flex flex-col gap-2 col-span-2">
                        <label class="font-semibold">Description</label>
                        <textarea pTextarea [(ngModel)]="item.description" rows="2"></textarea>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="dialogVisible = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="save()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class SeasonManagement implements OnInit {
    seasons: Season[] = [];
    item: any = {};
    dialogVisible = false;
    loading = true;
    editMode = false;

    seasonTypes = [
        { label: 'Peak', value: 'Peak' },
        { label: 'Normal', value: 'Normal' },
        { label: 'Off', value: 'Off' },
        { label: 'Monsoon', value: 'Monsoon' },
        { label: 'Festival', value: 'Festival' }
    ];

    constructor(
        private svc: InventoryRedesignService,
        private msg: MessageService,
        private confirm: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() { this.load(); }

    load() {
        this.loading = true;
        this.svc.getSeasons(true).subscribe({
            next: (data) => { this.seasons = data ?? []; this.loading = false; this.cdr.markForCheck(); },
            error: () => { this.seasons = []; this.loading = false; this.cdr.markForCheck(); this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load seasons' }); }
        });
    }

    openNew() {
        this.item = { seasonType: 'Normal', priceMultiplier: 1.00, year: new Date().getFullYear() };
        this.editMode = false;
        this.dialogVisible = true;
    }

    editSeason(season: Season) {
        this.item = { ...season };
        this.editMode = true;
        this.dialogVisible = true;
    }

    save() {
        if (!this.item.name?.trim() || !this.item.seasonType || !this.item.year) {
            this.msg.add({ severity: 'warn', summary: 'Warning', detail: 'Name, Type, and Year are required' });
            return;
        }
        const obs = this.editMode
            ? this.svc.updateSeason(this.item.id, this.item)
            : this.svc.createSeason(this.item);
        obs.subscribe({
            next: () => { this.load(); this.dialogVisible = false; this.msg.add({ severity: 'success', summary: 'Success', detail: this.editMode ? 'Season updated' : 'Season created' }); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to save season' })
        });
    }

    deactivate(season: Season) {
        this.confirm.confirm({
            message: `Deactivate "${season.name}"?`,
            header: 'Confirm', icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.svc.deleteSeason(season.id).subscribe({
                    next: () => { this.load(); this.msg.add({ severity: 'success', summary: 'Success', detail: 'Season deactivated' }); },
                    error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to deactivate' })
                });
            }
        });
    }

    activate(season: Season) {
        this.svc.activateSeason(season.id).subscribe({
            next: () => { this.load(); this.msg.add({ severity: 'success', summary: 'Success', detail: 'Season activated' }); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to activate' })
        });
    }

    getSeasonSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (type) {
            case 'Peak': return 'danger';
            case 'Normal': return 'info';
            case 'Off': return 'success';
            case 'Monsoon': return 'warn';
            case 'Festival': return 'contrast';
            default: return 'secondary';
        }
    }
}
