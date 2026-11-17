using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Auth;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// ログオン認証 (AD1010C - Logon)
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto req)
    {
        if (string.IsNullOrWhiteSpace(req.UserCd) || string.IsNullOrWhiteSpace(req.Password))
        {
            return BadRequest(new LoginResponseDto
            {
                Success = false,
                Message = "社員コードとパスワードを入力してください。"
            });
        }

        // Format to 6 digits if purely numeric (e.g., 1 -> 000001)
        string userCd = req.UserCd.Trim();
        if (userCd.Length < 6 && int.TryParse(userCd, out int parsedNum))
        {
            userCd = parsedNum.ToString("D6");
        }

        var user = await _context.UserMaster.FirstOrDefaultAsync(u => u.UserCd == userCd && u.DelFg == 0);
        if (user == null)
        {
            return NotFound(new LoginResponseDto
            {
                Success = false,
                Message = "指定された社員コードが見つかりません。"
            });
        }

        // Verify password
        // Supports plain text stored or initial default passwords for flexibility
        bool isPasswordValid = string.Equals(user.PasswordHash, req.Password, StringComparison.Ordinal);

        // Fallback for initial demo setup if empty or user123
        if (!isPasswordValid && string.IsNullOrEmpty(user.PasswordHash) && req.Password == "user123")
        {
            isPasswordValid = true;
        }

        if (!isPasswordValid)
        {
            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = "パスワードが正しくありません。"
            });
        }

        // Update last login date
        user.LoginDate = DateTime.Now;
        user.UpdDate = DateTime.Now;
        user.UpdUser = user.UserCd;
        user.UpdApid = "AD1010C";
        await _context.SaveChangesAsync();

        // Fetch User Group Name
        string? userGrpNm = null;
        if (!string.IsNullOrEmpty(user.UserGrpCd))
        {
            var grp = await _context.UserGrpMaster.AsNoTracking().FirstOrDefaultAsync(g => g.UserGrpCd == user.UserGrpCd);
            userGrpNm = grp?.UserGrpName;
        }

        var authUser = new AuthUserDto
        {
            UserCd = user.UserCd,
            UserName = user.UserName,
            UserNameR = user.UserNameR,
            UserNameK = user.UserNameK,
            TantoKbn = user.TantoKbn,
            TantoKbnNm = GetTantoKbnName(user.TantoKbn),
            UserGrpCd = user.UserGrpCd,
            UserGrpNm = userGrpNm ?? (user.UserGrpCd == "9" ? "システム管理者グループ" : "一般グループ"),
            Syubetu = user.Syubetu,
            SyubetuNm = GetSyubetuName(user.Syubetu),
            LoginDate = user.LoginDate,
            PassUpdDate = user.PassUpdDate
        };

        return Ok(new LoginResponseDto
        {
            Success = true,
            Message = "ログインしました。",
            User = authUser,
            Token = $"session_{user.UserCd}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}"
        });
    }

    /// <summary>
    /// パスワード変更 (AD1010C - F10 Password Change)
    /// </summary>
    [HttpPost("change-password")]
    public async Task<ActionResult<LoginResponseDto>> ChangePassword([FromBody] ChangePasswordRequestDto req)
    {
        if (string.IsNullOrWhiteSpace(req.UserCd) || string.IsNullOrWhiteSpace(req.NewPassword))
        {
            return BadRequest(new LoginResponseDto
            {
                Success = false,
                Message = "社員コードと新しいパスワードを入力してください。"
            });
        }

        string userCd = req.UserCd.Trim();
        if (userCd.Length < 6 && int.TryParse(userCd, out int parsedNum))
        {
            userCd = parsedNum.ToString("D6");
        }

        var user = await _context.UserMaster.FirstOrDefaultAsync(u => u.UserCd == userCd && u.DelFg == 0);
        if (user == null)
        {
            return NotFound(new LoginResponseDto
            {
                Success = false,
                Message = "指定された社員コードが見つかりません。"
            });
        }

        // Validate old password if set
        if (!string.IsNullOrEmpty(user.PasswordHash) && !string.Equals(user.PasswordHash, req.OldPassword, StringComparison.Ordinal))
        {
            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = "現在のパスワードが正しくありません。"
            });
        }

        user.PasswordHash = req.NewPassword;
        user.PassUpdDate = DateTime.Now;
        user.UpdDate = DateTime.Now;
        user.UpdUser = user.UserCd;
        user.UpdApid = "AD1010C";
        await _context.SaveChangesAsync();

        return Ok(new LoginResponseDto
        {
            Success = true,
            Message = "パスワードを変更しました。"
        });
    }

    private static string GetSyubetuName(int syubetu) => syubetu switch
    {
        1 => "営業部",
        5 => "工務部",
        9 => "経理部",
        _ => "その他",
    };

    private static string GetTantoKbnName(int kbn) => kbn switch
    {
        1 => "担当者",
        9 => "担当者以外",
        _ => "未定",
    };
}
