using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Common;
using Mitsuhide.Application.DTOs.Sales;
using Mitsuhide.Domain.Entities.Data;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UriageDataController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UriageDataController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 売上データ一覧検索 (UR0010)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<UriageRecordDto>>> GetUriageList(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int? uriageDateFrom = null,
        [FromQuery] int? uriageDateTo = null,
        [FromQuery] int? jyuCyuCd = null,
        [FromQuery] int? kojiCd = null)
    {
        var query = from u in _context.Uriage.AsNoTracking().Where(x => x.DelFg == 0)
                    join j in _context.Jyucyu.AsNoTracking() on u.JyuCyuCd equals j.Code into jGroup
                    from j in jGroup.DefaultIfEmpty()
                    join k in _context.Kojijyu.AsNoTracking() on new { u.KojiCd, u.KojiSyu } equals new { k.KojiCd, k.KojiSyu } into kGroup
                    from k in kGroup.DefaultIfEmpty()
                    select new { u, j, k };

        if (uriageDateFrom.HasValue)
            query = query.Where(x => x.u.UriageDate >= uriageDateFrom.Value);

        if (uriageDateTo.HasValue)
            query = query.Where(x => x.u.UriageDate <= uriageDateTo.Value);

        if (jyuCyuCd.HasValue)
            query = query.Where(x => x.u.JyuCyuCd == jyuCyuCd.Value);

        if (kojiCd.HasValue)
            query = query.Where(x => x.u.KojiCd == kojiCd.Value);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.u.UriageDate)
            .ThenByDescending(x => x.u.UnqId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new UriageRecordDto
            {
                UnqId = x.u.UnqId,
                UriageDate = x.u.UriageDate,
                JyuCyuCd = x.u.JyuCyuCd,
                JyuNm = x.j != null ? x.j.Name : null,
                KojiCd = x.u.KojiCd,
                KojiSyu = x.u.KojiSyu,
                KojiNm = x.k != null ? x.k.KojiNm : null,
                UriageGkNk = x.u.UriageGkNk,
                ZeiRt = x.u.ZeiRt,
                ZeiGk = x.u.ZeiGk,
                UriageGkKm = x.u.UriageGkKm,
                Biko = x.u.Biko
            })
            .ToListAsync();

        return Ok(new PagedResult<UriageRecordDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    /// <summary>
    /// 売上データ単一取得
    /// </summary>
    [HttpGet("{id:long}")]
    public async Task<ActionResult<UriageRecordDto>> GetById(long id)
    {
        var item = await (from u in _context.Uriage.AsNoTracking().Where(x => x.UnqId == id && x.DelFg == 0)
                          join j in _context.Jyucyu.AsNoTracking() on u.JyuCyuCd equals j.Code into jGroup
                          from j in jGroup.DefaultIfEmpty()
                          join k in _context.Kojijyu.AsNoTracking() on new { u.KojiCd, u.KojiSyu } equals new { k.KojiCd, k.KojiSyu } into kGroup
                          from k in kGroup.DefaultIfEmpty()
                          select new UriageRecordDto
                          {
                              UnqId = u.UnqId,
                              UriageDate = u.UriageDate,
                              JyuCyuCd = u.JyuCyuCd,
                              JyuNm = j != null ? j.Name : null,
                              KojiCd = u.KojiCd,
                              KojiSyu = u.KojiSyu,
                              KojiNm = k != null ? k.KojiNm : null,
                              UriageGkNk = u.UriageGkNk,
                              ZeiRt = u.ZeiRt,
                              ZeiGk = u.ZeiGk,
                              UriageGkKm = u.UriageGkKm,
                              Biko = u.Biko
                          }).FirstOrDefaultAsync();

        if (item == null) return NotFound();
        return Ok(item);
    }

    /// <summary>
    /// 売上データ登録 (F1)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UriageRecordDto>> Create([FromBody] CreateUriageRequest req)
    {
        var zeiGk = Math.Floor(req.UriageGkNk * req.ZeiRt / 100m);
        var uriageGkKm = req.UriageGkNk + zeiGk;

        var entity = new GkTUriage
        {
            UriageDate = req.UriageDate,
            JyuCyuCd = req.JyuCyuCd,
            KojiCd = req.KojiCd,
            KojiSyu = req.KojiSyu,
            UriageGkNk = req.UriageGkNk,
            ZeiRt = req.ZeiRt,
            ZeiGk = zeiGk,
            UriageGkKm = uriageGkKm,
            Biko = req.Biko,
            NewDate = DateTime.Now,
            NewUser = "SYSTEM",
            NewApid = "UR0010",
            DelFg = 0
        };

        _context.Uriage.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = entity.UnqId }, new UriageRecordDto
        {
            UnqId = entity.UnqId,
            UriageDate = entity.UriageDate,
            JyuCyuCd = entity.JyuCyuCd,
            KojiCd = entity.KojiCd,
            KojiSyu = entity.KojiSyu,
            UriageGkNk = entity.UriageGkNk,
            ZeiRt = entity.ZeiRt,
            ZeiGk = entity.ZeiGk,
            UriageGkKm = entity.UriageGkKm,
            Biko = entity.Biko
        });
    }

    /// <summary>
    /// 売上データ更新
    /// </summary>
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateUriageRequest req)
    {
        var entity = await _context.Uriage.FirstOrDefaultAsync(x => x.UnqId == id && x.DelFg == 0);
        if (entity == null) return NotFound();

        var zeiGk = Math.Floor(req.UriageGkNk * req.ZeiRt / 100m);
        var uriageGkKm = req.UriageGkNk + zeiGk;

        entity.UriageDate = req.UriageDate;
        entity.JyuCyuCd = req.JyuCyuCd;
        entity.KojiCd = req.KojiCd;
        entity.KojiSyu = req.KojiSyu;
        entity.UriageGkNk = req.UriageGkNk;
        entity.ZeiRt = req.ZeiRt;
        entity.ZeiGk = zeiGk;
        entity.UriageGkKm = uriageGkKm;
        entity.Biko = req.Biko;
        entity.UpdDate = DateTime.Now;
        entity.UpdUser = "SYSTEM";
        entity.UpdApid = "UR0010";

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// 売上データ論理削除 (F7)
    /// </summary>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var entity = await _context.Uriage.FirstOrDefaultAsync(x => x.UnqId == id && x.DelFg == 0);
        if (entity == null) return NotFound();

        entity.DelFg = 1;
        entity.UpdDate = DateTime.Now;
        entity.UpdUser = "SYSTEM";
        entity.UpdApid = "UR0010";

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
