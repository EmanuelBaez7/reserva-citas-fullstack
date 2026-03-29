using ObsidianArchitect.Domain.Enums;

namespace ObsidianArchitect.Domain.Entities;

public class TimeSlot
{
    public Guid Id { get; set; }
    public Guid ScheduleDayId { get; set; }
    public Guid? ServiceStationId { get; set; }
    public ShiftType Shift { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int Capacity { get; set; } = 1;
    public int BookedCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Computed status
    public SlotStatus Status
    {
        get
        {
            if (!IsActive) return SlotStatus.Blocked;
            if (BookedCount >= Capacity) return SlotStatus.Full;
            if (Capacity - BookedCount <= 2) return SlotStatus.Limited;
            return SlotStatus.Available;
        }
    }

    public int RemainingCapacity => Math.Max(0, Capacity - BookedCount);

    // Navigation
    public ScheduleDay ScheduleDay { get; set; } = null!;
    public ServiceStation? ServiceStation { get; set; }
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
