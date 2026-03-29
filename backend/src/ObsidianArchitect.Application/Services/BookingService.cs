using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Application.Interfaces;
using ObsidianArchitect.Domain.Entities;
using ObsidianArchitect.Domain.Enums;
using ObsidianArchitect.Domain.Exceptions;

namespace ObsidianArchitect.Application.Services;

public class BookingService
{
    private readonly IUnitOfWork _uow;

    public BookingService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    /// <summary>
    /// Returns enabled booking dates for the next N days, shaped for the frontend date card carousel.
    /// </summary>
    public async Task<List<BookingDateDto>> GetAvailableDatesAsync(int daysAhead = 30, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = today.AddDays(daysAhead);
        var days = await _uow.ScheduleDays.GetEnabledDaysAsync(today, endDate, ct);

        var result = new List<BookingDateDto>();
        foreach (var day in days.OrderBy(d => d.Date))
        {
            var slots = await _uow.TimeSlots.GetByScheduleDayIdAsync(day.Id, ct);
            var activeSlots = slots.Where(s => s.IsActive).ToList();
            var available = activeSlots.Count(s => s.Status != SlotStatus.Full && s.Status != SlotStatus.Blocked);
            var total = activeSlots.Count;

            string status;
            if (!day.IsEnabled || total == 0)
                status = "disabled";
            else if (available == 0)
                status = "full";
            else if ((double)available / total <= 0.25)
                status = "limited";
            else
                status = "available";

            result.Add(new BookingDateDto(
                day.Date,
                day.Date.DayOfWeek.ToString()[..3].ToUpper(),
                available, total, status));
        }

        return result;
    }

    /// <summary>
    /// Returns available shifts for a given date, matching the Morning/Afternoon/Evening pills.
    /// </summary>
    public async Task<List<ShiftDto>> GetShiftsForDateAsync(DateOnly date, CancellationToken ct = default)
    {
        var day = await _uow.ScheduleDays.GetByDateAsync(date, ct)
            ?? throw new NotFoundException("ScheduleDay", date);

        if (!day.IsEnabled)
            throw new BusinessRuleException("This date is not available for booking.", "DATE_DISABLED");

        var shifts = new List<ShiftDto>();

        if (day.MorningShiftEnabled)
        {
            var slots = await _uow.TimeSlots.GetByDateAndShiftAsync(date, ShiftType.Morning, ct);
            var available = slots.Count(s => s.IsActive && s.Status != SlotStatus.Full);
            shifts.Add(new ShiftDto("Morning", ShiftType.Morning, true, "08:00", "12:00", available));
        }
        if (day.AfternoonShiftEnabled)
        {
            var slots = await _uow.TimeSlots.GetByDateAndShiftAsync(date, ShiftType.Afternoon, ct);
            var available = slots.Count(s => s.IsActive && s.Status != SlotStatus.Full);
            shifts.Add(new ShiftDto("Afternoon", ShiftType.Afternoon, true, "13:00", "17:00", available));
        }
        if (day.EveningShiftEnabled)
        {
            var slots = await _uow.TimeSlots.GetByDateAndShiftAsync(date, ShiftType.Evening, ct);
            var available = slots.Count(s => s.IsActive && s.Status != SlotStatus.Full);
            shifts.Add(new ShiftDto("Evening", ShiftType.Evening, true, "18:00", "22:00", available));
        }

        return shifts;
    }

    /// <summary>
    /// Returns time slots for a date+shift, shaped for the booking slot grid.
    /// </summary>
    public async Task<List<TimeSlotDto>> GetTimeSlotsAsync(DateOnly date, ShiftType shift, CancellationToken ct = default)
    {
        var day = await _uow.ScheduleDays.GetByDateAsync(date, ct)
            ?? throw new NotFoundException("ScheduleDay", date);

        if (!day.IsEnabled)
            throw new BusinessRuleException("This date is not available for booking.", "DATE_DISABLED");

        var slots = await _uow.TimeSlots.GetByDateAndShiftAsync(date, shift, ct);

        return slots.OrderBy(s => s.StartTime).Select(s => new TimeSlotDto(
            s.Id,
            s.StartTime.ToString("HH:mm"),
            s.EndTime.ToString("HH:mm"),
            s.Shift,
            s.Status.ToString().ToLower(),
            s.Capacity,
            s.BookedCount,
            s.RemainingCapacity,
            s.IsActive && s.Status != SlotStatus.Full && s.Status != SlotStatus.Blocked,
            s.ServiceStation?.Name
        )).ToList();
    }

