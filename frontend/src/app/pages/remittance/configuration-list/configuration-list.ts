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
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

import {
    RemittanceService,
    ConfigurationType,
    Configuration,
    CreateConfigurationRequest,
    UpdateConfigurationRequest
} from '../remittance.service';

@Component({
    selector: 'app-configuration-list',
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
        FluidModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './configuration-list.html',
    styleUrls: ['./configuration-list.scss']
})
export class ConfigurationList implements OnInit {
    configurationTypes: ConfigurationType[] = [];
    configurations: Configuration[] = [];
    loading = false;
    dialogVisible = false;
    editMode = false;
    selectedItem: any = {};

    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadConfigurationTypes();
        this.loadData();
    }

    loadConfigurationTypes() {
        this.remittanceService.getConfigurationTypes().subscribe({
            next: (data) => { this.configurationTypes = data.filter(ct => ct.isActive); this.cdr.detectChanges(); }
        });
    }

    loadData() {
        this.loading = true;
        this.remittanceService.getConfigurations().subscribe({
            next: (data) => { this.configurations = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load configurations' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    openNew() {
        this.selectedItem = { configurationTypeId: null, code: '', displayName: '', isActive: true };
        this.editMode = false;
        this.dialogVisible = true;
    }

    editItem(item: Configuration) {
        this.selectedItem = { ...item };
        this.editMode = true;
        this.dialogVisible = true;
    }

    saveItem() {
        if (this.editMode) {
            const req: UpdateConfigurationRequest = {
                code: this.selectedItem.code,
                displayName: this.selectedItem.displayName,
                isActive: this.selectedItem.isActive
            };
            this.remittanceService.updateConfiguration(this.selectedItem.id, req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Configuration updated' });
                    this.dialogVisible = false;
                    this.loadData();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' }); this.cdr.detectChanges(); }
            });
        } else {
            const req: CreateConfigurationRequest = {
                configurationTypeId: this.selectedItem.configurationTypeId,
                code: this.selectedItem.code,
                displayName: this.selectedItem.displayName
            };
            this.remittanceService.createConfiguration(req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Configuration created' });
                    this.dialogVisible = false;
                    this.loadData();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' }); this.cdr.detectChanges(); }
            });
        }
    }

    deleteItem(item: Configuration) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${item.displayName}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.remittanceService.deleteConfiguration(item.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Configuration deleted' });
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
