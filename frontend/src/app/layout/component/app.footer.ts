import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        &copy; {{ currentYear }}
        <span class="text-primary font-bold">Suryantra Technologies</span>
        . All rights reserved.
    </div>`
})
export class AppFooter {
    currentYear = new Date().getFullYear();
}
