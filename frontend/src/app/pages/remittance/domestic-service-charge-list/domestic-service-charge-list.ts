import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RemittanceService, DomesticServiceChargeSetup } from '../remittance.service';

@Component({
    selector: 'app-domestic-service-charge-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        ConfirmDialogModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        ToolbarModule,
        TooltipModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './domestic-service-charge-list.html',
    styleUrls: ['./domestic-service-charge-list.scss']
})
export class DomesticServiceChargeList implements OnInit {
    setups: DomesticServiceChargeSetup[] = [];
    loading = false;

    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.remittanceService.getDomesticServiceCharges().subscribe({
            next: (data) => { this.setups = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load domestic service charges' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    openNew() {
        this.router.navigate(['/remittance/domestic-service-charge-form']);
    }

    viewDetail(setup: DomesticServiceChargeSetup) {
        this.router.navigate(['/remittance/domestic-service-charge-form', setup.id]);
    }

    deleteSetup(setup: DomesticServiceChargeSetup) {
        this.confirmationService.confirm({
            message: `Delete domestic service charge setup for ${setup.fromCategoryName} → ${setup.toCategoryName}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.remittanceService.deleteDomesticServiceCharge(setup.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Domestic service charge deleted' });
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
