using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Application.Interfaces;
using ObsidianArchitect.Domain.Enums;

namespace ObsidianArchitect.Application.Services;

public class AdminDashboardService
{
    private readonly IUnitOfWork _uow;

    public AdminDashboardService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    /// <summary>
    /// Returns dashboard overview matching the 4 stat cards + today stats.
    /// </summary>
    public async Task<DashboardOverviewDto> GetOverviewAsync(CancellationToken ct = default)
    {
        var totalBookings = await _uow.Appointments.GetTotalCountAsync(ct);
        var cancelledCount = await _uow.Appointments.GetCountByStatusAsync(AppointmentStatus.Cancelled, ct);
        var activeConfigs = await _uow.ScheduleDays.GetEnabledCountAsync(ct);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var todayBookings = await _uow.Appointments.GetCountByDateAsync(today, ct);
        var todayCapacity = await _uow.TimeSlots.GetTotalCapacityAsync(today, ct);
        var todayBooked = await _uow.TimeSlots.GetTotalBookedAsync(today, ct);
        var todayOpenSlots = await _uow.TimeSlots.GetTotalAvailableCountAsync(today, ct);

        double occupancy = todayCapacity > 0 ? Math.Round((double)todayBooked / todayCapacity * 100, 1) : 0;

        // Calculate trend (compare last 30 days vs previous 30)
        var last30Start = today.AddDays(-30);
        var prev30Start = today.AddDays(-60);
        var last30 = await _uow.Appointments.GetCountByDateRangeAsync(last30Start, today, ct);
        var prev30 = await _uow.Appointments.GetCountByDateRangeAsync(prev30Start, last30Start, ct);
        var bookingTrend = prev30 > 0 ? Math.Round((double)(last30 - prev30) / prev30 * 100, 0) : 0;

        return new DashboardOverviewDto(
            new StatCardDto("Total Bookings", totalBookings.ToString("N0"),
                $"{(bookingTrend >= 0 ? "+" : "")}{bookingTrend}%",
                bookingTrend >= 0 ? "up" : "down"),
            new StatCardDto("Cancelled", cancelledCount.ToString(),
                null, cancelledCount > 0 ? "down" : "neutral"),
            new StatCardDto("Occupancy Rate", $"{occupancy}%",
                occupancy >= 90 ? "Peak" : occupancy >= 70 ? "High" : "Normal", "neutral"),
            new StatCardDto("Active Configs", activeConfigs.ToString(),
                "Stable", "neutral"),
            new TodayStatsDto(todayBookings, todayOpenSlots, todayCapacity)
        );
    }

    /// <summary>
    /// Returns recent booking activity for the live transaction log.
    /// </summary>
    public async Task<DashboardActivityDto> GetRecentActivityAsync(CancellationToken ct = default)
    {
        var recent = await _uow.Appointments.GetRecentAsync(10, ct);

        var items = recent.Select(a => new ActivityItemDto(
            a.Id,
            a.Profile?.FullName ?? "Unknown",
            a.Profile?.Email,
            a.Profile?.AvatarUrl,
            $"{a.Status.ToString()} Booking • {a.BookingCode}",
            a.BookingCode,
            a.Status.ToString().ToLower(),
            a.Status switch
            {
                AppointmentStatus.Booked => "Confirmed",
                AppointmentStatus.Cancelled => "Cancelled",
                AppointmentStatus.Completed => "Completed",
                AppointmentStatus.NoShow => "No Show",
                _ => "Pending"
            },
            a.CreatedAt
        )).ToList();

        return new DashboardActivityDto(items);
    }

    /// <summary>
    /// Returns analytics data for charts: monthly trends and peak hours.
    /// </summary>
    public async Task<DashboardAnalyticsDto> GetAnalyticsAsync(CancellationToken ct = default)
    {
        var year = DateTime.UtcNow.Year;
        var trends = await _uow.Appointments.GetMonthlyTrendsAsync(year, ct);

        var months = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };

        var monthlyTrends = months.Select((m, i) => new MonthlyTrendDto(
            m, trends.GetValueOrDefault(i + 1, 0))).ToList();

        // Peak hours (simplified — would normally be calculated from slot booking distributions)
        var peakHours = new PeakHoursDto("09:00 - 11:00", 75, "14:00 - 16:00", 45);

        return new DashboardAnalyticsDto(monthlyTrends, peakHours);
    }
}
