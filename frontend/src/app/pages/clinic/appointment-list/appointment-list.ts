import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FluidModule } from 'primeng/fluid';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TenantSelector } from '../tenant-selector/tenant-selector';
import { ClinicService, Appointment, Practitioner, Patient, ClinicServiceItem } from '../clinic.service';

@Component({
    selector: 'app-appointment-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        DialogModule, ConfirmDialogModule, TagModule, IconFieldModule, InputIconModule,
        ToolbarModule, FluidModule, TextareaModule, DatePickerModule, SelectModule, TenantSelector
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <span class="font-semibold text-xl mr-4">Appointments</span>
                    <app-tenant-selector (tenantChanged)="onTenantChange($event)"></app-tenant-selector>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Appointment" icon="pi pi-plus" severity="success" (click)="openNew()" [disabled]="!tenantId"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="items" [paginator]="true" [rows]="10" [loading]="loading"
                     [showGridlines]="true" [rowHover]="true" responsiveLayout="scroll"
                     [globalFilterFields]="['patientName', 'practitionerName', 'serviceName', 'status']">
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center flex-wrap gap-2">
                        <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
                        <p-iconfield iconPosition="left">
                            <p-inputicon><i class="pi pi-search"></i></p-inputicon>
                            <input #filterInput pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search appointments..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="appointmentDate">Date <p-sortIcon field="appointmentDate"></p-sortIcon></th>
                        <th>Time</th>
                        <th pSortableColumn="patientName">Patient <p-sortIcon field="patientName"></p-sortIcon></th>
                        <th pSortableColumn="practitionerName">Practitioner <p-sortIcon field="practitionerName"></p-sortIcon></th>
                        <th>Service</th>
                        <th pSortableColumn="status">Status <p-sortIcon field="status"></p-sortIcon></th>
                        <th style="min-width: 10rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-item>
                    <tr>
                        <td>{{ item.appointmentDate | date:'mediumDate' }}</td>
                        <td>{{ item.startTime }} - {{ item.endTime }}</td>
                        <td class="font-semibold">{{ item.patientName }}</td>
                        <td>{{ item.practitionerName }}</td>
                        <td>{{ item.serviceName }}</td>
                        <td><p-tag [value]="item.status" [severity]="getStatusSeverity(item.status)"></p-tag></td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-check" class="p-button-rounded p-button-sm" severity="success"
                                        *ngIf="item.status === 'Scheduled'" pTooltip="Complete" (click)="updateStatus(item, 'Completed')"></button>
                                <button pButton icon="pi pi-times" class="p-button-rounded p-button-sm" severity="warn"
                                        *ngIf="item.status === 'Scheduled'" pTooltip="Cancel" (click)="updateStatus(item, 'Cancelled')"></button>
                                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-sm" (click)="edit(item)"></button>
                                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" (click)="remove(item)"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7" class="text-center py-6"><i class="pi pi-calendar text-4xl text-color-secondary"></i><br>No appointments found.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Appointment' : 'New Appointment'" [modal]="true" [style]="{ width: '650px' }">
            <p-fluid>
                <div class="flex flex-col gap-4 mt-2">
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">Patient *</label>
                            <p-select [options]="patients" [(ngModel)]="selected.patientId" optionLabel="label" optionValue="value" placeholder="Select patient"></p-select>
                        </div>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">Practitioner *</label>
                            <p-select [options]="practitioners" [(ngModel)]="selected.practitionerId" optionLabel="label" optionValue="value" placeholder="Select practitioner"></p-select>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Service *</label>
                        <p-select [options]="services" [(ngModel)]="selected.serviceId" optionLabel="label" optionValue="value" placeholder="Select service" (onChange)="onServiceChange($event)"></p-select>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Date *</label><p-datepicker [(ngModel)]="selected.appointmentDate" dateFormat="yy-mm-dd" [showIcon]="true"></p-datepicker></div>
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Start Time *</label><input pInputText [(ngModel)]="selected.startTime" placeholder="09:00" /></div>
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">End Time *</label><input pInputText [(ngModel)]="selected.endTime" placeholder="10:00" /></div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Status</label>
                        <p-select [options]="statusOptions" [(ngModel)]="selected.status" optionLabel="label" optionValue="value"></p-select>
                    </div>
                    <div class="flex flex-col gap-2"><label class="font-semibold">Notes</label><textarea pTextarea [(ngModel)]="selected.notes" rows="2"></textarea></div>
                </div>
            </p-fluid>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="dialogVisible = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="save()" [disabled]="!selected.patientId || !selected.practitionerId || !selected.serviceId"></button>
            </ng-template>
        </p-dialog>
    `
})
export class AppointmentList implements OnInit {
    items: Appointment[] = [];
    tenantId: number | null = null;
    loading = false;
    dialogVisible = false;
    editMode = false;
    selected: any = {};

    patients: { label: string; value: number }[] = [];
    practitioners: { label: string; value: number }[] = [];
    services: { label: string; value: number; duration: number }[] = [];
    statusOptions = [
        { label: 'Scheduled', value: 'Scheduled' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Cancelled', value: 'Cancelled' },
        { label: 'No-Show', value: 'No-Show' }
    ];

    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(private clinicService: ClinicService, private messageService: MessageService, private confirmationService: ConfirmationService, private cdr: ChangeDetectorRef) {}

    ngOnInit() {}

    onTenantChange(tenantId: number) {
        this.tenantId = tenantId;
        this.load();
        this.loadDropdowns();
    }

    load() {
        if (!this.tenantId) return;
        this.loading = true;
        this.clinicService.getAppointments(this.tenantId).subscribe({
            next: (data) => { this.items = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load' }); this.loading = false; this.cdr.detectChanges(); }
        });
    }

    loadDropdowns() {
        if (!this.tenantId) return;
        this.clinicService.getPatients(this.tenantId).subscribe({ next: (d) => { this.patients = d.map(p => ({ label: `${p.firstName} ${p.lastName}`, value: p.id })); this.cdr.detectChanges(); } });
        this.clinicService.getPractitioners(this.tenantId).subscribe({ next: (d) => { this.practitioners = d.map(p => ({ label: `${p.firstName} ${p.lastName}`, value: p.id })); this.cdr.detectChanges(); } });
        this.clinicService.getClinicServices(this.tenantId).subscribe({ next: (d) => { this.services = d.map(s => ({ label: `${s.name} (${s.durationMinutes}m)`, value: s.id, duration: s.durationMinutes })); this.cdr.detectChanges(); } });
    }

    openNew() {
        this.selected = { patientId: null, practitionerId: null, serviceId: null, appointmentDate: new Date(), startTime: '09:00', endTime: '10:00', status: 'Scheduled', notes: '' };
        this.editMode = false;
        this.dialogVisible = true;
    }

    edit(item: Appointment) {
        this.selected = { ...item, appointmentDate: new Date(item.appointmentDate) };
        this.editMode = true;
        this.dialogVisible = true;
    }

    onServiceChange(event: any) {
        const svc = this.services.find(s => s.value === event.value);
        if (svc && this.selected.startTime) {
            const [h, m] = this.selected.startTime.split(':').map(Number);
            const endMin = h * 60 + m + svc.duration;
            this.selected.endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
        }
    }

    save() {
        const payload = {
            ...this.selected,
            appointmentDate: this.formatDate(this.selected.appointmentDate)
        };
        if (this.editMode) {
            this.clinicService.updateAppointment(this.tenantId!, this.selected.id, payload).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Updated' }); this.dialogVisible = false; this.load(); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
            });
        } else {
            this.clinicService.createAppointment(this.tenantId!, payload).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Created' }); this.dialogVisible = false; this.load(); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' })
            });
        }
    }

    updateStatus(item: Appointment, status: string) {
        this.clinicService.updateAppointment(this.tenantId!, item.id, { status }).subscribe({
            next: () => { this.messageService.add({ severity: 'success', summary: 'Updated', detail: `Status set to ${status}` }); this.load(); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status' })
        });
    }

    remove(item: Appointment) {
        this.confirmationService.confirm({
            message: `Delete appointment for ${item.patientName}?`, header: 'Confirm', icon: 'pi pi-exclamation-triangle',
            accept: () => { this.clinicService.deleteAppointment(this.tenantId!, item.id).subscribe({ next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted' }); this.load(); } }); }
        });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'Completed': return 'success';
            case 'Scheduled': return 'info';
            case 'Cancelled': return 'warn';
            case 'No-Show': return 'danger';
            default: return 'secondary';
        }
    }

    private formatDate(d: Date | string): string {
        if (typeof d === 'string') return d;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    onGlobalFilter(table: any, event: Event) { table.filterGlobal((event.target as HTMLInputElement).value, 'contains'); }
    clear(table: any) { table.clear(); if (this.filterInput) this.filterInput.nativeElement.value = ''; }
}
