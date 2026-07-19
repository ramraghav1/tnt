import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ===========================
// Country
// ===========================
export interface Country {
    id: number;
    name: string;
    iso2Code: string;
    iso3Code: string;
    phoneCode: string;
    currencyCode: string;
    currencyName: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateCountryRequest {
    name: string;
    iso2Code: string;
    iso3Code: string;
    phoneCode: string;
    currencyCode: string;
    currencyName: string;
    isActive: boolean;
}

export interface UpdateCountryRequest {
    name?: string;
    iso2Code?: string;
    iso3Code?: string;
    phoneCode?: string;
    currencyCode?: string;
    currencyName?: string;
    isActive?: boolean;
}

// ===========================
// Payment Type
// ===========================
export interface PaymentType {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreatePaymentTypeRequest {
    name: string;
    description: string;
    isActive: boolean;
}

export interface UpdatePaymentTypeRequest {
    name?: string;
    description?: string;
    isActive?: boolean;
}

// ===========================
// Agent
// ===========================
export interface Agent {
    id: number;
    name: string;
    countryId: number;
    countryName: string;
    categoryId: number | null;
    categoryName: string | null;
    agentType: string;
    address: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateAgentRequest {
    name: string;
    countryId: number;
    categoryId?: number | null;
    agentType: string;
    address: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    isActive: boolean;
}

export interface UpdateAgentRequest {
    name?: string;
    categoryId?: number | null;
    agentType?: string;
    address?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive?: boolean;
}

// ===========================
// Branch
// ===========================
export interface Branch {
    id: number;
    agentId: number;
    agentName: string;
    branchName: string;
    branchCode: string;
    address: string;
    state: string;
    district: string;
    locallevel: string;
    wardNumber: number | null;
    zipcode: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateBranchRequest {
    agentId: number;
    branchName: string;
    branchCode: string;
    address: string;
    state: string;
    district: string;
    locallevel: string;
    wardNumber: number | null;
    zipcode: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
}

export interface UpdateBranchRequest {
    branchName?: string;
    branchCode?: string;
    address?: string;
    state?: string;
    district?: string;
    locallevel?: string;
    wardNumber?: number | null;
    zipcode?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive?: boolean;
}

// ===========================
// Branch User
// ===========================
export interface BranchUser {
    id: number;
    branchId: number;
    branchName: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    username: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateBranchUserRequest {
    branchId: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    username: string;
}

export interface UpdateBranchUserRequest {
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    username?: string;
    isActive?: boolean;
}

// ===========================
// Service Charge Setup
// ===========================
export interface ServiceChargeSlab {
    id?: number;
    minAmount: number;
    maxAmount: number;
    chargeType: string; // Flat | Percentage
    chargeValue: number;
    currency: string;
}

export interface ServiceChargeSetup {
    id: number;
    sendingCountryId: number;
    sendingCountryName: string;
    receivingCountryId: number;
    receivingCountryName: string;
    paymentTypeId: number;
    paymentTypeName: string;
    agentId: number | null;
    agentName: string | null;
    chargeMode: string; // Flat | Range
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    slabs: ServiceChargeSlab[];
}

export interface CreateServiceChargeSetupRequest {
    sendingCountryId: number;
    receivingCountryId: number;
    paymentTypeId: number;
    agentId: number | null;
    chargeMode: string;
    isActive: boolean;
    createdBy: string;
    slabs: ServiceChargeSlab[];
}

export interface UpdateServiceChargeSetupRequest {
    sendingCountryId?: number;
    receivingCountryId?: number;
    paymentTypeId?: number;
    agentId?: number | null;
    chargeMode?: string;
    isActive?: boolean;
    slabs?: ServiceChargeSlab[];
}

export interface CalculateChargeRequest {
    sendingCountryId: number;
    receivingCountryId: number;
    paymentTypeId: number;
    agentId: number | null;
    amount: number;
}

export interface CalculateChargeResponse {
    chargeType: string;
    chargeValue: number;
    calculatedCharge: number;
    currency: string;
}

// ===========================
// Service
// ===========================

// ===========================
// FX Rate Setup
// ===========================
export interface FxRateSetup {
    id: number;
    sendingCountryId: number;
    sendingCountryName: string;
    receivingCountryId: number;
    receivingCountryName: string;
    paymentTypeId: number;
    paymentTypeName: string;
    agentId: number | null;
    agentName: string | null;
    sendingCurrency: string;
    receivingCurrency: string;
    settlementCurrency: string | null;
    customerRate: number;
    settlementRate: number | null;
    crossRate: number | null;
    marginType: string | null;
    marginValue: number | null;
    validFrom: string | null;
    validTo: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
    history?: FxRateHistoryItem[];
}

export interface FxRateHistoryItem {
    id: number;
    previousCustomerRate: number | null;
    newCustomerRate: number;
    previousSettlementRate: number | null;
    newSettlementRate: number | null;
    previousCrossRate: number | null;
    newCrossRate: number | null;
    changedBy: string | null;
    changedAt: string;
    reason: string | null;
}

export interface CreateFxRateRequest {
    sendingCountryId: number;
    receivingCountryId: number;
    paymentTypeId: number;
    agentId: number | null;
    sendingCurrency: string;
    receivingCurrency: string;
    settlementCurrency: string | null;
    customerRate: number;
    settlementRate: number | null;
    crossRate: number | null;
    marginType: string | null;
    marginValue: number | null;
    validFrom: string | null;
    validTo: string | null;
    createdBy: string | null;
}

export interface UpdateFxRateRequest {
    sendingCurrency?: string;
    receivingCurrency?: string;
    settlementCurrency?: string | null;
    customerRate?: number;
    settlementRate?: number | null;
    crossRate?: number | null;
    marginType?: string | null;
    marginValue?: number | null;
    validFrom?: string | null;
    validTo?: string | null;
    isActive?: boolean;
    updatedBy?: string | null;
}

export interface ConvertRequest {
    sendingCountryId: number;
    receivingCountryId: number;
    paymentTypeId: number;
    agentId: number | null;
    amount: number;
}

export interface ConvertResponse {
    sendAmount: number;
    sendingCurrency: string;
    customerRate: number;
    receiveAmount: number;
    receivingCurrency: string;
    settlementRate: number | null;
    settlementAmount: number | null;
    settlementCurrency: string | null;
    crossRate: number | null;
}

// ===========================
// Administrative Division
// ===========================
export interface AdministrativeDivision {
    id: number;
    countryId: number;
    name: string;
    code: string | null;
    divisionLevel: number;
    parentId: number | null;
    isActive: boolean;
    createdAt: string;
}

// ===========================
// Agent Account
// ===========================
export interface AgentAccount {
    id: number;
    agentId: number;
    agentName: string | null;
    accountName: string;
    accountNumber: string;
    bankName: string | null;
    bankBranch: string | null;
    bankDetails: string | null;
    currencyCode: string;
    balance: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateAgentAccountRequest {
    agentId: number;
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    bankBranch?: string;
    bankDetails?: string;
    currencyCode: string;
    balance: number;
}

export interface UpdateAgentAccountRequest {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    bankBranch?: string;
    bankDetails?: string;
    isActive?: boolean;
}

// ===========================
// Agent Ledger Entry
// ===========================
export interface AgentLedgerEntry {
    id: number;
    agentAccountId: number;
    transactionType: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    referenceType: string;
    referenceId: string | null;
    description: string | null;
    createdAt: string;
    createdBy: string | null;
}

export interface CreateLedgerEntryRequest {
    agentAccountId: number;
    transactionType: string;
    amount: number;
    referenceType: string;
    referenceId?: string;
    description?: string;
    createdBy?: string;
}

export interface StatementResponse {
    agentAccountId: number;
    agentName: string | null;
    accountName: string | null;
    accountNumber: string | null;
    currencyCode: string | null;
    openingBalance: number;
    closingBalance: number;
    totalDebit: number;
    totalCredit: number;
    fromDate: string | null;
    toDate: string | null;
    entries: AgentLedgerEntry[];
}

// ===========================
// Configuration Type
// ===========================
export interface ConfigurationType {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateConfigurationTypeRequest {
    name: string;
}

export interface UpdateConfigurationTypeRequest {
    name?: string;
    isActive?: boolean;
}

// ===========================
// Configuration
// ===========================
export interface Configuration {
    id: number;
    configurationTypeId: number;
    configurationTypeName: string;
    code: string;
    displayName: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateConfigurationRequest {
    configurationTypeId: number;
    code: string;
    displayName: string;
}

export interface UpdateConfigurationRequest {
    code?: string;
    displayName?: string;
    isActive?: boolean;
}

// ===========================
// Domestic Service Charge Setup
// ===========================
export interface DomesticServiceChargeSlab {
    id?: number;
    minAmount: number;
    maxAmount: number;
    chargeType: string;
    chargeValue: number;
    sendCommission: number;
    payoutCommission: number;
    currency: string;
}

export interface DomesticServiceChargeSetup {
    id: number;
    fromCategoryId: number;
    fromCategoryName: string;
    toCategoryId: number;
    toCategoryName: string;
    paymentTypeId: number;
    paymentTypeName: string;
    agentId: number | null;
    agentName: string | null;
    chargeMode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slabs: DomesticServiceChargeSlab[];
}

export interface CreateDomesticServiceChargeSetupRequest {
    fromCategoryId: number;
    toCategoryId: number;
    paymentTypeId: number;
    agentId: number | null;
    chargeMode: string;
    slabs: DomesticServiceChargeSlab[];
}

export interface UpdateDomesticServiceChargeSetupRequest {
    chargeMode?: string;
    isActive?: boolean;
    slabs?: DomesticServiceChargeSlab[];
}

export interface DomesticCalculateChargeRequest {
    fromCategoryId: number;
    toCategoryId: number;
    paymentTypeId: number;
    agentId: number | null;
    amount: number;
}

export interface DomesticCalculateChargeResponse {
    sendAmount: number;
    serviceCharge: number;
    chargeType: string;
    chargeValue: number;
    sendCommission: number;
    payoutCommission: number;
    totalDeducted: number;
    currency: string;
}

// ===========================
// Transaction
// ===========================
export interface CreateTransactionRequest {
    paymentType: string;
    payoutLocation: string;
    collectedAmount: number;
    serviceFee: number;
    transferAmount: number;
    senderName: string;
    senderAddress: string;
    senderMobile: string;
    receiverName: string;
    receiverAddress: string;
    receiverMobile: string;
    senderAgentId?: number | null;
    senderBranchId?: number | null;
    payoutAgentId?: number | null;
    payoutBranchId?: number | null;
}

export interface CreateTransactionResponse {
    transactionId: number;
    referenceNumber: string;
}

export interface TransactionDetail {
    transactionId: number;
    referenceNumber: string;
    paymentType: string;
    payoutLocation: string;
    collectedAmount: number;
    serviceFee: number;
    transferAmount: number;
    senderName: string;
    senderAddress: string;
    senderMobile: string;
    receiverName: string;
    receiverAddress: string;
    receiverMobile: string;
    senderAgentId: number | null;
    senderAgentName: string | null;
    senderBranchId: number | null;
    senderBranchName: string | null;
    payoutAgentId: number | null;
    payoutAgentName: string | null;
    payoutBranchId: number | null;
    payoutBranchName: string | null;
    status: string | null;
    createdAt: string | null;
}

// ===========================
// Voucher
// ===========================
export interface Voucher {
    id: number;
    voucherNumber: string;
    voucherDate: string;
    entityType: string; // AGENT or BRANCH
    agentId: number | null;
    agentName: string | null;
    branchId: number | null;
    branchName: string | null;
    agentAccountId: number | null;
    amount: number;
    mode: string; // CR or DR
    balanceBefore: number;
    balanceAfter: number;
    referenceType: string;
    referenceId: string | null;
    description: string | null;
    createdAt: string;
    createdBy: string | null;
}

export interface CreateVoucherRequest {
    entityType: string;
    agentId?: number | null;
    branchId?: number | null;
    agentAccountId?: number | null;
    amount: number;
    mode: string;
    referenceType: string;
    referenceId?: string;
    description?: string;
    createdBy?: string;
}

export interface DailySummary {
    date: string;
    openingBalance: number;
    totalCredit: number;
    totalDebit: number;
    closingBalance: number;
    transactionCount: number;
}

export interface AccountStatementResponse {
    entityType: string;
    agentId: number | null;
    agentName: string | null;
    branchId: number | null;
    branchName: string | null;
    agentAccountId: number | null;
    currencyCode: string | null;
    openingBalance: number;
    closingBalance: number;
    totalCredit: number;
    totalDebit: number;
    fromDate: string | null;
    toDate: string | null;
    entries: Voucher[];
    dailySummaries: DailySummary[];
}

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RemittanceService {
    private baseUrl = `${environment.apiBaseUrl}/remittance`;

    constructor(private http: HttpClient) {}

    // --- Country ---
    getCountries(): Observable<Country[]> {
        return this.http.get<Country[]>(`${this.baseUrl}/countries`);
    }
    getCountry(id: number): Observable<Country> {
        return this.http.get<Country>(`${this.baseUrl}/countries/${id}`);
    }
    createCountry(req: CreateCountryRequest): Observable<Country> {
        return this.http.post<Country>(`${this.baseUrl}/countries`, req);
    }
    updateCountry(id: number, req: UpdateCountryRequest): Observable<Country> {
        return this.http.put<Country>(`${this.baseUrl}/countries/${id}`, req);
    }
    deleteCountry(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/countries/${id}`);
    }

    // --- Payment Type ---
    getPaymentTypes(): Observable<PaymentType[]> {
        return this.http.get<PaymentType[]>(`${this.baseUrl}/payment-types`);
    }
    getPaymentType(id: number): Observable<PaymentType> {
        return this.http.get<PaymentType>(`${this.baseUrl}/payment-types/${id}`);
    }
    createPaymentType(req: CreatePaymentTypeRequest): Observable<PaymentType> {
        return this.http.post<PaymentType>(`${this.baseUrl}/payment-types`, req);
    }
    updatePaymentType(id: number, req: UpdatePaymentTypeRequest): Observable<PaymentType> {
        return this.http.put<PaymentType>(`${this.baseUrl}/payment-types/${id}`, req);
    }
    deletePaymentType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/payment-types/${id}`);
    }

