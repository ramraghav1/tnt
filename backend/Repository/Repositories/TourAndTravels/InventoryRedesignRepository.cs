using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Dapper;
using Repository.Interfaces.TourAndTravels;
using static Domain.Models.TourAndTravels.InventoryRedesign;

namespace Repository.Repositories.TourAndTravels
{
    // ================================================================
    // LOCATION REPOSITORY
    // ================================================================
    public class LocationRepository : ILocationRepository
    {
        private readonly IDbConnection _db;
        public LocationRepository(IDbConnection db) => _db = db;

        public LocationResponse Create(CreateLocationRequest req, long tenantId, long userId)
        {
            const string sql = @"
                INSERT INTO locations (tenant_id, name, code, country, region, latitude, longitude,
                    cost_multiplier, timezone, description, created_by)
                VALUES (@TenantId, @Name, @Code, @Country, @Region, @Latitude, @Longitude,
                    @CostMultiplier, @Timezone, @Description, @UserId)
                RETURNING id;";
            long id = _db.QuerySingle<long>(sql, new
            {
                TenantId = tenantId, req.Name, req.Code, req.Country, req.Region,
                req.Latitude, req.Longitude, req.CostMultiplier, req.Timezone, req.Description, UserId = userId
            });
            return GetById(id)!;
        }

        public LocationResponse? Update(long id, UpdateLocationRequest req)
        {
            var parts = new List<string>();
            var p = new DynamicParameters();
            p.Add("Id", id);
            if (req.Name != null) { parts.Add("name = @Name"); p.Add("Name", req.Name); }
            if (req.Code != null) { parts.Add("code = @Code"); p.Add("Code", req.Code); }
            if (req.Country != null) { parts.Add("country = @Country"); p.Add("Country", req.Country); }
            if (req.Region != null) { parts.Add("region = @Region"); p.Add("Region", req.Region); }
            if (req.Latitude != null) { parts.Add("latitude = @Latitude"); p.Add("Latitude", req.Latitude); }
            if (req.Longitude != null) { parts.Add("longitude = @Longitude"); p.Add("Longitude", req.Longitude); }
            if (req.CostMultiplier != null) { parts.Add("cost_multiplier = @CostMultiplier"); p.Add("CostMultiplier", req.CostMultiplier); }
            if (req.Timezone != null) { parts.Add("timezone = @Timezone"); p.Add("Timezone", req.Timezone); }
            if (req.Description != null) { parts.Add("description = @Description"); p.Add("Description", req.Description); }
            if (parts.Count == 0) return GetById(id);
            parts.Add("updated_at = NOW()");
            string sql = $"UPDATE locations SET {string.Join(", ", parts)} WHERE id = @Id;";
            _db.Execute(sql, p);
            return GetById(id);
        }

        public LocationResponse? GetById(long id)
        {
            return _db.QuerySingleOrDefault<LocationResponse>(
                "SELECT id, tenant_id, name, code, country, region, latitude, longitude, cost_multiplier, timezone, description, is_active, created_at, updated_at FROM locations WHERE id = @Id;",
                new { Id = id });
        }

        public List<LocationResponse> GetAll(long tenantId, bool includeInactive = false)
        {
            string where = includeInactive ? "tenant_id = @TenantId" : "tenant_id = @TenantId AND is_active = true";
            return _db.Query<LocationResponse>(
                $"SELECT id, tenant_id, name, code, country, region, latitude, longitude, cost_multiplier, timezone, description, is_active, created_at, updated_at FROM locations WHERE {where} ORDER BY country, name;",
                new { TenantId = tenantId }).ToList();
        }

        public bool Deactivate(long id) =>
            _db.Execute("UPDATE locations SET is_active = false, updated_at = NOW() WHERE id = @Id;", new { Id = id }) > 0;

        public bool Activate(long id) =>
            _db.Execute("UPDATE locations SET is_active = true, updated_at = NOW() WHERE id = @Id;", new { Id = id }) > 0;
    }

    // ================================================================
    // CURRENCY REPOSITORY
    // ================================================================
    public class CurrencyRepository : ICurrencyRepository
    {
        private readonly IDbConnection _db;
        public CurrencyRepository(IDbConnection db) => _db = db;

