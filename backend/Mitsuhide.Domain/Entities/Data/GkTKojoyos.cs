using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mitsuhide.Domain.Common;

namespace Mitsuhide.Domain.Entities.Data;

/// <summary>
/// 工事予算データ (GK_T_KOJIYOS)
/// </summary>
[Table("GK_T_KOJIYOS")]
public class GkTKojoyos : BaseEntity
{
    [Key]
    [Column("gktkyos_unq_id")]
    public long UnqId { get; set; }

    /// <summary>工事コード (CKEY1)</summary>
    [Column("gktkyos_kojicd")]
    public int KojiCd { get; set; }

    /// <summary>工事種目 (CKEY1)</summary>
    [Column("gktkyos_kojisyu")]
    public int KojiSyu { get; set; }

    /// <summary>予算種目 (CKEY1)</summary>
    [Column("gktkyos_yosasyu")]
    public int YosaSyu { get; set; }

    /// <summary>仕入先コード (CKEY1 - AD_M_SIIRE)</summary>
    [Column("gktkyos_siire")]
    public int SiireCd { get; set; }

    /// <summary>予算金額</summary>
    [Column("gktkyos_yosangk", TypeName = "decimal(13,0)")]
    public decimal YosanGk { get; set; }

    /// <summary>発注金額</summary>
    [Column("gktkyos_hassyugk", TypeName = "decimal(13,0)")]
    public decimal HassyuGk { get; set; }

    /// <summary>備考</summary>
    [MaxLength(40)]
    [Column("gktkyos_biko")]
    public string? Biko { get; set; }
}
