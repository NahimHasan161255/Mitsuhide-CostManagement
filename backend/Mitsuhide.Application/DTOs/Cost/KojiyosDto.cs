namespace Mitsuhide.Application.DTOs.Cost;

public class KojiyosDto
{
    public long UnqId { get; set; }
    public int KojiCd { get; set; }
    public int KojiSyu { get; set; }
    public int YosaSyu { get; set; }
    public string? YosaSyuNm { get; set; }
    public int SiireCd { get; set; }
    public string? SiireNm { get; set; } // Supplier name joined from AD_M_SIIRE
    public decimal YosanGk { get; set; }
    public decimal HassyuGk { get; set; }
    public string? Biko { get; set; }
}

public class SaveKojiyosBatchDto
{
    public int KojiCd { get; set; }
    public int KojiSyu { get; set; } = 1;
    public List<KojiyosItemDto> Items { get; set; } = [];
}

public class KojiyosItemDto
{
    public int YosaSyu { get; set; }
    public int SiireCd { get; set; }
    public decimal YosanGk { get; set; }
    public decimal HassyuGk { get; set; }
    public string? Biko { get; set; }
}
