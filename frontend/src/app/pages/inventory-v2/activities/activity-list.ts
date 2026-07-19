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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { StatusBadge, InvPageHeader, InvEmptyState } from '../shared/inventory-shared';
import { InventoryV2Service, Activity, Location, ActivityLocation, CreateActivityLocationRequest } from '../inventory.service';

@Component({
    selector: 'inv-activity-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, InputNumberModule, TextareaModule, SelectModule, ToggleSwitchModule,
        TagModule, ToastModule, ConfirmDialogModule, TooltipModule,
        StatusBadge, InvPageHeader, InvEmptyState
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <inv-page-header
            title="Activities"
            icon="pi pi-flag"
            [subtitle]="activities.length + ' activities'"
            searchPlaceholder="Search activities..."
            addLabel="Add Activity"
            (searchChange)="onSearch($event)"
            (addClick)="openNew()"
        />

        <div class="card">
            <p-table #dt [value]="activities" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,25,50]"
                     [globalFilterFields]="['name','activityType','location']" dataKey="id"
                     [loading]="loading" [showCurrentPageReport]="true"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name" style="min-width:12rem">Activity <p-sortIcon field="name" /></th>
                        <th pSortableColumn="activityType" style="min-width:8rem">Category <p-sortIcon field="activityType" /></th>
                        <th style="min-width:6rem">Location</th>
                        <th style="min-width:5rem">Duration</th>
                        <th pSortableColumn="pricePerPerson" style="min-width:8rem">Base Cost (USD) <p-sortIcon field="pricePerPerson" /></th>
                        <th style="min-width:6rem">Type</th>
                        <th style="min-width:5rem">Status</th>
                        <th style="min-width:8rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-a>
                    <tr>
                        <td>
                            <div class="font-semibold">{{ a.name }}</div>
                            <div class="text-sm text-muted-color" *ngIf="a.difficultyLevel">{{ a.difficultyLevel }}</div>
                        </td>
                        <td><p-tag [value]="a.activityType" [severity]="getCategorySeverity(a.activityType)" [rounded]="true" /></td>
                        <td>{{ a.location }}</td>
                        <td>{{ a.durationHours }}h</td>
                        <td class="font-mono font-semibold">\${{ a.pricePerPerson | number:'1.2-2' }}</td>
                        <td><p-tag [value]="a.isMandatory ? 'Required' : 'Optional'" [severity]="a.isMandatory ? 'warn' : 'secondary'" [rounded]="true" /></td>
                        <td><inv-status-badge [active]="a.isActive ?? true" /></td>
                        <td>
                            <div class="flex gap-1">
                                <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (click)="editActivity(a)" pTooltip="Edit"></button>
                                <button pButton icon="pi pi-map-marker" [rounded]="true" [text]="true" severity="contrast" (click)="openLocationManager(a)" pTooltip="Locations"></button>
                                <button *ngIf="a.isActive" pButton icon="pi pi-ban" [rounded]="true" [text]="true" severity="danger" (click)="deactivate(a)" pTooltip="Deactivate"></button>
                                <button *ngIf="!a.isActive" pButton icon="pi pi-check-circle" [rounded]="true" [text]="true" severity="success" (click)="activate(a)" pTooltip="Activate"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="8"><inv-empty-state icon="pi pi-flag" message="No activities found" hint="Add your first activity" /></td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Activity Create/Edit Dialog -->
        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Activity' : 'New Activity'" [modal]="true" [style]="{ width: '580px' }" styleClass="p-fluid">
            <ng-template #content>
                <form [formGroup]="form" class="flex flex-col gap-4 pt-2">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Name *</label>
                            <input pInputText formControlName="name" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Category *</label>
                            <p-select formControlName="activityType" [options]="categoryOptions" optionLabel="label" optionValue="value" placeholder="Select" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Location *</label>
                            <p-select formControlName="locationId" [options]="locationOptions" optionLabel="label" optionValue="value" [filter]="true" placeholder="Select" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Duration (hours)</label>
                            <p-inputNumber formControlName="durationHours" [min]="0.5" [step]="0.5" [minFractionDigits]="1" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Base Cost (USD/person) *</label>
                            <p-inputNumber formControlName="pricePerPerson" mode="currency" currency="USD" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Difficulty Level</label>
                            <p-select formControlName="difficultyLevel" [options]="difficultyOptions" optionLabel="label" optionValue="value" placeholder="Select" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Min Participants</label>
                            <p-inputNumber formControlName="minParticipants" [min]="1" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Max Participants</label>
                            <p-inputNumber formControlName="maxParticipants" [min]="1" />
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <p-toggleSwitch formControlName="isMandatory" />
                        <label class="font-semibold text-sm">Required activity (included in all packages)</label>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Description</label>
                        <textarea pTextarea formControlName="description" rows="2"></textarea>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Equipment</label>
                        <input pInputText formControlName="equipmentText" placeholder="Harness, Helmet (comma-separated)" />
                    </div>
                </form>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="dialogVisible = false"></button>
                <button pButton [label]="editMode ? 'Update' : 'Create'" icon="pi pi-check" [disabled]="form.invalid" (click)="save()"></button>
            </ng-template>
        </p-dialog>

        <!-- Activity Locations Dialog -->
        <p-dialog [(visible)]="locDialogVisible" header="Activity Locations" [modal]="true" [style]="{ width: '520px' }">
            <ng-template #content>
                <div class="mb-3 text-lg font-semibold">{{ selectedActivity?.name }}</div>
                <div class="flex flex-col gap-2 mb-4">
                    <div *ngFor="let al of activityLocations" class="flex items-center justify-between p-2 rounded bg-surface-50 dark:bg-surface-800">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-map-marker text-primary"></i>
                            <span>{{ al.locationName }}</span>
                            <p-tag *ngIf="al.isPrimary" value="Primary" severity="contrast" [rounded]="true" />
                        </div>
                        <button pButton icon="pi pi-times" [rounded]="true" [text]="true" severity="danger" (click)="removeActivityLocation(al)"></button>
                    </div>
                    <div *ngIf="activityLocations.length === 0" class="text-center text-muted-color py-3">No locations assigned</div>
                </div>
                <div class="flex items-end gap-2 pt-2 border-t border-surface-200 dark:border-surface-700">
                    <div class="flex-1 flex flex-col gap-1">
                        <label class="text-sm font-semibold">Add Location</label>
                        <p-select [(ngModel)]="newLocId" [options]="locationOptions" optionLabel="label" optionValue="value" placeholder="Select" [filter]="true" />
                    </div>
                    <button pButton icon="pi pi-plus" label="Add" (click)="addActivityLocation()" [disabled]="!newLocId"></button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class ActivityList implements OnInit {
    @ViewChild('dt') dt!: Table;
    activities: Activity[] = [];
    locations: Location[] = [];
    locationOptions: any[] = [];
    loading = true;
    dialogVisible = false;
    editMode = false;
    editId = 0;
    form!: FormGroup;

    categoryOptions = [
        { label: 'Adventure', value: 'Adventure' }, { label: 'Cultural', value: 'Cultural' },
        { label: 'Nature', value: 'Nature' }, { label: 'Water Sports', value: 'Water Sports' },
        { label: 'Sightseeing', value: 'Sightseeing' }, { label: 'Wellness', value: 'Wellness' },
        { label: 'Food & Drink', value: 'Food & Drink' }, { label: 'Wildlife', value: 'Wildlife' }
    ];
    difficultyOptions = [
        { label: 'Easy', value: 'Easy' }, { label: 'Moderate', value: 'Moderate' },
        { label: 'Hard', value: 'Hard' }, { label: 'Expert', value: 'Expert' }
    ];

    // Activity locations
    locDialogVisible = false;
    selectedActivity: Activity | null = null;
    activityLocations: ActivityLocation[] = [];
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
            name: ['', Validators.required],
            activityType: ['', Validators.required],
            locationId: [null],
            durationHours: [1],
            pricePerPerson: [0, [Validators.required, Validators.min(0)]],
            difficultyLevel: [''],
            minParticipants: [null],
            maxParticipants: [null],
            isMandatory: [false],
            description: [''],
            equipmentText: ['']
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
        this.svc.getActivities(true).subscribe({
            next: d => { this.activities = d ?? []; this.loading = false; this.cdr.markForCheck(); },
            error: () => { this.activities = []; this.loading = false; this.cdr.markForCheck(); }
        });
    }

    onSearch(val: string) { this.dt?.filterGlobal(val, 'contains'); }

    getCategorySeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, any> = { Adventure: 'danger', Cultural: 'info', Nature: 'success', 'Water Sports': 'contrast', Sightseeing: 'warn', Wellness: 'secondary' };
        return map[type] ?? 'info';
    }

    openNew() {
        this.editMode = false;
        this.form.reset({ durationHours: 1, pricePerPerson: 0, isMandatory: false });
        this.dialogVisible = true;
    }

    editActivity(a: Activity) {
        this.editMode = true;
        this.editId = a.id!;
        this.form.patchValue({ ...a, equipmentText: a.equipment?.join(', ') || '' });
        this.dialogVisible = true;
    }

    save() {
        if (this.form.invalid) return;
        const v = this.form.value;
        const loc = this.locations.find(l => l.id === v.locationId);
        const payload: any = {
            name: v.name, activityType: v.activityType, location: loc?.name || '', locationId: v.locationId,
            durationHours: v.durationHours, pricePerPerson: v.pricePerPerson, difficultyLevel: v.difficultyLevel,
            minParticipants: v.minParticipants, maxParticipants: v.maxParticipants, isMandatory: v.isMandatory,
            description: v.description, images: [],
            equipment: (v.equipmentText || '').split(',').map((s: string) => s.trim()).filter((s: string) => s)
        };
        const obs = this.editMode ? this.svc.updateActivity(this.editId, payload) : this.svc.createActivity(payload);
        obs.subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Success' }); this.dialogVisible = false; this.load(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to save activity' })
        });
    }

    deactivate(a: Activity) {
        this.confirm.confirm({
            message: `Deactivate "${a.name}"?`, header: 'Confirm',
            accept: () => this.svc.deleteActivity(a.id!).subscribe({
                next: () => { this.msg.add({ severity: 'success', summary: 'Deactivated' }); this.load(); },
                error: () => this.msg.add({ severity: 'error', summary: 'Error' })
            })
        });
    }

    activate(a: Activity) {
        this.svc.activateActivity(a.id!).subscribe({
            next: () => { this.msg.add({ severity: 'success', summary: 'Activated' }); this.load(); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error' })
        });
    }

    // ─── ACTIVITY LOCATIONS ──────────────────
    openLocationManager(a: Activity) {
        this.selectedActivity = a;
        this.activityLocations = [];
        this.newLocId = null;
        this.locDialogVisible = true;
        if (a.id) {
            this.svc.getActivityLocations(a.id).subscribe({
                next: d => { this.activityLocations = d ?? []; this.cdr.markForCheck(); }
            });
        }
    }

    addActivityLocation() {
        if (!this.selectedActivity?.id || !this.newLocId) return;
        const req: CreateActivityLocationRequest = { activityId: this.selectedActivity.id, locationId: this.newLocId, isPrimary: this.activityLocations.length === 0 };
        this.svc.createActivityLocation(req).subscribe({
            next: () => { this.openLocationManager(this.selectedActivity!); this.msg.add({ severity: 'success', summary: 'Added' }); },
            error: () => this.msg.add({ severity: 'error', summary: 'Error' })
        });
    }

    removeActivityLocation(al: ActivityLocation) {
        this.svc.deleteActivityLocation(al.id).subscribe({
            next: () => {
                this.activityLocations = this.activityLocations.filter(l => l.id !== al.id);
                this.msg.add({ severity: 'success', summary: 'Removed' });
                this.cdr.markForCheck();
            }
        });
    }
}
