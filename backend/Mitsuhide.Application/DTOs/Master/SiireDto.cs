namespace Mitsuhide.Application.DTOs.Master;

public class SiireDto
{
    public int Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Ryaku { get; set; }
    public string? Kana { get; set; }
    public string? Sekinin { get; set; }
    public string? Gyousyu { get; set; }
    public string? Yubin { get; set; }
    public string? Jyusyo1 { get; set; }
    public string? Jyusyo2 { get; set; }
    public string? Tel { get; set; }
    public string? Fax { get; set; }
    public string? Mail { get; set; }
    public int SimeDd { get; set; }
    public string? Siharai { get; set; }
    public decimal Risoku { get; set; }
    public string? BnkNm { get; set; }
    public string? StnNm { get; set; }
    public int KozaSb { get; set; }
    public string? KozaNo { get; set; }
    public string? KozaNm { get; set; }
    public string? Biko1 { get; set; }
    public string? Biko2 { get; set; }
    public string? Biko3 { get; set; }
}

public class CreateOrUpdateSiireDto
{
    public int Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Ryaku { get; set; }
    public string? Kana { get; set; }
    public string? Sekinin { get; set; }
    public string? Gyousyu { get; set; }
    public string? Yubin { get; set; }
    public string? Jyusyo1 { get; set; }
    public string? Jyusyo2 { get; set; }
    public string? Tel { get; set; }
    public string? Fax { get; set; }
    public string? Mail { get; set; }
    public int SimeDd { get; set; }
    public string? Siharai { get; set; }
    public decimal Risoku { get; set; }
    public string? BnkNm { get; set; }
    public string? StnNm { get; set; }
    public int KozaSb { get; set; }
    public string? KozaNo { get; set; }
    public string? KozaNm { get; set; }
    public string? Biko1 { get; set; }
    public string? Biko2 { get; set; }
    public string? Biko3 { get; set; }
}