    // --- Agent ---
    getAgents(): Observable<Agent[]> {
        return this.http.get<Agent[]>(`${this.baseUrl}/agents`);
    }
    getAgentsByCountry(countryId: number): Observable<Agent[]> {
        return this.http.get<Agent[]>(`${this.baseUrl}/agents/by-country/${countryId}`);
    }
    getAgent(id: number): Observable<Agent> {
        return this.http.get<Agent>(`${this.baseUrl}/agents/${id}`);
    }
    createAgent(req: CreateAgentRequest): Observable<Agent> {
        return this.http.post<Agent>(`${this.baseUrl}/agents`, req);
    }
    updateAgent(id: number, req: UpdateAgentRequest): Observable<Agent> {
        return this.http.put<Agent>(`${this.baseUrl}/agents/${id}`, req);
    }
    deleteAgent(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/agents/${id}`);
    }

    // --- Service Charge Setup ---
    getServiceCharges(): Observable<ServiceChargeSetup[]> {
        return this.http.get<ServiceChargeSetup[]>(`${this.baseUrl}/service-charges`);
    }
    getServiceCharge(id: number): Observable<ServiceChargeSetup> {
        return this.http.get<ServiceChargeSetup>(`${this.baseUrl}/service-charges/${id}`);
    }
    createServiceCharge(req: CreateServiceChargeSetupRequest): Observable<ServiceChargeSetup> {
        return this.http.post<ServiceChargeSetup>(`${this.baseUrl}/service-charges`, req);
    }
    updateServiceCharge(id: number, req: UpdateServiceChargeSetupRequest): Observable<ServiceChargeSetup> {
        return this.http.put<ServiceChargeSetup>(`${this.baseUrl}/service-charges/${id}`, req);
    }
    deleteServiceCharge(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/service-charges/${id}`);
    }
    calculateCharge(req: CalculateChargeRequest): Observable<CalculateChargeResponse> {
        return this.http.post<CalculateChargeResponse>(`${this.baseUrl}/service-charges/calculate`, req);
    }

