import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { InvPageHeader } from '../shared/inventory-shared';
import { InventoryV2Service, Vehicle, Location } from '../inventory.service';

@Component({
    selector: 'inv-vehicle-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, InputNumberModule,
        SelectModule, DatePickerModule, CardModule, ToastModule, InvPageHeader
    ],
    providers: [MessageService],
    template: `
        <p-toast />
        <inv-page-header [title]="isEdit ? 'Edit Vehicle' : 'New Vehicle'" icon="pi pi-car" [showSearch]="false" [showAdd]="false" />

        <div class="flex gap-2 mb-4">
            <button pButton label="Back to Vehicles" icon="pi pi-arrow-left" [text]="true" (click)="router.navigate(['/inventory-v2/vehicles'])"></button>
        </div>

        <div class="card">
            <form [formGroup]="form" class="flex flex-col gap-5">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Vehicle Type *</label>
                        <p-select formControlName="vehicleType" [options]="typeOptions" optionLabel="label" optionValue="value" placeholder="Select" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Model *</label>
                        <input pInputText formControlName="model" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Registration # *</label>
                        <input pInputText formControlName="registrationNumber" />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Capacity (pax) *</label>
                        <p-inputNumber formControlName="capacity" [min]="1" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Base Rate (USD/day) *</label>
                        <p-inputNumber formControlName="pricePerDay" mode="currency" currency="USD" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Features</label>
                        <input pInputText formControlName="featuresText" placeholder="AC, GPS, WiFi (comma-separated)" />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Driver Name</label>
                        <input pInputText formControlName="driverName" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Driver Contact</label>
                        <input pInputText formControlName="driverContact" />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Insurance Expiry</label>
                        <p-datepicker formControlName="insuranceExpiry" dateFormat="yy-mm-dd" [showIcon]="true" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Permit Expiry</label>
                        <p-datepicker formControlName="permitExpiry" dateFormat="yy-mm-dd" [showIcon]="true" />
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-2">
                    <button pButton label="Cancel" icon="pi pi-times" severity="secondary" [outlined]="true"
                            (click)="router.navigate(['/inventory-v2/vehicles'])"></button>
                    <button pButton [label]="isEdit ? 'Update' : 'Create'" icon="pi pi-check"
                            [disabled]="form.invalid || saving" [loading]="saving" (click)="save()"></button>
                </div>
            </form>
        </div>
    `
})
export class VehicleForm implements OnInit {
    form!: FormGroup;
    isEdit = false;
    vehicleId = 0;
    saving = false;
    typeOptions = [
        { label: 'Car', value: 'Car' }, { label: 'SUV', value: 'SUV' }, { label: 'Jeep', value: 'Jeep' },
        { label: 'Van', value: 'Van' }, { label: 'Bus', value: 'Bus' }, { label: 'Minibus', value: 'Minibus' },
        { label: 'Motorcycle', value: 'Motorcycle' }
    ];

    constructor(
        public router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private svc: InventoryV2Service,
        private msg: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            vehicleType: ['', Validators.required],
            model: ['', Validators.required],
            registrationNumber: ['', Validators.required],
            capacity: [4, [Validators.required, Validators.min(1)]],
            pricePerDay: [0, [Validators.required, Validators.min(0)]],
            featuresText: [''],
            driverName: [''],
            driverContact: [''],
            insuranceExpiry: [null],
            permitExpiry: [null]
        });

        this.route.params.subscribe(p => {
            if (p['id'] && p['id'] !== 'new') {
                this.isEdit = true;
                this.vehicleId = +p['id'];
                this.loadVehicle();
            }
        });
    }

    loadVehicle() {
        this.svc.getVehicle(this.vehicleId).subscribe({
            next: v => {
                this.form.patchValue({
                    ...v,
                    featuresText: v.features?.join(', ') || '',
                    insuranceExpiry: v.insuranceExpiry ? new Date(v.insuranceExpiry) : null,
                    permitExpiry: v.permitExpiry ? new Date(v.permitExpiry) : null
                });
                this.cdr.markForCheck();
            },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load vehicle' })
        });
    }

    save() {
        if (this.form.invalid) return;
        this.saving = true;
        const val = this.form.value;
        const payload: any = {
            vehicleType: val.vehicleType, model: val.model, registrationNumber: val.registrationNumber,
            capacity: val.capacity, pricePerDay: val.pricePerDay,
            features: (val.featuresText || '').split(',').map((s: string) => s.trim()).filter((s: string) => s),
            driverName: val.driverName, driverContact: val.driverContact,
            insuranceExpiry: val.insuranceExpiry ? this.formatDate(val.insuranceExpiry) : null,
            permitExpiry: val.permitExpiry ? this.formatDate(val.permitExpiry) : null
        };

        const obs = this.isEdit ? this.svc.updateVehicle(this.vehicleId, payload) : this.svc.createVehicle(payload);
        obs.subscribe({
            next: () => {
                this.saving = false;
                this.msg.add({ severity: 'success', summary: 'Success', detail: this.isEdit ? 'Updated' : 'Created' });
                this.router.navigate(['/inventory-v2/vehicles']);
            },
            error: () => { this.saving = false; this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to save' }); this.cdr.markForCheck(); }
        });
    }

    private formatDate(d: Date): string { return d.toISOString().substring(0, 10); }
}
