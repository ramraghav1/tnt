using System;
using System.Collections.Generic;

namespace Domain.Models.TourAndTravels
{
    /// <summary>
    /// Domain models for the Itinerary Builder v2 (drag-and-drop builder).
    /// </summary>
    public static class ItineraryBuilder
    {
        // ================================================================
        // SAVE / UPDATE REQUEST
        // ================================================================
        public class SaveBuilderRequest
        {
            public string Title { get; set; } = string.Empty;
            public string? Description { get; set; }
            public int DurationDays { get; set; }
            public string DefaultCurrency { get; set; } = "USD";
            public long? SeasonId { get; set; }
            public decimal MarkupPercentage { get; set; } = 15.0m;
            public int NumPax { get; set; } = 2;
            public string Status { get; set; } = "draft"; // draft, published
            public string? DifficultyLevel { get; set; }
            public List<BuilderDayRequest> Days { get; set; } = new();
        }

        public class BuilderDayRequest
        {
            public int DayNumber { get; set; }
            public string? Title { get; set; }
            public string? Location { get; set; }
            public long? LocationId { get; set; }
            public long? AccommodationCategoryId { get; set; }
            public string? Notes { get; set; }
            public List<BuilderItemRequest> Items { get; set; } = new();
        }

        public class BuilderItemRequest
        {
            public string ItemType { get; set; } = string.Empty; // hotel, transport, activity, meal, guide
            public long? InventoryItemId { get; set; }
            public string ItemName { get; set; } = string.Empty;
            public string? ItemDetails { get; set; }
            public int SortOrder { get; set; }
            public int Quantity { get; set; } = 1;
            public decimal UnitPrice { get; set; }
            public string Currency { get; set; } = "USD";
            public string? Notes { get; set; }
            /// <summary>For hotel items: how many pax the unit price covers (used to calculate rooms needed).</summary>
            public int? PaxCount { get; set; }
        }

        // ================================================================
        // FULL RESPONSE (for loading into builder)
        // ================================================================
        public class BuilderResponse
        {
            public long Id { get; set; }
            public string Title { get; set; } = string.Empty;
            public string? Description { get; set; }
            public int DurationDays { get; set; }
            public string DefaultCurrency { get; set; } = "USD";
            public long? SeasonId { get; set; }
            public decimal MarkupPercentage { get; set; }
            public int NumPax { get; set; }
            public string Status { get; set; } = "draft";
            public string? DifficultyLevel { get; set; }
            public bool IsActive { get; set; }
            public DateTime CreatedAt { get; set; }
            public List<BuilderDayResponse> Days { get; set; } = new();
        }

        public class BuilderDayResponse
        {
            public long Id { get; set; }
            public int DayNumber { get; set; }
            public string? Title { get; set; }
            public string? Location { get; set; }
            public long? LocationId { get; set; }
            public long? AccommodationCategoryId { get; set; }
            public string? AccommodationCategoryName { get; set; }
            public string? Notes { get; set; }
            public List<BuilderItemResponse> Items { get; set; } = new();
        }

        public class BuilderItemResponse
        {
            public long Id { get; set; }
            public string ItemType { get; set; } = string.Empty;
            public long? InventoryItemId { get; set; }
            public string ItemName { get; set; } = string.Empty;
            public string? ItemDetails { get; set; }
            public int SortOrder { get; set; }
            public int Quantity { get; set; }
            public decimal UnitPrice { get; set; }
            public string Currency { get; set; } = "USD";
            public string? Notes { get; set; }
            /// <summary>For hotel items: how many pax the unit price covers (used to calculate rooms needed).</summary>
            public int? PaxCount { get; set; }
        }

        // ================================================================
        // LIST ITEM (for list view)
        // ================================================================
        public class BuilderListItem
        {
            public long Id { get; set; }
            public string Title { get; set; } = string.Empty;
            public int DurationDays { get; set; }
            public string Status { get; set; } = "draft";
            public string DefaultCurrency { get; set; } = "USD";
            public int NumPax { get; set; }
            public bool IsActive { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        // ================================================================
        // PRICING SUMMARY (computed server-side)
        // ================================================================
        public class PricingSummary
        {
            public decimal Accommodation { get; set; }
            public decimal Transport { get; set; }
            public decimal Activities { get; set; }
            public decimal Meals { get; set; }
            public decimal Guide { get; set; }
            public decimal Others { get; set; }
            public decimal Subtotal { get; set; }
            public decimal MarkupPercentage { get; set; }
            public decimal MarkupAmount { get; set; }
            public decimal TotalEstimatedPrice { get; set; }
            public decimal PricePerPerson { get; set; }
            public int NumPax { get; set; }
            public string? SeasonName { get; set; }
            public decimal SeasonMultiplier { get; set; } = 1.0m;
            public decimal LocationMultiplier { get; set; } = 1.0m;
            public decimal TotalMultiplier { get; set; } = 1.0m;
        }
    }
}
