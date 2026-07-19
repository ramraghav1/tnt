using System;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Bussiness.Services.TourAndTravels;
using Repository.Repositories;
using static Domain.Models.TourAndTravels.InventoryRedesign;

namespace server.Controller.TourAndTravels
{
    /// <summary>
    /// Inventory Redesign controllers — Location, Currency, ExchangeRateV2,
    /// Season, HotelSeasonPricing, VehicleRoute, GuideLocation, ActivityLocation.
    /// </summary>
    /// 
    // ================================================================
    // LOCATIONS
    // ================================================================
    [ApiController]
    [Route("api/inventory/locations")]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationService _service;
        private readonly ITenantProvider _tenantProvider;
        public LocationsController(ILocationService service, ITenantProvider tenantProvider)
        { _service = service; _tenantProvider = tenantProvider; }

        private long GetTenantId() => _tenantProvider.GetTenantId() ?? 1;
        private long GetUserId() => long.TryParse(User?.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 1;

        [HttpGet]
        public ActionResult<List<LocationResponse>> GetAll([FromQuery] bool includeInactive = false) =>
            Ok(_service.GetAll(GetTenantId(), includeInactive));

        [HttpGet("{id}")]
        public ActionResult<LocationResponse> GetById(long id) =>
            _service.GetById(id) is { } loc ? Ok(loc) : NotFound();

        [HttpPost]
        public ActionResult<LocationResponse> Create([FromBody] CreateLocationRequest request) =>
            Ok(_service.Create(request, GetTenantId(), GetUserId()));

        [HttpPut("{id}")]
        public ActionResult<LocationResponse> Update(long id, [FromBody] UpdateLocationRequest request) =>
            _service.Update(id, request) is { } loc ? Ok(loc) : NotFound();

        [HttpDelete("{id}")]
        public ActionResult Delete(long id) =>
            _service.Deactivate(id) ? Ok() : NotFound();

        [HttpPost("{id}/activate")]
        public ActionResult Activate(long id) =>
            _service.Activate(id) ? Ok() : NotFound();
    }

    // ================================================================
    // CURRENCIES
    // ================================================================
    [ApiController]
    [Route("api/inventory/currencies")]
    public class CurrenciesController : ControllerBase
    {
        private readonly ICurrencyService _service;
        public CurrenciesController(ICurrencyService service) => _service = service;

        [HttpGet]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public ActionResult<List<CurrencyResponse>> GetAll([FromQuery] bool includeInactive = false) =>
            Ok(_service.GetAll(includeInactive));

        [HttpGet("{code}")]
        public ActionResult<CurrencyResponse> GetByCode(string code) =>
            _service.GetByCode(code) is { } c ? Ok(c) : NotFound();

        [HttpPost]
        public ActionResult<CurrencyResponse> Create([FromBody] CreateCurrencyRequest request) =>
            Ok(_service.Create(request));

        [HttpPut("{id}/active")]
        public ActionResult SetActive(long id, [FromQuery] bool isActive = true) =>
            _service.SetActive(id, isActive) ? Ok() : NotFound();
    }

    // ================================================================
    // EXCHANGE RATES V2
    // ================================================================
    [ApiController]
    [Route("api/inventory/exchange-rates")]
    public class ExchangeRatesV2Controller : ControllerBase
    {
        private readonly IExchangeRateV2Service _service;
        public ExchangeRatesV2Controller(IExchangeRateV2Service service) => _service = service;

        private long GetUserId() => long.TryParse(User?.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 1;

        [HttpGet]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public ActionResult<List<ExchangeRateV2Response>> GetLatest() =>
            Ok(_service.GetLatestRates());

        [HttpGet("{currencyCode}")]
        public ActionResult<ExchangeRateV2Response> GetRate(string currencyCode, [FromQuery] DateTime? date = null) =>
            _service.GetRate(currencyCode, date) is { } r ? Ok(r) : NotFound();

        [HttpGet("{currencyCode}/history")]
        public ActionResult<List<ExchangeRateV2Response>> GetHistory(string currencyCode, [FromQuery] int limit = 30) =>
            Ok(_service.GetHistory(currencyCode, limit));

        [HttpPost]
        public ActionResult<ExchangeRateV2Response> Upsert([FromBody] UpsertExchangeRateRequest request) =>
            Ok(_service.Upsert(request, GetUserId()));
    }

