namespace Mitsuhide.Application.DTOs.Closing;

public class ClosingStatusDto
{
    public int CurrentYyyyMm { get; set; }
    public int NextYyyyMm { get; set; }
    public bool IsClosed { get; set; }
    public int UnclosedSlipsCount { get; set; }
    public int ActiveProjectsCount { get; set; }
    public decimal TotalMonthlyPurchase { get; set; }
    public decimal TotalMonthlySales { get; set; }
}

public class ExecuteClosingRequest
{
    public int TargetYyyyMm { get; set; }
    public string ExecutedBy { get; set; } = "SYSTEM";
}

public class ClosingResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int ProcessedProjectsCount { get; set; }
    public decimal TotalWipAmount { get; set; }
    public int NewCurrentYyyyMm { get; set; }
}
