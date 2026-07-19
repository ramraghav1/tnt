import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { FluidModule } from 'primeng/fluid';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { InventoryService, Hotel, HotelRoom } from '../inventory.service';

@Component({
    selector: 'app-hotel-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FluidModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule,
        ToastModule,
        CardModule,
        DividerModule,
        ProgressSpinnerModule,
        TooltipModule,
        TranslateModule
    ],
    providers: [MessageService],
    templateUrl: './hotel-form.html',
    styleUrls: ['./hotel-form.scss']
})
export class HotelFormComponent implements OnInit {
    hotel: Hotel = this.initializeHotel();
    isEditMode = false;
    hotelId: number | null = null;
    loading = false;
    pageLoading = false;
    amenitiesText = '';
    collapsedRooms: boolean[] = [];

    constructor(
        private inventoryService: InventoryService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id'] && params['id'] !== 'new') {
                this.isEditMode = true;
                this.hotelId = +params['id'];
                this.loadHotel();
            }
        });
    }

    initializeHotel(): Hotel {
        return {
            name: '',
            location: '',
            address: '',
            contactPerson: '',
            phone: '',
            email: '',
            starRating: 3,
            category: '',
            amenities: [],
            rooms: []
        };
    }

    loadHotel() {
        if (!this.hotelId) return;
        
        this.pageLoading = true;
        this.inventoryService.getHotelById(this.hotelId).subscribe({
            next: (data) => {
                this.hotel = { ...data };
                this.amenitiesText = data.amenities?.join(', ') || '';
                // Populate featuresText for each room
                this.hotel.rooms?.forEach((room: any) => {
                    room.featuresText = room.features?.join(', ') || '';
                });
                // Initialize collapsed state for rooms
                this.collapsedRooms = new Array(this.hotel.rooms?.length || 0).fill(false);
                this.pageLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.pageLoading = false;
                this.messageService.add({ 
                    severity: 'error', 
                    summary: this.translate.instant('common.error') || 'Error', 
                    detail: this.translate.instant('inventory.failedToLoadHotel')
                });
            }
        });
    }

    addRoom() {
        this.hotel.rooms.push({
            roomType: '',
            capacity: 2,
            totalRooms: 1,
            pricePerNight: 0,
            features: [],
            featuresText: ''
        } as any);
        this.collapsedRooms.push(false); // Start expanded
    }

    removeRoom(index: number) {
        this.hotel.rooms.splice(index, 1);
        this.collapsedRooms.splice(index, 1);
    }

    toggleRoom(index: number) {
        this.collapsedRooms[index] = !this.collapsedRooms[index];
    }

    expandAllRooms() {
        this.collapsedRooms = this.collapsedRooms.map(() => false);
    }

    collapseAllRooms() {
        this.collapsedRooms = this.collapsedRooms.map(() => true);
    }

    onSubmit() {
        if (!this.validate()) {
            return;
        }

        // Parse comma-separated amenities
        this.hotel.amenities = this.amenitiesText ? this.amenitiesText.split(',').map(a => a.trim()).filter(a => a) : [];
        
        // Parse room features from text
        this.hotel.rooms.forEach((room: any) => {
            if (room.featuresText) {
                room.features = room.featuresText.split(',').map((f: string) => f.trim()).filter((f: string) => f);
            }
            delete room.featuresText; // Remove temporary property
        });

        this.loading = true;
        const operation = this.isEditMode 
            ? this.inventoryService.updateHotel(this.hotelId!, this.hotel)
            : this.inventoryService.createHotel(this.hotel);

        operation.subscribe({
            next: () => {
                this.messageService.add({ 
                    severity: 'success', 
                    summary: this.translate.instant('common.success') || 'Success', 
                    detail: this.translate.instant(this.isEditMode ? 'inventory.hotelUpdated' : 'inventory.hotelCreated')
                });
                this.loading = false;
                setTimeout(() => this.router.navigate(['/inventory/hotels']), 1000);
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ 
                    severity: 'error', 
                    summary: this.translate.instant('common.error') || 'Error', 
                    detail: this.translate.instant('inventory.failedToSaveHotel')
                });
            }
        });
    }

    validate(): boolean {
        if (!this.hotel.name || !this.hotel.location || !this.hotel.address) {
            this.messageService.add({ 
                severity: 'warn', 
                summary: this.translate.instant('common.validation') || 'Validation', 
                detail: this.translate.instant('inventory.fillRequiredFields')
            });
            return false;
        }

        if (this.hotel.rooms.length === 0) {
            this.messageService.add({ 
                severity: 'warn', 
                summary: this.translate.instant('common.validation') || 'Validation', 
                detail: this.translate.instant('inventory.addAtLeastOneRoom')
            });
            return false;
        }

        for (const room of this.hotel.rooms) {
            if (!room.roomType || room.totalRooms <= 0 || room.pricePerNight <= 0) {
                this.messageService.add({ 
                    severity: 'warn', 
                    summary: this.translate.instant('common.validation') || 'Validation', 
                    detail: this.translate.instant('inventory.invalidRoomData')
                });
                return false;
            }
        }

        return true;
    }

    cancel() {
        this.router.navigate(['/inventory/hotels']);
    }
}
