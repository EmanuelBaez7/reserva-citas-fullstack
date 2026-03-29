using System.Security.Claims;
using ObsidianArchitect.Application.Interfaces;

namespace ObsidianArchitect.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly ClaimsPrincipal? _user;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _user = httpContextAccessor.HttpContext?.User;
    }

    public Guid? UserId
    {
        get
        {
            var id = _user?.FindFirstValue(ClaimTypes.NameIdentifier);
            return id != null ? Guid.Parse(id) : null;
        }
    }

    public string? Email => _user?.FindFirstValue(ClaimTypes.Email);
    public string? Role => _user?.FindFirstValue(ClaimTypes.Role);
    public bool IsAdmin => Role == "Admin";
    public bool IsAuthenticated => _user?.Identity?.IsAuthenticated ?? false;
}
