# Lead CRM & Tour Operations — Full Stack Implementation

## Overview

This document covers the **Lead CRM & Tour Operations** module that was implemented as a full-stack feature spanning:

- **12 new database tables** (PostgreSQL, managed via FluentMigrator)
- **Backend**: .NET 10 API with Dapper ORM (Domain → DTO → Repository → Service → Controller)
- **Frontend**: 19 Angular standalone components with PrimeNG UI, 1 shared service

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Angular)                        │
│  LeadCrmService → HttpClient → api/LeadCrm/*                   │
│  19 PrimeNG Components (Tables, Dialogs, Cards, Forms)          │
└────────────────────────────┬─────────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼─────────────────────────────────────┐
│                     BACKEND (.NET 10)                             │
│  LeadCrmController → LeadCrmService → LeadCrmRepository          │
│  AutoMapper (Domain ↔ DTO), Multi-tenant via TenantId            │
└────────────────────────────┬─────────────────────────────────────┘
                             │ SQL (Dapper)
┌────────────────────────────▼─────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                           │
│  12 tables: leads, lead_follow_ups, quotations, ...              │
└──────────────────────────────────────────────────────────────────┘
```

---

## Business Flow

```
Lead (Inquiry) → Follow-ups → Quotation → Proposal (Itinerary) → Booking
                                 ↕
                          B2B Agents / Pricing
                                 ↕
              Amendments ← Booking → Rooming → Vouchers → Supplier Payments
```

### Key Concepts

| Concept | Table | Purpose |
|---------|-------|---------|
| **Lead** | `leads` | An inquiry from a potential client (name, source, budget, travel dates) |
| **Follow-up** | `lead_follow_ups` | Phone/email/meeting notes linked to a lead |
| **Quotation** | `quotations` + `quotation_line_items` | Formal pricing document with line items, discount, tax |
| **Proposal** | `itinerary_proposals` (existing) | Day-by-day trip plan linked to an itinerary template |
| **Amendment** | `booking_amendments` | Change requests after booking (date change, pax change, etc.) |
| **Contract** | `supplier_contracts` | Rate agreements with hotels, transport companies |
| **B2B Agent** | `b2b_agents` | Partner travel agencies who send bookings |
| **Agent Pricing** | `b2b_agent_pricing` | Special rates per itinerary for each agent |
| **Credit Ledger** | `b2b_agent_ledger` | Credit/debit transactions for agent accounts |
| **Supplier Payment** | `supplier_payments` | Payments made to hotels, airlines, etc. |
| **Service Voucher** | `service_vouchers` | Confirmation documents for each booked service |
| **Rooming** | `rooming_assignments` | Room assignment per traveler per departure |

---

## Database Tables

### Migration: `202605010001 - AddLeadsCrmTables`

#### 1. `leads`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | Auto-increment |
| tenant_id | bigint | Multi-tenant |
| name | varchar(300) | Client name |
| email | varchar(300) | Nullable |
| phone | varchar(50) | Nullable |
| country | varchar(100) | Nullable |
| source | varchar(50) | Website, Referral, Email, Phone, SocialMedia, TravelAgent, WalkIn |
| status | varchar(50) | New, InProgress, Qualified, Converted, Lost |
| priority | varchar(50) | Low, Medium, High, Urgent |
| interested_in | varchar(500) | e.g. "Everest Base Camp Trek" |
| travel_date_from | date | Nullable |
| travel_date_to | date | Nullable |
| pax | int | Number of travelers |
| budget | decimal(18,2) | Nullable |
| currency | varchar(10) | Default: USD |
| assigned_to | varchar(200) | Staff member |
| notes | text | Nullable |
| proposal_id | bigint FK | Links to `itinerary_proposals` when converted |
| created_at | datetime | UTC |
| updated_at | datetime | UTC |
| converted_at | datetime | When lead was converted to booking |

#### 2. `lead_follow_ups`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| lead_id | bigint FK → leads | |
| type | varchar(50) | Phone, Email, Meeting, WhatsApp, Other |
| message | text | Follow-up notes |
| next_follow_up_date | date | Nullable |
| created_by | varchar(200) | Who logged this |
| created_at | datetime | |

#### 3. `quotations`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| tenant_id | bigint | |
| quotation_number | varchar(50) | Auto-generated: QT-XXXXXXXX |
| lead_id | bigint FK → leads | Optional link to lead |
| proposal_id | bigint FK → itinerary_proposals | Optional link to proposal |
| client_name | varchar(300) | |
| client_email | varchar(300) | |
| client_phone | varchar(50) | |
| travel_date_from | date | |
| travel_date_to | date | |
| pax | int | |
| subtotal | decimal(18,2) | Sum of line items |
| discount_amount | decimal(18,2) | |
| tax_amount | decimal(18,2) | |
| total_amount | decimal(18,2) | subtotal - discount + tax |
| currency | varchar(10) | |
| status | varchar(50) | Draft, Sent, Approved, Rejected, Expired |
| valid_until | date | |
| notes | text | |
| created_at / updated_at | datetime | |

#### 4. `quotation_line_items`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| quotation_id | bigint FK → quotations | CASCADE delete |
| item_type | varchar(50) | Accommodation, Transport, Activity, Guide, Meal, Permit, Flight, Other |
| description | varchar(500) | |
| quantity | decimal(10,2) | |
| unit_price | decimal(18,2) | |
| total_price | decimal(18,2) | quantity × unit_price |
| sort_order | int | |

#### 5. `booking_amendments`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| tenant_id | bigint | |
| booking_instance_id | bigint FK → itinerary_instances | |
| amendment_type | varchar(50) | DateChange, NameChange, PaxChange, ServiceChange, Cancellation |
| description | text | |
| old_value | varchar(500) | |
| new_value | varchar(500) | |
| status | varchar(50) | Pending, Approved, Rejected, Applied |
| requested_by | varchar(200) | |
| approved_by | varchar(200) | |
| fee_amount | decimal(18,2) | Amendment fee |
| created_at | datetime | |
| resolved_at | datetime | |

#### 6. `supplier_contracts`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| tenant_id | bigint | |
| supplier_type | varchar(50) | Hotel, Transport, Activity, Airline |
| supplier_id | bigint | References hotel/transport table |
| supplier_name | varchar(300) | Denormalized |
| contract_number | varchar(100) | |
| start_date / end_date | date | Validity period |
| rate_type | varchar(50) | PerNight, PerPerson, PerTrip, PerDay, Flat |
| base_rate | decimal(18,2) | |
| currency | varchar(10) | |
| terms | text | |
| status | varchar(50) | Active, Expired, Terminated, Draft |
| created_at | datetime | |

#### 7. `b2b_agents`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| tenant_id | bigint | |
| name | varchar(300) | Company name |
| contact_person | varchar(200) | |
| email / phone | varchar | |
| country / region | varchar | |
| commission_rate | decimal(5,2) | Percentage |
| credit_limit | decimal(18,2) | |
| credit_balance | decimal(18,2) | Updated on ledger entries |
| status | varchar(50) | Active, Suspended, Inactive |
| notes | text | |
| created_at | datetime | |

#### 8. `b2b_agent_pricing`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| agent_id | bigint FK → b2b_agents | |
| itinerary_id | bigint | References itineraries table |
| price_per_person | decimal(18,2) | Agent-specific price |
| currency | varchar(10) | |
| valid_from / valid_to | date | |

#### 9. `b2b_agent_ledger`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| agent_id | bigint FK → b2b_agents | |
| transaction_type | varchar(50) | Credit, Debit, Adjustment |
| amount | decimal(18,2) | |
| reference | varchar(200) | Invoice/booking ref |
| description | text | |
| balance_after | decimal(18,2) | Running balance |
| created_at | datetime | |

#### 10. `supplier_payments`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| tenant_id | bigint | |
| supplier_type | varchar(50) | |
| supplier_id | bigint | |
| supplier_name | varchar(300) | |
| booking_instance_id | bigint | Optional |
| amount | decimal(18,2) | |
| currency | varchar(10) | |
| payment_method | varchar(50) | BankTransfer, Cash, Check, Online |
| payment_date | date | |
| reference | varchar(200) | |
| status | varchar(50) | Pending, Completed, Cancelled |
| notes | text | |
| created_at | datetime | |

#### 11. `service_vouchers`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| tenant_id | bigint | |
| voucher_number | varchar(50) | Auto-generated: VC-XXXXXXXX |
| booking_instance_id | bigint FK → itinerary_instances | |
| voucher_type | varchar(50) | Hotel, Transport, Activity, Guide, Meal, Flight |
| supplier_type | varchar(50) | |
| supplier_id | bigint | |
| service_date | date | |
| details | text | |
| status | varchar(50) | Draft, Issued, Confirmed, Used, Cancelled |
| created_at | datetime | |

#### 12. `rooming_assignments`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| departure_id | bigint | Which departure group |
| booking_instance_id | bigint FK → itinerary_instances | |
| traveler_id | bigint FK → travelers | |
| hotel_id | bigint | |
| room_type | varchar(50) | Single, Double, Twin, Triple, Suite, Family |
| room_number | varchar(50) | |
| check_in_date / check_out_date | date | |
| notes | text | |

---

## API Endpoints

**Base URL**: `https://localhost:7236/api/LeadCrm`

All endpoints are multi-tenant (tenant extracted from JWT middleware).

### Leads
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/leads` | List all leads for tenant |
| GET | `/leads/{id}` | Get single lead |
| POST | `/leads` | Create lead |
| PUT | `/leads/{id}` | Update lead |
| DELETE | `/leads/{id}` | Delete lead |
| POST | `/leads/{leadId}/convert/{proposalId}` | Convert lead (links to proposal) |

### Follow-ups
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/follow-ups` | All follow-ups for tenant |
| GET | `/leads/{leadId}/follow-ups` | Follow-ups for specific lead |
| POST | `/follow-ups` | Create follow-up (auto-updates lead status to InProgress) |

### Quotations
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/quotations` | List all |
| GET | `/quotations/{id}` | Get with line items |
| POST | `/quotations` | Create (auto-generates QT-number) |
| PUT | `/quotations/{id}/status` | Update status (Draft→Sent→Approved/Rejected) |

### Amendments
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/amendments` | List all |
| POST | `/amendments` | Submit amendment request |
| PUT | `/amendments/{id}/status` | Approve/Reject |

### Contracts
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/contracts` | List all |
| POST | `/contracts` | Create |
| PUT | `/contracts/{id}/status` | Terminate/Activate |

### B2B Agents
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/agents` | List all |
| GET | `/agents/{id}` | Get single |
| POST | `/agents` | Create |
| PUT | `/agents/{id}/status` | Activate/Suspend |

### B2B Pricing
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/agents/{agentId}/pricing` | Get pricing for agent |
| POST | `/agent-pricing` | Add pricing |
| DELETE | `/agent-pricing/{id}` | Remove pricing |

### B2B Ledger
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/agents/{agentId}/ledger` | Get ledger entries |
| POST | `/ledger` | Create entry (auto-updates agent `credit_balance`) |

### Supplier Payments
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/supplier-payments` | List all |
| POST | `/supplier-payments` | Record payment |
| PUT | `/supplier-payments/{id}/status` | Complete/Cancel |

### Vouchers
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/vouchers` | List all |
| POST | `/vouchers` | Issue (auto-generates VC-number) |
| PUT | `/vouchers/{id}/status` | Confirm/Cancel/Use |

### Rooming
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/rooming/{departureId}` | Get assignments for departure |
| POST | `/rooming` | Assign room |
| DELETE | `/rooming/{id}` | Remove assignment |

---

## Backend File Structure

```
TNT/
├── DbDeployment/Migrations/TourAndTravels/
│   └── AddLeadsCrmTables.cs              # Migration [202605010001]
├── Domain/Models/TourAndTravels/
│   └── LeadCrm.cs                        # All request/response models
├── Repository/
│   ├── DataModels/TourAndTravels/
│   │   └── LeadCrmDTO.cs                 # DTOs with TenantId
│   ├── Interfaces/TourAndTravels/
│   │   └── ILeadCrmRepository.cs         # Repository interface
│   └── Repositories/TourAndTravels/
│       └── LeadCrmRepository.cs          # Dapper SQL implementation
├── Bussiness/
│   ├── Services/TourAndTravels/
│   │   └── LeadCrmService.cs             # ILeadCrmService + implementation
│   └── MappingProfiles/TourAndTravels/
│       └── LeadCrmMappingProfile.cs      # AutoMapper profile
└── server/
    ├── Controller/TourAndTravels/
    │   └── LeadCrmController.cs          # REST API controller
    └── Program.cs                        # DI registration
```

---

## Frontend File Structure

```
sakai-ng/src/app/
├── shared/services/
│   └── lead-crm.service.ts              # Angular service (all interfaces + HTTP calls)
└── pages/
    ├── sales/
    │   ├── leads/leads.ts               # CRUD table with dialog
    │   └── follow-ups/follow-ups.ts     # Timeline with lead filter
    ├── quotations/
    │   ├── quotation-list/quotation-list.ts    # Table with status workflow
    │   └── quotation-create/quotation-create.ts # Multi-step form with line items
    ├── booking/
    │   ├── rooming-list/rooming-list.ts        # Room assignment grid
    │   └── amendments/amendments.ts            # Amendment CRUD + approval
    ├── operations/
    │   ├── trip-dashboard/trip-dashboard.ts    # KPI cards + recent items
    │   ├── assign-services/assign-services.ts  # Voucher CRUD
    │   ├── daily-plan/daily-plan.ts            # Date-filtered service view
    │   └── arrival-departure/arrival-departure.ts # Flight/Transport tabs
    ├── inventory/
    │   └── contracts/contracts.ts              # Supplier contract CRUD
    ├── b2b/
    │   ├── agent-list/agent-list.ts           # Agent CRUD
    │   ├── pricing/pricing.ts                 # Agent-specific itinerary pricing
    │   ├── credit-ledger/credit-ledger.ts     # Balance + transaction history
    │   └── agent-bookings/agent-bookings.ts   # Agent debit transactions
    ├── finance/
    │   └── supplier-payments/supplier-payments.ts # Payment tracking
    ├── documents/
    │   ├── voucher-list/voucher-list.ts       # Full voucher management
    │   └── downloads/downloads.ts             # Document download cards
    └── reports/
        └── reports.ts                         # KPI dashboard with analytics
```

---

## Frontend Components Detail

| # | Component | PrimeNG Elements | Key Features |
|---|-----------|-----------------|--------------|
| 1 | **LeadList** | Table, Dialog, Toolbar, Tag, DatePicker, InputNumber | Full CRUD, global search, source/status/priority tags, CSV export |
| 2 | **FollowUpList** | Table, Dialog, Select, Timeline | Lead filter dropdown, overdue highlighting, create form |
| 3 | **QuotationList** | Table, Toolbar, Tag, ConfirmDialog | Status workflow (Draft→Sent→Approved), expiry tracking |
| 4 | **QuotationCreate** | InputNumber, Select, DatePicker, Divider | Dynamic line items, auto-calculate subtotal/discount/tax/total, lead auto-fill |
| 5 | **RoomingList** | Table, Dialog, InputNumber, DatePicker | Load by departure, room type selection, check-in/out dates |
| 6 | **AmendmentList** | Table, Dialog, Tag, ConfirmDialog | Approval workflow, old/new value display, fee tracking |
| 7 | **TripDashboard** | Cards, Tag, Divider, ProgressBar | KPI summary, recent amendments & vouchers |
| 8 | **AssignServices** | Table, Dialog, Select, Tag | Voucher creation, status lifecycle |
| 9 | **DailyPlan** | DatePicker, Cards, Tag | Per-date service filter, service type icons, summary counters |
| 10 | **ArrivalDeparture** | Tabs, Table, DatePicker, Tag | Flight tab + Transport tab, date filtering |
| 11 | **ContractList** | Table, Dialog, DatePicker, Tag | Rate types, expiry highlighting, terminate action |
| 12 | **B2BAgentList** | Table, Dialog, InputNumber | Commission, credit tracking, activate/suspend |
| 13 | **B2BPricing** | Table, Dialog, Select | Agent-specific pricing per itinerary |
| 14 | **CreditLedger** | Table, Dialog, Tag, Cards | Balance summary, credit/debit entries, running balance |
| 15 | **AgentBookings** | Table, Cards, Select | Agent KPI summary, debit transaction view |
| 16 | **SupplierPaymentList** | Table, Dialog, Tag, Cards | KPI cards (total/pending/completed), payment methods |
| 17 | **TntVoucherList** | Table, Tag, Toolbar | Full voucher lifecycle (Draft→Issued→Confirmed→Used), CSV export |
| 18 | **DocumentDownloads** | Cards, Tag, Divider | Quotation PDF cards, voucher download cards |
| 19 | **TntReports** | Cards, Tag, Divider | Lead sources breakdown, status distribution, top agents, revenue summary |

---

## DI Registration (server/Program.cs)

```csharp
builder.Services.AddScoped<ILeadCrmRepository, LeadCrmRepository>();
builder.Services.AddScoped<ILeadCrmService, LeadCrmService>();
```

---

## How to Run

### Backend
```bash
cd /Users/ramsharanlamichhane/Projects/TNT

# Run migration
dotnet run --project DbDeployment

# Start API server
dotnet run --project server
```

### Frontend
```bash
cd /Users/ramsharanlamichhane/Desktop/Projects/Angularsakairecent/sakai-ng

# Install dependencies
npm install

# Start dev server
ng serve

# Build for production
ng build
```

---

## Status

- ✅ Database: Migration `202605010001` applied — 12 tables created
- ✅ Backend: Builds with 0 errors
- ✅ Frontend: Builds with 0 errors (only pre-existing warnings)
- ✅ All 19 components functional with real API calls
