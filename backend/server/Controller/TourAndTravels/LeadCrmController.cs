using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Bussiness.Services.TourAndTravels;
using Repository.Repositories;
using static Domain.Models.TourAndTravels.LeadCrm;

namespace server.Controller.TourAndTravels
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeadCrmController : ControllerBase
    {
        private readonly ILeadCrmService _service;
        private readonly ITenantProvider _tenantProvider;

        public LeadCrmController(ILeadCrmService service, ITenantProvider tenantProvider)
        {
            _service = service;
            _tenantProvider = tenantProvider;
        }

        private long GetTenantId() =>
            _tenantProvider.GetTenantId() ?? 1;
        private string? GetUserName() =>
            User?.FindFirst(ClaimTypes.Name)?.Value ?? User?.FindFirst("name")?.Value;

        // ======================== LEADS ========================
        [HttpGet("leads")]
        public ActionResult<List<LeadResponse>> GetLeads() =>
            Ok(_service.GetAllLeads(GetTenantId()));

        [HttpGet("leads/{id}")]
        public ActionResult<LeadResponse> GetLead(long id)
        {
            var lead = _service.GetLeadById(id);
            return lead != null ? Ok(lead) : NotFound();
        }

        [HttpPost("leads")]
        public ActionResult<LeadResponse> CreateLead([FromBody] CreateLeadRequest request) =>
            Ok(_service.CreateLead(request, GetTenantId()));

        [HttpPut("leads/{id}")]
        public ActionResult<LeadResponse> UpdateLead(long id, [FromBody] UpdateLeadRequest request)
        {
            var result = _service.UpdateLead(id, request);
            return result != null ? Ok(result) : NotFound();
        }

        [HttpDelete("leads/{id}")]
        public ActionResult DeleteLead(long id) =>
            _service.DeleteLead(id) ? Ok() : NotFound();

        [HttpPost("leads/{leadId}/convert/{proposalId}")]
        public ActionResult ConvertLead(long leadId, long proposalId) =>
            _service.ConvertLeadToProposal(leadId, proposalId) ? Ok() : NotFound();

        // ======================== FOLLOW-UPS ========================
        [HttpGet("follow-ups")]
        public ActionResult<List<FollowUpResponse>> GetAllFollowUps() =>
            Ok(_service.GetAllFollowUps(GetTenantId()));

        [HttpGet("leads/{leadId}/follow-ups")]
        public ActionResult<List<FollowUpResponse>> GetFollowUps(long leadId) =>
            Ok(_service.GetFollowUpsByLead(leadId));

        [HttpPost("follow-ups")]
        public ActionResult<FollowUpResponse> CreateFollowUp([FromBody] CreateFollowUpRequest request) =>
            Ok(_service.CreateFollowUp(request, GetUserName()));

        // ======================== QUOTATIONS ========================
        [HttpGet("quotations")]
        public ActionResult<List<QuotationResponse>> GetQuotations() =>
            Ok(_service.GetAllQuotations(GetTenantId()));

        [HttpGet("quotations/{id}")]
        public ActionResult<QuotationResponse> GetQuotation(long id)
        {
            var q = _service.GetQuotationById(id);
            return q != null ? Ok(q) : NotFound();
        }

        [HttpPost("quotations")]
        public ActionResult<QuotationResponse> CreateQuotation([FromBody] CreateQuotationRequest request) =>
            Ok(_service.CreateQuotation(request, GetTenantId()));

        [HttpPut("quotations/{id}/status")]
        public ActionResult UpdateQuotationStatus(long id, [FromBody] StatusUpdateRequest request) =>
            _service.UpdateQuotationStatus(id, request.Status) ? Ok() : NotFound();

        // ======================== AMENDMENTS ========================
        [HttpGet("amendments")]
        public ActionResult<List<AmendmentResponse>> GetAmendments() =>
            Ok(_service.GetAllAmendments(GetTenantId()));

        [HttpPost("amendments")]
        public ActionResult<AmendmentResponse> CreateAmendment([FromBody] CreateAmendmentRequest request) =>
            Ok(_service.CreateAmendment(request, GetTenantId(), GetUserName()));

        [HttpPut("amendments/{id}/status")]
        public ActionResult UpdateAmendmentStatus(long id, [FromBody] StatusUpdateRequest request) =>
            _service.UpdateAmendmentStatus(id, request.Status, GetUserName()) ? Ok() : NotFound();

        // ======================== CONTRACTS ========================
        [HttpGet("contracts")]
        public ActionResult<List<ContractResponse>> GetContracts() =>
            Ok(_service.GetAllContracts(GetTenantId()));

        [HttpPost("contracts")]
        public ActionResult<ContractResponse> CreateContract([FromBody] CreateContractRequest request) =>
            Ok(_service.CreateContract(request, GetTenantId()));

        [HttpPut("contracts/{id}/status")]
        public ActionResult UpdateContractStatus(long id, [FromBody] StatusUpdateRequest request) =>
            _service.UpdateContractStatus(id, request.Status) ? Ok() : NotFound();

        // ======================== B2B AGENTS ========================
        [HttpGet("agents")]
        public ActionResult<List<B2BAgentResponse>> GetAgents() =>
            Ok(_service.GetAllAgents(GetTenantId()));

        [HttpGet("agents/{id}")]
        public ActionResult<B2BAgentResponse> GetAgent(long id)
        {
            var a = _service.GetAgentById(id);
            return a != null ? Ok(a) : NotFound();
        }

        [HttpPost("agents")]
        public ActionResult<B2BAgentResponse> CreateAgent([FromBody] CreateB2BAgentRequest request) =>
            Ok(_service.CreateAgent(request, GetTenantId()));

        [HttpPut("agents/{id}/status")]
        public ActionResult UpdateAgentStatus(long id, [FromBody] StatusUpdateRequest request) =>
            _service.UpdateAgentStatus(id, request.Status) ? Ok() : NotFound();

        // ======================== B2B PRICING ========================
        [HttpGet("agents/{agentId}/pricing")]
        public ActionResult<List<AgentPricingResponse>> GetAgentPricing(long agentId) =>
            Ok(_service.GetAgentPricing(agentId));

        [HttpPost("agent-pricing")]
        public ActionResult<AgentPricingResponse> CreateAgentPricing([FromBody] CreateAgentPricingRequest request) =>
            Ok(_service.CreateAgentPricing(request));

        [HttpDelete("agent-pricing/{id}")]
        public ActionResult DeleteAgentPricing(long id) =>
            _service.DeleteAgentPricing(id) ? Ok() : NotFound();

        // ======================== B2B LEDGER ========================
        [HttpGet("agents/{agentId}/ledger")]
        public ActionResult<List<LedgerEntryResponse>> GetAgentLedger(long agentId) =>
            Ok(_service.GetAgentLedger(agentId));

        [HttpPost("ledger")]
        public ActionResult<LedgerEntryResponse> CreateLedgerEntry([FromBody] CreateLedgerEntryRequest request) =>
            Ok(_service.CreateLedgerEntry(request));

        // ======================== SUPPLIER PAYMENTS ========================
        [HttpGet("supplier-payments")]
        public ActionResult<List<SupplierPaymentResponse>> GetSupplierPayments() =>
            Ok(_service.GetAllSupplierPayments(GetTenantId()));

        [HttpPost("supplier-payments")]
        public ActionResult<SupplierPaymentResponse> CreateSupplierPayment([FromBody] CreateSupplierPaymentRequest request) =>
            Ok(_service.CreateSupplierPayment(request, GetTenantId()));

        [HttpPut("supplier-payments/{id}/status")]
        public ActionResult UpdateSupplierPaymentStatus(long id, [FromBody] StatusUpdateRequest request) =>
            _service.UpdateSupplierPaymentStatus(id, request.Status) ? Ok() : NotFound();

        // ======================== VOUCHERS ========================
        [HttpGet("vouchers")]
        public ActionResult<List<VoucherResponse>> GetVouchers() =>
            Ok(_service.GetAllVouchers(GetTenantId()));

        [HttpPost("vouchers")]
        public ActionResult<VoucherResponse> CreateVoucher([FromBody] CreateVoucherRequest request) =>
            Ok(_service.CreateVoucher(request, GetTenantId()));

        [HttpPut("vouchers/{id}/status")]
        public ActionResult UpdateVoucherStatus(long id, [FromBody] StatusUpdateRequest request) =>
            _service.UpdateVoucherStatus(id, request.Status) ? Ok() : NotFound();

        // ======================== ROOMING ========================
        [HttpGet("rooming/{departureId}")]
        public ActionResult<List<RoomingResponse>> GetRooming(long departureId) =>
            Ok(_service.GetRoomingByDeparture(departureId));

        [HttpPost("rooming")]
        public ActionResult<RoomingResponse> CreateRooming([FromBody] CreateRoomingRequest request) =>
            Ok(_service.CreateRooming(request));

        [HttpDelete("rooming/{id}")]
        public ActionResult DeleteRooming(long id) =>
            _service.DeleteRooming(id) ? Ok() : NotFound();

        // Helper model
        public class StatusUpdateRequest
        {
            public string Status { get; set; } = string.Empty;
        }
    }
}
