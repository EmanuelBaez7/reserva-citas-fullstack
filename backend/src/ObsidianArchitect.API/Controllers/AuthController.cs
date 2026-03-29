using Microsoft.AspNetCore.Mvc;
using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Application.Services;

namespace ObsidianArchitect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var response = await _authService.RegisterAsync(request);
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        return Ok(response);
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetCurrentUser([FromServices] ObsidianArchitect.Application.Interfaces.ICurrentUserService currentUser)
    {
        if (currentUser.UserId == null) return Unauthorized();
        var profile = await _authService.GetCurrentUserAsync(currentUser.UserId.Value);
        return Ok(profile);
    }
}
