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
import { Select } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { InventoryService, Activity } from '../inventory.service';

@Component({
    selector: 'app-activity-form',
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
        Select,
        ProgressSpinnerModule,
        TooltipModule,
        TranslateModule
    ],
    providers: [MessageService],
    templateUrl: './activity-form.html',
    styleUrls: ['./activity-form.scss']
})
export class ActivityFormComponent implements OnInit {
    activity: Activity = this.initializeActivity();
    isEditMode = false;
    activityId: number | null = null;
    loading = false;
    pageLoading = false;
    equipmentText = '';
    imagesText = '';

    difficultyLevels = [
        { label: 'Easy', value: 'Easy' },
        { label: 'Moderate', value: 'Moderate' },
        { label: 'Hard', value: 'Hard' }
    ];

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
                this.activityId = +params['id'];
                this.loadActivity();
            }
        });
    }

    initializeActivity(): Activity {
        return {
            name: '',
            activityType: '',
            location: '',
            durationHours: 1,
            difficultyLevel: 'Moderate',
            maxParticipants: 10,
            minParticipants: 1,
            equipment: [],
            pricePerPerson: 0,
            description: '',
            safetyInstructions: '',
            images: []
        };
    }

    loadActivity() {
        if (!this.activityId) return;
        
        this.pageLoading = true;
        this.inventoryService.getActivityById(this.activityId).subscribe({
            next: (data) => {
                this.activity = { ...data };
                this.equipmentText = data.equipment?.join(', ') || '';
                this.imagesText = data.images?.join(', ') || '';
                this.pageLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.pageLoading = false;
                this.messageService.add({ 
                    severity: 'error', 
                    summary: this.translate.instant('common.error'),
                    detail: this.translate.instant('inventory.failedToLoadActivity')
                });
            }
        });
    }

    onSubmit() {
        if (!this.validate()) {
            return;
        }

        // Parse comma-separated equipment and images
        this.activity.equipment = this.equipmentText ? this.equipmentText.split(',').map(e => e.trim()).filter(e => e) : [];
        this.activity.images = this.imagesText ? this.imagesText.split(',').map(i => i.trim()).filter(i => i) : [];

        this.loading = true;
        const operation = this.isEditMode 
            ? this.inventoryService.updateActivity(this.activityId!, this.activity)
            : this.inventoryService.createActivity(this.activity);

        operation.subscribe({
            next: () => {
                this.messageService.add({ 
                    severity: 'success', 
                    summary: this.translate.instant('common.success'),
                    detail: this.translate.instant(this.isEditMode ? 'inventory.activityUpdated' : 'inventory.activityCreated')
                });
                this.loading = false;
                this.router.navigate(['/inventory/activities']);
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ 
                    severity: 'error', 
                    summary: this.translate.instant('common.error'),
                    detail: this.translate.instant('inventory.failedToSaveActivity')
                });
            }
        });
    }

    validate(): boolean {
        if (!this.activity.name || !this.activity.activityType || !this.activity.location) {
            this.messageService.add({ 
                severity: 'warn', 
                summary: this.translate.instant('common.validation'),
                detail: this.translate.instant('inventory.fillRequiredFields')
            });
            return false;
        }

        if (this.activity.durationHours <= 0 || this.activity.pricePerPerson <= 0) {
            this.messageService.add({ 
                severity: 'warn', 
                summary: this.translate.instant('common.validation'),
                detail: this.translate.instant('inventory.invalidActivityData')
            });
            return false;
        }

        if (this.activity.minParticipants && this.activity.maxParticipants && 
            this.activity.minParticipants > this.activity.maxParticipants) {
            this.messageService.add({ 
                severity: 'warn', 
                summary: this.translate.instant('common.validation'),
                detail: this.translate.instant('inventory.invalidParticipantLimits')
            });
            return false;
        }

        return true;
    }

    cancel() {
        this.router.navigate(['/inventory/activities']);
    }
}
