namespace Mitsuhide.Application.DTOs.Auth;

public class LoginRequestDto
{
    public string UserCd { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class ChangePasswordRequestDto
{
    public string UserCd { get; set; } = string.Empty;
    public string OldPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class AuthUserDto
{
    public string UserCd { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserNameR { get; set; }
    public string? UserNameK { get; set; }
    public int TantoKbn { get; set; }
    public string TantoKbnNm { get; set; } = string.Empty;
    public string? UserGrpCd { get; set; }
    public string? UserGrpNm { get; set; }
    public int Syubetu { get; set; }
    public string SyubetuNm { get; set; } = string.Empty;
    public DateTime? LoginDate { get; set; }
    public DateTime? PassUpdDate { get; set; }
}

public class LoginResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public AuthUserDto? User { get; set; }
    public string? Token { get; set; }
}
