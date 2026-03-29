using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Application.Interfaces;
using ObsidianArchitect.Domain.Entities;
using ObsidianArchitect.Domain.Enums;
using ObsidianArchitect.Domain.Exceptions;

namespace ObsidianArchitect.Application.Services;

public class AdminScheduleService
{
    private readonly IUnitOfWork _uow;

    public AdminScheduleService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    /// <summary>
    /// Returns schedule overview: settings, days, and stations for the Schedule Engine page.
    /// </summary>
    public async Task<ScheduleOverviewDto> GetOverviewAsync(CancellationToken ct = default)
    {
        var settings = await _uow.AppSettings.GetActiveAsync(ct);
        var settingsDto = settings != null
            ? new AppSettingsDto(settings.Id, settings.DefaultAppointmentDurationMinutes,
                settings.BufferTimeMinutes, settings.DefaultStationCapacity, settings.AllowDynamicScaling)
            : new AppSettingsDto(Guid.Empty, 45, 5, 1, false);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var days = await _uow.ScheduleDays.GetEnabledDaysAsync(today, today.AddDays(90), ct);

        var dayDtos = new List<ScheduleDayDto>();
        foreach (var d in days.OrderBy(d => d.Date))
        {
            var slots = await _uow.TimeSlots.GetByScheduleDayIdAsync(d.Id, ct);
            dayDtos.Add(new ScheduleDayDto(
                d.Id, d.Date, d.Date.DayOfWeek.ToString(), d.IsEnabled,
                d.MorningShiftEnabled, d.AfternoonShiftEnabled, d.EveningShiftEnabled,
                slots.Count(s => s.IsActive), slots.Sum(s => s.BookedCount)));
        }

        var stations = await _uow.ServiceStations.GetAllAsync(ct);
        var stationDtos = stations.Select(s => new ServiceStationDto(
            s.Id, s.Name, s.Description, s.IsActive)).ToList();

        return new ScheduleOverviewDto(settingsDto, dayDtos, stationDtos);
    }

    /// <summary>
    /// Creates or enables a schedule day with shift configuration.
    /// </summary>
    public async Task<ScheduleDayDto> CreateScheduleDayAsync(CreateScheduleDayRequest request, CancellationToken ct = default)
    {
        var existing = await _uow.ScheduleDays.GetByDateAsync(request.Date, ct);
        if (existing != null)
            throw new BusinessRuleException("A schedule day already exists for this date.", "DAY_EXISTS");

        var day = new ScheduleDay
        {
            Id = Guid.NewGuid(),
            Date = request.Date,
            IsEnabled = request.IsEnabled,
            MorningShiftEnabled = request.MorningShiftEnabled,
            AfternoonShiftEnabled = request.AfternoonShiftEnabled,
            EveningShiftEnabled = request.EveningShiftEnabled,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _uow.ScheduleDays.AddAsync(day, ct);

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = AuditAction.ScheduleDayCreated,
            EntityType = "ScheduleDay",
            EntityId = day.Id,
            Details = $"Schedule day created for {request.Date}",
            StatusLabel = "Success"
        }, ct);

        await _uow.SaveChangesAsync(ct);

