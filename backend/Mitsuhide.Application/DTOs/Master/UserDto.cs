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
}

public class CreateUserRequest
{
    public string UserCd { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserNameR { get; set; }
    public string? UserNameK { get; set; }
    public int TantoKbn { get; set; } = 1;
    public string UserGrpCd { get; set; } = "1";
    public int Syubetu { get; set; } = 1;
    public string? Biko { get; set; }
    public bool DeleteFlg { get; set; } = false;
    public string Password { get; set; } = "user123";
}

public class UpdateUserRequest
{
    public string UserName { get; set; } = string.Empty;
    public string? UserNameR { get; set; }
    public string? UserNameK { get; set; }
    public int TantoKbn { get; set; }
    public string UserGrpCd { get; set; } = "1";
    public int Syubetu { get; set; }
    public string? Biko { get; set; }
    public bool? DeleteFlg { get; set; }
    public string? NewPassword { get; set; }
    public string? Password { get; set; }
}
