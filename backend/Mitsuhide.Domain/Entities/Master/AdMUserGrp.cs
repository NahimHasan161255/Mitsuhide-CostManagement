using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mitsuhide.Domain.Common;

namespace Mitsuhide.Domain.Entities.Master;

/// <summary>
/// ユーザーグループマスタ (AD_M_USER_GRP - User Group / Role Master)
/// </summary>
[Table("AD_M_USER_GRP")]
public class AdMUserGrp : BaseEntity
{
    /// <summary>ユーザーグループCD (PKEY - vchr 4)</summary>
    [Key]
    [MaxLength(4)]
    [Column("admgrp_usergrp_cd")]
    public string UserGrpCd { get; set; } = string.Empty;

    /// <summary>グループ名称 (vchr 20)</summary>
    [Required]
    [MaxLength(20)]
    [Column("admgrp_usergrp_name")]
    public string UserGrpName { get; set; } = string.Empty;

    /// <summary>同時実行可能APL数 (sint 1)</summary>
    [Column("admgrp_run_apl_cnt")]
    public int RunAplCnt { get; set; } = 5;
}