    /// <summary>
    /// Creates a new appointment with full business rule validation.
    /// Transaction-safe: validates capacity, checks for overbooking, and enforces one-per-day rule.
    /// </summary>
    public async Task<AppointmentDto> CreateAppointmentAsync(
        Guid profileId, CreateAppointmentRequest request, CancellationToken ct = default)
    {
        // 1. Validate date is not in the past
        if (request.Date < DateOnly.FromDateTime(DateTime.UtcNow))
            throw new BusinessRuleException("Cannot book appointments in the past.", "PAST_DATE");

        // 2. Check one active appointment per user per day
        var existing = await _uow.Appointments.GetActiveByProfileAndDateAsync(profileId, request.Date, ct);
        if (existing != null)
            throw new BusinessRuleException(
                "You already have an active appointment on this date.", "DUPLICATE_BOOKING");

        // 3. Get and validate the time slot (with lock for concurrency)
        var slot = await _uow.TimeSlots.GetByIdForUpdateAsync(request.TimeSlotId, ct)
            ?? throw new NotFoundException("TimeSlot", request.TimeSlotId);

        if (!slot.IsActive)
            throw new BusinessRuleException("This time slot is not active.", "SLOT_INACTIVE");

        if (slot.BookedCount >= slot.Capacity)
            throw new BusinessRuleException("This time slot is fully booked.", "SLOT_FULL");

        // 4. Validate schedule day
        var scheduleDay = slot.ScheduleDay;
        if (scheduleDay == null || !scheduleDay.IsEnabled)
            throw new BusinessRuleException("This date is not enabled for booking.", "DATE_DISABLED");

        if (scheduleDay.Date != request.Date)
            throw new BusinessRuleException("Date mismatch with the selected time slot.", "DATE_MISMATCH");

        // 5. Get settings for duration
        var settings = await _uow.AppSettings.GetActiveAsync(ct);
        var duration = settings?.DefaultAppointmentDurationMinutes ?? 45;

        // 6. Create the appointment
        var appointment = new Appointment
        {
            Id = Guid.NewGuid(),
            BookingCode = Appointment.GenerateBookingCode(),
            ProfileId = profileId,
            TimeSlotId = slot.Id,
            Date = request.Date,
            StartTime = slot.StartTime,
            EndTime = slot.EndTime,
            DurationMinutes = duration,
            Status = AppointmentStatus.Booked,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // 7. Increment booked count (atomic)
        slot.BookedCount++;
        _uow.TimeSlots.Update(slot);

        await _uow.Appointments.AddAsync(appointment, ct);

        // 8. Audit log
        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ProfileId = profileId,
            Action = AuditAction.AppointmentBooked,
            EntityType = "Appointment",
            EntityId = appointment.Id,
            Details = $"Appointment booked: {appointment.BookingCode} on {request.Date} at {slot.StartTime}",
            StatusLabel = "Success"
        }, ct);

        await _uow.SaveChangesAsync(ct);

        return MapAppointment(appointment, slot);
    }

    /// <summary>
    /// Cancels an appointment and releases the slot capacity.
    /// </summary>
    public async Task<AppointmentDto> CancelAppointmentAsync(
        Guid profileId, Guid appointmentId, CancelAppointmentRequest request, CancellationToken ct = default)
    {
        var appointment = await _uow.Appointments.GetByIdAsync(appointmentId, ct)
            ?? throw new NotFoundException("Appointment", appointmentId);

        if (appointment.ProfileId != profileId)
            throw new ForbiddenException("You can only cancel your own appointments.");

        if (!appointment.CanCancel)
            throw new BusinessRuleException(
                $"Cannot cancel an appointment with status '{appointment.Status}'.", "INVALID_STATUS");

        appointment.Status = AppointmentStatus.Cancelled;
        appointment.CancellationReason = request.Reason;
        appointment.UpdatedAt = DateTime.UtcNow;
        _uow.Appointments.Update(appointment);

        // Release capacity
        var slot = await _uow.TimeSlots.GetByIdAsync(appointment.TimeSlotId, ct);
        if (slot != null && slot.BookedCount > 0)
        {
            slot.BookedCount--;
            _uow.TimeSlots.Update(slot);
        }

        // Audit log
        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ProfileId = profileId,
            Action = AuditAction.AppointmentCancelled,
            EntityType = "Appointment",
            EntityId = appointment.Id,
            Details = $"Appointment cancelled: {appointment.BookingCode}. Reason: {request.Reason ?? "N/A"}",
            StatusLabel = "Warning"
        }, ct);

        await _uow.SaveChangesAsync(ct);

        return MapAppointment(appointment, slot);
    }

    private static AppointmentDto MapAppointment(Appointment a, TimeSlot? slot) => new(
        a.Id, a.BookingCode, a.Date,
        a.StartTime.ToString("hh:mm tt"), a.EndTime.ToString("hh:mm tt"),
        a.DurationMinutes, a.Status.ToString().ToLower(),
        slot?.Shift.ToString().ToLower() ?? "unknown",
        a.CanCancel, slot?.ServiceStation?.Name,
        a.Notes, a.CancellationReason, a.CreatedAt);
}
