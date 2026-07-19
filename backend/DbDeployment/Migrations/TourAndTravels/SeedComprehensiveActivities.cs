using FluentMigrator;

namespace DbDeployment.Migrations.TourAndTravels
{
    /// <summary>
    /// Seeds 60+ comprehensive Nepal activities covering:
    ///   - Sightseeing (temples, stupas, pagodas, viewpoints, heritage sites)
    ///   - Trekking (all major trails)
    ///   - Adventure (rafting, bungee, zip-line, ultralight, rock climbing)
    ///   - Cultural Tours (museums, workshops, festivals)
    ///   - Wildlife (safari, bird watching)
    ///   - Pilgrimage (Hindu, Buddhist, multi-faith)
    ///   - Water Sports (kayaking, canoeing, boating)
    ///   - Wellness (yoga, meditation, spa)
    ///   - Food & Drink (food tours, cooking, distillery)
    ///   - Photography Tours
    ///
    /// Also fixes the "Kathmandau" typo and maps all activities to locations.
    /// Down() removes all rows inserted here.
    /// </summary>
    [Migration(202605030003)]
    public class SeedComprehensiveActivities : Migration
    {
        private const long Tenant = 1;
        private const int CreatedBy = 1;

        public override void Up()
        {
            // ── Fix typo: "Kathmandau" → merge into "Kathmandu" ──
            Execute.Sql(@"
                UPDATE locations SET name = 'Kathmandu' WHERE name = 'Kathmandau' AND NOT EXISTS (
                    SELECT 1 FROM locations WHERE name = 'Kathmandu' AND tenant_id = 2
                );
            ");

            // ════════════════════════════════════════════════════════════════
            //  SIGHTSEEING activities (temples, stupas, heritage sites)
            // ════════════════════════════════════════════════════════════════

            // -- Kathmandu Valley Sightseeing --
            Act("Pashupatinath Temple Visit",        "Sightseeing", "Kathmandu",      3, "Easy",  30, 1, 15.00m, "Visit the holiest Hindu temple dedicated to Lord Shiva, UNESCO World Heritage Site on the banks of Bagmati River");
            Act("Boudhanath Stupa Visit",            "Sightseeing", "Kathmandu",      2, "Easy",  30, 1, 12.00m, "Explore the largest spherical stupa in Nepal, center of Tibetan Buddhism with prayer wheels and monasteries");
            Act("Swayambhunath (Monkey Temple)",      "Sightseeing", "Kathmandu",      2, "Easy",  25, 1, 10.00m, "Climb 365 steps to the ancient hilltop stupa with panoramic valley views and playful monkeys");
            Act("Kathmandu Durbar Square Tour",       "Sightseeing", "Kathmandu",      3, "Easy",  20, 1, 18.00m, "Explore ancient royal palace complex with Kumari Ghar (Living Goddess house), Taleju Temple, and Kasthamandap");
            Act("Patan Durbar Square Tour",           "Sightseeing", "Kathmandu",      3, "Easy",  20, 1, 15.00m, "Visit the finest example of Newari architecture with Krishna Mandir, Golden Temple, and the Patan Museum");
            Act("Garden of Dreams Visit",             "Sightseeing", "Kathmandu",      1, "Easy",  40, 1,  5.00m, "Stroll through the beautifully restored neo-classical garden, a peaceful oasis in the heart of Thamel");
            Act("Changu Narayan Temple Trek",         "Sightseeing", "Kathmandu",      4, "Easy",  15, 1, 20.00m, "Visit the oldest Hindu temple in Nepal (4th century) perched on a hilltop with valley views");
            Act("Budhanilkantha Sleeping Vishnu",     "Sightseeing", "Kathmandu",      2, "Easy",  30, 1,  8.00m, "See the 5-meter reclining statue of Lord Vishnu lying on a bed of serpents in a water tank");

            // -- Bhaktapur Sightseeing --
            Act("Bhaktapur Durbar Square Tour",       "Sightseeing", "Bhaktapur",      4, "Easy",  20, 1, 20.00m, "Explore the best-preserved Durbar Square with 55-Window Palace, Golden Gate, and Nyatapola Temple");
            Act("Nyatapola Pagoda Visit",             "Sightseeing", "Bhaktapur",      1, "Easy",  30, 1,  8.00m, "Admire Nepal's tallest pagoda temple (5-story) with guardian stone figures on each level");
            Act("Dattatreya Square Heritage Walk",    "Sightseeing", "Bhaktapur",      2, "Easy",  20, 1, 10.00m, "Wander the oldest square in Bhaktapur with Dattatreya Temple, Peacock Window, and woodcarving museums");

            // -- Pokhara Sightseeing --
            Act("Sarangkot Sunrise Viewpoint",        "Sightseeing", "Pokhara",        3, "Easy",  30, 1, 15.00m, "Early morning drive to Sarangkot for breathtaking sunrise over Annapurna, Machapuchare, and Dhaulagiri");
            Act("Phewa Lake Boating",                 "Sightseeing", "Pokhara",        2, "Easy",  20, 1, 10.00m, "Row boat on Phewa Lake with reflection of Machapuchare, visit Tal Barahi island temple");
            Act("Davis Falls & Gupteshwor Cave",      "Sightseeing", "Pokhara",        2, "Easy",  30, 1,  8.00m, "See the waterfall plunging into an underground tunnel, then explore the sacred cave with Shiva shrine");
            Act("World Peace Pagoda Hike",            "Sightseeing", "Pokhara",        4, "Moderate", 20, 1, 12.00m, "Hike or boat+hike to the Japanese-built white stupa with stunning lake and mountain panorama");
            Act("International Mountain Museum",      "Sightseeing", "Pokhara",        2, "Easy",  30, 1, 10.00m, "Museum showcasing mountaineering history, Himalayan geology, and equipment of legendary climbers");
            Act("Bindhyabasini Temple Visit",         "Sightseeing", "Pokhara",        1, "Easy",  25, 1,  5.00m, "Visit Pokhara's oldest and most important Hindu temple dedicated to Goddess Bhagwati");

            // -- Nagarkot & Dhulikhel Sightseeing --
            Act("Nagarkot Panoramic Tower Visit",     "Sightseeing", "Nagarkot",       2, "Easy",  25, 1,  8.00m, "Visit the viewing tower for 360° views of Himalayan range from Annapurna to Everest");
            Act("Dhulikhel Sunrise & Heritage Walk",  "Sightseeing", "Dhulikhel",      4, "Easy",  15, 1, 15.00m, "Watch Himalayan sunrise then walk through Newari town visiting Kali Temple and Vishnu Temple");

            // -- Lumbini Sightseeing --
            Act("Maya Devi Temple & Sacred Garden",   "Sightseeing", "Lumbini",        3, "Easy",  30, 1, 12.00m, "Visit the exact birthplace of Buddha with the sacred pond, Ashoka pillar, and ancient ruins");
            Act("Lumbini Monastery Zone Tour",        "Sightseeing", "Lumbini",        4, "Easy",  20, 1, 10.00m, "Tour monasteries from 25+ countries including Myanmar Golden Temple, Korean monastery, and Thai temple");

            // -- Janakpur Sightseeing --
            Act("Janaki Mandir Temple Visit",         "Sightseeing", "Janakpur",       2, "Easy",  30, 1,  8.00m, "Visit the stunning Mughal-Rajput style marble temple dedicated to Goddess Sita (Janaki)");
            Act("Ram Janaki Bibaha Mandap Visit",     "Sightseeing", "Janakpur",       1, "Easy",  30, 1,  5.00m, "See the sacred marriage pavilion of Lord Ram and Sita, an important Hindu pilgrimage site");

            // -- Bandipur & Tansen Sightseeing --
            Act("Bandipur Heritage Walking Tour",     "Sightseeing", "Bandipur",       3, "Easy",  15, 1, 12.00m, "Walk the car-free hilltop bazaar with Newari architecture, Thani Mai temple, and Siddha Gufa cave viewpoint");
            Act("Tansen Durbar & Amar Narayan Temple","Sightseeing", "Tansen",         3, "Easy",  15, 1, 10.00m, "Tour the Palpa Durbar (Tansen palace), Amar Narayan pagoda temple, and panoramic Srinagar hill viewpoint");

            // -- Gorkha Sightseeing --
            Act("Gorkha Palace (Gorkha Durbar) Visit","Sightseeing", "Gorkha",         3, "Moderate", 15, 1, 12.00m, "Climb to the hilltop fortress-palace of Prithvi Narayan Shah, birthplace of unified Nepal, with Himalayan views");

            // ════════════════════════════════════════════════════════════════
            //  TREKKING activities
            // ════════════════════════════════════════════════════════════════
            Act("Langtang Valley Trek",              "Trekking", "Kathmandu",     7*24, "Hard",   15, 2, 900.00m, "Trek through Langtang National Park to Kyanjin Gompa (3,870m) with Langtang Lirung views");
            Act("Ghorepani Poon Hill Trek",          "Trekking", "Pokhara",       4*24, "Moderate",20, 2, 500.00m, "Short classic trek to Poon Hill (3,210m) for Annapurna & Dhaulagiri sunrise panorama");
            Act("Mardi Himal Trek",                  "Trekking", "Pokhara",       5*24, "Moderate",15, 2, 600.00m, "Off-the-beaten-path trek with stunning close-up views of Machapuchare fish tail");
            Act("Manaslu Circuit Trek",              "Trekking", "Kathmandu",    14*24, "Hard",   10, 2,1800.00m, "Remote restricted-area trek around 8th highest peak crossing Larkya La Pass (5,160m)");
            Act("Upper Mustang Trek",                "Trekking", "Pokhara",      12*24, "Hard",    8, 2,2200.00m, "Restricted area trek to the ancient walled city of Lo Manthang, former Tibetan kingdom");
            Act("Annapurna Circuit Trek",            "Trekking", "Pokhara",      14*24, "Hard",   15, 2,1600.00m, "Classic loop through diverse landscapes crossing Thorong La Pass (5,416m), highest pass trek");
            Act("Tamang Heritage Trail",             "Trekking", "Kathmandu",     5*24, "Moderate",12, 2, 450.00m, "Cultural trek through Tamang villages near Langtang with homestays and monastery visits");

            // ════════════════════════════════════════════════════════════════
            //  ADVENTURE activities
            // ════════════════════════════════════════════════════════════════
            Act("Ultralight Flight Pokhara",         "Adventure", "Pokhara",          1, "Easy",   2, 1, 130.00m, "15-minute ultralight aircraft flight over Phewa Lake with Annapurna range panorama");
            Act("Rock Climbing Nagarjun",            "Adventure", "Kathmandu",        5, "Hard",   8, 2,  60.00m, "Rock climbing at Nagarjun Forest cliff faces, multiple routes from beginner to advanced");
            Act("Helicopter Tour to Everest",        "Adventure", "Kathmandu",        4, "Easy",   6, 1, 350.00m, "Scenic helicopter flight to Everest Base Camp or Kala Patthar with landing at 5,545m");
            Act("Hot Air Balloon Pokhara",           "Adventure", "Pokhara",          1, "Easy",   4, 1,  90.00m, "Tethered hot air balloon ride with 360° views of Pokhara Valley and Annapurna range");
            Act("ATV/Quad Biking Pokhara",           "Adventure", "Pokhara",          3, "Moderate",6, 1,  55.00m, "Off-road ATV ride through trails around Pokhara lakeside, farms, and forest paths");
            Act("Microlight Flight Pokhara",         "Adventure", "Pokhara",          1, "Easy",   2, 1, 110.00m, "30-minute microlight flight over Pokhara with Himalayan backdrop photography opportunity");

            // ════════════════════════════════════════════════════════════════
            //  CULTURAL TOUR activities
            // ════════════════════════════════════════════════════════════════
            Act("Newari Cultural Feast & Dance",     "Cultural Tour", "Bhaktapur",    3, "Easy",  20, 1,  35.00m, "Traditional Newari feast with beaten rice, buffalo curry, local beer & masked dance performance");
            Act("Thanka Painting Class",             "Cultural Tour", "Kathmandu",    4, "Easy",   8, 1,  45.00m, "Learn traditional Buddhist Thanka painting technique from master artists in Boudha area");
            Act("Panauti Heritage Village Tour",     "Cultural Tour", "Dhulikhel",    3, "Easy",  15, 1,  20.00m, "Explore one of Nepal's oldest towns with Indreshwar Mahadev temple & riverside cremation ghats");
            Act("Kirtipur Heritage Tour",            "Cultural Tour", "Kathmandu",    3, "Easy",  15, 1,  18.00m, "Visit the ancient hilltop Newari city with Bagh Bhairab temple and University campus views");
            Act("Handmade Paper & Lokta Workshop",   "Cultural Tour", "Bhaktapur",    2, "Easy",  10, 1,  22.00m, "Learn traditional Nepali lokta paper making and take home your handmade paper creations");
            Act("Thamel Night Food Walk",            "Food Tour",     "Kathmandu",    3, "Easy",  12, 1,  30.00m, "Evening guided food tour through Thamel tasting momo, chatamari, yomari, sel roti, and local drinks");
            Act("Nepali Spice Market Tour",          "Food Tour",     "Kathmandu",    2, "Easy",  15, 1,  15.00m, "Walk through Asan Bazaar's spice stalls learning about Nepali spices, herbs, and traditional medicine");

            // ════════════════════════════════════════════════════════════════
            //  WILDLIFE & NATURE activities
            // ════════════════════════════════════════════════════════════════
            Act("Elephant Breeding Center Visit",    "Wildlife Safari","Chitwan",      2, "Easy",  30, 1, 10.00m, "Visit the elephant breeding center in Sauraha to see baby elephants and learn about conservation");
            Act("Bird Watching Chitwan",             "Wildlife Safari","Chitwan",      4, "Easy",  12, 2, 40.00m, "Early morning bird watching tour in Chitwan National Park, home to 500+ species including rare hornbills");
            Act("Tharu Cultural Dance Show",         "Cultural Tour",  "Chitwan",      2, "Easy",  50, 1, 10.00m, "Evening performance of the traditional Tharu stick dance and peacock dance by local Tharu community");
            Act("Canoe Ride on Rapti River",         "Wildlife Safari","Chitwan",      2, "Easy",  15, 2, 20.00m, "Dugout canoe ride on Rapti River spotting mugger crocodiles, gharials, and waterbirds");
            Act("Koshi Tappu Bird Watching",         "Wildlife Safari","Kathmandu",    8, "Easy",   8, 2, 85.00m, "Full-day excursion to eastern Nepal's premier wetland bird sanctuary, 450+ migratory species");

            // ════════════════════════════════════════════════════════════════
            //  PILGRIMAGE activities
            // ════════════════════════════════════════════════════════════════
            Act("Muktinath Temple Pilgrimage",       "Pilgrimage", "Pokhara",         8, "Moderate",20, 1, 120.00m, "Visit the sacred Muktinath temple (3,710m) holy to both Hindus and Buddhists, 108 water spouts");
            Act("Manakamana Temple Cable Car",       "Pilgrimage", "Kathmandu",       5, "Easy",  30, 1,  25.00m, "Cable car ride to the wish-fulfilling Manakamana Goddess temple atop a ridge in Gorkha district");
            Act("Gosaikunda Holy Lake Trek",         "Pilgrimage", "Kathmandu",       5*24, "Hard", 12, 2, 700.00m, "Trek to the sacred alpine lake (4,380m) dedicated to Lord Shiva, major Janai Purnima pilgrimage site");
            Act("Halesi Mahadev Cave Pilgrimage",    "Pilgrimage", "Kathmandu",       8, "Moderate",15, 1,  45.00m, "Visit the holy cave temple in Khotang revered by Hindus as Shiva's abode and Buddhists as Guru Rinpoche's meditation cave");

            // ════════════════════════════════════════════════════════════════
            //  WATER SPORTS activities
            // ════════════════════════════════════════════════════════════════
            Act("Kayaking on Phewa Lake",            "Water Sports", "Pokhara",       2, "Easy",   6, 1, 25.00m, "Single or double kayak on Phewa Lake with Annapurna range as backdrop, beginner-friendly");
            Act("Rafting on Bhote Koshi",            "Water Sports", "Kathmandu",     6, "Hard",  10, 4, 85.00m, "Intense Class IV-V rapids on Nepal's steepest rafting river near Tibet border");
            Act("Rafting on Seti River",             "Water Sports", "Pokhara",       4, "Easy",  12, 4, 45.00m, "Family-friendly Class II-III rafting on the Seti River with beautiful gorge scenery");
            Act("Stand-Up Paddleboarding Phewa",     "Water Sports", "Pokhara",       2, "Easy",   8, 1, 20.00m, "SUP on Phewa Lake, great for beginners with calm water and mountain reflections");

            // ════════════════════════════════════════════════════════════════
            //  WELLNESS activities
            // ════════════════════════════════════════════════════════════════
            Act("Yoga Retreat Pokhara",              "Wellness", "Pokhara",           6, "Easy",  15, 1, 35.00m, "Morning yoga and meditation session with lake and mountain views, certified instructor");
            Act("Ayurvedic Spa Kathmandu",           "Wellness", "Kathmandu",        3, "Easy",   4, 1, 45.00m, "Traditional Ayurvedic massage and herbal steam bath at premium spa in Thamel area");
            Act("Meditation at Kopan Monastery",     "Wellness", "Kathmandu",        4, "Easy",  20, 1, 20.00m, "Guided meditation session at the famous Kopan Buddhist monastery overlooking Boudhanath");
            Act("Yoga & Wellness Retreat Dhulikhel", "Wellness", "Dhulikhel",        6, "Easy",  10, 1, 50.00m, "Full-day wellness retreat with yoga, meditation, organic meals, and Himalayan panoramic views");

            // ════════════════════════════════════════════════════════════════
            //  PHOTOGRAPHY TOUR activities
            // ════════════════════════════════════════════════════════════════
            Act("Kathmandu Street Photography Tour", "Photography Tour","Kathmandu",  4, "Easy",  8, 1, 40.00m, "Guided photography walk through Asan, Indra Chowk, and Durbar Square capturing daily life and architecture");
            Act("Himalayan Sunrise Photo Trek",      "Photography Tour","Nagarkot",   5, "Moderate",8, 1, 55.00m, "Pre-dawn trek to best Nagarkot vantage points for golden hour Himalayan panorama photography");

            // ════════════════════════════════════════════════════════════════
            //  Map ALL new activities to locations (activity_locations table)
            // ════════════════════════════════════════════════════════════════
            Execute.Sql(@"
                -- Map activities to locations by matching activity.location to locations.name
                INSERT INTO activity_locations (activity_id, location_id, is_primary)
                SELECT a.id, l.id, true
                FROM activities a
                JOIN locations l ON a.location = l.name
                WHERE a.created_by = 1
                  AND a.id NOT IN (SELECT activity_id FROM activity_locations)
                ON CONFLICT DO NOTHING;

                -- Also update the location_id FK on activities table
                UPDATE activities SET location_id = l.id
                FROM locations l
                WHERE activities.location = l.name
                  AND activities.location_id IS NULL;
            ");
        }

        public override void Down()
        {
            Execute.Sql(@"
                -- Remove activity_locations for new activities
                DELETE FROM activity_locations WHERE activity_id IN (
                    SELECT id FROM activities WHERE tenant_id = 1 AND created_by = 1 AND name IN (
                        'Pashupatinath Temple Visit','Boudhanath Stupa Visit','Swayambhunath (Monkey Temple)',
                        'Kathmandu Durbar Square Tour','Patan Durbar Square Tour','Garden of Dreams Visit',
                        'Changu Narayan Temple Trek','Budhanilkantha Sleeping Vishnu',
                        'Bhaktapur Durbar Square Tour','Nyatapola Pagoda Visit','Dattatreya Square Heritage Walk',
                        'Sarangkot Sunrise Viewpoint','Phewa Lake Boating','Davis Falls & Gupteshwor Cave',
                        'World Peace Pagoda Hike','International Mountain Museum','Bindhyabasini Temple Visit',
                        'Nagarkot Panoramic Tower Visit','Dhulikhel Sunrise & Heritage Walk',
                        'Maya Devi Temple & Sacred Garden','Lumbini Monastery Zone Tour',
                        'Janaki Mandir Temple Visit','Ram Janaki Bibaha Mandap Visit',
                        'Bandipur Heritage Walking Tour','Tansen Durbar & Amar Narayan Temple',
                        'Gorkha Palace (Gorkha Durbar) Visit',
                        'Langtang Valley Trek','Ghorepani Poon Hill Trek','Mardi Himal Trek',
                        'Manaslu Circuit Trek','Upper Mustang Trek','Annapurna Circuit Trek','Tamang Heritage Trail',
                        'Ultralight Flight Pokhara','Rock Climbing Nagarjun','Helicopter Tour to Everest',
                        'Hot Air Balloon Pokhara','ATV/Quad Biking Pokhara','Microlight Flight Pokhara',
                        'Newari Cultural Feast & Dance','Thanka Painting Class','Panauti Heritage Village Tour',
                        'Kirtipur Heritage Tour','Handmade Paper & Lokta Workshop',
                        'Thamel Night Food Walk','Nepali Spice Market Tour',
                        'Elephant Breeding Center Visit','Bird Watching Chitwan','Tharu Cultural Dance Show',
                        'Canoe Ride on Rapti River','Koshi Tappu Bird Watching',
                        'Muktinath Temple Pilgrimage','Manakamana Temple Cable Car',
                        'Gosaikunda Holy Lake Trek','Halesi Mahadev Cave Pilgrimage',
                        'Kayaking on Phewa Lake','Rafting on Bhote Koshi','Rafting on Seti River',
                        'Stand-Up Paddleboarding Phewa',
                        'Yoga Retreat Pokhara','Ayurvedic Spa Kathmandu','Meditation at Kopan Monastery',
                        'Yoga & Wellness Retreat Dhulikhel',
                        'Kathmandu Street Photography Tour','Himalayan Sunrise Photo Trek'
                    )
                );

                -- Remove the activities themselves
                DELETE FROM activities WHERE tenant_id = 1 AND created_by = 1 AND name IN (
                    'Pashupatinath Temple Visit','Boudhanath Stupa Visit','Swayambhunath (Monkey Temple)',
                    'Kathmandu Durbar Square Tour','Patan Durbar Square Tour','Garden of Dreams Visit',
                    'Changu Narayan Temple Trek','Budhanilkantha Sleeping Vishnu',
                    'Bhaktapur Durbar Square Tour','Nyatapola Pagoda Visit','Dattatreya Square Heritage Walk',
                    'Sarangkot Sunrise Viewpoint','Phewa Lake Boating','Davis Falls & Gupteshwor Cave',
                    'World Peace Pagoda Hike','International Mountain Museum','Bindhyabasini Temple Visit',
                    'Nagarkot Panoramic Tower Visit','Dhulikhel Sunrise & Heritage Walk',
                    'Maya Devi Temple & Sacred Garden','Lumbini Monastery Zone Tour',
                    'Janaki Mandir Temple Visit','Ram Janaki Bibaha Mandap Visit',
                    'Bandipur Heritage Walking Tour','Tansen Durbar & Amar Narayan Temple',
                    'Gorkha Palace (Gorkha Durbar) Visit',
                    'Langtang Valley Trek','Ghorepani Poon Hill Trek','Mardi Himal Trek',
                    'Manaslu Circuit Trek','Upper Mustang Trek','Annapurna Circuit Trek','Tamang Heritage Trail',
                    'Ultralight Flight Pokhara','Rock Climbing Nagarjun','Helicopter Tour to Everest',
                    'Hot Air Balloon Pokhara','ATV/Quad Biking Pokhara','Microlight Flight Pokhara',
                    'Newari Cultural Feast & Dance','Thanka Painting Class','Panauti Heritage Village Tour',
                    'Kirtipur Heritage Tour','Handmade Paper & Lokta Workshop',
                    'Thamel Night Food Walk','Nepali Spice Market Tour',
                    'Elephant Breeding Center Visit','Bird Watching Chitwan','Tharu Cultural Dance Show',
                    'Canoe Ride on Rapti River','Koshi Tappu Bird Watching',
                    'Muktinath Temple Pilgrimage','Manakamana Temple Cable Car',
                    'Gosaikunda Holy Lake Trek','Halesi Mahadev Cave Pilgrimage',
                    'Kayaking on Phewa Lake','Rafting on Bhote Koshi','Rafting on Seti River',
                    'Stand-Up Paddleboarding Phewa',
                    'Yoga Retreat Pokhara','Ayurvedic Spa Kathmandu','Meditation at Kopan Monastery',
                    'Yoga & Wellness Retreat Dhulikhel',
                    'Kathmandu Street Photography Tour','Himalayan Sunrise Photo Trek'
                );
            ");
        }

        // ── Helper ──
        private void Act(string name, string activityType, string location,
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
