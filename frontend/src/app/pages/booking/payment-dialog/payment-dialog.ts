import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

import { BookingService } from '../booking.service';

@Component({
    selector: 'app-payment-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DialogModule,
        ButtonModule,
        RadioButtonModule,
        InputNumberModule,
        DividerModule,
        ToastModule,
        ProgressSpinnerModule,
        TranslateModule
    ],
    providers: [MessageService],
    templateUrl: './payment-dialog.html',
    styleUrls: ['./payment-dialog.scss']
})
export class PaymentDialog {
    @Input() visible = false;
    @Input() bookingId: number = 0;
    @Input() bookingReference: string = '';
    @Input() totalAmount: number = 0;
    @Input() discountAmount: number = 0;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() paymentComplete = new EventEmitter<void>();

    paymentMethod: 'qr' | 'cash' = 'qr';
    step: 'choose' | 'processing' | 'success' = 'choose';
    payableAmount = 0;

    // Dummy QR account info
    readonly accountName = 'TNT Tours & Travels Pvt. Ltd.';
    readonly accountNumber = '0123456789012345';
    readonly bankName = 'Nepal SBI Bank';
    readonly qrData = 'upi://pay?pa=tnt-tours@sbi&pn=TNT+Tours&am=';

    constructor(
        private bookingService: BookingService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    get grandTotal(): number {
        return Math.max(0, this.totalAmount - this.discountAmount);
    }

    get qrImageUrl(): string {
        const data = encodeURIComponent(`${this.qrData}${this.grandTotal}&cu=NPR&tn=Booking-${this.bookingReference}`);
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
    }

    onShow() {
        this.step = 'choose';
        this.payableAmount = this.grandTotal;
        this.paymentMethod = 'qr';
    }

    onHide() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    proceedPayment() {
        this.step = 'processing';
        this.cdr.detectChanges();

        // Simulate payment processing - after 5 seconds, mark as received
        setTimeout(() => {
            this.recordPayment();
        }, 5000);
    }

    private recordPayment() {
        const request = {
            amount: this.grandTotal,
            currency: 'NPR',
            paymentMethod: this.paymentMethod === 'qr' ? 'QR' : 'Cash',
            transactionReference: this.paymentMethod === 'qr'
                ? `QR-${Date.now()}`
                : `CASH-${Date.now()}`
        };

        this.bookingService.addPayment(this.bookingId, request).subscribe({
            next: () => {
                // Also update status to Confirmed
                this.bookingService.updateStatus(this.bookingId, 'Confirmed').subscribe({
                    next: () => {
                        this.step = 'success';
                        this.cdr.detectChanges();
                    },
                    error: () => {
                        this.step = 'success';
                        this.cdr.detectChanges();
                    }
                });
            },
            error: (err) => {
                console.error(err);
                this.step = 'choose';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Payment failed. Please try again.' });
                this.cdr.detectChanges();
            }
        });
    }

    closeAndNotify() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.paymentComplete.emit();
    }
}
