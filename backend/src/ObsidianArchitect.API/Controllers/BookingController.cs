using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Application.Interfaces;
using ObsidianArchitect.Application.Services;
using ObsidianArchitect.Domain.Enums;

namespace ObsidianArchitect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingController : ControllerBase
{
    private readonly BookingService _bookingService;
    private readonly ICurrentUserService _currentUser;

    public BookingController(BookingService bookingService, ICurrentUserService currentUser)
    {
        _bookingService = bookingService;
        _currentUser = currentUser;
    }

    [HttpGet("dates")]
    [AllowAnonymous]
    public async Task<ActionResult<List<BookingDateDto>>> GetDates([FromQuery] int daysAhead = 30)
    {
        var dates = await _bookingService.GetAvailableDatesAsync(daysAhead);
        return Ok(dates);
    }

    [HttpGet("dates/{date}/shifts")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ShiftDto>>> GetShifts(DateOnly date)
    {
        var shifts = await _bookingService.GetShiftsForDateAsync(date);
        return Ok(shifts);
    }

    [HttpGet("slots")]
    [AllowAnonymous]
    public async Task<ActionResult<List<TimeSlotDto>>> GetSlots([FromQuery] DateOnly date, [FromQuery] ShiftType shift)
    {
        var slots = await _bookingService.GetTimeSlotsAsync(date, shift);
        return Ok(slots);
    }

    [HttpPost("appointments")]
    public async Task<ActionResult<AppointmentDto>> CreateAppointment(CreateAppointmentRequest request)
    {
        if (_currentUser.UserId == null) return Unauthorized();
        var appointment = await _bookingService.CreateAppointmentAsync(_currentUser.UserId.Value, request);
        return CreatedAtAction(nameof(AppointmentsController.GetAppointment), 
            "Appointments", new { id = appointment.Id }, appointment);
    }

    [HttpPost("appointments/{id}/cancel")]
    public async Task<ActionResult<AppointmentDto>> CancelAppointment(Guid id, CancelAppointmentRequest request)
    {
        if (_currentUser.UserId == null) return Unauthorized();
        var appointment = await _bookingService.CancelAppointmentAsync(_currentUser.UserId.Value, id, request);
        return Ok(appointment);
    }
}
