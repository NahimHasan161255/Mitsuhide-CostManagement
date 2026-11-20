namespace Mitsuhide.Application.DTOs.Master;

public class ControlDto
{
    public string SubSysCd { get; set; } = string.Empty;
    public string ProgId { get; set; } = string.Empty;
    public string KanriName { get; set; } = string.Empty;
    public decimal? Nm1 { get; set; }
    public decimal? Nm2 { get; set; }
    public string? Ch1 { get; set; }
    public string? Ch2 { get; set; }
    public DateTime? UpdDate { get; set; }
}

public class CreateControlRequest
{
    public string SubSysCd { get; set; } = string.Empty;
    public string ProgId { get; set; } = string.Empty;
    public string KanriName { get; set; } = string.Empty;
    public decimal? Nm1 { get; set; }
    public decimal? Nm2 { get; set; }
    public string? Ch1 { get; set; }
    public string? Ch2 { get; set; }
}

public class UpdateControlRequest
{
    public string KanriName { get; set; } = string.Empty;
    public decimal? Nm1 { get; set; }
    public decimal? Nm2 { get; set; }
    public string? Ch1 { get; set; }
    public string? Ch2 { get; set; }
    public DateTime? UpdDate { get; set; }
}
