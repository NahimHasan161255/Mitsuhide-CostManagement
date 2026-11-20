using System.ComponentModel.DataAnnotations;

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
    public DateTime? UpdDate { get; set; }
}

public class CreateOrUpdateJyucyuDto
{
    [Required(ErrorMessage = "受注先コードは必須です。")]
    [Range(1, 999999, ErrorMessage = "受注先コードは1から999999の範囲で入力してください。")]
    public int Code { get; set; }

    [Required(ErrorMessage = "受注先名は必須です。")]
    [StringLength(40, ErrorMessage = "受注先名は40文字以内で入力してください。")]
    public string Name { get; set; } = string.Empty;

    [StringLength(20, ErrorMessage = "受注先略称は20文字以内で入力してください。")]
    public string? Ryaku { get; set; }

    [StringLength(20, ErrorMessage = "カナ略称は20文字以内で入力してください。")]
    public string? Kana { get; set; }

    [StringLength(20, ErrorMessage = "責任者は20文字以内で入力してください。")]
    public string? Sekinin { get; set; }

    [StringLength(8, ErrorMessage = "郵便番号は8文字以内で入力してください。")]
    public string? Yubin { get; set; }

    [StringLength(40, ErrorMessage = "住所1は40文字以内で入力してください。")]
    public string? Jyusyo1 { get; set; }

    [StringLength(40, ErrorMessage = "住所2は40文字以内で入力してください。")]
    public string? Jyusyo2 { get; set; }

    [StringLength(15, ErrorMessage = "電話番号は15文字以内で入力してください。")]
    public string? Tel { get; set; }

    [StringLength(15, ErrorMessage = "FAX番号は15文字以内で入力してください。")]
    public string? Fax { get; set; }

    [StringLength(50, ErrorMessage = "メールアドレスは50文字以内で入力してください。")]
    public string? Mail { get; set; }

    [Range(1, 31, ErrorMessage = "締日は1から31の範囲で入力してください。")]
    public int SimeDd { get; set; }

    [Range(1, 12, ErrorMessage = "集金月は1から12の範囲で入力してください。")]
    public int SyukinMm { get; set; }

    [Range(1, 31, ErrorMessage = "集金日は1から31の範囲で入力してください。")]
    public int SyukinDd { get; set; }

    [StringLength(10, ErrorMessage = "回収方法は10文字以内で入力してください。")]
    public string? Kaisyu { get; set; }

    [Range(0, 100, ErrorMessage = "手形割合は0から100%の範囲で入力してください。")]
    public int Tegata { get; set; }

    [Range(0, 100, ErrorMessage = "現金割合は0から100%の範囲で入力してください。")]
    public int Genkin { get; set; }

    [Range(0, 100, ErrorMessage = "掛割合は0から100%の範囲で入力してください。")]
    public int KakeRt { get; set; }

    public int Syosiki { get; set; }
    public int ToriKb { get; set; }

    [StringLength(40, ErrorMessage = "備考1は40文字以内で入力してください。")]
    public string? Biko1 { get; set; }

    [StringLength(40, ErrorMessage = "備考2は40文字以内で入力してください。")]
    public string? Biko2 { get; set; }

    [StringLength(40, ErrorMessage = "備考3は40文字以内で入力してください。")]
    public string? Biko3 { get; set; }

    public DateTime? UpdDate { get; set; }
}