    // ================================================================
    // SEASONS
    // ================================================================
    [ApiController]
    [Route("api/inventory/seasons")]
    public class SeasonsController : ControllerBase
    {
        private readonly ISeasonService _service;
        private readonly ITenantProvider _tenantProvider;
        public SeasonsController(ISeasonService service, ITenantProvider tenantProvider)
        { _service = service; _tenantProvider = tenantProvider; }

        private long GetTenantId() => _tenantProvider.GetTenantId() ?? 1;
        private long GetUserId() => long.TryParse(User?.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 1;

        [HttpGet]
        public ActionResult<List<SeasonResponse>> GetAll([FromQuery] bool includeInactive = false) =>
            Ok(_service.GetAll(GetTenantId(), includeInactive));

        [HttpGet("{id}")]
        public ActionResult<SeasonResponse> GetById(long id) =>
            _service.GetById(id) is { } s ? Ok(s) : NotFound();

        [HttpGet("by-date")]
        public ActionResult<List<SeasonResponse>> GetByDate([FromQuery] DateTime date) =>
            Ok(_service.GetByDate(GetTenantId(), date));

        [HttpPost]
        public ActionResult<SeasonResponse> Create([FromBody] CreateSeasonRequest request) =>
            Ok(_service.Create(request, GetTenantId(), GetUserId()));

        [HttpPut("{id}")]
        public ActionResult<SeasonResponse> Update(long id, [FromBody] UpdateSeasonRequest request) =>
            _service.Update(id, request) is { } s ? Ok(s) : NotFound();

        [HttpDelete("{id}")]
        public ActionResult Delete(long id) =>
            _service.Deactivate(id) ? Ok() : NotFound();

        [HttpPost("{id}/activate")]
        public ActionResult Activate(long id) =>
            _service.Activate(id) ? Ok() : NotFound();
    }

    // ================================================================
    // HOTEL SEASON PRICING
    // ================================================================
    [ApiController]
    [Route("api/inventory/hotel-season-pricing")]
    public class HotelSeasonPricingController : ControllerBase
    {
        private readonly IHotelSeasonPricingService _service;
        public HotelSeasonPricingController(IHotelSeasonPricingService service) => _service = service;

        [HttpGet("room/{hotelRoomId}")]
        public ActionResult<List<HotelSeasonPricingResponse>> GetByRoom(long hotelRoomId) =>
            Ok(_service.GetByRoom(hotelRoomId));

        [HttpGet("season/{seasonId}")]
        public ActionResult<List<HotelSeasonPricingResponse>> GetBySeason(long seasonId) =>
            Ok(_service.GetBySeason(seasonId));

        [HttpPost]
        public ActionResult<HotelSeasonPricingResponse> Create([FromBody] CreateHotelSeasonPricingRequest request) =>
            Ok(_service.Create(request));

        [HttpDelete("{id}")]
        public ActionResult Delete(long id) =>
            _service.Delete(id) ? Ok() : NotFound();
    }

    // ================================================================
    // VEHICLE ROUTES
    // ================================================================
    [ApiController]
    [Route("api/inventory/vehicle-routes")]
    public class VehicleRoutesController : ControllerBase
    {
        private readonly IVehicleRouteService _service;
        private readonly ITenantProvider _tenantProvider;
        public VehicleRoutesController(IVehicleRouteService service, ITenantProvider tenantProvider)
        { _service = service; _tenantProvider = tenantProvider; }

        private long GetTenantId() => _tenantProvider.GetTenantId() ?? 1;

        [HttpGet]
        public ActionResult<List<VehicleRouteResponse>> GetAll([FromQuery] bool includeInactive = false) =>
            Ok(_service.GetAll(GetTenantId(), includeInactive));

        [HttpGet("{id}")]
        public ActionResult<VehicleRouteResponse> GetById(long id) =>
            _service.GetById(id) is { } route ? Ok(route) : NotFound();

        [HttpGet("by-route")]
        public ActionResult<List<VehicleRouteResponse>> GetByRoute([FromQuery] long fromId, [FromQuery] long toId) =>
            Ok(_service.GetByRoute(fromId, toId));

