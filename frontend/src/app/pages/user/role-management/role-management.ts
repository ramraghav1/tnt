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
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService, ConfirmationService } from 'primeng/api';

import { UserManagementService, Role, Permission, PermissionAssignment } from '../user-management.service';

interface PermissionWithCRUD extends Permission {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

@Component({
    selector: 'app-role-management',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        DialogModule, ConfirmDialogModule, TagModule, IconFieldModule, InputIconModule,
        ToolbarModule, FluidModule, CheckboxModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <span class="font-semibold text-xl">Role & Permission Management</span>
                </ng-template>
                <ng-template #end>
                    <button pButton label="Create New Role" icon="pi pi-plus" severity="success" (click)="openNewRole()"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="roles" [paginator]="true" [rows]="10" [loading]="loading"
                     [showGridlines]="true" [rowHover]="true" responsiveLayout="scroll"
                     [globalFilterFields]="['name', 'displayName', 'description']">
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center flex-wrap gap-2">
                        <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
                        <p-iconfield iconPosition="left">
                            <p-inputicon><i class="pi pi-search"></i></p-inputicon>
                            <input #filterInput pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search roles..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="displayName">Role Name <p-sortIcon field="displayName"></p-sortIcon></th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th style="min-width: 10rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-role>
                    <tr>
                        <td class="font-semibold">{{ role.displayName }}</td>
                        <td>{{ role.description || 'No description' }}</td>
                        <td><p-tag [value]="role.isSystemRole ? 'System' : 'Custom'" [severity]="role.isSystemRole ? 'secondary' : 'info'"></p-tag></td>
                        <td><p-tag [value]="role.isActive ? 'Active' : 'Inactive'" [severity]="role.isActive ? 'success' : 'danger'"></p-tag></td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-shield" class="p-button-rounded p-button-info p-button-sm" 
                                        pTooltip="Manage Permissions" (click)="openPermissions(role)"></button>
                                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-sm" 
                                        pTooltip="Edit Role" (click)="editRole(role)" [disabled]="role.isSystemRole"></button>
                                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" 
                                        pTooltip="Delete Role" (click)="deleteRole(role)" [disabled]="role.isSystemRole"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="5" class="text-center py-6"><i class="pi pi-shield text-4xl text-color-secondary"></i><br>No roles found.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Create/Edit Role Dialog -->
        <p-dialog [(visible)]="roleDialogVisible" [header]="editMode ? 'Edit Role' : 'Create Role'" [modal]="true" [style]="{ width: '600px' }">
            <p-fluid>
                <div class="flex flex-col gap-4 mt-2">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Role Name *</label>
                        <input pInputText [(ngModel)]="selectedRole.name" placeholder="e.g., inventory_clerk" [disabled]="editMode" />
                        <small class="text-sm text-gray-600">Lowercase with underscores (auto-formatted)</small>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Display Name *</label>
                        <input pInputText [(ngModel)]="selectedRole.displayName" placeholder="e.g., Inventory Clerk" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Description</label>
                        <input pInputText [(ngModel)]="selectedRole.description" placeholder="Brief description of the role" />
                    </div>
                    <div class="flex items-center gap-2" *ngIf="editMode">
                        <p-checkbox [(ngModel)]="selectedRole.isActive" [binary]="true" inputId="active"></p-checkbox>
                        <label for="active" class="font-semibold">Active</label>
                    </div>
                </div>
            </p-fluid>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="roleDialogVisible = false"></button>
                <button pButton [label]="editMode ? 'Update' : 'Create'" icon="pi pi-check" (click)="saveRole()" 
                        [disabled]="!selectedRole.displayName"></button>
            </ng-template>
        </p-dialog>

        <!-- Permission Assignment Dialog -->
        <p-dialog [(visible)]="permissionDialogVisible" [header]="'Manage Permissions - ' + selectedRole.displayName" [modal]="true" [style]="{ width: '800px' }" [maximizable]="true">
            <div class="mb-4">
                <p class="text-sm text-gray-600">Configure which permissions this role has and what CRUD operations are allowed.</p>
            </div>

            <div class="border rounded-md">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="text-left p-3 border-b font-semibold">Permission</th>
                            <th class="text-center p-3 border-b font-semibold">Create</th>
                            <th class="text-center p-3 border-b font-semibold">Read</th>
                            <th class="text-center p-3 border-b font-semibold">Update</th>
                            <th class="text-center p-3 border-b font-semibold">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let perm of permissionsWithCRUD" class="border-b hover:bg-gray-50">
                            <td class="p-3">
                                <div class="font-semibold">{{ perm.displayName }}</div>
                                <div class="text-sm text-gray-600">{{ perm.description }}</div>
                            </td>
                            <td class="text-center p-3">
                                <p-checkbox [(ngModel)]="perm.canCreate" [binary]="true"></p-checkbox>
                            </td>
                            <td class="text-center p-3">
                                <p-checkbox [(ngModel)]="perm.canRead" [binary]="true"></p-checkbox>
                            </td>
                            <td class="text-center p-3">
                                <p-checkbox [(ngModel)]="perm.canUpdate" [binary]="true"></p-checkbox>
                            </td>
                            <td class="text-center p-3">
                                <p-checkbox [(ngModel)]="perm.canDelete" [binary]="true"></p-checkbox>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <p class="text-sm text-blue-700">
                    <i class="pi pi-info-circle mr-2"></i>
                    <strong>Tip:</strong> Enable "Read" permission to allow viewing data. Other permissions (Create, Update, Delete) are optional.
                </p>
            </div>

            <ng-template pTemplate="footer">
                <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="permissionDialogVisible = false"></button>
                <button pButton label="Save Permissions" icon="pi pi-check" severity="success" (click)="savePermissions()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class RoleManagement implements OnInit {
    roles: Role[] = [];
    permissionsWithCRUD: PermissionWithCRUD[] = [];
    loading = false;
    roleDialogVisible = false;
    permissionDialogVisible = false;
    editMode = false;
    
    selectedRole: any = {};
    
    // TODO: Get these from authentication context
    currentTenantId = 1;
    currentProductId = 1;

    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(
        private userManagementService: UserManagementService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadRoles();
    }

    loadRoles() {
        this.loading = true;
        this.userManagementService.getRolesByTenantAndProduct(this.currentTenantId, this.currentProductId).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.roles = response.data;
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load roles', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles' });
                this.loading = false;
            }
        });
    }

    openNewRole() {
        this.editMode = false;
        this.selectedRole = {
            tenantId: this.currentTenantId,
            productId: this.currentProductId,
            name: '',
            displayName: '',
            description: '',
            isActive: true
        };
        this.roleDialogVisible = true;
    }

    editRole(role: Role) {
        this.editMode = true;
        this.selectedRole = { ...role };
        this.roleDialogVisible = true;
    }

    saveRole() {
        if (!this.selectedRole.displayName) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Display name is required' });
            return;
        }

        if (this.editMode) {
            this.userManagementService.updateRole(this.selectedRole.id, {
                displayName: this.selectedRole.displayName,
                description: this.selectedRole.description,
                isActive: this.selectedRole.isActive
            }).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role updated successfully' });
                        this.roleDialogVisible = false;
                        this.loadRoles();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                    }
                },
                error: (err) => {
                    console.error('Failed to update role', err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update role' });
                }
            });
        } else {
            this.userManagementService.createRole({
                tenantId: this.currentTenantId,
                productId: this.currentProductId,
                name: this.selectedRole.name || this.selectedRole.displayName,
                displayName: this.selectedRole.displayName,
                description: this.selectedRole.description
            }).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role created successfully' });
                        this.roleDialogVisible = false;
                        this.loadRoles();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                    }
                },
                error: (err) => {
                    console.error('Failed to create role', err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create role' });
                }
            });
        }
    }

    deleteRole(role: Role) {
        if (role.isSystemRole) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'System roles cannot be deleted' });
            return;
        }

        this.confirmationService.confirm({
            message: `Are you sure you want to delete the role "${role.displayName}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.userManagementService.deleteRole(role.id).subscribe({
                    next: (response) => {
                        if (response.success) {
                            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role deleted successfully' });
                            this.loadRoles();
                        } else {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                        }
                    },
                    error: (err) => {
                        console.error('Failed to delete role', err);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to delete role' });
                    }
                });
            }
        });
    }

    openPermissions(role: Role) {
        this.selectedRole = role;
        this.loadPermissionsForRole(role.id);
        this.permissionDialogVisible = true;
    }

    loadPermissionsForRole(roleId: number) {
        // Load all available permissions for the product
        this.userManagementService.getPermissionsByProduct(this.currentProductId).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    const allPermissions = response.data;
                    
                    // Load current role permissions
                    this.userManagementService.getRolePermissions(roleId).subscribe({
                        next: (rolePermResponse) => {
                            const rolePermissions = rolePermResponse.data || [];
                            
                            // Merge: Show all permissions with their current CRUD settings
                            this.permissionsWithCRUD = allPermissions.map(perm => {
                                const existing = rolePermissions.find(rp => rp.id === perm.id);
                                return {
                                    ...perm,
                                    canCreate: existing?.canCreate || false,
                                    canRead: existing?.canRead || false,
                                    canUpdate: existing?.canUpdate || false,
                                    canDelete: existing?.canDelete || false
                                };
                            });
                            
                            this.cdr.detectChanges();
                        },
                        error: (err) => {
                            console.error('Failed to load role permissions', err);
                        }
                    });
                }
            },
            error: (err) => {
                console.error('Failed to load permissions', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load permissions' });
            }
        });
    }

    savePermissions() {
        // Filter to only permissions that have at least one CRUD flag enabled
        const assignments: PermissionAssignment[] = this.permissionsWithCRUD
            .filter(p => p.canCreate || p.canRead || p.canUpdate || p.canDelete)
            .map(p => ({
                permissionId: p.id,
                canCreate: p.canCreate,
                canRead: p.canRead,
                canUpdate: p.canUpdate,
                canDelete: p.canDelete
            }));

        this.userManagementService.assignPermissionsToRole(this.selectedRole.id, assignments).subscribe({
            next: (response) => {
                if (response.success) {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Permissions saved successfully' });
                    this.permissionDialogVisible = false;
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                }
            },
            error: (err) => {
                console.error('Failed to save permissions', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to save permissions' });
            }
        });
    }

    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: any) {
        table.clear();
        if (this.filterInput) {
            this.filterInput.nativeElement.value = '';
        }
    }
}
