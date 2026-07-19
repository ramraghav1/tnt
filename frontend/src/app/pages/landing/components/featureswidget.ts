import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div id="features" class="relative py-20 px-6 lg:px-20 mx-0 lg:mx-0 overflow-hidden">
        <!-- Subtle background gradient -->
        <div class="absolute inset-0 -z-10" style="
            background: linear-gradient(180deg, transparent 0%, rgba(var(--primary-rgb, 99,102,241), 0.03) 30%, rgba(var(--primary-rgb, 99,102,241), 0.05) 70%, transparent 100%);
        "></div>

        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-16">
                <span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                      style="background: rgba(var(--primary-rgb, 99,102,241), 0.1); color: var(--primary-color)">
                    Our Products
                </span>
                <div class="text-surface-900 dark:text-surface-0 font-bold mb-4 text-4xl">Solutions Built for Your Industry</div>
                <span class="text-muted-color text-xl max-w-3xl mx-auto block">Purpose-built solutions designed to streamline operations and drive growth — plus custom software built to your spec.</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                <!-- Remittance -->
                <div class="rounded-2xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 group border bg-surface-0 dark:bg-surface-800"
                     style="border-color: rgba(34,197,94,0.2); box-shadow: 0 4px 24px rgba(0,0,0,0.04)">
                    <div class="flex items-center justify-center mb-6 rounded-2xl transition-transform duration-500 group-hover:scale-110" style="width: 72px; height: 72px; background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))">
                        <i class="pi pi-money-bill text-4xl! text-green-600"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-3">Remittance System</h3>
                    <p class="text-surface-600 dark:text-surface-200 text-lg mb-6 leading-relaxed">
                        End-to-end money transfer management with agent networks, compliance tracking, and real-time exchange rates.
                    </p>
                    <ul class="list-none p-0 m-0 flex flex-col gap-3 mt-auto">
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-green-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Multi-currency transaction processing</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-green-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Agent &amp; branch management</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-green-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Compliance &amp; KYC tracking</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-green-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Real-time reports &amp; analytics</span>
                        </li>
                    </ul>
                </div>

                <!-- Clinic -->
                <div class="rounded-2xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 group border bg-surface-0 dark:bg-surface-800"
                     style="border-color: rgba(59,130,246,0.2); box-shadow: 0 4px 24px rgba(0,0,0,0.04)">
                    <div class="flex items-center justify-center mb-6 rounded-2xl transition-transform duration-500 group-hover:scale-110" style="width: 72px; height: 72px; background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))">
                        <i class="pi pi-heart text-4xl! text-blue-500"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-3">Clinic Management</h3>
                    <p class="text-surface-600 dark:text-surface-200 text-lg mb-6 leading-relaxed">
                        Complete clinic appointment and patient management system to streamline healthcare operations.
                    </p>
                    <ul class="list-none p-0 m-0 flex flex-col gap-3 mt-auto">
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-blue-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Online appointment scheduling</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-blue-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Patient records &amp; history</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-blue-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Doctor &amp; staff management</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-blue-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Billing &amp; prescription tracking</span>
                        </li>
                    </ul>
                </div>

                <!-- Tour and Travel -->
                <div class="rounded-2xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 group border bg-surface-0 dark:bg-surface-800"
                     style="border-color: rgba(168,85,247,0.2); box-shadow: 0 4px 24px rgba(0,0,0,0.04)">
                    <div class="flex items-center justify-center mb-6 rounded-2xl transition-transform duration-500 group-hover:scale-110" style="width: 72px; height: 72px; background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))">
                        <i class="pi pi-map text-4xl! text-purple-500"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-3">Tour &amp; Travel</h3>
                    <p class="text-surface-600 dark:text-surface-200 text-lg mb-6 leading-relaxed">
                        Build and manage travel itineraries, bookings, and customer experiences from start to finish.
                    </p>
                    <ul class="list-none p-0 m-0 flex flex-col gap-3 mt-auto">
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-purple-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Day-by-day itinerary builder</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-purple-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Booking &amp; payment management</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-purple-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Meal &amp; activity customization</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-purple-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Dashboard with analytics</span>
                        </li>
                    </ul>
                </div>
                <!-- Custom Software -->
                <div class="rounded-2xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 group border bg-surface-0 dark:bg-surface-800"
                     style="border-color: rgba(245,158,11,0.2); box-shadow: 0 4px 24px rgba(0,0,0,0.04)">
                    <div class="flex items-center justify-center mb-6 rounded-2xl transition-transform duration-500 group-hover:scale-110" style="width: 72px; height: 72px; background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))">
                        <i class="pi pi-code text-4xl! text-amber-500"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-3">Custom Software</h3>
                    <p class="text-surface-600 dark:text-surface-200 text-lg mb-6 leading-relaxed">
                        Got a unique idea? We build tailor-made software solutions with a working demo delivered in just 30 days.
                    </p>
                    <div class="rounded-xl p-4 mb-6" style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.15)">
                        <div class="flex items-center gap-2 mb-1">
                            <i class="pi pi-clock text-amber-500"></i>
                            <span class="text-surface-900 dark:text-surface-0 font-bold">30-Day Demo Guarantee</span>
                        </div>
                        <span class="text-surface-600 dark:text-surface-300 text-sm">From ideation to a working prototype — fast.</span>
                    </div>
                    <ul class="list-none p-0 m-0 flex flex-col gap-3 mt-auto">
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-amber-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Requirements analysis &amp; scoping</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-amber-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Rapid prototyping &amp; MVP development</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-amber-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Modern tech stack &amp; scalable architecture</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <i class="pi pi-check-circle text-amber-500"></i>
                            <span class="text-surface-700 dark:text-surface-100">Full-cycle development &amp; deployment</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    `,
    styles: ``
})
export class FeaturesWidget {}
