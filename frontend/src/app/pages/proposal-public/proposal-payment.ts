import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

import { ProposalService, ProposalResponse, ProposalPaymentResponse } from '../../pages/booking/proposal.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-proposal-payment',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, ButtonModule, RadioButtonModule,
        InputNumberModule, DividerModule, ProgressSpinnerModule, ToastModule,
        InputTextModule
    ],
    providers: [MessageService],
    templateUrl: './proposal-payment.html',
    styleUrls: ['./proposal-payment.scss']
})
export class ProposalPayment implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    proposal?: ProposalResponse;
    existingPayments: ProposalPaymentResponse[] = [];
    loading = true;
    token = '';
    submitting = false;
    uploadingScreenshot = false;

    // Payment form
    paymentType: 'full' | 'partial' | 'later' = 'full';
    partialAmount = 0;
    transactionReference = '';

    // Screenshot
    selectedFile: File | null = null;
    previewUrl: string | null = null;

    // Steps
    step: 'choose' | 'qr' | 'uploading' | 'success' = 'choose';

    // Submitted payment ID (for screenshot upload)
    submittedPaymentId = 0;

    // QR
    readonly accountName = 'TNT Tours & Travels Pvt. Ltd.';
    readonly accountNumber = '0123456789012345';
    readonly bankName = 'Nepal SBI Bank';
    readonly qrData = 'upi://pay?pa=tnt-tours@sbi&pn=TNT+Tours&am=';

    serverBaseUrl = environment.serverBaseUrl;

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
                    this.partialAmount = Math.ceil(res.totalAmount * 0.3);
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });

            this.proposalService.getPaymentsByToken(this.token).subscribe({
                next: (res) => {
                    this.existingPayments = res;
                    this.cdr.detectChanges();
                }
            });
        } else {
            this.loading = false;
        }
    }

    get payableAmount(): number {
        if (this.paymentType === 'full') return this.proposal?.totalAmount || 0;
        if (this.paymentType === 'partial') return this.partialAmount;
        return 0;
    }

    get qrImageUrl(): string {
        const data = encodeURIComponent(`${this.qrData}${this.payableAmount}&cu=NPR&tn=Proposal-${this.token.substring(0, 8)}`);
        return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${data}`;
    }

    get totalPaid(): number {
        return this.existingPayments
            .filter(p => p.status === 'Verified')
            .reduce((sum, p) => sum + p.amount, 0);
    }

    get remainingBalance(): number {
        return (this.proposal?.totalAmount || 0) - this.totalPaid;
    }

    selectPaymentType(type: 'full' | 'partial' | 'later'): void {
        this.paymentType = type;
    }

    proceedToQR(): void {
        if (this.paymentType === 'later') {
            // Submit "pay later" = just a note
            this.submitting = true;
            this.proposalService.submitPayment(this.token, {
                paymentType: 'PayLater',
                amount: 0,
                transactionReference: 'Will pay later'
            }).subscribe({
                next: () => {
                    this.submitting = false;
                    this.step = 'success';
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.submitting = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to submit.' });
                }
            });
            return;
        }
        this.step = 'qr';
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                this.previewUrl = reader.result as string;
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(file);
        }
    }

    removeFile(): void {
        this.selectedFile = null;
        this.previewUrl = null;
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
    }

    submitPaymentWithScreenshot(): void {
        this.submitting = true;

        // Step 1: Submit payment record
        const paymentTypeLabel = this.paymentType === 'full' ? 'Full' : 'Partial';
        this.proposalService.submitPayment(this.token, {
            paymentType: paymentTypeLabel,
            amount: this.payableAmount,
            transactionReference: this.transactionReference || undefined
        }).subscribe({
            next: (paymentRes) => {
                this.submittedPaymentId = paymentRes.id;

                // Step 2: Upload screenshot if selected
                if (this.selectedFile) {
                    this.uploadingScreenshot = true;
                    this.proposalService.uploadScreenshot(paymentRes.id, this.selectedFile).subscribe({
                        next: () => {
                            this.uploadingScreenshot = false;
                            this.submitting = false;
                            this.step = 'success';
                            this.cdr.detectChanges();
                        },
                        error: () => {
                            this.uploadingScreenshot = false;
                            this.submitting = false;
                            this.step = 'success'; // Still show success, screenshot upload is optional
                            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Payment recorded but screenshot upload failed.' });
                            this.cdr.detectChanges();
                        }
                    });
                } else {
                    this.submitting = false;
                    this.step = 'success';
                    this.cdr.detectChanges();
                }
            },
            error: () => {
                this.submitting = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Payment submission failed.' });
            }
        });
    }

    goBackToProposal(): void {
        this.router.navigate(['/proposal', this.token]);
    }
}
