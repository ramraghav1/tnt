import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { StatusBadge, InvPageHeader, InvEmptyState } from '../shared/inventory-shared';
import { InventoryV2Service, Guide, Location, GuideLocation, CreateGuideLocationRequest } from '../inventory.service';

@Component({
    selector: 'inv-guide-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, InputNumberModule, TextareaModule, SelectModule, MultiSelectModule,
        TagModule, ToastModule, ConfirmDialogModule, TooltipModule, ChipModule,
        StatusBadge, InvPageHeader, InvEmptyState
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <inv-page-header
            title="Guides"
            icon="pi pi-user"
            [subtitle]="guides.length + ' guides'"
            searchPlaceholder="Search guides..."
            addLabel="Add Guide"
            (searchChange)="onSearch($event)"
            (addClick)="openNew()"
        />

        <div class="card">
            <p-table #dt [value]="guides" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,25,50]"
                     [globalFilterFields]="['fullName','specialization']" dataKey="id"
                     [loading]="loading" [showCurrentPageReport]="true"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="fullName" style="min-width:12rem">Name <p-sortIcon field="fullName" /></th>
                        <th style="min-width:10rem">Languages</th>
                        <th pSortableColumn="pricePerDay" style="min-width:8rem">Daily Rate (USD) <p-sortIcon field="pricePerDay" /></th>
                        <th style="min-width:8rem">Experience</th>
                        <th style="min-width:10rem">Locations</th>
                        <th style="min-width:5rem">Status</th>
                        <th style="min-width:8rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-g>
                    <tr>
                        <td>
                            <div class="font-semibold">{{ g.fullName }}</div>
                            <div class="text-sm text-muted-color">{{ g.specialization || '' }}</div>
                        </td>
                        <td>
                            <div class="flex flex-wrap gap-1">
                                <p-tag *ngFor="let lang of g.languages" [value]="lang" severity="info" [rounded]="true" />
                            </div>
                        </td>
                        <td class="font-mono font-semibold">\${{ g.pricePerDay | number:'1.2-2' }}</td>
                        <td>{{ g.experienceYears ? g.experienceYears + ' yrs' : '—' }}</td>
                        <td>
                            <button pButton [label]="(guideLocMap[g.id!] || []).length + ' locations'" icon="pi pi-map-marker"
                                    [text]="true" size="small" (click)="openLocationManager(g)"></button>
                        </td>
                        <td><inv-status-badge [active]="g.isActive ?? true" /></td>
                        <td>
                            <div class="flex gap-1">
                                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (click)="editGuide(g)" pTooltip="Edit"></button>
                                <button *ngIf="g.isActive" pButton icon="pi pi-ban" [rounded]="true" [text]="true" severity="danger" (click)="deactivate(g)" pTooltip="Deactivate"></button>
                                <button *ngIf="!g.isActive" pButton icon="pi pi-check-circle" [rounded]="true" [text]="true" severity="success" (click)="activate(g)" pTooltip="Activate"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7"><inv-empty-state icon="pi pi-user" message="No guides found" hint="Add your first guide" /></td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Guide Create/Edit Dialog -->
        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Guide' : 'New Guide'" [modal]="true" [style]="{ width: '580px' }" styleClass="p-fluid">
            <ng-template #content>
                <form [formGroup]="form" class="flex flex-col gap-4 pt-2">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Full Name *</label>
                            <input pInputText formControlName="fullName" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Contact Number</label>
                            <input pInputText formControlName="contactNumber" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Email</label>
                            <input pInputText formControlName="emailAddress" type="email" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Experience (years)</label>
                            <p-inputNumber formControlName="experienceYears" [min]="0" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Languages *</label>
                        <input pInputText formControlName="languagesText" placeholder="English, Nepali, Hindi (comma-separated)" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Specialization</label>
                            <input pInputText formControlName="specialization" placeholder="Trekking, Cultural, etc." />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Daily Rate (USD) *</label>
                            <p-inputNumber formControlName="pricePerDay" mode="currency" currency="USD" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Bio</label>
                        <textarea pTextarea formControlName="bio" rows="2"></textarea>
                    </div>
                </form>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="dialogVisible = false"></button>
                <button pButton [label]="editMode ? 'Update' : 'Create'" icon="pi pi-check" [disabled]="form.invalid" (click)="save()"></button>
            </ng-template>
        </p-dialog>

        <!-- Guide Locations Dialog -->
        <p-dialog [(visible)]="locDialogVisible" header="Guide Locations" [modal]="true" [style]="{ width: '520px' }">
            <ng-template #content>
                <div class="mb-3 text-lg font-semibold">{{ selectedGuide?.fullName }}</div>
                <div class="flex flex-col gap-2 mb-4">
                    <div *ngFor="let gl of selectedGuideLocations" class="flex items-center justify-between p-2 rounded bg-surface-50 dark:bg-surface-800">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-map-marker text-primary"></i>
                            <span>{{ gl.locationName }}</span>
                            <p-tag *ngIf="gl.isPrimary" value="Primary" severity="contrast" [rounded]="true" />
                        </div>
                        <button pButton icon="pi pi-times" [rounded]="true" [text]="true" severity="danger" (click)="removeGuideLocation(gl)"></button>
                    </div>
                    <div *ngIf="selectedGuideLocations.length === 0" class="text-center text-muted-color py-3">No locations assigned</div>
                </div>

                <div class="flex items-end gap-2 pt-2 border-t border-surface-200 dark:border-surface-700">
                    <div class="flex-1 flex flex-col gap-1">
                        <label class="text-sm font-semibold">Add Location</label>
                        <p-select [(ngModel)]="newLocId" [options]="locationOptions" optionLabel="label" optionValue="value" placeholder="Select" [filter]="true" />
                    </div>
                    <button pButton icon="pi pi-plus" label="Add" (click)="addGuideLocation()" [disabled]="!newLocId"></button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class GuideList implements OnInit {
    @ViewChild('dt') dt!: Table;
    guides: Guide[] = [];
    locations: Location[] = [];
    locationOptions: any[] = [];
    loading = true;
    dialogVisible = false;
    editMode = false;
    editId = 0;
    form!: FormGroup;

    // Guide locations
    guideLocMap: Record<number, GuideLocation[]> = {};
    locDialogVisible = false;
    selectedGuide: Guide | null = null;
    selectedGuideLocations: GuideLocation[] = [];
    newLocId: number | null = null;

    constructor(
        private svc: InventoryV2Service,
        private fb: FormBuilder,
        private msg: MessageService,
        private confirm: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            fullName: ['', Validators.required],
            contactNumber: [''],
            emailAddress: [''],
            experienceYears: [null],
            languagesText: ['', Validators.required],
            specialization: [''],
            pricePerDay: [0, [Validators.required, Validators.min(0)]],
            bio: ['']
        });
        this.loadLocations();
        this.load();
    }

    loadLocations() {
        this.svc.getLocations().subscribe({
            next: d => { this.locations = d ?? []; this.locationOptions = this.locations.map(l => ({ label: `${l.name}, ${l.country}`, value: l.id })); this.cdr.markForCheck(); }
        });
    }

    load() {
        this.loading = true;
        this.svc.getGuides(true).subscribe({
            next: d => {
                this.guides = d ?? [];
                this.loading = false;
                // Load locations for each guide
                this.guides.forEach(g => {
                    if (g.id) {
                        this.svc.getGuideLocations(g.id).subscribe({
                            next: locs => { this.guideLocMap[g.id!] = locs ?? []; this.cdr.markForCheck(); }
                        });
                    }
                });
                this.cdr.markForCheck();
            },
            error: () => { this.guides = []; this.loading = false; this.cdr.markForCheck(); }
        });
    }

    onSearch(val: string) { this.dt?.filterGlobal(val, 'contains'); }

    openNew() {
        this.editMode = false;
        this.form.reset({ pricePerDay: 0 });
        this.dialogVisible = true;
    }

    editGuide(g: Guide) {
        this.editMode = true;
        this.editId = g.id!;
        this.form.patchValue({ ...g, languagesText: g.languages?.join(', ') || '' });
        this.dialogVisible = true;
    }

    save() {
        if (this.form.invalid) return;
        const v = this.form.value;
        const payload: any = {
            fullName: v.fullName, contactNumber: v.contactNumber, emailAddress: v.emailAddress,
            experienceYears: v.experienceYears, specialization: v.specialization,
            pricePerDay: v.pricePerDay, bio: v.bio,
            languages: (v.languagesText || '').split(',').map((s: string) => s.trim()).filter((s: string) => s)
        };

        const obs = this.editMode ? this.svc.updateGuide(this.editId, payload) : this.svc.createGuide(payload);
        obs.subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Success' }); this.dialogVisible = false; this.load(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to save guide' })
        });
    }

    deactivate(g: Guide) {
        this.confirm.confirm({
            message: `Deactivate "${g.fullName}"?`, header: 'Confirm',
            accept: () => this.svc.deleteGuide(g.id!).subscribe({
                next: () => { this.msg.add({ severity: 'success', summary: 'Deactivated' }); this.load(); },
                error: () => this.msg.add({ severity: 'error', summary: 'Error' })
            })
        });
    }

    activate(g: Guide) {
        this.svc.activateGuide(g.id!).subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Activated' }); this.load(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error' })
        });
    }

    // ─── GUIDE LOCATIONS ─────────────────────
    openLocationManager(g: Guide) {
        this.selectedGuide = g;
        this.selectedGuideLocations = this.guideLocMap[g.id!] || [];
        this.newLocId = null;
        this.locDialogVisible = true;
    }

    addGuideLocation() {
        if (!this.selectedGuide?.id || !this.newLocId) return;
        const req: CreateGuideLocationRequest = { guideId: this.selectedGuide.id, locationId: this.newLocId, isPrimary: this.selectedGuideLocations.length === 0 };
        this.svc.createGuideLocation(req).subscribe({
            next: () => {
                this.svc.getGuideLocations(this.selectedGuide!.id!).subscribe({
                    next: d => {
                        this.selectedGuideLocations = d ?? [];
                        this.guideLocMap[this.selectedGuide!.id!] = this.selectedGuideLocations;
                        this.newLocId = null;
                        this.msg.add({ severity: 'success', summary: 'Location added' });
                        this.cdr.markForCheck();
                    }
                });
            },
            error: () => this.msg.add({ severity: 'error', summary: 'Error' })
        });
    }

    removeGuideLocation(gl: GuideLocation) {
        this.svc.deleteGuideLocation(gl.id).subscribe({
            next: () => {
                this.selectedGuideLocations = this.selectedGuideLocations.filter(l => l.id !== gl.id);
                this.guideLocMap[this.selectedGuide!.id!] = this.selectedGuideLocations;
                this.msg.add({ severity: 'success', summary: 'Removed' });
                this.cdr.markForCheck();
            }
        });
    }
}
