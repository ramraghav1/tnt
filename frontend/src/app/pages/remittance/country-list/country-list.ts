import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FluidModule } from 'primeng/fluid';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RemittanceService, Country, CreateCountryRequest, UpdateCountryRequest } from '../remittance.service';

@Component({
    selector: 'app-country-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        DialogModule,
        ToggleSwitchModule,
        ConfirmDialogModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        ToolbarModule,
        FluidModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './country-list.html',
    styleUrls: ['./country-list.scss']
})
export class CountryList implements OnInit {
    countries: Country[] = [];
    loading = false;
    dialogVisible = false;
    editMode = false;
    selectedCountry: any = {};

    @ViewChild('filterInput') filterInput!: ElementRef;

    constructor(
        private remittanceService: RemittanceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadCountries();
    }

    loadCountries() {
        this.loading = true;
        this.remittanceService.getCountries().subscribe({
            next: (data) => {
                this.countries = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load countries' });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    openNew() {
        this.selectedCountry = { name: '', iso2Code: '', iso3Code: '', phoneCode: '', currencyCode: '', currencyName: '', isActive: true };
        this.editMode = false;
        this.dialogVisible = true;
    }

    editCountry(country: Country) {
        this.selectedCountry = { ...country };
        this.editMode = true;
        this.dialogVisible = true;
    }

    saveCountry() {
        if (this.editMode) {
            const req: UpdateCountryRequest = {
                name: this.selectedCountry.name,
                iso2Code: this.selectedCountry.iso2Code,
                iso3Code: this.selectedCountry.iso3Code,
                phoneCode: this.selectedCountry.phoneCode,
                currencyCode: this.selectedCountry.currencyCode,
                currencyName: this.selectedCountry.currencyName,
                isActive: this.selectedCountry.isActive
            };
            this.remittanceService.updateCountry(this.selectedCountry.id, req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Country updated' });
                    this.dialogVisible = false;
                    this.loadCountries();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update country' }); this.cdr.detectChanges(); }
            });
        } else {
            const req: CreateCountryRequest = {
                name: this.selectedCountry.name,
                iso2Code: this.selectedCountry.iso2Code,
                iso3Code: this.selectedCountry.iso3Code,
                phoneCode: this.selectedCountry.phoneCode,
                currencyCode: this.selectedCountry.currencyCode,
                currencyName: this.selectedCountry.currencyName,
                isActive: this.selectedCountry.isActive
            };
            this.remittanceService.createCountry(req).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Country created' });
                    this.dialogVisible = false;
                    this.loadCountries();
                    this.cdr.detectChanges();
                },
                error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create country' }); this.cdr.detectChanges(); }
            });
        }
    }

    deleteCountry(country: Country) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${country.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.remittanceService.deleteCountry(country.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Country deleted' });
                        this.loadCountries();
                        this.cdr.detectChanges();
                    },
                    error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete country' }); this.cdr.detectChanges(); }
                });
            }
        });
    }

    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: any) {
        table.clear();
        if (this.filterInput) this.filterInput.nativeElement.value = '';
    }
}
