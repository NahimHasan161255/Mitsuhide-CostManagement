using System.ComponentModel.DataAnnotations;

namespace Mitsuhide.Application.DTOs.Master;

public class UserDto
{
    public string UserCd { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserNameR { get; set; }
    public string? UserNameK { get; set; }
    public int TantoKbn { get; set; }
    public string TantoKbnNm => TantoKbn == 1 ? "担当者" : "担当者以外";
    public string? UserGrpCd { get; set; }
    public string? UserGrpNm { get; set; }
    public int Syubetu { get; set; }
    public string SyubetuNm => Syubetu switch
    {
        1 => "営業部",
        5 => "工務部",
        9 => "経理部",
        _ => "その他"
    };
    public string? Biko { get; set; }
    public bool DeleteFlg { get; set; }
    public DateTime? LoginDate { get; set; }
    public DateTime? PassUpdDate { get; set; }
    public int? PassKigen { get; set; }
    public int? UserKigen { get; set; }
    public string? NewUser { get; set; }
    public DateTime? NewDate { get; set; }
    public string? NewApid { get; set; }
    public string? NewWsnm { get; set; }
    public string? UpdUser { get; set; }
    public DateTime? UpdDate { get; set; }
    public string? UpdApid { get; set; }
    public string? UpdWsnm { get; set; }
}

public class CreateUserRequest
{
    [Required(ErrorMessage = "ユーザーコードは必須です。")]
    [StringLength(6, MinimumLength = 1, ErrorMessage = "ユーザーコードは6文字以内で入力してください。")]
    public string UserCd { get; set; } = string.Empty;

    [Required(ErrorMessage = "ユーザー名は必須です。")]
    [StringLength(20, ErrorMessage = "ユーザー名は20文字以内で入力してください。")]
    public string UserName { get; set; } = string.Empty;

    [StringLength(10, ErrorMessage = "略称は10文字以内で入力してください。")]
    public string? UserNameR { get; set; }

    [StringLength(20, ErrorMessage = "カナ名は20文字以内で入力してください。")]
    public string? UserNameK { get; set; }

    [Range(1, 2, ErrorMessage = "担当者区分は1(担当者)または2(担当者以外)を指定してください。")]
    public int TantoKbn { get; set; } = 1;

    [Required(ErrorMessage = "ユーザーグループコードは必須です。")]
    [StringLength(4, ErrorMessage = "ユーザーグループコードは4文字以内で入力してください。")]
    public string UserGrpCd { get; set; } = "1";

    public int Syubetu { get; set; } = 1;

    [StringLength(40, ErrorMessage = "備考は40文字以内で入力してください。")]
    public string? Biko { get; set; }

    public bool DeleteFlg { get; set; } = false;

    [Required(ErrorMessage = "初期パスワードは必須です。")]
    [StringLength(50, MinimumLength = 4, ErrorMessage = "パスワードは4文字以上50文字以内で入力してください。")]
    public string Password { get; set; } = "user123";
}

public class UpdateUserRequest
{
    [Required(ErrorMessage = "ユーザー名は必須です。")]
    [StringLength(20, ErrorMessage = "ユーザー名は20文字以内で入力してください。")]
    public string UserName { get; set; } = string.Empty;

    [StringLength(10, ErrorMessage = "略称は10文字以内で入力してください。")]
    public string? UserNameR { get; set; }

    [StringLength(20, ErrorMessage = "カナ名は20文字以内で入力してください。")]
    public string? UserNameK { get; set; }

    [Range(1, 2, ErrorMessage = "担当者区分は1(担当者)または2(担当者以外)を指定してください。")]
    public int TantoKbn { get; set; }

    [Required(ErrorMessage = "ユーザーグループコードは必須です。")]
    [StringLength(4, ErrorMessage = "ユーザーグループコードは4文字以内で入力してください。")]
    public string UserGrpCd { get; set; } = "1";

    public int Syubetu { get; set; }

    [StringLength(40, ErrorMessage = "備考は40文字以内で入力してください。")]
    public string? Biko { get; set; }

    public bool? DeleteFlg { get; set; }

    [StringLength(50, MinimumLength = 4, ErrorMessage = "新パスワードは4文字以上50文字以内で入力してください。")]
    public string? NewPassword { get; set; }

    [StringLength(50, MinimumLength = 4, ErrorMessage = "パスワードは4文字以上50文字以内で入力してください。")]
    public string? Password { get; set; }

    public DateTime? UpdDate { get; set; }
}
