namespace Mitsuhide.Application.DTOs.Master;

public class UserGrpDto
{
    public string UserGrpCd { get; set; } = string.Empty;
    public string UserGrpName { get; set; } = string.Empty;
    public int RunAplCnt { get; set; }
    public DateTime? UpdDate { get; set; }
}

public class CreateUserGrpRequest
{
    public string UserGrpCd { get; set; } = string.Empty;
    public string UserGrpName { get; set; } = string.Empty;
    public int RunAplCnt { get; set; } = 5;
}

public class UpdateUserGrpRequest
{
    public string UserGrpName { get; set; } = string.Empty;
    public int RunAplCnt { get; set; } = 5;
    public DateTime? UpdDate { get; set; }
}
