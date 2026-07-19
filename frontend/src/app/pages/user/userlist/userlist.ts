import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield'; // If available in your PrimeNG version
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
interface User {
  userFullName: string;
  address: string;
  emailAddress: string;
  mobileNumber: string;
}
interface expandedRows {
  [key: string]: boolean;
}
@Component({
  selector: 'app-userlist',
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
  templateUrl: './userlist.html', // <-- Use templateUrl here
  styleUrls: ['./userlist.scss']
  
})
export class Userlist implements OnInit {
  users: User[] = [];
  @ViewChild('filterInput') filterInput!: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<User[]>(`${environment.apiBaseUrl}/User/GetAll`).subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        // Optionally handle error
        console.error('Failed to load users', err);
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