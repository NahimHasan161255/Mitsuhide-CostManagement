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
                RunAplCnt = x.RunAplCnt
            })
            .ToListAsync();

        return Ok(groups);
    }

    /// <summary>
    /// ユーザーグループ新規登録 (F1)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserGrpDto>> Create([FromBody] CreateUserGrpRequest req)
    {
        var exists = await _context.UserGrpMaster.AnyAsync(x => x.UserGrpCd == req.UserGrpCd);
        if (exists) return Conflict(new { message = $"グループコード {req.UserGrpCd} は既に存在します。" });

        var entity = new AdMUserGrp
        {
            UserGrpCd = req.UserGrpCd,
            UserGrpName = req.UserGrpName,
            RunAplCnt = req.RunAplCnt,
            NewDate = DateTime.Now,
            NewUser = "SYSTEM",
            NewApid = "AD1720C"
        };

        _context.UserGrpMaster.Add(entity);
        await _context.SaveChangesAsync();

        return Ok(new UserGrpDto
        {
            UserGrpCd = entity.UserGrpCd,
            UserGrpName = entity.UserGrpName,
            RunAplCnt = entity.RunAplCnt
        });
    }

    /// <summary>
    /// ユーザーグループ更新
    /// </summary>
    [HttpPut("{grpCd}")]
    public async Task<IActionResult> Update(string grpCd, [FromBody] UpdateUserGrpRequest req)
    {
        var entity = await _context.UserGrpMaster.FirstOrDefaultAsync(x => x.UserGrpCd == grpCd);
        if (entity == null) return NotFound();

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
    public async Task<IActionResult> Delete(string grpCd)
    {
        var entity = await _context.UserGrpMaster.FirstOrDefaultAsync(x => x.UserGrpCd == grpCd);
        if (entity == null) return NotFound();

        _context.UserGrpMaster.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