    // --- FX Rate Setup ---
    getFxRates(): Observable<FxRateSetup[]> {
        return this.http.get<FxRateSetup[]>(`${this.baseUrl}/fx-rates`);
    }
    getFxRate(id: number): Observable<FxRateSetup> {
        return this.http.get<FxRateSetup>(`${this.baseUrl}/fx-rates/${id}`);
    }
    createFxRate(req: CreateFxRateRequest): Observable<FxRateSetup> {
        return this.http.post<FxRateSetup>(`${this.baseUrl}/fx-rates`, req);
    }
    updateFxRate(id: number, req: UpdateFxRateRequest): Observable<FxRateSetup> {
        return this.http.put<FxRateSetup>(`${this.baseUrl}/fx-rates/${id}`, req);
    }
    deleteFxRate(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/fx-rates/${id}`);
    }
    convertAmount(req: ConvertRequest): Observable<ConvertResponse> {
        return this.http.post<ConvertResponse>(`${this.baseUrl}/fx-rates/convert`, req);
    }

    // --- Branch ---
    getBranches(): Observable<Branch[]> {
        return this.http.get<Branch[]>(`${this.baseUrl}/branches`);
    }
    getBranchesByAgent(agentId: number): Observable<Branch[]> {
        return this.http.get<Branch[]>(`${this.baseUrl}/branches/by-agent/${agentId}`);
    }
    getBranch(id: number): Observable<Branch> {
        return this.http.get<Branch>(`${this.baseUrl}/branches/${id}`);
    }
    createBranch(req: CreateBranchRequest): Observable<Branch> {
        return this.http.post<Branch>(`${this.baseUrl}/branches`, req);
    }
    updateBranch(id: number, req: UpdateBranchRequest): Observable<Branch> {
        return this.http.put<Branch>(`${this.baseUrl}/branches/${id}`, req);
    }
    deleteBranch(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/branches/${id}`);
    }

