namespace ObsidianArchitect.Domain.Enums;

public enum AuditAction
{
    AppointmentBooked = 0,
    AppointmentCancelled = 1,
    AppointmentCompleted = 2,
    AppointmentNoShow = 3,
    ScheduleDayCreated = 10,
    ScheduleDayUpdated = 11,
    SlotGenerated = 12,
    SlotUpdated = 13,
    SettingsUpdated = 14,
    UserRegistered = 20,
    UserLoggedIn = 21
}
