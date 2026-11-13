using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Common;
using Mitsuhide.Application.DTOs.Master;
using Mitsuhide.Domain.Entities.Master;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JyucyuController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public JyucyuController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 受注先一覧取得・検索 (frm_sel_jyucyu & マスタ一覧用)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<JyucyuDto>>> GetAll([FromQuery] PagedRequest request)
    {
        var query = _context.Jyucyu
            .AsNoTracking()
            .Where(x => x.DelFg == 0);

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var kw = request.Keyword.Trim();
            if (int.TryParse(kw, out int code))
            {
                query = query.Where(x => x.Code == code || x.Name.Contains(kw) || (x.Kana != null && x.Kana.Contains(kw)));
            }
            else
            {
                query = query.Where(x => x.Name.Contains(kw) || (x.Kana != null && x.Kana.Contains(kw)) || (x.Ryaku != null && x.Ryaku.Contains(kw)));
            }
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(x => x.Code)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new JyucyuDto
            {
                Code = x.Code,
                Name = x.Name,
                Ryaku = x.Ryaku,
                Kana = x.Kana,
                Sekinin = x.Sekinin,
                Yubin = x.Yubin,
                Jyusyo1 = x.Jyusyo1,
                Jyusyo2 = x.Jyusyo2,
                Tel = x.Tel,
                Fax = x.Fax,
                Mail = x.Mail,
                SimeDd = x.SimeDd,
                SyukinMm = x.SyukinMm,
                SyukinDd = x.SyukinDd,
                Kaisyu = x.Kaisyu,
                Tegata = x.Tegata,
                Genkin = x.Genkin,
                KakeRt = x.KakeRt,
                Syosiki = x.Syosiki,
                ToriKb = x.ToriKb,
                Biko1 = x.Biko1,
                Biko2 = x.Biko2,
                Biko3 = x.Biko3
            })
            .ToListAsync();

        return Ok(new PagedResult<JyucyuDto>
        {
            Items = items,
            TotalCount = total,
            Page = request.Page,
            PageSize = request.PageSize
        });
    }

    /// <summary>
    /// 受注先詳細取得
    /// </summary>
    [HttpGet("{code:int}")]
    public async Task<ActionResult<JyucyuDto>> GetByCode(int code)
    {
        var x = await _context.Jyucyu.AsNoTracking().FirstOrDefaultAsync(e => e.Code == code && e.DelFg == 0);
        if (x == null) return NotFound(new { message = $"受注先コード {code} は見つかりません。" });

        return Ok(new JyucyuDto
        {
            Code = x.Code,
            Name = x.Name,
            Ryaku = x.Ryaku,
            Kana = x.Kana,
            Sekinin = x.Sekinin,
            Yubin = x.Yubin,
            Jyusyo1 = x.Jyusyo1,
            Jyusyo2 = x.Jyusyo2,
            Tel = x.Tel,
            Fax = x.Fax,
            Mail = x.Mail,
            SimeDd = x.SimeDd,
            SyukinMm = x.SyukinMm,
            SyukinDd = x.SyukinDd,
            Kaisyu = x.Kaisyu,
            Tegata = x.Tegata,
            Genkin = x.Genkin,
            KakeRt = x.KakeRt,
            Syosiki = x.Syosiki,
            ToriKb = x.ToriKb,
            Biko1 = x.Biko1,
            Biko2 = x.Biko2,
            Biko3 = x.Biko3
        });
    }

    /// <summary>
    /// 受注先新規登録
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<JyucyuDto>> Create([FromBody] CreateOrUpdateJyucyuDto dto)
    {
        var exists = await _context.Jyucyu.AnyAsync(e => e.Code == dto.Code);
        if (exists) return Conflict(new { message = $"受注先コード {dto.Code} は既に登録されています。" });

        var entity = new AdMJyucyu
        {
            Code = dto.Code,
            Name = dto.Name,
            Ryaku = dto.Ryaku,
            Kana = dto.Kana,
            Sekinin = dto.Sekinin,
            Yubin = dto.Yubin,
            Jyusyo1 = dto.Jyusyo1,
            Jyusyo2 = dto.Jyusyo2,
            Tel = dto.Tel,
            Fax = dto.Fax,
            Mail = dto.Mail,
            SimeDd = dto.SimeDd,
            SyukinMm = dto.SyukinMm,
            SyukinDd = dto.SyukinDd,
            Kaisyu = dto.Kaisyu,
            Tegata = dto.Tegata,
            Genkin = dto.Genkin,
            KakeRt = dto.KakeRt,
            Syosiki = dto.Syosiki,
            ToriKb = dto.ToriKb,
            Biko1 = dto.Biko1,
            Biko2 = dto.Biko2,
            Biko3 = dto.Biko3,
            NewDate = DateTime.Now,
            NewApid = "AD1780C"
        };

        _context.Jyucyu.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByCode), new { code = entity.Code }, dto);
    }

    /// <summary>
    /// 受注先更新
    /// </summary>
    [HttpPut("{code:int}")]
    public async Task<IActionResult> Update(int code, [FromBody] CreateOrUpdateJyucyuDto dto)
    {
        var entity = await _context.Jyucyu.FirstOrDefaultAsync(e => e.Code == code && e.DelFg == 0);
        if (entity == null) return NotFound(new { message = $"受注先コード {code} は見つかりません。" });

        entity.Name = dto.Name;
        entity.Ryaku = dto.Ryaku;
        entity.Kana = dto.Kana;
        entity.Sekinin = dto.Sekinin;
        entity.Yubin = dto.Yubin;
        entity.Jyusyo1 = dto.Jyusyo1;
        entity.Jyusyo2 = dto.Jyusyo2;
        entity.Tel = dto.Tel;
        entity.Fax = dto.Fax;
        entity.Mail = dto.Mail;
        entity.SimeDd = dto.SimeDd;
        entity.SyukinMm = dto.SyukinMm;
        entity.SyukinDd = dto.SyukinDd;
        entity.Kaisyu = dto.Kaisyu;
        entity.Tegata = dto.Tegata;
        entity.Genkin = dto.Genkin;
        entity.KakeRt = dto.KakeRt;
        entity.Syosiki = dto.Syosiki;
        entity.ToriKb = dto.ToriKb;
        entity.Biko1 = dto.Biko1;
        entity.Biko2 = dto.Biko2;
        entity.Biko3 = dto.Biko3;
        entity.UpdDate = DateTime.Now;
        entity.UpdApid = "AD1780C";

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// 受注先削除 (論理削除)
    /// </summary>
    [HttpDelete("{code:int}")]
    public async Task<IActionResult> Delete(int code)
    {
        var entity = await _context.Jyucyu.FirstOrDefaultAsync(e => e.Code == code && e.DelFg == 0);
        if (entity == null) return NotFound(new { message = $"受注先コード {code} は見つかりません。" });

        entity.DelFg = 1;
        entity.UpdDate = DateTime.Now;
        entity.UpdApid = "AD1780C";

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
