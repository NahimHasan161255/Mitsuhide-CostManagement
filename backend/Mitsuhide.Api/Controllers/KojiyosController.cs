using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mitsuhide.Application.DTOs.Cost;
using Mitsuhide.Domain.Entities.Data;
using Mitsuhide.Infrastructure.Data;

namespace Mitsuhide.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KojiyosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public KojiyosController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 工事別予算内訳取得 (GK0020 呼出)
    /// </summary>
    [HttpGet("{kojiCd:int}/{kojiSyu:int}")]
    public async Task<ActionResult<List<KojiyosDto>>> GetByProject(int kojiCd, int kojiSyu)
    {
        var items = await (from y in _context.Kojiyos.AsNoTracking().Where(x => x.KojiCd == kojiCd && x.KojiSyu == kojiSyu && x.DelFg == 0)
                           join s in _context.SiireMaster.AsNoTracking() on y.SiireCd equals s.Code into sGroup
                           from s in sGroup.DefaultIfEmpty()
                           orderby y.YosaSyu, y.SiireCd
                           select new KojiyosDto
                           {
                               UnqId = y.UnqId,
                               KojiCd = y.KojiCd,
                               KojiSyu = y.KojiSyu,
                               YosaSyu = y.YosaSyu,
                               YosaSyuNm = GetYosaSyuName(y.YosaSyu),
                               SiireCd = y.SiireCd,
                               SiireNm = s != null ? s.Name : null,
                               YosanGk = y.YosanGk,
                               HassyuGk = y.HassyuGk,
                               Biko = y.Biko
                           }).ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// 工事予算内訳の一括登録・更新 (GK0020 登録 F1)
    /// </summary>
    [HttpPost("batch")]
    public async Task<IActionResult> SaveBatch([FromBody] SaveKojiyosBatchDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Mark existing active budget lines as deleted
            var existing = await _context.Kojiyos
                .Where(x => x.KojiCd == dto.KojiCd && x.KojiSyu == dto.KojiSyu && x.DelFg == 0)
                .ToListAsync();

            foreach (var item in existing)
            {
                item.DelFg = 1;
                item.UpdDate = DateTime.Now;
                item.UpdApid = "GK0020";
            }

            decimal totalBudget = 0;

            // 2. Insert new budget lines
            foreach (var item in dto.Items)
            {
                totalBudget += item.YosanGk;
                _context.Kojiyos.Add(new GkTKojoyos
                {
                    KojiCd = dto.KojiCd,
                    KojiSyu = dto.KojiSyu,
                    YosaSyu = item.YosaSyu,
                    SiireCd = item.SiireCd,
                    YosanGk = item.YosanGk,
                    HassyuGk = item.HassyuGk,
                    Biko = item.Biko,
                    NewDate = DateTime.Now,
                    NewApid = "GK0020"
                });
            }

            // 3. Update total budget and gross margin in GK_T_KOJIJYU
            var order = await _context.Kojijyu
                .FirstOrDefaultAsync(x => x.KojiCd == dto.KojiCd && x.KojiSyu == dto.KojiSyu && x.DelFg == 0);

            if (order != null)
            {
                order.Yosangaku = totalBudget;
                order.YoteiArari = order.KeiyakuGnk - totalBudget;
                order.UpdDate = DateTime.Now;
                order.UpdApid = "GK0020";
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = $"工事 {dto.KojiCd}-{dto.KojiSyu} の予算内訳を保存しました。", totalBudget });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = $"予算保存エラー: {ex.Message}" });
        }
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
