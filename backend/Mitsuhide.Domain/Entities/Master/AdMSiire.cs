using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mitsuhide.Domain.Common;

namespace Mitsuhide.Domain.Entities.Master;

/// <summary>
/// 仕入先マスタ (AD_M_SIIRE - Supplier / Vendor Master)
/// </summary>
[Table("AD_M_SIIRE")]
public class AdMSiire : BaseEntity
{
    /// <summary>仕入先コード (PKEY)</summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    [Column("admsir_code")]
    public int Code { get; set; }

    /// <summary>仕入先名</summary>
    [Required]
    [MaxLength(40)]
    [Column("admsir_name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>略称</summary>
    [MaxLength(16)]
    [Column("admsir_ryaku")]
    public string? Ryaku { get; set; }

    /// <summary>カナ名</summary>
    [MaxLength(20)]
    [Column("admsir_kana")]
    public string? Kana { get; set; }

    /// <summary>責任者</summary>
    [MaxLength(30)]
    [Column("admsir_sekinin")]
    public string? Sekinin { get; set; }

    /// <summary>業種</summary>
    [MaxLength(20)]
    [Column("admsir_gyousyu")]
    public string? Gyousyu { get; set; }

    /// <summary>郵便番号</summary>
    [MaxLength(8)]
    [Column("admsir_yubin")]
    public string? Yubin { get; set; }

    /// <summary>住所1</summary>
    [MaxLength(40)]
    [Column("admsir_jyusyo1")]
    public string? Jyusyo1 { get; set; }

    /// <summary>住所2</summary>
    [MaxLength(40)]
    [Column("admsir_jyusyo2")]
    public string? Jyusyo2 { get; set; }

    /// <summary>TEL</summary>
    [MaxLength(13)]
    [Column("admsir_tel")]
    public string? Tel { get; set; }

    /// <summary>FAX</summary>
    [MaxLength(13)]
    [Column("admsir_fax")]
    public string? Fax { get; set; }

    /// <summary>メールアドレス</summary>
    [MaxLength(40)]
    [Column("admsir_mail")]
    public string? Mail { get; set; }

    /// <summary>支払締日 (DD)</summary>
    [Column("admsir_simedd")]
    public int SimeDd { get; set; }

    /// <summary>支払方法</summary>
    [MaxLength(40)]
    [Column("admsir_siharai")]
    public string? Siharai { get; set; }

    /// <summary>利息</summary>
    [Column("admsir_risoku", TypeName = "decimal(5,2)")]
    public decimal Risoku { get; set; }

    /// <summary>銀行名</summary>
    [MaxLength(30)]
    [Column("admsir_bnknm")]
    public string? BnkNm { get; set; }

    /// <summary>支店名</summary>
    [MaxLength(30)]
    [Column("admsir_stnnm")]
    public string? StnNm { get; set; }

    /// <summary>口座種別 (1:普通, 2:当座)</summary>
    [Column("admsir_kozasb")]
    public int KozaSb { get; set; }

    /// <summary>口座番号</summary>
    [MaxLength(7)]
    [Column("admsir_kozano")]
    public string? KozaNo { get; set; }

    /// <summary>口座名義人</summary>
    [MaxLength(30)]
    [Column("admsir_kozanm")]
    public string? KozaNm { get; set; }

    /// <summary>備考1</summary>
    [MaxLength(60)]
    [Column("admsir_biko1")]
    public string? Biko1 { get; set; }

    /// <summary>備考2</summary>
    [MaxLength(60)]
    [Column("admsir_biko2")]
    public string? Biko2 { get; set; }

    /// <summary>備考3</summary>
    [MaxLength(60)]
    [Column("admsir_biko3")]
    public string? Biko3 { get; set; }
}
