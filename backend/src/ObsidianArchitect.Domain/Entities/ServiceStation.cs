namespace ObsidianArchitect.Domain.Entities;

public class ServiceStation
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TimeSlot> TimeSlots { get; set; } = new List<TimeSlot>();
}