    // --- Branch User ---
    getBranchUsers(branchId: number): Observable<BranchUser[]> {
        return this.http.get<BranchUser[]>(`${this.baseUrl}/branch-users/by-branch/${branchId}`);
    }
    getBranchUser(id: number): Observable<BranchUser> {
        return this.http.get<BranchUser>(`${this.baseUrl}/branch-users/${id}`);
    }
    createBranchUser(req: CreateBranchUserRequest): Observable<BranchUser> {
        return this.http.post<BranchUser>(`${this.baseUrl}/branch-users`, req);
    }
    updateBranchUser(id: number, req: UpdateBranchUserRequest): Observable<BranchUser> {
        return this.http.put<BranchUser>(`${this.baseUrl}/branch-users/${id}`, req);
    }
    deleteBranchUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/branch-users/${id}`);
    }

    // --- Transaction ---
    private txBaseUrl = `${environment.apiBaseUrl}/Transaction`;

    createTransaction(req: CreateTransactionRequest): Observable<CreateTransactionResponse> {
        return this.http.post<CreateTransactionResponse>(`${this.txBaseUrl}/create`, req);
    }

    getTransactions(fromDate?: string, toDate?: string): Observable<TransactionDetail[]> {
        let params: any = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        return this.http.get<TransactionDetail[]>(`${this.txBaseUrl}/list`, { params });
    }

    // --- Administrative Divisions ---
    getAdminDivisionsByCountry(countryId: number): Observable<AdministrativeDivision[]> {
        countryId=121;
        return this.http.get<AdministrativeDivision[]>(`${this.baseUrl}/administrative-divisions/by-country/${countryId}`);
    }

    getAdminDivisionsByCountryAndLevel(countryId: number, level: number): Observable<AdministrativeDivision[]> {
        return this.http.get<AdministrativeDivision[]>(`${this.baseUrl}/administrative-divisions/by-country/${countryId}/level/${level}`);
    }

    getAdminDivisionChildren(parentId: number): Observable<AdministrativeDivision[]> {
        return this.http.get<AdministrativeDivision[]>(`${this.baseUrl}/administrative-divisions/children/${parentId}`);
    }

    // --- Agent Accounts ---
    createAgentAccount(req: CreateAgentAccountRequest): Observable<AgentAccount> {
        return this.http.post<AgentAccount>(`${this.baseUrl}/agent-accounts`, req);
    }

    getAgentAccounts(): Observable<AgentAccount[]> {
        return this.http.get<AgentAccount[]>(`${this.baseUrl}/agent-accounts`);
    }

    getAgentAccountsByAgent(agentId: number): Observable<AgentAccount[]> {
        return this.http.get<AgentAccount[]>(`${this.baseUrl}/agent-accounts/by-agent/${agentId}`);
    }

    getAgentAccountById(id: number): Observable<AgentAccount> {
        return this.http.get<AgentAccount>(`${this.baseUrl}/agent-accounts/${id}`);
    }

    getAgentAccountByAgentAndCurrency(agentId: number, currencyCode: string): Observable<AgentAccount> {
        return this.http.get<AgentAccount>(`${this.baseUrl}/agent-accounts/by-agent/${agentId}/currency/${currencyCode}`);
    }

    updateAgentAccount(id: number, req: UpdateAgentAccountRequest): Observable<AgentAccount> {
        return this.http.put<AgentAccount>(`${this.baseUrl}/agent-accounts/${id}`, req);
    }

    deleteAgentAccount(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/agent-accounts/${id}`);
    }

