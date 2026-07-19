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

import { RemittanceService, FxRateSetup } from '../remittance.service';

@Component({
    selector: 'app-fx-rate-list',
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
    templateUrl: './fx-rate-list.html',
    styleUrls: ['./fx-rate-list.scss']
})
export class FxRateList implements OnInit {
    setups: FxRateSetup[] = [];
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
        this.remittanceService.getFxRates().subscribe({
            next: (data) => { this.setups = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load FX rates' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    openNew() {
        this.router.navigate(['/remittance/fx-rate-form']);
    }

    editSetup(setup: FxRateSetup) {
        this.router.navigate(['/remittance/fx-rate-form', setup.id]);
    }

    deleteSetup(setup: FxRateSetup) {
        this.confirmationService.confirm({
            message: `Delete FX rate for ${setup.sendingCountryName} → ${setup.receivingCountryName} (${setup.sendingCurrency}/${setup.receivingCurrency})?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.remittanceService.deleteFxRate(setup.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'FX rate deleted' });
                        this.loadData();
                        this.cdr.detectChanges();
                    },
                    error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' }); this.cdr.detectChanges(); }
                });
            }
        });
    }

    formatRate(rate: number | null): string {
        if (rate == null) return '—';
        return rate.toFixed(6);
    }

    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: any) {
        table.clear();
        if (this.filterInput) this.filterInput.nativeElement.value = '';
    }
}
