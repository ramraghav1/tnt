using System;
using System.Collections.Generic;

namespace Domain.Models.TourAndTravels
{
    /// <summary>
    /// Inventory Redesign domain models — Location, Currency, ExchangeRateV2,
    /// Season, HotelSeasonPricing, VehicleRoute, GuideLocation, ActivityLocation.
    /// </summary>
    public static class InventoryRedesign
    {
        // ================================================================
        // LOCATION
        // ================================================================
        public class CreateLocationRequest
        {
            public string Name { get; set; } = string.Empty;
            public string? Code { get; set; }
            public string Country { get; set; } = string.Empty;
            public string? Region { get; set; }
            public decimal? Latitude { get; set; }
            public decimal? Longitude { get; set; }
            public decimal CostMultiplier { get; set; } = 1.00m;
            public string? Timezone { get; set; }
            public string? Description { get; set; }
        }

        public class UpdateLocationRequest
        {
            public string? Name { get; set; }
            public string? Code { get; set; }
            public string? Country { get; set; }
            public string? Region { get; set; }
            public decimal? Latitude { get; set; }
            public decimal? Longitude { get; set; }
            public decimal? CostMultiplier { get; set; }
            public string? Timezone { get; set; }
            public string? Description { get; set; }
        }

        public class LocationResponse
        {
            public long Id { get; set; }
            public long TenantId { get; set; }
            public string Name { get; set; } = string.Empty;
            public string? Code { get; set; }
            public string Country { get; set; } = string.Empty;
            public string? Region { get; set; }
            public decimal? Latitude { get; set; }
            public decimal? Longitude { get; set; }
            public decimal CostMultiplier { get; set; }
            public string? Timezone { get; set; }
            public string? Description { get; set; }
            public bool IsActive { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime UpdatedAt { get; set; }
        }

        // ================================================================
        // CURRENCY
        // ================================================================
        public class CurrencyResponse
        {
            public long Id { get; set; }
            public string Code { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string Symbol { get; set; } = string.Empty;
            public int DecimalPlaces { get; set; }
            public bool IsBase { get; set; }
            public bool IsActive { get; set; }
        }

        public class CreateCurrencyRequest
        {
            public string Code { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string Symbol { get; set; } = string.Empty;
            public int DecimalPlaces { get; set; } = 2;
            public bool IsBase { get; set; }
        }

