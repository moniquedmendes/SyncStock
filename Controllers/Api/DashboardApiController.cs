using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SyncStock.Contracts.Dashboard;
using SyncStock.Services.Dashboard;

namespace SyncStock.Controllers.Api;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public sealed class DashboardApiController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardApiController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryResponse>> GetSummary(
        CancellationToken cancellationToken)
    {
        return Ok(await _dashboardService.GetSummaryAsync(cancellationToken));
    }
}
