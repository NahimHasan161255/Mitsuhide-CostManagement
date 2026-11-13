using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mitsuhide.Domain.Common;

namespace Mitsuhide.Domain.Entities.Data;

/// <summary>
/// 工事受注データ (GK_T_KOJIJYU)
/// </summary>
[Table("GK_T_KOJIJYU")]
public class GkTKojijyu : BaseEntity
{
    [Key]
    [Column("gktkjyu_unq_id")]
    public long UnqId { get; set; }

    /// <summary>工事コード (CKEY1)</summary>
    [Column("gktkjyu_kojicd")]
    public int KojiCd { get; set; }

    /// <summary>工事種目 (CKEY1)</summary>
    [Column("gktkjyu_kojisyu")]
    public int KojiSyu { get; set; }

    /// <summary>工事名</summary>
    [MaxLength(100)]
    [Column("gktkjyu_kojinm")]
    public string? KojiNm { get; set; }

    /// <summary>工事略称</summary>
    [MaxLength(40)]
    [Column("gktkjyu_kojiryk")]
    public string? KojiRyk { get; set; }

    /// <summary>工事カナ名</summary>
    [MaxLength(30)]
    [Column("gktkjyu_kojikana")]
    public string? KojiKana { get; set; }

    /// <summary>設計者</summary>
    [MaxLength(40)]
    [Column("gktkjyu_sekkei")]
    public string? Sekkei { get; set; }

    /// <summary>受注先コード (AD_M_JYUCYU)</summary>
    [Column("gktkjyu_jyucd")]
    public int JyuCd { get; set; }

    /// <summary>契約額合計:税抜</summary>
    [Column("gktkjyu_keiyaku_gnk", TypeName = "decimal(13,0)")]
    public decimal KeiyakuGnk { get; set; }

    /// <summary>契約額合計:税込</summary>
    [Column("gktkjyu_keiyaku_gkm", TypeName = "decimal(13,0)")]
    public decimal KeiyakuGkm { get; set; }

    /// <summary>契約額当初:受注日 (YYYYMMDD)</summary>
    [Column("gktkjyu_keiyaku_0dt")]
    public int Keiyaku0Dt { get; set; }

    /// <summary>契約額当初:税率 (%)</summary>
    [Column("gktkjyu_keiyaku_0rt")]
    public int Keiyaku0Rt { get; set; }

    /// <summary>契約額当初:税抜</summary>
    [Column("gktkjyu_keiyaku_0nk", TypeName = "decimal(13,0)")]
    public decimal Keiyaku0Nk { get; set; }

    /// <summary>契約額当初:税込</summary>
    [Column("gktkjyu_keiyaku_0km", TypeName = "decimal(13,0)")]
    public decimal Keiyaku0Km { get; set; }

    /// <summary>契約額変更１:変更日</summary>
    [Column("gktkjyu_keiyaku_1dt")]
    public int? Keiyaku1Dt { get; set; }

    /// <summary>契約額変更１:税率</summary>
    [Column("gktkjyu_keiyaku_1rt")]
    public int? Keiyaku1Rt { get; set; }

    /// <summary>契約額変更１:税抜</summary>
    [Column("gktkjyu_keiyaku_1nk", TypeName = "decimal(13,0)")]
    public decimal? Keiyaku1Nk { get; set; }

    /// <summary>契約額変更１:税込</summary>
    [Column("gktkjyu_keiyaku_1km", TypeName = "decimal(13,0)")]
    public decimal? Keiyaku1Km { get; set; }

    /// <summary>契約額変更２:変更日</summary>
    [Column("gktkjyu_keiyaku_2dt")]
    public int? Keiyaku2Dt { get; set; }

    /// <summary>契約額変更２:税率</summary>
    [Column("gktkjyu_keiyaku_2rt")]
    public int? Keiyaku2Rt { get; set; }

    /// <summary>契約額変更２:税抜</summary>
    [Column("gktkjyu_keiyaku_2nk", TypeName = "decimal(13,0)")]
    public decimal? Keiyaku2Nk { get; set; }