        return new ScheduleDayDto(day.Id, day.Date, day.Date.DayOfWeek.ToString(),
            day.IsEnabled, day.MorningShiftEnabled, day.AfternoonShiftEnabled,
            day.EveningShiftEnabled, 0, 0);
    }

    /// <summary>
    /// Updates a schedule day's enabled/shift status.
    /// </summary>
    public async Task<ScheduleDayDto> UpdateScheduleDayAsync(
        Guid id, UpdateScheduleDayRequest request, CancellationToken ct = default)
    {
        var day = await _uow.ScheduleDays.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("ScheduleDay", id);

        if (request.IsEnabled.HasValue) day.IsEnabled = request.IsEnabled.Value;
        if (request.MorningShiftEnabled.HasValue) day.MorningShiftEnabled = request.MorningShiftEnabled.Value;
        if (request.AfternoonShiftEnabled.HasValue) day.AfternoonShiftEnabled = request.AfternoonShiftEnabled.Value;
        if (request.EveningShiftEnabled.HasValue) day.EveningShiftEnabled = request.EveningShiftEnabled.Value;
        day.UpdatedAt = DateTime.UtcNow;

        _uow.ScheduleDays.Update(day);

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = AuditAction.ScheduleDayUpdated,
            EntityType = "ScheduleDay",
            EntityId = day.Id,
            Details = $"Schedule day updated for {day.Date}",
            StatusLabel = "Success"
        }, ct);

        await _uow.SaveChangesAsync(ct);

        var slots = await _uow.TimeSlots.GetByScheduleDayIdAsync(day.Id, ct);
        return new ScheduleDayDto(day.Id, day.Date, day.Date.DayOfWeek.ToString(),
            day.IsEnabled, day.MorningShiftEnabled, day.AfternoonShiftEnabled,
            day.EveningShiftEnabled, slots.Count(s => s.IsActive), slots.Sum(s => s.BookedCount));
    }

    /// <summary>
    /// Bulk generates time slots for a date range based on settings.
    /// This is the core schedule engine operation.
    /// </summary>
    public async Task<int> GenerateSlotsAsync(GenerateSlotsRequest request, CancellationToken ct = default)
    {
        var settings = await _uow.AppSettings.GetActiveAsync(ct);
        var duration = request.DurationMinutes ?? settings?.DefaultAppointmentDurationMinutes ?? 45;
        var buffer = settings?.BufferTimeMinutes ?? 5;
        var capacity = request.CapacityPerSlot ?? settings?.DefaultStationCapacity ?? 1;

        int totalCreated = 0;
        var currentDate = request.StartDate;

        while (currentDate <= request.EndDate)
        {
            // Ensure schedule day exists
            var day = await _uow.ScheduleDays.GetByDateAsync(currentDate, ct);
            if (day == null)
            {
                day = new ScheduleDay
                {
                    Id = Guid.NewGuid(),
                    Date = currentDate,
                    IsEnabled = true,
                    MorningShiftEnabled = true,
                    AfternoonShiftEnabled = true,
                    EveningShiftEnabled = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _uow.ScheduleDays.AddAsync(day, ct);
            }

            // Clear existing unbooked slots for this day
            var existingSlots = await _uow.TimeSlots.GetByScheduleDayIdAsync(day.Id, ct);

            var shifts = new List<(ShiftType Type, TimeOnly Start, TimeOnly End, bool Enabled)>
            {
                (ShiftType.Morning, new TimeOnly(8, 0), new TimeOnly(12, 0), day.MorningShiftEnabled),
                (ShiftType.Afternoon, new TimeOnly(13, 0), new TimeOnly(17, 0), day.AfternoonShiftEnabled),
                (ShiftType.Evening, new TimeOnly(18, 0), new TimeOnly(22, 0), day.EveningShiftEnabled)
            };

            var newSlots = new List<TimeSlot>();
            foreach (var (type, shiftStart, shiftEnd, enabled) in shifts)
            {
                if (!enabled) continue;

                var slotTime = shiftStart;
                while (slotTime.AddMinutes(duration) <= shiftEnd)
                {
                    var slotEnd = slotTime.AddMinutes(duration);

                    // Skip if slot already exists at this time
                    var exists = existingSlots.Any(s => s.Shift == type && s.StartTime == slotTime);
                    if (!exists)
                    {
                        newSlots.Add(new TimeSlot
                        {
                            Id = Guid.NewGuid(),
                            ScheduleDayId = day.Id,
                            Shift = type,
                            StartTime = slotTime,
                            EndTime = slotEnd,
                            Capacity = capacity,
                            BookedCount = 0,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        });
                    }

                    slotTime = slotTime.AddMinutes(duration + buffer);
                }
            }

            if (newSlots.Count > 0)
            {
                await _uow.TimeSlots.AddRangeAsync(newSlots, ct);
                totalCreated += newSlots.Count;
            }

            currentDate = currentDate.AddDays(1);
        }

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = AuditAction.SlotGenerated,
            EntityType = "TimeSlot",
            Details = $"Generated {totalCreated} slots from {request.StartDate} to {request.EndDate}",
            StatusLabel = "Success"
        }, ct);

        await _uow.SaveChangesAsync(ct);
        return totalCreated;
    }

    /// <summary>
    /// Updates a single time slot's capacity or active status.
    /// </summary>
    public async Task<TimeSlotDto> UpdateSlotAsync(
        Guid id, UpdateSlotRequest request, CancellationToken ct = default)
    {
        var slot = await _uow.TimeSlots.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("TimeSlot", id);

        if (request.Capacity.HasValue)
        {
            if (request.Capacity.Value < slot.BookedCount)
                throw new BusinessRuleException(
                    $"Capacity cannot be less than current booked count ({slot.BookedCount}).",
                    "CAPACITY_TOO_LOW");
            slot.Capacity = request.Capacity.Value;
        }

        if (request.IsActive.HasValue)
            slot.IsActive = request.IsActive.Value;

        _uow.TimeSlots.Update(slot);

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = AuditAction.SlotUpdated,
            EntityType = "TimeSlot",
            EntityId = slot.Id,
            Details = $"Slot updated: {slot.StartTime} on {slot.ScheduleDay?.Date}",
            StatusLabel = "Success"
        }, ct);

        await _uow.SaveChangesAsync(ct);

        return new TimeSlotDto(slot.Id, slot.StartTime.ToString("HH:mm"),
            slot.EndTime.ToString("HH:mm"), slot.Shift,
            slot.Status.ToString().ToLower(), slot.Capacity,
            slot.BookedCount, slot.RemainingCapacity,
            slot.IsActive && slot.Status != SlotStatus.Full,
            slot.ServiceStation?.Name);
    }

    /// <summary>
    /// Updates global booking settings (duration, buffer, capacity, scaling).
    /// </summary>
    public async Task<AppSettingsDto> UpdateSettingsAsync(
        UpdateSettingsRequest request, CancellationToken ct = default)
    {
        var settings = await _uow.AppSettings.GetActiveAsync(ct);
        if (settings == null)
        {
            settings = new AppSetting
            {
                Id = Guid.NewGuid(),
                DefaultAppointmentDurationMinutes = 45,
                BufferTimeMinutes = 5,
                DefaultStationCapacity = 1,
                IsActive = true
            };
            await _uow.AppSettings.AddAsync(settings, ct);
        }

        if (request.DefaultAppointmentDurationMinutes.HasValue)
            settings.DefaultAppointmentDurationMinutes = request.DefaultAppointmentDurationMinutes.Value;
        if (request.BufferTimeMinutes.HasValue)
            settings.BufferTimeMinutes = request.BufferTimeMinutes.Value;
        if (request.DefaultStationCapacity.HasValue)
            settings.DefaultStationCapacity = request.DefaultStationCapacity.Value;
        if (request.AllowDynamicScaling.HasValue)
            settings.AllowDynamicScaling = request.AllowDynamicScaling.Value;

        settings.UpdatedAt = DateTime.UtcNow;
        _uow.AppSettings.Update(settings);

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = AuditAction.SettingsUpdated,
            EntityType = "AppSetting",
            EntityId = settings.Id,
            Details = "Global booking settings updated",
            StatusLabel = "Success"
        }, ct);

        await _uow.SaveChangesAsync(ct);

        return new AppSettingsDto(settings.Id, settings.DefaultAppointmentDurationMinutes,
            settings.BufferTimeMinutes, settings.DefaultStationCapacity, settings.AllowDynamicScaling);
    }
}
