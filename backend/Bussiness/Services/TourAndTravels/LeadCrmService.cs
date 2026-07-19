using System;
using System.Collections.Generic;
using AutoMapper;
using Domain.Models.TourAndTravels;
using Repository.Interfaces.TourAndTravels;
using static Domain.Models.TourAndTravels.LeadCrm;

namespace Bussiness.Services.TourAndTravels
{
    public interface ILeadCrmService
    {
        // Leads
        LeadResponse CreateLead(CreateLeadRequest request, long tenantId);
        LeadResponse? UpdateLead(long id, UpdateLeadRequest request);
        List<LeadResponse> GetAllLeads(long tenantId);
        LeadResponse? GetLeadById(long id);
        bool DeleteLead(long id);
        bool ConvertLeadToProposal(long leadId, long proposalId);

        // Follow-ups
        FollowUpResponse CreateFollowUp(CreateFollowUpRequest request, string? createdBy);
        List<FollowUpResponse> GetFollowUpsByLead(long leadId);
        List<FollowUpResponse> GetAllFollowUps(long tenantId);

        // Quotations
        QuotationResponse CreateQuotation(CreateQuotationRequest request, long tenantId);
        List<QuotationResponse> GetAllQuotations(long tenantId);
        QuotationResponse? GetQuotationById(long id);
        bool UpdateQuotationStatus(long id, string status);

        // Amendments
        AmendmentResponse CreateAmendment(CreateAmendmentRequest request, long tenantId, string? requestedBy);
        List<AmendmentResponse> GetAllAmendments(long tenantId);
        bool UpdateAmendmentStatus(long id, string status, string? approvedBy);

        // Contracts
        ContractResponse CreateContract(CreateContractRequest request, long tenantId);
        List<ContractResponse> GetAllContracts(long tenantId);
        bool UpdateContractStatus(long id, string status);

        // B2B Agents
        B2BAgentResponse CreateAgent(CreateB2BAgentRequest request, long tenantId);
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
        SupplierPaymentResponse CreateSupplierPayment(CreateSupplierPaymentRequest request, long tenantId);
        List<SupplierPaymentResponse> GetAllSupplierPayments(long tenantId);
        bool UpdateSupplierPaymentStatus(long id, string status);

        // Vouchers
        VoucherResponse CreateVoucher(CreateVoucherRequest request, long tenantId);
        List<VoucherResponse> GetAllVouchers(long tenantId);
        bool UpdateVoucherStatus(long id, string status);

        // Rooming
        RoomingResponse CreateRooming(CreateRoomingRequest request);
        List<RoomingResponse> GetRoomingByDeparture(long departureId);
        bool DeleteRooming(long id);
    }

    public class LeadCrmService : ILeadCrmService
    {
        private readonly ILeadCrmRepository _repository;
        private readonly IMapper _mapper;

