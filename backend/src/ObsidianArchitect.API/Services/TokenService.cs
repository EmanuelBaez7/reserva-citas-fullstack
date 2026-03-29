using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ObsidianArchitect.Application.Interfaces;

namespace ObsidianArchitect.API.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(Guid userId, string email, string role)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? "ObsidianArchitectSuperSecretKeyForJWT2024!Min32Chars"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Role, role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Sub, userId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "ObsidianArchitect",
            audience: _config["Jwt:Audience"] ?? "ObsidianArchitectClient",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
