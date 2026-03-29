using ObsidianArchitect.Domain.Enums;

namespace ObsidianArchitect.Domain.Entities;

public class Appointment
{
    public Guid Id { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public Guid ProfileId { get; set; }
    public Guid TimeSlotId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int DurationMinutes { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Booked;
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public bool CanCancel => Status == AppointmentStatus.Booked;
    public bool IsActive => Status == AppointmentStatus.Booked;
    public bool IsPast => Status == AppointmentStatus.Completed || Status == AppointmentStatus.NoShow;

    // Navigation
    public Profile Profile { get; set; } = null!;
    public TimeSlot TimeSlot { get; set; } = null!;

    public static string GenerateBookingCode()
    {
        var random = new Random();
        return $"OA-{random.Next(10000, 99999):D5}-{(char)('A' + random.Next(0, 26))}";
    }
}
