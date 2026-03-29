using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Application.Interfaces;
using ObsidianArchitect.Domain.Enums;
using ObsidianArchitect.Domain.Exceptions;

namespace ObsidianArchitect.Application.Services;

public class AppointmentService
{
    private readonly IUnitOfWork _uow;

    public AppointmentService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    /// <summary>
    /// Returns appointments for the current user, filterable by status group: active/past/cancelled.
    /// Shaped for the My Appointments card layout.
    /// </summary>
    public async Task<List<AppointmentDto>> GetMyAppointmentsAsync(
        Guid profileId, string? filter = null, CancellationToken ct = default)
    {
        AppointmentStatus? statusFilter = filter?.ToLower() switch
        {
            "active" => AppointmentStatus.Booked,
            "cancelled" => AppointmentStatus.Cancelled,
            "past" => null, // handled below
            _ => null
        };

        var appointments = await _uow.Appointments.GetByProfileIdAsync(profileId, statusFilter, ct);

        if (filter?.ToLower() == "past")
        {
            appointments = appointments
                .Where(a => a.Status == AppointmentStatus.Completed || a.Status == AppointmentStatus.NoShow)
                .ToList();
        }
        else if (filter == null || filter.ToLower() == "all")
        {
            // Return all
        }

        return appointments.OrderByDescending(a => a.Date).ThenByDescending(a => a.StartTime)
            .Select(a => new AppointmentDto(
                a.Id, a.BookingCode, a.Date,
                a.StartTime.ToString("hh:mm tt"), a.EndTime.ToString("hh:mm tt"),
                a.DurationMinutes, a.Status.ToString().ToLower(),
                a.TimeSlot?.Shift.ToString().ToLower() ?? "unknown",
                a.CanCancel, a.TimeSlot?.ServiceStation?.Name,
                a.Notes, a.CancellationReason, a.CreatedAt))
            .ToList();
    }

    /// <summary>
    /// Returns a single appointment detail.
    /// </summary>
    public async Task<AppointmentDetailDto> GetAppointmentDetailAsync(
        Guid profileId, Guid appointmentId, CancellationToken ct = default)
    {
        var a = await _uow.Appointments.GetByIdAsync(appointmentId, ct)
            ?? throw new NotFoundException("Appointment", appointmentId);

        if (a.ProfileId != profileId)
            throw new ForbiddenException("You can only view your own appointments.");

        return new AppointmentDetailDto(
            a.Id, a.BookingCode, a.Date,
            a.StartTime.ToString("hh:mm tt"), a.EndTime.ToString("hh:mm tt"),
            a.DurationMinutes, a.Status.ToString().ToLower(),
            a.TimeSlot?.Shift.ToString().ToLower() ?? "unknown",
            a.CanCancel, a.TimeSlot?.ServiceStation?.Name,
            a.Notes, a.CancellationReason, a.CreatedAt, a.UpdatedAt);
    }
}
