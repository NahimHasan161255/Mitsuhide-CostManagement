using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mitsuhide.Domain.Common;

namespace Mitsuhide.Domain.Entities.Master;

/// <summary>
/// 月次日付マスタ (AD_M_GDATE - Monthly Date & Closing Status Master)
/// </summary>
[Table("AD_M_GDATE")]
public class AdMGdate : BaseEntity
{
    /// <summary>月次年月 (PKEY - YYYYMM)</summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    [Column("admgdt_yyyymm")]
    public int YyyyMm { get; set; }

    /// <summary>更新フラグ (0: 未更新/オープン, 1: 更新済/クローズ)</summary>
    [Column("admgdt_kosin_flg")]
    public int KosinFlg { get; set; }
}
