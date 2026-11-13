using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Common;
using Mitsuhide.Application.DTOs.Cost;
using Mitsuhide.Domain.Entities.Data;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KojijyuController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public KojijyuController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 工事受注一覧・検索 (GK0120 & 検索用)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<KojijyuDto>>> GetAll([FromQuery] PagedRequest request)
    {
        var query = from k in _context.Kojijyu.AsNoTracking().Where(x => x.DelFg == 0)
                    join j in _context.Jyucyu.AsNoTracking() on k.JyuCd equals j.Code into jGroup
                    from j in jGroup.DefaultIfEmpty()
                    select new { k, JyuNm = j != null ? j.Name : null };

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var kw = request.Keyword.Trim();
            if (int.TryParse(kw, out int code))
            {
                query = query.Where(x => x.k.KojiCd == code || x.k.JyuCd == code || (x.k.KojiNm != null && x.k.KojiNm.Contains(kw)));
            }
            else
            {
                query = query.Where(x => (x.k.KojiNm != null && x.k.KojiNm.Contains(kw)) ||
                                         (x.k.KojiRyk != null && x.k.KojiRyk.Contains(kw)) ||
                                         (x.k.KojiKana != null && x.k.KojiKana.Contains(kw)) ||
                                         (x.JyuNm != null && x.JyuNm.Contains(kw)));
            }
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.k.KojiCd)
            .ThenBy(x => x.k.KojiSyu)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new KojijyuDto
            {
                UnqId = x.k.UnqId,
                KojiCd = x.k.KojiCd,
                KojiSyu = x.k.KojiSyu,
                KojiNm = x.k.KojiNm,
                KojiRyk = x.k.KojiRyk,
                KojiKana = x.k.KojiKana,
                Sekkei = x.k.Sekkei,
                JyuCd = x.k.JyuCd,
                JyuNm = x.JyuNm,
                KeiyakuGnk = x.k.KeiyakuGnk,
                KeiyakuGkm = x.k.KeiyakuGkm,
                Keiyaku0Dt = x.k.Keiyaku0Dt,
                Keiyaku0Rt = x.k.Keiyaku0Rt,
                Keiyaku0Nk = x.k.Keiyaku0Nk,
                Keiyaku0Km = x.k.Keiyaku0Km,
                Keiyaku1Dt = x.k.Keiyaku1Dt,
                Keiyaku1Rt = x.k.Keiyaku1Rt,
                Keiyaku1Nk = x.k.Keiyaku1Nk,
                Keiyaku1Km = x.k.Keiyaku1Km,
                Keiyaku2Dt = x.k.Keiyaku2Dt,
                Keiyaku2Rt = x.k.Keiyaku2Rt,
                Keiyaku2Nk = x.k.Keiyaku2Nk,
                Keiyaku2Km = x.k.Keiyaku2Km,
                Keiyaku3Dt = x.k.Keiyaku3Dt,
                Keiyaku3Rt = x.k.Keiyaku3Rt,
                Keiyaku3Nk = x.k.Keiyaku3Nk,
                Keiyaku3Km = x.k.Keiyaku3Km,
                Yosangaku = x.k.Yosangaku,
                YoteiArari = x.k.YoteiArari,
                KoukiBgn = x.k.KoukiBgn,
                KoukiEnd = x.k.KoukiEnd,
                Basyo = x.k.Basyo,
                Jimusho = x.k.Jimusho,
                EigyoCd = x.k.EigyoCd,
                GenbaCd = x.k.GenbaCd,
                Jyuryo = x.k.Jyuryo,
                Koumin = x.k.Koumin,
                Keitai = x.k.Keitai,
                KanseiKb = x.k.KanseiKb,
                KanseiDt = x.k.KanseiDt,
                EndNyukin = x.k.EndNyukin,
                HoryuFg = x.k.HoryuFg,
                Biko1 = x.k.Biko1,
                Biko2 = x.k.Biko2,
                KojiBiko1 = x.k.KojiBiko1,
                KojiBiko2 = x.k.KojiBiko2
            })
            .ToListAsync();

        return Ok(new PagedResult<KojijyuDto>
        {
            Items = items,
            TotalCount = total,
            Page = request.Page,
            PageSize = request.PageSize
        });
    }

    /// <summary>
    /// 次の利用可能工事コードを取得
    /// </summary>
    [HttpGet("next-code")]
    public async Task<ActionResult<int>> GetNextCode()
    {
        var max = await _context.Kojijyu.MaxAsync(x => (int?)x.KojiCd) ?? 100000;
        return Ok(max + 1);
    }

    /// <summary>
    /// 工事受注詳細取得 (GK0010 呼出)
    /// </summary>
    [HttpGet("{kojiCd:int}/{kojiSyu:int}")]
    public async Task<ActionResult<KojijyuDto>> GetByKeys(int kojiCd, int kojiSyu)
    {
        var item = await (from k in _context.Kojijyu.AsNoTracking().Where(x => x.KojiCd == kojiCd && x.KojiSyu == kojiSyu && x.DelFg == 0)
                          join j in _context.Jyucyu.AsNoTracking() on k.JyuCd equals j.Code into jGroup
                          from j in jGroup.DefaultIfEmpty()
                          select new KojijyuDto
                          {
                              UnqId = k.UnqId,
                              KojiCd = k.KojiCd,
                              KojiSyu = k.KojiSyu,
                              KojiNm = k.KojiNm,
                              KojiRyk = k.KojiRyk,
                              KojiKana = k.KojiKana,
                              Sekkei = k.Sekkei,
                              JyuCd = k.JyuCd,
                              JyuNm = j != null ? j.Name : null,
                              KeiyakuGnk = k.KeiyakuGnk,
                              KeiyakuGkm = k.KeiyakuGkm,
                              Keiyaku0Dt = k.Keiyaku0Dt,
                              Keiyaku0Rt = k.Keiyaku0Rt,
                              Keiyaku0Nk = k.Keiyaku0Nk,
                              Keiyaku0Km = k.Keiyaku0Km,
                              Keiyaku1Dt = k.Keiyaku1Dt,
                              Keiyaku1Rt = k.Keiyaku1Rt,
                              Keiyaku1Nk = k.Keiyaku1Nk,
                              Keiyaku1Km = k.Keiyaku1Km,
                              Keiyaku2Dt = k.Keiyaku2Dt,
                              Keiyaku2Rt = k.Keiyaku2Rt,
                              Keiyaku2Nk = k.Keiyaku2Nk,
                              Keiyaku2Km = k.Keiyaku2Km,
                              Keiyaku3Dt = k.Keiyaku3Dt,
                              Keiyaku3Rt = k.Keiyaku3Rt,
                              Keiyaku3Nk = k.Keiyaku3Nk,
                              Keiyaku3Km = k.Keiyaku3Km,
                              Yosangaku = k.Yosangaku,
                              YoteiArari = k.YoteiArari,
                              KoukiBgn = k.KoukiBgn,
                              KoukiEnd = k.KoukiEnd,
                              Basyo = k.Basyo,
                              Jimusho = k.Jimusho,
                              EigyoCd = k.EigyoCd,
                              GenbaCd = k.GenbaCd,
                              Jyuryo = k.Jyuryo,
                              Koumin = k.Koumin,
                              Keitai = k.Keitai,
                              KanseiKb = k.KanseiKb,
                              KanseiDt = k.KanseiDt,
                              EndNyukin = k.EndNyukin,
                              HoryuFg = k.HoryuFg,
                              Biko1 = k.Biko1,
                              Biko2 = k.Biko2,
                              KojiBiko1 = k.KojiBiko1,
                              KojiBiko2 = k.KojiBiko2
                          }).FirstOrDefaultAsync();

        if (item == null) return NotFound(new { message = $"工事コード {kojiCd}-{kojiSyu} は見つかりません。" });
        return Ok(item);
    }

    /// <summary>
    /// 工事受注新規登録 (GK0010 登録 F1)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<KojijyuDto>> Create([FromBody] CreateOrUpdateKojijyuDto dto)
    {
        var exists = await _context.Kojijyu.AnyAsync(x => x.KojiCd == dto.KojiCd && x.KojiSyu == dto.KojiSyu && x.DelFg == 0);
        if (exists) return Conflict(new { message = $"工事コード {dto.KojiCd}-{dto.KojiSyu} は既に登録されています。" });

        // Calculate contract sums (当初 + 変更1 + 変更2 + 変更3)
        var totalNk = dto.Keiyaku0Nk + (dto.Keiyaku1Nk ?? 0) + (dto.Keiyaku2Nk ?? 0) + (dto.Keiyaku3Nk ?? 0);
        var totalKm = dto.Keiyaku0Km + (dto.Keiyaku1Km ?? 0) + (dto.Keiyaku2Km ?? 0) + (dto.Keiyaku3Km ?? 0);
        var margin = totalNk - dto.Yosangaku;

        var entity = new GkTKojijyu
        {
            KojiCd = dto.KojiCd,
            KojiSyu = dto.KojiSyu,
            KojiNm = dto.KojiNm,
            KojiRyk = dto.KojiRyk,
            KojiKana = dto.KojiKana,
            Sekkei = dto.Sekkei,
            JyuCd = dto.JyuCd,
            KeiyakuGnk = totalNk,
            KeiyakuGkm = totalKm,
            Keiyaku0Dt = dto.Keiyaku0Dt,
            Keiyaku0Rt = dto.Keiyaku0Rt,
            Keiyaku0Nk = dto.Keiyaku0Nk,
            Keiyaku0Km = dto.Keiyaku0Km,
            Keiyaku1Dt = dto.Keiyaku1Dt,
            Keiyaku1Rt = dto.Keiyaku1Rt,
            Keiyaku1Nk = dto.Keiyaku1Nk,
            Keiyaku1Km = dto.Keiyaku1Km,
            Keiyaku2Dt = dto.Keiyaku2Dt,
            Keiyaku2Rt = dto.Keiyaku2Rt,
            Keiyaku2Nk = dto.Keiyaku2Nk,
            Keiyaku2Km = dto.Keiyaku2Km,
            Keiyaku3Dt = dto.Keiyaku3Dt,
            Keiyaku3Rt = dto.Keiyaku3Rt,
            Keiyaku3Nk = dto.Keiyaku3Nk,
            Keiyaku3Km = dto.Keiyaku3Km,
            Yosangaku = dto.Yosangaku,
            YoteiArari = margin,
            KoukiBgn = dto.KoukiBgn,
            KoukiEnd = dto.KoukiEnd,
            Basyo = dto.Basyo,
            Jimusho = dto.Jimusho,
            EigyoCd = dto.EigyoCd,
            GenbaCd = dto.GenbaCd,
            Jyuryo = dto.Jyuryo,
            Koumin = dto.Koumin,
            Keitai = dto.Keitai,
            KanseiKb = dto.KanseiKb,
            KanseiDt = dto.KanseiDt,
            EndNyukin = dto.EndNyukin,
            HoryuFg = dto.HoryuFg,
            Biko1 = dto.Biko1,
            Biko2 = dto.Biko2,
            KojiBiko1 = dto.KojiBiko1,
            KojiBiko2 = dto.KojiBiko2,
            NewDate = DateTime.Now,
            NewApid = "GK0010"
        };

        _context.Kojijyu.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByKeys), new { kojiCd = entity.KojiCd, kojiSyu = entity.KojiSyu }, dto);
    }

    /// <summary>
    /// 工事受注更新 (GK0010 更新 F1)
    /// </summary>
    [HttpPut("{kojiCd:int}/{kojiSyu:int}")]
    public async Task<IActionResult> Update(int kojiCd, int kojiSyu, [FromBody] CreateOrUpdateKojijyuDto dto)
    {
        var entity = await _context.Kojijyu.FirstOrDefaultAsync(x => x.KojiCd == kojiCd && x.KojiSyu == kojiSyu && x.DelFg == 0);
        if (entity == null) return NotFound(new { message = $"工事コード {kojiCd}-{kojiSyu} は見つかりません。" });

        var totalNk = dto.Keiyaku0Nk + (dto.Keiyaku1Nk ?? 0) + (dto.Keiyaku2Nk ?? 0) + (dto.Keiyaku3Nk ?? 0);
        var totalKm = dto.Keiyaku0Km + (dto.Keiyaku1Km ?? 0) + (dto.Keiyaku2Km ?? 0) + (dto.Keiyaku3Km ?? 0);
        var margin = totalNk - dto.Yosangaku;

        entity.KojiNm = dto.KojiNm;
        entity.KojiRyk = dto.KojiRyk;
        entity.KojiKana = dto.KojiKana;
        entity.Sekkei = dto.Sekkei;
        entity.JyuCd = dto.JyuCd;
        entity.KeiyakuGnk = totalNk;
        entity.KeiyakuGkm = totalKm;
        entity.Keiyaku0Dt = dto.Keiyaku0Dt;
        entity.Keiyaku0Rt = dto.Keiyaku0Rt;
        entity.Keiyaku0Nk = dto.Keiyaku0Nk;
        entity.Keiyaku0Km = dto.Keiyaku0Km;
        entity.Keiyaku1Dt = dto.Keiyaku1Dt;
        entity.Keiyaku1Rt = dto.Keiyaku1Rt;
        entity.Keiyaku1Nk = dto.Keiyaku1Nk;
        entity.Keiyaku1Km = dto.Keiyaku1Km;
        entity.Keiyaku2Dt = dto.Keiyaku2Dt;
        entity.Keiyaku2Rt = dto.Keiyaku2Rt;
        entity.Keiyaku2Nk = dto.Keiyaku2Nk;
        entity.Keiyaku2Km = dto.Keiyaku2Km;
        entity.Keiyaku3Dt = dto.Keiyaku3Dt;
        entity.Keiyaku3Rt = dto.Keiyaku3Rt;
        entity.Keiyaku3Nk = dto.Keiyaku3Nk;
        entity.Keiyaku3Km = dto.Keiyaku3Km;
        entity.Yosangaku = dto.Yosangaku;
        entity.YoteiArari = margin;
        entity.KoukiBgn = dto.KoukiBgn;
        entity.KoukiEnd = dto.KoukiEnd;
        entity.Basyo = dto.Basyo;
        entity.Jimusho = dto.Jimusho;
        entity.EigyoCd = dto.EigyoCd;
        entity.GenbaCd = dto.GenbaCd;
        entity.Jyuryo = dto.Jyuryo;
        entity.Koumin = dto.Koumin;
        entity.Keitai = dto.Keitai;
        entity.KanseiKb = dto.KanseiKb;
        entity.KanseiDt = dto.KanseiDt;
        entity.EndNyukin = dto.EndNyukin;
        entity.HoryuFg = dto.HoryuFg;
        entity.Biko1 = dto.Biko1;
        entity.Biko2 = dto.Biko2;
        entity.KojiBiko1 = dto.KojiBiko1;
        entity.KojiBiko2 = dto.KojiBiko2;
        entity.UpdDate = DateTime.Now;
        entity.UpdApid = "GK0010";

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// 工事受注削除 (GK0010 削除 F7 - 論理削除)
    /// </summary>
    [HttpDelete("{kojiCd:int}/{kojiSyu:int}")]
    public async Task<IActionResult> Delete(int kojiCd, int kojiSyu)
    {
        var entity = await _context.Kojijyu.FirstOrDefaultAsync(x => x.KojiCd == kojiCd && x.KojiSyu == kojiSyu && x.DelFg == 0);
        if (entity == null) return NotFound(new { message = $"工事コード {kojiCd}-{kojiSyu} は見つかりません。" });

        entity.DelFg = 1;
        entity.UpdDate = DateTime.Now;
        entity.UpdApid = "GK0010";

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
