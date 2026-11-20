using System.ComponentModel.DataAnnotations;

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
    public DateTime? UpdDate { get; set; }
}

public class CreateSiireRequest
{
    [Required(ErrorMessage = "仕入日付は必須です。")]
    [Range(19000101, 20991231, ErrorMessage = "仕入日付は有効な年月日(YYYYMMDD)で入力してください。")]
    public int SiireDate { get; set; }

    [Required(ErrorMessage = "仕入先コードは必須です。")]
    [Range(1, 999999, ErrorMessage = "仕入先コードは1から999999の範囲で入力してください。")]
    public int SiireCd { get; set; }

    [Required(ErrorMessage = "工事コードは必須です。")]
    [Range(1, 99999999, ErrorMessage = "工事コードは1から99999999の範囲で入力してください。")]
    public int KojiCd { get; set; }

    [Range(0, 99, ErrorMessage = "工事種別は0から99の範囲で入力してください。")]
    public int KojiSyu { get; set; }

    public int YosaSyu { get; set; }
    public int AiteKam { get; set; }

    [Required(ErrorMessage = "仕入金額(税抜)は必須です。")]
    [Range(0, 999999999999, ErrorMessage = "仕入金額は0以上で入力してください。")]
    public decimal SiireGkNk { get; set; }

    [Range(0, 100, ErrorMessage = "税率は0から100%の範囲で入力してください。")]
    public int ZeiRt { get; set; } = 10;

    [StringLength(40, ErrorMessage = "備考は40文字以内で入力してください。")]
    public string? Biko { get; set; }
}

public class UpdateSiireRequest
{
    [Required(ErrorMessage = "仕入日付は必須です。")]
    [Range(19000101, 20991231, ErrorMessage = "仕入日付は有効な年月日(YYYYMMDD)で入力してください。")]
    public int SiireDate { get; set; }

    [Required(ErrorMessage = "仕入先コードは必須です。")]
    [Range(1, 999999, ErrorMessage = "仕入先コードは1から999999の範囲で入力してください。")]
    public int SiireCd { get; set; }

    [Required(ErrorMessage = "工事コードは必須です。")]
    [Range(1, 99999999, ErrorMessage = "工事コードは1から99999999の範囲で入力してください。")]
    public int KojiCd { get; set; }

    [Range(0, 99, ErrorMessage = "工事種別は0から99の範囲で入力してください。")]
    public int KojiSyu { get; set; }

    public int YosaSyu { get; set; }
    public int AiteKam { get; set; }

    [Required(ErrorMessage = "仕入金額(税抜)は必須です。")]
    [Range(0, 999999999999, ErrorMessage = "仕入金額は0以上で入力してください。")]
    public decimal SiireGkNk { get; set; }

    [Range(0, 100, ErrorMessage = "税率は0から100%の範囲で入力してください。")]
    public int ZeiRt { get; set; } = 10;

    [StringLength(40, ErrorMessage = "備考は40文字以内で入力してください。")]
    public string? Biko { get; set; }

    public DateTime? UpdDate { get; set; }
}
