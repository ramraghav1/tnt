import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DatePicker } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

import { InventoryService, CalendarEvent, BlockAvailabilityRequest, Hotel, Vehicle, Guide, Activity } from '../inventory.service';

@Component({
    selector: 'app-availability-calendar',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DatePicker,
        ButtonModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        Select,
        ToastModule,
        CardModule,
        TableModule,
        TagModule,
        TranslateModule
    ],
    providers: [MessageService],
    templateUrl: './availability-calendar.html',
    styleUrls: ['./availability-calendar.scss']
})
export class AvailabilityCalendarComponent implements OnInit {
    events: CalendarEvent[] = [];
    selectedDateRange: Date[] = [];
    loading = false;

    // Block Dialog
    blockDialog = false;
    blockRequest: BlockAvailabilityRequest = this.initializeBlockRequest();
    inventoryTypes = [
        { label: 'Hotel', value: 'Hotel' },
        { label: 'Vehicle', value: 'Vehicle' },
        { label: 'Guide', value: 'Guide' },
        { label: 'Activity', value: 'Activity' }
    ];
    inventoryItems: any[] = [];

    constructor(
        private inventoryService: InventoryService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadCalendarData();
    }

    initializeBlockRequest(): BlockAvailabilityRequest {
        return {
            inventoryType: '',
            inventoryId: 0,
            startDate: '',
            endDate: '',
            reason: '',
            notes: ''
        };
    }

    loadCalendarData() {
        // Default to current month view
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        this.loading = true;
        this.inventoryService.getCalendarView({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        }).subscribe({
            next: (data) => {
                this.events = data.events;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'availability.failedToLoadCalendar'
                });
                this.cdr.detectChanges();
            }
        });
    }

    openBlockDialog() {
        this.blockDialog = true;
        this.blockRequest = this.initializeBlockRequest();
    }

    onInventoryTypeChange() {
        if (!this.blockRequest.inventoryType) return;

        // Load inventory items based on type
        this.loading = true;
        let observable: any;
        
        switch (this.blockRequest.inventoryType) {
            case 'Hotel':
                observable = this.inventoryService.getHotels();
                break;
            case 'Vehicle':
                observable = this.inventoryService.getVehicles();
                break;
            case 'Guide':
                observable = this.inventoryService.getGuides();
                break;
            case 'Activity':
                observable = this.inventoryService.getActivities();
                break;
            default:
                return;
        }

        observable.subscribe({
            next: (data: any[]) => {
                this.inventoryItems = data.map(item => ({
                    label: item.name || item.fullName || item.model,
                    value: item.id
                }));
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error(err);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    createBlock() {
        if (!this.validateBlockRequest()) {
            return;
        }

        this.loading = true;
        this.inventoryService.createBlock(this.blockRequest).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'availability.blockCreated'
                });
                this.blockDialog = false;
                this.loadCalendarData();
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'availability.failedToCreateBlock'
                });
            }
        });
    }

    validateBlockRequest(): boolean {
        if (!this.blockRequest.inventoryType || !this.blockRequest.inventoryId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'availability.selectInventoryItem'
            });
            return false;
        }

        if (!this.blockRequest.startDate || !this.blockRequest.endDate) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'availability.selectDateRange'
            });
            return false;
        }

        if (!this.blockRequest.reason) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'availability.provideReason'
            });
            return false;
        }

        return true;
    }

    getEventColor(event: CalendarEvent): string {
        return event.color || this.getStatusColor(event.status);
    }

    getStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
            'Confirmed': '#4CAF50',
            'Pending': '#FFC107',
            'Cancelled': '#F44336',
            'Completed': '#2196F3',
            'Blocked': '#FF6B6B',
            'Open': '#22C55E',
            'Full': '#EF4444'
        };
        return colors[status] || '#9E9E9E';
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const severities: { [key: string]: any } = {
            'Confirmed': 'success',
            'Pending': 'warn',
            'Cancelled': 'danger',
            'Completed': 'info',
            'Blocked': 'danger',
            'Open': 'success',
            'Full': 'danger'
        };
        return severities[status] || 'secondary';
    }

    onDateRangeSelect(event: any) {
        const dates = event?.value || event;
        if (dates && Array.isArray(dates) && dates.length === 2) {
            this.blockRequest.startDate = dates[0].toISOString().split('T')[0];
            this.blockRequest.endDate = dates[1].toISOString().split('T')[0];
        }
    }
}
