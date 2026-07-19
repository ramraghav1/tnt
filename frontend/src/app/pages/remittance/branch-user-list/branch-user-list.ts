import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RemittanceService, BranchUser, CreateBranchUserRequest, UpdateBranchUserRequest } from '../remittance.service';

@Component({
    selector: 'app-branch-user-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        DialogModule,
        ToggleSwitchModule,
        ConfirmDialogModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        ToolbarModule,
        TooltipModule,
        FluidModule,
        SelectModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './branch-user-list.html',
    styleUrls: ['./branch-user-list.scss']
})
export class BranchUserList implements OnInit {
    users: BranchUser[] = [];
    branchId!: number;
    branchName = '';
    loading = false;
    dialogVisible = false;
    detailDialogVisible = false;
    editMode = false;
    selectedItem: any = {};
    detailItem: BranchUser | null = null;

    roles = [
        { label: 'Admin', value: 'Admin' },
        { label: 'Operator', value: 'Operator' },
        { label: 'Viewer', value: 'Viewer' },
        { label: 'Manager', value: 'Manager' }
    ];

    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.branchId = +this.route.snapshot.params['branchId'];
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.remittanceService.getBranchUsers(this.branchId).subscribe({
            next: (data) => {
                this.users = data;
                if (data.length > 0) this.branchName = data[0].branchName;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
        // Load branch name if no users exist
        if (!this.branchName) {
            this.remittanceService.getBranch(this.branchId).subscribe({
                next: (b) => { this.branchName = b.branchName; this.cdr.detectChanges(); }
            });
        }
    }

    openNew() {
        this.selectedItem = {
            branchId: this.branchId, fullName: '', email: '', phone: '',
            role: '', username: '', isActive: true
        };
        this.editMode = false;
        this.dialogVisible = true;
    }

    editItem(item: BranchUser) {
        this.selectedItem = { ...item };
        this.editMode = true;
        this.dialogVisible = true;
    }

    viewDetail(item: BranchUser) {
        this.detailItem = item;
        this.detailDialogVisible = true;
    }

    saveItem() {
        if (this.editMode) {
            const req: UpdateBranchUserRequest = {
                fullName: this.selectedItem.fullName,
                email: this.selectedItem.email,
                phone: this.selectedItem.phone,
                role: this.selectedItem.role,
                username: this.selectedItem.username,
                isActive: this.selectedItem.isActive
            };
            this.remittanceService.updateBranchUser(this.selectedItem.id, req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated' });
                    this.dialogVisible = false;
                    this.loadData();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' }); this.cdr.detectChanges(); }
            });
        } else {
            const req: CreateBranchUserRequest = {
                branchId: this.branchId,
                fullName: this.selectedItem.fullName,
                email: this.selectedItem.email,
                phone: this.selectedItem.phone,
                role: this.selectedItem.role,
                username: this.selectedItem.username
            };
            this.remittanceService.createBranchUser(req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created' });
                    this.dialogVisible = false;
                    this.loadData();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' }); this.cdr.detectChanges(); }
            });
        }
    }

    deleteItem(item: BranchUser) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete user "${item.fullName}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.remittanceService.deleteBranchUser(item.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'User deleted' });
                        this.loadData();
                        this.cdr.detectChanges();
                    },
                    error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' }); this.cdr.detectChanges(); }
                });
            }
        });
    }

    goBackToBranches() {
        // Navigate back — we need to know the agentId. Get it from the branch.
        if (this.users.length > 0) {
            // We don't have agentId in BranchUser, fetch branch to get it
            this.remittanceService.getBranch(this.branchId).subscribe({
                next: (b) => { this.router.navigate(['/remittance/branches', b.agentId]); this.cdr.detectChanges(); }
            });
        } else {
            this.remittanceService.getBranch(this.branchId).subscribe({
                next: (b) => { this.router.navigate(['/remittance/branches', b.agentId]); this.cdr.detectChanges(); }
            });
        }
    }

    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: any) {
        table.clear();
        if (this.filterInput) this.filterInput.nativeElement.value = '';
    }
}