        [HttpPost]
        public ActionResult<VehicleRouteResponse> Create([FromBody] CreateVehicleRouteRequest request) =>
            Ok(_service.Create(request, GetTenantId()));

        [HttpPut("{id}")]
        public ActionResult<VehicleRouteResponse> Update(long id, [FromBody] UpdateVehicleRouteRequest request) =>
            _service.Update(id, request) is { } route ? Ok(route) : NotFound();

        [HttpDelete("{id}")]
        public ActionResult Delete(long id) =>
            _service.Deactivate(id) ? Ok() : NotFound();

        [HttpPost("{id}/activate")]
        public ActionResult Activate(long id) =>
            _service.Activate(id) ? Ok() : NotFound();
    }

    // ================================================================
    // GUIDE LOCATIONS
    // ================================================================
    [ApiController]
    [Route("api/inventory/guide-locations")]
    public class GuideLocationsController : ControllerBase
    {
        private readonly IGuideLocationService _service;
        public GuideLocationsController(IGuideLocationService service) => _service = service;

        [HttpGet("guide/{guideId}")]
        public ActionResult<List<GuideLocationResponse>> GetByGuide(long guideId) =>
            Ok(_service.GetByGuide(guideId));

        [HttpGet("location/{locationId}")]
        public ActionResult<List<GuideLocationResponse>> GetByLocation(long locationId) =>
            Ok(_service.GetByLocation(locationId));

        [HttpPost]
        public ActionResult<GuideLocationResponse> Create([FromBody] CreateGuideLocationRequest request) =>
            Ok(_service.Create(request));

        [HttpDelete("{id}")]
        public ActionResult Delete(long id) =>
            _service.Delete(id) ? Ok() : NotFound();
    }

    // ================================================================
    // ACTIVITY LOCATIONS
    // ================================================================
    [ApiController]
    [Route("api/inventory/activity-locations")]
    public class ActivityLocationsController : ControllerBase
    {
        private readonly IActivityLocationService _service;
        public ActivityLocationsController(IActivityLocationService service) => _service = service;

        [HttpGet("activity/{activityId}")]
        public ActionResult<List<ActivityLocationResponse>> GetByActivity(long activityId) =>
            Ok(_service.GetByActivity(activityId));

        [HttpGet("location/{locationId}")]
        public ActionResult<List<ActivityLocationResponse>> GetByLocation(long locationId) =>
            Ok(_service.GetByLocation(locationId));

        [HttpPost]
        public ActionResult<ActivityLocationResponse> Create([FromBody] CreateActivityLocationRequest request) =>
            Ok(_service.Create(request));

        [HttpDelete("{id}")]
        public ActionResult Delete(long id) =>
            _service.Delete(id) ? Ok() : NotFound();
    }

    // ================================================================
    // ACCOMMODATION CATEGORIES
    // ================================================================
    [ApiController]
    [Route("api/inventory/accommodation-categories")]
    public class AccommodationCategoriesController : ControllerBase
    {
        private readonly IAccommodationCategoryService _service;
        public AccommodationCategoriesController(IAccommodationCategoryService service) => _service = service;

        /// <summary>GET api/inventory/accommodation-categories</summary>
        [HttpGet]
        public ActionResult<List<AccommodationCategoryResponse>> GetAll([FromQuery] bool includeInactive = false) =>
            Ok(_service.GetAll(includeInactive));

        /// <summary>GET api/inventory/accommodation-categories/{id}</summary>
        [HttpGet("{id}")]
        public ActionResult<AccommodationCategoryResponse> GetById(long id) =>
            _service.GetById(id) is { } cat ? Ok(cat) : NotFound();

        /// <summary>
        /// GET api/inventory/accommodation-categories/{id}/hotels?locationId=3
        /// Returns hotels matching this accommodation category. Optionally filter by location.
        /// Used when converting a master itinerary into a booking.
        /// </summary>
        [HttpGet("{id}/hotels")]
        public ActionResult<List<HotelSuggestionResponse>> GetHotelsByCategory(long id, [FromQuery] long? locationId = null) =>
            Ok(_service.GetHotelsByCategory(id, locationId));
    }
}
