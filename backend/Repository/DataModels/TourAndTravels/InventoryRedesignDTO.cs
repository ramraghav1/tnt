using System;

namespace Repository.DataModels.TourAndTravels
{
    /// <summary>
    /// DTOs for the new inventory redesign tables — flat Dapper-mapped objects.
    /// </summary>
    public static class InventoryRedesignDTO
    {
        public class LocationDTO
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
            public long? CreatedBy { get; set; }
        }

        public class CurrencyDTO
        {
            public long Id { get; set; }
            public string Code { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string Symbol { get; set; } = string.Empty;
            public int DecimalPlaces { get; set; }
            public bool IsBase { get; set; }
            public bool IsActive { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        public class ExchangeRateV2DTO
        {
            public long Id { get; set; }
            public string CurrencyCode { get; set; } = string.Empty;
            public decimal RateToUsd { get; set; }
            public decimal RateFromUsd { get; set; }
            public DateOnly EffectiveDate { get; set; }
            public string? Source { get; set; }
            public DateTime CreatedAt { get; set; }
            public long? CreatedBy { get; set; }
        }

        public class SeasonDTO
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
            public long? CreatedBy { get; set; }
        }

        public class HotelSeasonPricingDTO
        {
            public long Id { get; set; }
            public long HotelRoomId { get; set; }
            public long SeasonId { get; set; }
            public string? SeasonName { get; set; }
            public string? SeasonType { get; set; }
            public decimal PricePerNight { get; set; }
            public string Currency { get; set; } = string.Empty;
            public string? Notes { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        public class VehicleRouteDTO
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

        public class GuideLocationDTO
        {
            public long Id { get; set; }
            public long GuideId { get; set; }
            public long LocationId { get; set; }
            public string? LocationName { get; set; }
            public bool IsPrimary { get; set; }
            public string? Notes { get; set; }
        }

        public class ActivityLocationDTO
        {
            public long Id { get; set; }
            public long ActivityId { get; set; }
            public long LocationId { get; set; }
            public string? LocationName { get; set; }
            public bool IsPrimary { get; set; }
        }
    }
}
