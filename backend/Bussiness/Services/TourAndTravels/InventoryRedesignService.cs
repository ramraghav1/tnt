using System;
using System.Collections.Generic;
using Repository.Interfaces.TourAndTravels;
using static Domain.Models.TourAndTravels.InventoryRedesign;

namespace Bussiness.Services.TourAndTravels
{
    // ================================================================
    // SERVICE INTERFACES
    // ================================================================
    public interface ILocationService
    {
        LocationResponse Create(CreateLocationRequest request, long tenantId, long userId);
        LocationResponse? Update(long id, UpdateLocationRequest request);
        LocationResponse? GetById(long id);
        List<LocationResponse> GetAll(long tenantId, bool includeInactive = false);
        bool Deactivate(long id);
        bool Activate(long id);
    }

    public interface ICurrencyService
    {
        CurrencyResponse Create(CreateCurrencyRequest request);
        List<CurrencyResponse> GetAll(bool includeInactive = false);
        CurrencyResponse? GetByCode(string code);
        bool SetActive(long id, bool isActive);
    }

    public interface IExchangeRateV2Service
    {
        ExchangeRateV2Response Upsert(UpsertExchangeRateRequest request, long userId);
        List<ExchangeRateV2Response> GetLatestRates();
        ExchangeRateV2Response? GetRate(string currencyCode, DateTime? date = null);
        List<ExchangeRateV2Response> GetHistory(string currencyCode, int limit = 30);
    }

    public interface ISeasonService
    {
        SeasonResponse Create(CreateSeasonRequest request, long tenantId, long userId);
        SeasonResponse? Update(long id, UpdateSeasonRequest request);
        SeasonResponse? GetById(long id);
        List<SeasonResponse> GetAll(long tenantId, bool includeInactive = false);
        List<SeasonResponse> GetByDate(long tenantId, DateTime date);
        bool Deactivate(long id);
        bool Activate(long id);
    }

    public interface IHotelSeasonPricingService
    {
        HotelSeasonPricingResponse Create(CreateHotelSeasonPricingRequest request);
        List<HotelSeasonPricingResponse> GetByRoom(long hotelRoomId);
        List<HotelSeasonPricingResponse> GetBySeason(long seasonId);
        bool Delete(long id);
    }

    public interface IVehicleRouteService
    {
        VehicleRouteResponse Create(CreateVehicleRouteRequest request, long tenantId);
        VehicleRouteResponse? Update(long id, UpdateVehicleRouteRequest request);
        VehicleRouteResponse? GetById(long id);
        List<VehicleRouteResponse> GetAll(long tenantId, bool includeInactive = false);
        List<VehicleRouteResponse> GetByRoute(long locationFromId, long locationToId);
        bool Deactivate(long id);
        bool Activate(long id);
    }

    public interface IGuideLocationService
    {
        GuideLocationResponse Create(CreateGuideLocationRequest request);
        List<GuideLocationResponse> GetByGuide(long guideId);
        List<GuideLocationResponse> GetByLocation(long locationId);
        bool Delete(long id);
    }

    public interface IActivityLocationService
    {
        ActivityLocationResponse Create(CreateActivityLocationRequest request);
        List<ActivityLocationResponse> GetByActivity(long activityId);
        List<ActivityLocationResponse> GetByLocation(long locationId);
        bool Delete(long id);
    }

    public interface IAccommodationCategoryService
    {
        List<AccommodationCategoryResponse> GetAll(bool includeInactive = false);
        AccommodationCategoryResponse? GetById(long id);
        List<HotelSuggestionResponse> GetHotelsByCategory(long categoryId, long? locationId = null);
    }

    // ================================================================
    // SERVICE IMPLEMENTATIONS
    // ================================================================
    public class LocationService : ILocationService
    {
        private readonly ILocationRepository _repo;
        public LocationService(ILocationRepository repo) => _repo = repo;

        public LocationResponse Create(CreateLocationRequest request, long tenantId, long userId) =>
            _repo.Create(request, tenantId, userId);
        public LocationResponse? Update(long id, UpdateLocationRequest request) =>
            _repo.Update(id, request);
        public LocationResponse? GetById(long id) => _repo.GetById(id);
        public List<LocationResponse> GetAll(long tenantId, bool includeInactive = false) =>
            _repo.GetAll(tenantId, includeInactive);
        public bool Deactivate(long id) => _repo.Deactivate(id);
        public bool Activate(long id) => _repo.Activate(id);
    }

    public class CurrencyService : ICurrencyService
    {
        private readonly ICurrencyRepository _repo;
        public CurrencyService(ICurrencyRepository repo) => _repo = repo;

        public CurrencyResponse Create(CreateCurrencyRequest request) => _repo.Create(request);
        public List<CurrencyResponse> GetAll(bool includeInactive = false) => _repo.GetAll(includeInactive);
        public CurrencyResponse? GetByCode(string code) => _repo.GetByCode(code);
        public bool SetActive(long id, bool isActive) => _repo.SetActive(id, isActive);
    }

