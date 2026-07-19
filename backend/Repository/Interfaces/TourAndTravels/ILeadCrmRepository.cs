using System.Collections.Generic;
using static Repository.DataModels.TourAndTravels.LeadCrmDTO;

namespace Repository.Interfaces.TourAndTravels
{
    public interface ILeadCrmRepository
    {
        // Leads
        LeadResponse CreateLead(CreateLeadRequest request);
        LeadResponse? UpdateLead(long id, UpdateLeadRequest request);
        List<LeadResponse> GetAllLeads(long tenantId);
        LeadResponse? GetLeadById(long id);
        bool DeleteLead(long id);
        bool ConvertLeadToProposal(long leadId, long proposalId);

        // Follow-ups
        FollowUpResponse CreateFollowUp(CreateFollowUpRequest request);
        List<FollowUpResponse> GetFollowUpsByLead(long leadId);
        List<FollowUpResponse> GetAllFollowUps(long tenantId);

        // Quotations
        QuotationResponse CreateQuotation(CreateQuotationRequest request);
        List<QuotationResponse> GetAllQuotations(long tenantId);
        QuotationResponse? GetQuotationById(long id);
        bool UpdateQuotationStatus(long id, string status);

        // Amendments
        AmendmentResponse CreateAmendment(CreateAmendmentRequest request);
        List<AmendmentResponse> GetAllAmendments(long tenantId);
        bool UpdateAmendmentStatus(long id, string status, string? approvedBy);

        // Contracts
        ContractResponse CreateContract(CreateContractRequest request);
        List<ContractResponse> GetAllContracts(long tenantId);
        bool UpdateContractStatus(long id, string status);

        // B2B Agents
        B2BAgentResponse CreateAgent(CreateB2BAgentRequest request);
        List<B2BAgentResponse> GetAllAgents(long tenantId);
        B2BAgentResponse? GetAgentById(long id);
        bool UpdateAgentStatus(long id, string status);

        // B2B Pricing
        AgentPricingResponse CreateAgentPricing(CreateAgentPricingRequest request);
        List<AgentPricingResponse> GetAgentPricing(long agentId);
        bool DeleteAgentPricing(long id);

        // B2B Ledger
        LedgerEntryResponse CreateLedgerEntry(CreateLedgerEntryRequest request);
        List<LedgerEntryResponse> GetAgentLedger(long agentId);

        // Supplier Payments
        SupplierPaymentResponse CreateSupplierPayment(CreateSupplierPaymentRequest request);
        List<SupplierPaymentResponse> GetAllSupplierPayments(long tenantId);
        bool UpdateSupplierPaymentStatus(long id, string status);

        // Service Vouchers
        VoucherResponse CreateVoucher(CreateVoucherRequest request);
        List<VoucherResponse> GetAllVouchers(long tenantId);
        bool UpdateVoucherStatus(long id, string status);

        // Rooming
        RoomingResponse CreateRooming(CreateRoomingRequest request);
        List<RoomingResponse> GetRoomingByDeparture(long departureId);
        bool DeleteRooming(long id);
    }
}
