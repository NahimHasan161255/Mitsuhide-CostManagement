namespace Mitsuhide.Application.DTOs.Cost;

public class ProjectLedgerDto
{
    public int KojiCd { get; set; }
    public int KojiSyu { get; set; }
    public string? KojiNm { get; set; }
    public string? KojiRyk { get; set; }
    public string? JyuNm { get; set; }
    public int KoukiBgn { get; set; }
    public int KoukiEnd { get; set; }
    public int KanseiKb { get; set; }

    // Financial Metrics
    public decimal KeiyakuGnk { get; set; } // 契約額(税抜)
    public decimal KeiyakuGkm { get; set; } // 契約額(税込)
    public decimal Yosangaku { get; set; }  // 実行予算額
    public decimal ActualSiireGk { get; set; } // 発生仕入実績額(税抜)
    public decimal ActualUriageGk { get; set; } // 累計売上実績額(税抜)

    // Margin Calculations
    public decimal PlannedMargin => KeiyakuGnk - Yosangaku;
    public double PlannedMarginRate => KeiyakuGnk > 0 ? (double)(PlannedMargin / KeiyakuGnk * 100) : 0;

    public decimal ActualMargin => ActualUriageGk - ActualSiireGk;
    public double ActualMarginRate => ActualUriageGk > 0 ? (double)(ActualMargin / ActualUriageGk * 100) : 0;

    // Remaining Budget
    public decimal RemainingBudget => Yosangaku - ActualSiireGk;
    public double BudgetExecutionRate => Yosangaku > 0 ? (double)(ActualSiireGk / Yosangaku * 100) : 0;

    // Breakdown lines
    public List<LedgerBudgetLineDto> BudgetLines { get; set; } = [];
    public List<LedgerSiireLineDto> RecentPurchases { get; set; } = [];
}

public class LedgerBudgetLineDto
{
    public int YosaSyu { get; set; }
    public string YosaSyuNm { get; set; } = string.Empty;
    public string? SiireNm { get; set; }
    public decimal YosanGk { get; set; }
    public decimal ActualCost { get; set; }
    public decimal Variance => YosanGk - ActualCost;
}

public class LedgerSiireLineDto
{
    public int SiireDate { get; set; }
    public string? SiireNm { get; set; }
    public int YosaSyu { get; set; }
    public decimal SiireGkNk { get; set; }
    public string? Biko { get; set; }
}
