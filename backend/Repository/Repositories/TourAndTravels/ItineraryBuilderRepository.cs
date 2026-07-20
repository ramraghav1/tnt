using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Dapper;
using Repository.DataModels.TourAndTravels;
using Repository.Interfaces.TourAndTravels;
using static Domain.Models.TourAndTravels.ItineraryBuilder;

namespace Repository.Repositories.TourAndTravels
{
    public class ItineraryBuilderRepository : IItineraryBuilderRepository
    {
        private readonly IDbConnection _db;
        public ItineraryBuilderRepository(IDbConnection db) => _db = db;

        public BuilderResponse Save(SaveBuilderRequest req, long tenantId, long userId)
        {
            if (_db.State != ConnectionState.Open) _db.Open();

            using var tx = _db.BeginTransaction();
            try
            {
                // Insert itinerary
                const string insertItinerary = @"
                    INSERT INTO itineraries
                        (title, description, duration_days, difficulty_level, pricing_mode,
                         default_currency, season_id, markup_percentage, num_pax, status,
                         is_active, created_by, tenant_id)
                    VALUES
                        (@Title, @Description, @DurationDays, @DifficultyLevel, 'BUILDER',
                         @DefaultCurrency, @SeasonId, @MarkupPercentage, @NumPax, @Status,
                         true, @UserId, @TenantId)
                    RETURNING id;";

                long itineraryId = _db.QuerySingle<long>(insertItinerary, new
                {
                    req.Title, req.Description, req.DurationDays, req.DifficultyLevel,
                    req.DefaultCurrency, req.SeasonId, req.MarkupPercentage, req.NumPax, req.Status,
                    UserId = userId,
                    TenantId = tenantId
                }, tx);

                // Insert days + items
                InsertDays(itineraryId, req.Days, tx);

                tx.Commit();
                return GetById(itineraryId)!;
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public BuilderResponse? Update(long id, SaveBuilderRequest req, long userId)
        {
            if (_db.State != ConnectionState.Open) _db.Open();

            using var tx = _db.BeginTransaction();
            try
            {
                // Update itinerary header
                const string updateItinerary = @"
                    UPDATE itineraries SET
                        title = @Title, description = @Description, duration_days = @DurationDays,
                        difficulty_level = @DifficultyLevel, default_currency = @DefaultCurrency,
                        season_id = @SeasonId, markup_percentage = @MarkupPercentage,
                        num_pax = @NumPax, status = @Status
                    WHERE id = @Id;";

                _db.Execute(updateItinerary, new
                {
                    Id = id, req.Title, req.Description, req.DurationDays, req.DifficultyLevel,
                    req.DefaultCurrency, req.SeasonId, req.MarkupPercentage, req.NumPax, req.Status
                }, tx);

                // Delete existing day items first, then days
                _db.Execute(@"
                    DELETE FROM itinerary_day_items
                    WHERE itinerary_day_id IN (SELECT id FROM itinerary_days WHERE itinerary_id = @Id);",
                    new { Id = id }, tx);

                _db.Execute(@"
                    DELETE FROM itinerary_day_activities
                    WHERE itinerary_day_id IN (SELECT id FROM itinerary_days WHERE itinerary_id = @Id);",
                    new { Id = id }, tx);

                _db.Execute("DELETE FROM itinerary_days WHERE itinerary_id = @Id;", new { Id = id }, tx);

                // Re-insert days + items
                InsertDays(id, req.Days, tx);

                tx.Commit();
                return GetById(id);
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public BuilderResponse? GetById(long id)
        {
            // Load itinerary header
            var itinerary = _db.QuerySingleOrDefault<ItineraryBuilderDTO>(@"
                SELECT id, title, description, duration_days, difficulty_level,
                       COALESCE(default_currency, 'USD') as default_currency,
                       season_id, COALESCE(markup_percentage, 15) as markup_percentage,
                       COALESCE(num_pax, 2) as num_pax, COALESCE(status, 'draft') as status,
                       is_active, created_at
                FROM itineraries WHERE id = @Id;", new { Id = id });

            if (itinerary == null) return null;

            // Load days
            var days = _db.Query<ItineraryBuilderDayDTO>(@"
                SELECT d.id, d.itinerary_id, d.day_number, d.title, d.location, d.location_id,
                       d.accommodation_category_id, ac.name AS accommodation_category_name, d.notes
                FROM itinerary_days d
                LEFT JOIN accommodation_categories ac ON ac.id = d.accommodation_category_id
                WHERE d.itinerary_id = @Id ORDER BY d.day_number;",
                new { Id = id }).ToList();

            // Load items for all days
            var dayIds = days.Select(d => d.Id).ToArray();
            var items = dayIds.Length > 0
                ? _db.Query<ItineraryDayItemDTO>(@"
                    SELECT id, itinerary_day_id, item_type, inventory_item_id,
                           item_name, item_details, sort_order, quantity, unit_price, currency, notes, pax_count
                    FROM itinerary_day_items
                    WHERE itinerary_day_id = ANY(@DayIds)
                    ORDER BY sort_order;",
                    new { DayIds = dayIds }).ToList()
                : new List<ItineraryDayItemDTO>();

            return new BuilderResponse
            {
                Id = itinerary.Id,
                Title = itinerary.Title,
                Description = itinerary.Description,
                DurationDays = itinerary.DurationDays,
                DefaultCurrency = itinerary.DefaultCurrency,
                SeasonId = itinerary.SeasonId,
                MarkupPercentage = itinerary.MarkupPercentage ?? 15,
                NumPax = itinerary.NumPax ?? 2,
                Status = itinerary.Status,
                DifficultyLevel = itinerary.DifficultyLevel,
                IsActive = itinerary.IsActive,
                CreatedAt = itinerary.CreatedAt,
                Days = days.Select(d => new BuilderDayResponse
                {
                    Id = d.Id,
                    DayNumber = d.DayNumber,
                    Title = d.Title,
                    Location = d.Location,
                    LocationId = d.LocationId,
                    AccommodationCategoryId = d.AccommodationCategoryId,
                    AccommodationCategoryName = d.AccommodationCategoryName,
                    Notes = d.Notes,
                    Items = items.Where(i => i.ItineraryDayId == d.Id).Select(i => new BuilderItemResponse
                    {
                        Id = i.Id,
                        ItemType = i.ItemType,
                        InventoryItemId = i.InventoryItemId,
                        ItemName = i.ItemName,
                        ItemDetails = i.ItemDetails,
                        SortOrder = i.SortOrder,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        Currency = i.Currency,
                        Notes = i.Notes,
                        PaxCount = i.PaxCount
                    }).ToList()
                }).ToList()
            };
        }

        public List<BuilderListItem> GetAll(long tenantId)
        {
            return _db.Query<BuilderListItem>(@"
                SELECT id, title, duration_days,
                       COALESCE(status, 'draft') as status,
                       COALESCE(default_currency, 'USD') as default_currency,
                       COALESCE(num_pax, 2) as num_pax,
                       is_active, created_at
                FROM itineraries
                WHERE tenant_id = @TenantId
                ORDER BY created_at DESC;",
                new { TenantId = tenantId }).ToList();
        }

        public bool Delete(long id) =>
            _db.Execute("UPDATE itineraries SET is_active = false WHERE id = @Id;", new { Id = id }) > 0;

        public bool UpdateStatus(long id, string status) =>
            _db.Execute("UPDATE itineraries SET status = @Status WHERE id = @Id;",
                new { Id = id, Status = status }) > 0;

        // ────────────────────────────────────────────
        // Private helpers
        // ────────────────────────────────────────────
        private void InsertDays(long itineraryId, List<BuilderDayRequest> days, IDbTransaction tx)
        {
            foreach (var day in days)
            {
                long dayId = _db.QuerySingle<long>(@"
                    INSERT INTO itinerary_days
                        (itinerary_id, day_number, title, location, location_id, accommodation_category_id, notes)
                    VALUES
                        (@ItineraryId, @DayNumber, @Title, @Location, @LocationId, @AccommodationCategoryId, @Notes)
                    RETURNING id;",
                    new
                    {
                        ItineraryId = itineraryId,
                        day.DayNumber,
                        day.Title,
                        day.Location,
                        day.LocationId,
                        day.AccommodationCategoryId,
                        day.Notes
                    }, tx);

                // Insert items for this day
                foreach (var item in day.Items)
                {
                    _db.Execute(@"
                        INSERT INTO itinerary_day_items
                            (itinerary_day_id, item_type, inventory_item_id, item_name,
                             item_details, sort_order, quantity, unit_price, currency, notes, pax_count)
                        VALUES
                            (@DayId, @ItemType, @InventoryItemId, @ItemName,
                             @ItemDetails, @SortOrder, @Quantity, @UnitPrice, @Currency, @Notes, @PaxCount);",
                        new
                        {
                            DayId = dayId,
                            item.ItemType,
                            item.InventoryItemId,
                            item.ItemName,
                            item.ItemDetails,
                            item.SortOrder,
                            item.Quantity,
                            item.UnitPrice,
                            item.Currency,
                            item.Notes,
                            item.PaxCount
                        }, tx);
                }
            }
        }
    }
}
