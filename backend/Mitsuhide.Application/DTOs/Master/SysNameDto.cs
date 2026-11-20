using System.ComponentModel.DataAnnotations;

namespace Mitsuhide.Application.DTOs.Master;

public class SysNameDto
{
    public string NameKbn { get; set; } = string.Empty;
    public string NameCd { get; set; } = string.Empty;
    public string Ch1 { get; set; } = string.Empty;
    public string? Ch2 { get; set; }
    public decimal? Nm1 { get; set; }
    public decimal? Nm2 { get; set; }
    public int? Date1 { get; set; }
    public int? Date2 { get; set; }
    public string? NewUser { get; set; }
    public DateTime? NewDate { get; set; }
    public string? NewApid { get; set; }
    public string? NewWsnm { get; set; }
    public string? UpdUser { get; set; }
    public DateTime? UpdDate { get; set; }
    public string? UpdApid { get; set; }
    public string? UpdWsnm { get; set; }
}

public class CreateSysNameRequest
{
    [Required(ErrorMessage = "名称区分は必須です。")]
    [StringLength(5, ErrorMessage = "名称区分は5文字以内で入力してください。")]
    public string NameKbn { get; set; } = string.Empty;

    [Required(ErrorMessage = "名称コードは必須です。")]
    [StringLength(7, ErrorMessage = "名称コードは7文字以内で入力してください。")]
    public string NameCd { get; set; } = string.Empty;

    [Required(ErrorMessage = "文字項目1は必須です。")]
    [StringLength(100, ErrorMessage = "文字項目1は100文字以内で入力してください。")]
    public string Ch1 { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "文字項目2は100文字以内で入力してください。")]
    public string? Ch2 { get; set; }

    public decimal? Nm1 { get; set; }
    public decimal? Nm2 { get; set; }
}

public class UpdateSysNameRequest
{
    [Required(ErrorMessage = "文字項目1は必須です。")]
    [StringLength(100, ErrorMessage = "文字項目1は100文字以内で入力してください。")]
    public string Ch1 { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "文字項目2は100文字以内で入力してください。")]
    public string? Ch2 { get; set; }

    public decimal? Nm1 { get; set; }
    public decimal? Nm2 { get; set; }
    public DateTime? UpdDate { get; set; }
}
