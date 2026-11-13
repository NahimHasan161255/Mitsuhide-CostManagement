using Microsoft.EntityFrameworkCore;
using Mitsuhide.Domain.Entities.Data;
using Mitsuhide.Domain.Entities.Master;

namespace Mitsuhide.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Data Tables
    public DbSet<GkTKojijyu> Kojijyu => Set<GkTKojijyu>();
    public DbSet<GkTKojoyos> Kojiyos => Set<GkTKojoyos>();
    public DbSet<GkTUriage> Uriage => Set<GkTUriage>();
    public DbSet<GkTSiire> Siire => Set<GkTSiire>();
    public DbSet<GkTKojisik> Kojisik => Set<GkTKojisik>();

    // Master Tables
    public DbSet<AdMJyucyu> Jyucyu => Set<AdMJyucyu>();
    public DbSet<AdMSiire> SiireMaster => Set<AdMSiire>();
    public DbSet<AdMUser> UserMaster => Set<AdMUser>();
    public DbSet<AdMGdate> GdateMaster => Set<AdMGdate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 工事受注データ (GK_T_KOJIJYU)
        modelBuilder.Entity<GkTKojijyu>(entity =>
        {
            entity.HasIndex(e => new { e.KojiCd, e.KojiSyu })
                  .HasDatabaseName("IX_GK_T_KOJIJYU_CKEY1");
        });

        // 工事予算データ (GK_T_KOJIYOS)
        modelBuilder.Entity<GkTKojoyos>(entity =>
        {
            entity.HasIndex(e => new { e.KojiCd, e.KojiSyu, e.YosaSyu, e.SiireCd })
                  .HasDatabaseName("IX_GK_T_KOJIYOS_CKEY1");
        });

        // 売上データ (GK_T_URIAGE)
        modelBuilder.Entity<GkTUriage>(entity =>
        {
            entity.HasIndex(e => new { e.UriageDate, e.JyuCyuCd })
                  .HasDatabaseName("IX_GK_T_URIAGE_CKEY1");
            entity.HasIndex(e => new { e.KojiCd, e.KojiSyu })
                  .HasDatabaseName("IX_GK_T_URIAGE_CKEY2");
        });

        // 仕入データ (GK_T_SIIRE)
        modelBuilder.Entity<GkTSiire>(entity =>
        {
            entity.HasIndex(e => new { e.SiireDate, e.SiireCd })
                  .HasDatabaseName("IX_GK_T_SIIRE_CKEY1");
            entity.HasIndex(e => new { e.KojiCd, e.KojiSyu })
                  .HasDatabaseName("IX_GK_T_SIIRE_CKEY2");
        });

        // 工事仕掛データ (GK_T_KOJISIK)
        modelBuilder.Entity<GkTKojisik>(entity =>
        {
            entity.HasIndex(e => new { e.TargetDate, e.KojiCd })
                  .HasDatabaseName("IX_GK_T_KOJISIK_CKEY1");
        });
    }
}
