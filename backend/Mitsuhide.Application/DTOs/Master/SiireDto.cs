using System.ComponentModel.DataAnnotations;

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
    public DateTime? UpdDate { get; set; }
}

public class CreateOrUpdateSiireDto
{
    [Required(ErrorMessage = "仕入先コードは必須です。")]
    [Range(1, 999999, ErrorMessage = "仕入先コードは1から999999の範囲で入力してください。")]
    public int Code { get; set; }

    [Required(ErrorMessage = "仕入先名は必須です。")]
    [StringLength(40, ErrorMessage = "仕入先名は40文字以内で入力してください。")]
    public string Name { get; set; } = string.Empty;

    [StringLength(20, ErrorMessage = "仕入先略称は20文字以内で入力してください。")]
    public string? Ryaku { get; set; }

    [StringLength(20, ErrorMessage = "カナ略称は20文字以内で入力してください。")]
    public string? Kana { get; set; }

    [StringLength(20, ErrorMessage = "責任者は20文字以内で入力してください。")]
    public string? Sekinin { get; set; }

    [StringLength(20, ErrorMessage = "業種名は20文字以内で入力してください。")]
    public string? Gyousyu { get; set; }

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

    [StringLength(10, ErrorMessage = "支払方法は10文字以内で入力してください。")]
    public string? Siharai { get; set; }

    [Range(0, 100, ErrorMessage = "利息率は0から100%の範囲で入力してください。")]
    public decimal Risoku { get; set; }

    [StringLength(30, ErrorMessage = "銀行名は30文字以内で入力してください。")]
    public string? BnkNm { get; set; }

    [StringLength(30, ErrorMessage = "支店名は30文字以内で入力してください。")]
    public string? StnNm { get; set; }

    [Range(1, 2, ErrorMessage = "口座種別は1(普通)または2(当座)を指定してください。")]
    public int KozaSb { get; set; }

    [StringLength(10, ErrorMessage = "口座番号は10文字以内で入力してください。")]
    public string? KozaNo { get; set; }

    [StringLength(30, ErrorMessage = "口座名義は30文字以内で入力してください。")]
    public string? KozaNm { get; set; }

    [StringLength(40, ErrorMessage = "備考1は40文字以内で入力してください。")]
    public string? Biko1 { get; set; }

    [StringLength(40, ErrorMessage = "備考2は40文字以内で入力してください。")]
    public string? Biko2 { get; set; }

    [StringLength(40, ErrorMessage = "備考3は40文字以内で入力してください。")]
    public string? Biko3 { get; set; }

    public DateTime? UpdDate { get; set; }
}
