import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule, InputIcon } from 'primeng/inputicon';
import { IconFieldModule, IconField } from 'primeng/iconfield'; // If available in your PrimeNG version
import { ViewChild, ElementRef, Component } from '@angular/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';
import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
export interface Organization {
  organizationId: number;
  organizationName: string;
  organizationType: string;
  countryIso3: string;
  status: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}
@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, TableModule,MultiSelectModule,
    SelectModule,
    InputIconModule,
    TagModule,
    InputTextModule,
    SliderModule,
    ProgressBarModule,
    ToggleButtonModule,
    ToastModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    RatingModule,
    RippleModule,
    IconFieldModule],
  templateUrl: './organization-list.html',
})

export class OrganizationList implements OnInit {
  organizations: any[] = [];
  loading = false;
  @ViewChild('filterInput') filterInput!: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchOrganizations();
  }

  fetchOrganizations() {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiBaseUrl}/Organization/list`, {
      params: {
        fromDate: '2022-01-01',
        toDate: '2026-01-01'
      }
    }).subscribe({
      next: data => {
        this.organizations = data;
        this.loading = false;
      },
      error: () => {
        this.organizations = [];
        this.loading = false;
      }
    });
  }
  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: any) {
    table.clear();
    if (this.filterInput) {
      this.filterInput.nativeElement.value = '';
    }
  }
}
