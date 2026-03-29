namespace ObsidianArchitect.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(Guid userId, string email, string role);
}

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    string? Role { get; }
    bool IsAdmin { get; }
    bool IsAuthenticated { get; }
}
