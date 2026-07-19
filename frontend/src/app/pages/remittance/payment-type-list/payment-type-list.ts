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

import { RemittanceService, PaymentType, CreatePaymentTypeRequest, UpdatePaymentTypeRequest } from '../remittance.service';

@Component({
    selector: 'app-payment-type-list',
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
        TextareaModule,
        FluidModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './payment-type-list.html',
    styleUrls: ['./payment-type-list.scss']
})
export class PaymentTypeList implements OnInit {
    paymentTypes: PaymentType[] = [];
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
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.remittanceService.getPaymentTypes().subscribe({
            next: (data) => { this.paymentTypes = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load payment types' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    openNew() {
        this.selectedItem = { name: '', description: '', isActive: true };
        this.editMode = false;
        this.dialogVisible = true;
    }

    editItem(item: PaymentType) {
        this.selectedItem = { ...item };
        this.editMode = true;
        this.dialogVisible = true;
    }

    saveItem() {
        if (this.editMode) {
            const req: UpdatePaymentTypeRequest = {
                name: this.selectedItem.name,
                description: this.selectedItem.description,
                isActive: this.selectedItem.isActive
            };
            this.remittanceService.updatePaymentType(this.selectedItem.id, req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment type updated' });
                    this.dialogVisible = false;
                    this.loadData();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' }); this.cdr.detectChanges(); }
            });
        } else {
            const req: CreatePaymentTypeRequest = {
                name: this.selectedItem.name,
                description: this.selectedItem.description,
                isActive: this.selectedItem.isActive
            };
            this.remittanceService.createPaymentType(req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment type created' });
                    this.dialogVisible = false;
                    this.loadData();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' }); this.cdr.detectChanges(); }
            });
        }
    }

    deleteItem(item: PaymentType) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${item.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.remittanceService.deletePaymentType(item.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Payment type deleted' });
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
