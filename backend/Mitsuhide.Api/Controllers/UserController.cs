using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Common;
using Mitsuhide.Application.DTOs.Master;
using Mitsuhide.Domain.Entities.Master;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
        [FromQuery] string? userGrpCd = null)
    {
        var query = from u in _context.UserMaster.AsNoTracking().Where(x => x.DelFg == 0)
                    join g in _context.UserGrpMaster.AsNoTracking() on u.UserGrpCd equals g.UserGrpCd into gGroup
                    from g in gGroup.DefaultIfEmpty()
                    select new { u, g };

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
        var item = await (from u in _context.UserMaster.AsNoTracking().Where(x => x.UserCd == userCd && x.DelFg == 0)
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
            PasswordHash = req.Password, // In production, hash with BCrypt / Argon2
            PassUpdDate = DateTime.Now,
            NewDate = DateTime.Now,
            NewUser = "SYSTEM",
            NewApid = "AD1730C",
            DelFg = 0
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
            Biko = entity.Biko
        });
    }

    /// <summary>
    /// ユーザー情報更新
    /// </summary>
    [HttpPut("{userCd}")]
    public async Task<IActionResult> Update(string userCd, [FromBody] UpdateUserRequest req)
    {
        var entity = await _context.UserMaster.FirstOrDefaultAsync(x => x.UserCd == userCd && x.DelFg == 0);
        if (entity == null) return NotFound();

        entity.UserName = req.UserName;
        entity.UserNameR = req.UserNameR;
        entity.UserNameK = req.UserNameK;
        entity.TantoKbn = req.TantoKbn;
        entity.UserGrpCd = req.UserGrpCd;
        entity.Syubetu = req.Syubetu;
        entity.Biko = req.Biko;

        if (!string.IsNullOrWhiteSpace(req.NewPassword))
        {
            entity.PasswordHash = req.NewPassword;
            entity.PassUpdDate = DateTime.Now;
        }

        entity.UpdDate = DateTime.Now;
        entity.UpdUser = "SYSTEM";
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
        var entity = await _context.UserMaster.FirstOrDefaultAsync(x => x.UserCd == userCd && x.DelFg == 0);
        if (entity == null) return NotFound();

        entity.DelFg = 1;
        entity.UpdDate = DateTime.Now;
        entity.UpdUser = "SYSTEM";
        entity.UpdApid = "AD1730C";

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
