import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { AppTopbar } from './app.topbar';
import { AppSidebar } from './app.sidebar';
import { AppFooter } from './app.footer';
import { LayoutService } from '@/app/layout/service/layout.service';
import { ItineraryBuilderDialogService } from '@/app/pages/itinerary-builder/itinerary-builder-dialog.service';
import { ItineraryBuilderComponent } from '@/app/pages/itinerary-builder/itinerary-builder.component';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, AppTopbar, AppSidebar, RouterModule, AppFooter, DialogModule, ItineraryBuilderComponent],
    template: `<div class="layout-wrapper" [ngClass]="containerClass()">
        <app-topbar></app-topbar>
        <app-sidebar></app-sidebar>
        <div class="layout-main-container">
            <div class="layout-main">
                <router-outlet></router-outlet>
            </div>
            <app-footer></app-footer>
        </div>
        <div class="layout-mask"></div>
    </div>

    <!-- ITINERARY BUILDER — GLOBAL FULL-SCREEN DIALOG (launched from any page/menu) -->
    <p-dialog [visible]="builderDialog.visible()" [modal]="true" [showHeader]="false" [closable]="false"
        [dismissableMask]="false" [closeOnEscape]="false" styleClass="builder-fullscreen-dialog"
        [style]="{ width: '100vw', height: '100dvh', maxWidth: '100vw', maxHeight: '100dvh', margin: '0' }">
        <ng-template #content>
            @if (builderDialog.visible()) {
            <app-itinerary-builder
                [dialogMode]="true"
                [embeddedItineraryId]="builderDialog.itineraryId()"
                [embeddedLeadId]="builderDialog.leadId()"
                (closed)="builderDialog.close()">
            </app-itinerary-builder>
            }
        </ng-template>
    </p-dialog>`,
    styles: [`
        ::ng-deep .builder-fullscreen-dialog { border-radius: 0; box-shadow: none; }
        ::ng-deep .builder-fullscreen-dialog .p-dialog-content { padding: 0; height: 100%; overflow: hidden; }
        ::ng-deep .builder-fullscreen-dialog .p-dialog-header { display: none; }
    `]
})
export class AppLayout {
    layoutService = inject(LayoutService);
    builderDialog = inject(ItineraryBuilderDialogService);

    constructor() {
        effect(() => {
            const state = this.layoutService.layoutState();
            if (state.mobileMenuActive) {
                document.body.classList.add('blocked-scroll');
            } else {
                document.body.classList.remove('blocked-scroll');
            }
        });
    }

    containerClass = computed(() => {
        const config = this.layoutService.layoutConfig();
        const state = this.layoutService.layoutState();
        return {
            'layout-overlay': config.menuMode === 'overlay',
            'layout-static': config.menuMode === 'static',
            'layout-static-inactive': state.staticMenuDesktopInactive && config.menuMode === 'static',
            'layout-overlay-active': state.overlayMenuActive,
            'layout-mobile-active': state.mobileMenuActive
        };
    })
}
