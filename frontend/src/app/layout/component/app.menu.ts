import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu {
    model: MenuItem[] = [];

    private allMenus: { [key: string]: MenuItem } = {};

    // Define which menu groups each org type can see
    private orgMenuMap: { [key: string]: string[] } = {
        'tourandtravels': ['TNT Home', 'Sales / CRM', 'Quotations', 'Bookings', 'Operations', 'Inventory', 'Inventory V2', 'Availability', 'B2B Agents', 'Finance', 'Documents', 'TNT Reports', 'User Management', 'Tenant'],
        'tourandtravel': ['TNT Home', 'Sales / CRM', 'Quotations', 'Bookings', 'Operations', 'Inventory', 'Inventory V2', 'Availability', 'B2B Agents', 'Finance', 'Documents', 'TNT Reports', 'User Management', 'Tenant'],
        'remittance': ['Home', 'Transaction', 'Reports', 'Remittance', 'User Management', 'Tenant'],
        'clinic': ['Home', 'Clinic', 'User Management', 'Tenant'],
    };

    ngOnInit() {
        this.allMenus = {
            'TNT Home': {
                label: 'Dashboard',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/tnt-dashboard'] },
                ]
            },
            'Sales / CRM': {
                label: 'Sales / CRM',
                items: [
                    { label: 'Leads', icon: 'pi pi-fw pi-user-plus', routerLink: ['/sales/leads'] },
                    { label: 'Follow-ups', icon: 'pi pi-fw pi-phone', routerLink: ['/sales/follow-ups'] },
                    { label: 'Proposals', icon: 'pi pi-fw pi-send', routerLink: ['/proposals'] },
                    { label: 'Customize Itinerary', icon: 'pi pi-fw pi-sliders-h', routerLink: ['/customize-itinerary-list'] },
                    { label: 'Itinerary Templates', icon: 'pi pi-fw pi-map', routerLink: ['/itinerary-list'] },
                    { label: 'Itinerary Builder', icon: 'pi pi-fw pi-objects-column', routerLink: ['/itinerary-builder'] },
                ]
            },
            'Quotations': {
                label: 'Quotations',
                items: [
                    { label: 'Create Quotation', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/quotations/create'] },
                    { label: 'Quotation List', icon: 'pi pi-fw pi-list', routerLink: ['/quotations'] },
                ]
            },
            'Bookings': {
                label: 'Bookings',
                items: [
                    { label: 'Booking List', icon: 'pi pi-fw pi-bookmark', routerLink: ['/my-bookings'] },
                    { label: 'Departures', icon: 'pi pi-fw pi-compass', routerLink: ['/departure-list'] },
                    { label: 'Rooming List', icon: 'pi pi-fw pi-th-large', routerLink: ['/bookings/rooming-list'] },
                    { label: 'Amendments', icon: 'pi pi-fw pi-pencil', routerLink: ['/bookings/amendments'] },
                ]
            },
            'Operations': {
                label: 'Operations',
                items: [
                    { label: 'Trip Dashboard', icon: 'pi pi-fw pi-objects-column', routerLink: ['/operations/trip-dashboard'] },
                    { label: 'Assign Services', icon: 'pi pi-fw pi-check-square', routerLink: ['/operations/assign-services'] },
                    { label: 'Daily Plan', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/operations/daily-plan'] },
                    { label: 'Arrival / Departure', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/operations/arrival-departure'] },
                ]
            },
            'Inventory': {
                label: 'Inventory',
                items: [
                    { label: 'Hotels', icon: 'pi pi-fw pi-building', routerLink: ['/inventory/hotels'] },
                    { label: 'Vehicles', icon: 'pi pi-fw pi-car', routerLink: ['/inventory/vehicles'] },
                    { label: 'Guides', icon: 'pi pi-fw pi-user', routerLink: ['/inventory/guides'] },
                    { label: 'Activities', icon: 'pi pi-fw pi-flag', routerLink: ['/inventory/activities'] },
                    { label: 'Contracts', icon: 'pi pi-fw pi-file-edit', routerLink: ['/inventory/contracts'] },
                    { label: 'Locations', icon: 'pi pi-fw pi-map-marker', routerLink: ['/inventory/locations'] },
                    { label: 'Seasons', icon: 'pi pi-fw pi-sun', routerLink: ['/inventory/seasons'] },
                    { label: 'Vehicle Routes', icon: 'pi pi-fw pi-directions', routerLink: ['/inventory/vehicle-routes'] },
                    { label: 'Currencies & Rates', icon: 'pi pi-fw pi-dollar', routerLink: ['/inventory/currencies'] },
                ]
            },
            'Inventory V2': {
                label: 'Inventory (New)',
                items: [
                    { label: 'Locations', icon: 'pi pi-fw pi-map-marker', routerLink: ['/inventory-v2/locations'] },
                    { label: 'Hotels', icon: 'pi pi-fw pi-building', routerLink: ['/inventory-v2/hotels'] },
                    { label: 'Vehicles', icon: 'pi pi-fw pi-car', routerLink: ['/inventory-v2/vehicles'] },
                    { label: 'Guides', icon: 'pi pi-fw pi-user', routerLink: ['/inventory-v2/guides'] },
                    { label: 'Activities', icon: 'pi pi-fw pi-flag', routerLink: ['/inventory-v2/activities'] },
                    { label: 'Seasons', icon: 'pi pi-fw pi-sun', routerLink: ['/inventory-v2/seasons'] },
                    { label: 'Vehicle Routes', icon: 'pi pi-fw pi-directions', routerLink: ['/inventory-v2/vehicle-routes'] },
                    { label: 'Currencies & Rates', icon: 'pi pi-fw pi-dollar', routerLink: ['/inventory-v2/currencies'] },
                ]
            },
            'Availability': {
                label: 'Availability',
                items: [
                    { label: 'Calendar', icon: 'pi pi-fw pi-calendar', routerLink: ['/availability/calendar'] },
                ]
            },
            'B2B Agents': {
                label: 'B2B Agents',
                items: [
                    { label: 'Agents', icon: 'pi pi-fw pi-users', routerLink: ['/b2b/agents'] },
                    { label: 'Pricing', icon: 'pi pi-fw pi-tag', routerLink: ['/b2b/pricing'] },
                    { label: 'Credit & Ledger', icon: 'pi pi-fw pi-wallet', routerLink: ['/b2b/credit-ledger'] },
                    { label: 'Agent Bookings', icon: 'pi pi-fw pi-book', routerLink: ['/b2b/bookings'] },
                ]
            },
            'Finance': {
                label: 'Finance',
                items: [
                    { label: 'Summary', icon: 'pi pi-fw pi-chart-pie', routerLink: ['/finance/summary'] },
                    { label: 'Invoices', icon: 'pi pi-fw pi-file', routerLink: ['/finance/invoices'] },
                    { label: 'Expenses', icon: 'pi pi-fw pi-money-bill', routerLink: ['/finance/expenses'] },
                    { label: 'Commissions', icon: 'pi pi-fw pi-percentage', routerLink: ['/finance/commissions'] },
                    { label: 'Refunds', icon: 'pi pi-fw pi-replay', routerLink: ['/finance/refunds'] },
                    { label: 'Supplier Payments', icon: 'pi pi-fw pi-credit-card', routerLink: ['/finance/supplier-payments'] },
                ]
            },
            'Documents': {
                label: 'Documents',
                items: [
                    { label: 'Vouchers', icon: 'pi pi-fw pi-ticket', routerLink: ['/documents/vouchers'] },
                    { label: 'Downloads', icon: 'pi pi-fw pi-download', routerLink: ['/documents/downloads'] },
                ]
            },
            'TNT Reports': {
                label: 'Reports',
                items: [
                    { label: 'Reports', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/reports'] },
                ]
            },
            'Home': {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/my-project-dashboard'] },
                    { label: 'Organization Setup', icon: 'pi pi-fw pi-building', routerLink: ['/organization-setup'] }
                ]
            },
            'Transaction': {
                label: 'Transaction',
                items: [
                    { label: 'Send Money', icon: 'pi pi-fw pi-money-bill', routerLink: ['/send-transaction'] },
                    { label: 'Payout Money', icon: 'pi pi-fw pi-credit-card', routerLink: ['/transaction/payout'] },
                    { label: 'Cancel Transaction', icon: 'pi pi-fw pi-minus', routerLink: ['/gettingstarted/features'] },
                ]
            },
            'Reports': {
                label: 'Reports',
                items: [
                    { label: 'Transaction Report', icon: 'pi pi-fw pi-book', routerLink: ['/transaction-report'] }
                ]
            },
            'Remittance': {
                label: 'Remittance',
                items: [
                    { label: 'Countries', icon: 'pi pi-fw pi-globe', routerLink: ['/remittance/countries'] },
                    { label: 'Payment Types', icon: 'pi pi-fw pi-credit-card', routerLink: ['/remittance/payment-types'] },
                    { label: 'Agents', icon: 'pi pi-fw pi-users', routerLink: ['/remittance/agents'] },
                    { label: 'Service Charges', icon: 'pi pi-fw pi-money-bill', routerLink: ['/remittance/service-charges'] },
                    { label: 'FX Rates', icon: 'pi pi-fw pi-chart-line', routerLink: ['/remittance/fx-rates'] },
                    { label: 'Agent Accounts', icon: 'pi pi-fw pi-wallet', routerLink: ['/remittance/agent-accounts'] },
                    { label: 'Configuration Types', icon: 'pi pi-fw pi-cog', routerLink: ['/remittance/configuration-types'] },
                    { label: 'Configurations', icon: 'pi pi-fw pi-list', routerLink: ['/remittance/configurations'] },
                    { label: 'Domestic Service Charges', icon: 'pi pi-fw pi-building', routerLink: ['/remittance/domestic-service-charges'] },
                    { label: 'Vouchers', icon: 'pi pi-fw pi-file-edit', routerLink: ['/remittance/vouchers'] },
                    { label: 'Statement of Account', icon: 'pi pi-fw pi-book', routerLink: ['/remittance/statement-of-account'] },
                ]
            },
            'Clinic': {
                label: 'Clinic',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-objects-column', routerLink: ['/clinic/dashboard'] },
                    { label: 'Tenants', icon: 'pi pi-fw pi-building', routerLink: ['/clinic/tenants'] },
                    { label: 'Practitioners', icon: 'pi pi-fw pi-id-card', routerLink: ['/clinic/practitioners'] },
                    { label: 'Patients', icon: 'pi pi-fw pi-users', routerLink: ['/clinic/patients'] },
                    { label: 'Services', icon: 'pi pi-fw pi-briefcase', routerLink: ['/clinic/services'] },
                    { label: 'Appointments', icon: 'pi pi-fw pi-calendar', routerLink: ['/clinic/appointments'] },
                    { label: 'Invoices', icon: 'pi pi-fw pi-file', routerLink: ['/clinic/invoices'] },
                ]
            },
            'Tenant': {
                label: 'Tenant Management',
                items: [
                    { label: 'Manage Tenants', icon: 'pi pi-fw pi-list', routerLink: ['/pages/tenant/manage'] },
                    { label: 'Settings', icon: 'pi pi-fw pi-cog', routerLink: ['/pages/tenant/settings'] },
                    { label: 'Products', icon: 'pi pi-fw pi-box', routerLink: ['/pages/tenant/products'] },
                    { label: 'Create Tenant', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/pages/tenant/create'] },
                ]
            },
            'User Management': {
                label: 'User Management',
                items: [
                    { label: 'Users', icon: 'pi pi-fw pi-users', routerLink: ['/pages/users'] },
                    { label: 'Roles', icon: 'pi pi-fw pi-shield', routerLink: ['/pages/roles'] },
                ]
            },
        };

        const tenantId = localStorage.getItem('tenantId');
        const orgType = (localStorage.getItem('organizationType') || '').toLowerCase();
        const allowedGroups = this.orgMenuMap[orgType];

        if (tenantId && allowedGroups) {
            // Tenant-scoped user — show only menus for this org type (excluding Home and Tenant)
            const filteredGroups = allowedGroups.filter(key => key !== 'Home' && key !== 'Tenant');
            this.model = filteredGroups
                .filter(key => this.allMenus[key])
                .map(key => this.allMenus[key]);
        } else {
            // No tenantId on token (admin/superuser) — show all menus
            this.model = Object.values(this.allMenus);
        }
    }
}
