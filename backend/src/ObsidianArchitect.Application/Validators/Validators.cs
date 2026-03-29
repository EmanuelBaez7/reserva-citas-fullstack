using FluentValidation;
using ObsidianArchitect.Application.DTOs;

namespace ObsidianArchitect.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(128);
        RuleFor(x => x.FullName).NotEmpty().MinimumLength(2).MaximumLength(256);
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class CreateAppointmentRequestValidator : AbstractValidator<CreateAppointmentRequest>
{
    public CreateAppointmentRequestValidator()
    {
        RuleFor(x => x.TimeSlotId).NotEmpty();
        RuleFor(x => x.Date).NotEmpty()
            .Must(d => d >= DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Cannot book appointments in the past.");
    }
}

public class CreateScheduleDayRequestValidator : AbstractValidator<CreateScheduleDayRequest>
{
    public CreateScheduleDayRequestValidator()
    {
        RuleFor(x => x.Date).NotEmpty();
    }
}

public class GenerateSlotsRequestValidator : AbstractValidator<GenerateSlotsRequest>
{
    public GenerateSlotsRequestValidator()
    {
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).NotEmpty()
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("End date must be on or after start date.");
        RuleFor(x => x.DurationMinutes).GreaterThan(0).When(x => x.DurationMinutes.HasValue);
        RuleFor(x => x.CapacityPerSlot).GreaterThan(0).When(x => x.CapacityPerSlot.HasValue);
    }
}

public class UpdateSettingsRequestValidator : AbstractValidator<UpdateSettingsRequest>
{
    public UpdateSettingsRequestValidator()
    {
        RuleFor(x => x.DefaultAppointmentDurationMinutes)
            .GreaterThan(0).When(x => x.DefaultAppointmentDurationMinutes.HasValue);
        RuleFor(x => x.BufferTimeMinutes)
            .GreaterThanOrEqualTo(0).When(x => x.BufferTimeMinutes.HasValue);
        RuleFor(x => x.DefaultStationCapacity)
            .GreaterThan(0).When(x => x.DefaultStationCapacity.HasValue);
    }
}
