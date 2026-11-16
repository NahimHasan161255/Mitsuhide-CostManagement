using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mitsuhide.Domain.Common;

namespace Mitsuhide.Domain.Entities.Master;

/// <summary>
/// 処理基準管理マスタ (AD_M_CONTROL - System Processing Standards & Base Control Master)
/// </summary>
[Table("AD_M_CONTROL")]
public class AdMControl : BaseEntity
{
    /// <summary>サブシステムCD (PKEY - vchr 2: GK, UR, SR, VM, AD)</summary>
    [MaxLength(2)]
    [Column("admcon_subsys_cd")]
    public string SubSysCd { get; set; } = string.Empty;

    /// <summary>プログラムID (PKEY - vchr 7: e.g. GK0010, VM0010)</summary>
    [MaxLength(7)]
    [Column("admcon_prog_id")]
    public string ProgId { get; set; } = string.Empty;

    /// <summary>管理名称 (vchr 40)</summary>
    [Required]
    [MaxLength(40)]
    [Column("admcon_kanri_name")]
    public string KanriName { get; set; } = string.Empty;

    /// <summary>数値項目1 (基準値、年月等)</summary>
    [Column("admcon_nm1", TypeName = "decimal(11,0)")]
    public decimal? Nm1 { get; set; }

    /// <summary>数値項目2 (税率等)</summary>
    [Column("admcon_nm2", TypeName = "decimal(11,0)")]
    public decimal? Nm2 { get; set; }

    /// <summary>文字項目1 (設定パス、フォーマット等)</summary>
    [MaxLength(100)]
    [Column("admcon_ch1")]
    public string? Ch1 { get; set; }

    /// <summary>文字項目2</summary>
    [MaxLength(100)]
    [Column("admcon_ch2")]
    public string? Ch2 { get; set; }
}
