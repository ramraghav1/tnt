import { Component } from '@angular/core';

@Component({
    selector: 'highlights-widget',
    template: `
        <div id="highlights" class="relative pt-32 pb-28 px-6 lg:px-20 mx-0 my-0 overflow-hidden" style="
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
        ">
            <!-- Top wave from light to dark -->
            <div class="absolute top-0 left-0 right-0" style="pointer-events: none; transform: translateY(-1px)">
                <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style="width: 100%; height: 60px; display: block; transform: rotate(180deg)">
                    <path d="M0 80L48 68C96 56 192 32 288 24C384 16 480 24 576 32C672 40 768 48 864 48C960 48 1056 40 1152 36C1248 32 1344 32 1392 32L1440 32V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z"
                          fill="var(--p-surface-0, #ffffff)" class="dark:fill-surface-900"/>
                </svg>
            </div>
            <!-- Decorative gradient orbs -->
            <div class="absolute rounded-full" style="
                width: 500px; height: 500px; top: -200px; left: -100px;
                background: radial-gradient(circle, rgba(var(--primary-rgb, 99,102,241), 0.2), transparent 70%);
                filter: blur(80px); pointer-events: none;
            "></div>
            <div class="absolute rounded-full" style="
                width: 400px; height: 400px; bottom: -150px; right: -50px;
                background: radial-gradient(circle, rgba(168,85,247, 0.15), transparent 70%);
                filter: blur(80px); pointer-events: none;
            "></div>
            <div class="absolute rounded-full" style="
                width: 300px; height: 300px; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: radial-gradient(circle, rgba(59,130,246, 0.08), transparent 70%);
                filter: blur(60px); pointer-events: none;
            "></div>

            <!-- Grid pattern overlay -->
            <div class="absolute inset-0 opacity-[0.02]" style="
                background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
                background-size: 80px 80px; pointer-events: none;
            "></div>

            <div class="relative z-10 max-w-7xl mx-auto">
                <div class="text-center mb-16">
                    <span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                          style="background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.1)">
                        Why Choose Us
                    </span>
                    <div class="font-bold mb-4 text-4xl" style="color: #ffffff">Why Choose Suryantra?</div>
                    <span class="text-xl max-w-3xl mx-auto block" style="color: #94a3b8">Built by industry experts, trusted by businesses worldwide.</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 cursor-default"
                         style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px)">
                        <div class="flex items-center justify-center rounded-2xl mb-5" style="width: 72px; height: 72px; background: linear-gradient(135deg, rgba(var(--primary-rgb, 99,102,241), 0.3), rgba(var(--primary-rgb, 99,102,241), 0.05))">
                            <i class="pi pi-shield text-3xl!" style="color: var(--primary-color)"></i>
                        </div>
                        <h4 class="text-xl font-semibold mb-2" style="color: #ffffff">Enterprise Security</h4>
                        <p class="leading-relaxed" style="color: #94a3b8">Bank-grade encryption and role-based access control to keep your data safe.</p>
                    </div>

                    <div class="flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 cursor-default"
                         style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px)">
                        <div class="flex items-center justify-center rounded-2xl mb-5" style="width: 72px; height: 72px; background: linear-gradient(135deg, rgba(var(--primary-rgb, 99,102,241), 0.3), rgba(var(--primary-rgb, 99,102,241), 0.05))">
                            <i class="pi pi-bolt text-3xl!" style="color: var(--primary-color)"></i>
                        </div>
                        <h4 class="text-xl font-semibold mb-2" style="color: #ffffff">Lightning Fast</h4>
                        <p class="leading-relaxed" style="color: #94a3b8">Optimized performance with real-time dashboards and instant data processing.</p>
                    </div>

                    <div class="flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 cursor-default"
                         style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px)">
                        <div class="flex items-center justify-center rounded-2xl mb-5" style="width: 72px; height: 72px; background: linear-gradient(135deg, rgba(var(--primary-rgb, 99,102,241), 0.3), rgba(var(--primary-rgb, 99,102,241), 0.05))">
                            <i class="pi pi-cloud text-3xl!" style="color: var(--primary-color)"></i>
                        </div>
                        <h4 class="text-xl font-semibold mb-2" style="color: #ffffff">Cloud Native</h4>
                        <p class="leading-relaxed" style="color: #94a3b8">Deploy anywhere with our cloud-ready architecture. Scale as your business grows.</p>
                    </div>

                    <div class="flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 cursor-default"
                         style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px)">
                        <div class="flex items-center justify-center rounded-2xl mb-5" style="width: 72px; height: 72px; background: linear-gradient(135deg, rgba(var(--primary-rgb, 99,102,241), 0.3), rgba(var(--primary-rgb, 99,102,241), 0.05))">
                            <i class="pi pi-cog text-3xl!" style="color: var(--primary-color)"></i>
                        </div>
                        <h4 class="text-xl font-semibold mb-2" style="color: #ffffff">Fully Customizable</h4>
                        <p class="leading-relaxed" style="color: #94a3b8">Tailor workflows, branding, and features to match your unique business needs.</p>
                    </div>

                    <div class="flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 cursor-default"
                         style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px)">
                        <div class="flex items-center justify-center rounded-2xl mb-5" style="width: 72px; height: 72px; background: linear-gradient(135deg, rgba(var(--primary-rgb, 99,102,241), 0.3), rgba(var(--primary-rgb, 99,102,241), 0.05))">
                            <i class="pi pi-headphones text-3xl!" style="color: var(--primary-color)"></i>
                        </div>
                        <h4 class="text-xl font-semibold mb-2" style="color: #ffffff">24/7 Support</h4>
                        <p class="leading-relaxed" style="color: #94a3b8">Dedicated support team ready to help you succeed at every step.</p>
                    </div>

                    <div class="flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 cursor-default"
                         style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px)">
                        <div class="flex items-center justify-center rounded-2xl mb-5" style="width: 72px; height: 72px; background: linear-gradient(135deg, rgba(var(--primary-rgb, 99,102,241), 0.3), rgba(var(--primary-rgb, 99,102,241), 0.05))">
                            <i class="pi pi-chart-line text-3xl!" style="color: var(--primary-color)"></i>
                        </div>
                        <h4 class="text-xl font-semibold mb-2" style="color: #ffffff">Data-Driven Insights</h4>
                        <p class="leading-relaxed" style="color: #94a3b8">Powerful analytics and reporting to help you make informed business decisions.</p>
                    </div>
                </div>

                <!-- Stats bar -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 p-10 rounded-2xl" style="
                    background: linear-gradient(135deg, rgba(var(--primary-rgb, 99,102,241), 0.15), rgba(168,85,247,0.1));
                    border: 1px solid rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                ">
                    <div class="text-center">
                        <div class="text-5xl font-bold mb-2" style="
                            background: linear-gradient(135deg, var(--primary-color), rgba(168,85,247,1));
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        ">4</div>
                        <div class="font-medium" style="color: #cbd5e1">Product Lines</div>
                    </div>
                    <div class="text-center">
                        <div class="text-5xl font-bold mb-2" style="
                            background: linear-gradient(135deg, var(--primary-color), rgba(168,85,247,1));
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        ">99.9%</div>
                        <div class="font-medium" style="color: #cbd5e1">Uptime SLA</div>
                    </div>
                    <div class="text-center">
                        <div class="text-5xl font-bold mb-2" style="
                            background: linear-gradient(135deg, var(--primary-color), rgba(168,85,247,1));
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        ">24/7</div>
                        <div class="font-medium" style="color: #cbd5e1">Support</div>
                    </div>
                    <div class="text-center">
                        <div class="text-5xl font-bold mb-2" style="
                            background: linear-gradient(135deg, var(--primary-color), rgba(168,85,247,1));
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        ">100+</div>
                        <div class="font-medium" style="color: #cbd5e1">Features</div>
                    </div>
                </div>
            </div>

            <!-- Bottom wave from dark to light -->
            <div class="absolute bottom-0 left-0 right-0" style="pointer-events: none">
                <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style="width: 100%; height: 60px; display: block">
                    <path d="M0 80L48 68C96 56 192 32 288 24C384 16 480 24 576 36C672 48 768 52 864 48C960 44 1056 32 1152 28C1248 24 1344 28 1392 30L1440 32V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z"
                          fill="var(--p-surface-0, #ffffff)" class="dark:fill-surface-900"/>
                </svg>
            </div>
        </div>
    `
})
export class HighlightsWidget {}
