using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mitsuhide.Domain.Common;

namespace Mitsuhide.Domain.Entities.Data;

/// <summary>
/// 仕入データ (GK_T_SIIRE)
/// </summary>
[Table("GK_T_SIIRE")]
public class GkTSiire : BaseEntity
{
    [Key]
    [Column("gktsir_unq_id")]
    public long UnqId { get; set; }

    /// <summary>仕入日 (CKEY1 - YYYYMMDD)</summary>
    [Column("gktsir_date")]
    public int SiireDate { get; set; }

    /// <summary>仕入先コード (CKEY1 - AD_M_SIIRE)</summary>
    [Column("gktsir_siire")]
    public int SiireCd { get; set; }

    /// <summary>工事コード (CKEY2)</summary>
    [Column("gktsir_kojicd")]
    public int KojiCd { get; set; }

    /// <summary>工事種目 (CKEY2)</summary>
    [Column("gktsir_kojisyu")]
    public int KojiSyu { get; set; }

    /// <summary>予算種目</summary>
    [Column("gktsir_yosasyu")]
    public int YosaSyu { get; set; }

    /// <summary>相手科目</summary>
    [Column("gktsir_aitekam")]
    public int AiteKam { get; set; }

    /// <summary>仕入金額 (税抜)</summary>
    [Column("gktsir_siiregk_nk", TypeName = "decimal(13,0)")]
    public decimal SiireGkNk { get; set; }

    /// <summary>消費税率 (%)</summary>
    [Column("gktsir_zeirt")]
    public int ZeiRt { get; set; }

    /// <summary>消費税等額</summary>
    [Column("gktsir_zeigk", TypeName = "decimal(13,0)")]
    public decimal ZeiGk { get; set; }

    /// <summary>仕入金額 (税込)</summary>
    [Column("gktsir_siiregk_km", TypeName = "decimal(13,0)")]
    public decimal SiireGkKm { get; set; }

    /// <summary>備考</summary>
    [MaxLength(40)]
    [Column("gktsir_biko")]
    public string? Biko { get; set; }
}
