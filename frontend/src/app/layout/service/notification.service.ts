import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

export interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    link?: string;
    icon?: string;
    isRead: boolean;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private hubConnection?: signalR.HubConnection;
    private apiUrl = `${environment.apiBaseUrl}/Notification`;

    notifications = signal<Notification[]>([]);
    unreadCount = signal<number>(0);
    hasUnread = computed(() => this.unreadCount() > 0);

    constructor(private http: HttpClient) {}

    /** Start SignalR connection and load initial data */
    connect() {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        // Load existing notifications
        this.loadNotifications();

        // Setup SignalR
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.serverBaseUrl}/hubs/notifications`, {
                accessTokenFactory: () => localStorage.getItem('accessToken') || ''
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
            this.notifications.update(list => [notification, ...list]);
            this.unreadCount.update(c => c + 1);
        });

        this.hubConnection
            .start()
            .catch(err => console.error('SignalR connection error:', err));
    }

    /** Disconnect SignalR */
    disconnect() {
        this.hubConnection?.stop();
        this.notifications.set([]);
        this.unreadCount.set(0);
    }

    /** Load notifications from API */
    loadNotifications() {
        this.http.get<{ notifications: Notification[]; unreadCount: number }>(`${this.apiUrl}/list`)
            .subscribe({
                next: (res) => {
                    this.notifications.set(res.notifications);
                    this.unreadCount.set(res.unreadCount);
                },
                error: () => {}
            });
    }

    /** Mark a single notification as read */
    markAsRead(id: number) {
        this.http.post(`${this.apiUrl}/${id}/read`, {}).subscribe({
            next: () => {
                this.notifications.update(list =>
                    list.map(n => n.id === id ? { ...n, isRead: true } : n)
                );
                this.unreadCount.update(c => Math.max(0, c - 1));
            }
        });
    }

    /** Mark all notifications as read */
    markAllAsRead() {
        this.http.post(`${this.apiUrl}/read-all`, {}).subscribe({
            next: () => {
                this.notifications.update(list =>
                    list.map(n => ({ ...n, isRead: true }))
                );
                this.unreadCount.set(0);
            }
        });
    }

    /** Delete a notification (per-user soft delete) */
    deleteNotification(id: number) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe({
            next: () => {
                const wasUnread = this.notifications().find(n => n.id === id && !n.isRead);
                this.notifications.update(list => list.filter(n => n.id !== id));
                if (wasUnread) {
                    this.unreadCount.update(c => Math.max(0, c - 1));
                }
            }
        });
    }
}
