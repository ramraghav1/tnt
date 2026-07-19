using FluentMigrator;

namespace DbDeployment.Migrations.TourAndTravels
{
    /// <summary>
    /// Creates the accommodation_categories lookup table, seeds 10 categories,
    /// adds accommodation_category_id FK to hotels and itinerary_days,
    /// and back-fills existing hotels with the appropriate category.
    /// </summary>
    [Migration(202605030004)]
    public class AddAccommodationCategories : Migration
    {
        public override void Up()
        {
            // ── 1. Create accommodation_categories table ──
            Create.Table("accommodation_categories")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("name").AsString(100).NotNullable()
                .WithColumn("code").AsString(50).NotNullable().Unique()
                .WithColumn("icon").AsString(50).Nullable()
                .WithColumn("star_rating").AsInt32().Nullable()
                .WithColumn("sort_order").AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn("description").AsString(500).Nullable()
                .WithColumn("is_active").AsBoolean().NotNullable().WithDefaultValue(true)
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);

            // ── 2. Seed the 10 accommodation categories ──
            Insert.IntoTable("accommodation_categories").Row(new { name = "5★ Luxury Hotel",  code = "5_star_luxury",  icon = "pi pi-star-fill",  star_rating = 5, sort_order = 1,  description = "Premium 5-star luxury hotels and international chains" });
            Insert.IntoTable("accommodation_categories").Row(new { name = "4★ Deluxe Hotel",  code = "4_star_deluxe",  icon = "pi pi-star-fill",  star_rating = 4, sort_order = 2,  description = "High-quality 4-star deluxe hotels with premium amenities" });
            Insert.IntoTable("accommodation_categories").Row(new { name = "3★ Standard Hotel", code = "3_star_standard", icon = "pi pi-star-fill", star_rating = 3, sort_order = 3,  description = "Comfortable 3-star standard hotels with good facilities" });
            Insert.IntoTable("accommodation_categories").Row(new { name = "2★ Budget Hotel",  code = "2_star_budget",  icon = "pi pi-star",       star_rating = 2, sort_order = 4,  description = "Affordable 2-star budget-friendly hotels" });
            Insert.IntoTable("accommodation_categories").Row(new { name = "1★ Basic Hotel",   code = "1_star_basic",   icon = "pi pi-star",       star_rating = 1, sort_order = 5,  description = "Basic 1-star economy hotels" });
            Insert.IntoTable("accommodation_categories").Row(new { name = "Tea House",        code = "tea_house",      icon = "pi pi-home",       star_rating = (int?)null, sort_order = 6,  description = "Mountain tea house lodges along trekking routes" });
            Insert.IntoTable("accommodation_categories").Row(new { name = "Tent / Camping",   code = "tent_camping",   icon = "pi pi-sun",        star_rating = (int?)null, sort_order = 7,  description = "Camping and tent accommodation for trekking and adventure trips" });
            Insert.IntoTable("accommodation_categories").Row(new { name = "Resort",           code = "resort",         icon = "pi pi-image",      star_rating = (int?)null, sort_order = 8,  description = "Full-service resorts with recreational facilities" });
            Insert.IntoTable("accommodation_categories").Row(new { name = "Boutique Hotel",   code = "boutique",       icon = "pi pi-sparkles",   star_rating = (int?)null, sort_order = 9,  description = "Unique boutique hotels with distinctive character and style" });
            Insert.IntoTable("accommodation_categories").Row(new { name = "Homestay",         code = "homestay",       icon = "pi pi-users",      star_rating = (int?)null, sort_order = 10, description = "Stay with local families for authentic cultural experience" });

            // ── 3. Add accommodation_category_id FK to hotels ──
            Alter.Table("hotels")
                .AddColumn("accommodation_category_id").AsInt64().Nullable();

            Create.Index("ix_hotels_accommodation_category")
                .OnTable("hotels")
                .OnColumn("accommodation_category_id");

            // ── 4. Add accommodation_category_id FK to itinerary_days ──
            Alter.Table("itinerary_days")
                .AddColumn("accommodation_category_id").AsInt64().Nullable();

            Create.Index("ix_itinerary_days_accommodation_category")
                .OnTable("itinerary_days")
                .OnColumn("accommodation_category_id");

            // ── 5. Back-fill hotels with matching category by star_rating ──
            Execute.Sql(@"
                UPDATE hotels h SET accommodation_category_id = ac.id
                FROM accommodation_categories ac
                WHERE h.star_rating = ac.star_rating
                  AND h.accommodation_category_id IS NULL;

                -- Map Resort-category hotels
                UPDATE hotels SET accommodation_category_id = (
                    SELECT id FROM accommodation_categories WHERE code = 'resort'
                )
                WHERE LOWER(category) = 'resort' AND accommodation_category_id IS NULL;

                -- Map Heritage/Lodge as Boutique
                UPDATE hotels SET accommodation_category_id = (
                    SELECT id FROM accommodation_categories WHERE code = 'boutique'
                )
                WHERE LOWER(category) IN ('heritage', 'lodge') AND accommodation_category_id IS NULL;

                -- Map Budget
                UPDATE hotels SET accommodation_category_id = (
                    SELECT id FROM accommodation_categories WHERE code = '2_star_budget'
                )
                WHERE LOWER(category) = 'budget' AND accommodation_category_id IS NULL;
            ");
        }

        public override void Down()
        {
            Delete.Index("ix_itinerary_days_accommodation_category").OnTable("itinerary_days");
            Delete.Column("accommodation_category_id").FromTable("itinerary_days");

            Delete.Index("ix_hotels_accommodation_category").OnTable("hotels");
            Delete.Column("accommodation_category_id").FromTable("hotels");

            Delete.Table("accommodation_categories");
        }
    }
}