        public CurrencyResponse Create(CreateCurrencyRequest req)
        {
            const string sql = @"
                INSERT INTO currencies (code, name, symbol, decimal_places, is_base)
                VALUES (@Code, @Name, @Symbol, @DecimalPlaces, @IsBase)
                RETURNING id, code, name, symbol, decimal_places, is_base, is_active;";
            return _db.QuerySingle<CurrencyResponse>(sql, req);
        }

        public List<CurrencyResponse> GetAll(bool includeInactive = false)
        {
            string where = includeInactive ? "1=1" : "is_active = true";
            return _db.Query<CurrencyResponse>(
                $"SELECT id, code, name, symbol, decimal_places, is_base, is_active FROM currencies WHERE {where} ORDER BY code;").ToList();
        }

        public CurrencyResponse? GetByCode(string code) =>
            _db.QuerySingleOrDefault<CurrencyResponse>(
                "SELECT id, code, name, symbol, decimal_places, is_base, is_active FROM currencies WHERE code = @Code;",
                new { Code = code });

        public bool SetActive(long id, bool isActive) =>
            _db.Execute("UPDATE currencies SET is_active = @IsActive WHERE id = @Id;", new { Id = id, IsActive = isActive }) > 0;
    }

    // ================================================================
    // EXCHANGE RATE V2 REPOSITORY
    // ================================================================
    public class ExchangeRateV2Repository : IExchangeRateV2Repository
    {
        private readonly IDbConnection _db;
        public ExchangeRateV2Repository(IDbConnection db) => _db = db;

        public ExchangeRateV2Response Upsert(UpsertExchangeRateRequest req, long userId)
        {
            const string sql = @"
                INSERT INTO exchange_rates_v2 (currency_code, rate_to_usd, rate_from_usd, effective_date, source, created_by)
                VALUES (@CurrencyCode, @RateToUsd, @RateFromUsd, @EffectiveDate, @Source, @UserId)
                ON CONFLICT (currency_code, effective_date)
                DO UPDATE SET rate_to_usd = EXCLUDED.rate_to_usd, rate_from_usd = EXCLUDED.rate_from_usd,
                              source = EXCLUDED.source, created_by = EXCLUDED.created_by
                RETURNING id, currency_code, rate_to_usd, rate_from_usd, effective_date, source, created_at;";
            return _db.QuerySingle<ExchangeRateV2Response>(sql, new
            {
                req.CurrencyCode, req.RateToUsd, req.RateFromUsd, req.EffectiveDate, req.Source, UserId = userId
            });
        }

        public List<ExchangeRateV2Response> GetLatestRates()
        {
            const string sql = @"
                SELECT DISTINCT ON (currency_code)
                    id, currency_code, rate_to_usd, rate_from_usd, effective_date, source, created_at
                FROM exchange_rates_v2
                ORDER BY currency_code, effective_date DESC;";
            return _db.Query<ExchangeRateV2Response>(sql).ToList();
        }

        public ExchangeRateV2Response? GetRate(string currencyCode, DateTime? date = null)
        {
            string sql = date.HasValue
                ? @"SELECT id, currency_code, rate_to_usd, rate_from_usd, effective_date, source, created_at
                    FROM exchange_rates_v2 WHERE currency_code = @Code AND effective_date <= @Date
                    ORDER BY effective_date DESC LIMIT 1;"
                : @"SELECT id, currency_code, rate_to_usd, rate_from_usd, effective_date, source, created_at
                    FROM exchange_rates_v2 WHERE currency_code = @Code
                    ORDER BY effective_date DESC LIMIT 1;";
            return _db.QuerySingleOrDefault<ExchangeRateV2Response>(sql, new { Code = currencyCode, Date = date });
        }

        public List<ExchangeRateV2Response> GetHistory(string currencyCode, int limit = 30)
        {
            return _db.Query<ExchangeRateV2Response>(
                @"SELECT id, currency_code, rate_to_usd, rate_from_usd, effective_date, source, created_at
                  FROM exchange_rates_v2 WHERE currency_code = @Code ORDER BY effective_date DESC LIMIT @Limit;",
                new { Code = currencyCode, Limit = limit }).ToList();
        }
    }

    // ================================================================
    // SEASON REPOSITORY
    // ================================================================
    public class SeasonRepository : ISeasonRepository
    {
        private readonly IDbConnection _db;
        public SeasonRepository(IDbConnection db) => _db = db;

