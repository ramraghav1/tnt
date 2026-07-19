using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Bussiness.Services.TourAndTravels;
using Repository.Repositories;
using static Domain.Models.TourAndTravels.ItineraryBuilder;

namespace server.Controller.TourAndTravels
{
    [ApiController]
    [Authorize]
    [Route("api/itinerary-builder")]
    public class ItineraryBuilderController : ControllerBase
    {
        private readonly IItineraryBuilderService _service;
        private readonly ITenantProvider _tenantProvider;

        public ItineraryBuilderController(IItineraryBuilderService service, ITenantProvider tenantProvider)
        {
            _service = service;
            _tenantProvider = tenantProvider;
        }

        private long GetTenantId() => _tenantProvider.GetTenantId() ?? 1;
        private long GetUserId() =>
            long.TryParse(User?.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 1;

        // POST api/itinerary-builder
        [HttpPost]
        public ActionResult<BuilderResponse> Save([FromBody] SaveBuilderRequest request)
        {
            var result = _service.Save(request, GetTenantId(), GetUserId());
            return Ok(result);
        }

        // PUT api/itinerary-builder/{id}
        [HttpPut("{id}")]
        public ActionResult<BuilderResponse> Update(long id, [FromBody] SaveBuilderRequest request)
        {
            var result = _service.Update(id, request, GetUserId());
            if (result == null) return NotFound();
            return Ok(result);
        }

        // GET api/itinerary-builder/{id}
        [HttpGet("{id}")]
        public ActionResult<BuilderResponse> GetById(long id)
        {
            var result = _service.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // GET api/itinerary-builder
        [HttpGet]
        public ActionResult<List<BuilderListItem>> GetAll() =>
            Ok(_service.GetAll(GetTenantId()));

        // DELETE api/itinerary-builder/{id}
        [HttpDelete("{id}")]
        public IActionResult Delete(long id) =>
            _service.Delete(id) ? Ok() : NotFound();

        // PATCH api/itinerary-builder/{id}/status
        [HttpPatch("{id}/status")]
        public IActionResult UpdateStatus(long id, [FromQuery] string status) =>
            _service.UpdateStatus(id, status) ? Ok() : NotFound();

        // POST api/itinerary-builder/{id}/pricing
        [HttpPost("{id}/pricing")]
        public ActionResult<PricingSummary> CalculatePricing(long id)
        {
            var itinerary = _service.GetById(id);
            if (itinerary == null) return NotFound();
            var pricing = _service.CalculatePricing(itinerary, GetTenantId());
            return Ok(pricing);
        }

        // POST api/itinerary-builder/pricing-preview
        [HttpPost("pricing-preview")]
        public ActionResult<PricingSummary> PricingPreview([FromBody] BuilderResponse data)
        {
            var pricing = _service.CalculatePricing(data, GetTenantId());
            return Ok(pricing);
        }
    }
}
