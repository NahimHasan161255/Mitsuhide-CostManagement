using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mitsuhide.Domain.Common;

namespace Mitsuhide.Domain.Entities.Master;

/// <summary>
/// 受注先マスタ (AD_M_JYUCYU - Client / Customer Master)
/// </summary>
[Table("AD_M_JYUCYU")]
public class AdMJyucyu : BaseEntity
{
    /// <summary>受注先コード (PKEY)</summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    [Column("admjyu_code")]
    public int Code { get; set; }

    /// <summary>受注先名</summary>
    [Required]
    [MaxLength(40)]
    [Column("admjyu_name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>略称</summary>
    [MaxLength(16)]
    [Column("admjyu_ryaku")]
    public string? Ryaku { get; set; }

    /// <summary>カナ名</summary>
    [MaxLength(20)]
    [Column("admjyu_kana")]
    public string? Kana { get; set; }

    /// <summary>責任者</summary>
    [MaxLength(30)]
    [Column("admjyu_sekinin")]
    public string? Sekinin { get; set; }

    /// <summary>郵便番号</summary>
    [MaxLength(8)]
    [Column("admjyu_yubin")]
    public string? Yubin { get; set; }

    /// <summary>住所1</summary>
    [MaxLength(40)]
    [Column("admjyu_jyusyo1")]
    public string? Jyusyo1 { get; set; }

    /// <summary>住所2</summary>
    [MaxLength(40)]
    [Column("admjyu_jyusyo2")]
    public string? Jyusyo2 { get; set; }

    /// <summary>TEL</summary>
    [MaxLength(13)]
    [Column("admjyu_tel")]
    public string? Tel { get; set; }

    /// <summary>FAX</summary>
    [MaxLength(13)]
    [Column("admjyu_fax")]
    public string? Fax { get; set; }

    /// <summary>メールアドレス</summary>
    [MaxLength(40)]
    [Column("admjyu_mail")]
    public string? Mail { get; set; }

    /// <summary>請求締日 (DD)</summary>
    [Column("admjyu_simedd")]
    public int SimeDd { get; set; }

    /// <summary>集金月</summary>
    [Column("admjyu_syukinmm")]
    public int SyukinMm { get; set; }

    /// <summary>集金日 (DD)</summary>
    [Column("admjyu_syukindd")]
    public int SyukinDd { get; set; }

    /// <summary>回収方法</summary>
    [MaxLength(20)]
    [Column("admjyu_kaisyu")]
    public string? Kaisyu { get; set; }

    /// <summary>手形割合 (%)</summary>
    [Column("admjyu_tegata")]
    public int Tegata { get; set; }

    /// <summary>現金割合 (%)</summary>
    [Column("admjyu_genkin")]
    public int Genkin { get; set; }

    /// <summary>掛率 (%)</summary>
    [Column("admjyu_kakert")]
    public int KakeRt { get; set; }

    /// <summary>請求書式 (1:標準)</summary>
    [Column("admjyu_syosiki")]
    public int Syosiki { get; set; }

    /// <summary>取引区分 (1:通常)</summary>
    [Column("admjyu_torikb")]
    public int ToriKb { get; set; }

    /// <summary>備考1</summary>
    [MaxLength(60)]
    [Column("admjyu_biko1")]
    public string? Biko1 { get; set; }

    /// <summary>備考2</summary>
    [MaxLength(60)]
    [Column("admjyu_biko2")]
    public string? Biko2 { get; set; }

    /// <summary>備考3</summary>
    [MaxLength(60)]
    [Column("admjyu_biko3")]
    public string? Biko3 { get; set; }
}
