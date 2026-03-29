namespace ObsidianArchitect.Domain.Entities;

public class AppSetting
{
    public Guid Id { get; set; }
    public int DefaultAppointmentDurationMinutes { get; set; } = 45;
    public int BufferTimeMinutes { get; set; } = 5;
    public int DefaultStationCapacity { get; set; } = 1;
    public bool AllowDynamicScaling { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
