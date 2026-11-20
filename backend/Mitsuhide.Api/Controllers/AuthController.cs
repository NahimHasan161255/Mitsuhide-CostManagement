using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.Common.Security;
using Mitsuhide.Application.DTOs.Auth;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthController(ApplicationDbContext context, IJwtTokenService jwtTokenService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
    }

    /// <summary>
    /// ログオン認証 (AD1010C - Logon)
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("LoginPolicy")]
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

        var user = await _context.UserMaster.FirstOrDefaultAsync(u => u.UserCd == userCd);
        if (user == null)
        {
            return NotFound(new LoginResponseDto
            {
                Success = false,
                Message = "指定された社員コードが見つかりません。"
            });
        }

        if (user.DelFg == 1)
        {
            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = "このユーザーアカウントは無効化（削除フラグ設定）されているため、ログオンできません。(AD1010C)"
            });
        }

        // Verify password using BCrypt (supports automatic upgrade from legacy plain-text)
        bool isPasswordValid = PasswordHasher.VerifyPassword(req.Password, user.PasswordHash);

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

        // Seamless migration: auto-upgrade legacy plain-text password to BCrypt hash in DB
        if (PasswordHasher.NeedsRehash(user.PasswordHash))
        {
            user.PasswordHash = PasswordHasher.HashPassword(req.Password);
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

        // 1. パスワード有効期限チェック (AD1010C仕様 3: パスワード有効期限警告)
        bool passwordExpired = false;
        string? passwordExpiredMsg = null;
        if (user.PassUpdDate == null || (DateTime.Now - user.PassUpdDate.Value).TotalDays > 90)
        {
            passwordExpired = true;
            passwordExpiredMsg = "パスワードの有効期限(90日)が切れています。速やかにパスワードを変更してください。(AD1010C)";
        }

        // 2. 月次チェック (AD1010C仕様 5: メニュー起動時月次更新チェック)
        string? monthlyWarning = null;
        var latestGdate = await _context.GdateMaster.OrderByDescending(x => x.YyyyMm).FirstOrDefaultAsync();
        if (latestGdate != null)
        {
            int currentYm = DateTime.Now.Year * 100 + DateTime.Now.Month;
            if (latestGdate.YyyyMm < currentYm)
            {
                if (latestGdate.KosinFlg == 0)
                {
                    monthlyWarning = $"月次更新（仮締）が行われていません。(対象年月: {latestGdate.YyyyMm} / MsgNo: 02086)";
                }
                else
                {
                    monthlyWarning = $"月次更新（本締）が行われていません。(対象年月: {latestGdate.YyyyMm} / MsgNo: 02087)";
                }
            }
        }

        // Issue real signed JWT token with user identity and claims
        var token = _jwtTokenService.GenerateToken(
            user.UserCd,
            user.UserName,
            user.UserGrpCd,
            user.TantoKbn,
            user.Syubetu
        );

        return Ok(new LoginResponseDto
        {
            Success = true,
            Message = "ログインしました。",
            User = authUser,
            Token = token,
            PasswordExpired = passwordExpired,
            PasswordExpiredMessage = passwordExpiredMsg,
            MonthlyClosingWarning = monthlyWarning
        });
    }

    /// <summary>
    /// パスワード変更 (AD1010C - F10 Password Change)
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
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

        var user = await _context.UserMaster.FirstOrDefaultAsync(u => u.UserCd == userCd);
        if (user == null)
        {
            return NotFound(new LoginResponseDto
            {
                Success = false,
                Message = "指定された社員コードが見つかりません。"
            });
        }

        if (user.DelFg == 1)
        {
            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = "このユーザーアカウントは無効化（削除フラグ設定）されているため、操作できません。(AD1010C)"
            });
        }

        // Validate old password using BCrypt
        if (!string.IsNullOrEmpty(user.PasswordHash) && !PasswordHasher.VerifyPassword(req.OldPassword, user.PasswordHash))
        {
            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = "現在のパスワードが正しくありません。"
            });
        }

        // Store new password with BCrypt hash
        user.PasswordHash = PasswordHasher.HashPassword(req.NewPassword);
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

    /// <summary>
    /// 現在のログインユーザー情報取得 (Auth Verification)
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthUserDto>> GetCurrentUser()
    {
        var userCd = User.FindFirst("userCd")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userCd))
        {
            return Unauthorized(new { message = "認証情報が見つかりません。" });
        }

        var user = await _context.UserMaster.AsNoTracking().FirstOrDefaultAsync(u => u.UserCd == userCd && u.DelFg == 0);
        if (user == null)
        {
            return NotFound(new { message = "ユーザー情報が見つかりません。" });
        }

        string? userGrpNm = null;
        if (!string.IsNullOrEmpty(user.UserGrpCd))
        {
            var grp = await _context.UserGrpMaster.AsNoTracking().FirstOrDefaultAsync(g => g.UserGrpCd == user.UserGrpCd);
            userGrpNm = grp?.UserGrpName;
        }

        return Ok(new AuthUserDto
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
