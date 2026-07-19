import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { DataViewModule } from 'primeng/dataview';
import { MessageService } from 'primeng/api';
import { FluidModule } from 'primeng/fluid';

import { TenantService } from '../tenant.service';

@Component({
    selector: 'app-product-subscriptions',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        FluidModule,
        CardModule,
        ButtonModule,
        ToastModule,
        ProgressSpinnerModule,
        TagModule,
        DataViewModule
    ],
    providers: [MessageService],
    templateUrl: './product-subscriptions.html',
    styleUrls: ['./product-subscriptions.scss']
})
export class ProductSubscriptionsComponent implements OnInit {
    products: string[] = [];
    loading = false;

    productDetails: any[] = [
        {
            name: 'TourAndTravel',
            displayName: 'Tour & Travel Management',
            description: 'Complete tour and travel booking system with itinerary management, inventory, availability tracking, and customer management.',
            icon: 'pi-map-marker',
            color: '#3B82F6'
        },
        {
            name: 'Clinic',
            displayName: 'Clinic Management',
            description: 'Healthcare clinic management system for appointments, patient records, billing, and medical staff management.',
            icon: 'pi-heart',
            color: '#EF4444'
        },
        {
            name: 'Remittance',
            displayName: 'Remittance Services',
            description: 'Money transfer and remittance management with multi-currency support, agent networks, and compliance tracking.',
            icon: 'pi-dollar',
            color: '#10B981'
        }
    ];

    constructor(
        private tenantService: TenantService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.loading = true;
        this.tenantService.getCurrentTenantProducts().subscribe({
            next: (response) => {
                this.products = response.products;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load products'
                });
                this.loading = false;
            }
        });
    }

    getSubscribedProducts(): any[] {
        return this.productDetails.filter(p => this.products.includes(p.name));
    }

    getAvailableProducts(): any[] {
        return this.productDetails.filter(p => !this.products.includes(p.name));
    }

    isSubscribed(productName: string): boolean {
        return this.products.includes(productName);
    }
}