        // ================================================================
        // EXCHANGE RATE V2
        // ================================================================
        public class ExchangeRateV2Response
        {
            public long Id { get; set; }
            public string CurrencyCode { get; set; } = string.Empty;
            public decimal RateToUsd { get; set; }
            public decimal RateFromUsd { get; set; }
            public DateOnly EffectiveDate { get; set; }
            public string? Source { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        public class UpsertExchangeRateRequest
        {
            public string CurrencyCode { get; set; } = string.Empty;
            public decimal RateToUsd { get; set; }
            public decimal RateFromUsd { get; set; }
            public DateOnly EffectiveDate { get; set; }
            public string? Source { get; set; }
        }

        // ================================================================
        // SEASON
        // ================================================================
        public class CreateSeasonRequest
        {
            public string Name { get; set; } = string.Empty;
            public string SeasonType { get; set; } = "Normal"; // Peak, Normal, Off, Monsoon, Festival
            public DateOnly StartDate { get; set; }
            public DateOnly EndDate { get; set; }
            public decimal PriceMultiplier { get; set; } = 1.00m;
            public string? Description { get; set; }
            public int Year { get; set; }
        }

        public class UpdateSeasonRequest
        {
            public string? Name { get; set; }
            public string? SeasonType { get; set; }
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
            public decimal? PriceMultiplier { get; set; }
            public string? Description { get; set; }
            public int? Year { get; set; }
        }

        public class SeasonResponse
        {
            public long Id { get; set; }
            public long TenantId { get; set; }
            public string Name { get; set; } = string.Empty;
            public string SeasonType { get; set; } = string.Empty;
            public DateOnly StartDate { get; set; }
            public DateOnly EndDate { get; set; }
            public decimal PriceMultiplier { get; set; }
            public string? Description { get; set; }
            public int Year { get; set; }
            public bool IsActive { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime UpdatedAt { get; set; }
        }

        // ================================================================
        // HOTEL SEASON PRICING
        // ================================================================
        public class CreateHotelSeasonPricingRequest
        {
            public long HotelRoomId { get; set; }
            public long SeasonId { get; set; }
            public decimal PricePerNight { get; set; }
            public string Currency { get; set; } = "USD";
            public string? Notes { get; set; }
        }

        public class HotelSeasonPricingResponse
        {
            public long Id { get; set; }
            public long HotelRoomId { get; set; }
            public long SeasonId { get; set; }
            public string? SeasonName { get; set; }
            public string? SeasonType { get; set; }
            public decimal PricePerNight { get; set; }
            public string Currency { get; set; } = string.Empty;
            public string? Notes { get; set; }
        }

        // ================================================================
        // VEHICLE ROUTE
        // ================================================================
        public class CreateVehicleRouteRequest
        {
            public string VehicleType { get; set; } = string.Empty;
            public long LocationFromId { get; set; }
            public long LocationToId { get; set; }
            public decimal? DistanceKm { get; set; }
            public decimal? DurationHours { get; set; }
            public decimal BasePrice { get; set; }
            public string Currency { get; set; } = "USD";
            public int Capacity { get; set; } = 4;
            public string? Notes { get; set; }
        }

        public class UpdateVehicleRouteRequest
        {
            public string? VehicleType { get; set; }
            public long? LocationFromId { get; set; }
            public long? LocationToId { get; set; }
            public decimal? DistanceKm { get; set; }
            public decimal? DurationHours { get; set; }
            public decimal? BasePrice { get; set; }
            public string? Currency { get; set; }
            public int? Capacity { get; set; }
            public string? Notes { get; set; }
        }

        public class VehicleRouteResponse
        {
            public long Id { get; set; }
            public long TenantId { get; set; }
            public string VehicleType { get; set; } = string.Empty;
            public long LocationFromId { get; set; }
            public string? LocationFromName { get; set; }
            public long LocationToId { get; set; }
            public string? LocationToName { get; set; }
            public decimal? DistanceKm { get; set; }
            public decimal? DurationHours { get; set; }
            public decimal BasePrice { get; set; }
            public string Currency { get; set; } = string.Empty;
            public int Capacity { get; set; }
            public string? Notes { get; set; }
            public bool IsActive { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime UpdatedAt { get; set; }
        }

        // ================================================================
        // GUIDE LOCATION
        // ================================================================
        public class CreateGuideLocationRequest
        {
            public long GuideId { get; set; }
            public long LocationId { get; set; }
            public bool IsPrimary { get; set; }
            public string? Notes { get; set; }
        }

        public class GuideLocationResponse
        {
            public long Id { get; set; }
            public long GuideId { get; set; }
            public long LocationId { get; set; }
            public string? LocationName { get; set; }
            public bool IsPrimary { get; set; }
            public string? Notes { get; set; }
        }

        // ================================================================
        // ACTIVITY LOCATION
        // ================================================================
        public class CreateActivityLocationRequest
        {
            public long ActivityId { get; set; }
            public long LocationId { get; set; }
            public bool IsPrimary { get; set; }
        }

        public class ActivityLocationResponse
        {
            public long Id { get; set; }
            public long ActivityId { get; set; }
            public long LocationId { get; set; }
            public string? LocationName { get; set; }
            public bool IsPrimary { get; set; }
        }

        // ================================================================
        // ACCOMMODATION CATEGORY
        // ================================================================
        public class AccommodationCategoryResponse
        {
            public long Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string Code { get; set; } = string.Empty;
            public string? Icon { get; set; }
            public int? StarRating { get; set; }
            public int SortOrder { get; set; }
            public string? Description { get; set; }
            public bool IsActive { get; set; }
        }

        /// <summary>
        /// Hotels that match a given accommodation category — returned when
        /// the user converts a master itinerary into a booking.
        /// </summary>
        public class HotelSuggestionResponse
        {
            public long HotelId { get; set; }
            public string HotelName { get; set; } = string.Empty;
            public string? Location { get; set; }
            public int? StarRating { get; set; }
            public string? Category { get; set; }
            public long? AccommodationCategoryId { get; set; }
            public string? AccommodationCategoryName { get; set; }
            public decimal? MinPrice { get; set; }
            public string? Description { get; set; }
        }
    }
}
