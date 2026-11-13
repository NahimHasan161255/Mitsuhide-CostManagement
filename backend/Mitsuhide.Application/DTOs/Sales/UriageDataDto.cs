namespace Mitsuhide.Application.DTOs.Sales;

public class UriageRecordDto
{
    public long UnqId { get; set; }
    public int UriageDate { get; set; }
    public int JyuCyuCd { get; set; }
    public string? JyuNm { get; set; }
    public int KojiCd { get; set; }
    public int KojiSyu { get; set; }
    public string? KojiNm { get; set; }
    public decimal UriageGkNk { get; set; }
    public int ZeiRt { get; set; } = 10;
    public decimal ZeiGk { get; set; }
    public decimal UriageGkKm { get; set; }
    public string? Biko { get; set; }
}

public class CreateUriageRequest
{
    public int UriageDate { get; set; }
    public int JyuCyuCd { get; set; }
    public int KojiCd { get; set; }
    public int KojiSyu { get; set; }
    public decimal UriageGkNk { get; set; }
    public int ZeiRt { get; set; } = 10;
    public string? Biko { get; set; }
}

public class UpdateUriageRequest
{
    public int UriageDate { get; set; }
    public int JyuCyuCd { get; set; }
    public int KojiCd { get; set; }
    public int KojiSyu { get; set; }
    public decimal UriageGkNk { get; set; }
    public int ZeiRt { get; set; } = 10;
    public string? Biko { get; set; }
}
