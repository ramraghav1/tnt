using System;
using System.Collections.Generic;
using static Domain.Models.TourAndTravels.InventoryRedesign;

namespace Repository.Interfaces.TourAndTravels
{
    public interface ILocationRepository
    {
        LocationResponse Create(CreateLocationRequest request, long tenantId, long userId);
        LocationResponse? Update(long id, UpdateLocationRequest request);
        LocationResponse? GetById(long id);
        List<LocationResponse> GetAll(long tenantId, bool includeInactive = false);
        bool Deactivate(long id);
        bool Activate(long id);
    }

    public interface ICurrencyRepository
    {
        CurrencyResponse Create(CreateCurrencyRequest request);
        List<CurrencyResponse> GetAll(bool includeInactive = false);
        CurrencyResponse? GetByCode(string code);
        bool SetActive(long id, bool isActive);
    }

    public interface IExchangeRateV2Repository
    {
        ExchangeRateV2Response Upsert(UpsertExchangeRateRequest request, long userId);
        List<ExchangeRateV2Response> GetLatestRates();
        ExchangeRateV2Response? GetRate(string currencyCode, DateTime? date = null);
        List<ExchangeRateV2Response> GetHistory(string currencyCode, int limit = 30);
    }

    public interface ISeasonRepository
    {
        SeasonResponse Create(CreateSeasonRequest request, long tenantId, long userId);
        SeasonResponse? Update(long id, UpdateSeasonRequest request);
        SeasonResponse? GetById(long id);
        List<SeasonResponse> GetAll(long tenantId, bool includeInactive = false);
        List<SeasonResponse> GetByDate(long tenantId, DateTime date);
        bool Deactivate(long id);
        bool Activate(long id);
    }

    public interface IHotelSeasonPricingRepository
    {
        HotelSeasonPricingResponse Create(CreateHotelSeasonPricingRequest request);
        List<HotelSeasonPricingResponse> GetByRoom(long hotelRoomId);
        List<HotelSeasonPricingResponse> GetBySeason(long seasonId);
        bool Delete(long id);
    }

    public interface IVehicleRouteRepository
    {
        VehicleRouteResponse Create(CreateVehicleRouteRequest request, long tenantId);
        VehicleRouteResponse? Update(long id, UpdateVehicleRouteRequest request);
        VehicleRouteResponse? GetById(long id);
        List<VehicleRouteResponse> GetAll(long tenantId, bool includeInactive = false);
        List<VehicleRouteResponse> GetByRoute(long locationFromId, long locationToId);
        bool Deactivate(long id);
        bool Activate(long id);
    }

    public interface IGuideLocationRepository
    {
        GuideLocationResponse Create(CreateGuideLocationRequest request);
        List<GuideLocationResponse> GetByGuide(long guideId);
        List<GuideLocationResponse> GetByLocation(long locationId);
        bool Delete(long id);
    }

    public interface IActivityLocationRepository
    {
        ActivityLocationResponse Create(CreateActivityLocationRequest request);
        List<ActivityLocationResponse> GetByActivity(long activityId);
        List<ActivityLocationResponse> GetByLocation(long locationId);
        bool Delete(long id);
    }

    public interface IAccommodationCategoryRepository
    {
        List<AccommodationCategoryResponse> GetAll(bool includeInactive = false);
        AccommodationCategoryResponse? GetById(long id);
        List<HotelSuggestionResponse> GetHotelsByCategory(long categoryId, long? locationId = null);
    }
}
