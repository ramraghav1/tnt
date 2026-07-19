import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule],
    template: `
        <div class="relative overflow-hidden" style="background: linear-gradient(180deg, transparent, #0f172a 5%);">
            <!-- Decorative top gradient line -->
            <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, transparent, var(--primary-color), rgba(168,85,247,1), var(--primary-color), transparent)"></div>

            <div class="py-16 px-6 lg:px-12 mx-0 lg:mx-20">
                <div class="grid grid-cols-12 gap-8">
                    <div class="col-span-12 md:col-span-4">
                        <a (click)="router.navigate(['/landing'], { fragment: 'home' })" class="flex items-center cursor-pointer mb-4">
                            <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-10 mr-2">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M17.1637 19.2467C17.1566 19.4033 17.1529 19.561 17.1529 19.7194C17.1529 25.3503 21.7203 29.915 27.3546 29.915C32.9887 29.915 37.5561 25.3503 37.5561 19.7194C37.5561 19.5572 37.5524 19.3959 37.5449 19.2355C38.5617 19.0801 39.5759 18.9013 40.5867 18.6994L40.6926 18.6782C40.7191 19.0218 40.7326 19.369 40.7326 19.7194C40.7326 27.1036 34.743 33.0896 27.3546 33.0896C19.966 33.0896 13.9765 27.1036 13.9765 19.7194C13.9765 19.374 13.9896 19.0316 14.0154 18.6927L14.0486 18.6994C15.0837 18.9062 16.1223 19.0886 17.1637 19.2467ZM33.3284 11.4538C31.6493 10.2396 29.5855 9.52381 27.3546 9.52381C25.1195 9.52381 23.0524 10.2421 21.3717 11.4603C20.0078 11.3232 18.6475 11.1387 17.2933 10.907C19.7453 8.11308 23.3438 6.34921 27.3546 6.34921C31.36 6.34921 34.9543 8.10844 37.4061 10.896C36.0521 11.1292 34.692 11.3152 33.3284 11.4538ZM43.826 18.0518C43.881 18.6003 43.9091 19.1566 43.9091 19.7194C43.9091 28.8568 36.4973 36.2642 27.3546 36.2642C18.2117 36.2642 10.8 28.8568 10.8 19.7194C10.8 19.1615 10.8276 18.61 10.8816 18.0663L7.75383 17.4411C7.66775 18.1886 7.62354 18.9488 7.62354 19.7194C7.62354 30.6102 16.4574 39.4388 27.3546 39.4388C38.2517 39.4388 47.0855 30.6102 47.0855 19.7194C47.0855 18.9439 47.0407 18.1789 46.9536 17.4267L43.826 18.0518ZM44.2613 9.54743L40.9084 10.2176C37.9134 5.95821 32.9593 3.1746 27.3546 3.1746C21.7442 3.1746 16.7856 5.96385 13.7915 10.2305L10.4399 9.56057C13.892 3.83178 20.1756 0 27.3546 0C34.5281 0 40.8075 3.82591 44.2613 9.54743Z"
                                    fill="var(--primary-color)" />
                            </svg>
                            <h4 class="font-medium text-2xl" style="color: #ffffff">SURYANTRA</h4>
                        </a>
                        <p class="leading-relaxed mb-6" style="color: #94a3b8">
                            Enterprise software solutions for Remittance, Clinic, and Tour &amp; Travel businesses.
                        </p>
                        <div class="flex gap-3">
                            <a class="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
                               style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #94a3b8">
                                <i class="pi pi-facebook"></i>
                            </a>
                            <a class="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
                               style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #94a3b8">
                                <i class="pi pi-twitter"></i>
                            </a>
                            <a class="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
                               style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #94a3b8">
                                <i class="pi pi-linkedin"></i>
                            </a>
                        </div>
                    </div>

                    <div class="col-span-12 md:col-span-8">
                        <div class="grid grid-cols-12 gap-8">
                            <div class="col-span-12 md:col-span-4">
                                <h4 class="font-semibold text-lg mb-4" style="color: #ffffff">Products</h4>
                                <a class="block cursor-pointer mb-3 transition-colors duration-200" style="color: #94a3b8">Remittance System</a>
                                <a class="block cursor-pointer mb-3 transition-colors duration-200" style="color: #94a3b8">Clinic Management</a>
                                <a class="block cursor-pointer mb-3 transition-colors duration-200" style="color: #94a3b8">Tour &amp; Travel</a>
                            </div>

                            <div class="col-span-12 md:col-span-4">
                                <h4 class="font-semibold text-lg mb-4" style="color: #ffffff">Company</h4>
                                <a class="block cursor-pointer mb-3 transition-colors duration-200" style="color: #94a3b8">About Us</a>
                                <a class="block cursor-pointer mb-3 transition-colors duration-200" style="color: #94a3b8">Careers</a>
                                <a class="block cursor-pointer mb-3 transition-colors duration-200" style="color: #94a3b8">Contact</a>
                            </div>

                            <div class="col-span-12 md:col-span-4">
                                <h4 class="font-semibold text-lg mb-4" style="color: #ffffff">Support</h4>
                                <a class="block cursor-pointer mb-3 transition-colors duration-200" style="color: #94a3b8">Documentation</a>
                                <a class="block cursor-pointer mb-3 transition-colors duration-200" style="color: #94a3b8">FAQ</a>
                                <a class="block cursor-pointer mb-3 transition-colors duration-200" style="color: #94a3b8">Privacy Policy</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-12 pt-8 text-center" style="border-top: 1px solid rgba(255,255,255,0.08)">
                    <span class="text-sm" style="color: #64748b">&copy; 2025 Suryantra Technologies. All rights reserved.</span>
                </div>
            </div>
        </div>
    `
})
export class FooterWidget {
    constructor(public router: Router) {}
}
