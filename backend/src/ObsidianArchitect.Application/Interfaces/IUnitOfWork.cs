namespace ObsidianArchitect.Application.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IProfileRepository Profiles { get; }
    IAppSettingRepository AppSettings { get; }
    IServiceStationRepository ServiceStations { get; }
    IScheduleDayRepository ScheduleDays { get; }
    ITimeSlotRepository TimeSlots { get; }
    IAppointmentRepository Appointments { get; }
    IAuditLogRepository AuditLogs { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
