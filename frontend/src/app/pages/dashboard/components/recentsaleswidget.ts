import { Component, inject, signal } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductService } from '@/app/pages/service/product.service';

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, TranslateModule],
    template: `<div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">{{ 'dashboard.recentSales.title' | translate }}</div>
        <p-table [value]="products()" [paginator]="true" [rows]="5" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th>{{ 'common.view' | translate }}</th>
                    <th pSortableColumn="name">{{ 'common.details' | translate }} <p-sortIcon field="name"></p-sortIcon></th>
                    <th pSortableColumn="price">{{ 'dashboard.recentSales.amount' | translate }} <p-sortIcon field="price"></p-sortIcon></th>
                    <th>{{ 'common.view' | translate }}</th>
                </tr>
            </ng-template>
            <ng-template #body let-product>
                <tr>
                    <td style="width: 15%; min-width: 5rem;">
                        <img src="https://primefaces.org/cdn/primevue/images/product/{{ product.image }}" class="shadow-lg" alt="{{ product.name }}" width="50" />
                    </td>
                    <td style="width: 35%; min-width: 7rem;">{{ product.name }}</td>
                    <td style="width: 35%; min-width: 8rem;">{{ product.price | currency: 'USD' }}</td>
                    <td style="width: 15%;">
                        <button pButton pRipple type="button" icon="pi pi-search" class="p-button p-component p-button-text p-button-icon-only"></button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>`,
    providers: [ProductService]
})
export class RecentSalesWidget {
    products = signal<Product[]>([]);

    productService = inject(ProductService);

    ngOnInit() {
        this.productService.getProductsSmall().then((data) => (this.products.set(data)));
    }
}
