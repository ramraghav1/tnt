import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LeadCrmService, RoomingAssignment } from '../../../shared/services/lead-crm.service';

@Component({
    selector: 'app-rooming-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, InputTextModule,
        DialogModule, SelectModule, InputNumberModule, ToolbarModule, ConfirmDialogModule,
        IconFieldModule, InputIconModule, DatePickerModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog />

        <div class="card">
            <p-toolbar styleClass="mb-6 gap-2">
                <ng-template #start>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center rounded-xl bg-primary/10" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-building text-primary text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Rooming List</h2>
                    </div>
                </ng-template>
                <ng-template #end>
                    <div class="flex items-center gap-3">
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-muted-color">Departure ID</label>
                            <p-inputNumber [(ngModel)]="departureId" [min]="1" placeholder="Departure ID" [inputStyle]="{'width':'120px'}" />
                        </div>
                        <button pButton label="Load" icon="pi pi-search" (click)="loadRooming()" class="mt-4"></button>
                        <button pButton label="Add Room" icon="pi pi-plus" (click)="openNew()" class="mt-4" [disabled]="!departureId"></button>
                    </div>
                </ng-template>
            </p-toolbar>

            <p-table [value]="roomings" [paginator]="true" [rows]="10" dataKey="id" [loading]="loading" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Traveler</th>
                        <th>Booking Ref</th>
                        <th>Hotel</th>
                        <th>Room Type</th>
                        <th>Room #</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-r>
                    <tr>
                        <td class="font-semibold">{{ r.travelerName || 'Traveler #' + r.travelerId }}</td>
                        <td>{{ r.bookingReference || '-' }}</td>
                        <td>{{ r.hotelName || '-' }}</td>
                        <td>{{ r.roomType || '-' }}</td>
                        <td>{{ r.roomNumber || '-' }}</td>
                        <td>{{ r.checkInDate ? (r.checkInDate | date:'mediumDate') : '-' }}</td>
                        <td>{{ r.checkOutDate ? (r.checkOutDate | date:'mediumDate') : '-' }}</td>
                        <td>{{ r.notes || '-' }}</td>
                        <td>
                            <button pButton icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (click)="deleteRooming(r)"></button>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="9" class="text-center py-8 text-muted-color">
                        {{ departureId ? 'No rooming assignments found for this departure.' : 'Enter a departure ID and click Load.' }}
                    </td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Add Rooming Dialog -->
        <p-dialog [(visible)]="roomDialog" [style]="{ width: '500px' }" header="Add Room Assignment" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Booking Instance ID *</label>
                        <p-inputNumber [(ngModel)]="newRoom.bookingInstanceId" [min]="1" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Traveler ID *</label>
                        <p-inputNumber [(ngModel)]="newRoom.travelerId" [min]="1" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Hotel ID</label>
                        <p-inputNumber [(ngModel)]="newRoom.hotelId" [min]="1" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Room Type</label>
                            <p-select [(ngModel)]="newRoom.roomType" [options]="roomTypeOptions" optionLabel="label" optionValue="value" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Room Number</label>
                            <input pInputText [(ngModel)]="newRoom.roomNumber" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Check-in</label>
                            <p-datepicker [(ngModel)]="newRoom.checkInDate" dateFormat="yy-mm-dd" [showIcon]="true" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold">Check-out</label>
                            <p-datepicker [(ngModel)]="newRoom.checkOutDate" dateFormat="yy-mm-dd" [showIcon]="true" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-semibold">Notes</label>
                        <input pInputText [(ngModel)]="newRoom.notes" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <button pButton label="Cancel" icon="pi pi-times" [text]="true" (click)="roomDialog = false"></button>
                <button pButton label="Save" icon="pi pi-check" (click)="saveRooming()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class RoomingList implements OnInit {
    roomings: RoomingAssignment[] = [];
    departureId: number | null = null;
    roomDialog = false;
    loading = false;
    newRoom: any = {};

    roomTypeOptions = [
        { label: 'Single', value: 'Single' }, { label: 'Double', value: 'Double' },
        { label: 'Twin', value: 'Twin' }, { label: 'Triple', value: 'Triple' },
        { label: 'Suite', value: 'Suite' }, { label: 'Family', value: 'Family' }
    ];

    constructor(
        private leadCrmService: LeadCrmService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {}

    loadRooming() {
        if (!this.departureId) return;
        this.loading = true;
        this.leadCrmService.getRooming(this.departureId).subscribe({
            next: (data) => { this.roomings = data; this.loading = false; },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load rooming' }); }
        });
    }

    openNew() {
        this.newRoom = { departureId: this.departureId, roomType: 'Double' };
        this.roomDialog = true;
    }

    saveRooming() {
        if (!this.newRoom.bookingInstanceId || !this.newRoom.travelerId) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Booking instance & traveler IDs required' });
            return;
        }
        this.newRoom.departureId = this.departureId;
        this.leadCrmService.createRooming(this.newRoom).subscribe({
            next: () => { this.loadRooming(); this.roomDialog = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Room assigned' }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to assign room' })
        });
    }

    deleteRooming(r: RoomingAssignment) {
        this.confirmationService.confirm({
            message: 'Remove this room assignment?',
            accept: () => {
                this.leadCrmService.deleteRooming(r.id).subscribe({
                    next: () => { this.loadRooming(); this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Room removed' }); },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove' })
                });
            }
        });
    }
}
