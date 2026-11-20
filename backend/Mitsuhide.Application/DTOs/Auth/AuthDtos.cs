using System.ComponentModel.DataAnnotations;

namespace Mitsuhide.Application.DTOs.Auth;

public class LoginRequestDto
{
    [Required(ErrorMessage = "社員コードは必須です。")]
    [StringLength(6, ErrorMessage = "社員コードは6文字以内で入力してください。")]
    public string UserCd { get; set; } = string.Empty;

    [Required(ErrorMessage = "パスワードは必須です。")]
    [StringLength(100, ErrorMessage = "パスワードは100文字以内で入力してください。")]
    public string Password { get; set; } = string.Empty;
}

public class ChangePasswordRequestDto
{
    [Required(ErrorMessage = "社員コードは必須です。")]
    [StringLength(6, ErrorMessage = "社員コードは6文字以内で入力してください。")]
    public string UserCd { get; set; } = string.Empty;

    [Required(ErrorMessage = "現在のパスワードは必須です。")]
    public string OldPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "新パスワードは必須です。")]
    [StringLength(50, MinimumLength = 4, ErrorMessage = "新パスワードは4文字以上50文字以内で入力してください。")]
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
    public bool PasswordExpired { get; set; }
    public string? PasswordExpiredMessage { get; set; }
    public string? MonthlyClosingWarning { get; set; }
}
