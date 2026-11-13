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
}

public class CreateOrUpdateKojijyuDto
{
    public int KojiCd { get; set; }
    public int KojiSyu { get; set; } = 1;
    public string? KojiNm { get; set; }
    public string? KojiRyk { get; set; }
    public string? KojiKana { get; set; }
    public string? Sekkei { get; set; }
    public int JyuCd { get; set; }

    public int Keiyaku0Dt { get; set; }
    public int Keiyaku0Rt { get; set; } = 10;
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

    public decimal Yosangaku { get; set; }
    public int KoukiBgn { get; set; }
    public int KoukiEnd { get; set; }
    public string? Basyo { get; set; }
    public string? Jimusho { get; set; }
    public string? EigyoCd { get; set; }
    public string? GenbaCd { get; set; }
    public int Jyuryo { get; set; }
    public int Koumin { get; set; } = 2; // Default 2: 民間
    public int Keitai { get; set; } = 1; // Default 1: 自社
    public int KanseiKb { get; set; } = 0; // 0: 未成
    public int? KanseiDt { get; set; }
    public int? EndNyukin { get; set; }
    public int HoryuFg { get; set; } = 0;
    public string? Biko1 { get; set; }
    public string? Biko2 { get; set; }
    public string? KojiBiko1 { get; set; }
    public string? KojiBiko2 { get; set; }
}
