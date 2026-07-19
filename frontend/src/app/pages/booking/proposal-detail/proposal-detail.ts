import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ImageModule } from 'primeng/image';
import { TranslateModule } from '@ngx-translate/core';

import {
    ProposalService,
    ProposalResponse,
    ProposalPaymentResponse,
    ProposalFeedbackResponse
} from '../proposal.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-proposal-detail',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, TagModule, ToastModule,
        DividerModule, ProgressSpinnerModule, DialogModule, TextareaModule,
        ConfirmDialog, ImageModule, TranslateModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './proposal-detail.html',
    styleUrls: ['./proposal-detail.scss']
})
export class ProposalDetail implements OnInit {
    proposal?: ProposalResponse;
    payments: ProposalPaymentResponse[] = [];
    feedback: ProposalFeedbackResponse[] = [];
    loading = true;
    proposalId = 0;

    // Verify dialog
    showVerifyDialog = false;
    verifyPaymentId = 0;
    verifyApproved = true;
    verifyRemarks = '';
    verifying = false;

    serverBaseUrl = environment.serverBaseUrl;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private proposalService: ProposalService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.proposalId = +(this.route.snapshot.paramMap.get('id') || 0);
        if (this.proposalId) {
            this.loadAll();
        }
    }

    loadAll(): void {
        this.proposalService.getProposalById(this.proposalId).subscribe({
            next: (res) => {
                this.proposal = res;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
            }
        });

        this.proposalService.getProposalPayments(this.proposalId).subscribe({
            next: (res) => { this.payments = res; this.cdr.detectChanges(); }
        });

        this.proposalService.getProposalFeedback(this.proposalId).subscribe({
            next: (res) => { this.feedback = res; this.cdr.detectChanges(); }
        });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'Confirmed': case 'Verified': return 'success';
            case 'Accepted': case 'PaymentSubmitted': case 'Pending': return 'info';
            case 'Sent': return 'warn';
            case 'FeedbackReceived': return 'secondary';
            case 'PaymentRejected': case 'Rejected': case 'Expired': return 'danger';
            default: return 'info';
        }
    }

    getMeals(day: any): string[] {
        const meals: string[] = [];
        if (day.breakfastIncluded) meals.push('Breakfast');
        if (day.lunchIncluded) meals.push('Lunch');
        if (day.dinnerIncluded) meals.push('Dinner');
        return meals;
    }

    openVerifyDialog(paymentId: number, approve: boolean): void {
        this.verifyPaymentId = paymentId;
        this.verifyApproved = approve;
        this.verifyRemarks = '';
        this.showVerifyDialog = true;
    }

    confirmVerify(): void {
        this.verifying = true;
        this.proposalService.verifyPayment(this.verifyPaymentId, this.verifyApproved, this.verifyRemarks || undefined).subscribe({
            next: () => {
                this.verifying = false;
                this.showVerifyDialog = false;
                this.messageService.add({
                    severity: this.verifyApproved ? 'success' : 'warn',
                    summary: this.verifyApproved ? 'Payment Verified' : 'Payment Rejected',
                    detail: this.verifyApproved ? 'Booking confirmed!' : 'Payment rejected.'
                });
                this.loadAll();
            },
            error: () => {
                this.verifying = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to verify payment.' });
            }
        });
    }

    resend(): void {
        if (this.proposal) {
            this.router.navigate(['/proposal-customize', this.proposal.itineraryId], {
                queryParams: { proposalId: this.proposal.id }
            });
        }
    }

    getScreenshotUrl(path: string): string {
        if (!path) return '';
        return `${this.serverBaseUrl}${path}`;
    }

    goBack(): void {
        this.router.navigate(['/proposals']);
    }
}
