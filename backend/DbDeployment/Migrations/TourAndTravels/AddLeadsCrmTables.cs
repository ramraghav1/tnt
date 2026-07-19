using FluentMigrator;

namespace DbDeployment.Migrations.TourAndTravels
{
    [Migration(202605010001)]
    public class AddLeadsCrmTables : Migration
    {
        public override void Up()
        {
            // ============================================================
            // 1. LEADS / INQUIRIES
            // ============================================================
            Create.Table("leads")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("tenant_id").AsInt64().NotNullable()
                .WithColumn("name").AsString(300).NotNullable()
                .WithColumn("email").AsString(300).Nullable()
                .WithColumn("phone").AsString(50).Nullable()
                .WithColumn("country").AsString(100).Nullable()
                .WithColumn("source").AsString(100).NotNullable().WithDefaultValue("Website")
                .WithColumn("status").AsString(50).NotNullable().WithDefaultValue("New")
                .WithColumn("priority").AsString(20).NotNullable().WithDefaultValue("Medium")
                .WithColumn("interested_in").AsString(500).Nullable()
                .WithColumn("travel_date_from").AsDate().Nullable()
                .WithColumn("travel_date_to").AsDate().Nullable()
                .WithColumn("pax").AsInt32().Nullable()
                .WithColumn("budget").AsDecimal(18, 2).Nullable()
                .WithColumn("currency").AsString(10).NotNullable().WithDefaultValue("USD")
                .WithColumn("assigned_to").AsString(200).Nullable()
                .WithColumn("notes").AsString(int.MaxValue).Nullable()
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn("updated_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn("converted_at").AsDateTime().Nullable()
                .WithColumn("proposal_id").AsInt64().Nullable();

            Create.Index("ix_leads_tenant").OnTable("leads").OnColumn("tenant_id").Ascending();
            Create.Index("ix_leads_status").OnTable("leads").OnColumn("status").Ascending();

            // ============================================================
            // 2. LEAD FOLLOW-UPS
            // ============================================================
            Create.Table("lead_follow_ups")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("lead_id").AsInt64().NotNullable()
                    .ForeignKey("fk_follow_ups_lead", "leads", "id").OnDelete(System.Data.Rule.Cascade)
                .WithColumn("type").AsString(50).NotNullable().WithDefaultValue("Note")
                .WithColumn("message").AsString(int.MaxValue).NotNullable()
                .WithColumn("next_follow_up_date").AsDateTime().Nullable()
                .WithColumn("created_by").AsString(200).Nullable()
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);

            Create.Index("ix_follow_ups_lead").OnTable("lead_follow_ups").OnColumn("lead_id").Ascending();

            // ============================================================
            // 3. QUOTATIONS
            // ============================================================
            Create.Table("quotations")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("tenant_id").AsInt64().NotNullable()
                .WithColumn("quotation_number").AsString(50).NotNullable()
                .WithColumn("lead_id").AsInt64().Nullable()
                    .ForeignKey("fk_quotations_lead", "leads", "id")
                .WithColumn("proposal_id").AsInt64().Nullable()
                    .ForeignKey("fk_quotations_proposal", "itinerary_proposals", "id")
                .WithColumn("client_name").AsString(300).NotNullable()
                .WithColumn("client_email").AsString(300).Nullable()
                .WithColumn("client_phone").AsString(50).Nullable()
                .WithColumn("travel_date_from").AsDate().Nullable()
                .WithColumn("travel_date_to").AsDate().Nullable()
                .WithColumn("pax").AsInt32().NotNullable().WithDefaultValue(1)
                .WithColumn("subtotal").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("discount_amount").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("tax_amount").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("total_amount").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("currency").AsString(10).NotNullable().WithDefaultValue("USD")
                .WithColumn("status").AsString(50).NotNullable().WithDefaultValue("Draft")
                .WithColumn("valid_until").AsDate().Nullable()
                .WithColumn("notes").AsString(int.MaxValue).Nullable()
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn("updated_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);

            Create.Index("ix_quotations_tenant").OnTable("quotations").OnColumn("tenant_id").Ascending();
            Create.Index("ix_quotations_lead").OnTable("quotations").OnColumn("lead_id").Ascending();

            // ============================================================
            // 4. QUOTATION LINE ITEMS
            // ============================================================
            Create.Table("quotation_line_items")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("quotation_id").AsInt64().NotNullable()
                    .ForeignKey("fk_quotation_items_quotation", "quotations", "id").OnDelete(System.Data.Rule.Cascade)
                .WithColumn("item_type").AsString(50).NotNullable().WithDefaultValue("Service")
                .WithColumn("description").AsString(500).NotNullable()
                .WithColumn("quantity").AsDecimal(10, 2).NotNullable().WithDefaultValue(1)
                .WithColumn("unit_price").AsDecimal(18, 2).NotNullable()
                .WithColumn("total_price").AsDecimal(18, 2).NotNullable()
                .WithColumn("sort_order").AsInt32().NotNullable().WithDefaultValue(0);

            Create.Index("ix_quotation_items_quotation").OnTable("quotation_line_items").OnColumn("quotation_id").Ascending();

            // ============================================================
            // 5. BOOKING AMENDMENTS
            // ============================================================
            Create.Table("booking_amendments")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("tenant_id").AsInt64().NotNullable()
                .WithColumn("booking_instance_id").AsInt64().NotNullable()
                    .ForeignKey("fk_amendments_booking", "itinerary_instances", "id")
                .WithColumn("amendment_type").AsString(50).NotNullable()
                .WithColumn("description").AsString(int.MaxValue).NotNullable()
                .WithColumn("old_value").AsString(int.MaxValue).Nullable()
                .WithColumn("new_value").AsString(int.MaxValue).Nullable()
                .WithColumn("status").AsString(50).NotNullable().WithDefaultValue("Pending")
                .WithColumn("requested_by").AsString(200).Nullable()
                .WithColumn("approved_by").AsString(200).Nullable()
                .WithColumn("fee_amount").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn("resolved_at").AsDateTime().Nullable();

            Create.Index("ix_amendments_booking").OnTable("booking_amendments").OnColumn("booking_instance_id").Ascending();

            // ============================================================
            // 6. SUPPLIER CONTRACTS
            // ============================================================
            Create.Table("supplier_contracts")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("tenant_id").AsInt64().NotNullable()
                .WithColumn("supplier_type").AsString(50).NotNullable()
                .WithColumn("supplier_id").AsInt64().NotNullable()
                .WithColumn("supplier_name").AsString(300).NotNullable()
                .WithColumn("contract_number").AsString(100).Nullable()
                .WithColumn("start_date").AsDate().NotNullable()
                .WithColumn("end_date").AsDate().NotNullable()
                .WithColumn("rate_type").AsString(50).NotNullable().WithDefaultValue("Fixed")
                .WithColumn("base_rate").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("currency").AsString(10).NotNullable().WithDefaultValue("NPR")
                .WithColumn("terms").AsString(int.MaxValue).Nullable()
                .WithColumn("status").AsString(50).NotNullable().WithDefaultValue("Active")
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);

            Create.Index("ix_contracts_tenant").OnTable("supplier_contracts").OnColumn("tenant_id").Ascending();

            // ============================================================
            // 7. B2B AGENTS
            // ============================================================
            Create.Table("b2b_agents")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("tenant_id").AsInt64().NotNullable()
                .WithColumn("name").AsString(300).NotNullable()
                .WithColumn("contact_person").AsString(200).Nullable()
                .WithColumn("email").AsString(300).Nullable()
                .WithColumn("phone").AsString(50).Nullable()
                .WithColumn("country").AsString(100).Nullable()
                .WithColumn("region").AsString(100).Nullable()
                .WithColumn("commission_rate").AsDecimal(5, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("credit_limit").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("credit_balance").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("status").AsString(50).NotNullable().WithDefaultValue("Active")
                .WithColumn("notes").AsString(int.MaxValue).Nullable()
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);

            Create.Index("ix_b2b_agents_tenant").OnTable("b2b_agents").OnColumn("tenant_id").Ascending();

            // ============================================================
            // 8. B2B AGENT PRICING (agent-specific itinerary pricing)
            // ============================================================
            Create.Table("b2b_agent_pricing")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("agent_id").AsInt64().NotNullable()
                    .ForeignKey("fk_agent_pricing_agent", "b2b_agents", "id").OnDelete(System.Data.Rule.Cascade)
                .WithColumn("itinerary_id").AsInt64().NotNullable()
                .WithColumn("price_per_person").AsDecimal(18, 2).NotNullable()
                .WithColumn("currency").AsString(10).NotNullable().WithDefaultValue("USD")
                .WithColumn("valid_from").AsDate().Nullable()
                .WithColumn("valid_to").AsDate().Nullable();

            Create.Index("ix_agent_pricing_agent").OnTable("b2b_agent_pricing").OnColumn("agent_id").Ascending();

            // ============================================================
            // 9. B2B AGENT LEDGER
            // ============================================================
            Create.Table("b2b_agent_ledger")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("agent_id").AsInt64().NotNullable()
                    .ForeignKey("fk_agent_ledger_agent", "b2b_agents", "id").OnDelete(System.Data.Rule.Cascade)
                .WithColumn("transaction_type").AsString(50).NotNullable()
                .WithColumn("amount").AsDecimal(18, 2).NotNullable()
                .WithColumn("reference").AsString(200).Nullable()
                .WithColumn("description").AsString(500).Nullable()
                .WithColumn("balance_after").AsDecimal(18, 2).NotNullable()
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);

