import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RemittanceService, Agent, Country, CreateAgentRequest, UpdateAgentRequest, CreateAgentAccountRequest, Configuration } from '../remittance.service';

@Component({
    selector: 'app-agent-list',
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
        SelectModule,
        InputNumberModule,
        DividerModule,
        FluidModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './agent-list.html',
    styleUrls: ['./agent-list.scss']
})
export class AgentList implements OnInit {
    agents: Agent[] = [];
    countries: Country[] = [];
    locationCategories: Configuration[] = [];
    loading = false;
    dialogVisible = false;
    detailDialogVisible = false;
    editMode = false;
    selectedItem: any = {};
    detailItem: Agent | null = null;

    agentTypes = [
        { label: 'Super Agent', value: 'Super Agent' },
        { label: 'Sub Agent', value: 'Sub Agent' },
        { label: 'Paying Agent', value: 'Paying Agent' },
        { label: 'Sending Agent', value: 'Sending Agent' }
    ];

    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadData();
        this.loadCountries();
        this.loadLocationCategories();
    }

    loadData() {
        this.loading = true;
        this.remittanceService.getAgents().subscribe({
            next: (data) => { this.agents = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load agents' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadCountries() {
        this.remittanceService.getCountries().subscribe({
            next: (data) => { this.countries = data.filter(c => c.isActive); this.cdr.detectChanges(); }
        });
    }

    loadLocationCategories() {
        this.remittanceService.getConfigurationsByType(1).subscribe({
            next: (data) => { this.locationCategories = data.filter(c => c.isActive); this.cdr.detectChanges(); },
            error: () => { this.locationCategories = []; }
        });
    }

    openNew() {
        this.selectedItem = {
            name: '', countryId: null, categoryId: null, agentType: null, address: '', contactPerson: '', contactEmail: '', contactPhone: '', isActive: true,
            // Account setup fields
            accountName: '', accountNumber: '', bankName: '', bankBranch: '', bankDetails: '', currencyCode: '', openingBalance: 0
        };
        this.editMode = false;
        this.dialogVisible = true;
    }

    editItem(item: Agent) {
        this.selectedItem = { ...item };
        this.editMode = true;
        this.dialogVisible = true;
    }

    viewDetail(item: Agent) {
        this.detailItem = item;
        this.detailDialogVisible = true;
    }

    viewBranches(item: Agent) {
        this.router.navigate(['/remittance/branches', item.id]);
    }

    saveItem() {
        if (this.editMode) {
            const req: UpdateAgentRequest = {
                name: this.selectedItem.name,
                categoryId: this.selectedItem.categoryId || null,
                agentType: this.selectedItem.agentType,
                address: this.selectedItem.address,
                contactPerson: this.selectedItem.contactPerson,
                contactEmail: this.selectedItem.contactEmail,
                contactPhone: this.selectedItem.contactPhone,
                isActive: this.selectedItem.isActive
            };
            this.remittanceService.updateAgent(this.selectedItem.id, req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Agent updated' });
                    this.dialogVisible = false;
                    this.loadData();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' }); this.cdr.detectChanges(); }
            });
        } else {
            const req: CreateAgentRequest = {
                name: this.selectedItem.name,
                countryId: this.selectedItem.countryId,
                categoryId: this.selectedItem.categoryId || null,
                agentType: this.selectedItem.agentType,
                address: this.selectedItem.address,
                contactPerson: this.selectedItem.contactPerson,
                contactEmail: this.selectedItem.contactEmail,
                contactPhone: this.selectedItem.contactPhone,
                isActive: this.selectedItem.isActive
            };
            this.remittanceService.createAgent(req).subscribe({
                next: (agent) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Agent created' });
                    // Auto-create agent account if currency code is provided
                    if (this.selectedItem.currencyCode) {
                        const acctReq: CreateAgentAccountRequest = {
                            agentId: agent.id,
                            accountName: this.selectedItem.accountName || undefined,
                            accountNumber: this.selectedItem.accountNumber || undefined,
                            bankName: this.selectedItem.bankName || undefined,
                            bankBranch: this.selectedItem.bankBranch || undefined,
                            bankDetails: this.selectedItem.bankDetails || undefined,
                            currencyCode: this.selectedItem.currencyCode,
                            balance: this.selectedItem.openingBalance || 0
                        };
                        this.remittanceService.createAgentAccount(acctReq).subscribe({
                            next: () => {
                                this.messageService.add({ severity: 'info', summary: 'Account', detail: 'Agent account created' });
                                this.cdr.detectChanges();
                            },
                            error: () => {
                                this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Agent created but account setup failed. You can add it later.' });
                                this.cdr.detectChanges();
                            }
                        });
                    }
                    this.dialogVisible = false;
                    this.loadData();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' }); this.cdr.detectChanges(); }
            });
        }
    }

    deleteItem(item: Agent) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete agent "${item.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.remittanceService.deleteAgent(item.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Agent deleted' });
                        this.loadData();
                        this.cdr.detectChanges();
                    },
                    error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' }); this.cdr.detectChanges(); }
                });
            }
        });
    }

    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: any) {
        table.clear();
        if (this.filterInput) this.filterInput.nativeElement.value = '';
    }
}
