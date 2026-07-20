using System;

namespace Repository.DataModels.TourAndTravels
{
    /// <summary>
    /// Dapper mapping DTOs for Itinerary Builder v2 tables.
    /// </summary>
    public class ItineraryBuilderDTO
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DurationDays { get; set; }
        public string? DifficultyLevel { get; set; }
        public string DefaultCurrency { get; set; } = "USD";
        public long? SeasonId { get; set; }
        public decimal? MarkupPercentage { get; set; }
        public int? NumPax { get; set; }
        public string Status { get; set; } = "draft";
        public bool IsActive { get; set; }
        public long CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ItineraryBuilderDayDTO
    {
        public long Id { get; set; }
        public long ItineraryId { get; set; }
        public int DayNumber { get; set; }
        public string? Title { get; set; }
        public string? Location { get; set; }
        public long? LocationId { get; set; }
        public long? AccommodationCategoryId { get; set; }
        public string? AccommodationCategoryName { get; set; }
        public string? Notes { get; set; }
    }

    public class ItineraryDayItemDTO
    {
        public long Id { get; set; }
        public long ItineraryDayId { get; set; }
        public string ItemType { get; set; } = string.Empty;
        public long? InventoryItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string? ItemDetails { get; set; }
        public int SortOrder { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string Currency { get; set; } = "USD";
        public string? Notes { get; set; }
        public int? PaxCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
