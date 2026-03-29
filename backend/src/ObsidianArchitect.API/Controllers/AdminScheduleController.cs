using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Application.Services;

namespace ObsidianArchitect.API.Controllers;

[ApiController]
[Route("api/admin/schedule")]
[Authorize(Roles = "Admin")]
public class AdminScheduleController : ControllerBase
{
    private readonly AdminScheduleService _scheduleService;

    public AdminScheduleController(AdminScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    [HttpGet]
    public async Task<ActionResult<ScheduleOverviewDto>> GetOverview()
    {
        var data = await _scheduleService.GetOverviewAsync();
        return Ok(data);
    }

    [HttpPost("days")]
    public async Task<ActionResult<ScheduleDayDto>> CreateDay(CreateScheduleDayRequest request)
    {
        var data = await _scheduleService.CreateScheduleDayAsync(request);
        return Ok(data);
    }

    [HttpPatch("days/{id}")]
    public async Task<ActionResult<ScheduleDayDto>> UpdateDay(Guid id, UpdateScheduleDayRequest request)
    {
        var data = await _scheduleService.UpdateScheduleDayAsync(id, request);
        return Ok(data);
    }

    [HttpPost("slots/generate")]
    public async Task<ActionResult> GenerateSlots(GenerateSlotsRequest request)
    {
        int createdCount = await _scheduleService.GenerateSlotsAsync(request);
        return Ok(new { message = $"Successfully generated {createdCount} slots.", count = createdCount });
    }

    [HttpPatch("slots/{id}")]
    public async Task<ActionResult<TimeSlotDto>> UpdateSlot(Guid id, UpdateSlotRequest request)
    {
        var data = await _scheduleService.UpdateSlotAsync(id, request);
        return Ok(data);
    }

    [HttpPatch("settings")]
    public async Task<ActionResult<AppSettingsDto>> UpdateSettings(UpdateSettingsRequest request)
    {
        var data = await _scheduleService.UpdateSettingsAsync(request);
        return Ok(data);
    }
}
