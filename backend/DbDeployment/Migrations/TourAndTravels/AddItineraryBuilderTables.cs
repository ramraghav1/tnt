using FluentMigrator;

namespace DbDeployment.Migrations.TourAndTravels
{
    /// <summary>
    /// Extend itinerary schema for the drag-and-drop Itinerary Builder v2.
    ///
    /// Changes:
    ///   itineraries      – add default_currency, season_id, markup_percentage, num_pax, status
    ///   itinerary_days   – add location_id FK
    ///   itinerary_day_items (NEW) – typed inventory items per day (hotel, transport, activity, meal, guide)
    /// </summary>
    [Migration(202605030001)]
    public class AddItineraryBuilderTables : Migration
    {
        public override void Up()
        {
            // ================================================================
            // 1. Extend itineraries table
            // ================================================================
            if (!Schema.Table("itineraries").Column("default_currency").Exists())
                Alter.Table("itineraries").AddColumn("default_currency").AsString(3).Nullable().WithDefaultValue("USD");
            if (!Schema.Table("itineraries").Column("season_id").Exists())
                Alter.Table("itineraries").AddColumn("season_id").AsInt64().Nullable();
            if (!Schema.Table("itineraries").Column("markup_percentage").Exists())
                Alter.Table("itineraries").AddColumn("markup_percentage").AsDecimal(5, 2).Nullable().WithDefaultValue(15.0m);
            if (!Schema.Table("itineraries").Column("num_pax").Exists())
                Alter.Table("itineraries").AddColumn("num_pax").AsInt32().Nullable().WithDefaultValue(2);
            if (!Schema.Table("itineraries").Column("status").Exists())
                Alter.Table("itineraries").AddColumn("status").AsString(20).Nullable().WithDefaultValue("draft");

            // ================================================================
            // 2. Extend itinerary_days table
            // ================================================================
            if (!Schema.Table("itinerary_days").Column("location_id").Exists())
                Alter.Table("itinerary_days").AddColumn("location_id").AsInt64().Nullable();
            if (!Schema.Table("itinerary_days").Column("notes").Exists())
                Alter.Table("itinerary_days").AddColumn("notes").AsString(2000).Nullable();

            // ================================================================
            // 3. Create itinerary_day_items table
            // ================================================================
            if (!Schema.Table("itinerary_day_items").Exists())
            {
                Create.Table("itinerary_day_items")
                    .WithColumn("id").AsInt64().PrimaryKey().Identity()
                    .WithColumn("itinerary_day_id").AsInt64().NotNullable()
                    .WithColumn("item_type").AsString(20).NotNullable()       // hotel, transport, activity, meal, guide
                    .WithColumn("inventory_item_id").AsInt64().Nullable()      // FK to inventory table by type
                    .WithColumn("item_name").AsString(255).NotNullable()
                    .WithColumn("item_details").AsString(500).Nullable()       // room type, vehicle model, etc.
                    .WithColumn("sort_order").AsInt32().NotNullable().WithDefaultValue(0)
                    .WithColumn("quantity").AsInt32().NotNullable().WithDefaultValue(1)
                    .WithColumn("unit_price").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                    .WithColumn("currency").AsString(3).NotNullable().WithDefaultValue("USD")
                    .WithColumn("notes").AsString(1000).Nullable()
                    .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);

                Create.Index("ix_day_items_day").OnTable("itinerary_day_items").OnColumn("itinerary_day_id");
                Create.Index("ix_day_items_type").OnTable("itinerary_day_items").OnColumn("item_type");

                // Foreign key to itinerary_days
                Create.ForeignKey("fk_day_items_day")
                    .FromTable("itinerary_day_items").ForeignColumn("itinerary_day_id")
                    .ToTable("itinerary_days").PrimaryColumn("id");
            }
        }

        public override void Down()
        {
            if (Schema.Table("itinerary_day_items").Exists())
                Delete.Table("itinerary_day_items");

            if (Schema.Table("itinerary_days").Column("notes").Exists())
                Delete.Column("notes").FromTable("itinerary_days");
            if (Schema.Table("itinerary_days").Column("location_id").Exists())
                Delete.Column("location_id").FromTable("itinerary_days");

            if (Schema.Table("itineraries").Column("status").Exists())
                Delete.Column("status").FromTable("itineraries");
            if (Schema.Table("itineraries").Column("num_pax").Exists())
                Delete.Column("num_pax").FromTable("itineraries");
            if (Schema.Table("itineraries").Column("markup_percentage").Exists())
                Delete.Column("markup_percentage").FromTable("itineraries");
            if (Schema.Table("itineraries").Column("season_id").Exists())
                Delete.Column("season_id").FromTable("itineraries");
            if (Schema.Table("itineraries").Column("default_currency").Exists())
                Delete.Column("default_currency").FromTable("itineraries");
        }
    }
}
