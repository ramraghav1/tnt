using FluentMigrator;

namespace DbDeployment.Migrations.TourAndTravels
{
    /// <summary>
    /// Seeds the inventory tables with realistic Nepal-focused sample data:
    ///   - 15 Locations (major destinations across Nepal)
    ///   - 5  Seasons  (Peak, Normal, Off, Monsoon, Festival)
    ///   - 15 Hotels   (one per location, with rooms)
    ///   - 12 Vehicles (various types)
    ///   - 15 Guides   (one per location)
    ///   - 15 Activities (across locations)
    ///
    /// Down() cleanly removes all seeded rows using known id ranges or names.
    /// </summary>
    [Migration(202605030002)]
    public class SeedInventoryData : Migration
    {
        private const long Tenant = 1;
        private const int CreatedBy = 1;

        public override void Up()
        {
            // ================================================================
            //  1. LOCATIONS  (15 famous Nepal destinations)
            // ================================================================
            InsertLocation("Kathmandu",     "KTM",  "Nepal", "Bagmati",       27.7172453, 85.3239605, 1.00m, "Asia/Kathmandu", "Capital city, cultural hub");
            InsertLocation("Pokhara",       "PKR",  "Nepal", "Gandaki",       28.2096000, 83.9856000, 0.95m, "Asia/Kathmandu", "Lake city, gateway to Annapurna");
            InsertLocation("Chitwan",       "CTW",  "Nepal", "Narayani",      27.5291000, 84.3542000, 0.85m, "Asia/Kathmandu", "Jungle safari, Chitwan National Park");
            InsertLocation("Lumbini",       "LBI",  "Nepal", "Rupandehi",     27.4833000, 83.2761000, 0.80m, "Asia/Kathmandu", "Birthplace of Buddha");
            InsertLocation("Nagarkot",      "NGK",  "Nepal", "Bagmati",       27.7150000, 85.5200000, 0.90m, "Asia/Kathmandu", "Himalayan sunrise viewpoint");
            InsertLocation("Bhaktapur",     "BKT",  "Nepal", "Bagmati",       27.6722000, 85.4298000, 0.88m, "Asia/Kathmandu", "Ancient Newari city, Durbar Square");
            InsertLocation("Bandipur",      "BDP",  "Nepal", "Tanahun",       27.9350000, 84.4050000, 0.82m, "Asia/Kathmandu", "Hilltop heritage village");
            InsertLocation("Namche Bazaar", "NMB",  "Nepal", "Solukhumbu",    27.8069000, 86.7140000, 1.30m, "Asia/Kathmandu", "Gateway to Everest Base Camp");
            InsertLocation("Lukla",         "LKL",  "Nepal", "Solukhumbu",    27.6868000, 86.7295000, 1.25m, "Asia/Kathmandu", "Starting point for Everest trek");
            InsertLocation("Janakpur",      "JNK",  "Nepal", "Dhanusha",      26.7288000, 85.9264000, 0.75m, "Asia/Kathmandu", "Mythological city of Sita");
            InsertLocation("Ilam",          "ILM",  "Nepal", "Ilam",          26.9107000, 87.9265000, 0.78m, "Asia/Kathmandu", "Tea gardens, eastern hills");
            InsertLocation("Manang",        "MNG",  "Nepal", "Manang",        28.6667000, 84.0167000, 1.20m, "Asia/Kathmandu", "High altitude Annapurna Circuit");
            InsertLocation("Gorkha",        "GRK",  "Nepal", "Gorkha",        28.0000000, 84.6333000, 0.80m, "Asia/Kathmandu", "Historic fortress & palace");
            InsertLocation("Tansen",        "TNS",  "Nepal", "Palpa",         27.8667000, 83.5500000, 0.78m, "Asia/Kathmandu", "Newari hill town, panoramic views");
            InsertLocation("Dhulikhel",     "DHK",  "Nepal", "Kavrepalanchok",27.6219000, 85.5561000, 0.90m, "Asia/Kathmandu", "Mountain resort town near KTM");

            // ================================================================
            //  2. SEASONS  (5 Nepal tourism seasons for 2026)
            // ================================================================
            Insert.IntoTable("seasons").Row(new { tenant_id = Tenant, name = "Spring Peak",     season_type = "Peak",     start_date = "2026-03-01", end_date = "2026-05-31", price_multiplier = 1.30m, description = "Best trekking weather, clear skies, rhododendrons blooming",                          year = 2026, is_active = true, created_at = SystemMethods.CurrentUTCDateTime, updated_at = SystemMethods.CurrentUTCDateTime, created_by = CreatedBy });
            Insert.IntoTable("seasons").Row(new { tenant_id = Tenant, name = "Monsoon Off",     season_type = "Monsoon",  start_date = "2026-06-01", end_date = "2026-08-31", price_multiplier = 0.70m, description = "Heavy rainfall, leeches on trails, low tourist traffic, great for rafting",          year = 2026, is_active = true, created_at = SystemMethods.CurrentUTCDateTime, updated_at = SystemMethods.CurrentUTCDateTime, created_by = CreatedBy });
            Insert.IntoTable("seasons").Row(new { tenant_id = Tenant, name = "Autumn Peak",     season_type = "Peak",     start_date = "2026-09-01", end_date = "2026-11-30", price_multiplier = 1.35m, description = "Dashain/Tihar festival season, clearest mountain views, peak trekking",              year = 2026, is_active = true, created_at = SystemMethods.CurrentUTCDateTime, updated_at = SystemMethods.CurrentUTCDateTime, created_by = CreatedBy });
            Insert.IntoTable("seasons").Row(new { tenant_id = Tenant, name = "Winter Normal",   season_type = "Normal",   start_date = "2026-12-01", end_date = "2027-02-28", price_multiplier = 0.90m, description = "Cold but clear skies, lower altitude treks fine, snow at high altitude",            year = 2026, is_active = true, created_at = SystemMethods.CurrentUTCDateTime, updated_at = SystemMethods.CurrentUTCDateTime, created_by = CreatedBy });
            Insert.IntoTable("seasons").Row(new { tenant_id = Tenant, name = "Dashain Festival", season_type = "Festival", start_date = "2026-10-05", end_date = "2026-10-20", price_multiplier = 1.50m, description = "Biggest Hindu festival, domestic travel surge, limited availability",                year = 2026, is_active = true, created_at = SystemMethods.CurrentUTCDateTime, updated_at = SystemMethods.CurrentUTCDateTime, created_by = CreatedBy });

            // ================================================================
            //  3. HOTELS  (15 hotels across Nepal's famous locations)
            // ================================================================
            // Kathmandu
            InsertHotel("Hotel Yak & Yeti",             "Kathmandu",  "Durbar Marg, Kathmandu",       "Rajesh Shrestha",  "+977-1-4248999", "info@yakandyeti.com",         5, "Luxury",   "Iconic 5-star heritage hotel in the heart of Kathmandu");
            InsertHotel("Hotel Shanker",                 "Kathmandu",  "Lazimpat, Kathmandu",           "Sunil Rana",       "+977-1-4410151", "reservations@shankerhotel.com", 4, "Luxury",   "Rana-era palace converted to heritage hotel");

            // Pokhara
            InsertHotel("Temple Tree Resort & Spa",      "Pokhara",    "Lakeside, Pokhara",             "Anita Gurung",     "+977-61-465819", "info@templetree.com.np",       5, "Resort",   "Luxury lakeside resort with Annapurna views");
            InsertHotel("Hotel Barahi",                  "Pokhara",    "Lakeside, Pokhara",             "Binod Thapa",      "+977-61-460617", "info@barahi.com",              4, "Standard", "Lake-front hotel with rooftop restaurant");

            // Chitwan
            InsertHotel("Kasara Jungle Resort",          "Chitwan",    "Sauraha, Chitwan",              "Deepak Adhikari",  "+977-56-580112", "info@kasararesort.com",         5, "Resort",   "5-star jungle lodge at Chitwan National Park border");
            InsertHotel("Green Park Chitwan",            "Chitwan",    "Sauraha, Chitwan",              "Maya Tamang",      "+977-56-580201", "greenpark@chitwan.com",         3, "Standard", "Budget-friendly stay near the park entrance");

            // Lumbini
            InsertHotel("Buddha Maya Garden Hotel",      "Lumbini",    "Lumbini Development Zone",      "Hari Pandey",      "+977-71-580236", "buddhamaya@lumbini.com",        4, "Standard", "Peaceful hotel near Maya Devi temple");

            // Nagarkot
            InsertHotel("Club Himalaya Nagarkot",        "Nagarkot",   "Nagarkot Heights",              "Prakash KC",       "+977-1-6680080", "info@clubhimalaya.com",         4, "Resort",   "Mountain resort with panoramic Himalayan sunrise views");

            // Bhaktapur
            InsertHotel("Heritage Home Hotel",           "Bhaktapur",  "Taumadhi Square, Bhaktapur",    "Surya Maharjan",   "+977-1-6613828", "heritage@bhaktapur.com",        3, "Heritage", "Restored Newari house in the old city center");

            // Bandipur
            InsertHotel("Old Inn Bandipur",              "Bandipur",   "Main Bazaar, Bandipur",         "Keshav Lamsal",    "+977-65-520048", "oldinn@bandipur.com",           3, "Heritage", "Charming heritage inn in the hilltop village");

            // Namche Bazaar
            InsertHotel("Everest Summit Lodge Namche",   "Namche Bazaar","Main Trail, Namche Bazaar",   "Pasang Sherpa",    "+977-38-540053", "summit@namchelodge.com",        3, "Lodge",    "Comfortable lodge with Everest & Ama Dablam views");

            // Dhulikhel
            InsertHotel("Dhulikhel Mountain Resort",     "Dhulikhel",  "Dhulikhel Heights",             "Ramesh Tamang",    "+977-11-490114", "dmresort@dhulikhel.com",        4, "Resort",   "Hilltop resort with 180° Himalayan panorama");

            // Ilam
            InsertHotel("Kanyam Tea Garden Resort",      "Ilam",       "Kanyam, Ilam",                  "Tek Limbu",        "+977-27-540021", "kanyamresort@ilam.com",         3, "Resort",   "Resort amidst rolling tea estates of eastern Nepal");

            // Janakpur
            InsertHotel("Hotel Welcome Janakpur",        "Janakpur",   "Bhanu Chowk, Janakpur",         "Ravi Yadav",       "+977-41-520012", "welcome@janakpur.com",          3, "Standard", "Comfortable city hotel near Janaki Temple");

            // Tansen
            InsertHotel("Hotel Srinagar Tansen",         "Tansen",     "Tansen Bazaar, Palpa",          "Ganesh Poudel",    "+977-75-520026", "srinagar@tansen.com",           3, "Standard", "Heritage-style hotel with valley views");

            // ================================================================
            //  4. HOTEL ROOMS  (2 room types per hotel = 30 rooms)
            //     We insert by hotel name lookup via subselect
            // ================================================================
            // NOTE: FluentMigrator doesn't support subselects, so we use Execute.Sql
            Execute.Sql(@"
                -- For each hotel, insert Standard and Deluxe rooms
                INSERT INTO hotel_rooms (hotel_id, room_type, capacity, total_rooms, price_per_night, is_active, base_currency, features)
                SELECT h.id, rt.room_type, rt.capacity, rt.total_rooms, rt.price, true, 'USD', rt.features
                FROM hotels h
                CROSS JOIN (VALUES
                    ('Standard Room',  2, 15, 80.00,  '[""Wi-Fi"",""TV"",""Hot Water""]'::jsonb),
                    ('Deluxe Room',    3, 10, 150.00, '[""Wi-Fi"",""TV"",""Hot Water"",""Mini Bar"",""Mountain View""]'::jsonb)
                ) AS rt(room_type, capacity, total_rooms, price, features)
                WHERE h.name IN (
                    'Hotel Yak & Yeti','Hotel Shanker','Temple Tree Resort & Spa','Hotel Barahi',
                    'Kasara Jungle Resort','Green Park Chitwan','Buddha Maya Garden Hotel',
                    'Club Himalaya Nagarkot','Heritage Home Hotel','Old Inn Bandipur',
                    'Everest Summit Lodge Namche','Dhulikhel Mountain Resort','Kanyam Tea Garden Resort',
                    'Hotel Welcome Janakpur','Hotel Srinagar Tansen'
                );

                -- Upgrade luxury hotels pricing
                UPDATE hotel_rooms SET price_per_night = 220.00
                FROM hotels h WHERE hotel_rooms.hotel_id = h.id AND h.star_rating = 5 AND hotel_rooms.room_type = 'Standard Room';
                UPDATE hotel_rooms SET price_per_night = 380.00
                FROM hotels h WHERE hotel_rooms.hotel_id = h.id AND h.star_rating = 5 AND hotel_rooms.room_type = 'Deluxe Room';
            ");

            // ================================================================
            //  5. VEHICLES  (12 vehicles – various types for Nepal terrain)
            // ================================================================
            InsertVehicle("SUV",           "Toyota Land Cruiser Prado",   "BA 1 JA 2001",  7,  180.00m, 12.00m, "Ramesh Karki",     "+977-9841000001", "Robust SUV for mountain roads");
            InsertVehicle("SUV",           "Mahindra Scorpio",            "BA 1 JA 2002",  7,  120.00m,  9.00m, "Bikash Tamang",    "+977-9841000002", "Popular SUV for off-road travel");
            InsertVehicle("Jeep",          "Mahindra Bolero",             "BA 1 JA 2003",  8,  100.00m,  8.00m, "Santosh BK",       "+977-9841000003", "Workhorse jeep for rural roads");
            InsertVehicle("Sedan",         "Toyota Corolla",              "BA 1 JA 2004",  4,   80.00m,  7.00m, "Dinesh Gautam",    "+977-9841000004", "Comfortable sedan for city & highway");
            InsertVehicle("Van",           "Toyota HiAce",               "BA 1 JA 2005", 15,  200.00m, 14.00m, "Hari Bahadur",     "+977-9841000005", "Spacious van for group travel");
            InsertVehicle("Mini Bus",      "Rosa Bus",                    "BA 1 JA 2006", 25,  280.00m, 16.00m, "Purna Magar",      "+977-9841000006", "Mini bus for medium groups");
            InsertVehicle("Tourist Bus",   "Deluxe Tourist Coach",        "BA 1 JA 2007", 40,  450.00m, 20.00m, "Manoj Shrestha",   "+977-9841000007", "AC deluxe coach for large groups");
            InsertVehicle("Micro Bus",     "Tata Winger",                 "BA 1 JA 2008", 12,  150.00m, 11.00m, "Suraj Rai",        "+977-9841000008", "Compact bus for hill roads");
            InsertVehicle("SUV",           "Hyundai Creta",               "BA 1 JA 2009",  5,  100.00m,  8.50m, "Anil Shrestha",    "+977-9841000009", "Modern SUV for small groups");
            InsertVehicle("Jeep",          "Tata Sumo",                   "BA 1 JA 2010",  9,   90.00m,  7.50m, "Krishna Thapa",    "+977-9841000010", "Reliable jeep for trekking access roads");
            InsertVehicle("Motorcycle",    "Royal Enfield Himalayan",     "BA 1 PA 2011",  2,   45.00m,  5.00m, "",                 "",                "Adventure motorcycle for solo/duo");
            InsertVehicle("E-Vehicle",     "BYD e6",                      "BA 1 JA 2012",  5,   95.00m,  6.00m, "Nabin Maharjan",   "+977-9841000012", "Electric vehicle for eco-friendly city tours");

            // ================================================================
            //  6. GUIDES  (15 guides – one per location specialization)
            // ================================================================
            InsertGuide("Pemba Dorje Sherpa",    "+977-9841100001", "pemba@guides.np",     "Namche Bazaar, Solukhumbu",  20, "Mountaineering",       "NNMGA-1001", 4.95m, "Everest summiteer, expert high-altitude guide");
            InsertGuide("Lakpa Nuru Sherpa",     "+977-9841100002", "lakpa@guides.np",     "Lukla, Solukhumbu",          15, "Trekking",             "NNMGA-1002", 4.90m, "Everest region specialist, fluent in English & Japanese");
            InsertGuide("Amar Bahadur Gurung",   "+977-9841100003", "amar@guides.np",      "Pokhara, Kaski",             12, "Trekking",             "NNMGA-1003", 4.80m, "Annapurna Circuit & ABC specialist");
            InsertGuide("Sanjay Thapa",          "+977-9841100004", "sanjay@guides.np",    "Kathmandu",                  10, "Cultural Tour",        "NNMGA-1004", 4.70m, "Expert on Kathmandu Valley heritage sites");
            InsertGuide("Deepa Lama",            "+977-9841100005", "deepa@guides.np",     "Bhaktapur, Bhaktapur",        8, "Heritage Walk",        "NNMGA-1005", 4.75m, "Newari cultural expert, Bhaktapur & Patan specialist");
            InsertGuide("Rajendra Chaudhary",    "+977-9841100006", "rajendra@guides.np",  "Sauraha, Chitwan",           14, "Wildlife Safari",      "NNMGA-1006", 4.85m, "Naturalist guide, bird & wildlife specialist");
            InsertGuide("Bishow Pandey",         "+977-9841100007", "bishow@guides.np",    "Lumbini, Rupandehi",          7, "Pilgrimage",           "NNMGA-1007", 4.60m, "Buddhist history scholar, multilingual pilgrimage guide");
            InsertGuide("Priya Maharjan",        "+977-9841100008", "priya@guides.np",     "Kathmandu",                   6, "Photography Tour",    "NNMGA-1008", 4.65m, "Professional photographer-guide for cultural tours");
            InsertGuide("Kamal Rai",             "+977-9841100009", "kamal@guides.np",     "Ilam, Ilam",                  9, "Tea & Culture Tour",  "NNMGA-1009", 4.50m, "Eastern Nepal specialist, tea plantation tours");
            InsertGuide("Anita Tamang",          "+977-9841100010", "anita@guides.np",     "Langtang, Rasuwa",           11, "Trekking",             "NNMGA-1010", 4.78m, "Langtang & Tamang Heritage Trail specialist");
            InsertGuide("Bikram Kunwar",         "+977-9841100011", "bikram@guides.np",    "Manang",                     13, "Mountaineering",       "NNMGA-1011", 4.82m, "Annapurna Circuit & Tilicho Lake expert");
            InsertGuide("Sarita Basnet",         "+977-9841100012", "sarita@guides.np",    "Pokhara, Kaski",              5, "Adventure Sports",    "NNMGA-1012", 4.55m, "Paragliding & zip-lining activity guide");
            InsertGuide("Dinesh Bhandari",       "+977-9841100013", "dinesh@guides.np",    "Bandipur, Tanahun",           8, "Heritage Walk",        "NNMGA-1013", 4.62m, "Bandipur heritage & cave exploration guide");
            InsertGuide("Nirmala Shrestha",      "+977-9841100014", "nirmala@guides.np",   "Dhulikhel, Kavre",            7, "Yoga & Wellness",     "NNMGA-1014", 4.68m, "Certified yoga instructor & wellness retreat guide");
            InsertGuide("Rajan Yadav",           "+977-9841100015", "rajan@guides.np",     "Janakpur, Dhanusha",          6, "Pilgrimage",           "NNMGA-1015", 4.45m, "Mithila culture & Janaki temple heritage guide");

            // ================================================================
            //  7. ACTIVITIES  (15 activities across Nepal)
            // ================================================================
            InsertActivity("Everest Base Camp Trek",     "Trekking",       "Lukla / Solukhumbu",    12*24, "Hard",   16,  2, 1500.00m, "The iconic trek to the base of world's highest peak at 5,364m");
            InsertActivity("Annapurna Base Camp Trek",   "Trekking",       "Pokhara / Kaski",       10*24, "Hard",   20,  2, 1200.00m, "Trek through diverse landscapes to Annapurna sanctuary at 4,130m");
            InsertActivity("Chitwan Jungle Safari",      "Wildlife Safari","Chitwan",                    8, "Easy",   30,  2,   85.00m, "Jeep & canoe safari in Chitwan National Park, spot rhinos & tigers");
            InsertActivity("Paragliding in Pokhara",     "Adventure",      "Pokhara",                    1, "Easy",    6,  1,  100.00m, "Tandem paragliding from Sarangkot with Annapurna panorama");
            InsertActivity("Bungee Jumping Bhote Koshi", "Adventure",      "Sindhupalanchok",            1, "Moderate",4,  1,  120.00m, "160m bungee jump over the Bhote Koshi river gorge");
            InsertActivity("White Water Rafting Trishuli","Water Sports",   "Trishuli River",             6, "Moderate",12, 4,   65.00m, "Class III-IV rapids on the Trishuli River near Kathmandu");
            InsertActivity("Kathmandu Heritage Walk",    "Cultural Tour",  "Kathmandu",                  5, "Easy",   15,  1,   35.00m, "Walk through Durbar Square, Swayambhunath, Pashupatinath & Boudhanath");
            InsertActivity("Bhaktapur Pottery Workshop", "Cultural Tour",  "Bhaktapur",                  3, "Easy",   10,  1,   25.00m, "Hands-on pottery making with local artisans in Pottery Square");
            InsertActivity("Mountain Biking Kathmandu",  "Adventure",      "Kathmandu Valley",           6, "Moderate",8,  2,   55.00m, "Downhill ride through Shivapuri forest & Newari villages");
            InsertActivity("Sunrise View at Nagarkot",   "Sightseeing",    "Nagarkot",                   3, "Easy",   20,  1,   20.00m, "Watch sunrise over the Himalayas from Nagarkot tower");
            InsertActivity("Lumbini Pilgrimage Tour",    "Pilgrimage",     "Lumbini",                    6, "Easy",   25,  1,   30.00m, "Visit Maya Devi temple, Ashoka pillar & monastery zone");
            InsertActivity("Zip-lining in Pokhara",      "Adventure",      "Pokhara",                    2, "Easy",    4,  1,   80.00m, "1.8km zip-line from Sarangkot, one of the world's longest");
            InsertActivity("Canyoning in Jalbire",       "Adventure",      "Nuwakot",                    7, "Hard",    8,  2,   95.00m, "Rappelling down waterfalls through lush jungle canyon");
            InsertActivity("Tea Garden Tour Ilam",       "Cultural Tour",  "Ilam",                       4, "Easy",   15,  1,   28.00m, "Tour of Kanyam & Ilam tea estates with tasting session");
            InsertActivity("Cooking Class Nepali Cuisine","Cultural Tour",  "Kathmandu",                  4, "Easy",    8,  1,   40.00m, "Learn to cook momo, dal bhat & sel roti with local chef");

            // ================================================================
            //  8. Link tables: guide_locations, activity_locations
            //     (associate guides & activities with locations)
            // ================================================================
            Execute.Sql(@"
                -- Guide-Location mapping
                INSERT INTO guide_locations (guide_id, location_id, is_primary, notes)
                SELECT g.id, l.id, true, NULL
                FROM guides g
                JOIN locations l ON (
                    (g.full_name = 'Pemba Dorje Sherpa'   AND l.name = 'Namche Bazaar') OR
                    (g.full_name = 'Lakpa Nuru Sherpa'    AND l.name = 'Lukla')         OR
                    (g.full_name = 'Amar Bahadur Gurung'  AND l.name = 'Pokhara')       OR
                    (g.full_name = 'Sanjay Thapa'         AND l.name = 'Kathmandu')     OR
                    (g.full_name = 'Deepa Lama'           AND l.name = 'Bhaktapur')     OR
                    (g.full_name = 'Rajendra Chaudhary'   AND l.name = 'Chitwan')       OR
                    (g.full_name = 'Bishow Pandey'        AND l.name = 'Lumbini')       OR
                    (g.full_name = 'Priya Maharjan'       AND l.name = 'Kathmandu')     OR
                    (g.full_name = 'Kamal Rai'            AND l.name = 'Ilam')          OR
                    (g.full_name = 'Anita Tamang'         AND l.name = 'Kathmandu')     OR
                    (g.full_name = 'Bikram Kunwar'        AND l.name = 'Manang')        OR
                    (g.full_name = 'Sarita Basnet'        AND l.name = 'Pokhara')       OR
                    (g.full_name = 'Dinesh Bhandari'      AND l.name = 'Bandipur')      OR
                    (g.full_name = 'Nirmala Shrestha'     AND l.name = 'Dhulikhel')     OR
                    (g.full_name = 'Rajan Yadav'          AND l.name = 'Janakpur')
                );

                -- Activity-Location mapping
                INSERT INTO activity_locations (activity_id, location_id, is_primary)
                SELECT a.id, l.id, true
                FROM activities a
                JOIN locations l ON (
                    (a.name = 'Everest Base Camp Trek'      AND l.name = 'Lukla')       OR
                    (a.name = 'Annapurna Base Camp Trek'    AND l.name = 'Pokhara')     OR
                    (a.name = 'Chitwan Jungle Safari'       AND l.name = 'Chitwan')     OR
                    (a.name = 'Paragliding in Pokhara'      AND l.name = 'Pokhara')     OR
                    (a.name = 'Bungee Jumping Bhote Koshi'  AND l.name = 'Kathmandu')   OR
                    (a.name = 'White Water Rafting Trishuli' AND l.name = 'Kathmandu')  OR
                    (a.name = 'Kathmandu Heritage Walk'     AND l.name = 'Kathmandu')   OR
                    (a.name = 'Bhaktapur Pottery Workshop'  AND l.name = 'Bhaktapur')   OR
                    (a.name = 'Mountain Biking Kathmandu'   AND l.name = 'Kathmandu')   OR
                    (a.name = 'Sunrise View at Nagarkot'    AND l.name = 'Nagarkot')    OR
                    (a.name = 'Lumbini Pilgrimage Tour'     AND l.name = 'Lumbini')     OR
                    (a.name = 'Zip-lining in Pokhara'       AND l.name = 'Pokhara')     OR
                    (a.name = 'Canyoning in Jalbire'        AND l.name = 'Kathmandu')   OR
                    (a.name = 'Tea Garden Tour Ilam'        AND l.name = 'Ilam')        OR
                    (a.name = 'Cooking Class Nepali Cuisine' AND l.name = 'Kathmandu')
                );

                -- Also set location_id FK on hotels table
                UPDATE hotels SET location_id = l.id
                FROM locations l
                WHERE hotels.location = l.name
                  AND hotels.location_id IS NULL;

                -- Set location_id FK on activities table
                UPDATE activities SET location_id = l.id
                FROM locations l
                WHERE activities.location = l.name
                  AND activities.location_id IS NULL;
            ");
        }

        public override void Down()
        {
            // Remove in reverse dependency order
            Execute.Sql(@"
                -- Remove link table rows for seeded data
                DELETE FROM activity_locations WHERE activity_id IN (SELECT id FROM activities WHERE tenant_id = 1 AND created_by = 1);
                DELETE FROM guide_locations WHERE guide_id IN (SELECT id FROM guides WHERE tenant_id = 1 AND created_by = 1);

                -- Remove hotel rooms for seeded hotels
                DELETE FROM hotel_rooms WHERE hotel_id IN (SELECT id FROM hotels WHERE tenant_id = 1 AND created_by = 1);

                -- Remove main inventory rows
                DELETE FROM activities WHERE tenant_id = 1 AND created_by = 1;
                DELETE FROM guides WHERE tenant_id = 1 AND created_by = 1;
                DELETE FROM vehicles WHERE tenant_id = 1 AND created_by = 1;
                DELETE FROM hotels WHERE tenant_id = 1 AND created_by = 1;

                -- Remove seasons & locations
                DELETE FROM seasons WHERE tenant_id = 1 AND created_by = 1;
                DELETE FROM locations WHERE tenant_id = 1 AND created_by = 1;
            ");
        }

        // ── Helper methods ──────────────────────────────────────────────

        private void InsertLocation(string name, string code, string country, string region,
            double lat, double lng, decimal costMultiplier, string timezone, string description)
        {
            Insert.IntoTable("locations").Row(new
            {
                tenant_id = Tenant, name, code, country, region,
                latitude = (decimal)lat, longitude = (decimal)lng, cost_multiplier = costMultiplier,
                timezone, description, is_active = true,
                created_at = SystemMethods.CurrentUTCDateTime,
                updated_at = SystemMethods.CurrentUTCDateTime,
                created_by = (long)CreatedBy
            });
        }

        private void InsertHotel(string name, string location, string address,
            string contactPerson, string phone, string email, int starRating,
            string category, string description)
        {
            Insert.IntoTable("hotels").Row(new
            {
                name, location, address, contact_person = contactPerson,
                phone, email, star_rating = starRating, category, description,
                is_active = true,
                created_at = SystemMethods.CurrentUTCDateTime,
                updated_at = SystemMethods.CurrentUTCDateTime,
                created_by = CreatedBy,
                tenant_id = Tenant
            });
        }

        private void InsertVehicle(string vehicleType, string model, string regNumber,
            int capacity, decimal pricePerDay, decimal pricePerKm,
            string driverName, string driverContact, string description)
        {
            Insert.IntoTable("vehicles").Row(new
            {
                vehicle_type = vehicleType, model, registration_number = regNumber,
                capacity, price_per_day = pricePerDay, price_per_km = pricePerKm,
                driver_name = driverName, driver_contact = driverContact,
                description, is_active = true, base_currency = "USD",
                created_at = SystemMethods.CurrentUTCDateTime,
                updated_at = SystemMethods.CurrentUTCDateTime,
                created_by = CreatedBy,
                tenant_id = Tenant
            });
        }

        private void InsertGuide(string fullName, string phone, string email, string address,
            int experienceYears, string specialization, string certNumber,
            decimal rating, string bio)
        {
            Insert.IntoTable("guides").Row(new
            {
                full_name = fullName, phone, email, address,
                experience_years = experienceYears,
                specialization, certification_number = certNumber,
                price_per_day = 50.00m + (experienceYears * 5m), // price scales with experience
                rating, bio, is_active = true, base_currency = "USD",
                created_at = SystemMethods.CurrentUTCDateTime,
                updated_at = SystemMethods.CurrentUTCDateTime,
                created_by = CreatedBy,
                tenant_id = Tenant
            });
        }

        private void InsertActivity(string name, string activityType, string location,
            int durationHours, string difficultyLevel, int maxParticipants,
            int minParticipants, decimal pricePerPerson, string description)
        {
            Insert.IntoTable("activities").Row(new
            {
                name, activity_type = activityType, location,
                duration_hours = durationHours, difficulty_level = difficultyLevel,
                max_participants = maxParticipants, min_participants = minParticipants,
                price_per_person = pricePerPerson, description,
                is_active = true, is_mandatory = false, base_currency = "USD",
                created_at = SystemMethods.CurrentUTCDateTime,
                updated_at = SystemMethods.CurrentUTCDateTime,
                created_by = CreatedBy,
                tenant_id = Tenant
            });
        }
    }
}
