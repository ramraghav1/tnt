using System;
using System.Collections.Generic;

namespace Domain.Models.TourAndTravels
{
    public class LeadCrm
    {
        // ======================================
        // LEAD
        // ======================================
        public class CreateLeadRequest
        {
            public string Name { get; set; } = string.Empty;
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public string? Country { get; set; }
            public string Source { get; set; } = "Website";
            public string Priority { get; set; } = "Medium";
            public string? InterestedIn { get; set; }
            public DateTime? TravelDateFrom { get; set; }
            public DateTime? TravelDateTo { get; set; }
            public int? Pax { get; set; }
            public decimal? Budget { get; set; }
            public string Currency { get; set; } = "USD";
            public string? AssignedTo { get; set; }
            public string? Notes { get; set; }
        }

        public class UpdateLeadRequest
        {
            public string? Name { get; set; }
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public string? Country { get; set; }
            public string? Source { get; set; }
            public string? Status { get; set; }
            public string? Priority { get; set; }
            public string? InterestedIn { get; set; }
            public DateTime? TravelDateFrom { get; set; }
            public DateTime? TravelDateTo { get; set; }
            public int? Pax { get; set; }
            public decimal? Budget { get; set; }
            public string? Currency { get; set; }
            public string? AssignedTo { get; set; }
            public string? Notes { get; set; }
        }

        public class LeadResponse
        {
            public long Id { get; set; }
            public long TenantId { get; set; }
            public string Name { get; set; } = string.Empty;
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public string? Country { get; set; }
            public string Source { get; set; } = "Website";
            public string Status { get; set; } = "New";
            public string Priority { get; set; } = "Medium";
            public string? InterestedIn { get; set; }
            public DateTime? TravelDateFrom { get; set; }
            public DateTime? TravelDateTo { get; set; }
            public int? Pax { get; set; }
            public decimal? Budget { get; set; }
            public string Currency { get; set; } = "USD";
            public string? AssignedTo { get; set; }
            public string? Notes { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime UpdatedAt { get; set; }
            public DateTime? ConvertedAt { get; set; }
            public long? ProposalId { get; set; }
            public int FollowUpCount { get; set; }
            public DateTime? LastFollowUpDate { get; set; }
        }

        // ======================================
        // FOLLOW-UP
        // ======================================
        public class CreateFollowUpRequest
        {
            public long LeadId { get; set; }
            public string Type { get; set; } = "Note";
            public string Message { get; set; } = string.Empty;
            public DateTime? NextFollowUpDate { get; set; }
        }

