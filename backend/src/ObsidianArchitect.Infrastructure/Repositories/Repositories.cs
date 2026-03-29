using Microsoft.EntityFrameworkCore;
using ObsidianArchitect.Application.Interfaces;
using ObsidianArchitect.Domain.Entities;
using ObsidianArchitect.Domain.Enums;
using ObsidianArchitect.Infrastructure.Data;

namespace ObsidianArchitect.Infrastructure.Repositories;

public class ProfileRepository : IProfileRepository
{
    private readonly AppDbContext _ctx;
    public ProfileRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Profile?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Profiles.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Profile?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await _ctx.Profiles.FirstOrDefaultAsync(p => p.Email == email, ct);

    public async Task AddAsync(Profile profile, CancellationToken ct = default)
        => await _ctx.Profiles.AddAsync(profile, ct);

    public async Task<int> GetTotalCountAsync(CancellationToken ct = default)
        => await _ctx.Profiles.CountAsync(ct);
}

public class AppSettingRepository : IAppSettingRepository
{
    private readonly AppDbContext _ctx;
    public AppSettingRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<AppSetting?> GetActiveAsync(CancellationToken ct = default)
        => await _ctx.AppSettings.FirstOrDefaultAsync(s => s.IsActive, ct);

    public async Task AddAsync(AppSetting setting, CancellationToken ct = default)
        => await _ctx.AppSettings.AddAsync(setting, ct);

    public void Update(AppSetting setting)
        => _ctx.AppSettings.Update(setting);
}

public class ServiceStationRepository : IServiceStationRepository
{
    private readonly AppDbContext _ctx;
    public ServiceStationRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<List<ServiceStation>> GetAllAsync(CancellationToken ct = default)
        => await _ctx.ServiceStations.OrderBy(s => s.Name).ToListAsync(ct);

    public async Task<List<ServiceStation>> GetActiveAsync(CancellationToken ct = default)
        => await _ctx.ServiceStations.Where(s => s.IsActive).OrderBy(s => s.Name).ToListAsync(ct);

    public async Task<ServiceStation?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.ServiceStations.FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task AddAsync(ServiceStation station, CancellationToken ct = default)
        => await _ctx.ServiceStations.AddAsync(station, ct);

    public void Update(ServiceStation station)
        => _ctx.ServiceStations.Update(station);

    public async Task<int> GetActiveCountAsync(CancellationToken ct = default)
        => await _ctx.ServiceStations.CountAsync(s => s.IsActive, ct);
}

public class ScheduleDayRepository : IScheduleDayRepository
{
    private readonly AppDbContext _ctx;
    public ScheduleDayRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<List<ScheduleDay>> GetEnabledDaysAsync(DateOnly from, DateOnly to, CancellationToken ct = default)
        => await _ctx.ScheduleDays
            .Where(d => d.Date >= from && d.Date <= to)
            .OrderBy(d => d.Date)
            .ToListAsync(ct);

    public async Task<ScheduleDay?> GetByDateAsync(DateOnly date, CancellationToken ct = default)
        => await _ctx.ScheduleDays.FirstOrDefaultAsync(d => d.Date == date, ct);

    public async Task<ScheduleDay?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.ScheduleDays.FirstOrDefaultAsync(d => d.Id == id, ct);

    public async Task AddAsync(ScheduleDay day, CancellationToken ct = default)
        => await _ctx.ScheduleDays.AddAsync(day, ct);

    public async Task AddRangeAsync(IEnumerable<ScheduleDay> days, CancellationToken ct = default)
        => await _ctx.ScheduleDays.AddRangeAsync(days, ct);

    public void Update(ScheduleDay day)
        => _ctx.ScheduleDays.Update(day);

    public async Task<int> GetEnabledCountAsync(CancellationToken ct = default)
        => await _ctx.ScheduleDays.CountAsync(d => d.IsEnabled, ct);
}

public class TimeSlotRepository : ITimeSlotRepository
{
    private readonly AppDbContext _ctx;
    public TimeSlotRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<List<TimeSlot>> GetByDateAndShiftAsync(DateOnly date, ShiftType shift, CancellationToken ct = default)
        => await _ctx.TimeSlots
            .Include(s => s.ScheduleDay)
            .Include(s => s.ServiceStation)
            .Where(s => s.ScheduleDay.Date == date && s.Shift == shift)
            .OrderBy(s => s.StartTime)
            .ToListAsync(ct);

    public async Task<List<TimeSlot>> GetByScheduleDayIdAsync(Guid scheduleDayId, CancellationToken ct = default)
        => await _ctx.TimeSlots
            .Include(s => s.ServiceStation)
            .Where(s => s.ScheduleDayId == scheduleDayId)
            .OrderBy(s => s.StartTime)
            .ToListAsync(ct);

    public async Task<TimeSlot?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.TimeSlots
            .Include(s => s.ScheduleDay)
            .Include(s => s.ServiceStation)
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<TimeSlot?> GetByIdForUpdateAsync(Guid id, CancellationToken ct = default)
        => await _ctx.TimeSlots
            .Include(s => s.ScheduleDay)
            .Include(s => s.ServiceStation)
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task AddAsync(TimeSlot slot, CancellationToken ct = default)
        => await _ctx.TimeSlots.AddAsync(slot, ct);

