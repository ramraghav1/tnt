using FluentMigrator;

namespace DbDeployment.Migrations.TourAndTravels
{
    /// <summary>
    /// Adds pax_count to itinerary_day_items so hotel line items can persist how many
    /// pax the unit price covers (used by the Itinerary Builder to calculate rooms needed).
    /// Without this column, paxCount was silently dropped on save and reset to a default
    /// of 2 on reload, causing accommodation pricing to drift after a save/reload cycle.
    /// </summary>
    [Migration(202607190001)]
    public class AddPaxCountToItineraryDayItems : Migration
    {
        public override void Up()
        {
            if (!Schema.Table("itinerary_day_items").Column("pax_count").Exists())
                Alter.Table("itinerary_day_items").AddColumn("pax_count").AsInt32().Nullable().WithDefaultValue(2);
        }

        public override void Down()
        {
            if (Schema.Table("itinerary_day_items").Column("pax_count").Exists())
                Delete.Column("pax_count").FromTable("itinerary_day_items");
        }
    }
}
