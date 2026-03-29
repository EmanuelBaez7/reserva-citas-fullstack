using ObsidianArchitect.Domain.Enums;

namespace ObsidianArchitect.Application.DTOs;

// ─── Auth DTOs ───────────────────────────────────────────
public record RegisterRequest(string Email, string Password, string FullName);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, UserProfileDto User);
public record UserProfileDto(
    Guid Id, string Email, string FullName, string Role,
    bool IsActive, string? AvatarUrl, DateTime CreatedAt);

// ─── Booking Flow DTOs ────────────────────────────────────
public record BookingDateDto(
    DateOnly Date, string DayOfWeek, int AvailableSlots,
    int TotalSlots, string Status); // "available", "limited", "full", "disabled"

public record ShiftDto(
    string Name, ShiftType Type, bool IsEnabled,
    string StartTime, string EndTime, int AvailableSlots);

public record TimeSlotDto(
    Guid Id, string StartTime, string EndTime, ShiftType Shift,
    string Status, int Capacity, int BookedCount,
    int Remaining, bool IsBookable, string? StationName);

public record CreateAppointmentRequest(Guid TimeSlotId, DateOnly Date, string? Notes);
public record CancelAppointmentRequest(string? Reason);

// ─── Appointment DTOs ─────────────────────────────────────
public record AppointmentDto(
    Guid Id, string BookingCode, DateOnly Date,
    string StartTime, string EndTime, int DurationMinutes,
    string Status, string Shift, bool CanCancel,
    string? StationName, string? Notes, string? CancellationReason,
    DateTime CreatedAt);

public record AppointmentDetailDto(
    Guid Id, string BookingCode, DateOnly Date,
    string StartTime, string EndTime, int DurationMinutes,
    string Status, string Shift, bool CanCancel,
    string? StationName, string? Notes, string? CancellationReason,
    DateTime CreatedAt, DateTime UpdatedAt);

// ─── Admin Dashboard DTOs ─────────────────────────────────
public record DashboardOverviewDto(
    StatCardDto TotalBookings, StatCardDto CancelledAppointments,
    StatCardDto OccupancyRate, StatCardDto ActiveConfigs,
    TodayStatsDto TodayStats);

public record StatCardDto(string Label, string Value, string? Trend, string? TrendDirection);
public record TodayStatsDto(int TodayBookings, int OpenSlots, int TotalCapacity);

public record DashboardActivityDto(List<ActivityItemDto> RecentActivity);
public record ActivityItemDto(
    Guid Id, string UserName, string? UserEmail, string? UserAvatar,
    string Description, string BookingCode, string Status,
    string StatusLabel, DateTime Timestamp);

public record DashboardAnalyticsDto(
    List<MonthlyTrendDto> BookingTrends,
    PeakHoursDto PeakHours);
public record MonthlyTrendDto(string Month, int Bookings);
public record PeakHoursDto(string AmPeak, double AmLoad, string PmPeak, double PmLoad);

// ─── Admin Schedule DTOs ──────────────────────────────────
public record ScheduleOverviewDto(
    AppSettingsDto Settings,
    List<ScheduleDayDto> Days,
    List<ServiceStationDto> Stations);

public record AppSettingsDto(
    Guid Id, int DefaultAppointmentDurationMinutes,
    int BufferTimeMinutes, int DefaultStationCapacity,
    bool AllowDynamicScaling);

public record ScheduleDayDto(
    Guid Id, DateOnly Date, string DayOfWeek, bool IsEnabled,
    bool MorningShiftEnabled, bool AfternoonShiftEnabled,
    bool EveningShiftEnabled, int TotalSlots, int BookedSlots);

public record ServiceStationDto(Guid Id, string Name, string? Description, bool IsActive);

public record CreateScheduleDayRequest(DateOnly Date, bool IsEnabled,
    bool MorningShiftEnabled, bool AfternoonShiftEnabled, bool EveningShiftEnabled);

public record UpdateScheduleDayRequest(bool? IsEnabled,
    bool? MorningShiftEnabled, bool? AfternoonShiftEnabled, bool? EveningShiftEnabled);

public record GenerateSlotsRequest(DateOnly StartDate, DateOnly EndDate,
    int? DurationMinutes, int? CapacityPerSlot);

public record UpdateSlotRequest(int? Capacity, bool? IsActive);

public record UpdateSettingsRequest(int? DefaultAppointmentDurationMinutes,
    int? BufferTimeMinutes, int? DefaultStationCapacity, bool? AllowDynamicScaling);

// ─── Admin Logs DTOs ──────────────────────────────────────
public record AuditLogDto(
    Guid Id, string? UserName, string? UserEmail, string? UserAvatar,
    string Action, string EntityType, Guid? EntityId,
    string? Details, string StatusLabel,
    string LogRef, DateTime Timestamp);

public record AuditLogDetailDto(
    Guid Id, string? UserName, string? UserEmail,
    string Action, string EntityType, Guid? EntityId,
    string? Details, string? IpAddress, string StatusLabel,
    string LogRef, DateTime Timestamp);

public record PagedResult<T>(
    List<T> Items, int TotalCount, int Page,
    int PageSize, int TotalPages);

// ─── Common ───────────────────────────────────────────────
public record ApiError(string Code, string Message, object? Details = null);
