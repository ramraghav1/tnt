import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProposalService, ProposalResponse } from '../../pages/booking/proposal.service';

@Component({
    selector: 'app-proposal-feedback',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, ButtonModule, TextareaModule,
        ProgressSpinnerModule, ToastModule
    ],
    providers: [MessageService],
    templateUrl: './proposal-feedback.html',
    styleUrls: ['./proposal-feedback.scss']
})
export class ProposalFeedback implements OnInit {
    proposal?: ProposalResponse;
    loading = true;
    token = '';
    submitting = false;
    feedbackMessage = '';
    submitted = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private proposalService: ProposalService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.token = this.route.snapshot.paramMap.get('token') || '';
        if (this.token) {
            this.proposalService.getProposalByToken(this.token).subscribe({
                next: (res) => {
                    this.proposal = res;
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
        } else {
            this.loading = false;
        }
    }

    submitFeedback(): void {
        if (!this.feedbackMessage.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Empty', detail: 'Please enter your feedback or concerns.' });
            return;
        }

        this.submitting = true;
        this.proposalService.submitFeedback(this.token, this.feedbackMessage).subscribe({
            next: () => {
                this.submitting = false;
                this.submitted = true;
                this.cdr.detectChanges();
            },
            error: () => {
                this.submitting = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to submit feedback.' });
            }
        });
    }

    goBackToProposal(): void {
        this.router.navigate(['/proposal', this.token]);
    }
}