        public LeadCrmService(ILeadCrmRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        // Leads
        public LeadResponse CreateLead(CreateLeadRequest request, long tenantId)
        {
            var dto = _mapper.Map<Repository.DataModels.TourAndTravels.LeadCrmDTO.CreateLeadRequest>(request);
            dto.TenantId = tenantId;
            var result = _repository.CreateLead(dto);
            return _mapper.Map<LeadResponse>(result);
        }

        public LeadResponse? UpdateLead(long id, UpdateLeadRequest request)
        {
            var dto = _mapper.Map<Repository.DataModels.TourAndTravels.LeadCrmDTO.UpdateLeadRequest>(request);
            var result = _repository.UpdateLead(id, dto);
            return result != null ? _mapper.Map<LeadResponse>(result) : null;
        }

        public List<LeadResponse> GetAllLeads(long tenantId)
        {
            var results = _repository.GetAllLeads(tenantId);
            return _mapper.Map<List<LeadResponse>>(results);
        }

        public LeadResponse? GetLeadById(long id)
        {
            var result = _repository.GetLeadById(id);
            return result != null ? _mapper.Map<LeadResponse>(result) : null;
        }

        public bool DeleteLead(long id) => _repository.DeleteLead(id);
        public bool ConvertLeadToProposal(long leadId, long proposalId) => _repository.ConvertLeadToProposal(leadId, proposalId);

        // Follow-ups
        public FollowUpResponse CreateFollowUp(CreateFollowUpRequest request, string? createdBy)
        {
            var dto = _mapper.Map<Repository.DataModels.TourAndTravels.LeadCrmDTO.CreateFollowUpRequest>(request);
            dto.CreatedBy = createdBy;
            var result = _repository.CreateFollowUp(dto);
            return _mapper.Map<FollowUpResponse>(result);
        }

        public List<FollowUpResponse> GetFollowUpsByLead(long leadId)
        {
            return _mapper.Map<List<FollowUpResponse>>(_repository.GetFollowUpsByLead(leadId));
        }

        public List<FollowUpResponse> GetAllFollowUps(long tenantId)
        {
            return _mapper.Map<List<FollowUpResponse>>(_repository.GetAllFollowUps(tenantId));
        }

        // Quotations
        public QuotationResponse CreateQuotation(CreateQuotationRequest request, long tenantId)
        {
            var dto = _mapper.Map<Repository.DataModels.TourAndTravels.LeadCrmDTO.CreateQuotationRequest>(request);
            dto.TenantId = tenantId;
            var result = _repository.CreateQuotation(dto);
            return _mapper.Map<QuotationResponse>(result);
        }

        public List<QuotationResponse> GetAllQuotations(long tenantId) =>
            _mapper.Map<List<QuotationResponse>>(_repository.GetAllQuotations(tenantId));

        public QuotationResponse? GetQuotationById(long id)
        {
            var result = _repository.GetQuotationById(id);
            return result != null ? _mapper.Map<QuotationResponse>(result) : null;
        }

        public bool UpdateQuotationStatus(long id, string status) => _repository.UpdateQuotationStatus(id, status);

        // Amendments
        public AmendmentResponse CreateAmendment(CreateAmendmentRequest request, long tenantId, string? requestedBy)
        {
            var dto = _mapper.Map<Repository.DataModels.TourAndTravels.LeadCrmDTO.CreateAmendmentRequest>(request);
            dto.TenantId = tenantId;
            dto.RequestedBy = requestedBy;
            return _mapper.Map<AmendmentResponse>(_repository.CreateAmendment(dto));
        }

        public List<AmendmentResponse> GetAllAmendments(long tenantId) =>
            _mapper.Map<List<AmendmentResponse>>(_repository.GetAllAmendments(tenantId));

        public bool UpdateAmendmentStatus(long id, string status, string? approvedBy) =>
            _repository.UpdateAmendmentStatus(id, status, approvedBy);

        // Contracts
        public ContractResponse CreateContract(CreateContractRequest request, long tenantId)
        {
            var dto = _mapper.Map<Repository.DataModels.TourAndTravels.LeadCrmDTO.CreateContractRequest>(request);
            dto.TenantId = tenantId;
            return _mapper.Map<ContractResponse>(_repository.CreateContract(dto));
        }

        public List<ContractResponse> GetAllContracts(long tenantId) =>
            _mapper.Map<List<ContractResponse>>(_repository.GetAllContracts(tenantId));

        public bool UpdateContractStatus(long id, string status) => _repository.UpdateContractStatus(id, status);

        // B2B Agents
        public B2BAgentResponse CreateAgent(CreateB2BAgentRequest request, long tenantId)
        {
            var dto = _mapper.Map<Repository.DataModels.TourAndTravels.LeadCrmDTO.CreateB2BAgentRequest>(request);
            dto.TenantId = tenantId;
            return _mapper.Map<B2BAgentResponse>(_repository.CreateAgent(dto));
        }

        public List<B2BAgentResponse> GetAllAgents(long tenantId) =>
            _mapper.Map<List<B2BAgentResponse>>(_repository.GetAllAgents(tenantId));

        public B2BAgentResponse? GetAgentById(long id)
        {
            var result = _repository.GetAgentById(id);
            return result != null ? _mapper.Map<B2BAgentResponse>(result) : null;
        }

        public bool UpdateAgentStatus(long id, string status) => _repository.UpdateAgentStatus(id, status);

        // B2B Pricing
        public AgentPricingResponse CreateAgentPricing(CreateAgentPricingRequest request)
        {
            var dto = _mapper.Map<Repository.DataModels.TourAndTravels.LeadCrmDTO.CreateAgentPricingRequest>(request);
            return _mapper.Map<AgentPricingResponse>(_repository.CreateAgentPricing(dto));
        }

        public List<AgentPricingResponse> GetAgentPricing(long agentId) =>
            _mapper.Map<List<AgentPricingResponse>>(_repository.GetAgentPricing(agentId));

        public bool DeleteAgentPricing(long id) => _repository.DeleteAgentPricing(id);

        // B2B Ledger
        public LedgerEntryResponse CreateLedgerEntry(CreateLedgerEntryRequest request)
        {
            var dto = _mapper.Map<Repository.DataModels.TourAndTravels.LeadCrmDTO.CreateLedgerEntryRequest>(request);
            return _mapper.Map<LedgerEntryResponse>(_repository.CreateLedgerEntry(dto));
        }

        public List<LedgerEntryResponse> GetAgentLedger(long agentId) =>
            _mapper.Map<List<LedgerEntryResponse>>(_repository.GetAgentLedger(agentId));

        // Supplier Payments
        public SupplierPaymentResponse CreateSupplierPayment(CreateSupplierPaymentRequest request, long tenantId)
        {
            var dto = _mapper.Map<Repository.DataModels.TourAndTravels.LeadCrmDTO.CreateSupplierPaymentRequest>(request);
            dto.TenantId = tenantId;
            return _mapper.Map<SupplierPaymentResponse>(_repository.CreateSupplierPayment(dto));
        }

        public List<SupplierPaymentResponse> GetAllSupplierPayments(long tenantId) =>
            _mapper.Map<List<SupplierPaymentResponse>>(_repository.GetAllSupplierPayments(tenantId));

        public bool UpdateSupplierPaymentStatus(long id, string status) =>
            _repository.UpdateSupplierPaymentStatus(id, status);

        // Vouchers
        public VoucherResponse CreateVoucher(CreateVoucherRequest request, long tenantId)
        {
            var dto = _mapper.Map<Repository.DataModels.TourAndTravels.LeadCrmDTO.CreateVoucherRequest>(request);
            dto.TenantId = tenantId;
            return _mapper.Map<VoucherResponse>(_repository.CreateVoucher(dto));
        }

        public List<VoucherResponse> GetAllVouchers(long tenantId) =>
            _mapper.Map<List<VoucherResponse>>(_repository.GetAllVouchers(tenantId));

        public bool UpdateVoucherStatus(long id, string status) => _repository.UpdateVoucherStatus(id, status);

        // Rooming
        public RoomingResponse CreateRooming(CreateRoomingRequest request)
        {
            var dto = _mapper.Map<Repository.DataModels.TourAndTravels.LeadCrmDTO.CreateRoomingRequest>(request);
            return _mapper.Map<RoomingResponse>(_repository.CreateRooming(dto));
        }

        public List<RoomingResponse> GetRoomingByDeparture(long departureId) =>
            _mapper.Map<List<RoomingResponse>>(_repository.GetRoomingByDeparture(departureId));

        public bool DeleteRooming(long id) => _repository.DeleteRooming(id);
    }
}
