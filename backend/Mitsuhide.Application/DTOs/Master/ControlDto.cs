using System.ComponentModel.DataAnnotations;

namespace Mitsuhide.Application.DTOs.Master;

public class ControlDto
{
    public string SubSysCd { get; set; } = string.Empty;
    public string ProgId { get; set; } = string.Empty;
    public string KanriName { get; set; } = string.Empty;
    public decimal? Nm1 { get; set; }
    public decimal? Nm2 { get; set; }
    public string? Ch1 { get; set; }
    public string? Ch2 { get; set; }
    public string? NewUser { get; set; }
    public DateTime? NewDate { get; set; }
    public string? NewApid { get; set; }
    public string? NewWsnm { get; set; }
    public string? UpdUser { get; set; }
    public DateTime? UpdDate { get; set; }
    public string? UpdApid { get; set; }
    public string? UpdWsnm { get; set; }
}

public class CreateControlRequest
{
    [Required(ErrorMessage = "サブシステムコードは必須です。")]
    [StringLength(2, ErrorMessage = "サブシステムコードは2文字以内で入力してください。")]
    public string SubSysCd { get; set; } = string.Empty;

    [Required(ErrorMessage = "プログラムIDは必須です。")]
    [StringLength(10, ErrorMessage = "プログラムIDは10文字以内で入力してください。")]
    public string ProgId { get; set; } = string.Empty;

    [Required(ErrorMessage = "管理名称は必須です。")]
    [StringLength(40, ErrorMessage = "管理名称は40文字以内で入力してください。")]
    public string KanriName { get; set; } = string.Empty;

    public decimal? Nm1 { get; set; }
    public decimal? Nm2 { get; set; }

    [StringLength(50, ErrorMessage = "設定文字1は50文字以内で入力してください。")]
    public string? Ch1 { get; set; }

    [StringLength(50, ErrorMessage = "設定文字2は50文字以内で入力してください。")]
    public string? Ch2 { get; set; }
}

public class UpdateControlRequest
{
    [Required(ErrorMessage = "管理名称は必須です。")]
    [StringLength(40, ErrorMessage = "管理名称は40文字以内で入力してください。")]
    public string KanriName { get; set; } = string.Empty;

    public decimal? Nm1 { get; set; }
    public decimal? Nm2 { get; set; }

    [StringLength(50, ErrorMessage = "設定文字1は50文字以内で入力してください。")]
    public string? Ch1 { get; set; }

    [StringLength(50, ErrorMessage = "設定文字2は50文字以内で入力してください。")]
    public string? Ch2 { get; set; }

    public DateTime? UpdDate { get; set; }
}
