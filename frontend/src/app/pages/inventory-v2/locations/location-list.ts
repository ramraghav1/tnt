import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { SHARED_INVENTORY_COMPONENTS, StatusBadge, InvPageHeader, InvEmptyState } from '../shared/inventory-shared';
import { InventoryV2Service, Location, CreateLocationRequest } from '../inventory.service';

@Component({
    selector: 'inv-location-list',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, InputNumberModule, TextareaModule, ToastModule, ConfirmDialogModule,
        TooltipModule, StatusBadge, InvPageHeader, InvEmptyState
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <inv-page-header
            title="Locations"
            icon="pi pi-map-marker"
            [subtitle]="locations.length + ' total'"
            searchPlaceholder="Search locations..."
            addLabel="Add Location"
            (searchChange)="onSearch($event)"
            (addClick)="openNew()"
        />

        <div class="card">
            <p-table #dt [value]="locations" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,25,50]"
                     [globalFilterFields]="['name','code','country','region']" dataKey="id"
                     [loading]="loading" [showCurrentPageReport]="true"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name" style="min-width:12rem">Name <p-sortIcon field="name" /></th>
                        <th pSortableColumn="code" style="min-width:6rem">Code <p-sortIcon field="code" /></th>
                        <th pSortableColumn="country" style="min-width:8rem">Country <p-sortIcon field="country" /></th>
                        <th style="min-width:6rem">Region</th>
                        <th pSortableColumn="costMultiplier" style="min-width:8rem">Cost Multiplier <p-sortIcon field="costMultiplier" /></th>
                        <th style="min-width:5rem">Status</th>
                        <th style="min-width:8rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-loc>
                    <tr>
                        <td class="font-semibold">{{ loc.name }}</td>
                        <td><span class="bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded text-sm font-mono">{{ loc.code || '—' }}</span></td>
                        <td>{{ loc.country }}</td>
                        <td>{{ loc.region || '—' }}</td>
                        <td>
                            <span class="font-mono" [class.text-green-500]="loc.costMultiplier < 1" [class.text-red-500]="loc.costMultiplier > 1">
                                {{ loc.costMultiplier | number:'1.2-2' }}x
                            </span>
                        </td>
                        <td><inv-status-badge [active]="loc.isActive" /></td>
                        <td>
                            <div class="flex gap-1">
                                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (click)="editLocation(loc)" pTooltip="Edit"></button>
                                <button *ngIf="loc.isActive" pButton icon="pi pi-ban" [rounded]="true" [text]="true" severity="danger" (click)="confirmDeactivate(loc)" pTooltip="Deactivate"></button>
                                <button *ngIf="!loc.isActive" pButton icon="pi pi-check-circle" [rounded]="true" [text]="true" severity="success" (click)="activate(loc)" pTooltip="Activate"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7"><inv-empty-state icon="pi pi-map-marker" message="No locations found" hint="Add your first location to get started" /></td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Create / Edit Dialog -->
        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Location' : 'New Location'" [modal]="true"
                  [style]="{ width: '540px' }" styleClass="p-fluid" [closable]="true">
            <ng-template #content>
                <form [formGroup]="form" class="flex flex-col gap-5 pt-2">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Name *</label>
                            <input pInputText formControlName="name" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Code</label>
                            <input pInputText formControlName="code" maxlength="10" style="text-transform:uppercase" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Country *</label>
                            <input pInputText formControlName="country" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Region</label>
                            <input pInputText formControlName="region" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Latitude</label>
                            <p-inputNumber formControlName="latitude" [minFractionDigits]="4" [maxFractionDigits]="8" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Longitude</label>
                            <p-inputNumber formControlName="longitude" [minFractionDigits]="4" [maxFractionDigits]="8" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Cost Multiplier</label>
                            <p-inputNumber formControlName="costMultiplier" [minFractionDigits]="2" [maxFractionDigits]="2" [min]="0.01" [max]="10" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Timezone</label>
                            <input pInputText formControlName="timezone" placeholder="e.g. Asia/Kathmandu" />
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
export class LocationList implements OnInit {
    @ViewChild('dt') dt!: Table;
    locations: Location[] = [];
    loading = true;
    dialogVisible = false;
    editMode = false;
    editId = 0;
    form!: FormGroup;

    constructor(
        private svc: InventoryV2Service,
        private fb: FormBuilder,
        private msg: MessageService,
        private confirm: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.initForm();
        this.load();
    }

    initForm() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            code: [''],
            country: ['', Validators.required],
            region: [''],
            latitude: [null],
            longitude: [null],
            costMultiplier: [1.0, [Validators.required, Validators.min(0.01)]],
            timezone: [''],
            description: ['']
        });
    }

    load() {
        this.loading = true;
        this.svc.getLocations(true).subscribe({
            next: d => { this.locations = d ?? []; this.loading = false; this.cdr.markForCheck(); },
            error: () => { this.locations = []; this.loading = false; this.cdr.markForCheck(); }
        });
    }

    onSearch(val: string) { this.dt?.filterGlobal(val, 'contains'); }

    openNew() {
        this.editMode = false;
        this.form.reset({ costMultiplier: 1.0 });
        this.dialogVisible = true;
    }

    editLocation(loc: Location) {
        this.editMode = true;
        this.editId = loc.id;
        this.form.patchValue(loc);
        this.dialogVisible = true;
    }

    save() {
        if (this.form.invalid) return;
        const data = this.form.value as CreateLocationRequest;
        if (data.code) data.code = data.code.toUpperCase();

        const obs = this.editMode
            ? this.svc.updateLocation(this.editId, data)
            : this.svc.createLocation(data);

        obs.subscribe({
            next: () => {
                this.msg.add({ severity: 'success', summary: 'Success', detail: this.editMode ? 'Location updated' : 'Location created' });
                this.dialogVisible = false;
                this.load();
            },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to save location' })
        });
    }

    confirmDeactivate(loc: Location) {
        this.confirm.confirm({
            message: `Deactivate "${loc.name}"? It will be hidden from active inventories.`,
            header: 'Confirm Deactivation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.svc.deleteLocation(loc.id).subscribe({
                    next: () => { this.msg.add({ severity: 'success', summary: 'Deactivated', detail: loc.name }); this.load(); },
                    error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to deactivate' })
                });
            }
        });
    }

    activate(loc: Location) {
        this.svc.activateLocation(loc.id).subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Activated', detail: loc.name }); this.load(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to activate' })
        });
    }
}
