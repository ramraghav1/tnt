import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { InventoryService, Vehicle } from '../inventory.service';

@Component({
    selector: 'app-vehicle-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        TagModule,
        TooltipModule,
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule,
        TranslateModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './vehicle-list.html',
    styleUrls: ['./vehicle-list.scss']
})
export class VehicleListComponent implements OnInit {
    vehicles: Vehicle[] = [];
    loading = false;
    includeInactive = false;
    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(
        private inventoryService: InventoryService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.loadVehicles();
    }

    loadVehicles() {
        this.loading = true;
        this.inventoryService.getVehicles(this.includeInactive).subscribe({
            next: (data) => {
                this.vehicles = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ 
                    severity: 'error', 
                    summary: this.translate.instant('common.error'),
                    detail: this.translate.instant('inventory.failedToLoadVehicles')
                });
                this.cdr.detectChanges();
            }
        });
    }

    addNew() {
        this.router.navigate(['/inventory/vehicles/new']);
    }

    editVehicle(vehicle: Vehicle) {
        this.router.navigate(['/inventory/vehicles/edit', vehicle.id]);
    }

    deleteVehicle(vehicle: Vehicle) {
        this.confirmationService.confirm({
            message: this.translate.instant('inventory.confirmDeleteVehicle'),
            header: this.translate.instant('common.confirmation'),

            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.inventoryService.deleteVehicle(vehicle.id!).subscribe({
                    next: () => {
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: this.translate.instant('common.success'),
                            detail: this.translate.instant('inventory.vehicleDeleted')
                        });
                        this.loadVehicles();
                    },
                    error: (err) => {
                        console.error(err);
                        this.messageService.add({ 
                            severity: 'error', 
                            summary: this.translate.instant('common.error'),
                            detail: this.translate.instant('inventory.failedToDeleteVehicle')
                        });
                    }
                });
            }
        });
    }

    activateVehicle(vehicle: Vehicle) {
        this.inventoryService.activateVehicle(vehicle.id!).subscribe({
            next: () => {
                this.messageService.add({ 
                    severity: 'success', 
                    summary: this.translate.instant('common.success'),
                    detail: this.translate.instant('inventory.vehicleActivated')
                });
                this.loadVehicles();
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ 
                    severity: 'error', 
                    summary: this.translate.instant('common.error'),
                    detail: this.translate.instant('inventory.failedToActivateVehicle')
                });
            }
        });
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
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
