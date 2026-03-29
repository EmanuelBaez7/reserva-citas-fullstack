using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Application.Interfaces;
using ObsidianArchitect.Domain.Entities;
using ObsidianArchitect.Domain.Enums;
using ObsidianArchitect.Domain.Exceptions;

namespace ObsidianArchitect.Application.Services;

public class AuthService
{
    private readonly IUnitOfWork _uow;
    private readonly ITokenService _tokenService;

    public AuthService(IUnitOfWork uow, ITokenService tokenService)
    {
        _uow = uow;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var existing = await _uow.Profiles.GetByEmailAsync(request.Email, ct);
        if (existing != null)
            throw new BusinessRuleException("An account with this email already exists.", "EMAIL_EXISTS");

        var profile = new Profile
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLowerInvariant().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            Role = UserRole.User,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _uow.Profiles.AddAsync(profile, ct);

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ProfileId = profile.Id,
            Action = AuditAction.UserRegistered,
            EntityType = "Profile",
            EntityId = profile.Id,
            Details = $"User registered: {profile.Email}",
            StatusLabel = "Success"
        }, ct);

        await _uow.SaveChangesAsync(ct);

        var token = _tokenService.GenerateToken(profile.Id, profile.Email, profile.Role.ToString());
        return new AuthResponse(token, MapProfile(profile));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var profile = await _uow.Profiles.GetByEmailAsync(request.Email.ToLowerInvariant().Trim(), ct);
        if (profile == null || !BCrypt.Net.BCrypt.Verify(request.Password, profile.PasswordHash))
            throw new BusinessRuleException("Invalid email or password.", "INVALID_CREDENTIALS");

        if (!profile.IsActive)
            throw new BusinessRuleException("Your account has been deactivated.", "ACCOUNT_INACTIVE");

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ProfileId = profile.Id,
            Action = AuditAction.UserLoggedIn,
            EntityType = "Profile",
            EntityId = profile.Id,
            Details = $"User logged in: {profile.Email}",
            StatusLabel = "Success"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        var token = _tokenService.GenerateToken(profile.Id, profile.Email, profile.Role.ToString());
        return new AuthResponse(token, MapProfile(profile));
    }

    public async Task<UserProfileDto> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var profile = await _uow.Profiles.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("Profile", userId);
        return MapProfile(profile);
    }

    private static UserProfileDto MapProfile(Profile p) => new(
        p.Id, p.Email, p.FullName, p.Role.ToString(),
        p.IsActive, p.AvatarUrl, p.CreatedAt);
}
