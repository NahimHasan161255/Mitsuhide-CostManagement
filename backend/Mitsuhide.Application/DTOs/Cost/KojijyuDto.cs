using System.ComponentModel.DataAnnotations;

namespace Mitsuhide.Application.DTOs.Cost;

public class KojijyuDto
{
    public long UnqId { get; set; }
    public int KojiCd { get; set; }
    public int KojiSyu { get; set; }
    public string? KojiNm { get; set; }
    public string? KojiRyk { get; set; }
    public string? KojiKana { get; set; }
    public string? Sekkei { get; set; }
    public int JyuCd { get; set; }
    public string? JyuNm { get; set; } // Customer Name joined from AD_M_JYUCYU

    // Contract totals
    public decimal KeiyakuGnk { get; set; }
    public decimal KeiyakuGkm { get; set; }

    // Initial contract
    public int Keiyaku0Dt { get; set; }
    public int Keiyaku0Rt { get; set; }
    public decimal Keiyaku0Nk { get; set; }
    public decimal Keiyaku0Km { get; set; }

    // Changes 1, 2, 3
    public int? Keiyaku1Dt { get; set; }
    public int? Keiyaku1Rt { get; set; }
    public decimal? Keiyaku1Nk { get; set; }
    public decimal? Keiyaku1Km { get; set; }

    public int? Keiyaku2Dt { get; set; }
    public int? Keiyaku2Rt { get; set; }
    public decimal? Keiyaku2Nk { get; set; }
    public decimal? Keiyaku2Km { get; set; }

    public int? Keiyaku3Dt { get; set; }
    public int? Keiyaku3Rt { get; set; }
    public decimal? Keiyaku3Nk { get; set; }
    public decimal? Keiyaku3Km { get; set; }

    // Budget & Margin
    public decimal Yosangaku { get; set; }
    public decimal YoteiArari { get; set; }
    public double YoteiArariRate => KeiyakuGnk > 0 ? (double)(YoteiArari / KeiyakuGnk * 100) : 0;

    // Dates & Info
    public int KoukiBgn { get; set; }
    public int KoukiEnd { get; set; }
    public string? Basyo { get; set; }
    public string? Jimusho { get; set; }
    public string? EigyoCd { get; set; }
    public string? GenbaCd { get; set; }
    public int Jyuryo { get; set; }
    public int Koumin { get; set; }
    public int Keitai { get; set; }
    public int KanseiKb { get; set; }
    public int? KanseiDt { get; set; }
    public int? EndNyukin { get; set; }
    public int HoryuFg { get; set; }
    public string? Biko1 { get; set; }
    public string? Biko2 { get; set; }
    public string? KojiBiko1 { get; set; }
    public string? KojiBiko2 { get; set; }
    public DateTime? UpdDate { get; set; }
}

public class CreateOrUpdateKojijyuDto
{
    [Required(ErrorMessage = "工事コードは必須です。")]
    [Range(1, 99999999, ErrorMessage = "工事コードは1から99999999の範囲で入力してください。")]
    public int KojiCd { get; set; }

    [Range(0, 99, ErrorMessage = "工事種別は0から99の範囲で入力してください。")]
    public int KojiSyu { get; set; } = 1;

    [Required(ErrorMessage = "工事名称は必須です。")]
    [StringLength(40, ErrorMessage = "工事名称は40文字以内で入力してください。")]
    public string? KojiNm { get; set; }

    [StringLength(20, ErrorMessage = "工事略称は20文字以内で入力してください。")]
    public string? KojiRyk { get; set; }

    [StringLength(20, ErrorMessage = "カナ名称は20文字以内で入力してください。")]
    public string? KojiKana { get; set; }

    [StringLength(20, ErrorMessage = "設計・監理は20文字以内で入力してください。")]
    public string? Sekkei { get; set; }

    [Required(ErrorMessage = "受注先コードは必須です。")]
    [Range(1, 999999, ErrorMessage = "受注先コードは1から999999の範囲で入力してください。")]
    public int JyuCd { get; set; }

    public int Keiyaku0Dt { get; set; }

    [Range(0, 100, ErrorMessage = "税率は0から100の範囲で入力してください。")]
    public int Keiyaku0Rt { get; set; } = 10;

    [Range(0, 999999999999, ErrorMessage = "当初契約金額(税抜)は0以上で入力してください。")]
    public decimal Keiyaku0Nk { get; set; }

    public decimal Keiyaku0Km { get; set; }

    public int? Keiyaku1Dt { get; set; }
    public int? Keiyaku1Rt { get; set; }
    public decimal? Keiyaku1Nk { get; set; }
    public decimal? Keiyaku1Km { get; set; }

    public int? Keiyaku2Dt { get; set; }
    public int? Keiyaku2Rt { get; set; }
    public decimal? Keiyaku2Nk { get; set; }
    public decimal? Keiyaku2Km { get; set; }

    public int? Keiyaku3Dt { get; set; }
    public int? Keiyaku3Rt { get; set; }
    public decimal? Keiyaku3Nk { get; set; }
    public decimal? Keiyaku3Km { get; set; }

    [Range(0, 999999999999, ErrorMessage = "実行予算額は0以上で入力してください。")]
    public decimal Yosangaku { get; set; }

    public int KoukiBgn { get; set; }
    public int KoukiEnd { get; set; }

    [StringLength(40, ErrorMessage = "工事場所は40文字以内で入力してください。")]
    public string? Basyo { get; set; }

    [StringLength(40, ErrorMessage = "担当事務所は40文字以内で入力してください。")]
    public string? Jimusho { get; set; }

    [StringLength(6, ErrorMessage = "営業担当者コードは6文字以内で入力してください。")]
    public string? EigyoCd { get; set; }

    [StringLength(6, ErrorMessage = "現場担当者コードは6文字以内で入力してください。")]
    public string? GenbaCd { get; set; }

    public int Jyuryo { get; set; }
    public int Koumin { get; set; } = 2; // Default 2: 民間
    public int Keitai { get; set; } = 1; // Default 1: 自社
    public int KanseiKb { get; set; } = 0; // 0: 未成
    public int? KanseiDt { get; set; }
    public int? EndNyukin { get; set; }
    public int HoryuFg { get; set; } = 0;

    [StringLength(40, ErrorMessage = "備考1は40文字以内で入力してください。")]
    public string? Biko1 { get; set; }

    [StringLength(40, ErrorMessage = "備考2は40文字以内で入力してください。")]
    public string? Biko2 { get; set; }

    [StringLength(40, ErrorMessage = "工事備考1は40文字以内で入力してください。")]
    public string? KojiBiko1 { get; set; }

    [StringLength(40, ErrorMessage = "工事備考2は40文字以内で入力してください。")]
    public string? KojiBiko2 { get; set; }

    public DateTime? UpdDate { get; set; }
}
