import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { ProposalService, ProposalListItem } from '../proposal.service';

@Component({
    selector: 'app-proposal-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, TagModule,
        ToastModule, InputTextModule, ProgressSpinnerModule, TooltipModule,
        TranslateModule
    ],
    providers: [MessageService],
    templateUrl: './proposal-list.html',
    styleUrls: ['./proposal-list.scss']
})
export class ProposalList implements OnInit {
    @ViewChild('dt') dt!: Table;
    proposals: ProposalListItem[] = [];
    loading = true;
    globalFilter = '';

    constructor(
        private proposalService: ProposalService,
        private router: Router,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadProposals();
    }

    loadProposals(): void {
        this.loading = true;
        this.proposalService.getProposals().subscribe({
            next: (res) => {
                this.proposals = res;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load proposals.' });
            }
        });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'Confirmed': return 'success';
            case 'Accepted': case 'PaymentSubmitted': return 'info';
            case 'Sent': return 'warn';
            case 'FeedbackReceived': return 'secondary';
            case 'PaymentRejected': case 'Expired': return 'danger';
            default: return 'info';
        }
    }

    viewDetail(proposal: ProposalListItem): void {
        this.router.navigate(['/proposal-detail', proposal.id]);
    }

    resend(proposal: ProposalListItem): void {
        this.router.navigate(['/proposal-customize', proposal.itineraryTitle], {
            queryParams: { proposalId: proposal.id }
        });
    }

    newProposal(): void {
        this.router.navigate(['/itinerary-list']);
    }
}
