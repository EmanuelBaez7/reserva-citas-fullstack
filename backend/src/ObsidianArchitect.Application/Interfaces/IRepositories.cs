using ObsidianArchitect.Domain.Entities;
using ObsidianArchitect.Domain.Enums;

namespace ObsidianArchitect.Application.Interfaces;

public interface IProfileRepository
{
    Task<Profile?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Profile?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task AddAsync(Profile profile, CancellationToken ct = default);
    Task<int> GetTotalCountAsync(CancellationToken ct = default);
}

public interface IAppSettingRepository
{
    Task<AppSetting?> GetActiveAsync(CancellationToken ct = default);
    Task AddAsync(AppSetting setting, CancellationToken ct = default);
    void Update(AppSetting setting);
}

public interface IServiceStationRepository
{
    Task<List<ServiceStation>> GetAllAsync(CancellationToken ct = default);
    Task<List<ServiceStation>> GetActiveAsync(CancellationToken ct = default);
    Task<ServiceStation?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(ServiceStation station, CancellationToken ct = default);
    void Update(ServiceStation station);
    Task<int> GetActiveCountAsync(CancellationToken ct = default);
}

public interface IScheduleDayRepository
{
    Task<List<ScheduleDay>> GetEnabledDaysAsync(DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<ScheduleDay?> GetByDateAsync(DateOnly date, CancellationToken ct = default);
    Task<ScheduleDay?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(ScheduleDay day, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<ScheduleDay> days, CancellationToken ct = default);
    void Update(ScheduleDay day);
    Task<int> GetEnabledCountAsync(CancellationToken ct = default);
}

public interface ITimeSlotRepository
{
    Task<List<TimeSlot>> GetByDateAndShiftAsync(DateOnly date, ShiftType shift, CancellationToken ct = default);
    Task<List<TimeSlot>> GetByScheduleDayIdAsync(Guid scheduleDayId, CancellationToken ct = default);
    Task<TimeSlot?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<TimeSlot?> GetByIdForUpdateAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(TimeSlot slot, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<TimeSlot> slots, CancellationToken ct = default);
    void Update(TimeSlot slot);
    Task<int> GetTotalAvailableCountAsync(DateOnly date, CancellationToken ct = default);
    Task<int> GetTotalCapacityAsync(DateOnly date, CancellationToken ct = default);
    Task<int> GetTotalBookedAsync(DateOnly date, CancellationToken ct = default);
}

public interface IAppointmentRepository
{
    Task<List<Appointment>> GetByProfileIdAsync(Guid profileId, AppointmentStatus? status = null, CancellationToken ct = default);
    Task<Appointment?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Appointment?> GetActiveByProfileAndDateAsync(Guid profileId, DateOnly date, CancellationToken ct = default);
    Task AddAsync(Appointment appointment, CancellationToken ct = default);
    void Update(Appointment appointment);
    Task<int> GetTotalCountAsync(CancellationToken ct = default);
    Task<int> GetCountByStatusAsync(AppointmentStatus status, CancellationToken ct = default);
    Task<int> GetCountByDateAsync(DateOnly date, CancellationToken ct = default);
    Task<int> GetCountByDateRangeAsync(DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<List<Appointment>> GetRecentAsync(int count, CancellationToken ct = default);
    Task<Dictionary<int, int>> GetMonthlyTrendsAsync(int year, CancellationToken ct = default);
}

public interface IAuditLogRepository
{
    Task AddAsync(AuditLog log, CancellationToken ct = default);
    Task<(List<AuditLog> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize,
        DateOnly? from = null, DateOnly? to = null,
        AuditAction? action = null, Guid? profileId = null,
        string? search = null,
        CancellationToken ct = default);
    Task<AuditLog?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<AuditLog>> GetRecentAsync(int count, CancellationToken ct = default);
}
