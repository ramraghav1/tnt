import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { StatusBadge, SeasonTag, InvPageHeader, InvEmptyState } from '../shared/inventory-shared';
import { InventoryV2Service, Season, CreateSeasonRequest } from '../inventory.service';

@Component({
    selector: 'inv-season-list',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, InputNumberModule, TextareaModule, SelectModule, DatePickerModule,
        ToastModule, ConfirmDialogModule, TooltipModule,
        StatusBadge, SeasonTag, InvPageHeader, InvEmptyState
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <inv-page-header
            title="Seasons"
            icon="pi pi-sun"
            [subtitle]="seasons.length + ' seasons'"
            searchPlaceholder="Search seasons..."
            addLabel="Add Season"
            (searchChange)="onSearch($event)"
            (addClick)="openNew()"
        />

        <div class="card">
            <p-table #dt [value]="seasons" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,25,50]"
                     [globalFilterFields]="['name','seasonType']" dataKey="id"
                     [loading]="loading" [showCurrentPageReport]="true"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name" style="min-width:10rem">Name <p-sortIcon field="name" /></th>
                        <th pSortableColumn="seasonType" style="min-width:6rem">Type <p-sortIcon field="seasonType" /></th>
                        <th style="min-width:12rem">Date Range</th>
                        <th pSortableColumn="year" style="min-width:5rem">Year <p-sortIcon field="year" /></th>
                        <th pSortableColumn="priceMultiplier" style="min-width:8rem">Multiplier <p-sortIcon field="priceMultiplier" /></th>
                        <th style="min-width:5rem">Status</th>
                        <th style="min-width:8rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-s>
                    <tr>
                        <td class="font-semibold">{{ s.name }}</td>
                        <td><inv-season-tag [type]="s.seasonType" /></td>
                        <td>
                            <span class="text-sm">{{ s.startDate | date:'MMM d' }} — {{ s.endDate | date:'MMM d, y' }}</span>
                        </td>
                        <td>{{ s.year }}</td>
                        <td>
                            <span class="font-mono font-semibold px-2 py-0.5 rounded"
                                  [class.bg-red-50]="s.priceMultiplier > 1" [class.text-red-600]="s.priceMultiplier > 1"
                                  [class.bg-green-50]="s.priceMultiplier < 1" [class.text-green-600]="s.priceMultiplier < 1"
                                  [class.bg-surface-100]="s.priceMultiplier === 1">
                                {{ s.priceMultiplier | number:'1.2-2' }}x
                            </span>
                        </td>
                        <td><inv-status-badge [active]="s.isActive" /></td>
                        <td>
                            <div class="flex gap-1">
                                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (click)="editSeason(s)" pTooltip="Edit"></button>
                                <button *ngIf="s.isActive" pButton icon="pi pi-ban" [rounded]="true" [text]="true" severity="danger" (click)="deactivate(s)" pTooltip="Deactivate"></button>
                                <button *ngIf="!s.isActive" pButton icon="pi pi-check-circle" [rounded]="true" [text]="true" severity="success" (click)="activate(s)" pTooltip="Activate"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7"><inv-empty-state icon="pi pi-sun" message="No seasons found" hint="Define seasonal pricing periods" /></td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Season Dialog -->
        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Season' : 'New Season'" [modal]="true" [style]="{ width: '520px' }" styleClass="p-fluid">
            <ng-template #content>
                <form [formGroup]="form" class="flex flex-col gap-4 pt-2">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Season Name *</label>
                            <input pInputText formControlName="name" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Type *</label>
                            <p-select formControlName="seasonType" [options]="typeOptions" optionLabel="label" optionValue="value" placeholder="Select" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Start Date *</label>
                            <p-datepicker formControlName="startDate" dateFormat="yy-mm-dd" [showIcon]="true" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">End Date *</label>
                            <p-datepicker formControlName="endDate" dateFormat="yy-mm-dd" [showIcon]="true" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Price Multiplier *</label>
                            <p-inputNumber formControlName="priceMultiplier" [minFractionDigits]="2" [min]="0.01" [max]="5" [step]="0.05" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Year *</label>
                            <p-inputNumber formControlName="year" [min]="2020" [max]="2040" [useGrouping]="false" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Description</label>
                        <textarea pTextarea formControlName="description" rows="2"></textarea>
                    </div>
                </form>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="dialogVisible = false"></button>
                <button pButton [label]="editMode ? 'Update' : 'Create'" icon="pi pi-check" [disabled]="form.invalid" (click)="save()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class SeasonList implements OnInit {
    @ViewChild('dt') dt!: Table;
    seasons: Season[] = [];
    loading = true;
    dialogVisible = false;
    editMode = false;
    editId = 0;
    form!: FormGroup;

    typeOptions = [
        { label: 'Peak', value: 'Peak' }, { label: 'Normal', value: 'Normal' },
        { label: 'Off', value: 'Off' }, { label: 'Monsoon', value: 'Monsoon' },
        { label: 'Festival', value: 'Festival' }
    ];

    constructor(
        private svc: InventoryV2Service,
        private fb: FormBuilder,
        private msg: MessageService,
        private confirm: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            seasonType: ['Normal', Validators.required],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required],
            priceMultiplier: [1.0, [Validators.required, Validators.min(0.01)]],
            year: [new Date().getFullYear(), Validators.required],
            description: ['']
        });
        this.load();
    }

    load() {
        this.loading = true;
        this.svc.getSeasons(true).subscribe({
            next: d => { this.seasons = d ?? []; this.loading = false; this.cdr.markForCheck(); },
            error: () => { this.seasons = []; this.loading = false; this.cdr.markForCheck(); }
        });
    }

    onSearch(val: string) { this.dt?.filterGlobal(val, 'contains'); }

    openNew() {
        this.editMode = false;
        this.form.reset({ seasonType: 'Normal', priceMultiplier: 1.0, year: new Date().getFullYear() });
        this.dialogVisible = true;
    }

    editSeason(s: Season) {
        this.editMode = true;
        this.editId = s.id;
        this.form.patchValue({
            ...s,
            startDate: s.startDate ? new Date(s.startDate) : null,
            endDate: s.endDate ? new Date(s.endDate) : null
        });
        this.dialogVisible = true;
    }

    save() {
        if (this.form.invalid) return;
        const v = this.form.value;
        const payload: CreateSeasonRequest = {
            name: v.name, seasonType: v.seasonType,
            startDate: this.fmt(v.startDate), endDate: this.fmt(v.endDate),
            priceMultiplier: v.priceMultiplier, year: v.year, description: v.description
        };

        const obs = this.editMode ? this.svc.updateSeason(this.editId, payload) : this.svc.createSeason(payload);
        obs.subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Success' }); this.dialogVisible = false; this.load(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to save season' })
        });
    }

    deactivate(s: Season) {
        this.confirm.confirm({
            message: `Deactivate "${s.name}"?`, header: 'Confirm',
            accept: () => this.svc.deleteSeason(s.id).subscribe({
                next: () => { this.msg.add({ severity: 'success', summary: 'Deactivated' }); this.load(); },
                error: () => this.msg.add({ severity: 'error', summary: 'Error' })
            })
        });
    }

    activate(s: Season) {
        this.svc.activateSeason(s.id).subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Activated' }); this.load(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error' })
        });
    }

    private fmt(d: Date): string { return d instanceof Date ? d.toISOString().substring(0, 10) : d; }
}
