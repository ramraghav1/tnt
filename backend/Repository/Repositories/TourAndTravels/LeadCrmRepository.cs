using System;
using System.Data;
using System.Linq;
using Dapper;
using System.Collections.Generic;
using static Repository.DataModels.TourAndTravels.LeadCrmDTO;
using Repository.Interfaces.TourAndTravels;

namespace Repository.Repositories.TourAndTravels
{
    public class LeadCrmRepository : ILeadCrmRepository
    {
        private readonly IDbConnection _dbConnection;

        public LeadCrmRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        // ============================================================
        // LEADS
        // ============================================================
        public LeadResponse CreateLead(CreateLeadRequest request)
        {
            string sql = @"
                INSERT INTO leads (tenant_id, name, email, phone, country, source, priority,
                    interested_in, travel_date_from, travel_date_to, pax, budget, currency, assigned_to, notes)
                VALUES (@TenantId, @Name, @Email, @Phone, @Country, @Source, @Priority,
                    @InterestedIn, @TravelDateFrom, @TravelDateTo, @Pax, @Budget, @Currency, @AssignedTo, @Notes)
                RETURNING *;";
            var row = _dbConnection.QuerySingle<dynamic>(sql, request);
            return MapLead(row);
        }

        public LeadResponse? UpdateLead(long id, UpdateLeadRequest request)
        {
            var parts = new List<string>();
            var parameters = new DynamicParameters();
            parameters.Add("Id", id);

            if (request.Name != null) { parts.Add("name = @Name"); parameters.Add("Name", request.Name); }
            if (request.Email != null) { parts.Add("email = @Email"); parameters.Add("Email", request.Email); }
            if (request.Phone != null) { parts.Add("phone = @Phone"); parameters.Add("Phone", request.Phone); }
            if (request.Country != null) { parts.Add("country = @Country"); parameters.Add("Country", request.Country); }
            if (request.Source != null) { parts.Add("source = @Source"); parameters.Add("Source", request.Source); }
            if (request.Status != null) { parts.Add("status = @Status"); parameters.Add("Status", request.Status); }
            if (request.Priority != null) { parts.Add("priority = @Priority"); parameters.Add("Priority", request.Priority); }
            if (request.InterestedIn != null) { parts.Add("interested_in = @InterestedIn"); parameters.Add("InterestedIn", request.InterestedIn); }
            if (request.TravelDateFrom != null) { parts.Add("travel_date_from = @TravelDateFrom"); parameters.Add("TravelDateFrom", request.TravelDateFrom); }
            if (request.TravelDateTo != null) { parts.Add("travel_date_to = @TravelDateTo"); parameters.Add("TravelDateTo", request.TravelDateTo); }
            if (request.Pax != null) { parts.Add("pax = @Pax"); parameters.Add("Pax", request.Pax); }
            if (request.Budget != null) { parts.Add("budget = @Budget"); parameters.Add("Budget", request.Budget); }
            if (request.Currency != null) { parts.Add("currency = @Currency"); parameters.Add("Currency", request.Currency); }
            if (request.AssignedTo != null) { parts.Add("assigned_to = @AssignedTo"); parameters.Add("AssignedTo", request.AssignedTo); }
            if (request.Notes != null) { parts.Add("notes = @Notes"); parameters.Add("Notes", request.Notes); }

            if (parts.Count == 0) return GetLeadById(id);

            parts.Add("updated_at = NOW()");
            string sql = $"UPDATE leads SET {string.Join(", ", parts)} WHERE id = @Id RETURNING *;";
            var row = _dbConnection.QuerySingleOrDefault<dynamic>(sql, parameters);
            return row != null ? MapLead(row) : null;
        }

        public List<LeadResponse> GetAllLeads(long tenantId)
        {
            string sql = @"
                SELECT l.*,
                    (SELECT COUNT(*) FROM lead_follow_ups WHERE lead_id = l.id) AS follow_up_count,
                    (SELECT MAX(created_at) FROM lead_follow_ups WHERE lead_id = l.id) AS last_follow_up_date
                FROM leads l
                WHERE l.tenant_id = @TenantId
                ORDER BY l.created_at DESC;";
            return _dbConnection.Query<dynamic>(sql, new { TenantId = tenantId })
                .Select(r => MapLead((object)r)).ToList();
        }

