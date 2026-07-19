using AutoMapper;
using Domain.Models.TourAndTravels;
using Repository.DataModels.TourAndTravels;

namespace Bussiness.MappingProfiles.TourAndTravels
{
    public class LeadCrmMappingProfile : Profile
    {
        public LeadCrmMappingProfile()
        {
            // Lead
            CreateMap<LeadCrm.CreateLeadRequest, LeadCrmDTO.CreateLeadRequest>().ReverseMap();
            CreateMap<LeadCrm.UpdateLeadRequest, LeadCrmDTO.UpdateLeadRequest>().ReverseMap();
            CreateMap<LeadCrmDTO.LeadResponse, LeadCrm.LeadResponse>().ReverseMap();

            // Follow-up
            CreateMap<LeadCrm.CreateFollowUpRequest, LeadCrmDTO.CreateFollowUpRequest>().ReverseMap();
            CreateMap<LeadCrmDTO.FollowUpResponse, LeadCrm.FollowUpResponse>().ReverseMap();

            // Quotation
            CreateMap<LeadCrm.CreateQuotationRequest, LeadCrmDTO.CreateQuotationRequest>().ReverseMap();
            CreateMap<LeadCrm.QuotationLineItemRequest, LeadCrmDTO.QuotationLineItemRequest>().ReverseMap();
            CreateMap<LeadCrmDTO.QuotationResponse, LeadCrm.QuotationResponse>().ReverseMap();
            CreateMap<LeadCrmDTO.QuotationLineItemResponse, LeadCrm.QuotationLineItemResponse>().ReverseMap();

            // Amendment
            CreateMap<LeadCrm.CreateAmendmentRequest, LeadCrmDTO.CreateAmendmentRequest>().ReverseMap();
            CreateMap<LeadCrmDTO.AmendmentResponse, LeadCrm.AmendmentResponse>().ReverseMap();

            // Contract
            CreateMap<LeadCrm.CreateContractRequest, LeadCrmDTO.CreateContractRequest>().ReverseMap();
            CreateMap<LeadCrmDTO.ContractResponse, LeadCrm.ContractResponse>().ReverseMap();

            // B2B Agent
            CreateMap<LeadCrm.CreateB2BAgentRequest, LeadCrmDTO.CreateB2BAgentRequest>().ReverseMap();
            CreateMap<LeadCrmDTO.B2BAgentResponse, LeadCrm.B2BAgentResponse>().ReverseMap();

            // B2B Pricing
            CreateMap<LeadCrm.CreateAgentPricingRequest, LeadCrmDTO.CreateAgentPricingRequest>().ReverseMap();
            CreateMap<LeadCrmDTO.AgentPricingResponse, LeadCrm.AgentPricingResponse>().ReverseMap();

            // B2B Ledger
            CreateMap<LeadCrm.CreateLedgerEntryRequest, LeadCrmDTO.CreateLedgerEntryRequest>().ReverseMap();
            CreateMap<LeadCrmDTO.LedgerEntryResponse, LeadCrm.LedgerEntryResponse>().ReverseMap();

            // Supplier Payment
            CreateMap<LeadCrm.CreateSupplierPaymentRequest, LeadCrmDTO.CreateSupplierPaymentRequest>().ReverseMap();
            CreateMap<LeadCrmDTO.SupplierPaymentResponse, LeadCrm.SupplierPaymentResponse>().ReverseMap();

            // Voucher
            CreateMap<LeadCrm.CreateVoucherRequest, LeadCrmDTO.CreateVoucherRequest>().ReverseMap();
            CreateMap<LeadCrmDTO.VoucherResponse, LeadCrm.VoucherResponse>().ReverseMap();

            // Rooming
            CreateMap<LeadCrm.CreateRoomingRequest, LeadCrmDTO.CreateRoomingRequest>().ReverseMap();
            CreateMap<LeadCrmDTO.RoomingResponse, LeadCrm.RoomingResponse>().ReverseMap();
        }
    }
}
