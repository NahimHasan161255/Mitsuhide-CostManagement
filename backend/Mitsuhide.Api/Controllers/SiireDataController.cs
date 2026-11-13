using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Common;
using Mitsuhide.Application.DTOs.Purchase;
using Mitsuhide.Domain.Entities.Data;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SiireDataController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SiireDataController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 仕入伝票一覧検索取得 (SR0010)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<SiireRecordDto>>> GetSiireList(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int? siireDateFrom = null,
        [FromQuery] int? siireDateTo = null,
        [FromQuery] int? siireCd = null,
        [FromQuery] int? kojiCd = null)
    {
        var query = from s in _context.Siire.AsNoTracking().Where(x => x.DelFg == 0)
                    join sm in _context.SiireMaster.AsNoTracking() on s.SiireCd equals sm.Code into smGroup
                    from sm in smGroup.DefaultIfEmpty()
                    join k in _context.Kojijyu.AsNoTracking() on new { s.KojiCd, s.KojiSyu } equals new { k.KojiCd, k.KojiSyu } into kGroup
                    from k in kGroup.DefaultIfEmpty()
                    select new { s, sm, k };

        if (siireDateFrom.HasValue)
            query = query.Where(x => x.s.SiireDate >= siireDateFrom.Value);

        if (siireDateTo.HasValue)
            query = query.Where(x => x.s.SiireDate <= siireDateTo.Value);

        if (siireCd.HasValue)
            query = query.Where(x => x.s.SiireCd == siireCd.Value);

        if (kojiCd.HasValue)
            query = query.Where(x => x.s.KojiCd == kojiCd.Value);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.s.SiireDate)
            .ThenByDescending(x => x.s.UnqId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new SiireRecordDto
            {
                UnqId = x.s.UnqId,
                SiireDate = x.s.SiireDate,
                SiireCd = x.s.SiireCd,
                SiireNm = x.sm != null ? x.sm.Name : null,
                KojiCd = x.s.KojiCd,
                KojiSyu = x.s.KojiSyu,
                KojiNm = x.k != null ? x.k.KojiNm : null,
                YosaSyu = x.s.YosaSyu,
                YosaSyuNm = GetYosaSyuName(x.s.YosaSyu),
                AiteKam = x.s.AiteKam,
                SiireGkNk = x.s.SiireGkNk,
                ZeiRt = x.s.ZeiRt,
                ZeiGk = x.s.ZeiGk,
                SiireGkKm = x.s.SiireGkKm,
                Biko = x.s.Biko
            })
            .ToListAsync();

        return Ok(new PagedResult<SiireRecordDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    /// <summary>
    /// 仕入伝票単一取得
    /// </summary>
    [HttpGet("{id:long}")]
    public async Task<ActionResult<SiireRecordDto>> GetById(long id)
    {
        var item = await (from s in _context.Siire.AsNoTracking().Where(x => x.UnqId == id && x.DelFg == 0)
                          join sm in _context.SiireMaster.AsNoTracking() on s.SiireCd equals sm.Code into smGroup
                          from sm in smGroup.DefaultIfEmpty()
                          join k in _context.Kojijyu.AsNoTracking() on new { s.KojiCd, s.KojiSyu } equals new { k.KojiCd, k.KojiSyu } into kGroup
                          from k in kGroup.DefaultIfEmpty()
                          select new SiireRecordDto
                          {
                              UnqId = s.UnqId,
                              SiireDate = s.SiireDate,
                              SiireCd = s.SiireCd,
                              SiireNm = sm != null ? sm.Name : null,
                              KojiCd = s.KojiCd,
                              KojiSyu = s.KojiSyu,
                              KojiNm = k != null ? k.KojiNm : null,
                              YosaSyu = s.YosaSyu,
                              YosaSyuNm = GetYosaSyuName(s.YosaSyu),
                              AiteKam = s.AiteKam,
                              SiireGkNk = s.SiireGkNk,
                              ZeiRt = s.ZeiRt,
                              ZeiGk = s.ZeiGk,
                              SiireGkKm = s.SiireGkKm,
                              Biko = s.Biko
                          }).FirstOrDefaultAsync();

        if (item == null) return NotFound();
        return Ok(item);
    }

    /// <summary>
    /// 仕入伝票登録 (F1)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SiireRecordDto>> Create([FromBody] CreateSiireRequest req)
    {
        var zeiGk = Math.Floor(req.SiireGkNk * req.ZeiRt / 100m);
        var siireGkKm = req.SiireGkNk + zeiGk;

        var entity = new GkTSiire
        {
            SiireDate = req.SiireDate,
            SiireCd = req.SiireCd,
            KojiCd = req.KojiCd,
            KojiSyu = req.KojiSyu,
            YosaSyu = req.YosaSyu,
            AiteKam = req.AiteKam,
            SiireGkNk = req.SiireGkNk,
            ZeiRt = req.ZeiRt,
            ZeiGk = zeiGk,
            SiireGkKm = siireGkKm,
            Biko = req.Biko,
            NewDate = DateTime.Now,
            NewUser = "SYSTEM",
            NewApid = "SR0010",
            DelFg = 0
        };

        _context.Siire.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = entity.UnqId }, new SiireRecordDto
        {
            UnqId = entity.UnqId,
            SiireDate = entity.SiireDate,
            SiireCd = entity.SiireCd,
            KojiCd = entity.KojiCd,
            KojiSyu = entity.KojiSyu,
            YosaSyu = entity.YosaSyu,
            YosaSyuNm = GetYosaSyuName(entity.YosaSyu),
            AiteKam = entity.AiteKam,
            SiireGkNk = entity.SiireGkNk,
            ZeiRt = entity.ZeiRt,
            ZeiGk = entity.ZeiGk,
            SiireGkKm = entity.SiireGkKm,
            Biko = entity.Biko
        });
    }

    /// <summary>
    /// 仕入伝票更新
    /// </summary>
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateSiireRequest req)
    {
        var entity = await _context.Siire.FirstOrDefaultAsync(x => x.UnqId == id && x.DelFg == 0);
        if (entity == null) return NotFound();

        var zeiGk = Math.Floor(req.SiireGkNk * req.ZeiRt / 100m);
        var siireGkKm = req.SiireGkNk + zeiGk;

        entity.SiireDate = req.SiireDate;
        entity.SiireCd = req.SiireCd;
        entity.KojiCd = req.KojiCd;
        entity.KojiSyu = req.KojiSyu;
        entity.YosaSyu = req.YosaSyu;
        entity.AiteKam = req.AiteKam;
        entity.SiireGkNk = req.SiireGkNk;
        entity.ZeiRt = req.ZeiRt;
        entity.ZeiGk = zeiGk;
        entity.SiireGkKm = siireGkKm;
        entity.Biko = req.Biko;
        entity.UpdDate = DateTime.Now;
        entity.UpdUser = "SYSTEM";
        entity.UpdApid = "SR0010";

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// 仕入伝票論理削除 (F7)
    /// </summary>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var entity = await _context.Siire.FirstOrDefaultAsync(x => x.UnqId == id && x.DelFg == 0);
        if (entity == null) return NotFound();

        entity.DelFg = 1;
        entity.UpdDate = DateTime.Now;
        entity.UpdUser = "SYSTEM";
        entity.UpdApid = "SR0010";

        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static string GetYosaSyuName(int yosaSyu) => yosaSyu switch
    {
        101 => "鋼材・材料費",
        102 => "一次加工・切断",
        103 => "二次加工・鍛冶組立",
        104 => "溶接・検査費",
        105 => "メッキ・塗装費",
        106 => "運搬・トレーラー費",
        107 => "現場建方・クレーン費",
        108 => "現場管理・諸経費",
        _ => $"予算種目({yosaSyu})"
    };
}
