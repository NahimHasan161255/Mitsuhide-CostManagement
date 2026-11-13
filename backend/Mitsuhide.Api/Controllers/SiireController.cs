using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Common;
using Mitsuhide.Application.DTOs.Master;
using Mitsuhide.Domain.Entities.Master;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SiireController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SiireController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 仕入先一覧取得・検索 (frm_sel_siire & マスタ一覧用)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<SiireDto>>> GetAll([FromQuery] PagedRequest request)
    {
        var query = _context.SiireMaster
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
                query = query.Where(x => x.Name.Contains(kw) || (x.Kana != null && x.Kana.Contains(kw)) || (x.Ryaku != null && x.Ryaku.Contains(kw)) || (x.Gyousyu != null && x.Gyousyu.Contains(kw)));
            }
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(x => x.Code)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new SiireDto
            {
                Code = x.Code,
                Name = x.Name,
                Ryaku = x.Ryaku,
                Kana = x.Kana,
                Sekinin = x.Sekinin,
                Gyousyu = x.Gyousyu,
                Yubin = x.Yubin,
                Jyusyo1 = x.Jyusyo1,
                Jyusyo2 = x.Jyusyo2,
                Tel = x.Tel,
                Fax = x.Fax,
                Mail = x.Mail,
                SimeDd = x.SimeDd,
                Siharai = x.Siharai,
                Risoku = x.Risoku,
                BnkNm = x.BnkNm,
                StnNm = x.StnNm,
                KozaSb = x.KozaSb,
                KozaNo = x.KozaNo,
                KozaNm = x.KozaNm,
                Biko1 = x.Biko1,
                Biko2 = x.Biko2,
                Biko3 = x.Biko3
            })
            .ToListAsync();

        return Ok(new PagedResult<SiireDto>
        {
            Items = items,
            TotalCount = total,
            Page = request.Page,
            PageSize = request.PageSize
        });
    }

    /// <summary>
    /// 仕入先詳細取得
    /// </summary>
    [HttpGet("{code:int}")]
    public async Task<ActionResult<SiireDto>> GetByCode(int code)
    {
        var x = await _context.SiireMaster.AsNoTracking().FirstOrDefaultAsync(e => e.Code == code && e.DelFg == 0);
        if (x == null) return NotFound(new { message = $"仕入先コード {code} は見つかりません。" });

        return Ok(new SiireDto
        {
            Code = x.Code,
            Name = x.Name,
            Ryaku = x.Ryaku,
            Kana = x.Kana,
            Sekinin = x.Sekinin,
            Gyousyu = x.Gyousyu,
            Yubin = x.Yubin,
            Jyusyo1 = x.Jyusyo1,
            Jyusyo2 = x.Jyusyo2,
            Tel = x.Tel,
            Fax = x.Fax,
            Mail = x.Mail,
            SimeDd = x.SimeDd,
            Siharai = x.Siharai,
            Risoku = x.Risoku,
            BnkNm = x.BnkNm,
            StnNm = x.StnNm,
            KozaSb = x.KozaSb,
            KozaNo = x.KozaNo,
            KozaNm = x.KozaNm,
            Biko1 = x.Biko1,
            Biko2 = x.Biko2,
            Biko3 = x.Biko3
        });
    }

    /// <summary>
    /// 仕入先新規登録
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SiireDto>> Create([FromBody] CreateOrUpdateSiireDto dto)
    {
        var exists = await _context.SiireMaster.AnyAsync(e => e.Code == dto.Code);
        if (exists) return Conflict(new { message = $"仕入先コード {dto.Code} は既に登録されています。" });

        var entity = new AdMSiire
        {
            Code = dto.Code,
            Name = dto.Name,
            Ryaku = dto.Ryaku,
            Kana = dto.Kana,
            Sekinin = dto.Sekinin,
            Gyousyu = dto.Gyousyu,
            Yubin = dto.Yubin,
            Jyusyo1 = dto.Jyusyo1,
            Jyusyo2 = dto.Jyusyo2,
            Tel = dto.Tel,
            Fax = dto.Fax,
            Mail = dto.Mail,
            SimeDd = dto.SimeDd,
            Siharai = dto.Siharai,
            Risoku = dto.Risoku,
            BnkNm = dto.BnkNm,
            StnNm = dto.StnNm,
            KozaSb = dto.KozaSb,
            KozaNo = dto.KozaNo,
            KozaNm = dto.KozaNm,
            Biko1 = dto.Biko1,
            Biko2 = dto.Biko2,
            Biko3 = dto.Biko3,
            NewDate = DateTime.Now,
            NewApid = "AD1790C"
        };

        _context.SiireMaster.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByCode), new { code = entity.Code }, dto);
    }

    /// <summary>
    /// 仕入先更新
    /// </summary>
    [HttpPut("{code:int}")]
    public async Task<IActionResult> Update(int code, [FromBody] CreateOrUpdateSiireDto dto)
    {
        var entity = await _context.SiireMaster.FirstOrDefaultAsync(e => e.Code == code && e.DelFg == 0);
        if (entity == null) return NotFound(new { message = $"仕入先コード {code} は見つかりません。" });

        entity.Name = dto.Name;
        entity.Ryaku = dto.Ryaku;
        entity.Kana = dto.Kana;
        entity.Sekinin = dto.Sekinin;
        entity.Gyousyu = dto.Gyousyu;
        entity.Yubin = dto.Yubin;
        entity.Jyusyo1 = dto.Jyusyo1;
        entity.Jyusyo2 = dto.Jyusyo2;
        entity.Tel = dto.Tel;
        entity.Fax = dto.Fax;
        entity.Mail = dto.Mail;
        entity.SimeDd = dto.SimeDd;
        entity.Siharai = dto.Siharai;
        entity.Risoku = dto.Risoku;
        entity.BnkNm = dto.BnkNm;
        entity.StnNm = dto.StnNm;
        entity.KozaSb = dto.KozaSb;
        entity.KozaNo = dto.KozaNo;
        entity.KozaNm = dto.KozaNm;
        entity.Biko1 = dto.Biko1;
        entity.Biko2 = dto.Biko2;
        entity.Biko3 = dto.Biko3;
        entity.UpdDate = DateTime.Now;
        entity.UpdApid = "AD1790C";

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// 仕入先削除 (論理削除)
    /// </summary>
    [HttpDelete("{code:int}")]
    public async Task<IActionResult> Delete(int code)
    {
        var entity = await _context.SiireMaster.FirstOrDefaultAsync(e => e.Code == code && e.DelFg == 0);
        if (entity == null) return NotFound(new { message = $"仕入先コード {code} は見つかりません。" });

        entity.DelFg = 1;
        entity.UpdDate = DateTime.Now;
        entity.UpdApid = "AD1790C";

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
