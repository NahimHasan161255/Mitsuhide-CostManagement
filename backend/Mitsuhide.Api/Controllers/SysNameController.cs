using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Common;
using Mitsuhide.Application.DTOs.Master;
using Mitsuhide.Domain.Entities.Master;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/name")]
[Authorize]
public class SysNameController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SysNameController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// システム名称一覧取得 (AD1760C)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<SysNameDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30,
        [FromQuery] string? nameKbn = null,
        [FromQuery] string? startNameCd = null,
        [FromQuery] string? endNameCd = null,
        [FromQuery] string? keyword = null)
    {
        var query = _context.SysNameMaster.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(nameKbn) && nameKbn != "ALL")
            query = query.Where(x => x.NameKbn == nameKbn);

        if (!string.IsNullOrWhiteSpace(startNameCd))
            query = query.Where(x => string.Compare(x.NameCd, startNameCd) >= 0);

        if (!string.IsNullOrWhiteSpace(endNameCd))
            query = query.Where(x => string.Compare(x.NameCd, endNameCd) <= 0);

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(x => x.NameCd.Contains(keyword) || x.Ch1.Contains(keyword) || (x.Ch2 != null && x.Ch2.Contains(keyword)));

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.NameKbn)
            .ThenBy(x => x.NameCd)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new SysNameDto
            {
                NameKbn = x.NameKbn,
                NameCd = x.NameCd,
                Ch1 = x.Ch1,
                Ch2 = x.Ch2,
                Nm1 = x.Nm1,
                Nm2 = x.Nm2,
                Date1 = x.Date1,
                Date2 = x.Date2,
                NewUser = x.NewUser,
                NewDate = x.NewDate,
                NewApid = x.NewApid,
                NewWsnm = x.NewWsnm,
                UpdUser = x.UpdUser,
                UpdDate = x.UpdDate ?? x.NewDate,
                UpdApid = x.UpdApid,
                UpdWsnm = x.UpdWsnm,
            })
            .ToListAsync();

        return Ok(new PagedResult<SysNameDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    /// <summary>
    /// 名称区分ごとのコード一覧取得 (ドロップダウン用)
    /// </summary>
    [HttpGet("by-kbn/{kbn}")]
    public async Task<ActionResult<List<SysNameDto>>> GetByKbn(string kbn)
    {
        var items = await _context.SysNameMaster
            .AsNoTracking()
            .Where(x => x.NameKbn == kbn)
            .OrderBy(x => x.Nm1 ?? 0)
            .ThenBy(x => x.NameCd)
            .Select(x => new SysNameDto
            {
                NameKbn = x.NameKbn,
                NameCd = x.NameCd,
                Ch1 = x.Ch1,
                Ch2 = x.Ch2,
                Nm1 = x.Nm1,
                UpdDate = x.UpdDate ?? x.NewDate
            })
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// システム名称新規登録 (F1)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SysNameDto>> Create([FromBody] CreateSysNameRequest req)
    {
        var exists = await _context.SysNameMaster.AnyAsync(x => x.NameKbn == req.NameKbn && x.NameCd == req.NameCd);
        if (exists) return Conflict(new { message = $"区分 {req.NameKbn} のコード {req.NameCd} は既に存在します。" });

        var now = DateTime.Now;
        var entity = new AdMSysName
        {
            NameKbn = req.NameKbn,
            NameCd = req.NameCd,
            Ch1 = req.Ch1,
            Ch2 = req.Ch2,
            Nm1 = req.Nm1,
            Nm2 = req.Nm2,
            NewDate = now,
            NewUser = "SYSTEM",
            NewApid = "AD1760C",
            UpdDate = now,
            UpdUser = "SYSTEM",
            UpdApid = "AD1760C"
        };

        _context.SysNameMaster.Add(entity);
        await _context.SaveChangesAsync();

        return Ok(new SysNameDto
        {
            NameKbn = entity.NameKbn,
            NameCd = entity.NameCd,
            Ch1 = entity.Ch1,
            Ch2 = entity.Ch2,
            Nm1 = entity.Nm1,
            Nm2 = entity.Nm2,
            UpdDate = entity.UpdDate
        });
    }

    /// <summary>
    /// システム名称更新
    /// </summary>
    [HttpPut("{nameKbn}/{nameCd}")]
    public async Task<IActionResult> Update(string nameKbn, string nameCd, [FromBody] UpdateSysNameRequest req)
    {
        var entity = await _context.SysNameMaster.FirstOrDefaultAsync(x => x.NameKbn == nameKbn && x.NameCd == nameCd);
        if (entity == null) return NotFound();

        // 排他制御 (Optimistic Concurrency Check)
        if (entity.UpdDate.HasValue && req.UpdDate.HasValue && Math.Abs((entity.UpdDate.Value - req.UpdDate.Value).TotalSeconds) > 1)
        {
            return Conflict(new { message = "他のユーザーまたは別画面によって既にデータが更新されています。最新データを再読み込みしてから再度操作してください。(排他エラー / 409 Conflict)" });
        }

        entity.Ch1 = req.Ch1;
        entity.Ch2 = req.Ch2;
        entity.Nm1 = req.Nm1;
        entity.Nm2 = req.Nm2;
        entity.UpdDate = DateTime.Now;
        entity.UpdUser = "SYSTEM";
        entity.UpdApid = "AD1760C";

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// システム名称削除 (物理削除 - F7)
    /// </summary>
    [HttpDelete("{nameKbn}/{nameCd}")]
    public async Task<IActionResult> Delete(string nameKbn, string nameCd)
    {
        var entity = await _context.SysNameMaster.FirstOrDefaultAsync(x => x.NameKbn == nameKbn && x.NameCd == nameCd);
        if (entity == null) return NotFound();

        _context.SysNameMaster.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
