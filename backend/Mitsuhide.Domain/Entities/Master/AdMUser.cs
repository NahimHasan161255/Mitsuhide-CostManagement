using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mitsuhide.Domain.Common;

namespace Mitsuhide.Domain.Entities.Master;

/// <summary>
/// ユーザーマスタ (AD_M_USER - User Master)
/// </summary>
[Table("AD_M_USER")]
public class AdMUser : BaseEntity
{
    /// <summary>ユーザーコード (PKEY - vchr 6)</summary>
    [Key]
    [MaxLength(6)]
    [Column("admuse_user_cd")]
    public string UserCd { get; set; } = string.Empty;

    /// <summary>ユーザー名称</summary>
    [Required]
    [MaxLength(20)]
    [Column("admuse_user_name")]
    public string UserName { get; set; } = string.Empty;

    /// <summary>ユーザー略称</summary>
    [MaxLength(10)]
    [Column("admuse_user_name_r")]
    public string? UserNameR { get; set; }

    /// <summary>フリガナ</summary>
    [MaxLength(10)]
    [Column("admuse_user_name_k")]
    public string? UserNameK { get; set; }

    /// <summary>担当者区分 (1:営業, 2:現場, etc.)</summary>
    [Column("admuse_tanto_kbn")]
    public int TantoKbn { get; set; }

    /// <summary>ユーザーグループCD (AD_M_USER_GRP)</summary>
    [MaxLength(4)]
    [Column("admuse_usergrp_cd")]
    public string? UserGrpCd { get; set; }

    /// <summary>ユーザー種別</summary>
    [Column("admuse_syubetu")]
    public int Syubetu { get; set; }

    /// <summary>備考</summary>
    [MaxLength(40)]
    [Column("admuse_biko")]
    public string? Biko { get; set; }

    /// <summary>パスワード (ハッシュ化して保存)</summary>
    [MaxLength(255)]
    [Column("admuse_pass")]
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>パスワード変更日</summary>
    [Column("admuse_pass_upd_date")]
    public DateTime? PassUpdDate { get; set; }

    /// <summary>パスワード有効期限 (YYYYMMDD)</summary>
    [Column("admuse_pass_kigen")]
    public int? PassKigen { get; set; }

    /// <summary>最終ログイン日時</summary>
    [Column("admuse_login_date")]
    public DateTime? LoginDate { get; set; }

    /// <summary>ユーザーID有効期限 (YYYYMMDD)</summary>
    [Column("admuse_user_kigen")]
    public int? UserKigen { get; set; }
}
