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
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';

import { RemittanceService, Branch, CreateBranchRequest, UpdateBranchRequest } from '../remittance.service';

@Component({
    selector: 'app-branch-list',
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
        InputNumberModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './branch-list.html',
    styleUrls: ['./branch-list.scss']
})
export class BranchList implements OnInit {
    branches: Branch[] = [];
    agentId!: number;
    agentName = '';
    loading = false;
    dialogVisible = false;
    detailDialogVisible = false;
    editMode = false;
    selectedItem: any = {};
    detailItem: Branch | null = null;

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
        this.agentId = +this.route.snapshot.params['agentId'];
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.remittanceService.getBranchesByAgent(this.agentId).subscribe({
            next: (data) => {
                this.branches = data;
                if (data.length > 0) this.agentName = data[0].agentName;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load branches' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
        // Also load agent name if no branches
        if (!this.agentName) {
            this.remittanceService.getAgent(this.agentId).subscribe({
                next: (a) => { this.agentName = a.name; this.cdr.detectChanges(); }
            });
        }
    }

    openNew() {
        this.selectedItem = {
            agentId: this.agentId, branchName: '', branchCode: '', address: '',
            state: '', district: '', locallevel: '', wardNumber: null, zipcode: '',
            contactPerson: '', contactEmail: '', contactPhone: '', isActive: true
        };
        this.editMode = false;
        this.dialogVisible = true;
    }

    editItem(item: Branch) {
        this.selectedItem = { ...item };
        this.editMode = true;
        this.dialogVisible = true;
    }

    viewDetail(item: Branch) {
        this.detailItem = item;
        this.detailDialogVisible = true;
    }

    viewUsers(item: Branch) {
        this.router.navigate(['/remittance/branch-users', item.id]);
    }

    saveItem() {
        if (this.editMode) {
            const req: UpdateBranchRequest = {
                branchName: this.selectedItem.branchName,
                branchCode: this.selectedItem.branchCode,
                address: this.selectedItem.address,
                state: this.selectedItem.state,
                district: this.selectedItem.district,
                locallevel: this.selectedItem.locallevel,
                wardNumber: this.selectedItem.wardNumber,
                zipcode: this.selectedItem.zipcode,
                contactPerson: this.selectedItem.contactPerson,
                contactEmail: this.selectedItem.contactEmail,
                contactPhone: this.selectedItem.contactPhone,
                isActive: this.selectedItem.isActive
            };
            this.remittanceService.updateBranch(this.selectedItem.id, req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Branch updated' });
                    this.dialogVisible = false;
                    this.loadData();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' }); this.cdr.detectChanges(); }
            });
        } else {
            const req: CreateBranchRequest = {
                agentId: this.agentId,
                branchName: this.selectedItem.branchName,
                branchCode: this.selectedItem.branchCode,
                address: this.selectedItem.address,
                state: this.selectedItem.state,
                district: this.selectedItem.district,
                locallevel: this.selectedItem.locallevel,
                wardNumber: this.selectedItem.wardNumber,
                zipcode: this.selectedItem.zipcode,
                contactPerson: this.selectedItem.contactPerson,
                contactEmail: this.selectedItem.contactEmail,
                contactPhone: this.selectedItem.contactPhone
            };
            this.remittanceService.createBranch(req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Branch created' });
                    this.dialogVisible = false;
                    this.loadData();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' }); this.cdr.detectChanges(); }
            });
        }
    }

    deleteItem(item: Branch) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete branch "${item.branchName}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.remittanceService.deleteBranch(item.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Branch deleted' });
                        this.loadData();
                        this.cdr.detectChanges();
                    },
                    error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' }); this.cdr.detectChanges(); }
                });
            }
        });
    }

    goBackToAgents() {
        this.router.navigate(['/remittance/agents']);
    }

    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: any) {
        table.clear();
        if (this.filterInput) this.filterInput.nativeElement.value = '';
    }
}
