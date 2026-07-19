import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ClinicService, Tenant } from '../clinic.service';

@Component({
    selector: 'app-tenant-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule],
    template: `
        <div class="flex items-center gap-2">
            <label class="font-semibold whitespace-nowrap">Clinic:</label>
            <p-select [options]="tenants" [(ngModel)]="selectedTenantId" optionLabel="name" optionValue="id"
                      placeholder="Select a clinic..." [style]="{ minWidth: '250px' }" (onChange)="onTenantChange($event)">
            </p-select>
        </div>
    `
})
export class TenantSelector implements OnInit {
    tenants: Tenant[] = [];
    @Input() selectedTenantId: number | null = null;
    @Output() tenantChanged = new EventEmitter<number>();

    constructor(private clinicService: ClinicService, private cdr: ChangeDetectorRef) {}

    ngOnInit() {
        this.clinicService.getTenants().subscribe({
            next: (data) => {
                this.tenants = data.filter(t => t.isActive);
                if (this.tenants.length > 0 && !this.selectedTenantId) {
                    this.selectedTenantId = this.tenants[0].id;
                    this.tenantChanged.emit(this.selectedTenantId);
                }
                this.cdr.detectChanges();
            }
        });
    }

    onTenantChange(event: any) {
        this.tenantChanged.emit(event.value);
    }
}
