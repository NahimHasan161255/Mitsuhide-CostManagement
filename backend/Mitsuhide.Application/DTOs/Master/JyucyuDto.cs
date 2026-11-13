namespace Mitsuhide.Application.DTOs.Master;

public class JyucyuDto
{
    public int Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Ryaku { get; set; }
    public string? Kana { get; set; }
    public string? Sekinin { get; set; }
    public string? Yubin { get; set; }
    public string? Jyusyo1 { get; set; }
    public string? Jyusyo2 { get; set; }
    public string? Tel { get; set; }
    public string? Fax { get; set; }
    public string? Mail { get; set; }
    public int SimeDd { get; set; }
    public int SyukinMm { get; set; }
    public int SyukinDd { get; set; }
    public string? Kaisyu { get; set; }
    public int Tegata { get; set; }
    public int Genkin { get; set; }
    public int KakeRt { get; set; }
    public int Syosiki { get; set; }
    public int ToriKb { get; set; }
    public string? Biko1 { get; set; }
    public string? Biko2 { get; set; }
    public string? Biko3 { get; set; }
}

public class CreateOrUpdateJyucyuDto
{
    public int Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Ryaku { get; set; }
    public string? Kana { get; set; }
    public string? Sekinin { get; set; }
    public string? Yubin { get; set; }
    public string? Jyusyo1 { get; set; }
    public string? Jyusyo2 { get; set; }
    public string? Tel { get; set; }
    public string? Fax { get; set; }
    public string? Mail { get; set; }
    public int SimeDd { get; set; }
    public int SyukinMm { get; set; }
    public int SyukinDd { get; set; }
    public string? Kaisyu { get; set; }
    public int Tegata { get; set; }
    public int Genkin { get; set; }
    public int KakeRt { get; set; }
    public int Syosiki { get; set; }
    public int ToriKb { get; set; }
    public string? Biko1 { get; set; }
    public string? Biko2 { get; set; }
    public string? Biko3 { get; set; }
}