        public SeasonResponse Create(CreateSeasonRequest req, long tenantId, long userId)
        {
            const string sql = @"
                INSERT INTO seasons (tenant_id, name, season_type, start_date, end_date, price_multiplier, description, year, created_by)
                VALUES (@TenantId, @Name, @SeasonType, @StartDate, @EndDate, @PriceMultiplier, @Description, @Year, @UserId)
                RETURNING id;";
            long id = _db.QuerySingle<long>(sql, new
            {
                TenantId = tenantId, req.Name, req.SeasonType, req.StartDate, req.EndDate,
                req.PriceMultiplier, req.Description, req.Year, UserId = userId
            });
            return GetById(id)!;
        }

        public SeasonResponse? Update(long id, UpdateSeasonRequest req)
        {
            var parts = new List<string>();
            var p = new DynamicParameters();
            p.Add("Id", id);
            if (req.Name != null) { parts.Add("name = @Name"); p.Add("Name", req.Name); }
            if (req.SeasonType != null) { parts.Add("season_type = @SeasonType"); p.Add("SeasonType", req.SeasonType); }
            if (req.StartDate != null) { parts.Add("start_date = @StartDate"); p.Add("StartDate", req.StartDate); }
            if (req.EndDate != null) { parts.Add("end_date = @EndDate"); p.Add("EndDate", req.EndDate); }
            if (req.PriceMultiplier != null) { parts.Add("price_multiplier = @PriceMultiplier"); p.Add("PriceMultiplier", req.PriceMultiplier); }
            if (req.Description != null) { parts.Add("description = @Description"); p.Add("Description", req.Description); }
            if (req.Year != null) { parts.Add("year = @Year"); p.Add("Year", req.Year); }
            if (parts.Count == 0) return GetById(id);
            parts.Add("updated_at = NOW()");
            string sql = $"UPDATE seasons SET {string.Join(", ", parts)} WHERE id = @Id;";
            _db.Execute(sql, p);
            return GetById(id);
        }

        public SeasonResponse? GetById(long id)
        {
            return _db.QuerySingleOrDefault<SeasonResponse>(
                "SELECT id, tenant_id, name, season_type, start_date, end_date, price_multiplier, description, year, is_active, created_at, updated_at FROM seasons WHERE id = @Id;",
                new { Id = id });
        }

        public List<SeasonResponse> GetAll(long tenantId, bool includeInactive = false)
        {
            string where = includeInactive ? "tenant_id = @TenantId" : "tenant_id = @TenantId AND is_active = true";
            return _db.Query<SeasonResponse>(
                $"SELECT id, tenant_id, name, season_type, start_date, end_date, price_multiplier, description, year, is_active, created_at, updated_at FROM seasons WHERE {where} ORDER BY year DESC, start_date;",
                new { TenantId = tenantId }).ToList();
        }

        public List<SeasonResponse> GetByDate(long tenantId, DateTime date)
        {
            return _db.Query<SeasonResponse>(
                @"SELECT id, tenant_id, name, season_type, start_date, end_date, price_multiplier, description, year, is_active, created_at, updated_at
                  FROM seasons WHERE tenant_id = @TenantId AND is_active = true AND start_date <= @Date AND end_date >= @Date;",
                new { TenantId = tenantId, Date = date }).ToList();
        }

        public bool Deactivate(long id) =>
            _db.Execute("UPDATE seasons SET is_active = false, updated_at = NOW() WHERE id = @Id;", new { Id = id }) > 0;

        public bool Activate(long id) =>
            _db.Execute("UPDATE seasons SET is_active = true, updated_at = NOW() WHERE id = @Id;", new { Id = id }) > 0;
    }

    // ================================================================
    // HOTEL SEASON PRICING REPOSITORY
    // ================================================================
    public class HotelSeasonPricingRepository : IHotelSeasonPricingRepository
    {
        private readonly IDbConnection _db;
        public HotelSeasonPricingRepository(IDbConnection db) => _db = db;

