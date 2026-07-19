import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ProposalService, ProposalResponse, ProposalPaymentResponse } from '../../pages/booking/proposal.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-proposal-view',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        ButtonModule, TagModule, TabsModule, DividerModule,
        ProgressSpinnerModule, ToastModule, DialogModule, TextareaModule,
        InputNumberModule, InputTextModule, TooltipModule, ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './proposal-view.html',
    styleUrls: ['./proposal-view.scss']
})
export class ProposalView implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    proposal?: ProposalResponse;
    loading = true;
    token = '';
    expired = false;
    activeTab = 0;

    // Actions
    accepting = false;
    rejecting = false;

    // Feedback dialog
    showFeedbackDialog = false;
    feedbackMessage = '';
    submittingFeedback = false;

    // Payment
    payments: ProposalPaymentResponse[] = [];
    paymentMethod: 'bank' | 'esewa' | 'khalti' | 'card' = 'bank';
    paymentType: 'full' | 'partial' | 'later' = 'full';
    partialAmount = 0;
    transactionReference = '';
    selectedFile: File | null = null;
    previewUrl: string | null = null;
    submittingPayment = false;
    paymentStep: 'choose' | 'pay' | 'success' = 'choose';

    // Invoice
    invoiceData: any = null;
    loadingInvoice = false;

    // QR
    readonly accountName = 'TNT Tours & Travels Pvt. Ltd.';
    readonly accountNumber = '0123456789012345';
    readonly bankName = 'Nepal SBI Bank';
    serverBaseUrl = environment.serverBaseUrl;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private proposalService: ProposalService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.token = this.route.snapshot.paramMap.get('token') || '';
        if (this.token) {
            this.loadProposal();
        } else {
            this.loading = false;
        }
    }

    loadProposal(): void {
        this.proposalService.getProposalByToken(this.token).subscribe({
            next: (res) => {
                this.proposal = res;
                this.expired = new Date(res.expiresAt) < new Date();
                this.partialAmount = Math.ceil(res.totalAmount * 0.3);
                this.loading = false;
                this.loadPayments();
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadPayments(): void {
        this.proposalService.getPaymentsByToken(this.token).subscribe({
            next: (res) => {
                this.payments = res;
                this.cdr.detectChanges();
            }
        });
    }

    // ===== Computed =====
    get totalPaid(): number {
        return this.payments.filter(p => p.status === 'Verified').reduce((s, p) => s + p.amount, 0);
    }

    get remainingBalance(): number {
        return (this.proposal?.totalAmount || 0) - this.totalPaid;
    }

    get payableAmount(): number {
        if (this.paymentType === 'full') return this.remainingBalance;
        if (this.paymentType === 'partial') return this.partialAmount;
        return 0;
    }

    get qrImageUrl(): string {
        const data = encodeURIComponent(`bank://pay?name=${this.accountName}&acc=${this.accountNumber}&amt=${this.payableAmount}`);
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
    }

    get inclusions(): string[] {
        if (!this.proposal) return [];
        const days = this.proposal.days;
        const list: string[] = [];
        if (days.some(d => d.accommodation)) list.push('Hotel accommodation as per itinerary');
        if (days.some(d => d.breakfastIncluded)) list.push('Daily breakfast');
        if (days.some(d => d.lunchIncluded)) list.push('Lunch as per itinerary');
        if (days.some(d => d.dinnerIncluded)) list.push('Dinner as per itinerary');
        if (days.some(d => d.transport)) list.push('Private transport as per itinerary');
        list.push('Airport pickup & drop');
        list.push('Professional guide service');
        list.push('All applicable entry fees');
        return list;
    }

    get exclusions(): string[] {
        if (!this.proposal) return [];
        const days = this.proposal.days;
        const list: string[] = ['International airfare'];
        if (!days.some(d => d.lunchIncluded)) list.push('Lunch');
        if (!days.some(d => d.dinnerIncluded)) list.push('Dinner');
        list.push('Personal expenses & shopping');
        list.push('Travel insurance');
        list.push('Tips & gratuities');
        return list;
    }

    getMeals(day: any): string[] {
        const meals: string[] = [];
        if (day.breakfastIncluded) meals.push('Breakfast');
        if (day.lunchIncluded) meals.push('Lunch');
        if (day.dinnerIncluded) meals.push('Dinner');
        return meals;
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
            'Sent': 'info',
            'Accepted': 'success',
            'PaymentSubmitted': 'warn',
            'Confirmed': 'success',
            'PaymentRejected': 'danger',
            'Rejected': 'danger',
            'FeedbackReceived': 'info'
        };
        return map[status] || 'info';
    }

    getStatusLabel(status: string): string {
        const map: Record<string, string> = {
            'Sent': 'Awaiting Response',
            'Accepted': 'Accepted',
            'PaymentSubmitted': 'Payment Under Review',
            'Confirmed': 'Confirmed & Paid',
            'PaymentRejected': 'Payment Issue',
            'Rejected': 'Declined',
            'FeedbackReceived': 'Changes Requested'
        };
        return map[status] || status;
    }

    // ===== Actions =====
    acceptProposal(): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to accept this quotation? You can proceed to payment after acceptance.',
            header: 'Accept Quotation',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Yes, Accept',
            rejectLabel: 'Cancel',
            accept: () => {
                this.accepting = true;
                this.proposalService.acceptProposal(this.token).subscribe({
                    next: () => {
                        this.accepting = false;
                        if (this.proposal) this.proposal.status = 'Accepted';
                        this.messageService.add({ severity: 'success', summary: 'Accepted!', detail: 'Quotation accepted. You can now proceed to payment.' });
                        this.activeTab = 3;
                        this.cdr.detectChanges();
                    },
                    error: () => {
                        this.accepting = false;
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to accept.' });
                    }
                });
            }
        });
    }

    rejectProposal(): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to decline this quotation? You can always request changes instead.',
            header: 'Decline Quotation',
            icon: 'pi pi-times-circle',
            acceptLabel: 'Yes, Decline',
            rejectLabel: 'Cancel',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.rejecting = true;
                this.proposalService.rejectProposal(this.token).subscribe({
                    next: () => {
                        this.rejecting = false;
                        if (this.proposal) this.proposal.status = 'Rejected';
                        this.messageService.add({ severity: 'info', summary: 'Declined', detail: 'Quotation has been declined.' });
                        this.cdr.detectChanges();
                    },
                    error: () => {
                        this.rejecting = false;
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to decline.' });
                    }
                });
            }
        });
    }

    openFeedbackDialog(): void {
        this.showFeedbackDialog = true;
        this.feedbackMessage = '';
    }

    submitFeedback(): void {
        if (!this.feedbackMessage.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Empty', detail: 'Please enter your feedback.' });
            return;
        }
        this.submittingFeedback = true;
        this.proposalService.submitFeedback(this.token, this.feedbackMessage).subscribe({
            next: () => {
                this.submittingFeedback = false;
                this.showFeedbackDialog = false;
                if (this.proposal) this.proposal.status = 'FeedbackReceived';
                this.messageService.add({ severity: 'success', summary: 'Sent!', detail: 'Your feedback has been submitted.' });
                this.cdr.detectChanges();
            },
            error: () => {
                this.submittingFeedback = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to submit feedback.' });
            }
        });
    }

    // ===== Payment =====
    selectPaymentMethod(method: 'bank' | 'esewa' | 'khalti' | 'card'): void {
        this.paymentMethod = method;
    }

    selectPaymentType(type: 'full' | 'partial' | 'later'): void {
        this.paymentType = type;
    }

    proceedToPay(): void {
        if (this.paymentType === 'later') {
            this.submittingPayment = true;
            this.proposalService.submitPayment(this.token, {
                paymentType: 'PayLater', amount: 0, transactionReference: 'Will pay later'
            }).subscribe({
                next: () => {
                    this.submittingPayment = false;
                    this.paymentStep = 'success';
                    this.loadPayments();
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.submittingPayment = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Submission failed.' });
                }
            });
            return;
        }
        this.paymentStep = 'pay';
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = () => { this.previewUrl = reader.result as string; this.cdr.detectChanges(); };
            reader.readAsDataURL(file);
        }
    }

    removeFile(): void {
        this.selectedFile = null;
        this.previewUrl = null;
        if (this.fileInput) this.fileInput.nativeElement.value = '';
    }

    submitPaymentWithScreenshot(): void {
        this.submittingPayment = true;
        const typeLabel = this.paymentType === 'full' ? 'Full' : 'Partial';
        this.proposalService.submitPayment(this.token, {
            paymentType: typeLabel, amount: this.payableAmount, transactionReference: this.transactionReference || undefined
        }).subscribe({
            next: (paymentRes) => {
                if (this.selectedFile) {
                    this.proposalService.uploadScreenshot(paymentRes.id, this.selectedFile).subscribe({
                        next: () => this.finishPayment(),
                        error: () => { this.finishPayment(); this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Payment recorded but screenshot upload failed.' }); }
                    });
                } else {
                    this.finishPayment();
                }
            },
            error: () => {
                this.submittingPayment = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Payment failed.' });
            }
        });
    }

    private finishPayment(): void {
        this.submittingPayment = false;
        this.paymentStep = 'success';
        this.loadProposal();
        this.loadPayments();
        this.cdr.detectChanges();
    }

    resetPayment(): void {
        this.paymentStep = 'choose';
        this.paymentType = 'full';
        this.selectedFile = null;
        this.previewUrl = null;
        this.transactionReference = '';
    }

    payWithEsewa(): void {
        this.messageService.add({ severity: 'info', summary: 'eSewa', detail: 'eSewa payment gateway integration coming soon!', life: 4000 });
    }

    payWithKhalti(): void {
        this.messageService.add({ severity: 'info', summary: 'Khalti', detail: 'Khalti payment gateway integration coming soon!', life: 4000 });
    }

    // ===== Invoice =====
    loadInvoice(): void {
        if (this.invoiceData) return;
        this.loadingInvoice = true;
        this.proposalService.getInvoiceByToken(this.token).subscribe({
            next: (res) => { this.invoiceData = res; this.loadingInvoice = false; this.cdr.detectChanges(); },
            error: () => { this.loadingInvoice = false; }
        });
    }

    printInvoice(): void {
        window.print();
    }

    onTabChange(index: number): void {
        this.activeTab = index;
        if (index === 4) this.loadInvoice();
    }
}
