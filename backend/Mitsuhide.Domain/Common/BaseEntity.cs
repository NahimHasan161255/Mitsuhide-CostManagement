namespace Mitsuhide.Domain.Common;

/// <summary>
/// 共通監査情報 (Common Audit Fields for Mitsuhide System)
/// </summary>
public abstract class BaseEntity
{
    /// <summary>初回作成者 (vchr 6)</summary>
    public string? NewUser { get; set; }

    /// <summary>初回作成日</summary>
    public DateTime? NewDate { get; set; }

    /// <summary>初回作成APLID (vchr 7, e.g., GK0010)</summary>
    public string? NewApid { get; set; }

    /// <summary>初回作成端末名 (vchr 20)</summary>
    public string? NewWsnm { get; set; }

    /// <summary>最終更新者 (vchr 6)</summary>
    public string? UpdUser { get; set; }

    /// <summary>最終更新日</summary>
    public DateTime? UpdDate { get; set; }

    /// <summary>最終更新APLID (vchr 7)</summary>
    public string? UpdApid { get; set; }

    /// <summary>最終更新端末名 (vchr 20)</summary>
    public string? UpdWsnm { get; set; }

    /// <summary>削除フラグ (0: 有効, 1: 削除)</summary>
    public int DelFg { get; set; } = 0;
}
