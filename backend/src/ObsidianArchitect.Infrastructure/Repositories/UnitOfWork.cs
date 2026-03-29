using ObsidianArchitect.Application.Interfaces;
using ObsidianArchitect.Infrastructure.Data;

namespace ObsidianArchitect.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _ctx;

    public UnitOfWork(AppDbContext ctx)
    {
        _ctx = ctx;
        Profiles = new ProfileRepository(ctx);
        AppSettings = new AppSettingRepository(ctx);
        ServiceStations = new ServiceStationRepository(ctx);
        ScheduleDays = new ScheduleDayRepository(ctx);
        TimeSlots = new TimeSlotRepository(ctx);
        Appointments = new AppointmentRepository(ctx);
        AuditLogs = new AuditLogRepository(ctx);
    }

    public IProfileRepository Profiles { get; }
    public IAppSettingRepository AppSettings { get; }
    public IServiceStationRepository ServiceStations { get; }
    public IScheduleDayRepository ScheduleDays { get; }
    public ITimeSlotRepository TimeSlots { get; }
    public IAppointmentRepository Appointments { get; }
    public IAuditLogRepository AuditLogs { get; }

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _ctx.SaveChangesAsync(ct);

    public void Dispose() => _ctx.Dispose();
}
