using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mitsuhide.Domain.Common;

namespace Mitsuhide.Domain.Entities.Master;

/// <summary>
/// システム名称マスタ (AD_M_SYSNAME - Generic System Code & Name Master)
/// </summary>
[Table("AD_M_SYSNAME")]
public class AdMSysName : BaseEntity
{
    /// <summary>システム名称区分 (PKEY - vchr 5)</summary>
    [MaxLength(5)]
    [Column("admnam_name_kbn")]
    public string NameKbn { get; set; } = string.Empty;

    /// <summary>システム名称CD (PKEY - vchr 7)</summary>
    [MaxLength(7)]
    [Column("admnam_name_cd")]
    public string NameCd { get; set; } = string.Empty;

    /// <summary>文字項目1 (名称・表示名)</summary>
    [Required]
    [MaxLength(100)]
    [Column("admnam_ch1")]
    public string Ch1 { get; set; } = string.Empty;

    /// <summary>文字項目2 (略称・補足)</summary>
    [MaxLength(100)]
    [Column("admnam_ch2")]
    public string? Ch2 { get; set; }

    /// <summary>数字項目1 (並び順、値等)</summary>
    [Column("admnam_nm1", TypeName = "decimal(11,0)")]
    public decimal? Nm1 { get; set; }

    /// <summary>数字項目2</summary>
    [Column("admnam_nm2", TypeName = "decimal(11,0)")]
    public decimal? Nm2 { get; set; }

    /// <summary>日付項目1 (YYYYMMDD)</summary>
    [Column("admnam_date1")]
    public int? Date1 { get; set; }

    /// <summary>日付項目2 (YYYYMMDD)</summary>
    [Column("admnam_date2")]
    public int? Date2 { get; set; }
}
