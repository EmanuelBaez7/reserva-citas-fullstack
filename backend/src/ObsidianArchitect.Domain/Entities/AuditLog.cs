using ObsidianArchitect.Domain.Enums;

namespace ObsidianArchitect.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; }
    public Guid? ProfileId { get; set; }
    public AuditAction Action { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public string StatusLabel { get; set; } = "Success";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Profile? Profile { get; set; }
}