        public class FollowUpResponse
        {
            public long Id { get; set; }
            public long LeadId { get; set; }
            public string Type { get; set; } = "Note";
            public string Message { get; set; } = string.Empty;
            public DateTime? NextFollowUpDate { get; set; }
            public string? CreatedBy { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        // ======================================
        // QUOTATION
        // ======================================
        public class CreateQuotationRequest
        {
            public long? LeadId { get; set; }
            public long? ProposalId { get; set; }
            public string ClientName { get; set; } = string.Empty;
            public string? ClientEmail { get; set; }
            public string? ClientPhone { get; set; }
            public DateTime? TravelDateFrom { get; set; }
            public DateTime? TravelDateTo { get; set; }
            public int Pax { get; set; } = 1;
            public string Currency { get; set; } = "USD";
            public decimal DiscountAmount { get; set; }
            public decimal TaxAmount { get; set; }
            public DateTime? ValidUntil { get; set; }
            public string? Notes { get; set; }
            public List<QuotationLineItemRequest> LineItems { get; set; } = new();
        }

        public class QuotationLineItemRequest
        {
            public string ItemType { get; set; } = "Service";
            public string Description { get; set; } = string.Empty;
            public decimal Quantity { get; set; } = 1;
            public decimal UnitPrice { get; set; }
            public int SortOrder { get; set; }
        }

        public class QuotationResponse
        {
            public long Id { get; set; }
            public long TenantId { get; set; }
            public string QuotationNumber { get; set; } = string.Empty;
            public long? LeadId { get; set; }
            public string? LeadName { get; set; }
            public long? ProposalId { get; set; }
            public string ClientName { get; set; } = string.Empty;
            public string? ClientEmail { get; set; }
            public string? ClientPhone { get; set; }
            public DateTime? TravelDateFrom { get; set; }
            public DateTime? TravelDateTo { get; set; }
            public int Pax { get; set; }
            public decimal Subtotal { get; set; }
            public decimal DiscountAmount { get; set; }
            public decimal TaxAmount { get; set; }
            public decimal TotalAmount { get; set; }
            public string Currency { get; set; } = "USD";
            public string Status { get; set; } = "Draft";
            public DateTime? ValidUntil { get; set; }
            public string? Notes { get; set; }
            public DateTime CreatedAt { get; set; }
            public List<QuotationLineItemResponse> LineItems { get; set; } = new();
        }

        public class QuotationLineItemResponse
        {
            public long Id { get; set; }
            public string ItemType { get; set; } = "Service";
            public string Description { get; set; } = string.Empty;
            public decimal Quantity { get; set; }
            public decimal UnitPrice { get; set; }
            public decimal TotalPrice { get; set; }
            public int SortOrder { get; set; }
        }

        // ======================================
        // BOOKING AMENDMENT
        // ======================================
        public class CreateAmendmentRequest
        {
            public long BookingInstanceId { get; set; }
            public string AmendmentType { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string? OldValue { get; set; }
            public string? NewValue { get; set; }
            public decimal FeeAmount { get; set; }
        }

        public class AmendmentResponse
        {
            public long Id { get; set; }
            public long BookingInstanceId { get; set; }
            public string? BookingReference { get; set; }
            public string AmendmentType { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string? OldValue { get; set; }
            public string? NewValue { get; set; }
            public string Status { get; set; } = "Pending";
            public string? RequestedBy { get; set; }
            public string? ApprovedBy { get; set; }
            public decimal FeeAmount { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? ResolvedAt { get; set; }
        }

        // ======================================
        // SUPPLIER CONTRACT
        // ======================================
        public class CreateContractRequest
        {
            public string SupplierType { get; set; } = string.Empty;
            public long SupplierId { get; set; }
            public string SupplierName { get; set; } = string.Empty;
            public string? ContractNumber { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
            public string RateType { get; set; } = "Fixed";
            public decimal BaseRate { get; set; }
            public string Currency { get; set; } = "NPR";
            public string? Terms { get; set; }
        }

        public class ContractResponse
        {
            public long Id { get; set; }
            public long TenantId { get; set; }
            public string SupplierType { get; set; } = string.Empty;
            public long SupplierId { get; set; }
            public string SupplierName { get; set; } = string.Empty;
            public string? ContractNumber { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
            public string RateType { get; set; } = "Fixed";
            public decimal BaseRate { get; set; }
            public string Currency { get; set; } = "NPR";
            public string? Terms { get; set; }
            public string Status { get; set; } = "Active";
            public DateTime CreatedAt { get; set; }
        }

        // ======================================
        // B2B AGENT
        // ======================================
        public class CreateB2BAgentRequest
        {
            public string Name { get; set; } = string.Empty;
            public string? ContactPerson { get; set; }
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public string? Country { get; set; }
            public string? Region { get; set; }
            public decimal CommissionRate { get; set; }
            public decimal CreditLimit { get; set; }
            public string? Notes { get; set; }
        }

        public class B2BAgentResponse
        {
            public long Id { get; set; }
            public long TenantId { get; set; }
            public string Name { get; set; } = string.Empty;
            public string? ContactPerson { get; set; }
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public string? Country { get; set; }
            public string? Region { get; set; }
            public decimal CommissionRate { get; set; }
            public decimal CreditLimit { get; set; }
            public decimal CreditBalance { get; set; }
            public string Status { get; set; } = "Active";
            public string? Notes { get; set; }
            public DateTime CreatedAt { get; set; }
            public int TotalBookings { get; set; }
        }

        // ======================================
        // B2B AGENT PRICING
        // ======================================
        public class CreateAgentPricingRequest
        {
            public long AgentId { get; set; }
            public long ItineraryId { get; set; }
            public decimal PricePerPerson { get; set; }
            public string Currency { get; set; } = "USD";
            public DateTime? ValidFrom { get; set; }
            public DateTime? ValidTo { get; set; }
        }

        public class AgentPricingResponse
        {
            public long Id { get; set; }
            public long AgentId { get; set; }
            public long ItineraryId { get; set; }
            public string? ItineraryTitle { get; set; }
            public decimal PricePerPerson { get; set; }
            public string Currency { get; set; } = "USD";
            public DateTime? ValidFrom { get; set; }
            public DateTime? ValidTo { get; set; }
        }

        // ======================================
        // B2B AGENT LEDGER
        // ======================================
        public class CreateLedgerEntryRequest
        {
            public long AgentId { get; set; }
            public string TransactionType { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public string? Reference { get; set; }
            public string? Description { get; set; }
        }

        public class LedgerEntryResponse
        {
            public long Id { get; set; }
            public long AgentId { get; set; }
            public string TransactionType { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public string? Reference { get; set; }
            public string? Description { get; set; }
            public decimal BalanceAfter { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        // ======================================
        // SUPPLIER PAYMENT
        // ======================================
        public class CreateSupplierPaymentRequest
        {
            public string SupplierType { get; set; } = string.Empty;
            public long SupplierId { get; set; }
            public string SupplierName { get; set; } = string.Empty;
            public long? BookingInstanceId { get; set; }
            public decimal Amount { get; set; }
            public string Currency { get; set; } = "NPR";
            public string? PaymentMethod { get; set; }
            public DateTime PaymentDate { get; set; }
            public string? Reference { get; set; }
            public string? Notes { get; set; }
        }

        public class SupplierPaymentResponse
        {
            public long Id { get; set; }
            public long TenantId { get; set; }
            public string SupplierType { get; set; } = string.Empty;
            public long SupplierId { get; set; }
            public string SupplierName { get; set; } = string.Empty;
            public long? BookingInstanceId { get; set; }
            public string? BookingReference { get; set; }
            public decimal Amount { get; set; }
            public string Currency { get; set; } = "NPR";
            public string? PaymentMethod { get; set; }
            public DateTime PaymentDate { get; set; }
            public string? Reference { get; set; }
            public string Status { get; set; } = "Pending";
            public string? Notes { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        // ======================================
        // SERVICE VOUCHER
        // ======================================
        public class CreateVoucherRequest
        {
            public long? BookingInstanceId { get; set; }
            public string VoucherType { get; set; } = string.Empty;
            public string? SupplierType { get; set; }
            public long? SupplierId { get; set; }
            public string? SupplierName { get; set; }
            public DateTime? ServiceDate { get; set; }
            public string? Details { get; set; }
        }

        public class VoucherResponse
        {
            public long Id { get; set; }
            public long TenantId { get; set; }
            public string VoucherNumber { get; set; } = string.Empty;
            public long? BookingInstanceId { get; set; }
            public string? BookingReference { get; set; }
            public string VoucherType { get; set; } = string.Empty;
            public string? SupplierType { get; set; }
            public long? SupplierId { get; set; }
            public string? SupplierName { get; set; }
            public DateTime? ServiceDate { get; set; }
            public string? Details { get; set; }
            public string Status { get; set; } = "Draft";
            public DateTime CreatedAt { get; set; }
        }

        // ======================================
        // ROOMING ASSIGNMENT
        // ======================================
        public class CreateRoomingRequest
        {
            public long DepartureId { get; set; }
            public long BookingInstanceId { get; set; }
            public long TravelerId { get; set; }
            public long? HotelId { get; set; }
            public string? RoomType { get; set; }
            public string? RoomNumber { get; set; }
            public DateTime? CheckInDate { get; set; }
            public DateTime? CheckOutDate { get; set; }
            public string? Notes { get; set; }
        }

        public class RoomingResponse
        {
            public long Id { get; set; }
            public long DepartureId { get; set; }
            public long BookingInstanceId { get; set; }
            public string? BookingReference { get; set; }
            public long TravelerId { get; set; }
            public string? TravelerName { get; set; }
            public long? HotelId { get; set; }
            public string? HotelName { get; set; }
            public string? RoomType { get; set; }
            public string? RoomNumber { get; set; }
            public DateTime? CheckInDate { get; set; }
            public DateTime? CheckOutDate { get; set; }
            public string? Notes { get; set; }
        }
    }
}
