import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'pricing-widget',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, SelectModule, MessageModule],
    template: `
        <div id="demo" class="relative py-20 px-6 lg:px-20 my-0 mx-0 overflow-hidden">
            <!-- Background gradient -->
            <div class="absolute inset-0 -z-10" style="
                background:
                    radial-gradient(ellipse 80% 60% at 20% 80%, rgba(var(--primary-rgb, 99,102,241), 0.08), transparent),
                    radial-gradient(ellipse 60% 50% at 80% 20%, rgba(168,85,247, 0.05), transparent),
                    linear-gradient(180deg, rgba(var(--primary-rgb, 99,102,241), 0.02) 0%, rgba(var(--primary-rgb, 99,102,241), 0.06) 50%, transparent 100%);
            "></div>

            <!-- Dot pattern -->
            <div class="absolute inset-0 -z-10 opacity-[0.025]" style="
                background-image: radial-gradient(rgba(var(--primary-rgb, 99,102,241),1) 1px, transparent 1px);
                background-size: 24px 24px;
            "></div>

            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-14">
                    <span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                          style="background: rgba(var(--primary-rgb, 99,102,241), 0.1); color: var(--primary-color)">
                        Get Started
                    </span>
                    <h2 class="text-4xl font-bold text-surface-900 dark:text-surface-0 mb-3">Request a Demo</h2>
                    <p class="text-xl text-surface-600 dark:text-surface-300 max-w-2xl mx-auto">See how Suryantra can transform your business operations.</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <!-- Left: Info -->
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-6 mt-4">
                            <div class="flex items-start gap-4 p-5 rounded-2xl transition-all duration-300" style="background: rgba(var(--primary-rgb, 99,102,241), 0.04); border: 1px solid rgba(var(--primary-rgb, 99,102,241), 0.08)">
                                <div class="flex items-center justify-center rounded-2xl shrink-0" style="width: 52px; height: 52px; background: linear-gradient(135deg, rgba(var(--primary-rgb, 99,102,241), 0.2), rgba(var(--primary-rgb, 99,102,241), 0.05))">
                                    <i class="pi pi-video text-xl!" style="color: var(--primary-color)"></i>
                                </div>
                                <div>
                                    <h4 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-1">Live Product Walkthrough</h4>
                                    <p class="text-surface-600 dark:text-surface-300">Get a hands-on tour of the features that matter to your business.</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-4 p-5 rounded-2xl transition-all duration-300" style="background: rgba(var(--primary-rgb, 99,102,241), 0.04); border: 1px solid rgba(var(--primary-rgb, 99,102,241), 0.08)">
                                <div class="flex items-center justify-center rounded-2xl shrink-0" style="width: 52px; height: 52px; background: linear-gradient(135deg, rgba(var(--primary-rgb, 99,102,241), 0.2), rgba(var(--primary-rgb, 99,102,241), 0.05))">
                                    <i class="pi pi-comments text-xl!" style="color: var(--primary-color)"></i>
                                </div>
                                <div>
                                    <h4 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-1">Expert Consultation</h4>
                                    <p class="text-surface-600 dark:text-surface-300">Discuss your requirements with our solution architects.</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-4 p-5 rounded-2xl transition-all duration-300" style="background: rgba(var(--primary-rgb, 99,102,241), 0.04); border: 1px solid rgba(var(--primary-rgb, 99,102,241), 0.08)">
                                <div class="flex items-center justify-center rounded-2xl shrink-0" style="width: 52px; height: 52px; background: linear-gradient(135deg, rgba(var(--primary-rgb, 99,102,241), 0.2), rgba(var(--primary-rgb, 99,102,241), 0.05))">
                                    <i class="pi pi-check-square text-xl!" style="color: var(--primary-color)"></i>
                                </div>
                                <div>
                                    <h4 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-1">No Commitment Required</h4>
                                    <p class="text-surface-600 dark:text-surface-300">Completely free, no strings attached. See if we are the right fit.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Form -->
                    <div class="rounded-2xl p-8 bg-surface-0 dark:bg-surface-800" style="
                        border: 1px solid rgba(var(--primary-rgb, 99,102,241), 0.15);
                        box-shadow: 0 8px 32px rgba(0,0,0,0.06);
                    ">
                    @if (successMessage) {
                        <p-message severity="success" [text]="successMessage" class="w-full mb-4" />
                    }
                    @if (errorMessage) {
                        <p-message severity="error" [text]="errorMessage" class="w-full mb-4" />
                    }

                    <div class="flex flex-col gap-5">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-surface-900 dark:text-surface-0">Full Name *</label>
                            <input pInputText [(ngModel)]="form.fullName" placeholder="Your full name" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-surface-900 dark:text-surface-0">Email *</label>
                            <input pInputText [(ngModel)]="form.email" type="email" placeholder="you@company.com" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-surface-900 dark:text-surface-0">Phone</label>
                            <input pInputText [(ngModel)]="form.phone" placeholder="+977 98XXXXXXXX" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-surface-900 dark:text-surface-0">Company Name</label>
                            <input pInputText [(ngModel)]="form.companyName" placeholder="Your company" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-surface-900 dark:text-surface-0">Product Interest *</label>
                            <p-select
                                [(ngModel)]="form.productInterest"
                                [options]="productOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Select a product"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-surface-900 dark:text-surface-0">Message</label>
                            <textarea pTextarea [(ngModel)]="form.message" rows="4" placeholder="Tell us about your needs..."></textarea>
                        </div>

                        <button
                            pButton
                            [rounded]="true"
                            type="button"
                            label="Submit Request"
                            icon="pi pi-send"
                            class="w-full"
                            [loading]="submitting"
                            (click)="submitRequest()"
                        ></button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    `
})
export class PricingWidget {
    form = {
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        productInterest: '',
        message: ''
    };

    productOptions = [
        { label: 'Remittance System', value: 'remittance' },
        { label: 'Clinic Management', value: 'clinic' },
        { label: 'Tour & Travel', value: 'tourandtravels' },
        { label: 'Custom Software (30-Day Demo)', value: 'custom_software' },
        { label: 'All Products', value: 'all' }
    ];

    submitting = false;
    successMessage = '';
    errorMessage = '';

    constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

    submitRequest() {
        this.successMessage = '';
        this.errorMessage = '';

        if (!this.form.fullName || !this.form.email || !this.form.productInterest) {
            this.errorMessage = 'Please fill in all required fields.';
            this.cdr.detectChanges();
            return;
        }

        this.submitting = true;
        this.cdr.detectChanges();

        this.http.post(`${environment.apiBaseUrl}/DemoRequest/submit`, this.form)
            .subscribe({
                next: () => {
                    this.successMessage = 'Thank you! Your demo request has been submitted. We will contact you soon.';
                    this.form = { fullName: '', email: '', phone: '', companyName: '', productInterest: '', message: '' };
                    this.submitting = false;
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.errorMessage = 'Something went wrong. Please try again later.';
                    this.submitting = false;
                    this.cdr.detectChanges();
                }
            });
    }
}
