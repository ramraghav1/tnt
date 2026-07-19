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

import { InventoryService, Guide } from '../inventory.service';

@Component({
    selector: 'app-guide-list',
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
    templateUrl: './guide-list.html',
    styleUrls: ['./guide-list.scss']
})
export class GuideListComponent implements OnInit {
    guides: Guide[] = [];
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
        this.loadGuides();
    }

    loadGuides() {
        this.loading = true;
        this.inventoryService.getGuides(this.includeInactive).subscribe({
            next: (data) => {
                this.guides = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'inventory.failedToLoadGuides' 
                });
                this.cdr.detectChanges();
            }
        });
    }

    addNew() {
        this.router.navigate(['/inventory/guides/new']);
    }

    editGuide(guide: Guide) {
        this.router.navigate(['/inventory/guides/edit', guide.id]);
    }

    deleteGuide(guide: Guide) {
        this.confirmationService.confirm({
            message: 'inventory.confirmDeleteGuide',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.inventoryService.deleteGuide(guide.id!).subscribe({
                    next: () => {
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: 'Success', 
                            detail: 'inventory.guideDeleted' 
                        });
                        this.loadGuides();
                    },
                    error: (err) => {
                        console.error(err);
                        this.messageService.add({ 
                            severity: 'error', 
                            summary: 'Error', 
                            detail: 'inventory.failedToDeleteGuide' 
                        });
                    }
                });
            }
        });
    }

    activateGuide(guide: Guide) {
        this.inventoryService.activateGuide(guide.id!).subscribe({
            next: () => {
                this.messageService.add({ 
                    severity: 'success', 
                    summary: 'Success', 
                    detail: 'inventory.guideActivated' 
                });
                this.loadGuides();
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'inventory.failedToActivateGuide' 
                });
            }
        });
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    getRatingStars(rating: number | undefined): string {
        if (!rating) return 'N/A';
        return '⭐'.repeat(Math.round(rating));
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
