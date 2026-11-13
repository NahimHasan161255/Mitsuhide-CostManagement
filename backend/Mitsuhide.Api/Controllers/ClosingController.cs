using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Closing;
using Mitsuhide.Domain.Entities.Data;
using Mitsuhide.Domain.Entities.Master;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClosingController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClosingController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 現在の月次更新状況・処理基準年月照会 (VM0010)
    /// </summary>
    [HttpGet("status")]
    public async Task<ActionResult<ClosingStatusDto>> GetStatus()
    {
        var currentGdate = await _context.GdateMaster.OrderByDescending(x => x.YyyyMm).FirstOrDefaultAsync();
        if (currentGdate == null)
        {
            currentGdate = new AdMGdate
            {
                YyyyMm = 202611,
                KosinFlg = 0,
                NewDate = DateTime.Now,
                NewUser = "INIT",
                NewApid = "VM0010",
                DelFg = 0
            };
            _context.GdateMaster.Add(currentGdate);
            await _context.SaveChangesAsync();
        }

        var ym = currentGdate.YyyyMm;
        var ymStart = ym * 100 + 1;
        var ymEnd = ym * 100 + 31;

        var monthlyPurchase = await _context.Siire
            .AsNoTracking()
            .Where(x => x.SiireDate >= ymStart && x.SiireDate <= ymEnd && x.DelFg == 0)
            .SumAsync(x => x.SiireGkNk);

        var monthlySales = await _context.Uriage
            .AsNoTracking()
            .Where(x => x.UriageDate == ym && x.DelFg == 0)
            .SumAsync(x => x.UriageGkNk);

        var activeProjects = await _context.Kojijyu
            .AsNoTracking()
            .CountAsync(x => x.KanseiKb == 0 && x.DelFg == 0);

        var nextYm = CalculateNextYm(ym);

        return Ok(new ClosingStatusDto
        {
            CurrentYyyyMm = ym,
            NextYyyyMm = nextYm,
            IsClosed = currentGdate.KosinFlg == 1,
            ActiveProjectsCount = activeProjects,
            TotalMonthlyPurchase = monthlyPurchase,
            TotalMonthlySales = monthlySales,
            UnclosedSlipsCount = 0
        });
    }

    /// <summary>
    /// 月次更新処理実行 (VM0010 - 工事仕掛計算および月度更新)
    /// </summary>
    [HttpPost("execute")]
    public async Task<ActionResult<ClosingResultDto>> ExecuteClosing([FromBody] ExecuteClosingRequest req)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var gdate = await _context.GdateMaster.FirstOrDefaultAsync(x => x.YyyyMm == req.TargetYyyyMm);
            if (gdate == null)
            {
                return BadRequest(new ClosingResultDto
                {
                    Success = false,
                    Message = $"対象年月 {req.TargetYyyyMm} の基準マスタが存在しません。"
                });
            }

            if (gdate.KosinFlg == 1)
            {
                return BadRequest(new ClosingResultDto
                {
                    Success = false,
                    Message = $"対象年月 {req.TargetYyyyMm} は既に月次更新が完了しています。"
                });
            }

            // 1. Calculate Work-In-Progress (GK_T_KOJISIK) for all incomplete projects
            var activeProjects = await _context.Kojijyu
                .Where(x => x.KanseiKb == 0 && x.DelFg == 0)
                .ToListAsync();

            decimal totalWip = 0;
            foreach (var proj in activeProjects)
            {
                var projectPurchase = await _context.Siire
                    .Where(x => x.KojiCd == proj.KojiCd && x.KojiSyu == proj.KojiSyu && x.DelFg == 0)
                    .SumAsync(x => x.SiireGkNk);

                var projectSales = await _context.Uriage
                    .Where(x => x.KojiCd == proj.KojiCd && x.KojiSyu == proj.KojiSyu && x.DelFg == 0)
                    .SumAsync(x => x.UriageGkNk);

                var wipAmount = Math.Max(0, projectPurchase - projectSales);
                totalWip += wipAmount;

                var existingSik = await _context.Kojisik.FirstOrDefaultAsync(x => x.TargetDate == req.TargetYyyyMm && x.KojiCd == proj.KojiCd);
                if (existingSik != null)
                {
                    existingSik.Sikakari = wipAmount;
                    existingSik.Hukakati = projectSales - projectPurchase;
                    existingSik.UpdDate = DateTime.Now;
                    existingSik.UpdUser = req.ExecutedBy;
                    existingSik.UpdApid = "VM0010";
                }
                else
                {
                    _context.Kojisik.Add(new GkTKojisik
                    {
                        TargetDate = req.TargetYyyyMm,
                        KojiCd = proj.KojiCd,
                        Sikakari = wipAmount,
                        Hukakati = projectSales - projectPurchase,
                        NewDate = DateTime.Now,
                        NewUser = req.ExecutedBy,
                        NewApid = "VM0010",
                        DelFg = 0
                    });
                }
            }

            // 2. Mark current month as closed
            gdate.KosinFlg = 1;
            gdate.UpdDate = DateTime.Now;
            gdate.UpdUser = req.ExecutedBy;
            gdate.UpdApid = "VM0010";

            // 3. Open next month
            var nextYm = CalculateNextYm(req.TargetYyyyMm);
            var nextGdate = await _context.GdateMaster.FirstOrDefaultAsync(x => x.YyyyMm == nextYm);
            if (nextGdate == null)
            {
                _context.GdateMaster.Add(new AdMGdate
                {
                    YyyyMm = nextYm,
                    KosinFlg = 0,
                    NewDate = DateTime.Now,
                    NewUser = req.ExecutedBy,
                    NewApid = "VM0010",
                    DelFg = 0
                });
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(new ClosingResultDto
            {
                Success = true,
                Message = $"{req.TargetYyyyMm} 年月の月次更新処理が正常に完了しました。基準年月が {nextYm} に繰り上がりました。",
                ProcessedProjectsCount = activeProjects.Count,
                TotalWipAmount = totalWip,
                NewCurrentYyyyMm = nextYm
            });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, new ClosingResultDto
            {
                Success = false,
                Message = $"月次更新中にエラーが発生しました: {ex.Message}"
            });
        }
    }

    private static int CalculateNextYm(int ym)
    {
        var year = ym / 100;
        var month = ym % 100;
        if (month == 12)
        {
            year++;
            month = 1;
        }
        else
        {
            month++;
        }
        return year * 100 + month;
    }
}