            Create.Index("ix_agent_ledger_agent").OnTable("b2b_agent_ledger").OnColumn("agent_id").Ascending();

            // ============================================================
            // 10. SUPPLIER PAYMENTS
            // ============================================================
            Create.Table("supplier_payments")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("tenant_id").AsInt64().NotNullable()
                .WithColumn("supplier_type").AsString(50).NotNullable()
                .WithColumn("supplier_id").AsInt64().NotNullable()
                .WithColumn("supplier_name").AsString(300).NotNullable()
                .WithColumn("booking_instance_id").AsInt64().Nullable()
                .WithColumn("amount").AsDecimal(18, 2).NotNullable()
                .WithColumn("currency").AsString(10).NotNullable().WithDefaultValue("NPR")
                .WithColumn("payment_method").AsString(50).Nullable()
                .WithColumn("payment_date").AsDate().NotNullable()
                .WithColumn("reference").AsString(200).Nullable()
                .WithColumn("status").AsString(50).NotNullable().WithDefaultValue("Pending")
                .WithColumn("notes").AsString(int.MaxValue).Nullable()
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);

            Create.Index("ix_supplier_payments_tenant").OnTable("supplier_payments").OnColumn("tenant_id").Ascending();

            // ============================================================
            // 11. SERVICE VOUCHERS
            // ============================================================
            Create.Table("service_vouchers")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("tenant_id").AsInt64().NotNullable()
                .WithColumn("voucher_number").AsString(50).NotNullable()
                .WithColumn("booking_instance_id").AsInt64().Nullable()
                    .ForeignKey("fk_vouchers_booking", "itinerary_instances", "id")
                .WithColumn("voucher_type").AsString(50).NotNullable()
                .WithColumn("supplier_type").AsString(50).Nullable()
                .WithColumn("supplier_id").AsInt64().Nullable()
                .WithColumn("supplier_name").AsString(300).Nullable()
                .WithColumn("service_date").AsDate().Nullable()
                .WithColumn("details").AsString(int.MaxValue).Nullable()
                .WithColumn("status").AsString(50).NotNullable().WithDefaultValue("Draft")
                .WithColumn("created_at").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);

            Create.Index("ix_vouchers_tenant").OnTable("service_vouchers").OnColumn("tenant_id").Ascending();
            Create.Index("ix_vouchers_booking").OnTable("service_vouchers").OnColumn("booking_instance_id").Ascending();

            // ============================================================
            // 12. ROOMING ASSIGNMENTS
            // ============================================================
            Create.Table("rooming_assignments")
                .WithColumn("id").AsInt64().PrimaryKey().Identity()
                .WithColumn("departure_id").AsInt64().NotNullable()
                .WithColumn("booking_instance_id").AsInt64().NotNullable()
                    .ForeignKey("fk_rooming_booking", "itinerary_instances", "id")
                .WithColumn("traveler_id").AsInt64().NotNullable()
                    .ForeignKey("fk_rooming_traveler", "travelers", "id")
                .WithColumn("hotel_id").AsInt64().Nullable()
                .WithColumn("room_type").AsString(100).Nullable()
                .WithColumn("room_number").AsString(50).Nullable()
                .WithColumn("check_in_date").AsDate().Nullable()
                .WithColumn("check_out_date").AsDate().Nullable()
                .WithColumn("notes").AsString(500).Nullable();

            Create.Index("ix_rooming_departure").OnTable("rooming_assignments").OnColumn("departure_id").Ascending();
        }

        public override void Down()
        {
            Delete.Table("rooming_assignments");
            Delete.Table("service_vouchers");
            Delete.Table("supplier_payments");
            Delete.Table("b2b_agent_ledger");
            Delete.Table("b2b_agent_pricing");
            Delete.Table("b2b_agents");
            Delete.Table("supplier_contracts");
            Delete.Table("booking_amendments");
            Delete.Table("quotation_line_items");
            Delete.Table("quotations");
            Delete.Table("lead_follow_ups");
            Delete.Table("leads");
        }
    }
}
