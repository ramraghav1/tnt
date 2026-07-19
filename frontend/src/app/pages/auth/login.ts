import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { Toast } from "primeng/toast";
import { environment } from '../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../../layout/component/language-selector/language-selector.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, Toast, TranslateModule, LanguageSelectorComponent],
    providers: [MessageService], 
    template: `
        <p-toast></p-toast> 
        
        <!-- Floating Configurator -->
        <app-floating-configurator />
        
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px; position: relative;">
                        
                        <!-- Language Selector inside login box - Top Right -->
                        <div style="position: absolute; top: 1rem; right: 1rem;">
                            <app-language-selector></app-language-selector>
                        </div>
                        
                        <div class="text-center mb-8">
                            <img src="/images/suryantra-logo.png" alt="Suryantra Technologies" style="height: 240px; width: auto;" class="mx-auto mb-4" />
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">{{ 'auth.welcome' | translate }}</div>
                            <span class="text-muted-color font-medium">{{ 'auth.loginToContinue' | translate }}</span>
                        </div>

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">{{ 'auth.email' | translate }}</label>
                            <input pInputText id="email1" type="text" [placeholder]="'auth.email' | translate" class="w-full md:w-120 mb-2" [(ngModel)]="email" />
                            <div *ngIf="submitted && !email" class="text-red-500 mb-2">{{ 'auth.emailRequired' | translate }}</div>
                            <div *ngIf="submitted && emailInvalid" class="text-red-500 mb-2">{{ 'validation.email' | translate }}</div>
                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">{{ 'auth.password' | translate }}</label>
                            <p-password id="password1" [(ngModel)]="password" [placeholder]="'auth.password' | translate" [toggleMask]="true" styleClass="mb-2" [fluid]="true" [feedback]="false"></p-password>
                            <div *ngIf="submitted && !password" class="text-red-500 mb-2">{{ 'auth.passwordRequired' | translate }}</div>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1">{{ 'auth.rememberMe' | translate }}</label>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">{{ 'auth.forgotPassword' | translate }}</span>
                            </div>
                            <p-button [label]="'auth.signIn' | translate" styleClass="w-full" (click)="onSignIn()"></p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    email: string = '';
    password: string = '';
    checked: boolean = false;
    submitted: boolean = false;
    emailInvalid: boolean = false;

    constructor(
        private router: Router,
        private cdr: ChangeDetectorRef,
        private http: HttpClient,
        private messageService: MessageService // <-- Inject here
    ) {}

    onSignIn() {
        this.submitted = true;
        this.emailInvalid = false;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.email && !emailPattern.test(this.email)) {
            this.emailInvalid = true;
        }
        this.cdr.detectChanges();
        if (this.email && !this.emailInvalid && this.password) {
            this.http.post<any>(`${environment.serverBaseUrl}/login/`, {
                username: this.email,
                password: this.password
            }).subscribe({
                next: (res) => {           
                    console.log('Login response:', res);       
                    if (res && res.accessToken) {
                        // Store auth data including tenant information
                        localStorage.setItem('accessToken', res.accessToken);
                        localStorage.setItem('refreshToken', res.refreshToken);
                        localStorage.setItem('organizationType', res.user?.organizationType || '');
                        localStorage.setItem('userInfo', JSON.stringify(res.user));
                        
                        // Store tenant information separately for easy access
                        if (res.user?.tenantId) {
                            localStorage.setItem('tenantId', res.user.tenantId.toString());
                        }
                        if (res.user?.tenantName) {
                            localStorage.setItem('tenantName', res.user.tenantName);
                        }
                        if (res.user?.tenantLogoUrl) {
                            localStorage.setItem('tenantLogoUrl', res.user.tenantLogoUrl);
                        } else {
                            localStorage.removeItem('tenantLogoUrl');
                        }

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Login Successful',
                            detail: `Welcome, ${res.user?.userFullName || ''}!`
                        });
                        setTimeout(() => {
                            const orgType = (res.user?.organizationType || '').toLowerCase();
                            let dashboardRoute = '/my-project-dashboard';
                            if (orgType === 'tourandtravels' || orgType === 'tourandtravel') {
                                dashboardRoute = '/tnt-dashboard';
                            } else if (orgType === 'clinic') {
                                dashboardRoute = '/clinic/dashboard';
                            }
                            this.router.navigate([dashboardRoute]);
                        }, 1000);
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Login Failed',
                            detail: res?.message || 'Invalid credentials'
                        });
                    }
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Login Failed',
                        detail: err?.error?.message || 'Invalid credentials'
                    });
                }
            });
        }
    }
}