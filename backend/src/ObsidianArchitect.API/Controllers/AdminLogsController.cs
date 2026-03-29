using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Application.Services;
using ObsidianArchitect.Domain.Enums;

namespace ObsidianArchitect.API.Controllers;

[ApiController]
[Route("api/admin/logs")]
[Authorize(Roles = "Admin")]
public class AdminLogsController : ControllerBase
{
    private readonly AuditLogService _logService;

    public AdminLogsController(AuditLogService logService)
    {
        _logService = logService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AuditLogDto>>> GetLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] DateOnly? from = null,
        [FromQuery] DateOnly? to = null,
        [FromQuery] AuditAction? action = null,
        [FromQuery] Guid? profileId = null,
        [FromQuery] string? search = null)
    {
        var logs = await _logService.GetLogsAsync(page, pageSize, from, to, action, profileId, search);
        return Ok(logs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AuditLogDetailDto>> GetLogDetail(Guid id)
    {
        var log = await _logService.GetLogDetailAsync(id);
        return Ok(log);
    }
}
