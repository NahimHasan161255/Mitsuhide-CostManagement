using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.Common.Security;
using Mitsuhide.Application.DTOs.Common;
using Mitsuhide.Application.DTOs.Master;
using Mitsuhide.Domain.Entities.Master;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// ユーザー一覧検索取得 (AD1730C)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<UserDto>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? userGrpCd = null,
        [FromQuery] string? startUserCd = null,
        [FromQuery] string? endUserCd = null)
    {
        var query = from u in _context.UserMaster.AsNoTracking()
                    join g in _context.UserGrpMaster.AsNoTracking() on u.UserGrpCd equals g.UserGrpCd into gGroup
                    from g in gGroup.DefaultIfEmpty()
                    select new { u, g };

        if (!string.IsNullOrWhiteSpace(startUserCd))
        {
            query = query.Where(x => string.Compare(x.u.UserCd, startUserCd) >= 0);
        }

        if (!string.IsNullOrWhiteSpace(endUserCd))
        {
            query = query.Where(x => string.Compare(x.u.UserCd, endUserCd) <= 0);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.u.UserCd.Contains(search) ||
                                     x.u.UserName.Contains(search) ||
                                     (x.u.UserNameK != null && x.u.UserNameK.Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(userGrpCd))
        {
            query = query.Where(x => x.u.UserGrpCd == userGrpCd);
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.u.UserCd)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new UserDto
            {
                UserCd = x.u.UserCd,
                UserName = x.u.UserName,
                UserNameR = x.u.UserNameR,
                UserNameK = x.u.UserNameK,
                TantoKbn = x.u.TantoKbn,
                UserGrpCd = x.u.UserGrpCd,
                UserGrpNm = x.g != null ? x.g.UserGrpName : null,
                Syubetu = x.u.Syubetu,
                Biko = x.u.Biko,
                DeleteFlg = x.u.DelFg == 1,
                LoginDate = x.u.LoginDate,
                PassUpdDate = x.u.PassUpdDate
            })
            .ToListAsync();

        return Ok(new PagedResult<UserDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    /// <summary>
    /// ユーザー単一取得
    /// </summary>
    [HttpGet("{userCd}")]
    public async Task<ActionResult<UserDto>> GetByUserCd(string userCd)
    {
        var item = await (from u in _context.UserMaster.AsNoTracking().Where(x => x.UserCd == userCd)
                          join g in _context.UserGrpMaster.AsNoTracking() on u.UserGrpCd equals g.UserGrpCd into gGroup
                          from g in gGroup.DefaultIfEmpty()
                          select new UserDto
                          {
                              UserCd = u.UserCd,
                              UserName = u.UserName,
                              UserNameR = u.UserNameR,
                              UserNameK = u.UserNameK,
                              TantoKbn = u.TantoKbn,
                              UserGrpCd = u.UserGrpCd,
                              UserGrpNm = g != null ? g.UserGrpName : null,
                              Syubetu = u.Syubetu,
                              Biko = u.Biko,
                              DeleteFlg = u.DelFg == 1,
                              LoginDate = u.LoginDate,
                              PassUpdDate = u.PassUpdDate
                          }).FirstOrDefaultAsync();

        if (item == null) return NotFound();
        return Ok(item);
    }

    /// <summary>
    /// ユーザー新規登録 (F1)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserRequest req)
    {
        var exists = await _context.UserMaster.AnyAsync(x => x.UserCd == req.UserCd);
        if (exists) return Conflict(new { message = $"ユーザーコード {req.UserCd} は既に使用されています。" });

        var entity = new AdMUser
        {
            UserCd = req.UserCd,
            UserName = req.UserName,
            UserNameR = req.UserNameR,
            UserNameK = req.UserNameK,
            TantoKbn = req.TantoKbn,
            UserGrpCd = req.UserGrpCd,
            Syubetu = req.Syubetu,
            Biko = req.Biko,
            PasswordHash = !string.IsNullOrWhiteSpace(req.Password) ? PasswordHasher.HashPassword(req.Password) : PasswordHasher.HashPassword("user123"),
            PassUpdDate = DateTime.Now,
            NewDate = DateTime.Now,
            NewUser = "SYSTEM",
            NewApid = "AD1730C",
            DelFg = req.DeleteFlg ? 1 : 0
        };

        _context.UserMaster.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByUserCd), new { userCd = entity.UserCd }, new UserDto
        {
            UserCd = entity.UserCd,
            UserName = entity.UserName,
            UserNameR = entity.UserNameR,
            UserNameK = entity.UserNameK,
            TantoKbn = entity.TantoKbn,
            UserGrpCd = entity.UserGrpCd,
            Syubetu = entity.Syubetu,
            Biko = entity.Biko,
            DeleteFlg = entity.DelFg == 1
        });
    }

    /// <summary>
    /// ユーザー情報更新
    /// </summary>
    [HttpPut("{userCd}")]
    public async Task<IActionResult> Update(string userCd, [FromBody] UpdateUserRequest req)
    {
        var entity = await _context.UserMaster.FirstOrDefaultAsync(x => x.UserCd == userCd);
        if (entity == null) return NotFound();

        // 1. セルフ無効化防止ガード (ログイン中の自身のアカウントは無効化不可)
        string? requestingUserCd = Request.Headers["X-User-Cd"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(requestingUserCd) && requestingUserCd == userCd && req.DeleteFlg == true)
        {
            return BadRequest(new { message = "現在ログイン中の自身のアカウントを無効化（利用停止）することはできません。" });
        }

        // 2. 最終管理者保護ガード (最後の有効なシステム管理者は無効化不可)
        if (req.DeleteFlg == true && entity.DelFg == 0)
        {
            bool isTargetAdmin = entity.UserGrpCd == "9";
            if (isTargetAdmin)
            {
                var activeAdminCount = await _context.UserMaster.CountAsync(x => x.UserGrpCd == "9" && x.DelFg == 0);
                if (activeAdminCount <= 1)
                {
                    return BadRequest(new { message = "システム内に有効なシステム管理者が1名しか存在しないため、この管理者を無効化することはできません。(最低1名の有効な管理者アカウントが必要です)" });
                }
            }
        }

        entity.UserName = req.UserName;
        entity.UserNameR = req.UserNameR;
        entity.UserNameK = req.UserNameK;
        entity.TantoKbn = req.TantoKbn;
        entity.UserGrpCd = req.UserGrpCd;
        entity.Syubetu = req.Syubetu;
        entity.Biko = req.Biko;

        if (req.DeleteFlg.HasValue)
        {
            entity.DelFg = req.DeleteFlg.Value ? 1 : 0;
        }

        if (!string.IsNullOrWhiteSpace(req.NewPassword))
        {
            entity.PasswordHash = PasswordHasher.HashPassword(req.NewPassword);
            entity.PassUpdDate = DateTime.Now;
        }

        entity.UpdDate = DateTime.Now;
        entity.UpdUser = !string.IsNullOrWhiteSpace(requestingUserCd) ? requestingUserCd : "SYSTEM";
        entity.UpdApid = "AD1730C";

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// ユーザー論理削除 (F7)
    /// </summary>
    [HttpDelete("{userCd}")]
    public async Task<IActionResult> Delete(string userCd)
    {
        var entity = await _context.UserMaster.FirstOrDefaultAsync(x => x.UserCd == userCd);
        if (entity == null) return NotFound();

        // 1. セルフ削除防止ガード
        string? requestingUserCd = Request.Headers["X-User-Cd"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(requestingUserCd) && requestingUserCd == userCd)
        {
            return BadRequest(new { message = "現在ログイン中の自身のアカウントを削除することはできません。" });
        }

        // 2. 最終管理者保護ガード
        bool isTargetAdmin = entity.UserGrpCd == "9";
        if (isTargetAdmin)
        {
            var activeAdminCount = await _context.UserMaster.CountAsync(x => x.UserGrpCd == "9" && x.DelFg == 0);
            if (activeAdminCount <= 1)
            {
                return BadRequest(new { message = "システム内に有効なシステム管理者が1名しか存在しないため、この管理者を削除することはできません。(最低1名の有効な管理者アカウントが必要です)" });
            }
        }

        entity.DelFg = 1;
        entity.UpdDate = DateTime.Now;
        entity.UpdUser = !string.IsNullOrWhiteSpace(requestingUserCd) ? requestingUserCd : "SYSTEM";
        entity.UpdApid = "AD1730C";

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
