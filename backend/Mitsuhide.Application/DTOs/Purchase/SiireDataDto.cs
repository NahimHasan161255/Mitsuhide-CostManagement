namespace Mitsuhide.Application.DTOs.Purchase;

public class SiireRecordDto
{
    public long UnqId { get; set; }
    public int SiireDate { get; set; }
    public int SiireCd { get; set; }
    public string? SiireNm { get; set; }
    public int KojiCd { get; set; }
    public int KojiSyu { get; set; }
    public string? KojiNm { get; set; }
    public int YosaSyu { get; set; }
    public string? YosaSyuNm { get; set; }
    public int AiteKam { get; set; }
    public decimal SiireGkNk { get; set; }
    public int ZeiRt { get; set; } = 10;
    public decimal ZeiGk { get; set; }
    public decimal SiireGkKm { get; set; }
    public string? Biko { get; set; }
}

public class CreateSiireRequest
{
    public int SiireDate { get; set; }
    public int SiireCd { get; set; }
    public int KojiCd { get; set; }
    public int KojiSyu { get; set; }
    public int YosaSyu { get; set; }
    public int AiteKam { get; set; }
    public decimal SiireGkNk { get; set; }
    public int ZeiRt { get; set; } = 10;
    public string? Biko { get; set; }
}

public class UpdateSiireRequest
{
    public int SiireDate { get; set; }
    public int SiireCd { get; set; }
    public int KojiCd { get; set; }
    public int KojiSyu { get; set; }
    public int YosaSyu { get; set; }
    public int AiteKam { get; set; }
    public decimal SiireGkNk { get; set; }
    public int ZeiRt { get; set; } = 10;
    public string? Biko { get; set; }
}
