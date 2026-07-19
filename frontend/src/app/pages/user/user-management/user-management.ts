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
import { PanelModule } from 'primeng/panel';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { UserManagementService, CreateUserRequest, UserListItem, Role } from '../user-management.service';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        DialogModule, ConfirmDialogModule, TagModule, IconFieldModule, InputIconModule,
        ToolbarModule, FluidModule, PanelModule, MultiSelectModule, SelectModule, TooltipModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <span class="font-semibold text-xl">User Management</span>
                </ng-template>
                <ng-template #end>
                    <button pButton label="Create New User" icon="pi pi-plus" severity="success" (click)="openNew()"></button>
                    <button pButton label="Create Multiple Users" icon="pi pi-users" severity="info" class="ml-2" (click)="openBulkCreate()"></button>
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="users" [paginator]="true" [rows]="10" [loading]="loading"
                     [showGridlines]="true" [rowHover]="true" responsiveLayout="scroll"
                     [globalFilterFields]="['firstName', 'lastName', 'emailAddress', 'username', 'roles']">
                <ng-template pTemplate="caption">
                    <div class="flex justify-between items-center flex-wrap gap-2">
                        <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
                        <p-iconfield iconPosition="left">
                            <p-inputicon><i class="pi pi-search"></i></p-inputicon>
                            <input #filterInput pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search users..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="firstName">Name <p-sortIcon field="firstName"></p-sortIcon></th>
                        <th pSortableColumn="emailAddress">Email <p-sortIcon field="emailAddress"></p-sortIcon></th>
                        <th>Phone</th>
                        <th pSortableColumn="username">Username <p-sortIcon field="username"></p-sortIcon></th>
                        <th>Roles</th>
                        <th>Status</th>
                        <th style="min-width: 10rem">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-user>
                    <tr>
                        <td class="font-semibold">{{ user.firstName }} {{ user.middleName }} {{ user.lastName }}</td>
                        <td>{{ user.emailAddress }}</td>
                        <td>{{ user.phoneNumber }}</td>
                        <td><code class="text-sm">{{ user.username }}</code></td>
                        <td><p-tag [value]="user.roles" severity="info"></p-tag></td>
                        <td><p-tag [value]="user.isActive ? 'Active' : 'Inactive'" [severity]="user.isActive ? 'success' : 'danger'"></p-tag></td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-refresh" class="p-button-rounded p-button-warning p-button-sm" 
                                        pTooltip="Reset Password" (click)="resetUserPassword(user)"></button>
                                <button pButton [icon]="user.isActive ? 'pi pi-ban' : 'pi pi-check'" 
                                        [class]="user.isActive ? 'p-button-rounded p-button-secondary p-button-sm' : 'p-button-rounded p-button-success p-button-sm'"
                                        [pTooltip]="user.isActive ? 'Deactivate' : 'Reactivate'"
                                        (click)="toggleUserStatus(user)"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7" class="text-center py-6"><i class="pi pi-users text-4xl text-color-secondary"></i><br>No users found.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Single User Create Dialog -->
        <p-dialog [(visible)]="singleDialogVisible" header="Create New User" [modal]="true" [style]="{ width: '700px' }">
            <p-fluid>
                <div class="flex flex-col gap-4 mt-2">
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">First Name *</label>
                            <input pInputText [(ngModel)]="newUser.firstName" />
                        </div>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">Middle Name</label>
                            <input pInputText [(ngModel)]="newUser.middleName" />
                        </div>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">Last Name *</label>
                            <input pInputText [(ngModel)]="newUser.lastName" />
                        </div>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">Email Address *</label>
                            <input pInputText type="email" [(ngModel)]="newUser.emailAddress" />
                        </div>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">Phone Number *</label>
                            <input pInputText [(ngModel)]="newUser.phoneNumber" />
                        </div>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">Gender</label>
                            <p-select [(ngModel)]="newUser.gender" [options]="genderOptions" placeholder="Select Gender" optionLabel="label" optionValue="value"></p-select>
                        </div>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-semibold">Roles *</label>
                            <p-multiselect [(ngModel)]="newUser.roleIds" [options]="availableRoles" 
                                           optionLabel="displayName" optionValue="id" placeholder="Select Roles" 
                                           display="chip"></p-multiselect>
                        </div>
                    </div>
                    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mt-2">
                        <p class="text-sm text-blue-700">
                            <i class="pi pi-info-circle mr-2"></i>
                            A temporary password will be auto-generated and sent to the user's email address along with a password reset link.
                        </p>
                    </div>
                </div>
            </p-fluid>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="singleDialogVisible = false"></button>
                <button pButton label="Create User" icon="pi pi-check" (click)="createSingleUser()" 
                        [disabled]="!isUserFormValid(newUser)"></button>
            </ng-template>
        </p-dialog>

        <!-- Bulk Create Dialog with Panels -->
        <p-dialog [(visible)]="bulkDialogVisible" header="Create Multiple Users" [modal]="true" [style]="{ width: '900px' }" [maximizable]="true">
            <div class="mb-4">
                <button pButton label="Add Another User" icon="pi pi-plus" class="p-button-outlined" (click)="addUserToList()"></button>
            </div>
            
            <div class="flex flex-col gap-4">
                <p-panel *ngFor="let user of bulkUsers; let i = index" [header]="'User ' + (i + 1) + (user.firstName ? ': ' + user.firstName + ' ' + user.lastName : '')" [toggleable]="true" [collapsed]="false">
                    <ng-template pTemplate="icons">
                        <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm p-button-text" 
                                pTooltip="Remove this user" (click)="removeUserFromList(i)" *ngIf="bulkUsers.length > 1"></button>
                    </ng-template>
                    <p-fluid>
                        <div class="flex flex-col gap-4">
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex flex-col gap-2 w-full">
                                    <label class="font-semibold">First Name *</label>
                                    <input pInputText [(ngModel)]="user.firstName" />
                                </div>
                                <div class="flex flex-col gap-2 w-full">
                                    <label class="font-semibold">Middle Name</label>
                                    <input pInputText [(ngModel)]="user.middleName" />
                                </div>
                                <div class="flex flex-col gap-2 w-full">
                                    <label class="font-semibold">Last Name *</label>
                                    <input pInputText [(ngModel)]="user.lastName" />
                                </div>
                            </div>
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex flex-col gap-2 w-full">
                                    <label class="font-semibold">Email Address *</label>
                                    <input pInputText type="email" [(ngModel)]="user.emailAddress" />
                                </div>
                                <div class="flex flex-col gap-2 w-full">
                                    <label class="font-semibold">Phone Number *</label>
                                    <input pInputText [(ngModel)]="user.phoneNumber" />
                                </div>
                            </div>
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex flex-col gap-2 w-full">
                                    <label class="font-semibold">Gender</label>
                                    <p-select [(ngModel)]="user.gender" [options]="genderOptions" placeholder="Select Gender" optionLabel="label" optionValue="value"></p-select>
                                </div>
                                <div class="flex flex-col gap-2 w-full">
                                    <label class="font-semibold">Roles *</label>
                                    <p-multiselect [(ngModel)]="user.roleIds" [options]="availableRoles" 
                                                   optionLabel="displayName" optionValue="id" placeholder="Select Roles" 
                                                   display="chip"></p-multiselect>
                                </div>
                            </div>
                        </div>
                    </p-fluid>
                </p-panel>
            </div>

            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <p class="text-sm text-blue-700">
                    <i class="pi pi-info-circle mr-2"></i>
                    All users will receive auto-generated passwords via email.
                </p>
            </div>

            <ng-template pTemplate="footer">
                <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="bulkDialogVisible = false"></button>
                <button pButton label="Create All Users" icon="pi pi-check" severity="success" (click)="createBulkUsers()" 
                        [disabled]="!areAllUsersValid()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class UserManagement implements OnInit {
    users: UserListItem[] = [];
    loading = false;
    singleDialogVisible = false;
    bulkDialogVisible = false;
    
    newUser: CreateUserRequest = this.getEmptyUser();
    bulkUsers: CreateUserRequest[] = [this.getEmptyUser()];
    
    availableRoles: Role[] = [];
    genderOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' }
    ];
    
    get currentTenantId(): number { return Number(localStorage.getItem('tenantId') ?? 0); }
    get currentOrgId(): number {
        const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
        return Number(info?.organizationId ?? 0);
    }
    get currentBranchId(): number {
        const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
        return Number(info?.branchId ?? 0);
    }
    get currentProductId(): number {
        const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
        return Number(info?.productId ?? 1);
    }

    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(
        private userManagementService: UserManagementService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadUsers();
        this.loadRoles();
    }

    loadUsers() {
        this.loading = true;
        this.userManagementService.getUsersByTenant(this.currentTenantId).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.users = response.data;
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load users', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
                this.loading = false;
            }
        });
    }

    loadRoles() {
        const tenantId = this.currentTenantId;
        const productId = this.currentProductId;
        this.userManagementService.getRolesByTenantAndProduct(tenantId, productId).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.availableRoles = response.data.filter(r => r.isActive);
                } else {
                    this.availableRoles = [];
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load roles', err);
                this.availableRoles = [];
                this.cdr.detectChanges();
            }
        });
    }

    getEmptyUser(): CreateUserRequest {
        return {
            firstName: '',
            middleName: '',
            lastName: '',
            gender: '',
            emailAddress: '',
            phoneNumber: '',
            tenantId: this.currentTenantId,
            organizationId: this.currentOrgId,
            branchId: this.currentBranchId,
            roleIds: []
        };
    }

    openNew() {
        this.newUser = this.getEmptyUser();
        this.singleDialogVisible = true;
    }

    openBulkCreate() {
        this.bulkUsers = [this.getEmptyUser()];
        this.bulkDialogVisible = true;
    }

    addUserToList() {
        this.bulkUsers.push(this.getEmptyUser());
    }

    removeUserFromList(index: number) {
        if (this.bulkUsers.length > 1) {
            this.bulkUsers.splice(index, 1);
        }
    }

    isUserFormValid(user: CreateUserRequest): boolean {
        return !!(user.firstName && user.lastName && user.emailAddress && user.phoneNumber && user.roleIds.length > 0);
    }

    areAllUsersValid(): boolean {
        return this.bulkUsers.every(user => this.isUserFormValid(user));
    }

    createSingleUser() {
        if (!this.isUserFormValid(this.newUser)) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please fill all required fields' });
            return;
        }

        this.userManagementService.createUser(this.newUser).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.messageService.add({ 
                        severity: 'success', 
                        summary: 'Success', 
                        detail: `User created with username: ${response.data.username}. Email sent: ${response.data.emailSent ? 'Yes' : 'No'}` 
                    });
                    this.singleDialogVisible = false;
                    this.loadUsers();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to create user' });
                }
            },
            error: (err) => {
                console.error('Failed to create user', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create user' });
            }
        });
    }

    createBulkUsers() {
        if (!this.areAllUsersValid()) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please fill all required fields for all users' });
            return;
        }

        this.userManagementService.createBulkUsers(this.bulkUsers).subscribe({
            next: (response) => {
                if (response.success) {
                    const successCount = response.data?.length || 0;
                    const errorCount = response.errors?.length || 0;
                    const total = this.bulkUsers.length;
                    
                    if (errorCount > 0) {
                        this.messageService.add({ 
                            severity: 'warn', 
                            summary: 'Partial Success', 
                            detail: `Created ${successCount} out of ${total} users. ${errorCount} failed.`,
                            life: 5000
                        });
                    } else {
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: 'Success', 
                            detail: `Successfully created ${successCount} users with welcome emails sent.` 
                        });
                    }
                    
                    this.bulkDialogVisible = false;
                    this.loadUsers();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to create users' });
                }
            },
            error: (err) => {
                console.error('Failed to create users', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create users' });
            }
        });
    }

    toggleUserStatus(user: UserListItem) {
        const action = user.isActive ? 'deactivate' : 'reactivate';
        
        this.confirmationService.confirm({
            message: `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const operation = user.isActive 
                    ? this.userManagementService.deactivateUser(user.userId)
                    : this.userManagementService.reactivateUser(user.userId);
                
                operation.subscribe({
                    next: (response) => {
                        if (response.success) {
                            this.messageService.add({ 
                                severity: 'success', 
                                summary: 'Success', 
                                detail: `User ${action}d successfully` 
                            });
                            this.loadUsers();
                        } else {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                        }
                    },
                    error: (err) => {
                        console.error(`Failed to ${action} user`, err);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to ${action} user` });
                    }
                });
            }
        });
    }

    resetUserPassword(user: UserListItem) {
        this.confirmationService.confirm({
            message: `Send password reset email to ${user.emailAddress}?`,
            header: 'Reset Password',
            icon: 'pi pi-question-circle',
            accept: () => {
                this.userManagementService.requestPasswordReset({ email: user.emailAddress }).subscribe({
                    next: (response) => {
                        if (response.success) {
                            this.messageService.add({ 
                                severity: 'success', 
                                summary: 'Success', 
                                detail: 'Password reset email sent successfully' 
                            });
                        } else {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                        }
                    },
                    error: (err) => {
                        console.error('Failed to send reset email', err);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send reset email' });
                    }
                });
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
