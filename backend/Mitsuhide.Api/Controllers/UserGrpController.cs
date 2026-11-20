using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Master;
using Mitsuhide.Domain.Entities.Master;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserGrpController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserGrpController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// ユーザーグループ一覧取得 (AD1720C)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<UserGrpDto>>> GetAll()
    {
        var groups = await _context.UserGrpMaster
            .AsNoTracking()
            .OrderBy(x => x.UserGrpCd)
            .Select(x => new UserGrpDto
            {
                UserGrpCd = x.UserGrpCd,
                UserGrpName = x.UserGrpName,
                RunAplCnt = x.RunAplCnt,
                UpdDate = x.UpdDate ?? x.NewDate
            })
            .ToListAsync();

        return Ok(groups);
    }

    /// <summary>
    /// ユーザーグループ新規登録 (F1)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<UserGrpDto>> Create([FromBody] CreateUserGrpRequest req)
    {
        var exists = await _context.UserGrpMaster.AnyAsync(x => x.UserGrpCd == req.UserGrpCd);
        if (exists) return Conflict(new { message = $"グループコード {req.UserGrpCd} は既に存在します。" });

        var now = DateTime.Now;
        var entity = new AdMUserGrp
        {
            UserGrpCd = req.UserGrpCd,
            UserGrpName = req.UserGrpName,
            RunAplCnt = req.RunAplCnt,
            NewDate = now,
            NewUser = "SYSTEM",
            NewApid = "AD1720C",
            UpdDate = now,
            UpdUser = "SYSTEM",
            UpdApid = "AD1720C"
        };

        _context.UserGrpMaster.Add(entity);
        await _context.SaveChangesAsync();

        return Ok(new UserGrpDto
        {
            UserGrpCd = entity.UserGrpCd,
            UserGrpName = entity.UserGrpName,
            RunAplCnt = entity.RunAplCnt,
            UpdDate = entity.UpdDate
        });
    }

    /// <summary>
    /// ユーザーグループ更新
    /// </summary>
    [HttpPut("{grpCd}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Update(string grpCd, [FromBody] UpdateUserGrpRequest req)
    {
        var entity = await _context.UserGrpMaster.FirstOrDefaultAsync(x => x.UserGrpCd == grpCd);
        if (entity == null) return NotFound();

        // 排他制御 (Optimistic Concurrency Check)
        if (entity.UpdDate.HasValue && req.UpdDate.HasValue && Math.Abs((entity.UpdDate.Value - req.UpdDate.Value).TotalSeconds) > 1)
        {
            return Conflict(new { message = "他のユーザーまたは別画面によって既にデータが更新されています。最新データを再読み込みしてから再度操作してください。(排他エラー / 409 Conflict)" });
        }

        entity.UserGrpName = req.UserGrpName;
        entity.RunAplCnt = req.RunAplCnt;
        entity.UpdDate = DateTime.Now;
        entity.UpdUser = "SYSTEM";
        entity.UpdApid = "AD1720C";

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// ユーザーグループ削除 (物理削除 - F7)
    /// </summary>
    [HttpDelete("{grpCd}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Delete(string grpCd)
    {
        var entity = await _context.UserGrpMaster.FirstOrDefaultAsync(x => x.UserGrpCd == grpCd);
        if (entity == null) return NotFound();

        _context.UserGrpMaster.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
