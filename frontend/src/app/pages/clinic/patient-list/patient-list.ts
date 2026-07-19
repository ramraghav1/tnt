import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FluidModule } from 'primeng/fluid';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TenantSelector } from '../tenant-selector/tenant-selector';
import { ClinicService, Patient } from '../clinic.service';

@Component({
    selector: 'app-patient-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        DialogModule, ToggleSwitchModule, ConfirmDialogModule, TagModule, IconFieldModule,
        InputIconModule, ToolbarModule, FluidModule, TextareaModule, DatePickerModule, TenantSelector
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <span class="font-semibold text-xl mr-4">Patients</span>
                    <app-tenant-selector (tenantChanged)="onTenantChange($event)"></app-tenant-selector>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Patient" icon="pi pi-plus" severity="success" (click)="openNew()" [disabled]="!tenantId"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="items" [paginator]="true" [rows]="10" [loading]="loading"
                     [showGridlines]="true" [rowHover]="true" responsiveLayout="scroll"
                     [globalFilterFields]="['firstName', 'lastName', 'email', 'phone', 'gender']">
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center flex-wrap gap-2">
                        <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
                        <p-iconfield iconPosition="left">
                            <p-inputicon><i class="pi pi-search"></i></p-inputicon>
                            <input #filterInput pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search patients..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="firstName">Name <p-sortIcon field="firstName"></p-sortIcon></th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Gender</th>
                        <th>DOB</th>
                        <th>Status</th>
                        <th style="min-width: 8rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-item>
                    <tr>
                        <td class="font-semibold">{{ item.firstName }} {{ item.lastName }}</td>
                        <td>{{ item.phone }}</td>
                        <td>{{ item.email }}</td>
                        <td>{{ item.gender }}</td>
                        <td>{{ item.dateOfBirth | date:'mediumDate' }}</td>
                        <td><p-tag [value]="item.isActive ? 'Active' : 'Inactive'" [severity]="item.isActive ? 'success' : 'danger'"></p-tag></td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-sm" (click)="edit(item)"></button>
                                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" (click)="remove(item)"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7" class="text-center py-6"><i class="pi pi-user text-4xl text-color-secondary"></i><br>No patients found.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Patient' : 'New Patient'" [modal]="true" [style]="{ width: '700px' }">
            <p-fluid>
                <div class="flex flex-col gap-4 mt-2">
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">First Name *</label><input pInputText [(ngModel)]="selected.firstName" /></div>
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Last Name *</label><input pInputText [(ngModel)]="selected.lastName" /></div>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Email</label><input pInputText [(ngModel)]="selected.email" /></div>
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Phone</label><input pInputText [(ngModel)]="selected.phone" /></div>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Date of Birth</label><p-datepicker [(ngModel)]="selected.dateOfBirth" dateFormat="yy-mm-dd" [showIcon]="true"></p-datepicker></div>
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Gender</label><input pInputText [(ngModel)]="selected.gender" placeholder="Male / Female / Other" /></div>
                    </div>
                    <div class="flex flex-col gap-2"><label class="font-semibold">Address</label><input pInputText [(ngModel)]="selected.address" /></div>
                    <div class="flex flex-col gap-2"><label class="font-semibold">Medical Notes</label><textarea pTextarea [(ngModel)]="selected.medicalNotes" rows="2"></textarea></div>
                    <div class="flex flex-col gap-2"><label class="font-semibold">Allergies</label><input pInputText [(ngModel)]="selected.allergies" /></div>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Emergency Contact</label><input pInputText [(ngModel)]="selected.emergencyContactName" /></div>
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Emergency Phone</label><input pInputText [(ngModel)]="selected.emergencyContactPhone" /></div>
                    </div>
                    <div class="flex items-center gap-2" *ngIf="editMode">
                        <p-toggleswitch [(ngModel)]="selected.isActive"></p-toggleswitch>
                        <label class="font-semibold">Active</label>
                    </div>
                </div>
            </p-fluid>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="dialogVisible = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="save()" [disabled]="!selected.firstName || !selected.lastName"></button>
            </ng-template>
        </p-dialog>
    `
})
export class PatientList implements OnInit {
    items: Patient[] = [];
    tenantId: number | null = null;
    loading = false;
    dialogVisible = false;
    editMode = false;
    selected: any = {};

    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(private clinicService: ClinicService, private messageService: MessageService, private confirmationService: ConfirmationService, private cdr: ChangeDetectorRef) {}

    ngOnInit() {}

    onTenantChange(tenantId: number) { this.tenantId = tenantId; this.load(); }

    load() {
        if (!this.tenantId) return;
        this.loading = true;
        this.clinicService.getPatients(this.tenantId).subscribe({
            next: (data) => { this.items = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load' }); this.loading = false; this.cdr.detectChanges(); }
        });
    }

    openNew() { this.selected = { firstName: '', lastName: '', email: '', phone: '', gender: '', address: '' }; this.editMode = false; this.dialogVisible = true; }

    edit(item: Patient) { this.selected = { ...item }; this.editMode = true; this.dialogVisible = true; }

    save() {
        if (this.editMode) {
            this.clinicService.updatePatient(this.tenantId!, this.selected.id, this.selected).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Updated' }); this.dialogVisible = false; this.load(); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
            });
        } else {
            this.clinicService.createPatient(this.tenantId!, this.selected).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Created' }); this.dialogVisible = false; this.load(); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' })
            });
        }
    }

    remove(item: Patient) {
        this.confirmationService.confirm({
            message: `Delete "${item.firstName} ${item.lastName}"?`, header: 'Confirm', icon: 'pi pi-exclamation-triangle',
            accept: () => { this.clinicService.deletePatient(this.tenantId!, item.id).subscribe({ next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted' }); this.load(); } }); }
        });
    }

    onGlobalFilter(table: any, event: Event) { table.filterGlobal((event.target as HTMLInputElement).value, 'contains'); }
    clear(table: any) { table.clear(); if (this.filterInput) this.filterInput.nativeElement.value = ''; }
}
