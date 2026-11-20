using System.ComponentModel.DataAnnotations;

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
    public DateTime? UpdDate { get; set; }
}

public class CreateUriageRequest
{
    [Required(ErrorMessage = "売上日付は必須です。")]
    [Range(190001, 20991231, ErrorMessage = "売上年月は有効な日付(YYYYMMまたはYYYYMMDD)で入力してください。")]
    public int UriageDate { get; set; }

    [Required(ErrorMessage = "受注先コードは必須です。")]
    [Range(1, 999999, ErrorMessage = "受注先コードは1から999999の範囲で入力してください。")]
    public int JyuCyuCd { get; set; }

    [Required(ErrorMessage = "工事コードは必須です。")]
    [Range(1, 99999999, ErrorMessage = "工事コードは1から99999999の範囲で入力してください。")]
    public int KojiCd { get; set; }

    [Range(0, 99, ErrorMessage = "工事種別は0から99の範囲で入力してください。")]
    public int KojiSyu { get; set; }

    [Required(ErrorMessage = "売上金額(税抜)は必須です。")]
    [Range(0, 999999999999, ErrorMessage = "売上金額は0以上で入力してください。")]
    public decimal UriageGkNk { get; set; }

    [Range(0, 100, ErrorMessage = "税率は0から100%の範囲で入力してください。")]
    public int ZeiRt { get; set; } = 10;

    [StringLength(40, ErrorMessage = "備考は40文字以内で入力してください。")]
    public string? Biko { get; set; }
}

public class UpdateUriageRequest
{
    [Required(ErrorMessage = "売上日付は必須です。")]
    [Range(190001, 20991231, ErrorMessage = "売上年月は有効な日付(YYYYMMまたはYYYYMMDD)で入力してください。")]
    public int UriageDate { get; set; }

    [Required(ErrorMessage = "受注先コードは必須です。")]
    [Range(1, 999999, ErrorMessage = "受注先コードは1から999999の範囲で入力してください。")]
    public int JyuCyuCd { get; set; }

    [Required(ErrorMessage = "工事コードは必須です。")]
    [Range(1, 99999999, ErrorMessage = "工事コードは1から99999999の範囲で入力してください。")]
    public int KojiCd { get; set; }

    [Range(0, 99, ErrorMessage = "工事種別は0から99の範囲で入力してください。")]
    public int KojiSyu { get; set; }

    [Required(ErrorMessage = "売上金額(税抜)は必須です。")]
    [Range(0, 999999999999, ErrorMessage = "売上金額は0以上で入力してください。")]
    public decimal UriageGkNk { get; set; }

    [Range(0, 100, ErrorMessage = "税率は0から100%の範囲で入力してください。")]
    public int ZeiRt { get; set; } = 10;

    [StringLength(40, ErrorMessage = "備考は40文字以内で入力してください。")]
    public string? Biko { get; set; }

    public DateTime? UpdDate { get; set; }
}
