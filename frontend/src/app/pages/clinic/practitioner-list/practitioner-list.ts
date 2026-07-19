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
import { MessageService, ConfirmationService } from 'primeng/api';

import { TenantSelector } from '../tenant-selector/tenant-selector';
import { ClinicService, Practitioner } from '../clinic.service';

@Component({
    selector: 'app-practitioner-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        DialogModule, ToggleSwitchModule, ConfirmDialogModule, TagModule, IconFieldModule,
        InputIconModule, ToolbarModule, FluidModule, TextareaModule, TenantSelector
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <span class="font-semibold text-xl mr-4">Practitioners</span>
                    <app-tenant-selector (tenantChanged)="onTenantChange($event)"></app-tenant-selector>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Practitioner" icon="pi pi-plus" severity="success" (click)="openNew()" [disabled]="!tenantId"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="items" [paginator]="true" [rows]="10" [loading]="loading"
                     [showGridlines]="true" [rowHover]="true" responsiveLayout="scroll"
                     [globalFilterFields]="['firstName', 'lastName', 'email', 'specialization', 'role']">
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center flex-wrap gap-2">
                        <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
                        <p-iconfield iconPosition="left">
                            <p-inputicon><i class="pi pi-search"></i></p-inputicon>
                            <input #filterInput pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="firstName">Name <p-sortIcon field="firstName"></p-sortIcon></th>
                        <th>Email</th>
                        <th pSortableColumn="specialization">Specialization <p-sortIcon field="specialization"></p-sortIcon></th>
                        <th pSortableColumn="role">Role <p-sortIcon field="role"></p-sortIcon></th>
                        <th>Status</th>
                        <th style="min-width: 8rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-item>
                    <tr>
                        <td class="font-semibold">{{ item.firstName }} {{ item.lastName }}</td>
                        <td>{{ item.email }}</td>
                        <td>{{ item.specialization }}</td>
                        <td><p-tag [value]="item.role" [severity]="item.role === 'Admin' ? 'warn' : 'info'"></p-tag></td>
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
                    <tr><td colspan="6" class="text-center py-6"><i class="pi pi-users text-4xl text-color-secondary"></i><br>No practitioners found.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Practitioner' : 'New Practitioner'" [modal]="true" [style]="{ width: '600px' }">
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
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Specialization</label><input pInputText [(ngModel)]="selected.specialization" /></div>
                        <div class="flex flex-col gap-2 w-full"><label class="font-semibold">Role</label><input pInputText [(ngModel)]="selected.role" placeholder="Admin / Practitioner / Receptionist" /></div>
                    </div>
                    <div class="flex flex-col gap-2"><label class="font-semibold">Bio</label><textarea pTextarea [(ngModel)]="selected.bio" rows="3"></textarea></div>
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
export class PractitionerList implements OnInit {
    items: Practitioner[] = [];
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
        this.clinicService.getPractitioners(this.tenantId).subscribe({
            next: (data) => { this.items = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load' }); this.loading = false; this.cdr.detectChanges(); }
        });
    }

    openNew() { this.selected = { firstName: '', lastName: '', email: '', phone: '', specialization: '', role: 'Practitioner', bio: '' }; this.editMode = false; this.dialogVisible = true; }

    edit(item: Practitioner) { this.selected = { ...item }; this.editMode = true; this.dialogVisible = true; }

    save() {
        if (this.editMode) {
            this.clinicService.updatePractitioner(this.tenantId!, this.selected.id, this.selected).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Updated' }); this.dialogVisible = false; this.load(); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
            });
        } else {
            this.clinicService.createPractitioner(this.tenantId!, this.selected).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Created' }); this.dialogVisible = false; this.load(); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' })
            });
        }
    }

    remove(item: Practitioner) {
        this.confirmationService.confirm({
            message: `Delete "${item.firstName} ${item.lastName}"?`, header: 'Confirm', icon: 'pi pi-exclamation-triangle',
            accept: () => { this.clinicService.deletePractitioner(this.tenantId!, item.id).subscribe({ next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted' }); this.load(); } }); }
        });
    }

    onGlobalFilter(table: any, event: Event) { table.filterGlobal((event.target as HTMLInputElement).value, 'contains'); }
    clear(table: any) { table.clear(); if (this.filterInput) this.filterInput.nativeElement.value = ''; }
}