        public HotelSeasonPricingResponse Create(CreateHotelSeasonPricingRequest req)
        {
            const string sql = @"
                INSERT INTO hotel_season_pricing (hotel_room_id, season_id, price_per_night, currency, notes)
                VALUES (@HotelRoomId, @SeasonId, @PricePerNight, @Currency, @Notes)
                RETURNING id;";
            long id = _db.QuerySingle<long>(sql, req);
            return _db.QuerySingle<HotelSeasonPricingResponse>(
                @"SELECT hsp.id, hsp.hotel_room_id, hsp.season_id, s.name AS season_name, s.season_type,
                    hsp.price_per_night, hsp.currency, hsp.notes
                  FROM hotel_season_pricing hsp JOIN seasons s ON s.id = hsp.season_id WHERE hsp.id = @Id;",
                new { Id = id });
        }

        public List<HotelSeasonPricingResponse> GetByRoom(long hotelRoomId)
        {
            return _db.Query<HotelSeasonPricingResponse>(
                @"SELECT hsp.id, hsp.hotel_room_id, hsp.season_id, s.name AS season_name, s.season_type,
                    hsp.price_per_night, hsp.currency, hsp.notes
                  FROM hotel_season_pricing hsp JOIN seasons s ON s.id = hsp.season_id
                  WHERE hsp.hotel_room_id = @RoomId ORDER BY s.start_date;",
                new { RoomId = hotelRoomId }).ToList();
        }

        public List<HotelSeasonPricingResponse> GetBySeason(long seasonId)
        {
            return _db.Query<HotelSeasonPricingResponse>(
                @"SELECT hsp.id, hsp.hotel_room_id, hsp.season_id, s.name AS season_name, s.season_type,
                    hsp.price_per_night, hsp.currency, hsp.notes
                  FROM hotel_season_pricing hsp JOIN seasons s ON s.id = hsp.season_id
                  WHERE hsp.season_id = @SeasonId;",
                new { SeasonId = seasonId }).ToList();
        }

        public bool Delete(long id) =>
            _db.Execute("DELETE FROM hotel_season_pricing WHERE id = @Id;", new { Id = id }) > 0;
    }

    // ================================================================
    // VEHICLE ROUTE REPOSITORY
    // ================================================================
    public class VehicleRouteRepository : IVehicleRouteRepository
    {
        private readonly IDbConnection _db;
        public VehicleRouteRepository(IDbConnection db) => _db = db;

        private const string SelectColumns = @"
            vr.id, vr.tenant_id, vr.vehicle_type,
            vr.location_from_id, lf.name AS location_from_name,
            vr.location_to_id, lt.name AS location_to_name,
            vr.distance_km, vr.duration_hours, vr.base_price, vr.currency,
            vr.capacity, vr.notes, vr.is_active, vr.created_at, vr.updated_at";

        private const string JoinClause = @"
            FROM vehicle_routes vr
            LEFT JOIN locations lf ON lf.id = vr.location_from_id
            LEFT JOIN locations lt ON lt.id = vr.location_to_id";

        public VehicleRouteResponse Create(CreateVehicleRouteRequest req, long tenantId)
        {
            const string sql = @"
                INSERT INTO vehicle_routes (tenant_id, vehicle_type, location_from_id, location_to_id,
                    distance_km, duration_hours, base_price, currency, capacity, notes)
                VALUES (@TenantId, @VehicleType, @LocationFromId, @LocationToId,
                    @DistanceKm, @DurationHours, @BasePrice, @Currency, @Capacity, @Notes)
                RETURNING id;";
            long id = _db.QuerySingle<long>(sql, new
            {
                TenantId = tenantId, req.VehicleType, req.LocationFromId, req.LocationToId,
                req.DistanceKm, req.DurationHours, req.BasePrice, req.Currency, req.Capacity, req.Notes
            });
            return GetById(id)!;
        }

