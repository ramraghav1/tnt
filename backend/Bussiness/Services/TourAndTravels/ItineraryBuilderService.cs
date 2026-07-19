using System.Collections.Generic;
using Repository.Interfaces.TourAndTravels;
using static Domain.Models.TourAndTravels.ItineraryBuilder;

namespace Bussiness.Services.TourAndTravels
{
    public interface IItineraryBuilderService
    {
        BuilderResponse Save(SaveBuilderRequest request, long tenantId, long userId);
        BuilderResponse? Update(long id, SaveBuilderRequest request, long userId);
        BuilderResponse? GetById(long id);
        List<BuilderListItem> GetAll(long tenantId);
        bool Delete(long id);
        bool UpdateStatus(long id, string status);
        PricingSummary CalculatePricing(BuilderResponse itinerary, long tenantId);
    }

    public class ItineraryBuilderService : IItineraryBuilderService
    {
        private readonly IItineraryBuilderRepository _repo;
        private readonly ISeasonRepository _seasonRepo;
        private readonly ILocationRepository _locationRepo;

        public ItineraryBuilderService(
            IItineraryBuilderRepository repo,
            ISeasonRepository seasonRepo,
            ILocationRepository locationRepo)
        {
            _repo = repo;
            _seasonRepo = seasonRepo;
            _locationRepo = locationRepo;
        }

        public BuilderResponse Save(SaveBuilderRequest request, long tenantId, long userId)
            => _repo.Save(request, tenantId, userId);

        public BuilderResponse? Update(long id, SaveBuilderRequest request, long userId)
            => _repo.Update(id, request, userId);

        public BuilderResponse? GetById(long id)
            => _repo.GetById(id);

        public List<BuilderListItem> GetAll(long tenantId)
            => _repo.GetAll(tenantId);

        public bool Delete(long id) => _repo.Delete(id);

        public bool UpdateStatus(long id, string status)
            => _repo.UpdateStatus(id, status);

        public PricingSummary CalculatePricing(BuilderResponse itinerary, long tenantId)
        {
            decimal accommodation = 0, transport = 0, activities = 0, meals = 0, guide = 0, others = 0;

            foreach (var day in itinerary.Days)
            {
                foreach (var item in day.Items)
                {
                    decimal cost = item.UnitPrice * item.Quantity;
                    switch (item.ItemType.ToLower())
                    {
                        case "hotel": accommodation += cost; break;
                        case "transport": transport += cost; break;
                        case "activity": activities += cost; break;
                        case "meal": meals += cost; break;
                        case "guide": guide += cost; break;
                        default: others += cost; break;
                    }
                }
            }

            // Season multiplier
            decimal seasonMultiplier = 1.0m;
            string? seasonName = null;
            if (itinerary.SeasonId.HasValue)
            {
                var season = _seasonRepo.GetById(itinerary.SeasonId.Value);
                if (season != null)
                {
                    seasonMultiplier = season.PriceMultiplier;
                    seasonName = $"{season.Name} ({season.PriceMultiplier:0.00}x)";
                }
            }

            // Location multiplier (average across days)
            decimal locationMultiplier = 1.0m;
            var locationIds = itinerary.Days
                .Where(d => d.LocationId.HasValue)
                .Select(d => d.LocationId!.Value)
                .Distinct()
                .ToList();

            if (locationIds.Any())
            {
                var locations = _locationRepo.GetAll(tenantId)
                    .Where(l => locationIds.Contains(l.Id))
                    .ToList();

                if (locations.Any())
                    locationMultiplier = locations.Average(l => l.CostMultiplier);
            }

            decimal totalMultiplier = seasonMultiplier * locationMultiplier;
            decimal subtotal = (accommodation + transport + activities + meals + guide + others) * totalMultiplier;
            decimal markupAmount = subtotal * itinerary.MarkupPercentage / 100m;
            decimal total = subtotal + markupAmount;
            int numPax = itinerary.NumPax > 0 ? itinerary.NumPax : 2;

            return new PricingSummary
            {
                Accommodation = accommodation,
                Transport = transport,
                Activities = activities,
                Meals = meals,
                Guide = guide,
                Others = others,
                Subtotal = Math.Round(subtotal, 2),
                MarkupPercentage = itinerary.MarkupPercentage,
                MarkupAmount = Math.Round(markupAmount, 2),
                TotalEstimatedPrice = Math.Round(total, 2),
                PricePerPerson = Math.Round(total / numPax, 2),
                NumPax = numPax,
                SeasonName = seasonName,
                SeasonMultiplier = seasonMultiplier,
                LocationMultiplier = Math.Round(locationMultiplier, 2),
                TotalMultiplier = Math.Round(totalMultiplier, 2)
            };
        }
    }
}