        public LeadResponse? GetLeadById(long id)
        {
            string sql = @"
                SELECT l.*,
                    (SELECT COUNT(*) FROM lead_follow_ups WHERE lead_id = l.id) AS follow_up_count,
                    (SELECT MAX(created_at) FROM lead_follow_ups WHERE lead_id = l.id) AS last_follow_up_date
                FROM leads l WHERE l.id = @Id;";
            var row = _dbConnection.QuerySingleOrDefault<dynamic>(sql, new { Id = id });
            return row != null ? MapLead(row) : null;
        }

        public bool DeleteLead(long id)
        {
            return _dbConnection.Execute("DELETE FROM leads WHERE id = @Id;", new { Id = id }) > 0;
        }

        public bool ConvertLeadToProposal(long leadId, long proposalId)
        {
            string sql = @"UPDATE leads SET status = 'Converted', proposal_id = @ProposalId, converted_at = NOW(), updated_at = NOW()
                           WHERE id = @LeadId;";
            return _dbConnection.Execute(sql, new { LeadId = leadId, ProposalId = proposalId }) > 0;
        }

        private LeadResponse MapLead(dynamic r)
        {
            return new LeadResponse
            {
                Id = (long)r.id,
                TenantId = (long)r.tenant_id,
                Name = (string)r.name,
                Email = r.email as string,
                Phone = r.phone as string,
                Country = r.country as string,
                Source = (string)r.source,
                Status = (string)r.status,
                Priority = (string)r.priority,
                InterestedIn = r.interested_in as string,
                TravelDateFrom = r.travel_date_from as DateTime?,
                TravelDateTo = r.travel_date_to as DateTime?,
                Pax = r.pax as int?,
                Budget = r.budget as decimal?,
                Currency = (string)r.currency,
                AssignedTo = r.assigned_to as string,
                Notes = r.notes as string,
                CreatedAt = (DateTime)r.created_at,
                UpdatedAt = (DateTime)r.updated_at,
                ConvertedAt = r.converted_at as DateTime?,
                ProposalId = r.proposal_id as long?,
                FollowUpCount = (r as IDictionary<string, object>).ContainsKey("follow_up_count") ? Convert.ToInt32(r.follow_up_count) : 0,
                LastFollowUpDate = (r as IDictionary<string, object>).ContainsKey("last_follow_up_date") ? r.last_follow_up_date as DateTime? : null,
            };
        }

