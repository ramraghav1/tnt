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
import { TranslateModule } from '@ngx-translate/core';

import { InventoryService, Hotel } from '../inventory.service';

@Component({
    selector: 'app-hotel-list',
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
    templateUrl: './hotel-list.html',
    styleUrls: ['./hotel-list.scss']
})
export class HotelListComponent implements OnInit {
    hotels: Hotel[] = [];
    loading = false;
    includeInactive = false;
    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(
        private inventoryService: InventoryService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadHotels();
    }

    loadHotels() {
        this.loading = true;
        this.inventoryService.getHotels(this.includeInactive).subscribe({
            next: (data) => {
                this.hotels = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'inventory.failedToLoadHotels' 
                });
                this.cdr.detectChanges();
            }
        });
    }

    addNew() {
        this.router.navigate(['/inventory/hotels/new']);
    }

    editHotel(hotel: Hotel) {
        this.router.navigate(['/inventory/hotels/edit', hotel.id]);
    }

    deleteHotel(hotel: Hotel) {
        this.confirmationService.confirm({
            message: 'inventory.confirmDeleteHotel',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.inventoryService.deleteHotel(hotel.id!).subscribe({
                    next: () => {
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: 'Success', 
                            detail: 'inventory.hotelDeleted' 
                        });
                        this.loadHotels();
                    },
                    error: (err) => {
                        console.error(err);
                        this.messageService.add({ 
                            severity: 'error', 
                            summary: 'Error', 
                            detail: 'inventory.failedToDeleteHotel' 
                        });
                    }
                });
            }
        });
    }

    activateHotel(hotel: Hotel) {
        this.inventoryService.activateHotel(hotel.id!).subscribe({
            next: () => {
                this.messageService.add({ 
                    severity: 'success', 
                    summary: 'Success', 
                    detail: 'inventory.hotelActivated' 
                });
                this.loadHotels();
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'inventory.failedToActivateHotel' 
                });
            }
        });
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    getStarRating(rating: number | undefined): string {
        if (!rating) return 'N/A';
        return '⭐'.repeat(rating);
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
