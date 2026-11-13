using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mitsuhide.Domain.Common;

namespace Mitsuhide.Domain.Entities.Data;

/// <summary>
/// 工事仕掛データ (GK_T_KOJISIK - Work In Progress)
/// </summary>
[Table("GK_T_KOJISIK")]
public class GkTKojisik : BaseEntity
{
    [Key]
    [Column("gktksik_unq_id")]
    public long UnqId { get; set; }

    /// <summary>対象年月 (CKEY1 - YYYYMM)</summary>
    [Column("gktksik_date")]
    public int TargetDate { get; set; }

    /// <summary>工事コード (CKEY2)</summary>
    [Column("gktksik_kojicd")]
    public int KojiCd { get; set; }

    /// <summary>当月付加価値</summary>
    [Column("gktksik_hukakati", TypeName = "decimal(13,0)")]
    public decimal Hukakati { get; set; }

    /// <summary>当月仕掛金額</summary>
    [Column("gktksik_sikakari", TypeName = "decimal(13,0)")]
    public decimal Sikakari { get; set; }
}