        // ============================================================
        // FOLLOW-UPS
        // ============================================================
        public FollowUpResponse CreateFollowUp(CreateFollowUpRequest request)
        {
            // Update lead status to InProgress when first follow-up happens
            _dbConnection.Execute(@"UPDATE leads SET status = CASE WHEN status = 'New' THEN 'InProgress' ELSE status END, updated_at = NOW()
                                    WHERE id = @LeadId;", new { request.LeadId });

            string sql = @"
                INSERT INTO lead_follow_ups (lead_id, type, message, next_follow_up_date, created_by)
                VALUES (@LeadId, @Type, @Message, @NextFollowUpDate, @CreatedBy)
                RETURNING *;";
            var row = _dbConnection.QuerySingle<dynamic>(sql, request);
            return new FollowUpResponse
            {
                Id = (long)row.id,
                LeadId = (long)row.lead_id,
                Type = (string)row.type,
                Message = (string)row.message,
                NextFollowUpDate = row.next_follow_up_date as DateTime?,
                CreatedBy = row.created_by as string,
                CreatedAt = (DateTime)row.created_at,
            };
        }

        public List<FollowUpResponse> GetFollowUpsByLead(long leadId)
        {
            string sql = @"SELECT * FROM lead_follow_ups WHERE lead_id = @LeadId ORDER BY created_at DESC;";
            return _dbConnection.Query<dynamic>(sql, new { LeadId = leadId }).Select(r => new FollowUpResponse
            {
                Id = (long)r.id, LeadId = (long)r.lead_id, Type = (string)r.type,
                Message = (string)r.message, NextFollowUpDate = r.next_follow_up_date as DateTime?,
                CreatedBy = r.created_by as string, CreatedAt = (DateTime)r.created_at,
            }).ToList();
        }

        public List<FollowUpResponse> GetAllFollowUps(long tenantId)
        {
            string sql = @"
                SELECT f.* FROM lead_follow_ups f
                JOIN leads l ON l.id = f.lead_id
                WHERE l.tenant_id = @TenantId
                ORDER BY f.created_at DESC;";
            return _dbConnection.Query<dynamic>(sql, new { TenantId = tenantId }).Select(r => new FollowUpResponse
            {
                Id = (long)r.id, LeadId = (long)r.lead_id, Type = (string)r.type,
                Message = (string)r.message, NextFollowUpDate = r.next_follow_up_date as DateTime?,
                CreatedBy = r.created_by as string, CreatedAt = (DateTime)r.created_at,
            }).ToList();
        }

        // ============================================================
        // QUOTATIONS
        // ============================================================
        public QuotationResponse CreateQuotation(CreateQuotationRequest request)
        {
            if (_dbConnection.State != ConnectionState.Open) _dbConnection.Open();
            using var tx = _dbConnection.BeginTransaction();
            try
            {
                string qNum = $"QT-{DateTime.UtcNow:yyyyMMddHHmmss}-{new Random().Next(1000, 9999)}";
                decimal subtotal = request.LineItems.Sum(li => li.Quantity * li.UnitPrice);
                decimal total = subtotal - request.DiscountAmount + request.TaxAmount;

                string sql = @"
                    INSERT INTO quotations (tenant_id, quotation_number, lead_id, proposal_id, client_name, client_email,
                        client_phone, travel_date_from, travel_date_to, pax, subtotal, discount_amount, tax_amount,
                        total_amount, currency, valid_until, notes)
                    VALUES (@TenantId, @QNum, @LeadId, @ProposalId, @ClientName, @ClientEmail, @ClientPhone,
                        @TravelDateFrom, @TravelDateTo, @Pax, @Subtotal, @DiscountAmount, @TaxAmount,
                        @Total, @Currency, @ValidUntil, @Notes)
                    RETURNING id;";
                long qId = _dbConnection.QuerySingle<long>(sql, new
                {
                    request.TenantId, QNum = qNum, request.LeadId, request.ProposalId,
                    request.ClientName, request.ClientEmail, request.ClientPhone,
                    request.TravelDateFrom, request.TravelDateTo, request.Pax,
                    Subtotal = subtotal, request.DiscountAmount, request.TaxAmount,
                    Total = total, request.Currency, request.ValidUntil, request.Notes
                }, tx);

                foreach (var li in request.LineItems)
                {
                    _dbConnection.Execute(@"
                        INSERT INTO quotation_line_items (quotation_id, item_type, description, quantity, unit_price, total_price, sort_order)
                        VALUES (@QId, @ItemType, @Description, @Quantity, @UnitPrice, @TotalPrice, @SortOrder);",
                        new { QId = qId, li.ItemType, li.Description, li.Quantity, li.UnitPrice,
                            TotalPrice = li.Quantity * li.UnitPrice, li.SortOrder }, tx);
                }

                tx.Commit();
                return GetQuotationById(qId)!;
            }
            catch { tx.Rollback(); throw; }
        }

        public List<QuotationResponse> GetAllQuotations(long tenantId)
        {
            string sql = @"
                SELECT q.*, l.name AS lead_name
                FROM quotations q LEFT JOIN leads l ON l.id = q.lead_id
                WHERE q.tenant_id = @TenantId ORDER BY q.created_at DESC;";
            return _dbConnection.Query<dynamic>(sql, new { TenantId = tenantId }).Select(r => new QuotationResponse
            {
                Id = (long)r.id, TenantId = (long)r.tenant_id, QuotationNumber = (string)r.quotation_number,
                LeadId = r.lead_id as long?, LeadName = r.lead_name as string,
                ProposalId = r.proposal_id as long?,
                ClientName = (string)r.client_name, ClientEmail = r.client_email as string,
                ClientPhone = r.client_phone as string,
                TravelDateFrom = r.travel_date_from as DateTime?, TravelDateTo = r.travel_date_to as DateTime?,
                Pax = (int)r.pax, Subtotal = (decimal)r.subtotal, DiscountAmount = (decimal)r.discount_amount,
                TaxAmount = (decimal)r.tax_amount, TotalAmount = (decimal)r.total_amount,
                Currency = (string)r.currency, Status = (string)r.status,
                ValidUntil = r.valid_until as DateTime?, Notes = r.notes as string, CreatedAt = (DateTime)r.created_at,
            }).ToList();
        }

        public QuotationResponse? GetQuotationById(long id)
        {
            string sql = @"SELECT q.*, l.name AS lead_name FROM quotations q LEFT JOIN leads l ON l.id = q.lead_id WHERE q.id = @Id;";
            var row = _dbConnection.QuerySingleOrDefault<dynamic>(sql, new { Id = id });
            if (row == null) return null;
            var q = new QuotationResponse
            {
                Id = (long)row.id, TenantId = (long)row.tenant_id, QuotationNumber = (string)row.quotation_number,
                LeadId = row.lead_id as long?, LeadName = row.lead_name as string, ProposalId = row.proposal_id as long?,
                ClientName = (string)row.client_name, ClientEmail = row.client_email as string,
                ClientPhone = row.client_phone as string,
                TravelDateFrom = row.travel_date_from as DateTime?, TravelDateTo = row.travel_date_to as DateTime?,
                Pax = (int)row.pax, Subtotal = (decimal)row.subtotal, DiscountAmount = (decimal)row.discount_amount,
                TaxAmount = (decimal)row.tax_amount, TotalAmount = (decimal)row.total_amount,
                Currency = (string)row.currency, Status = (string)row.status,
                ValidUntil = row.valid_until as DateTime?, Notes = row.notes as string, CreatedAt = (DateTime)row.created_at,
            };
            q.LineItems = _dbConnection.Query<dynamic>("SELECT * FROM quotation_line_items WHERE quotation_id = @Id ORDER BY sort_order;", new { Id = id })
                .Select(li => new QuotationLineItemResponse
                {
                    Id = (long)li.id, ItemType = (string)li.item_type, Description = (string)li.description,
                    Quantity = (decimal)li.quantity, UnitPrice = (decimal)li.unit_price, TotalPrice = (decimal)li.total_price,
                    SortOrder = (int)li.sort_order,
                }).ToList();
            return q;
        }

        public bool UpdateQuotationStatus(long id, string status)
        {
            return _dbConnection.Execute("UPDATE quotations SET status = @Status, updated_at = NOW() WHERE id = @Id;",
                new { Id = id, Status = status }) > 0;
        }

        // ============================================================
        // AMENDMENTS
        // ============================================================
        public AmendmentResponse CreateAmendment(CreateAmendmentRequest request)
        {
            string sql = @"
                INSERT INTO booking_amendments (tenant_id, booking_instance_id, amendment_type, description, old_value, new_value, requested_by, fee_amount)
                VALUES (@TenantId, @BookingInstanceId, @AmendmentType, @Description, @OldValue, @NewValue, @RequestedBy, @FeeAmount)
                RETURNING *;";
            var r = _dbConnection.QuerySingle<dynamic>(sql, request);
            return MapAmendment(r);
        }

        public List<AmendmentResponse> GetAllAmendments(long tenantId)
        {
            string sql = @"
                SELECT ba.*, ii.booking_reference
                FROM booking_amendments ba
                LEFT JOIN itinerary_instances ii ON ii.id = ba.booking_instance_id
                WHERE ba.tenant_id = @TenantId ORDER BY ba.created_at DESC;";
            return _dbConnection.Query<dynamic>(sql, new { TenantId = tenantId }).Select(MapAmendment).ToList();
        }

        public bool UpdateAmendmentStatus(long id, string status, string? approvedBy)
        {
            string sql = @"UPDATE booking_amendments SET status = @Status, approved_by = @ApprovedBy,
                           resolved_at = CASE WHEN @Status IN ('Approved','Rejected') THEN NOW() ELSE resolved_at END
                           WHERE id = @Id;";
            return _dbConnection.Execute(sql, new { Id = id, Status = status, ApprovedBy = approvedBy }) > 0;
        }

        private AmendmentResponse MapAmendment(dynamic r)
        {
            return new AmendmentResponse
            {
                Id = (long)r.id, BookingInstanceId = (long)r.booking_instance_id,
                BookingReference = (r as IDictionary<string, object>).ContainsKey("booking_reference") ? r.booking_reference as string : null,
                AmendmentType = (string)r.amendment_type, Description = (string)r.description,
                OldValue = r.old_value as string, NewValue = r.new_value as string,
                Status = (string)r.status, RequestedBy = r.requested_by as string,
                ApprovedBy = r.approved_by as string, FeeAmount = (decimal)r.fee_amount,
                CreatedAt = (DateTime)r.created_at, ResolvedAt = r.resolved_at as DateTime?,
            };
        }

        // ============================================================
        // CONTRACTS
        // ============================================================
        public ContractResponse CreateContract(CreateContractRequest request)
        {
            string sql = @"
                INSERT INTO supplier_contracts (tenant_id, supplier_type, supplier_id, supplier_name, contract_number, start_date, end_date, rate_type, base_rate, currency, terms)
                VALUES (@TenantId, @SupplierType, @SupplierId, @SupplierName, @ContractNumber, @StartDate, @EndDate, @RateType, @BaseRate, @Currency, @Terms)
                RETURNING *;";
            var r = _dbConnection.QuerySingle<dynamic>(sql, request);
            return MapContract(r);
        }

        public List<ContractResponse> GetAllContracts(long tenantId)
        {
            return _dbConnection.Query<dynamic>("SELECT * FROM supplier_contracts WHERE tenant_id = @TenantId ORDER BY created_at DESC;",
                new { TenantId = tenantId }).Select(MapContract).ToList();
        }

        public bool UpdateContractStatus(long id, string status)
        {
            return _dbConnection.Execute("UPDATE supplier_contracts SET status = @Status WHERE id = @Id;", new { Id = id, Status = status }) > 0;
        }

        private ContractResponse MapContract(dynamic r)
        {
            return new ContractResponse
            {
                Id = (long)r.id, TenantId = (long)r.tenant_id, SupplierType = (string)r.supplier_type,
                SupplierId = (long)r.supplier_id, SupplierName = (string)r.supplier_name,
                ContractNumber = r.contract_number as string,
                StartDate = (DateTime)r.start_date, EndDate = (DateTime)r.end_date,
                RateType = (string)r.rate_type, BaseRate = (decimal)r.base_rate,
                Currency = (string)r.currency, Terms = r.terms as string,
                Status = (string)r.status, CreatedAt = (DateTime)r.created_at,
            };
        }

        // ============================================================
        // B2B AGENTS
        // ============================================================
        public B2BAgentResponse CreateAgent(CreateB2BAgentRequest request)
        {
            string sql = @"
                INSERT INTO b2b_agents (tenant_id, name, contact_person, email, phone, country, region, commission_rate, credit_limit, notes)
                VALUES (@TenantId, @Name, @ContactPerson, @Email, @Phone, @Country, @Region, @CommissionRate, @CreditLimit, @Notes)
                RETURNING *;";
            var r = _dbConnection.QuerySingle<dynamic>(sql, request);
            return MapAgent(r);
        }

        public List<B2BAgentResponse> GetAllAgents(long tenantId)
        {
            return _dbConnection.Query<dynamic>("SELECT * FROM b2b_agents WHERE tenant_id = @TenantId ORDER BY name;",
                new { TenantId = tenantId }).Select(MapAgent).ToList();
        }

        public B2BAgentResponse? GetAgentById(long id)
        {
            var r = _dbConnection.QuerySingleOrDefault<dynamic>("SELECT * FROM b2b_agents WHERE id = @Id;", new { Id = id });
            return r != null ? MapAgent(r) : null;
        }

        public bool UpdateAgentStatus(long id, string status)
        {
            return _dbConnection.Execute("UPDATE b2b_agents SET status = @Status WHERE id = @Id;", new { Id = id, Status = status }) > 0;
        }

        private B2BAgentResponse MapAgent(dynamic r)
        {
            return new B2BAgentResponse
            {
                Id = (long)r.id, TenantId = (long)r.tenant_id, Name = (string)r.name,
                ContactPerson = r.contact_person as string, Email = r.email as string,
                Phone = r.phone as string, Country = r.country as string, Region = r.region as string,
                CommissionRate = (decimal)r.commission_rate, CreditLimit = (decimal)r.credit_limit,
                CreditBalance = (decimal)r.credit_balance, Status = (string)r.status,
                Notes = r.notes as string, CreatedAt = (DateTime)r.created_at,
            };
        }

        // ============================================================
        // B2B PRICING
        // ============================================================
        public AgentPricingResponse CreateAgentPricing(CreateAgentPricingRequest request)
        {
            string sql = @"
                INSERT INTO b2b_agent_pricing (agent_id, itinerary_id, price_per_person, currency, valid_from, valid_to)
                VALUES (@AgentId, @ItineraryId, @PricePerPerson, @Currency, @ValidFrom, @ValidTo) RETURNING *;";
            var r = _dbConnection.QuerySingle<dynamic>(sql, request);
            return MapPricing(r);
        }

        public List<AgentPricingResponse> GetAgentPricing(long agentId)
        {
            string sql = @"SELECT ap.*, i.title AS itinerary_title FROM b2b_agent_pricing ap
                LEFT JOIN itineraries i ON i.id = ap.itinerary_id WHERE ap.agent_id = @AgentId;";
            return _dbConnection.Query<dynamic>(sql, new { AgentId = agentId }).Select(MapPricing).ToList();
        }

        public bool DeleteAgentPricing(long id)
        {
            return _dbConnection.Execute("DELETE FROM b2b_agent_pricing WHERE id = @Id;", new { Id = id }) > 0;
        }

        private AgentPricingResponse MapPricing(dynamic r)
        {
            return new AgentPricingResponse
            {
                Id = (long)r.id, AgentId = (long)r.agent_id, ItineraryId = (long)r.itinerary_id,
                ItineraryTitle = (r as IDictionary<string, object>).ContainsKey("itinerary_title") ? r.itinerary_title as string : null,
                PricePerPerson = (decimal)r.price_per_person, Currency = (string)r.currency,
                ValidFrom = r.valid_from as DateTime?, ValidTo = r.valid_to as DateTime?,
            };
        }

        // ============================================================
        // B2B LEDGER
        // ============================================================
        public LedgerEntryResponse CreateLedgerEntry(CreateLedgerEntryRequest request)
        {
            // Get current balance
            decimal currentBalance = _dbConnection.ExecuteScalar<decimal>(
                "SELECT credit_balance FROM b2b_agents WHERE id = @AgentId;", new { request.AgentId });

            decimal newBalance = request.TransactionType == "Credit"
                ? currentBalance + request.Amount
                : currentBalance - request.Amount;

            // Update agent balance
            _dbConnection.Execute("UPDATE b2b_agents SET credit_balance = @Balance WHERE id = @AgentId;",
                new { Balance = newBalance, request.AgentId });

            string sql = @"
                INSERT INTO b2b_agent_ledger (agent_id, transaction_type, amount, reference, description, balance_after)
                VALUES (@AgentId, @TransactionType, @Amount, @Reference, @Description, @BalanceAfter) RETURNING *;";
            var r = _dbConnection.QuerySingle<dynamic>(sql, new
            {
                request.AgentId, request.TransactionType, request.Amount,
                request.Reference, request.Description, BalanceAfter = newBalance
            });
            return new LedgerEntryResponse
            {
                Id = (long)r.id, AgentId = (long)r.agent_id, TransactionType = (string)r.transaction_type,
                Amount = (decimal)r.amount, Reference = r.reference as string, Description = r.description as string,
                BalanceAfter = (decimal)r.balance_after, CreatedAt = (DateTime)r.created_at,
            };
        }

        public List<LedgerEntryResponse> GetAgentLedger(long agentId)
        {
            return _dbConnection.Query<dynamic>(
                "SELECT * FROM b2b_agent_ledger WHERE agent_id = @AgentId ORDER BY created_at DESC;",
                new { AgentId = agentId }).Select(r => new LedgerEntryResponse
                {
                    Id = (long)r.id, AgentId = (long)r.agent_id, TransactionType = (string)r.transaction_type,
                    Amount = (decimal)r.amount, Reference = r.reference as string, Description = r.description as string,
                    BalanceAfter = (decimal)r.balance_after, CreatedAt = (DateTime)r.created_at,
                }).ToList();
        }

        // ============================================================
        // SUPPLIER PAYMENTS
        // ============================================================
        public SupplierPaymentResponse CreateSupplierPayment(CreateSupplierPaymentRequest request)
        {
            string sql = @"
                INSERT INTO supplier_payments (tenant_id, supplier_type, supplier_id, supplier_name, booking_instance_id, amount, currency, payment_method, payment_date, reference, notes)
                VALUES (@TenantId, @SupplierType, @SupplierId, @SupplierName, @BookingInstanceId, @Amount, @Currency, @PaymentMethod, @PaymentDate, @Reference, @Notes)
                RETURNING *;";
            var r = _dbConnection.QuerySingle<dynamic>(sql, request);
            return MapSupplierPayment(r);
        }

        public List<SupplierPaymentResponse> GetAllSupplierPayments(long tenantId)
        {
            string sql = @"
                SELECT sp.*, ii.booking_reference
                FROM supplier_payments sp
                LEFT JOIN itinerary_instances ii ON ii.id = sp.booking_instance_id
                WHERE sp.tenant_id = @TenantId ORDER BY sp.created_at DESC;";
            return _dbConnection.Query<dynamic>(sql, new { TenantId = tenantId }).Select(MapSupplierPayment).ToList();
        }

        public bool UpdateSupplierPaymentStatus(long id, string status)
        {
            return _dbConnection.Execute("UPDATE supplier_payments SET status = @Status WHERE id = @Id;", new { Id = id, Status = status }) > 0;
        }

        private SupplierPaymentResponse MapSupplierPayment(dynamic r)
        {
            return new SupplierPaymentResponse
            {
                Id = (long)r.id, TenantId = (long)r.tenant_id, SupplierType = (string)r.supplier_type,
                SupplierId = (long)r.supplier_id, SupplierName = (string)r.supplier_name,
                BookingInstanceId = r.booking_instance_id as long?,
                BookingReference = (r as IDictionary<string, object>).ContainsKey("booking_reference") ? r.booking_reference as string : null,
                Amount = (decimal)r.amount, Currency = (string)r.currency,
                PaymentMethod = r.payment_method as string, PaymentDate = (DateTime)r.payment_date,
                Reference = r.reference as string, Status = (string)r.status,
                Notes = r.notes as string, CreatedAt = (DateTime)r.created_at,
            };
        }

        // ============================================================
        // SERVICE VOUCHERS
        // ============================================================
        public VoucherResponse CreateVoucher(CreateVoucherRequest request)
        {
            string vNum = $"VC-{DateTime.UtcNow:yyyyMMddHHmmss}-{new Random().Next(1000, 9999)}";
            string sql = @"
                INSERT INTO service_vouchers (tenant_id, voucher_number, booking_instance_id, voucher_type, supplier_type, supplier_id, supplier_name, service_date, details)
                VALUES (@TenantId, @VNum, @BookingInstanceId, @VoucherType, @SupplierType, @SupplierId, @SupplierName, @ServiceDate, @Details)
                RETURNING *;";
            var r = _dbConnection.QuerySingle<dynamic>(sql, new
            {
                request.TenantId, VNum = vNum, request.BookingInstanceId, request.VoucherType,
                request.SupplierType, request.SupplierId, request.SupplierName, request.ServiceDate, request.Details
            });
            return MapVoucher(r);
        }

        public List<VoucherResponse> GetAllVouchers(long tenantId)
        {
            string sql = @"
                SELECT sv.*, ii.booking_reference
                FROM service_vouchers sv
                LEFT JOIN itinerary_instances ii ON ii.id = sv.booking_instance_id
                WHERE sv.tenant_id = @TenantId ORDER BY sv.created_at DESC;";
            return _dbConnection.Query<dynamic>(sql, new { TenantId = tenantId }).Select(MapVoucher).ToList();
        }

        public bool UpdateVoucherStatus(long id, string status)
        {
            return _dbConnection.Execute("UPDATE service_vouchers SET status = @Status WHERE id = @Id;", new { Id = id, Status = status }) > 0;
        }

        private VoucherResponse MapVoucher(dynamic r)
        {
            return new VoucherResponse
            {
                Id = (long)r.id, TenantId = (long)r.tenant_id, VoucherNumber = (string)r.voucher_number,
                BookingInstanceId = r.booking_instance_id as long?,
                BookingReference = (r as IDictionary<string, object>).ContainsKey("booking_reference") ? r.booking_reference as string : null,
                VoucherType = (string)r.voucher_type,
                SupplierType = r.supplier_type as string, SupplierId = r.supplier_id as long?,
                SupplierName = r.supplier_name as string, ServiceDate = r.service_date as DateTime?,
                Details = r.details as string, Status = (string)r.status, CreatedAt = (DateTime)r.created_at,
            };
        }

        // ============================================================
        // ROOMING
        // ============================================================
        public RoomingResponse CreateRooming(CreateRoomingRequest request)
        {
            string sql = @"
                INSERT INTO rooming_assignments (departure_id, booking_instance_id, traveler_id, hotel_id, room_type, room_number, check_in_date, check_out_date, notes)
                VALUES (@DepartureId, @BookingInstanceId, @TravelerId, @HotelId, @RoomType, @RoomNumber, @CheckInDate, @CheckOutDate, @Notes)
                RETURNING *;";
            var r = _dbConnection.QuerySingle<dynamic>(sql, request);
            return MapRooming(r);
        }

        public List<RoomingResponse> GetRoomingByDeparture(long departureId)
        {
            string sql = @"
                SELECT ra.*, ii.booking_reference,
                    t.first_name || ' ' || COALESCE(t.last_name, '') AS traveler_name,
                    h.name AS hotel_name
                FROM rooming_assignments ra
                LEFT JOIN itinerary_instances ii ON ii.id = ra.booking_instance_id
                LEFT JOIN travelers t ON t.id = ra.traveler_id
                LEFT JOIN hotels h ON h.id = ra.hotel_id
                WHERE ra.departure_id = @DepartureId;";
            return _dbConnection.Query<dynamic>(sql, new { DepartureId = departureId }).Select(MapRooming).ToList();
        }

        public bool DeleteRooming(long id)
        {
            return _dbConnection.Execute("DELETE FROM rooming_assignments WHERE id = @Id;", new { Id = id }) > 0;
        }

        private RoomingResponse MapRooming(dynamic r)
        {
            return new RoomingResponse
            {
                Id = (long)r.id, DepartureId = (long)r.departure_id,
                BookingInstanceId = (long)r.booking_instance_id,
                BookingReference = (r as IDictionary<string, object>).ContainsKey("booking_reference") ? r.booking_reference as string : null,
                TravelerId = (long)r.traveler_id,
                TravelerName = (r as IDictionary<string, object>).ContainsKey("traveler_name") ? r.traveler_name as string : null,
                HotelId = r.hotel_id as long?,
                HotelName = (r as IDictionary<string, object>).ContainsKey("hotel_name") ? r.hotel_name as string : null,
                RoomType = r.room_type as string, RoomNumber = r.room_number as string,
                CheckInDate = r.check_in_date as DateTime?, CheckOutDate = r.check_out_date as DateTime?,
                Notes = r.notes as string,
            };
        }
    }
}
