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
import { MessageService, ConfirmationService } from 'primeng/api';

import { ClinicService, Tenant } from '../clinic.service';

@Component({
    selector: 'app-tenant-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        DialogModule, ToggleSwitchModule, ConfirmDialogModule, TagModule, IconFieldModule,
        InputIconModule, ToolbarModule, FluidModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <span class="font-semibold text-xl">Tenants (Clinics)</span>
                </ng-template>
                <ng-template #end>
                    <button pButton label="New Tenant" icon="pi pi-plus" severity="success" (click)="openNew()"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="tenants" [paginator]="true" [rows]="10" [loading]="loading"
                     [showGridlines]="true" [rowHover]="true" responsiveLayout="scroll"
                     [globalFilterFields]="['name', 'slug', 'email', 'phone', 'address']">
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center flex-wrap gap-2">
                        <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
                        <p-iconfield iconPosition="left">
                            <p-inputicon><i class="pi pi-search"></i></p-inputicon>
                            <input #filterInput pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search tenants..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name">Name <p-sortIcon field="name"></p-sortIcon></th>
                        <th pSortableColumn="slug">Slug <p-sortIcon field="slug"></p-sortIcon></th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Timezone</th>
                        <th>Status</th>
                        <th style="min-width: 8rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-tenant>
                    <tr>
                        <td class="font-semibold">{{ tenant.name }}</td>
                        <td>{{ tenant.slug }}</td>
                        <td>{{ tenant.email }}</td>
                        <td>{{ tenant.phone }}</td>
                        <td>{{ tenant.timezone }}</td>
                        <td><p-tag [value]="tenant.isActive ? 'Active' : 'Inactive'" [severity]="tenant.isActive ? 'success' : 'danger'"></p-tag></td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-sm" (click)="editTenant(tenant)"></button>
                                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" (click)="deleteTenant(tenant)"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7" class="text-center py-6"><i class="pi pi-building text-4xl text-color-secondary"></i><br>No tenants found.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Tenant' : 'New Tenant'" [modal]="true" [style]="{ width: '550px' }" [closable]="true">
            <p-fluid>
                <div class="flex flex-col gap-4 mt-2">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Name *</label>
                        <input pInputText [(ngModel)]="selected.name" placeholder="Clinic name" />
                    </div>
                    <div class="flex flex-col gap-2" *ngIf="!editMode">
                        <label class="font-semibold">Slug *</label>
                        <input pInputText [(ngModel)]="selected.slug" placeholder="unique-slug" />
                    </div>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">Email</label>
                            <input pInputText [(ngModel)]="selected.email" placeholder="admin@clinic.com" />
                        </div>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">Phone</label>
                            <input pInputText [(ngModel)]="selected.phone" placeholder="+977-1-..." />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Address</label>
                        <input pInputText [(ngModel)]="selected.address" placeholder="Address" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Timezone</label>
                        <input pInputText [(ngModel)]="selected.timezone" placeholder="Asia/Kathmandu" />
                    </div>
                    <div class="flex items-center gap-2" *ngIf="editMode">
                        <p-toggleswitch [(ngModel)]="selected.isActive"></p-toggleswitch>
                        <label class="font-semibold">Active</label>
                    </div>
                </div>
            </p-fluid>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="dialogVisible = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="save()" [disabled]="!selected.name || !selected.slug"></button>
            </ng-template>
        </p-dialog>
    `
})
export class TenantList implements OnInit {
    tenants: Tenant[] = [];
    loading = false;
    dialogVisible = false;
    editMode = false;
    selected: any = {};

    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(private clinicService: ClinicService, private messageService: MessageService, private confirmationService: ConfirmationService, private cdr: ChangeDetectorRef) {}

    ngOnInit() { this.load(); }

    load() {
        this.loading = true;
        this.clinicService.getTenants().subscribe({
            next: (data) => { this.tenants = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tenants' }); this.loading = false; this.cdr.detectChanges(); }
        });
    }

    openNew() {
        this.selected = { name: '', slug: '', email: '', phone: '', address: '', timezone: 'Asia/Kathmandu', isActive: true };
        this.editMode = false;
        this.dialogVisible = true;
    }

    editTenant(t: Tenant) {
        this.selected = { ...t };
        this.editMode = true;
        this.dialogVisible = true;
    }

    save() {
        if (this.editMode) {
            this.clinicService.updateTenant(this.selected.id, this.selected).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tenant updated' }); this.dialogVisible = false; this.load(); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update tenant' })
            });
        } else {
            this.clinicService.createTenant(this.selected).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tenant created' }); this.dialogVisible = false; this.load(); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create tenant' })
            });
        }
    }

    deleteTenant(t: Tenant) {
        this.confirmationService.confirm({
            message: `Delete "${t.name}"?`, header: 'Confirm', icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.clinicService.deleteTenant(t.id).subscribe({
                    next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Tenant deleted' }); this.load(); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' })
                });
            }
        });
    }

    onGlobalFilter(table: any, event: Event) { table.filterGlobal((event.target as HTMLInputElement).value, 'contains'); }
    clear(table: any) { table.clear(); if (this.filterInput) this.filterInput.nativeElement.value = ''; }
}