    /// <summary>契約額変更２:税込</summary>
    [Column("gktkjyu_keiyaku_2km", TypeName = "decimal(13,0)")]
    public decimal? Keiyaku2Km { get; set; }

    /// <summary>契約額変更３:変更日</summary>
    [Column("gktkjyu_keiyaku_3dt")]
    public int? Keiyaku3Dt { get; set; }

    /// <summary>契約額変更３:税率</summary>
    [Column("gktkjyu_keiyaku_3rt")]
    public int? Keiyaku3Rt { get; set; }

    /// <summary>契約額変更３:税抜</summary>
    [Column("gktkjyu_keiyaku_3nk", TypeName = "decimal(13,0)")]
    public decimal? Keiyaku3Nk { get; set; }

    /// <summary>契約額変更３:税込</summary>
    [Column("gktkjyu_keiyaku_3km", TypeName = "decimal(13,0)")]
    public decimal? Keiyaku3Km { get; set; }

    /// <summary>予算金額</summary>
    [Column("gktkjyu_yosangaku", TypeName = "decimal(13,0)")]
    public decimal Yosangaku { get; set; }

    /// <summary>予定粗利</summary>
    [Column("gktkjyu_yoteiarari", TypeName = "decimal(13,0)")]
    public decimal YoteiArari { get; set; }

    /// <summary>工期開始日 (YYYYMMDD)</summary>
    [Column("gktkjyu_kouki_bgn")]
    public int KoukiBgn { get; set; }

    /// <summary>工期終了日 (YYYYMMDD)</summary>
    [Column("gktkjyu_kouki_end")]
    public int KoukiEnd { get; set; }

    /// <summary>工事場所</summary>
    [MaxLength(60)]
    [Column("gktkjyu_basyo")]
    public string? Basyo { get; set; }

    /// <summary>工事事務所</summary>
    [MaxLength(60)]
    [Column("gktkjyu_jimusho")]
    public string? Jimusho { get; set; }

    /// <summary>営業担当者CD</summary>
    [MaxLength(6)]
    [Column("gktkjyu_eigyocd")]
    public string? EigyoCd { get; set; }

    /// <summary>現場担当者CD</summary>
    [MaxLength(6)]
    [Column("gktkjyu_genbacd")]
    public string? GenbaCd { get; set; }

    /// <summary>重量 (t)</summary>
    [Column("gktkjyu_jyuryo")]
    public int Jyuryo { get; set; }

    /// <summary>公民区分 (1:公共、2:民間)</summary>
    [Column("gktkjyu_koumin")]
    public int Koumin { get; set; }

    /// <summary>請負形態 (1:自社、2:外注)</summary>
    [Column("gktkjyu_keitai")]
    public int Keitai { get; set; }

    /// <summary>完成区分 (1:完成, 0:未完成)</summary>
    [Column("gktkjyu_kanseikb")]
    public int KanseiKb { get; set; }

    /// <summary>完成日 (YYYYMMDD)</summary>
    [Column("gktkjyu_kanseidt")]
    public int? KanseiDt { get; set; }

    /// <summary>最終入金日 (YYYYMMDD)</summary>
    [Column("gktkjyu_endnyukin")]
    public int? EndNyukin { get; set; }

    /// <summary>保留フラグ (1:保留)</summary>
    [Column("gktkjyu_horyufg")]
    public int HoryuFg { get; set; }

    /// <summary>備考1</summary>
    [MaxLength(50)]
    [Column("gktkjyu_biko1")]
    public string? Biko1 { get; set; }

    /// <summary>備考2</summary>
    [MaxLength(50)]
    [Column("gktkjyu_biko2")]
    public string? Biko2 { get; set; }

    /// <summary>工事備考1</summary>
    [MaxLength(100)]
    [Column("gktkjyu_kojibiko1")]
    public string? KojiBiko1 { get; set; }

    /// <summary>工事備考2</summary>
    [MaxLength(100)]
    [Column("gktkjyu_kojibiko2")]
    public string? KojiBiko2 { get; set; }
}
