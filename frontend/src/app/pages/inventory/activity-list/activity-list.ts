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

import { InventoryService, Activity } from '../inventory.service';

@Component({
    selector: 'app-activity-list',
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
    templateUrl: './activity-list.html',
    styleUrls: ['./activity-list.scss']
})
export class ActivityListComponent implements OnInit {
    activities: Activity[] = [];
    loading = false;
    includeInactive = false;
    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(
        private inventoryService: InventoryService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.loadActivities();
    }

    loadActivities() {
        this.loading = true;
        this.inventoryService.getActivities(this.includeInactive).subscribe({
            next: (data) => {
                this.activities = data || [];
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.activities = [];
                this.loading = false;
                this.cdr.detectChanges();
                this.messageService.add({ 
                    severity: 'error', 
                    summary: this.translate.instant('common.error'),
                    detail: this.translate.instant('inventory.failedToLoadActivities')
                });
            }
        });
    }

    addNew() {
        this.router.navigate(['/inventory/activities/new']);
    }

    editActivity(activityId: number) {
        this.router.navigate(['/inventory/activities/edit', activityId]);
    }

    deleteActivity(activity: Activity) {
        this.confirmationService.confirm({
            message: this.translate.instant('inventory.confirmDeleteActivity'),
            header: this.translate.instant('common.confirmation'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.inventoryService.deleteActivity(activity.id!).subscribe({
                    next: () => {
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: this.translate.instant('common.success'),
                            detail: this.translate.instant('inventory.activityDeleted')
                        });
                        this.loadActivities();
                    },
                    error: (err) => {
                        console.error(err);
                        this.messageService.add({ 
                            severity: 'error', 
                            summary: this.translate.instant('common.error'),
                            detail: this.translate.instant('inventory.failedToDeleteActivity')
                        });
                    }
                });
            }
        });
    }

    activateActivity(activityId: number) {
        this.inventoryService.activateActivity(activityId).subscribe({
            next: () => {
                this.messageService.add({ 
                    severity: 'success', 
                    summary: this.translate.instant('common.success'),
                    detail: this.translate.instant('inventory.activityActivated')
                });
                this.loadActivities();
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ 
                    severity: 'error', 
                    summary: this.translate.instant('common.error'),
                    detail: this.translate.instant('inventory.failedToActivateActivity')
                });
            }
        });
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    getDifficultySeverity(difficulty: string): 'success' | 'warn' | 'danger' {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'success';
            case 'moderate': return 'warn';
            case 'hard': return 'danger';
            default: return 'warn';
        }
    }

    formatEquipment(equipment: string[]): string {
        if (!equipment || equipment.length === 0) return '-';
        return equipment.slice(0, 2).join(', ') + (equipment.length > 2 ? ` +${equipment.length - 2}` : '');
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
