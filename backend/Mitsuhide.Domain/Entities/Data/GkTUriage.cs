using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mitsuhide.Domain.Common;

namespace Mitsuhide.Domain.Entities.Data;

/// <summary>
/// 売上データ (GK_T_URIAGE)
/// </summary>
[Table("GK_T_URIAGE")]
public class GkTUriage : BaseEntity
{
    [Key]
    [Column("gkturi_unq_id")]
    public long UnqId { get; set; }

    /// <summary>売上年月 (CKEY1 - YYYYMM)</summary>
    [Column("gkturi_date")]
    public int UriageDate { get; set; }

    /// <summary>受注先コード (CKEY1 - AD_M_JYUCYU)</summary>
    [Column("gkturi_jyucyu")]
    public int JyuCyuCd { get; set; }

    /// <summary>工事コード (CKEY2)</summary>
    [Column("gkturi_kojicd")]
    public int KojiCd { get; set; }

    /// <summary>工事種目 (CKEY2)</summary>
    [Column("gkturi_kojisyu")]
    public int KojiSyu { get; set; }

    /// <summary>売上金額 (税抜)</summary>
    [Column("gkturi_uriagegk_nk", TypeName = "decimal(13,0)")]
    public decimal UriageGkNk { get; set; }

    /// <summary>消費税率 (%)</summary>
    [Column("gkturi_zeirt")]
    public int ZeiRt { get; set; }

    /// <summary>消費税等額</summary>
    [Column("gkturi_zeigk", TypeName = "decimal(13,0)")]
    public decimal ZeiGk { get; set; }

    /// <summary>売上金額 (税込)</summary>
    [Column("gkturi_uriagegk_km", TypeName = "decimal(13,0)")]
    public decimal UriageGkKm { get; set; }

    /// <summary>備考</summary>
    [MaxLength(200)]
    [Column("gkturi_biko")]
    public string? Biko { get; set; }
}