    // --- Agent Ledger ---
    postLedgerEntry(req: CreateLedgerEntryRequest): Observable<AgentLedgerEntry> {
        return this.http.post<AgentLedgerEntry>(`${this.baseUrl}/agent-ledger`, req);
    }

    getLedgerByAccount(agentAccountId: number): Observable<AgentLedgerEntry[]> {
        return this.http.get<AgentLedgerEntry[]>(`${this.baseUrl}/agent-ledger/by-account/${agentAccountId}`);
    }

    getStatement(agentAccountId: number, fromDate?: string, toDate?: string): Observable<StatementResponse> {
        let params: any = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        return this.http.get<StatementResponse>(`${this.baseUrl}/agent-ledger/statement/${agentAccountId}`, { params });
    }

    // --- Configuration Types ---
    getConfigurationTypes(): Observable<ConfigurationType[]> {
        return this.http.get<ConfigurationType[]>(`${this.baseUrl}/configuration-types`);
    }
    getConfigurationType(id: number): Observable<ConfigurationType> {
        return this.http.get<ConfigurationType>(`${this.baseUrl}/configuration-types/${id}`);
    }
    createConfigurationType(req: CreateConfigurationTypeRequest): Observable<ConfigurationType> {
        return this.http.post<ConfigurationType>(`${this.baseUrl}/configuration-types`, req);
    }
    updateConfigurationType(id: number, req: UpdateConfigurationTypeRequest): Observable<ConfigurationType> {
        return this.http.put<ConfigurationType>(`${this.baseUrl}/configuration-types/${id}`, req);
    }
    deleteConfigurationType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/configuration-types/${id}`);
    }

    // --- Configurations ---
    getConfigurations(): Observable<Configuration[]> {
        return this.http.get<Configuration[]>(`${this.baseUrl}/configurations`);
    }
    getConfigurationsByType(configurationTypeId: number): Observable<Configuration[]> {
        return this.http.get<Configuration[]>(`${this.baseUrl}/configurations/by-type/${configurationTypeId}`);
    }
    getConfigurationsByTypeName(typeName: string): Observable<Configuration[]> {
        return this.http.get<Configuration[]>(`${this.baseUrl}/configurations/by-type-name/${encodeURIComponent(typeName)}`);
    }
    getConfiguration(id: number): Observable<Configuration> {
        return this.http.get<Configuration>(`${this.baseUrl}/configurations/${id}`);
    }
    createConfiguration(req: CreateConfigurationRequest): Observable<Configuration> {
        return this.http.post<Configuration>(`${this.baseUrl}/configurations`, req);
    }
    updateConfiguration(id: number, req: UpdateConfigurationRequest): Observable<Configuration> {
        return this.http.put<Configuration>(`${this.baseUrl}/configurations/${id}`, req);
    }
    deleteConfiguration(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/configurations/${id}`);
    }