        public VehicleRouteResponse? Update(long id, UpdateVehicleRouteRequest req)
        {
            var parts = new List<string>();
            var p = new DynamicParameters();
            p.Add("Id", id);
            if (req.VehicleType != null) { parts.Add("vehicle_type = @VehicleType"); p.Add("VehicleType", req.VehicleType); }
            if (req.LocationFromId != null) { parts.Add("location_from_id = @LocationFromId"); p.Add("LocationFromId", req.LocationFromId); }
            if (req.LocationToId != null) { parts.Add("location_to_id = @LocationToId"); p.Add("LocationToId", req.LocationToId); }
            if (req.DistanceKm != null) { parts.Add("distance_km = @DistanceKm"); p.Add("DistanceKm", req.DistanceKm); }
            if (req.DurationHours != null) { parts.Add("duration_hours = @DurationHours"); p.Add("DurationHours", req.DurationHours); }
            if (req.BasePrice != null) { parts.Add("base_price = @BasePrice"); p.Add("BasePrice", req.BasePrice); }
            if (req.Currency != null) { parts.Add("currency = @Currency"); p.Add("Currency", req.Currency); }
            if (req.Capacity != null) { parts.Add("capacity = @Capacity"); p.Add("Capacity", req.Capacity); }
            if (req.Notes != null) { parts.Add("notes = @Notes"); p.Add("Notes", req.Notes); }
            if (parts.Count == 0) return GetById(id);
            parts.Add("updated_at = NOW()");
            _db.Execute($"UPDATE vehicle_routes SET {string.Join(", ", parts)} WHERE id = @Id;", p);
            return GetById(id);
        }

        public VehicleRouteResponse? GetById(long id) =>
            _db.QuerySingleOrDefault<VehicleRouteResponse>($"SELECT {SelectColumns} {JoinClause} WHERE vr.id = @Id;", new { Id = id });

        public List<VehicleRouteResponse> GetAll(long tenantId, bool includeInactive = false)
        {
            string where = includeInactive ? "vr.tenant_id = @TenantId" : "vr.tenant_id = @TenantId AND vr.is_active = true";
            return _db.Query<VehicleRouteResponse>(
                $"SELECT {SelectColumns} {JoinClause} WHERE {where} ORDER BY lf.name, lt.name;",
                new { TenantId = tenantId }).ToList();
        }

        public List<VehicleRouteResponse> GetByRoute(long locationFromId, long locationToId) =>
            _db.Query<VehicleRouteResponse>(
                $"SELECT {SelectColumns} {JoinClause} WHERE vr.location_from_id = @From AND vr.location_to_id = @To AND vr.is_active = true ORDER BY vr.base_price;",
                new { From = locationFromId, To = locationToId }).ToList();

        public bool Deactivate(long id) =>
            _db.Execute("UPDATE vehicle_routes SET is_active = false, updated_at = NOW() WHERE id = @Id;", new { Id = id }) > 0;

        public bool Activate(long id) =>
            _db.Execute("UPDATE vehicle_routes SET is_active = true, updated_at = NOW() WHERE id = @Id;", new { Id = id }) > 0;
    }

    // ================================================================
    // GUIDE LOCATION REPOSITORY
    // ================================================================
    public class GuideLocationRepository : IGuideLocationRepository
    {
        private readonly IDbConnection _db;
        public GuideLocationRepository(IDbConnection db) => _db = db;

        public GuideLocationResponse Create(CreateGuideLocationRequest req)
        {
            const string sql = @"
                INSERT INTO guide_locations (guide_id, location_id, is_primary, notes)
                VALUES (@GuideId, @LocationId, @IsPrimary, @Notes)
                RETURNING id;";
            long id = _db.QuerySingle<long>(sql, req);
            return _db.QuerySingle<GuideLocationResponse>(
                @"SELECT gl.id, gl.guide_id, gl.location_id, l.name AS location_name, gl.is_primary, gl.notes
                  FROM guide_locations gl JOIN locations l ON l.id = gl.location_id WHERE gl.id = @Id;",
                new { Id = id });
        }

        public List<GuideLocationResponse> GetByGuide(long guideId) =>
            _db.Query<GuideLocationResponse>(
                @"SELECT gl.id, gl.guide_id, gl.location_id, l.name AS location_name, gl.is_primary, gl.notes
                  FROM guide_locations gl JOIN locations l ON l.id = gl.location_id
                  WHERE gl.guide_id = @GuideId ORDER BY gl.is_primary DESC, l.name;",
                new { GuideId = guideId }).ToList();

        public List<GuideLocationResponse> GetByLocation(long locationId) =>
            _db.Query<GuideLocationResponse>(
                @"SELECT gl.id, gl.guide_id, gl.location_id, l.name AS location_name, gl.is_primary, gl.notes
                  FROM guide_locations gl JOIN locations l ON l.id = gl.location_id
                  WHERE gl.location_id = @LocationId;",
                new { LocationId = locationId }).ToList();

