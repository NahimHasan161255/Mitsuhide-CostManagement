using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Cost;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LedgerController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LedgerController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 工事台帳データ集計取得 (GK0030)
    /// </summary>
    [HttpGet("{kojiCd:int}/{kojiSyu:int}")]
    public async Task<ActionResult<ProjectLedgerDto>> GetProjectLedger(int kojiCd, int kojiSyu)
    {
        // 1. Get Project Order Info
        var order = await (from k in _context.Kojijyu.AsNoTracking().Where(x => x.KojiCd == kojiCd && x.KojiSyu == kojiSyu && x.DelFg == 0)
                           join j in _context.Jyucyu.AsNoTracking() on k.JyuCd equals j.Code into jGroup
                           from j in jGroup.DefaultIfEmpty()
                           select new
                           {
                               k.KojiCd,
                               k.KojiSyu,
                               k.KojiNm,
                               k.KojiRyk,
                               JyuNm = j != null ? j.Name : null,
                               k.KoukiBgn,
                               k.KoukiEnd,
                               k.KanseiKb,
                               k.KeiyakuGnk,
                               k.KeiyakuGkm,
                               k.Yosangaku
                           }).FirstOrDefaultAsync();

        if (order == null) return NotFound(new { message = $"工事コード {kojiCd}-{kojiSyu} は見つかりません。" });

        // 2. Aggregate Actual Purchasing (仕入実績)
        var actualSiire = await _context.Siire
            .AsNoTracking()
            .Where(x => x.KojiCd == kojiCd && x.KojiSyu == kojiSyu && x.DelFg == 0)
            .SumAsync(x => x.SiireGkNk);

        // 3. Aggregate Actual Sales (売上実績)
        var actualUriage = await _context.Uriage
            .AsNoTracking()
            .Where(x => x.KojiCd == kojiCd && x.KojiSyu == kojiSyu && x.DelFg == 0)
            .SumAsync(x => x.UriageGkNk);

        // 4. Budget Lines
        var budgetLines = await (from y in _context.Kojiyos.AsNoTracking().Where(x => x.KojiCd == kojiCd && x.KojiSyu == kojiSyu && x.DelFg == 0)
                                 join s in _context.SiireMaster.AsNoTracking() on y.SiireCd equals s.Code into sGroup
                                 from s in sGroup.DefaultIfEmpty()
                                 select new LedgerBudgetLineDto
                                 {
                                     YosaSyu = y.YosaSyu,
                                     YosaSyuNm = GetYosaSyuName(y.YosaSyu),
                                     SiireNm = s != null ? s.Name : null,
                                     YosanGk = y.YosanGk,
                                     ActualCost = 0 // can be grouped by YosaSyu
                                 }).ToListAsync();

        // 5. Recent Purchases (最新仕入伝票)
        var recentPurchases = await (from s in _context.Siire.AsNoTracking().Where(x => x.KojiCd == kojiCd && x.KojiSyu == kojiSyu && x.DelFg == 0)
                                     join sm in _context.SiireMaster.AsNoTracking() on s.SiireCd equals sm.Code into smGroup
                                     from sm in smGroup.DefaultIfEmpty()
                                     orderby s.SiireDate descending
                                     select new LedgerSiireLineDto
                                     {
                                         SiireDate = s.SiireDate,
                                         SiireNm = sm != null ? sm.Name : null,
                                         YosaSyu = s.YosaSyu,
                                         SiireGkNk = s.SiireGkNk,
                                         Biko = s.Biko
                                     }).Take(15).ToListAsync();

        var ledger = new ProjectLedgerDto
        {
            KojiCd = order.KojiCd,
            KojiSyu = order.KojiSyu,
            KojiNm = order.KojiNm,
            KojiRyk = order.KojiRyk,
            JyuNm = order.JyuNm,
            KoukiBgn = order.KoukiBgn,
            KoukiEnd = order.KoukiEnd,
            KanseiKb = order.KanseiKb,
            KeiyakuGnk = order.KeiyakuGnk,
            KeiyakuGkm = order.KeiyakuGkm,
            Yosangaku = order.Yosangaku,
            ActualSiireGk = actualSiire,
            ActualUriageGk = actualUriage,
            BudgetLines = budgetLines,
            RecentPurchases = recentPurchases
        };

        return Ok(ledger);
    }

    private static string GetYosaSyuName(int yosaSyu) => yosaSyu switch
    {
        101 => "鋼材・材料費",
        102 => "一次加工・切断",
        103 => "二次加工・鍛冶組立",
        104 => "溶接・検査費",
        105 => "メッキ・塗装費",
        106 => "運搬・トレーラー費",
        107 => "現場建方・クレーン費",
        108 => "現場管理・諸経費",
        _ => $"予算種目({yosaSyu})"
    };
}
