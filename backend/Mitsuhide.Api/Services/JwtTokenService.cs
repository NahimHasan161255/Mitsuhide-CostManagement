using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Mitsuhide.Application.Common.Security;

namespace Mitsuhide.Api.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _config;

    public JwtTokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(string userCd, string userName, string? userGrpCd, int tantoKbn, int syubetu)
    {
        var secretKey = _config["Jwt:Key"] ?? "MitsuhideEnterpriseCostManagementSecretKey2026!#SecureJWT";
        var issuer = _config["Jwt:Issuer"] ?? "MitsuhideApi";
        var audience = _config["Jwt:Audience"] ?? "MitsuhideClient";
        var expireHours = int.TryParse(_config["Jwt:ExpireHours"], out int h) ? h : 12;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userCd),
            new("userCd", userCd),
            new(ClaimTypes.Name, userName),
            new("userGrpCd", userGrpCd ?? ""),
            new("tantoKbn", tantoKbn.ToString()),
            new("syubetu", syubetu.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Administrator role for TantoKbn == 2 or UserGrpCd == "9"
        if (tantoKbn == 2 || userGrpCd == "9")
        {
            claims.Add(new Claim(ClaimTypes.Role, "Administrator"));
        }
        else
        {
            claims.Add(new Claim(ClaimTypes.Role, "User"));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expireHours),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
