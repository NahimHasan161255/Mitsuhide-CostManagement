namespace Mitsuhide.Application.DTOs.Master;

public class SysNameDto
{
    public string NameKbn { get; set; } = string.Empty;
    public string NameCd { get; set; } = string.Empty;
    public string Ch1 { get; set; } = string.Empty;
    public string? Ch2 { get; set; }
    public decimal? Nm1 { get; set; }
    public decimal? Nm2 { get; set; }
    public int? Date1 { get; set; }
    public int? Date2 { get; set; }
}

public class CreateSysNameRequest
{
    public string NameKbn { get; set; } = string.Empty;
    public string NameCd { get; set; } = string.Empty;
    public string Ch1 { get; set; } = string.Empty;
    public string? Ch2 { get; set; }
    public decimal? Nm1 { get; set; }
    public decimal? Nm2 { get; set; }
}

public class UpdateSysNameRequest
{
    public string Ch1 { get; set; } = string.Empty;
    public string? Ch2 { get; set; }
    public decimal? Nm1 { get; set; }
    public decimal? Nm2 { get; set; }
}