    public class ExchangeRateV2Service : IExchangeRateV2Service
    {
        private readonly IExchangeRateV2Repository _repo;
        public ExchangeRateV2Service(IExchangeRateV2Repository repo) => _repo = repo;

        public ExchangeRateV2Response Upsert(UpsertExchangeRateRequest request, long userId) =>
            _repo.Upsert(request, userId);
        public List<ExchangeRateV2Response> GetLatestRates() => _repo.GetLatestRates();
        public ExchangeRateV2Response? GetRate(string currencyCode, DateTime? date = null) =>
            _repo.GetRate(currencyCode, date);
        public List<ExchangeRateV2Response> GetHistory(string currencyCode, int limit = 30) =>
            _repo.GetHistory(currencyCode, limit);
    }

    public class SeasonService : ISeasonService
    {
        private readonly ISeasonRepository _repo;
        public SeasonService(ISeasonRepository repo) => _repo = repo;

        public SeasonResponse Create(CreateSeasonRequest request, long tenantId, long userId) =>
            _repo.Create(request, tenantId, userId);
        public SeasonResponse? Update(long id, UpdateSeasonRequest request) =>
            _repo.Update(id, request);
        public SeasonResponse? GetById(long id) => _repo.GetById(id);
        public List<SeasonResponse> GetAll(long tenantId, bool includeInactive = false) =>
            _repo.GetAll(tenantId, includeInactive);
        public List<SeasonResponse> GetByDate(long tenantId, DateTime date) =>
            _repo.GetByDate(tenantId, date);
        public bool Deactivate(long id) => _repo.Deactivate(id);
        public bool Activate(long id) => _repo.Activate(id);
    }

    public class HotelSeasonPricingService : IHotelSeasonPricingService
    {
        private readonly IHotelSeasonPricingRepository _repo;
        public HotelSeasonPricingService(IHotelSeasonPricingRepository repo) => _repo = repo;

        public HotelSeasonPricingResponse Create(CreateHotelSeasonPricingRequest request) =>
            _repo.Create(request);
        public List<HotelSeasonPricingResponse> GetByRoom(long hotelRoomId) => _repo.GetByRoom(hotelRoomId);
        public List<HotelSeasonPricingResponse> GetBySeason(long seasonId) => _repo.GetBySeason(seasonId);
        public bool Delete(long id) => _repo.Delete(id);
    }

    public class VehicleRouteService : IVehicleRouteService
    {
        private readonly IVehicleRouteRepository _repo;
        public VehicleRouteService(IVehicleRouteRepository repo) => _repo = repo;

        public VehicleRouteResponse Create(CreateVehicleRouteRequest request, long tenantId) =>
            _repo.Create(request, tenantId);
        public VehicleRouteResponse? Update(long id, UpdateVehicleRouteRequest request) =>
            _repo.Update(id, request);
        public VehicleRouteResponse? GetById(long id) => _repo.GetById(id);
        public List<VehicleRouteResponse> GetAll(long tenantId, bool includeInactive = false) =>
            _repo.GetAll(tenantId, includeInactive);
        public List<VehicleRouteResponse> GetByRoute(long locationFromId, long locationToId) =>
            _repo.GetByRoute(locationFromId, locationToId);
        public bool Deactivate(long id) => _repo.Deactivate(id);
        public bool Activate(long id) => _repo.Activate(id);
    }

    public class GuideLocationService : IGuideLocationService
    {
        private readonly IGuideLocationRepository _repo;
        public GuideLocationService(IGuideLocationRepository repo) => _repo = repo;

        public GuideLocationResponse Create(CreateGuideLocationRequest request) => _repo.Create(request);
        public List<GuideLocationResponse> GetByGuide(long guideId) => _repo.GetByGuide(guideId);
        public List<GuideLocationResponse> GetByLocation(long locationId) => _repo.GetByLocation(locationId);
        public bool Delete(long id) => _repo.Delete(id);
    }

    public class ActivityLocationService : IActivityLocationService
    {
        private readonly IActivityLocationRepository _repo;
        public ActivityLocationService(IActivityLocationRepository repo) => _repo = repo;

        public ActivityLocationResponse Create(CreateActivityLocationRequest request) => _repo.Create(request);
        public List<ActivityLocationResponse> GetByActivity(long activityId) => _repo.GetByActivity(activityId);
        public List<ActivityLocationResponse> GetByLocation(long locationId) => _repo.GetByLocation(locationId);
        public bool Delete(long id) => _repo.Delete(id);
    }

    public class AccommodationCategoryService : IAccommodationCategoryService
    {
        private readonly IAccommodationCategoryRepository _repo;
        public AccommodationCategoryService(IAccommodationCategoryRepository repo) => _repo = repo;

        public List<AccommodationCategoryResponse> GetAll(bool includeInactive = false) => _repo.GetAll(includeInactive);
        public AccommodationCategoryResponse? GetById(long id) => _repo.GetById(id);
        public List<HotelSuggestionResponse> GetHotelsByCategory(long categoryId, long? locationId = null) =>
            _repo.GetHotelsByCategory(categoryId, locationId);
    }
}
