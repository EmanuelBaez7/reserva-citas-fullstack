using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Application.Services;

namespace ObsidianArchitect.API.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public class AdminDashboardController : ControllerBase
{
    private readonly AdminDashboardService _dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<DashboardOverviewDto>> GetOverview()
    {
        var data = await _dashboardService.GetOverviewAsync();
        return Ok(data);
    }

    [HttpGet("activity")]
    public async Task<ActionResult<DashboardActivityDto>> GetRecentActivity()
    {
        var data = await _dashboardService.GetRecentActivityAsync();
        return Ok(data);
    }

    [HttpGet("analytics")]
    public async Task<ActionResult<DashboardAnalyticsDto>> GetAnalytics()
    {
        var data = await _dashboardService.GetAnalyticsAsync();
        return Ok(data);
    }
}
