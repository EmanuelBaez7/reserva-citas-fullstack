namespace ObsidianArchitect.Domain.Entities;

public class ScheduleDay
{
    public Guid Id { get; set; }
    public DateOnly Date { get; set; }
    public bool IsEnabled { get; set; } = true;
    public bool MorningShiftEnabled { get; set; } = true;
    public bool AfternoonShiftEnabled { get; set; } = true;
    public bool EveningShiftEnabled { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TimeSlot> TimeSlots { get; set; } = new List<TimeSlot>();
}
