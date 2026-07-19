import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FinanceService, Expense, CreateExpenseRequest } from '../finance.service';

@Component({
    selector: 'app-expense-list',
    standalone: true,
    imports: [
        CommonModule, RouterModule, FormsModule,
        TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, SelectModule, IconFieldModule, InputIconModule,
        DialogModule, InputNumberModule, ProgressSpinnerModule, ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './expense-list.html',
    styleUrls: ['./expense-list.scss']
})
export class ExpenseList implements OnInit {
    expenses: Expense[] = [];
    loading = false;
    globalFilter = '';
    showDialog = false;
    isEdit = false;
    editingId: number | null = null;
    saving = false;

    form: CreateExpenseRequest = this.emptyForm();

    categoryOptions = [
        { label: 'Accommodation', value: 'Accommodation' },
        { label: 'Transport', value: 'Transport' },
        { label: 'Guide', value: 'Guide' },
        { label: 'Food', value: 'Food' },
        { label: 'Activity', value: 'Activity' },
        { label: 'Permit', value: 'Permit' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Miscellaneous', value: 'Miscellaneous' }
    ];

    currencyOptions = [
        { label: 'NPR', value: 'NPR' },
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' }
    ];

    constructor(
        private financeService: FinanceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void { this.loadExpenses(); }

    private emptyForm(): CreateExpenseRequest {
        return { expenseName: '', category: '', amount: 0, currency: 'NPR', expenseDate: new Date().toISOString().split('T')[0] };
    }

    loadExpenses(): void {
        this.loading = true;
        this.financeService.getExpenses().subscribe({
            next: (data) => { this.expenses = data; this.loading = false; this.cdr.detectChanges(); },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load expenses' });
            }
        });
    }

    openAddDialog(): void { this.isEdit = false; this.editingId = null; this.form = this.emptyForm(); this.showDialog = true; }

    openEditDialog(expense: Expense): void {
        this.isEdit = true;
        this.editingId = expense.id;
        this.form = {
            expenseName: expense.expenseName,
            category: expense.category,
            amount: expense.amount,
            currency: expense.currency,
            expenseDate: expense.expenseDate?.split('T')[0] ?? '',
            vendor: expense.vendor,
            receiptNumber: expense.receiptNumber,
            notes: expense.notes
        };
        this.showDialog = true;
    }

    saveExpense(): void {
        this.saving = true;
        const obs = this.isEdit && this.editingId
            ? this.financeService.updateExpense(this.editingId, this.form)
            : this.financeService.createExpense(this.form);
        obs.subscribe({
            next: () => {
                this.saving = false; this.showDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `Expense ${this.isEdit ? 'updated' : 'created'}` });
                this.loadExpenses();
            },
            error: () => { this.saving = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save expense' }); }
        });
    }

    confirmDelete(expense: Expense): void {
        this.confirmationService.confirm({
            message: `Delete expense "${expense.expenseName}"? This action cannot be undone.`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.deleteExpense(expense.id)
        });
    }

    private deleteExpense(id: number): void {
        this.financeService.deleteExpense(id).subscribe({
            next: () => { this.expenses = this.expenses.filter(e => e.id !== id); this.cdr.detectChanges(); this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Expense deleted' }); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' })
        });
    }

    getTotalExpenses(): number { return this.expenses.reduce((s, e) => s + e.amount, 0); }
}
