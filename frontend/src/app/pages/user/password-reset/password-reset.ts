import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { UserManagementService } from '../user-management.service';

@Component({
    selector: 'app-password-reset',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, InputTextModule, PasswordModule,
        CardModule, MessageModule, ToastModule
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        
        <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
            <div class="w-full max-w-md px-4">
                <p-card>
                    <ng-template pTemplate="header">
                        <div class="text-center pt-6 pb-2">
                            <i class="pi pi-lock text-6xl text-primary mb-4"></i>
                            <h2 class="text-2xl font-bold mb-2">Reset Your Password</h2>
                            <p class="text-gray-600 text-sm">Enter your new password below</p>
                        </div>
                    </ng-template>

                    <div *ngIf="!tokenValid" class="text-center py-4">
                        <p-message severity="error" text="Invalid or expired reset token"></p-message>
                        <p class="mt-4 text-sm text-gray-600">Please request a new password reset link.</p>
                    </div>

                    <div *ngIf="tokenValid && !resetSuccess">
                        <div class="flex flex-col gap-4">
                            <div class="flex flex-col gap-2">
                                <label for="newPassword" class="font-semibold">New Password</label>
                                <p-password 
                                    [(ngModel)]="newPassword" 
                                    [toggleMask]="true" 
                                    [feedback]="true"
                                    promptLabel="Choose a password"
                                    weakLabel="Too simple"
                                    mediumLabel="Average complexity"
                                    strongLabel="Complex password"
                                    styleClass="w-full"
                                    inputStyleClass="w-full">
                                </p-password>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label for="confirmPassword" class="font-semibold">Confirm Password</label>
                                <p-password 
                                    [(ngModel)]="confirmPassword" 
                                    [toggleMask]="true" 
                                    [feedback]="false"
                                    styleClass="w-full"
                                    inputStyleClass="w-full">
                                </p-password>
                            </div>

                            <button 
                                pButton 
                                label="Reset Password" 
                                icon="pi pi-check" 
                                class="w-full"
                                [loading]="loading"
                                [disabled]="!newPassword || !confirmPassword || newPassword !== confirmPassword"
                                (click)="submitReset()">
                            </button>

                            <p class="text-sm text-gray-600 text-center mt-2">
                                Passwords must match and be at least 8 characters long.
                            </p>
                        </div>
                    </div>

                    <div *ngIf="resetSuccess" class="text-center py-4">
                        <i class="pi pi-check-circle text-6xl text-green-500 mb-4"></i>
                        <h3 class="text-xl font-semibold mb-2">Password Reset Successful!</h3>
                        <p class="text-gray-600 mb-4">Your password has been changed successfully.</p>
                        <button pButton label="Go to Login" icon="pi pi-sign-in" (click)="goToLogin()"></button>
                    </div>
                </p-card>

                <div class="text-center mt-4">
                    <a routerLink="/auth/login" class="text-white hover:underline">Back to Login</a>
                </div>
            </div>
        </div>
    `
})
export class PasswordReset implements OnInit {
    token: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
    loading = false;
    tokenValid = true;
    resetSuccess = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userManagementService: UserManagementService,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        // Get token from query params
        this.route.queryParams.subscribe(params => {
            this.token = params['token'] || '';
            if (!this.token) {
                this.tokenValid = false;
            }
        });
    }

    submitReset() {
        if (!this.newPassword || !this.confirmPassword) {
            this.messageService.add({ 
                severity: 'warn', 
                summary: 'Validation', 
                detail: 'Please fill in both password fields' 
            });
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.messageService.add({ 
                severity: 'warn', 
                summary: 'Validation', 
                detail: 'Passwords do not match' 
            });
            return;
        }

        if (this.newPassword.length < 8) {
            this.messageService.add({ 
                severity: 'warn', 
                summary: 'Validation', 
                detail: 'Password must be at least 8 characters long' 
            });
            return;
        }

        this.loading = true;
        this.userManagementService.resetPassword({
            token: this.token,
            newPassword: this.newPassword
        }).subscribe({
            next: (response) => {
                this.loading = false;
                if (response.success) {
                    this.resetSuccess = true;
                    this.messageService.add({ 
                        severity: 'success', 
                        summary: 'Success', 
                        detail: 'Password reset successfully' 
                    });
                } else {
                    this.tokenValid = false;
                    this.messageService.add({ 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: response.message || 'Invalid or expired token' 
                    });
                }
            },
            error: (err) => {
                this.loading = false;
                console.error('Password reset failed', err);
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: err.error?.message || 'Failed to reset password' 
                });
            }
        });
    }

    goToLogin() {
        this.router.navigate(['/auth/login']);
    }
}
