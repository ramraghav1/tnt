import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '@/app/layout/service/layout.service';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationService, Notification } from '@/app/layout/service/notification.service';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { CurrencySelectorComponent } from './currency-selector/currency-selector.component';
import { CurrencyService } from '@/app/shared/services/currency.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, FormsModule, StyleClassModule, BadgeModule, OverlayBadgeModule, PopoverModule, ButtonModule, InputTextModule, LanguageSelectorComponent, CurrencySelectorComponent],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/tnt-dashboard">
                @if (tenantLogoUrl) {
                    <img [src]="tenantLogoUrl" [alt]="tenantName || 'Logo'" style="height: 56px; width: auto; margin-top: -2px; max-width: 180px; object-fit: contain;" />
                } @else if (tenantName) {
                    <span class="tenant-name-logo">{{ tenantName.toUpperCase() }}</span>
                } @else {
                    <img src="/images/suryantra-logo-transparent.svg" alt="Suryantra Technologies" style="height: 56px; width: auto; margin-top: -2px;" />
                }
            </a>
        </div>

        <!-- Booking Search -->
        <div class="topbar-booking-search">
            <div class="booking-search-wrap">
                <i class="pi pi-search booking-search-icon"></i>
                <input
                    pInputText
                    type="text"
                    [(ngModel)]="bookingSearchRef"
                    placeholder="Booking # ..."
                    class="booking-search-input"
                    (keyup.enter)="searchBooking()"
                />
                <button *ngIf="bookingSearchRef" type="button" class="booking-search-clear" (click)="bookingSearchRef = ''">
                    <i class="pi pi-times"></i>
                </button>
            </div>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">

                <!-- Language Selector -->
                <app-language-selector></app-language-selector>

                <!-- Print Page -->
                <button type="button" class="layout-topbar-action" (click)="printPage()" title="Print / Save as PDF">
                    <i class="pi pi-print"></i>
                </button>

                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <!-- Notification Bell -->
                    <div class="relative">
                        <button type="button" class="layout-topbar-action" (click)="toggleNotifications(notifPopover, $event)">
                            @if (notificationService.unreadCount() > 0) {
                                <p-overlaybadge [value]="notificationService.unreadCount().toString()" severity="danger">
                                    <i class="pi pi-bell" style="font-size: 1.25rem"></i>
                                </p-overlaybadge>
                            } @else {
                                <i class="pi pi-bell" style="font-size: 1.25rem"></i>
                            }
                            <span>Notifications</span>
                        </button>

                        <p-popover #notifPopover [style]="{ width: '420px' }" styleClass="notification-popover">
                            <!-- Header -->
                            <div class="flex items-center justify-between mb-4">
                                <span class="font-semibold text-xl">Notifications</span>
                                @if (notificationService.hasUnread()) {
                                    <button pButton type="button" label="Mark all read" class="p-button-text p-button-sm p-button-plain" icon="pi pi-check-circle" (click)="notificationService.markAllAsRead()"></button>
                                }
                            </div>

                            <!-- Notification List -->
                            <div style="max-height: 400px; overflow-y: auto; margin: 0 -1.25rem; padding: 0 1.25rem;">
                                @for (notif of notificationService.notifications(); track notif.id) {
                                    <div class="flex items-center py-3 cursor-pointer notification-item"
                                         [class.border-b]="!$last"
                                         [class.border-surface]="!$last"
                                         [class.notification-unread]="!notif.isRead"
                                         (click)="onNotificationClick(notif)">
                                        <div class="w-12 h-12 flex items-center justify-center rounded-full mr-4 shrink-0"
                                             [ngClass]="getNotifIconBgClass(notif.type)">
                                            <i [ngClass]="['pi', getNotifIcon(notif), 'text-xl!', getNotifIconColorClass(notif.type)]"></i>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <span class="text-surface-900 dark:text-surface-0 font-medium leading-normal block">{{ notif.title }}</span>
                                            <span class="text-surface-700 dark:text-surface-100 text-sm leading-normal block mt-0.5">{{ notif.message }}</span>
                                            <span class="text-muted-color text-xs block mt-1">{{ getTimeAgo(notif.createdAt) }}</span>
                                        </div>
                                        <button class="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors ml-2"
                                                (click)="onDeleteNotification($event, notif.id)" title="Remove">
                                            <i class="pi pi-times text-sm text-muted-color hover:text-red-500"></i>
                                        </button>
                                    </div>
                                } @empty {
                                    <div class="py-8 text-center text-muted-color">
                                        <i class="pi pi-bell-slash text-4xl mb-3 block text-surface-400"></i>
                                        <span class="block text-lg font-medium">No notifications</span>
                                        <span class="block text-sm mt-1">You're all caught up!</span>
                                    </div>
                                }
                            </div>
                        </p-popover>
                    </div>

                    <button type="button" class="layout-topbar-action" (click)="profilePopover.toggle($event)">
                        <i class="pi pi-user"></i>
                        <span>{{ userFullName || 'Profile' }}</span>
                    </button>
                    <p-popover #profilePopover 
                        [style]="{ minWidth: '320px' }" 
                        styleClass="profile-popover" 
                        appendTo="body"
                        [autoZIndex]="true"
                        [baseZIndex]="10000">
                        <div class="profile-card">
                            <!-- User Avatar & Info Section -->
                            <div class="user-info-section">
                                <div class="user-avatar">
                                    <i class="pi pi-user"></i>
                                </div>
                                <div class="user-details">
                                    <div class="user-name">{{ userFullName || 'User' }}</div>
                                    @if (userEmail) {
                                        <div class="user-email">{{ userEmail }}</div>
                                    }
                                </div>
                            </div>

                            <!-- Tenant Info Badge -->
                            @if (tenantName) {
                                <div class="tenant-badge">
                                    <div class="tenant-icon">
                                        <i class="pi pi-building"></i>
                                    </div>
                                    <div class="tenant-info">
                                        <div class="tenant-label">Organization</div>
                                        <div class="tenant-name">{{ tenantName }}</div>
                                    </div>
                                </div>
                            }

                            <!-- Divider -->
                            <div class="profile-divider"></div>

                            <!-- Action Buttons -->
                            <div class="profile-actions">
                                <button pButton 
                                    class="p-button-text profile-action-btn logout-btn" 
                                    (click)="logout(); profilePopover.hide()">
                                    <i class="pi pi-sign-out"></i>
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </p-popover>
                </div>
            </div>
        </div>
    </div>`,
    styles: [`
        .topbar-booking-search {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 1rem;
        }

        .booking-search-wrap {
            position: relative;
            display: flex;
            align-items: center;
            max-width: 220px;
            width: 100%;
        }

        .booking-search-icon {
            position: absolute;
            left: 0.6rem;
            color: var(--p-surface-400);
            font-size: 0.8rem;
            pointer-events: none;
        }

        .booking-search-input {
            width: 100%;
            padding: 0.4rem 2rem 0.4rem 1.8rem !important;
            font-size: 0.82rem !important;
            height: 2rem !important;
            border-radius: 20px !important;
        }

        .booking-search-clear {
            position: absolute;
            right: 0.4rem;
            background: none;
            border: none;
            cursor: pointer;
            color: var(--p-surface-400);
            padding: 0.15rem;
            display: flex;
            align-items: center;
            font-size: 0.72rem;
        }

        .booking-search-clear:hover { color: var(--p-surface-700); }

        :host ::ng-deep .notification-popover {
            .p-popover-content {
                padding: 1.25rem;
            }
        }

        .notification-item {
            transition: background-color 0.2s;
            border-radius: var(--content-border-radius);
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            margin: 0 -0.5rem;
        }

        .notification-item:hover {
            background-color: var(--surface-hover);
        }

        .notification-unread {
            position: relative;
            background-color: var(--p-primary-50, rgba(var(--primary-500), 0.05));
        }

        .notification-unread::before {
            content: '';
            position: absolute;
            left: 0px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 60%;
            border-radius: 0 4px 4px 0;
            background-color: var(--primary-color);
        }

        :host ::ng-deep .layout-topbar-action .p-overlaybadge .p-badge {
            font-size: 0.625rem;
            min-width: 1.15rem;
            height: 1.15rem;
            line-height: 1.15rem;
        }

        /* Profile Popover Styles */
        :host ::ng-deep .profile-popover {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
            border-radius: 12px !important;
        }

        :host ::ng-deep .profile-popover .p-popover-content {
            padding: 0;
            border-radius: 12px;
            overflow: hidden;
        }

        :host ::ng-deep .profile-card {
            background: var(--surface-0);
        }

        /* User Info Section */
        :host ::ng-deep .user-info-section {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
        }

        :host ::ng-deep .user-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        :host ::ng-deep .user-avatar i {
            font-size: 1.75rem;
            color: white;
        }

        :host ::ng-deep .user-details {
            flex: 1;
            min-width: 0;
        }

        :host ::ng-deep .user-name {
            font-weight: 600;
            font-size: 1.125rem;
            color: white;
            margin-bottom: 0.25rem;
            line-height: 1.4;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        :host ::ng-deep .user-email {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.9);
            word-break: break-word;
            line-height: 1.4;
        }

        /* Tenant name as logo placeholder */
        .tenant-name-logo {
            font-size: 1.35rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-400, var(--primary-color)) 50%, var(--primary-700, var(--primary-color)) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1;
            white-space: nowrap;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-block;
        }

        /* Tenant Badge */
        :host ::ng-deep .tenant-badge {            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.5rem;
            background: var(--surface-50);
            border-left: 3px solid var(--primary-500);
        }

        :host ::ng-deep .tenant-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: var(--primary-50);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        :host ::ng-deep .tenant-icon i {
            font-size: 1.25rem;
            color: var(--primary-500);
        }

        :host ::ng-deep .tenant-info {
            flex: 1;
            min-width: 0;
        }

        :host ::ng-deep .tenant-label {
            font-size: 0.75rem;
            color: var(--text-color-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        :host ::ng-deep .tenant-name {
            font-size: 0.938rem;
            color: var(--primary-color);
            font-weight: 600;
            word-break: break-word;
        }

        /* Divider */
        :host ::ng-deep .profile-divider {
            height: 1px;
            background: var(--surface-border);
            margin: 0.5rem 0;
        }

        /* Action Buttons */
        :host ::ng-deep .profile-actions {
            padding: 0.75rem;
        }

        :host ::ng-deep .profile-action-btn {
            width: 100%;
            justify-content: flex-start;
            gap: 0.75rem;
            padding: 0.75rem 1rem !important;
            border-radius: 8px !important;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        :host ::ng-deep .logout-btn {
            color: var(--red-500) !important;
        }

        :host ::ng-deep .logout-btn:hover {
            background: var(--red-50) !important;
            color: var(--red-600) !important;
        }

        :host ::ng-deep .logout-btn i {
            font-size: 1.125rem;
        }

        /* Dark Mode */
        :host-context(.app-dark) ::ng-deep .profile-card {
            background: var(--surface-900);
        }

        :host-context(.app-dark) ::ng-deep .tenant-badge {
            background: var(--surface-800);
            border-left-color: var(--primary-400);
        }

        :host-context(.app-dark) ::ng-deep .tenant-icon {
            background: var(--surface-700);
        }

        :host-context(.app-dark) ::ng-deep .tenant-icon i {
            color: var(--primary-400);
        }

        :host-context(.app-dark) ::ng-deep .logout-btn:hover {
            background: rgba(239, 68, 68, 0.1) !important;
        }
    `]
})
export class AppTopbar {
    userFullName: string = '';
    userEmail: string = '';
    tenantName: string = '';
    tenantLogoUrl: string = '';
    bookingSearchRef: string = '';
    layoutService = inject(LayoutService);
    notificationService = inject(NotificationService);
    private router = inject(Router);
    private http = inject(HttpClient);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            this.userFullName = userInfo?.userFullName || '';
            this.userEmail = userInfo?.emailAddress || '';
            this.tenantName = userInfo?.tenantName || localStorage.getItem('tenantName') || '';
            this.tenantLogoUrl = userInfo?.tenantLogoUrl || localStorage.getItem('tenantLogoUrl') || '';
        } catch { }

        // Connect to notifications if logged in
        if (localStorage.getItem('accessToken')) {
            this.notificationService.connect();
        }
    }

    toggleNotifications(popover: Popover, event: Event) {
        event.stopPropagation();
        this.notificationService.loadNotifications();
        popover.toggle(event);
    }

    searchBooking() {
        const ref = this.bookingSearchRef.trim();
        if (!ref) return;
        this.router.navigate(['/booking-view', ref]);
        this.bookingSearchRef = '';
    }

    printPage() {
        window.print();
    }

    onNotificationClick(notif: Notification) {
        if (!notif.isRead) {
            this.notificationService.markAsRead(notif.id);
        }
        if (notif.link) {
            this.router.navigate([notif.link]);
        }
    }

    onDeleteNotification(event: Event, id: number) {
        event.stopPropagation();
        this.notificationService.deleteNotification(id);
    }

    /** Return Sakai-style icon based on notification type */
    getNotifIcon(notif: Notification): string {
        if (notif.icon) return notif.icon;
        const iconMap: Record<string, string> = {
            'transaction': 'pi-dollar',
            'payment': 'pi-dollar',
            'booking': 'pi-calendar',
            'info': 'pi-info-circle',
            'warning': 'pi-exclamation-triangle',
            'success': 'pi-check-circle',
            'user': 'pi-user',
            'message': 'pi-envelope',
            'system': 'pi-cog',
            'reminder': 'pi-clock',
        };
        return iconMap[notif.type?.toLowerCase()] || 'pi-bell';
    }

    /** Background class for the circular icon container */
    getNotifIconBgClass(type: string): string {
        const bgMap: Record<string, string> = {
            'transaction': 'bg-blue-100 dark:bg-blue-400/10',
            'payment': 'bg-blue-100 dark:bg-blue-400/10',
            'booking': 'bg-orange-100 dark:bg-orange-400/10',
            'info': 'bg-cyan-100 dark:bg-cyan-400/10',
            'warning': 'bg-orange-100 dark:bg-orange-400/10',
            'success': 'bg-green-100 dark:bg-green-400/10',
            'user': 'bg-purple-100 dark:bg-purple-400/10',
            'message': 'bg-indigo-100 dark:bg-indigo-400/10',
            'system': 'bg-gray-100 dark:bg-gray-400/10',
            'reminder': 'bg-pink-100 dark:bg-pink-400/10',
        };
        return bgMap[type?.toLowerCase()] || 'bg-primary-100 dark:bg-primary-400/10';
    }

    /** Text color class for the icon */
    getNotifIconColorClass(type: string): string {
        const colorMap: Record<string, string> = {
            'transaction': 'text-blue-500',
            'payment': 'text-blue-500',
            'booking': 'text-orange-500',
            'info': 'text-cyan-500',
            'warning': 'text-orange-500',
            'success': 'text-green-500',
            'user': 'text-purple-500',
            'message': 'text-indigo-500',
            'system': 'text-gray-500',
            'reminder': 'text-pink-500',
        };
        return colorMap[type?.toLowerCase()] || 'text-primary';
    }

    /** Human-readable relative time */
    getTimeAgo(dateStr: string): string {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        if (diffHr < 24) return `${diffHr} hr ago`;
        if (diffDay === 1) return 'Yesterday';
        if (diffDay < 7) return `${diffDay} days ago`;
        return date.toLocaleDateString();
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    logout() {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
            this.http.post(`${environment.serverBaseUrl}/api/Login/logout`, { refreshToken })
                .subscribe({
                    next: () => this.clearAndRedirect(),
                    error: () => this.clearAndRedirect()
                });
        } else {
            this.clearAndRedirect();
        }
    }

    private clearAndRedirect() {
        this.notificationService.disconnect();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('organizationType');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('tenantId');
        localStorage.removeItem('tenantName');
        localStorage.removeItem('tenantLogoUrl');
        this.router.navigate(['/login']);
        this.cdr.detectChanges();
    }
}
