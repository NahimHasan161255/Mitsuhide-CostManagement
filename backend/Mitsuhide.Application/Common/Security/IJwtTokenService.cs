namespace Mitsuhide.Application.Common.Security;

public interface IJwtTokenService
{
    /// <summary>
    /// Generates a signed JWT token containing user identity and role claims.
    /// </summary>
    string GenerateToken(string userCd, string userName, string? userGrpCd, int tantoKbn, int syubetu);
}
