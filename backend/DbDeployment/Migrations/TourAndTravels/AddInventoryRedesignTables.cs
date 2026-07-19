using FluentMigrator;

namespace DbDeployment.Migrations.TourAndTravels
{
    /// <summary>
    /// Redesign inventory schema for scalable multi-currency, seasonal pricing,
    /// location-based routing, and future pricing engine integration.
    ///
    /// New tables:
    ///   locations             – master location registry with cost multiplier
    ///   currencies            – supported currency master
    ///   exchange_rates_v2     – daily exchange rates (base USD)
    ///   seasons               – peak/off/normal season definitions
    ///   hotel_season_pricing  – seasonal per-room pricing overrides
    ///   vehicle_routes        – route-based vehicle pricing (from → to)
    ///   guide_locations       – guide location availability mapping
    ///   activity_locations    – activity → location mapping
    ///
    /// Schema changes to existing tables:
    ///   hotels      – add location_id FK, remove free-text "location"
    ///   hotel_rooms – add base_currency col, drop multi-currency cols
    ///   vehicles    – add capacity_type, base_currency, drop multi-currency cols
    ///   guides      – add base_currency, drop multi-currency cols
    ///   activities  – add is_mandatory, location_id FK, base_currency, drop multi-currency cols
    /// </summary>
    [Migration(202605020001)]
    public class AddInventoryRedesignTables : Migration
    {
        public override void Up()
        {
            // ================================================================
            // 1. LOCATIONS
            // ================================================================
            Create.Table("locations")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("tenant_id").AsInt64().NotNullable()
                .WithColumn("name").AsString(200).NotNullable()
                .WithColumn("code").AsString(20).Nullable()
                .WithColumn("country").AsString(100).NotNullable()
                .WithColumn("region").AsString(100).Nullable()
                .WithColumn("latitude").AsDecimal(10, 7).Nullable()
                .WithColumn("longitude").AsDecimal(10, 7).Nullable()
                .WithColumn("cost_multiplier").AsDecimal(5, 2).NotNullable().WithDefaultValue(1.00m)
                .WithColumn("timezone").AsString(50).Nullable()
                .WithColumn("description").AsString(500).Nullable()
                .WithColumn("is_active").AsBoolean().NotNullable().WithDefaultValue(true)
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn("updated_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn("created_by").AsInt64().Nullable();

            Create.Index("ix_locations_tenant").OnTable("locations").OnColumn("tenant_id").Ascending();
            Create.Index("ix_locations_country").OnTable("locations").OnColumn("country").Ascending();
            Create.Index("ix_locations_active").OnTable("locations").OnColumn("is_active").Ascending();

            // ================================================================
            // 2. CURRENCIES
            // ================================================================
            Create.Table("currencies")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("code").AsString(3).NotNullable().Unique()
                .WithColumn("name").AsString(100).NotNullable()
                .WithColumn("symbol").AsString(10).NotNullable()
                .WithColumn("decimal_places").AsInt32().NotNullable().WithDefaultValue(2)
                .WithColumn("is_base").AsBoolean().NotNullable().WithDefaultValue(false)
                .WithColumn("is_active").AsBoolean().NotNullable().WithDefaultValue(true)
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);

            // Seed default currencies
            Insert.IntoTable("currencies").Row(new { code = "USD", name = "US Dollar", symbol = "$", decimal_places = 2, is_base = true, is_active = true });
            Insert.IntoTable("currencies").Row(new { code = "NPR", name = "Nepalese Rupee", symbol = "Rs", decimal_places = 0, is_base = false, is_active = true });
            Insert.IntoTable("currencies").Row(new { code = "INR", name = "Indian Rupee", symbol = "₹", decimal_places = 0, is_base = false, is_active = true });
            Insert.IntoTable("currencies").Row(new { code = "EUR", name = "Euro", symbol = "€", decimal_places = 2, is_base = false, is_active = true });
            Insert.IntoTable("currencies").Row(new { code = "GBP", name = "British Pound", symbol = "£", decimal_places = 2, is_base = false, is_active = true });
            Insert.IntoTable("currencies").Row(new { code = "AUD", name = "Australian Dollar", symbol = "A$", decimal_places = 2, is_base = false, is_active = true });

            // ================================================================
            // 3. EXCHANGE RATES V2 (base = USD)
            // ================================================================
            Create.Table("exchange_rates_v2")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("currency_code").AsString(3).NotNullable()
                .WithColumn("rate_to_usd").AsDecimal(18, 8).NotNullable()
                .WithColumn("rate_from_usd").AsDecimal(18, 8).NotNullable()
                .WithColumn("effective_date").AsDate().NotNullable()
                .WithColumn("source").AsString(50).Nullable()
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn("created_by").AsInt64().Nullable();

            Create.Index("ix_exchange_rates_v2_currency_date")
                .OnTable("exchange_rates_v2")
                .OnColumn("currency_code").Ascending()
                .OnColumn("effective_date").Descending()
                .WithOptions().Unique();

            // Seed initial rates (approximate)
            Insert.IntoTable("exchange_rates_v2").Row(new { currency_code = "USD", rate_to_usd = 1.0m, rate_from_usd = 1.0m, effective_date = "2026-05-02", source = "seed" });
            Insert.IntoTable("exchange_rates_v2").Row(new { currency_code = "NPR", rate_to_usd = 0.0075m, rate_from_usd = 133.33m, effective_date = "2026-05-02", source = "seed" });
            Insert.IntoTable("exchange_rates_v2").Row(new { currency_code = "INR", rate_to_usd = 0.012m, rate_from_usd = 83.33m, effective_date = "2026-05-02", source = "seed" });
            Insert.IntoTable("exchange_rates_v2").Row(new { currency_code = "EUR", rate_to_usd = 1.08m, rate_from_usd = 0.926m, effective_date = "2026-05-02", source = "seed" });
            Insert.IntoTable("exchange_rates_v2").Row(new { currency_code = "GBP", rate_to_usd = 1.25m, rate_from_usd = 0.80m, effective_date = "2026-05-02", source = "seed" });
            Insert.IntoTable("exchange_rates_v2").Row(new { currency_code = "AUD", rate_to_usd = 0.66m, rate_from_usd = 1.515m, effective_date = "2026-05-02", source = "seed" });

            // ================================================================
            // 4. SEASONS
            // ================================================================
            Create.Table("seasons")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("tenant_id").AsInt64().NotNullable()
                .WithColumn("name").AsString(100).NotNullable()
                .WithColumn("season_type").AsString(20).NotNullable()   // Peak, Normal, Off, Monsoon, Festival
                .WithColumn("start_date").AsDate().NotNullable()
                .WithColumn("end_date").AsDate().NotNullable()
                .WithColumn("price_multiplier").AsDecimal(5, 2).NotNullable().WithDefaultValue(1.00m)
                .WithColumn("description").AsString(500).Nullable()
                .WithColumn("year").AsInt32().NotNullable()
                .WithColumn("is_active").AsBoolean().NotNullable().WithDefaultValue(true)
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn("updated_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn("created_by").AsInt64().Nullable();

            Create.Index("ix_seasons_tenant").OnTable("seasons").OnColumn("tenant_id").Ascending();
            Create.Index("ix_seasons_type").OnTable("seasons").OnColumn("season_type").Ascending();
            Create.Index("ix_seasons_dates").OnTable("seasons")
                .OnColumn("start_date").Ascending()
                .OnColumn("end_date").Ascending();

            // ================================================================
            // 5. MODIFY EXISTING TABLES – Add location_id, base_currency
            // ================================================================

            // Hotels: add location_id
            Alter.Table("hotels").AddColumn("location_id").AsInt64().Nullable();
            Create.Index("ix_hotels_location").OnTable("hotels").OnColumn("location_id").Ascending();

            // Hotel Rooms: add base_currency, drop multi-currency cols
            Alter.Table("hotel_rooms").AddColumn("base_currency").AsString(3).NotNullable().WithDefaultValue("USD");
            if (Schema.Table("hotel_rooms").Column("price_per_night_usd").Exists())
                Delete.Column("price_per_night_usd").FromTable("hotel_rooms");
            if (Schema.Table("hotel_rooms").Column("price_per_night_inr").Exists())
                Delete.Column("price_per_night_inr").FromTable("hotel_rooms");

            // Vehicles: add base_currency, drop multi-currency cols
            Alter.Table("vehicles").AddColumn("base_currency").AsString(3).NotNullable().WithDefaultValue("USD");
            Alter.Table("vehicles").AddColumn("location_from_id").AsInt64().Nullable();
            Alter.Table("vehicles").AddColumn("location_to_id").AsInt64().Nullable();
            if (Schema.Table("vehicles").Column("price_per_day_usd").Exists())
                Delete.Column("price_per_day_usd").FromTable("vehicles");
            if (Schema.Table("vehicles").Column("price_per_day_inr").Exists())
                Delete.Column("price_per_day_inr").FromTable("vehicles");
            if (Schema.Table("vehicles").Column("price_per_km_usd").Exists())
                Delete.Column("price_per_km_usd").FromTable("vehicles");
            if (Schema.Table("vehicles").Column("price_per_km_inr").Exists())
                Delete.Column("price_per_km_inr").FromTable("vehicles");

            // Guides: add base_currency, drop multi-currency cols
            Alter.Table("guides").AddColumn("base_currency").AsString(3).NotNullable().WithDefaultValue("USD");
            if (Schema.Table("guides").Column("price_per_day_usd").Exists())
                Delete.Column("price_per_day_usd").FromTable("guides");
            if (Schema.Table("guides").Column("price_per_day_inr").Exists())
                Delete.Column("price_per_day_inr").FromTable("guides");

            // Activities: add is_mandatory, location_id, base_currency, drop multi-currency
            Alter.Table("activities").AddColumn("is_mandatory").AsBoolean().NotNullable().WithDefaultValue(false);
            Alter.Table("activities").AddColumn("location_id").AsInt64().Nullable();
            Alter.Table("activities").AddColumn("base_currency").AsString(3).NotNullable().WithDefaultValue("USD");
            if (Schema.Table("activities").Column("price_per_person_usd").Exists())
                Delete.Column("price_per_person_usd").FromTable("activities");
            if (Schema.Table("activities").Column("price_per_person_inr").Exists())
                Delete.Column("price_per_person_inr").FromTable("activities");

            // ================================================================
            // 6. HOTEL SEASON PRICING
            // ================================================================
            Create.Table("hotel_season_pricing")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("hotel_room_id").AsInt64().NotNullable()
                    .ForeignKey("fk_hsp_hotel_room", "hotel_rooms", "id").OnDelete(System.Data.Rule.Cascade)
                .WithColumn("season_id").AsInt64().NotNullable()
                    .ForeignKey("fk_hsp_season", "seasons", "id").OnDelete(System.Data.Rule.Cascade)
                .WithColumn("price_per_night").AsDecimal(10, 2).NotNullable()
                .WithColumn("currency").AsString(3).NotNullable().WithDefaultValue("USD")
                .WithColumn("notes").AsString(500).Nullable()
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);

            Create.Index("ix_hsp_room_season")
                .OnTable("hotel_season_pricing")
                .OnColumn("hotel_room_id").Ascending()
                .OnColumn("season_id").Ascending()
                .WithOptions().Unique();

            // ================================================================
            // 7. VEHICLE ROUTES
            // ================================================================
            Create.Table("vehicle_routes")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("tenant_id").AsInt64().NotNullable()
                .WithColumn("vehicle_type").AsString(50).NotNullable()
                .WithColumn("location_from_id").AsInt64().NotNullable()
                    .ForeignKey("fk_vr_loc_from", "locations", "id")
                .WithColumn("location_to_id").AsInt64().NotNullable()
                    .ForeignKey("fk_vr_loc_to", "locations", "id")
                .WithColumn("distance_km").AsDecimal(10, 2).Nullable()
                .WithColumn("duration_hours").AsDecimal(5, 2).Nullable()
                .WithColumn("base_price").AsDecimal(10, 2).NotNullable()
                .WithColumn("currency").AsString(3).NotNullable().WithDefaultValue("USD")
                .WithColumn("capacity").AsInt32().NotNullable().WithDefaultValue(4)
                .WithColumn("notes").AsString(500).Nullable()
                .WithColumn("is_active").AsBoolean().NotNullable().WithDefaultValue(true)
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn("updated_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);

            Create.Index("ix_vr_tenant").OnTable("vehicle_routes").OnColumn("tenant_id").Ascending();
            Create.Index("ix_vr_route").OnTable("vehicle_routes")
                .OnColumn("location_from_id").Ascending()
                .OnColumn("location_to_id").Ascending();

            // ================================================================
            // 8. GUIDE LOCATIONS
            // ================================================================
            Create.Table("guide_locations")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("guide_id").AsInt64().NotNullable()
                    .ForeignKey("fk_gl_guide", "guides", "id").OnDelete(System.Data.Rule.Cascade)
                .WithColumn("location_id").AsInt64().NotNullable()
                    .ForeignKey("fk_gl_location", "locations", "id")
                .WithColumn("is_primary").AsBoolean().NotNullable().WithDefaultValue(false)
                .WithColumn("notes").AsString(500).Nullable();

            Create.Index("ix_gl_guide_location")
                .OnTable("guide_locations")
                .OnColumn("guide_id").Ascending()
                .OnColumn("location_id").Ascending()
                .WithOptions().Unique();

            // ================================================================
            // 9. ACTIVITY LOCATIONS (many-to-many)
            // ================================================================
            Create.Table("activity_locations")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("activity_id").AsInt64().NotNullable()
                    .ForeignKey("fk_al_activity", "activities", "id").OnDelete(System.Data.Rule.Cascade)
                .WithColumn("location_id").AsInt64().NotNullable()
                    .ForeignKey("fk_al_location", "locations", "id")
                .WithColumn("is_primary").AsBoolean().NotNullable().WithDefaultValue(false);

            Create.Index("ix_al_activity_location")
                .OnTable("activity_locations")
                .OnColumn("activity_id").Ascending()
                .OnColumn("location_id").Ascending()
                .WithOptions().Unique();
        }

        public override void Down()
        {
            Delete.Table("activity_locations");
            Delete.Table("guide_locations");
            Delete.Table("vehicle_routes");
            Delete.Table("hotel_season_pricing");

            // Revert activity changes
            if (Schema.Table("activities").Column("base_currency").Exists())
                Delete.Column("base_currency").FromTable("activities");
            if (Schema.Table("activities").Column("location_id").Exists())
                Delete.Column("location_id").FromTable("activities");
            if (Schema.Table("activities").Column("is_mandatory").Exists())
                Delete.Column("is_mandatory").FromTable("activities");

            // Revert guide changes
            if (Schema.Table("guides").Column("base_currency").Exists())
                Delete.Column("base_currency").FromTable("guides");

            // Revert vehicle changes
            if (Schema.Table("vehicles").Column("location_to_id").Exists())
                Delete.Column("location_to_id").FromTable("vehicles");
            if (Schema.Table("vehicles").Column("location_from_id").Exists())
                Delete.Column("location_from_id").FromTable("vehicles");
            if (Schema.Table("vehicles").Column("base_currency").Exists())
                Delete.Column("base_currency").FromTable("vehicles");

            // Revert hotel_rooms changes
            if (Schema.Table("hotel_rooms").Column("base_currency").Exists())
                Delete.Column("base_currency").FromTable("hotel_rooms");

            // Revert hotel changes
            if (Schema.Table("hotels").Column("location_id").Exists())
                Delete.Column("location_id").FromTable("hotels");

            Delete.Table("seasons");
            Delete.Table("exchange_rates_v2");
            Delete.Table("currencies");
            Delete.Table("locations");
        }
    }
}