        public bool Delete(long id) =>
            _db.Execute("DELETE FROM guide_locations WHERE id = @Id;", new { Id = id }) > 0;
    }

    // ================================================================
    // ACTIVITY LOCATION REPOSITORY
    // ================================================================
    public class ActivityLocationRepository : IActivityLocationRepository
    {
        private readonly IDbConnection _db;
        public ActivityLocationRepository(IDbConnection db) => _db = db;

        public ActivityLocationResponse Create(CreateActivityLocationRequest req)
        {
            const string sql = @"
                INSERT INTO activity_locations (activity_id, location_id, is_primary)
                VALUES (@ActivityId, @LocationId, @IsPrimary)
                RETURNING id;";
            long id = _db.QuerySingle<long>(sql, req);
            return _db.QuerySingle<ActivityLocationResponse>(
                @"SELECT al.id, al.activity_id, al.location_id, l.name AS location_name, al.is_primary
                  FROM activity_locations al JOIN locations l ON l.id = al.location_id WHERE al.id = @Id;",
                new { Id = id });
        }

        public List<ActivityLocationResponse> GetByActivity(long activityId) =>
            _db.Query<ActivityLocationResponse>(
                @"SELECT al.id, al.activity_id, al.location_id, l.name AS location_name, al.is_primary
                  FROM activity_locations al JOIN locations l ON l.id = al.location_id
                  WHERE al.activity_id = @ActivityId ORDER BY al.is_primary DESC, l.name;",
                new { ActivityId = activityId }).ToList();

        public List<ActivityLocationResponse> GetByLocation(long locationId) =>
            _db.Query<ActivityLocationResponse>(
                @"SELECT al.id, al.activity_id, al.location_id, l.name AS location_name, al.is_primary
                  FROM activity_locations al JOIN locations l ON l.id = al.location_id
                  WHERE al.location_id = @LocationId;",
                new { LocationId = locationId }).ToList();

        public bool Delete(long id) =>
            _db.Execute("DELETE FROM activity_locations WHERE id = @Id;", new { Id = id }) > 0;
    }

    // ================================================================
    // ACCOMMODATION CATEGORY REPOSITORY
    // ================================================================
    public class AccommodationCategoryRepository : IAccommodationCategoryRepository
    {
        private readonly IDbConnection _db;
        public AccommodationCategoryRepository(IDbConnection db) => _db = db;

        public List<AccommodationCategoryResponse> GetAll(bool includeInactive = false)
        {
            var where = includeInactive ? "" : "WHERE is_active = true";
            return _db.Query<AccommodationCategoryResponse>(
                $@"SELECT id, name, code, icon, star_rating, sort_order, description, is_active
                   FROM accommodation_categories {where}
                   ORDER BY sort_order;").ToList();
        }

        public AccommodationCategoryResponse? GetById(long id) =>
            _db.QueryFirstOrDefault<AccommodationCategoryResponse>(
                @"SELECT id, name, code, icon, star_rating, sort_order, description, is_active
                  FROM accommodation_categories WHERE id = @Id;",
                new { Id = id });

        /// <summary>
        /// Returns hotels whose accommodation_category_id matches the given category.
        /// Optionally filtered by location_id.
        /// </summary>
        public List<HotelSuggestionResponse> GetHotelsByCategory(long categoryId, long? locationId = null)
        {
            var sql = @"
                SELECT h.id   AS hotel_id,
                       h.name AS hotel_name,
                       h.location,
                       h.star_rating,
                       h.category,
                       h.accommodation_category_id,
                       ac.name AS accommodation_category_name,
                       (SELECT MIN(hr.price_per_night) FROM hotel_rooms hr WHERE hr.hotel_id = h.id AND hr.is_active = true) AS min_price,
                       h.description
                FROM hotels h
                LEFT JOIN accommodation_categories ac ON ac.id = h.accommodation_category_id
                WHERE h.is_active = true
                  AND h.accommodation_category_id = @CategoryId";

            if (locationId.HasValue)
                sql += " AND h.location_id = @LocationId";

            sql += " ORDER BY h.star_rating DESC, h.name;";

            return _db.Query<HotelSuggestionResponse>(sql, new { CategoryId = categoryId, LocationId = locationId }).ToList();
        }
    }
}
