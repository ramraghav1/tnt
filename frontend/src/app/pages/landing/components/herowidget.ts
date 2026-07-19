import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Router } from '@angular/router';

@Component({
    selector: 'hero-widget',
    imports: [ButtonModule, RippleModule],
    template: `
        <div id="hero" class="relative overflow-hidden flex flex-col pt-6 px-6 lg:px-20" style="min-height: 90vh">
            <!-- Animated gradient background -->
            <div class="absolute inset-0 -z-10" style="
                background:
                    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(var(--primary-rgb, 99,102,241), 0.15), transparent),
                    radial-gradient(ellipse 60% 60% at 0% 50%, rgba(var(--primary-rgb, 99,102,241), 0.08), transparent),
                    radial-gradient(ellipse 60% 60% at 100% 50%, rgba(168,85,247, 0.06), transparent),
                    radial-gradient(ellipse 80% 50% at 50% 100%, rgba(59,130,246, 0.06), transparent);
            "></div>

            <!-- Grid pattern overlay -->
            <div class="absolute inset-0 -z-10 opacity-[0.03]" style="
                background-image: linear-gradient(rgba(var(--primary-rgb, 99,102,241),1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(var(--primary-rgb, 99,102,241),1) 1px, transparent 1px);
                background-size: 60px 60px;
            "></div>

            <!-- Floating decorative orbs -->
            <div class="absolute -z-10 rounded-full" style="
                width: 400px; height: 400px; top: -100px; right: -100px;
                background: radial-gradient(circle, rgba(var(--primary-rgb, 99,102,241), 0.12), transparent 70%);
                filter: blur(40px);
                animation: float1 8s ease-in-out infinite;
            "></div>
            <div class="absolute -z-10 rounded-full" style="
                width: 300px; height: 300px; bottom: 50px; left: -80px;
                background: radial-gradient(circle, rgba(168,85,247, 0.1), transparent 70%);
                filter: blur(40px);
                animation: float2 10s ease-in-out infinite;
            "></div>
            <div class="absolute -z-10 rounded-full" style="
                width: 200px; height: 200px; top: 40%; right: 10%;
                background: radial-gradient(circle, rgba(59,130,246, 0.08), transparent 70%);
                filter: blur(30px);
                animation: float3 12s ease-in-out infinite;
            "></div>

            <div class="mx-6 md:mx-20 mt-8 md:mt-20 flex flex-col items-center text-center relative z-10">
                <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm border"
                      style="background: rgba(var(--primary-rgb, 99,102,241), 0.08); color: var(--primary-color); border-color: rgba(var(--primary-rgb, 99,102,241), 0.2)">
                    <span class="inline-block w-2 h-2 rounded-full animate-pulse" style="background: var(--primary-color)"></span>
                    Powering Businesses Across Industries
                </span>
                <h1 class="text-5xl md:text-7xl font-bold text-surface-900 dark:text-surface-0 leading-tight mb-6">
                    One Platform,<br/>
                    <span class="bg-clip-text" style="
                        background: linear-gradient(135deg, var(--primary-color), rgba(168,85,247,1), rgba(59,130,246,1));
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    ">Powerful Solutions</span>
                </h1>
                <p class="font-normal text-xl md:text-2xl leading-relaxed text-surface-600 dark:text-surface-300 max-w-4xl mb-10">
                    Suryantra Technologies delivers enterprise-grade software for <strong>Remittance</strong>,
                    <strong>Clinic Management</strong>, <strong>Tour &amp; Travel</strong>, and <strong>Custom Software</strong> — all from a single, unified platform.
                </p>
                <div class="flex gap-4 flex-wrap justify-center">
                    <button pButton pRipple [rounded]="true" type="button" label="Request a Demo" class="text-xl! px-8! py-3!" style="box-shadow: 0 8px 32px rgba(var(--primary-rgb, 99,102,241), 0.35)" (click)="scrollToDemo()"></button>
                    <button pButton pRipple [rounded]="true" [outlined]="true" type="button" label="Explore Products" class="text-xl! px-8! py-3! backdrop-blur-sm" (click)="scrollToProducts()"></button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20 w-full max-w-6xl">
                    <div class="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 backdrop-blur-sm border hover:scale-105"
                         style="background: rgba(var(--primary-rgb, 99,102,241), 0.04); border-color: rgba(var(--primary-rgb, 99,102,241), 0.1)">
                        <div class="flex items-center justify-center rounded-2xl" style="width: 64px; height: 64px; background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))">
                            <i class="pi pi-money-bill text-3xl! text-green-500"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 font-semibold text-lg">Remittance</span>
                        <span class="text-surface-500 dark:text-surface-400 text-sm">Fast & secure money transfer</span>
                    </div>
                    <div class="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 backdrop-blur-sm border hover:scale-105"
                         style="background: rgba(var(--primary-rgb, 99,102,241), 0.04); border-color: rgba(var(--primary-rgb, 99,102,241), 0.1)">
                        <div class="flex items-center justify-center rounded-2xl" style="width: 64px; height: 64px; background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))">
                            <i class="pi pi-heart text-3xl! text-blue-500"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 font-semibold text-lg">Clinic</span>
                        <span class="text-surface-500 dark:text-surface-400 text-sm">Appointment & patient management</span>
                    </div>
                    <div class="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 backdrop-blur-sm border hover:scale-105"
                         style="background: rgba(var(--primary-rgb, 99,102,241), 0.04); border-color: rgba(var(--primary-rgb, 99,102,241), 0.1)">
                        <div class="flex items-center justify-center rounded-2xl" style="width: 64px; height: 64px; background: linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))">
                            <i class="pi pi-map text-3xl! text-purple-500"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 font-semibold text-lg">Tour & Travel</span>
                        <span class="text-surface-500 dark:text-surface-400 text-sm">Itinerary & booking management</span>
                    </div>
                    <div class="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 backdrop-blur-sm border hover:scale-105"
                         style="background: rgba(var(--primary-rgb, 99,102,241), 0.04); border-color: rgba(var(--primary-rgb, 99,102,241), 0.1)">
                        <div class="flex items-center justify-center rounded-2xl" style="width: 64px; height: 64px; background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))">
                            <i class="pi pi-code text-3xl! text-amber-500"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 font-semibold text-lg">Custom Software</span>
                        <span class="text-surface-500 dark:text-surface-400 text-sm">Demo ready in 30 days</span>
                    </div>
                </div>
            </div>

            <!-- Wave separator -->
            <div class="absolute bottom-0 left-0 right-0" style="pointer-events: none">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="width: 100%; height: 80px; display: block">
                    <path d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                          fill="var(--p-surface-0, #ffffff)" class="dark:fill-surface-900"/>
                </svg>
            </div>
        </div>
    `,
    styles: `
        @keyframes float1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-30px, 20px) scale(1.05); }
        }
        @keyframes float2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(20px, -30px) scale(1.1); }
        }
        @keyframes float3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-20px, 15px) scale(0.95); }
        }
    `
})
export class HeroWidget {
    scrollToDemo() {
        document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
    }
    scrollToProducts() {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }
}
