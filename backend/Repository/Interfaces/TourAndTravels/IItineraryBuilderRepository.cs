using System.Collections.Generic;
using static Domain.Models.TourAndTravels.ItineraryBuilder;

namespace Repository.Interfaces.TourAndTravels
{
    public interface IItineraryBuilderRepository
    {
        BuilderResponse Save(SaveBuilderRequest request, long tenantId, long userId);
        BuilderResponse? Update(long id, SaveBuilderRequest request, long userId);
        BuilderResponse? GetById(long id);
        List<BuilderListItem> GetAll(long tenantId);
        bool Delete(long id);
        bool UpdateStatus(long id, string status);
    }
}
