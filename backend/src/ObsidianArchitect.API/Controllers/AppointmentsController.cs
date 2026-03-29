using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Application.Interfaces;
using ObsidianArchitect.Application.Services;

namespace ObsidianArchitect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly AppointmentService _appointmentService;
    private readonly ICurrentUserService _currentUser;

    public AppointmentsController(AppointmentService appointmentService, ICurrentUserService currentUser)
    {
        _appointmentService = appointmentService;
        _currentUser = currentUser;
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<AppointmentDto>>> GetMyAppointments([FromQuery] string? filter)
    {
        if (_currentUser.UserId == null) return Unauthorized();
        var appointments = await _appointmentService.GetMyAppointmentsAsync(_currentUser.UserId.Value, filter);
        return Ok(appointments);
    }

    [HttpGet("my/{id}")]
    public async Task<ActionResult<AppointmentDetailDto>> GetAppointment(Guid id)
    {
        if (_currentUser.UserId == null) return Unauthorized();
        var appointment = await _appointmentService.GetAppointmentDetailAsync(_currentUser.UserId.Value, id);
        return Ok(appointment);
    }
}
