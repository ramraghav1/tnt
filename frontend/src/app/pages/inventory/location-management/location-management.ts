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
import { MessageService, ConfirmationService } from 'primeng/api';
import { InventoryRedesignService, Location, CreateLocationRequest } from '../inventory-redesign.service';

@Component({
    selector: 'app-location-management',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        TagModule, DialogModule, InputNumberModule, TextareaModule, ToolbarModule,
        ConfirmDialogModule, IconFieldModule, InputIconModule, TooltipModule, SelectModule
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
                            <i class="pi pi-map-marker text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Locations</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Location" icon="pi pi-plus" class="mr-2" (click)="openNew()"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="locations" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5,10,25,50]"
                     [globalFilterFields]="['name','code','country','region']"
                     dataKey="id" [loading]="loading" responsiveLayout="scroll" [showCurrentPageReport]="true"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords} locations">
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" #filterInput (input)="dt.filterGlobal(filterInput.value, 'contains')" placeholder="Search locations..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name" style="min-width:12rem">Name <p-sortIcon field="name" /></th>
                        <th pSortableColumn="code" style="min-width:6rem">Code <p-sortIcon field="code" /></th>
                        <th pSortableColumn="country" style="min-width:10rem">Country <p-sortIcon field="country" /></th>
                        <th pSortableColumn="region" style="min-width:8rem">Region <p-sortIcon field="region" /></th>
                        <th pSortableColumn="costMultiplier" style="min-width:8rem">Cost Multiplier <p-sortIcon field="costMultiplier" /></th>
                        <th style="min-width:6rem">Status</th>
                        <th style="min-width:10rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-loc>
                    <tr>
                        <td><span class="font-semibold">{{ loc.name }}</span></td>
                        <td>{{ loc.code || '-' }}</td>
                        <td>{{ loc.country }}</td>
                        <td>{{ loc.region || '-' }}</td>
                        <td>{{ loc.costMultiplier | number:'1.2-2' }}x</td>
                        <td><p-tag [value]="loc.isActive ? 'Active' : 'Inactive'" [severity]="loc.isActive ? 'success' : 'danger'" /></td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (click)="editLocation(loc)" pTooltip="Edit"></button>
                                <button *ngIf="loc.isActive" pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (click)="deactivateLocation(loc)" pTooltip="Deactivate"></button>
                                <button *ngIf="!loc.isActive" pButton icon="pi pi-check" [rounded]="true" [text]="true" severity="success" (click)="activateLocation(loc)" pTooltip="Activate"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="7" class="text-center py-8">
                            <div class="flex flex-col items-center gap-3">
                                <i class="pi pi-map-marker text-4xl text-muted-color"></i>
                                <span class="text-lg text-muted-color">No locations found</span>
                                <span class="text-sm text-muted-color">Add your first location to get started</span>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Location Dialog -->
        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '550px' }" header="Location Details" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2 col-span-2">
                        <label class="font-semibold">Name *</label>
                        <input pInputText [(ngModel)]="item.name" autofocus />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Code</label>
                        <input pInputText [(ngModel)]="item.code" placeholder="e.g. KTM" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Country *</label>
                        <input pInputText [(ngModel)]="item.country" placeholder="e.g. Nepal" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Region</label>
                        <input pInputText [(ngModel)]="item.region" placeholder="e.g. Bagmati" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Cost Multiplier</label>
                        <p-inputNumber [(ngModel)]="item.costMultiplier" [min]="0.1" [max]="10" [minFractionDigits]="2" [maxFractionDigits]="2" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Latitude</label>
                        <p-inputNumber [(ngModel)]="item.latitude" [minFractionDigits]="4" [maxFractionDigits]="7" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Longitude</label>
                        <p-inputNumber [(ngModel)]="item.longitude" [minFractionDigits]="4" [maxFractionDigits]="7" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Timezone</label>
                        <input pInputText [(ngModel)]="item.timezone" placeholder="e.g. Asia/Kathmandu" />
                    </div>
                    <div class="flex flex-col gap-2 col-span-2">
                        <label class="font-semibold">Description</label>
                        <textarea pTextarea [(ngModel)]="item.description" rows="3"></textarea>
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
export class LocationManagement implements OnInit {
    locations: Location[] = [];
    item: any = {};
    dialogVisible = false;
    loading = true;
    editMode = false;

    constructor(
        private svc: InventoryRedesignService,
        private msg: MessageService,
        private confirm: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() { this.load(); }

    load() {
        this.loading = true;
        this.svc.getLocations(true).subscribe({
            next: (data) => { this.locations = data ?? []; this.loading = false; this.cdr.markForCheck(); },
            error: () => { this.locations = []; this.loading = false; this.cdr.markForCheck(); this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load locations' }); }
        });
    }

    openNew() {
        this.item = { costMultiplier: 1.00, country: 'Nepal' };
        this.editMode = false;
        this.dialogVisible = true;
    }

    editLocation(loc: Location) {
        this.item = { ...loc };
        this.editMode = true;
        this.dialogVisible = true;
    }

    save() {
        if (!this.item.name?.trim() || !this.item.country?.trim()) {
            this.msg.add({ severity: 'warn', summary: 'Warning', detail: 'Name and Country are required' });
            return;
        }
        const obs = this.editMode
            ? this.svc.updateLocation(this.item.id, this.item)
            : this.svc.createLocation(this.item);
        obs.subscribe({
            next: () => { this.load(); this.dialogVisible = false; this.msg.add({ severity: 'success', summary: 'Success', detail: this.editMode ? 'Location updated' : 'Location created' }); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to save location' })
        });
    }

    deactivateLocation(loc: Location) {
        this.confirm.confirm({
            message: `Deactivate "${loc.name}"?`,
            header: 'Confirm', icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.svc.deleteLocation(loc.id).subscribe({
                    next: () => { this.load(); this.msg.add({ severity: 'success', summary: 'Success', detail: 'Location deactivated' }); },
                    error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to deactivate' })
                });
            }
        });
    }

    activateLocation(loc: Location) {
        this.svc.activateLocation(loc.id).subscribe({
            next: () => { this.load(); this.msg.add({ severity: 'success', summary: 'Success', detail: 'Location activated' }); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to activate' })
        });
    }
}
