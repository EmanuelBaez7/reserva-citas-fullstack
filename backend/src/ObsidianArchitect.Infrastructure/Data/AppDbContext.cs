using Microsoft.EntityFrameworkCore;
using ObsidianArchitect.Domain.Entities;

namespace ObsidianArchitect.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<AppSetting> AppSettings => Set<AppSetting>();
    public DbSet<ServiceStation> ServiceStations => Set<ServiceStation>();
    public DbSet<ScheduleDay> ScheduleDays => Set<ScheduleDay>();
    public DbSet<TimeSlot> TimeSlots => Set<TimeSlot>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─── Profile ────────────────────────────────────
        modelBuilder.Entity<Profile>(e =>
        {
            e.ToTable("profiles");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.Email).HasColumnName("email").HasMaxLength(256).IsRequired();
            e.Property(p => p.PasswordHash).HasColumnName("password_hash").HasMaxLength(512).IsRequired();
            e.Property(p => p.FullName).HasColumnName("full_name").HasMaxLength(256).IsRequired();
            e.Property(p => p.Role).HasColumnName("role").HasConversion<string>().HasMaxLength(20);
            e.Property(p => p.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(p => p.AvatarUrl).HasColumnName("avatar_url").HasMaxLength(1024);
            e.Property(p => p.CreatedAt).HasColumnName("created_at");
            e.Property(p => p.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(p => p.Email).IsUnique();
        });

        // ─── AppSetting ─────────────────────────────────
        modelBuilder.Entity<AppSetting>(e =>
        {
            e.ToTable("app_settings");
            e.HasKey(s => s.Id);
            e.Property(s => s.Id).HasColumnName("id");
            e.Property(s => s.DefaultAppointmentDurationMinutes).HasColumnName("default_appointment_duration_minutes");
            e.Property(s => s.BufferTimeMinutes).HasColumnName("buffer_time_minutes");
            e.Property(s => s.DefaultStationCapacity).HasColumnName("default_station_capacity");
            e.Property(s => s.AllowDynamicScaling).HasColumnName("allow_dynamic_scaling");
            e.Property(s => s.IsActive).HasColumnName("is_active");
            e.Property(s => s.UpdatedAt).HasColumnName("updated_at");
        });

        // ─── ServiceStation ─────────────────────────────
        modelBuilder.Entity<ServiceStation>(e =>
        {
            e.ToTable("service_stations");
            e.HasKey(s => s.Id);
            e.Property(s => s.Id).HasColumnName("id");
            e.Property(s => s.Name).HasColumnName("name").HasMaxLength(256).IsRequired();
            e.Property(s => s.Description).HasColumnName("description").HasMaxLength(1024);
            e.Property(s => s.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(s => s.CreatedAt).HasColumnName("created_at");
        });

        // ─── ScheduleDay ────────────────────────────────
        modelBuilder.Entity<ScheduleDay>(e =>
        {
            e.ToTable("schedule_days");
            e.HasKey(d => d.Id);
            e.Property(d => d.Id).HasColumnName("id");
            e.Property(d => d.Date).HasColumnName("date").IsRequired();
            e.Property(d => d.IsEnabled).HasColumnName("is_enabled").HasDefaultValue(true);
            e.Property(d => d.MorningShiftEnabled).HasColumnName("morning_shift_enabled").HasDefaultValue(true);
            e.Property(d => d.AfternoonShiftEnabled).HasColumnName("afternoon_shift_enabled").HasDefaultValue(true);
            e.Property(d => d.EveningShiftEnabled).HasColumnName("evening_shift_enabled").HasDefaultValue(false);
            e.Property(d => d.CreatedAt).HasColumnName("created_at");
            e.Property(d => d.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(d => d.Date).IsUnique();
        });

        // ─── TimeSlot ───────────────────────────────────
        modelBuilder.Entity<TimeSlot>(e =>
        {
            e.ToTable("time_slots");
            e.HasKey(s => s.Id);
            e.Property(s => s.Id).HasColumnName("id");
            e.Property(s => s.ScheduleDayId).HasColumnName("schedule_day_id").IsRequired();
            e.Property(s => s.ServiceStationId).HasColumnName("service_station_id");
            e.Property(s => s.Shift).HasColumnName("shift").HasConversion<string>().HasMaxLength(20);
            e.Property(s => s.StartTime).HasColumnName("start_time").IsRequired();
            e.Property(s => s.EndTime).HasColumnName("end_time").IsRequired();
            e.Property(s => s.Capacity).HasColumnName("capacity").HasDefaultValue(1);
            e.Property(s => s.BookedCount).HasColumnName("booked_count").HasDefaultValue(0);
            e.Property(s => s.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(s => s.CreatedAt).HasColumnName("created_at");
            e.Ignore(s => s.Status);
            e.Ignore(s => s.RemainingCapacity);
            e.HasOne(s => s.ScheduleDay).WithMany(d => d.TimeSlots).HasForeignKey(s => s.ScheduleDayId);
            e.HasOne(s => s.ServiceStation).WithMany(st => st.TimeSlots).HasForeignKey(s => s.ServiceStationId);
            e.HasIndex(s => new { s.ScheduleDayId, s.StartTime, s.Shift });
        });

        // ─── Appointment ────────────────────────────────
        modelBuilder.Entity<Appointment>(e =>
        {
            e.ToTable("appointments");
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).HasColumnName("id");
            e.Property(a => a.BookingCode).HasColumnName("booking_code").HasMaxLength(20).IsRequired();
            e.Property(a => a.ProfileId).HasColumnName("profile_id").IsRequired();
            e.Property(a => a.TimeSlotId).HasColumnName("time_slot_id").IsRequired();
            e.Property(a => a.Date).HasColumnName("date").IsRequired();
            e.Property(a => a.StartTime).HasColumnName("start_time").IsRequired();
            e.Property(a => a.EndTime).HasColumnName("end_time").IsRequired();
            e.Property(a => a.DurationMinutes).HasColumnName("duration_minutes");
            e.Property(a => a.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(20);
            e.Property(a => a.Notes).HasColumnName("notes").HasMaxLength(1024);
            e.Property(a => a.CancellationReason).HasColumnName("cancellation_reason").HasMaxLength(1024);
            e.Property(a => a.CreatedAt).HasColumnName("created_at");
            e.Property(a => a.UpdatedAt).HasColumnName("updated_at");
            e.Ignore(a => a.CanCancel);
            e.Ignore(a => a.IsActive);
            e.Ignore(a => a.IsPast);
            e.HasOne(a => a.Profile).WithMany(p => p.Appointments).HasForeignKey(a => a.ProfileId);
            e.HasOne(a => a.TimeSlot).WithMany(s => s.Appointments).HasForeignKey(a => a.TimeSlotId);
            e.HasIndex(a => a.BookingCode).IsUnique();
            e.HasIndex(a => new { a.ProfileId, a.Date });
        });

        // ─── AuditLog ───────────────────────────────────
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.ToTable("audit_logs");
            e.HasKey(l => l.Id);
            e.Property(l => l.Id).HasColumnName("id");
            e.Property(l => l.ProfileId).HasColumnName("profile_id");
            e.Property(l => l.Action).HasColumnName("action").HasConversion<string>().HasMaxLength(50);
            e.Property(l => l.EntityType).HasColumnName("entity_type").HasMaxLength(100);
            e.Property(l => l.EntityId).HasColumnName("entity_id");
            e.Property(l => l.Details).HasColumnName("details").HasMaxLength(2048);
            e.Property(l => l.IpAddress).HasColumnName("ip_address").HasMaxLength(50);
            e.Property(l => l.StatusLabel).HasColumnName("status_label").HasMaxLength(50);
            e.Property(l => l.CreatedAt).HasColumnName("created_at");
            e.HasOne(l => l.Profile).WithMany(p => p.AuditLogs).HasForeignKey(l => l.ProfileId);
            e.HasIndex(l => l.CreatedAt);
            e.HasIndex(l => l.Action);
        });

        // ─── Seed Data ──────────────────────────────────
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed admin user (password: Admin123!)
        var adminId = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
        modelBuilder.Entity<Profile>().HasData(new Profile
        {
            Id = adminId,
            Email = "admin@obsidian.io",
            PasswordHash = "$2a$11$k1c.5O1T3I.6O4uR.K3B4ey4r.p5r8G9y5P8j2t4O0P9r3k5O.v5C", // Hash for Admin123!
            FullName = "Obsidian Admin",
            Role = Domain.Enums.UserRole.Admin,
            IsActive = true,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // Seed default settings
        modelBuilder.Entity<AppSetting>().HasData(new AppSetting
        {
            Id = Guid.Parse("b2c3d4e5-f6a7-8901-bcde-f12345678901"),
            DefaultAppointmentDurationMinutes = 45,
            BufferTimeMinutes = 5,
            DefaultStationCapacity = 1,
            AllowDynamicScaling = false,
            IsActive = true,
            UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // Seed default station
        modelBuilder.Entity<ServiceStation>().HasData(new ServiceStation
        {
            Id = Guid.Parse("c3d4e5f6-a7b8-9012-cdef-123456789012"),
            Name = "The Obsidian Hub",
            Description = "Primary consultation studio",
            IsActive = true,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
