using System.ComponentModel.DataAnnotations;

namespace Mitsuhide.Application.DTOs.Master;

public class UserGrpDto
{
    public string UserGrpCd { get; set; } = string.Empty;
    public string UserGrpName { get; set; } = string.Empty;
    public int RunAplCnt { get; set; }
    public string? NewUser { get; set; }
    public DateTime? NewDate { get; set; }
    public string? NewApid { get; set; }
    public string? NewWsnm { get; set; }
    public string? UpdUser { get; set; }
    public DateTime? UpdDate { get; set; }
    public string? UpdApid { get; set; }
    public string? UpdWsnm { get; set; }
}

public class CreateUserGrpRequest
{
    [Required(ErrorMessage = "グループコードは必須です。")]
    [StringLength(4, ErrorMessage = "グループコードは4文字以内で入力してください。")]
    public string UserGrpCd { get; set; } = string.Empty;

    [Required(ErrorMessage = "グループ名は必須です。")]
    [StringLength(20, ErrorMessage = "グループ名は20文字以内で入力してください。")]
    public string UserGrpName { get; set; } = string.Empty;

    [Range(1, 99, ErrorMessage = "同時実行APL数は1から99の範囲で入力してください。")]
    public int RunAplCnt { get; set; } = 5;
}

public class UpdateUserGrpRequest
{
    [Required(ErrorMessage = "グループ名は必須です。")]
    [StringLength(20, ErrorMessage = "グループ名は20文字以内で入力してください。")]
    public string UserGrpName { get; set; } = string.Empty;

    [Range(1, 99, ErrorMessage = "同時実行APL数は1から99の範囲で入力してください。")]
    public int RunAplCnt { get; set; } = 5;

    public DateTime? UpdDate { get; set; }
}
