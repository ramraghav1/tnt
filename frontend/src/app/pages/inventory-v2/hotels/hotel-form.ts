import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { StatusBadge, InvPageHeader, SeasonTag, InvEmptyState } from '../shared/inventory-shared';
import { InventoryV2Service, Hotel, HotelRoom, Location, HotelSeasonPricing, Season, CreateHotelSeasonPricingRequest } from '../inventory.service';

@Component({
    selector: 'inv-hotel-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, InputTextModule, InputNumberModule,
        TextareaModule, SelectModule, TabsModule, CardModule, TableModule, DialogModule,
        ToastModule, DividerModule, TooltipModule, ConfirmDialogModule,
        StatusBadge, InvPageHeader, SeasonTag, InvEmptyState
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <inv-page-header
            [title]="isEdit ? 'Edit Hotel' : 'New Hotel'"
            icon="pi pi-building"
            [showSearch]="false"
            [showAdd]="false"
        />

        <div class="flex gap-2 mb-4">
            <button pButton label="Back to Hotels" icon="pi pi-arrow-left" [text]="true" (click)="router.navigate(['/inventory-v2/hotels'])"></button>
        </div>

        <p-tabs value="0">
            <p-tablist>
                <p-tab value="0"><i class="pi pi-info-circle mr-2"></i>General Info</p-tab>
                <p-tab value="1" *ngIf="isEdit"><i class="pi pi-th-large mr-2"></i>Rooms ({{ hotel?.rooms?.length || 0 }})</p-tab>
            </p-tablist>
            <p-tabpanels>
                <!-- GENERAL INFO TAB -->
                <p-tabpanel value="0">
                    <div class="card mt-4">
                        <form [formGroup]="form" class="flex flex-col gap-5">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="flex flex-col gap-2">
                                    <label class="font-semibold text-sm">Hotel Name *</label>
                                    <input pInputText formControlName="name" />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="font-semibold text-sm">Location *</label>
                                    <p-select formControlName="locationId" [options]="locationOptions" optionLabel="label" optionValue="value" placeholder="Select location" [filter]="true" />
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="flex flex-col gap-2">
                                    <label class="font-semibold text-sm">Category</label>
                                    <p-select formControlName="category" [options]="categoryOptions" optionLabel="label" optionValue="value" placeholder="Select" />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="font-semibold text-sm">Star Rating</label>
                                    <p-select formControlName="starRating" [options]="starOptions" optionLabel="label" optionValue="value" />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="font-semibold text-sm">Phone</label>
                                    <input pInputText formControlName="phone" />
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="flex flex-col gap-2">
                                    <label class="font-semibold text-sm">Contact Person</label>
                                    <input pInputText formControlName="contactPerson" />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="font-semibold text-sm">Email</label>
                                    <input pInputText formControlName="email" type="email" />
                                </div>
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="font-semibold text-sm">Address</label>
                                <input pInputText formControlName="address" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="font-semibold text-sm">Amenities</label>
                                <input pInputText formControlName="amenitiesText" placeholder="WiFi, Pool, Gym (comma-separated)" />
                            </div>
                            <div class="flex justify-end gap-3 pt-2">
                                <button pButton label="Cancel" icon="pi pi-times" severity="secondary" [outlined]="true"
                                        (click)="router.navigate(['/inventory-v2/hotels'])"></button>
                                <button pButton [label]="isEdit ? 'Update Hotel' : 'Create Hotel'" icon="pi pi-check"
                                        [disabled]="form.invalid || saving" [loading]="saving" (click)="saveHotel()"></button>
                            </div>
                        </form>
                    </div>
                </p-tabpanel>

                <!-- ROOMS TAB -->
                <p-tabpanel *ngIf="isEdit" value="1">
                    <div class="card mt-4">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold m-0">Room Types</h3>
                            <button pButton label="Add Room" icon="pi pi-plus" (click)="openRoomDialog()"></button>
                        </div>

                        <p-table [value]="hotel?.rooms || []" dataKey="id" responsiveLayout="scroll">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th style="min-width:10rem">Room Type</th>
                                    <th style="min-width:6rem">Capacity</th>
                                    <th style="min-width:6rem">Total</th>
                                    <th style="min-width:8rem">Base Price (USD)</th>
                                    <th style="min-width:10rem">Features</th>
                                    <th style="min-width:10rem">Season Pricing</th>
                                    <th style="min-width:8rem">Actions</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-room>
                                <tr>
                                    <td class="font-semibold">{{ room.roomType }}</td>
                                    <td>{{ room.capacity }} pax</td>
                                    <td>{{ room.totalRooms }}</td>
                                    <td class="font-mono font-semibold">\${{ room.pricePerNight | number:'1.2-2' }}</td>
                                    <td><span class="text-sm text-muted-color">{{ room.features?.join(', ') || '—' }}</span></td>
                                    <td>
                                        <button pButton label="Manage" icon="pi pi-calendar" [text]="true" size="small"
                                                (click)="openSeasonPricing(room)"></button>
                                    </td>
                                    <td>
                                        <div class="flex gap-1">
                                            <button pButton icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info"
                                                    (click)="editRoom(room)" pTooltip="Edit"></button>
                                            <button pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger"
                                                    (click)="removeRoom(room)" pTooltip="Remove"></button>
                                        </div>
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr><td colspan="7"><inv-empty-state icon="pi pi-th-large" message="No rooms added" hint="Add room types to this hotel" /></td></tr>
                            </ng-template>
                        </p-table>
                    </div>
                </p-tabpanel>
            </p-tabpanels>
        </p-tabs>

        <!-- Room Dialog -->
        <p-dialog [(visible)]="roomDialogVisible" [header]="editingRoom ? 'Edit Room' : 'Add Room'" [modal]="true" [style]="{ width: '480px' }" styleClass="p-fluid">
            <ng-template #content>
                <form [formGroup]="roomForm" class="flex flex-col gap-4 pt-2">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Room Type *</label>
                        <p-select formControlName="roomType" [options]="roomTypeOptions" optionLabel="label" optionValue="value" placeholder="Select type" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Capacity (pax) *</label>
                            <p-inputNumber formControlName="capacity" [min]="1" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">Total Rooms *</label>
                            <p-inputNumber formControlName="totalRooms" [min]="1" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Base Price per Night (USD) *</label>
                        <p-inputNumber formControlName="pricePerNight" mode="currency" currency="USD" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-sm">Features</label>
                        <input pInputText formControlName="featuresText" placeholder="AC, TV, Balcony (comma-separated)" />
                    </div>
                </form>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="roomDialogVisible = false"></button>
                <button pButton [label]="editingRoom ? 'Update' : 'Add'" icon="pi pi-check" [disabled]="roomForm.invalid" (click)="saveRoom()"></button>
            </ng-template>
        </p-dialog>

        <!-- Season Pricing Dialog -->
        <p-dialog [(visible)]="seasonPricingVisible" header="Season Pricing" [modal]="true" [style]="{ width: '640px' }">
            <ng-template #content>
                <div class="mb-4">
                    <span class="font-semibold text-lg">{{ selectedRoom?.roomType }}</span>
                    <span class="ml-2 text-muted-color">Base: \${{ selectedRoom?.pricePerNight | number:'1.2-2' }}</span>
                </div>

                <p-table [value]="seasonPricings" dataKey="id" responsiveLayout="scroll">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Season</th>
                            <th>Type</th>
                            <th>Price/Night</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-sp>
                        <tr>
                            <td>{{ sp.seasonName }}</td>
                            <td><inv-season-tag [type]="sp.seasonType || ''" /></td>
                            <td class="font-mono font-semibold">\${{ sp.pricePerNight | number:'1.2-2' }}</td>
                            <td><button pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (click)="removeSeasonPricing(sp)"></button></td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr><td colspan="4" class="text-center py-3 text-muted-color">No season pricing configured — base price applies</td></tr>
                    </ng-template>
                </p-table>

                <p-divider />

                <div class="flex items-end gap-3">
                    <div class="flex flex-col gap-1 flex-1">
                        <label class="text-sm font-semibold">Season</label>
                        <p-select [(ngModel)]="newSP.seasonId" [options]="seasonOptions" optionLabel="label" optionValue="value" placeholder="Select" />
                    </div>
                    <div class="flex flex-col gap-1" style="width:140px">
                        <label class="text-sm font-semibold">Price/Night</label>
                        <p-inputNumber [(ngModel)]="newSP.pricePerNight" mode="currency" currency="USD" />
                    </div>
                    <button pButton icon="pi pi-plus" label="Add" (click)="addSeasonPricing()" [disabled]="!newSP.seasonId || !newSP.pricePerNight"></button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class HotelForm implements OnInit {
    form!: FormGroup;
    roomForm!: FormGroup;
    hotel: Hotel | null = null;
    isEdit = false;
    hotelId = 0;
    saving = false;

    locations: Location[] = [];
    locationOptions: any[] = [];
    categoryOptions = [
        { label: 'Budget', value: 'Budget' }, { label: 'Standard', value: 'Standard' },
        { label: 'Deluxe', value: 'Deluxe' }, { label: 'Luxury', value: 'Luxury' },
        { label: 'Boutique', value: 'Boutique' }, { label: 'Resort', value: 'Resort' }
    ];
    starOptions = [1, 2, 3, 4, 5].map(n => ({ label: '★'.repeat(n), value: n }));
    roomTypeOptions = [
        { label: 'Single', value: 'Single' }, { label: 'Double', value: 'Double' },
        { label: 'Twin', value: 'Twin' }, { label: 'Triple', value: 'Triple' },
        { label: 'Suite', value: 'Suite' }, { label: 'Deluxe', value: 'Deluxe' },
        { label: 'Family', value: 'Family' }, { label: 'Dormitory', value: 'Dormitory' }
    ];

    roomDialogVisible = false;
    editingRoom: HotelRoom | null = null;
    editingRoomIndex = -1;

    // Season pricing
    seasonPricingVisible = false;
    selectedRoom: HotelRoom | null = null;
    seasonPricings: HotelSeasonPricing[] = [];
    seasons: Season[] = [];
    seasonOptions: any[] = [];
    newSP: any = {};

    constructor(
        public router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private svc: InventoryV2Service,
        private msg: MessageService,
        private confirm: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.initForms();
        this.loadLocations();
        this.loadSeasons();

        this.route.params.subscribe(p => {
            if (p['id'] && p['id'] !== 'new') {
                this.isEdit = true;
                this.hotelId = +p['id'];
                this.loadHotel();
            }
        });
    }

    initForms() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            locationId: [null],
            category: [''],
            starRating: [3],
            phone: [''],
            contactPerson: [''],
            email: [''],
            address: [''],
            amenitiesText: ['']
        });

        this.roomForm = this.fb.group({
            roomType: ['', Validators.required],
            capacity: [2, [Validators.required, Validators.min(1)]],
            totalRooms: [1, [Validators.required, Validators.min(1)]],
            pricePerNight: [0, [Validators.required, Validators.min(0)]],
            featuresText: ['']
        });
    }

    loadLocations() {
        this.svc.getLocations().subscribe({
            next: d => {
                this.locations = d ?? [];
                this.locationOptions = this.locations.map(l => ({ label: `${l.name}, ${l.country}`, value: l.id }));
                this.cdr.markForCheck();
            }
        });
    }

    loadSeasons() {
        this.svc.getSeasons().subscribe({
            next: d => {
                this.seasons = d ?? [];
                this.seasonOptions = this.seasons.map(s => ({ label: `${s.name} (${s.seasonType})`, value: s.id }));
                this.cdr.markForCheck();
            }
        });
    }

    loadHotel() {
        this.svc.getHotel(this.hotelId).subscribe({
            next: h => {
                this.hotel = h;
                const loc = this.locations.find(l => l.name === h.location);
                this.form.patchValue({
                    name: h.name, locationId: h.locationId ?? loc?.id, category: h.category,
                    starRating: h.starRating, phone: h.phone, contactPerson: h.contactPerson,
                    email: h.email, address: h.address, amenitiesText: h.amenities?.join(', ') || ''
                });
                this.cdr.markForCheck();
            },
            error: () => { this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load hotel' }); }
        });
    }

    saveHotel() {
        if (this.form.invalid) return;
        this.saving = true;
        const val = this.form.value;
        const loc = this.locations.find(l => l.id === val.locationId);
        const payload: any = {
            name: val.name, location: loc?.name || '', locationId: val.locationId,
            address: val.address || '', contactPerson: val.contactPerson, phone: val.phone,
            email: val.email, starRating: val.starRating, category: val.category,
            amenities: (val.amenitiesText || '').split(',').map((s: string) => s.trim()).filter((s: string) => s),
            rooms: this.hotel?.rooms || []
        };

        const obs = this.isEdit
            ? this.svc.updateHotel(this.hotelId, payload)
            : this.svc.createHotel(payload);

        obs.subscribe({
            next: (result) => {
                this.saving = false;
                this.msg.add({ severity: 'success', summary: 'Success', detail: this.isEdit ? 'Hotel updated' : 'Hotel created' });
                if (!this.isEdit) {
                    this.router.navigate(['/inventory-v2/hotels/edit', result.id]);
                } else {
                    this.loadHotel();
                }
                this.cdr.markForCheck();
            },
            error: () => { this.saving = false; this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to save hotel' }); this.cdr.markForCheck(); }
        });
    }

    // ─── ROOM MANAGEMENT ─────────────────────
    openRoomDialog() {
        this.editingRoom = null;
        this.editingRoomIndex = -1;
        this.roomForm.reset({ capacity: 2, totalRooms: 1, pricePerNight: 0 });
        this.roomDialogVisible = true;
    }

    editRoom(room: HotelRoom) {
        this.editingRoom = room;
        this.editingRoomIndex = this.hotel!.rooms.indexOf(room);
        this.roomForm.patchValue({
            roomType: room.roomType, capacity: room.capacity, totalRooms: room.totalRooms,
            pricePerNight: room.pricePerNight, featuresText: room.features?.join(', ') || ''
        });
        this.roomDialogVisible = true;
    }

    saveRoom() {
        if (this.roomForm.invalid) return;
        const v = this.roomForm.value;
        const room: HotelRoom = {
            ...(this.editingRoom || {}),
            roomType: v.roomType,
            capacity: v.capacity,
            totalRooms: v.totalRooms,
            pricePerNight: v.pricePerNight,
            features: (v.featuresText || '').split(',').map((s: string) => s.trim()).filter((s: string) => s)
        };

        if (this.editingRoom && this.editingRoomIndex >= 0) {
            this.hotel!.rooms[this.editingRoomIndex] = room;
        } else {
            this.hotel!.rooms.push(room);
        }

        // Save the hotel to persist room changes
        this.saveHotel();
        this.roomDialogVisible = false;
    }

    removeRoom(room: HotelRoom) {
        this.confirm.confirm({
            message: `Remove "${room.roomType}" room type?`,
            accept: () => {
                this.hotel!.rooms = this.hotel!.rooms.filter(r => r !== room);
                this.saveHotel();
            }
        });
    }

    // ─── SEASON PRICING ──────────────────────
    openSeasonPricing(room: HotelRoom) {
        this.selectedRoom = room;
        this.newSP = {};
        this.seasonPricings = [];
        this.seasonPricingVisible = true;

        if (room.id) {
            this.svc.getHotelSeasonPricingByRoom(room.id).subscribe({
                next: d => { this.seasonPricings = d ?? []; this.cdr.markForCheck(); }
            });
        }
    }

    addSeasonPricing() {
        if (!this.selectedRoom?.id || !this.newSP.seasonId || !this.newSP.pricePerNight) return;
        const req: CreateHotelSeasonPricingRequest = {
            hotelRoomId: this.selectedRoom.id,
            seasonId: this.newSP.seasonId,
            pricePerNight: this.newSP.pricePerNight,
            currency: 'USD'
        };
        this.svc.createHotelSeasonPricing(req).subscribe({
            next: () => {
                this.openSeasonPricing(this.selectedRoom!); // reload
                this.msg.add({ severity: 'success', summary: 'Added' });
            },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed' })
        });
    }

    removeSeasonPricing(sp: HotelSeasonPricing) {
        this.svc.deleteHotelSeasonPricing(sp.id).subscribe({
            next: () => {
                this.seasonPricings = this.seasonPricings.filter(s => s.id !== sp.id);
                this.msg.add({ severity: 'success', summary: 'Removed' });
                this.cdr.markForCheck();
            }
        });
    }
}