    public async Task AddRangeAsync(IEnumerable<TimeSlot> slots, CancellationToken ct = default)
        => await _ctx.TimeSlots.AddRangeAsync(slots, ct);

    public void Update(TimeSlot slot)
        => _ctx.TimeSlots.Update(slot);

    public async Task<int> GetTotalAvailableCountAsync(DateOnly date, CancellationToken ct = default)
        => await _ctx.TimeSlots
            .Where(s => s.ScheduleDay.Date == date && s.IsActive && s.BookedCount < s.Capacity)
            .CountAsync(ct);

    public async Task<int> GetTotalCapacityAsync(DateOnly date, CancellationToken ct = default)
        => await _ctx.TimeSlots
            .Where(s => s.ScheduleDay.Date == date && s.IsActive)
            .SumAsync(s => s.Capacity, ct);

    public async Task<int> GetTotalBookedAsync(DateOnly date, CancellationToken ct = default)
        => await _ctx.TimeSlots
            .Where(s => s.ScheduleDay.Date == date && s.IsActive)
            .SumAsync(s => s.BookedCount, ct);
}

public class AppointmentRepository : IAppointmentRepository
{
    private readonly AppDbContext _ctx;
    public AppointmentRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<List<Appointment>> GetByProfileIdAsync(Guid profileId, AppointmentStatus? status = null, CancellationToken ct = default)
    {
        var query = _ctx.Appointments
            .Include(a => a.TimeSlot).ThenInclude(s => s.ServiceStation)
            .Where(a => a.ProfileId == profileId);

        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        return await query.OrderByDescending(a => a.Date).ThenByDescending(a => a.StartTime).ToListAsync(ct);
    }

    public async Task<Appointment?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Appointments
            .Include(a => a.Profile)
            .Include(a => a.TimeSlot).ThenInclude(s => s.ServiceStation)
            .FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task<Appointment?> GetActiveByProfileAndDateAsync(Guid profileId, DateOnly date, CancellationToken ct = default)
        => await _ctx.Appointments.FirstOrDefaultAsync(
            a => a.ProfileId == profileId && a.Date == date && a.Status == AppointmentStatus.Booked, ct);

    public async Task AddAsync(Appointment appointment, CancellationToken ct = default)
        => await _ctx.Appointments.AddAsync(appointment, ct);

    public void Update(Appointment appointment)
        => _ctx.Appointments.Update(appointment);

    public async Task<int> GetTotalCountAsync(CancellationToken ct = default)
        => await _ctx.Appointments.CountAsync(ct);

    public async Task<int> GetCountByStatusAsync(AppointmentStatus status, CancellationToken ct = default)
        => await _ctx.Appointments.CountAsync(a => a.Status == status, ct);

    public async Task<int> GetCountByDateAsync(DateOnly date, CancellationToken ct = default)
        => await _ctx.Appointments.CountAsync(a => a.Date == date, ct);

    public async Task<int> GetCountByDateRangeAsync(DateOnly from, DateOnly to, CancellationToken ct = default)
        => await _ctx.Appointments.CountAsync(a => a.Date >= from && a.Date <= to, ct);

    public async Task<List<Appointment>> GetRecentAsync(int count, CancellationToken ct = default)
        => await _ctx.Appointments
            .Include(a => a.Profile)
            .Include(a => a.TimeSlot)
            .OrderByDescending(a => a.CreatedAt)
            .Take(count)
            .ToListAsync(ct);

    public async Task<Dictionary<int, int>> GetMonthlyTrendsAsync(int year, CancellationToken ct = default)
    {
        var startDate = new DateOnly(year, 1, 1);
        var endDate = new DateOnly(year, 12, 31);

        var data = await _ctx.Appointments
            .Where(a => a.Date >= startDate && a.Date <= endDate)
            .GroupBy(a => a.Date.Month)
            .Select(g => new { Month = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        return data.ToDictionary(d => d.Month, d => d.Count);
    }
}

public class AuditLogRepository : IAuditLogRepository
{
    private readonly AppDbContext _ctx;
    public AuditLogRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task AddAsync(AuditLog log, CancellationToken ct = default)
        => await _ctx.AuditLogs.AddAsync(log, ct);

    public async Task<(List<AuditLog> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize,
        DateOnly? from, DateOnly? to,
        AuditAction? action, Guid? profileId,
        string? search,
        CancellationToken ct = default)
    {
        var query = _ctx.AuditLogs.Include(l => l.Profile).AsQueryable();

        if (from.HasValue)
            query = query.Where(l => DateOnly.FromDateTime(l.CreatedAt) >= from.Value);
        if (to.HasValue)
            query = query.Where(l => DateOnly.FromDateTime(l.CreatedAt) <= to.Value);
        if (action.HasValue)
            query = query.Where(l => l.Action == action.Value);
        if (profileId.HasValue)
            query = query.Where(l => l.ProfileId == profileId.Value);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(l => (l.Details != null && l.Details.Contains(search)) ||
                (l.Profile != null && l.Profile.FullName.Contains(search)));

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<AuditLog?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.AuditLogs.Include(l => l.Profile).FirstOrDefaultAsync(l => l.Id == id, ct);

    public async Task<List<AuditLog>> GetRecentAsync(int count, CancellationToken ct = default)
        => await _ctx.AuditLogs.Include(l => l.Profile)
            .OrderByDescending(l => l.CreatedAt).Take(count).ToListAsync(ct);
}