    // --- Domestic Service Charge Setup ---
    getDomesticServiceCharges(): Observable<DomesticServiceChargeSetup[]> {
        return this.http.get<DomesticServiceChargeSetup[]>(`${this.baseUrl}/domestic-service-charges`);
    }
    getDomesticServiceCharge(id: number): Observable<DomesticServiceChargeSetup> {
        return this.http.get<DomesticServiceChargeSetup>(`${this.baseUrl}/domestic-service-charges/${id}`);
    }
    createDomesticServiceCharge(req: CreateDomesticServiceChargeSetupRequest): Observable<DomesticServiceChargeSetup> {
        return this.http.post<DomesticServiceChargeSetup>(`${this.baseUrl}/domestic-service-charges`, req);
    }
    updateDomesticServiceCharge(id: number, req: UpdateDomesticServiceChargeSetupRequest): Observable<DomesticServiceChargeSetup> {
        return this.http.put<DomesticServiceChargeSetup>(`${this.baseUrl}/domestic-service-charges/${id}`, req);
    }
    deleteDomesticServiceCharge(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/domestic-service-charges/${id}`);
    }
    calculateDomesticCharge(req: DomesticCalculateChargeRequest): Observable<DomesticCalculateChargeResponse> {
        return this.http.post<DomesticCalculateChargeResponse>(`${this.baseUrl}/domestic-service-charges/calculate`, req);
    }

    // --- Vouchers ---
    postVoucher(req: CreateVoucherRequest): Observable<Voucher> {
        return this.http.post<Voucher>(`${this.baseUrl}/vouchers`, req);
    }

    getVouchers(): Observable<Voucher[]> {
        return this.http.get<Voucher[]>(`${this.baseUrl}/vouchers`);
    }

    getVoucherById(id: number): Observable<Voucher> {
        return this.http.get<Voucher>(`${this.baseUrl}/vouchers/${id}`);
    }

    getVouchersByAgent(agentId: number): Observable<Voucher[]> {
        return this.http.get<Voucher[]>(`${this.baseUrl}/vouchers/by-agent/${agentId}`);
    }

    getVouchersByBranch(branchId: number): Observable<Voucher[]> {
        return this.http.get<Voucher[]>(`${this.baseUrl}/vouchers/by-branch/${branchId}`);
    }

    getAccountStatement(entityType: string, agentId?: number, branchId?: number, agentAccountId?: number, fromDate?: string, toDate?: string): Observable<AccountStatementResponse> {
        let params: any = { entityType };
        if (agentId) params.agentId = agentId;
        if (branchId) params.branchId = branchId;
        if (agentAccountId) params.agentAccountId = agentAccountId;
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        return this.http.get<AccountStatementResponse>(`${this.baseUrl}/vouchers/statement`, { params });
    }
}
