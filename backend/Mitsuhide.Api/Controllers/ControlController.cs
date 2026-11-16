using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Common;
using Mitsuhide.Application.DTOs.Master;
using Mitsuhide.Domain.Entities.Master;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ControlController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ControlController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 処理基準管理一覧取得 (AD1770C)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<ControlDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30,
        [FromQuery] string? subSysCd = null)
    {
        var query = _context.ControlMaster.AsNoTracking().Where(x => x.DelFg == 0);

        if (!string.IsNullOrWhiteSpace(subSysCd))
            query = query.Where(x => x.SubSysCd == subSysCd);

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.SubSysCd)
            .ThenBy(x => x.ProgId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ControlDto
            {
                SubSysCd = x.SubSysCd,
                ProgId = x.ProgId,
                KanriName = x.KanriName,
                Nm1 = x.Nm1,
                Nm2 = x.Nm2,
                Ch1 = x.Ch1,
                Ch2 = x.Ch2
            })
            .ToListAsync();

        return Ok(new PagedResult<ControlDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    /// <summary>
    /// 処理基準新規登録 (F1)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ControlDto>> Create([FromBody] CreateControlRequest req)
    {
        var exists = await _context.ControlMaster.AnyAsync(x => x.SubSysCd == req.SubSysCd && x.ProgId == req.ProgId);
        if (exists) return Conflict(new { message = $"サブシステム {req.SubSysCd} のプログラム {req.ProgId} は既に存在します。" });

        var entity = new AdMControl
        {
            SubSysCd = req.SubSysCd,
            ProgId = req.ProgId,
            KanriName = req.KanriName,
            Nm1 = req.Nm1,
            Nm2 = req.Nm2,
            Ch1 = req.Ch1,
            Ch2 = req.Ch2,
            NewDate = DateTime.Now,
            NewUser = "SYSTEM",
            NewApid = "AD1770C",
            DelFg = 0
        };

        _context.ControlMaster.Add(entity);
        await _context.SaveChangesAsync();

        return Ok(new ControlDto
        {
            SubSysCd = entity.SubSysCd,
            ProgId = entity.ProgId,
            KanriName = entity.KanriName,
            Nm1 = entity.Nm1,
            Nm2 = entity.Nm2,
            Ch1 = entity.Ch1,
            Ch2 = entity.Ch2
        });
    }

    /// <summary>
    /// 処理基準更新
    /// </summary>
    [HttpPut("{subSysCd}/{progId}")]
    public async Task<IActionResult> Update(string subSysCd, string progId, [FromBody] UpdateControlRequest req)
    {
        var entity = await _context.ControlMaster.FirstOrDefaultAsync(x => x.SubSysCd == subSysCd && x.ProgId == progId && x.DelFg == 0);
        if (entity == null) return NotFound();

        entity.KanriName = req.KanriName;
        entity.Nm1 = req.Nm1;
        entity.Nm2 = req.Nm2;
        entity.Ch1 = req.Ch1;
        entity.Ch2 = req.Ch2;
        entity.UpdDate = DateTime.Now;
        entity.UpdUser = "SYSTEM";
        entity.UpdApid = "AD1770C";

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// 処理基準削除 (F7)
    /// </summary>
    [HttpDelete("{subSysCd}/{progId}")]
    public async Task<IActionResult> Delete(string subSysCd, string progId)
    {
        var entity = await _context.ControlMaster.FirstOrDefaultAsync(x => x.SubSysCd == subSysCd && x.ProgId == progId && x.DelFg == 0);
        if (entity == null) return NotFound();

        entity.DelFg = 1;
        entity.UpdDate = DateTime.Now;
        entity.UpdUser = "SYSTEM";
        entity.UpdApid = "AD1770C";

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
