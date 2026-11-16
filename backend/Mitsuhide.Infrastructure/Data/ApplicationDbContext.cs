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
    public DbSet<AdMUserGrp> UserGrpMaster => Set<AdMUserGrp>();
    public DbSet<AdMGdate> GdateMaster => Set<AdMGdate>();
    public DbSet<AdMSysName> SysNameMaster => Set<AdMSysName>();
    public DbSet<AdMControl> ControlMaster => Set<AdMControl>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 工事受注データ (GK_T_KOJIJYU)
        modelBuilder.Entity<GkTKojijyu>(entity =>
        {
            entity.HasIndex(e => new { e.KojiCd, e.KojiSyu })
                  .HasDatabaseName("IX_GK_T_KOJIJYU_CKEY1");
            entity.Property(e => e.DelFg).HasColumnName("gktkjyu_delfg");
            entity.Property(e => e.NewUser).HasColumnName("gktkjyu_new_user");
            entity.Property(e => e.NewDate).HasColumnName("gktkjyu_new_date");
            entity.Property(e => e.NewApid).HasColumnName("gktkjyu_new_apid");
            entity.Property(e => e.NewWsnm).HasColumnName("gktkjyu_new_wsnm");
            entity.Property(e => e.UpdUser).HasColumnName("gktkjyu_upd_user");
            entity.Property(e => e.UpdDate).HasColumnName("gktkjyu_upd_date");
            entity.Property(e => e.UpdApid).HasColumnName("gktkjyu_upd_apid");
            entity.Property(e => e.UpdWsnm).HasColumnName("gktkjyu_upd_wsnm");
        });

        // 工事予算データ (GK_T_KOJIYOS)
        modelBuilder.Entity<GkTKojoyos>(entity =>
        {
            entity.HasIndex(e => new { e.KojiCd, e.KojiSyu, e.YosaSyu, e.SiireCd })
                  .HasDatabaseName("IX_GK_T_KOJIYOS_CKEY1");
            entity.Property(e => e.DelFg).HasColumnName("gktkyos_delfg");
            entity.Property(e => e.NewUser).HasColumnName("gktkyos_new_user");
            entity.Property(e => e.NewDate).HasColumnName("gktkyos_new_date");
            entity.Property(e => e.NewApid).HasColumnName("gktkyos_new_apid");
            entity.Property(e => e.NewWsnm).HasColumnName("gktkyos_new_wsnm");
            entity.Property(e => e.UpdUser).HasColumnName("gktkyos_upd_user");
            entity.Property(e => e.UpdDate).HasColumnName("gktkyos_upd_date");
            entity.Property(e => e.UpdApid).HasColumnName("gktkyos_upd_apid");
            entity.Property(e => e.UpdWsnm).HasColumnName("gktkyos_upd_wsnm");
        });

        // 売上データ (GK_T_URIAGE)
        modelBuilder.Entity<GkTUriage>(entity =>
        {
            entity.HasIndex(e => new { e.UriageDate, e.JyuCyuCd })
                  .HasDatabaseName("IX_GK_T_URIAGE_CKEY1");
            entity.Property(e => e.DelFg).HasColumnName("gkturi_delfg");
            entity.Property(e => e.NewUser).HasColumnName("gkturi_new_user");
            entity.Property(e => e.NewDate).HasColumnName("gkturi_new_date");
            entity.Property(e => e.NewApid).HasColumnName("gkturi_new_apid");
            entity.Property(e => e.NewWsnm).HasColumnName("gkturi_new_wsnm");
            entity.Property(e => e.UpdUser).HasColumnName("gkturi_upd_user");
            entity.Property(e => e.UpdDate).HasColumnName("gkturi_upd_date");
            entity.Property(e => e.UpdApid).HasColumnName("gkturi_upd_apid");
            entity.Property(e => e.UpdWsnm).HasColumnName("gkturi_upd_wsnm");
        });

        // 仕入データ (GK_T_SIIRE)
        modelBuilder.Entity<GkTSiire>(entity =>
        {
            entity.HasIndex(e => new { e.SiireDate, e.SiireCd })
                  .HasDatabaseName("IX_GK_T_SIIRE_CKEY1");
            entity.Property(e => e.DelFg).HasColumnName("gktsir_delfg");
            entity.Property(e => e.NewUser).HasColumnName("gktsir_new_user");
            entity.Property(e => e.NewDate).HasColumnName("gktsir_new_date");
            entity.Property(e => e.NewApid).HasColumnName("gktsir_new_apid");
            entity.Property(e => e.NewWsnm).HasColumnName("gktsir_new_wsnm");
            entity.Property(e => e.UpdUser).HasColumnName("gktsir_upd_user");
            entity.Property(e => e.UpdDate).HasColumnName("gktsir_upd_date");
            entity.Property(e => e.UpdApid).HasColumnName("gktsir_upd_apid");
            entity.Property(e => e.UpdWsnm).HasColumnName("gktsir_upd_wsnm");
        });

        // 工事仕掛データ (GK_T_KOJISIK)
        modelBuilder.Entity<GkTKojisik>(entity =>
        {
            entity.HasIndex(e => new { e.TargetDate, e.KojiCd })
                  .HasDatabaseName("IX_GK_T_KOJISIK_CKEY1");
            entity.Property(e => e.DelFg).HasColumnName("gktksik_delfg");
            entity.Property(e => e.NewUser).HasColumnName("gktksik_new_user");
            entity.Property(e => e.NewDate).HasColumnName("gktksik_new_date");
            entity.Property(e => e.NewApid).HasColumnName("gktksik_new_apid");
            entity.Property(e => e.NewWsnm).HasColumnName("gktksik_new_wsnm");
            entity.Property(e => e.UpdUser).HasColumnName("gktksik_upd_user");
            entity.Property(e => e.UpdDate).HasColumnName("gktksik_upd_date");
            entity.Property(e => e.UpdApid).HasColumnName("gktksik_upd_apid");
            entity.Property(e => e.UpdWsnm).HasColumnName("gktksik_upd_wsnm");
        });

        // システム名称マスタ (AD_M_SYSNAME / AD_M_NAME)
        modelBuilder.Entity<AdMSysName>(entity =>
        {
            entity.ToTable("AD_M_NAME");
            entity.HasKey(e => new { e.NameKbn, e.NameCd });
            entity.Property(e => e.NewUser).HasColumnName("admnam_new_user");
            entity.Property(e => e.NewDate).HasColumnName("admnam_new_date");
            entity.Property(e => e.NewApid).HasColumnName("admnam_new_apid");
            entity.Property(e => e.NewWsnm).HasColumnName("admnam_new_wsnm");
            entity.Property(e => e.UpdUser).HasColumnName("admnam_upd_user");
            entity.Property(e => e.UpdDate).HasColumnName("admnam_upd_date");
            entity.Property(e => e.UpdApid).HasColumnName("admnam_upd_apid");
            entity.Property(e => e.UpdWsnm).HasColumnName("admnam_upd_wsnm");
            entity.Property(e => e.DelFg).HasColumnName("DelFg");
        });

        // 処理基準管理マスタ (AD_M_CONTROL)
        modelBuilder.Entity<AdMControl>(entity =>
        {
            entity.HasKey(e => new { e.SubSysCd, e.ProgId });
            entity.Property(e => e.NewUser).HasColumnName("admcon_new_user");
            entity.Property(e => e.NewDate).HasColumnName("admcon_new_date");
            entity.Property(e => e.NewApid).HasColumnName("admcon_new_apid");
            entity.Property(e => e.NewWsnm).HasColumnName("admcon_new_wsnm");
            entity.Property(e => e.UpdUser).HasColumnName("admcon_upd_user");
            entity.Property(e => e.UpdDate).HasColumnName("admcon_upd_date");
            entity.Property(e => e.UpdApid).HasColumnName("admcon_upd_apid");
            entity.Property(e => e.UpdWsnm).HasColumnName("admcon_upd_wsnm");
            entity.Property(e => e.DelFg).HasColumnName("DelFg");
        });

        // 受注先マスタ (AD_M_JYUCYU)
        modelBuilder.Entity<AdMJyucyu>(entity =>
        {
            entity.Property(e => e.NewUser).HasColumnName("admjyu_new_user");
            entity.Property(e => e.NewDate).HasColumnName("admjyu_new_date");
            entity.Property(e => e.NewApid).HasColumnName("admjyu_new_apid");
            entity.Property(e => e.NewWsnm).HasColumnName("admjyu_new_wsnm");
            entity.Property(e => e.UpdUser).HasColumnName("admjyu_upd_user");
            entity.Property(e => e.UpdDate).HasColumnName("admjyu_upd_date");
            entity.Property(e => e.UpdApid).HasColumnName("admjyu_upd_apid");
            entity.Property(e => e.UpdWsnm).HasColumnName("admjyu_upd_wsnm");
            entity.Property(e => e.DelFg).HasColumnName("DelFg");
        });

        // 仕入先マスタ (AD_M_SIIRE)
        modelBuilder.Entity<AdMSiire>(entity =>
        {
            entity.Property(e => e.KozaSb).HasConversion<short>();
            entity.Property(e => e.NewUser).HasColumnName("admsir_new_user");
            entity.Property(e => e.NewDate).HasColumnName("admsir_new_date");
            entity.Property(e => e.NewApid).HasColumnName("admsir_new_apid");
            entity.Property(e => e.NewWsnm).HasColumnName("admsir_new_wsnm");
            entity.Property(e => e.UpdUser).HasColumnName("admsir_upd_user");
            entity.Property(e => e.UpdDate).HasColumnName("admsir_upd_date");
            entity.Property(e => e.UpdApid).HasColumnName("admsir_upd_apid");
            entity.Property(e => e.UpdWsnm).HasColumnName("admsir_upd_wsnm");
            entity.Property(e => e.DelFg).HasColumnName("DelFg");
        });

        // ユーザーグループマスタ (AD_M_USER_GRP)
        modelBuilder.Entity<AdMUserGrp>(entity =>
        {
            entity.Property(e => e.RunAplCnt).HasConversion<short>();
            entity.Property(e => e.NewUser).HasColumnName("admgrp_new_user");
            entity.Property(e => e.NewDate).HasColumnName("admgrp_new_date");
            entity.Property(e => e.NewApid).HasColumnName("admgrp_new_apid");
            entity.Property(e => e.NewWsnm).HasColumnName("admgrp_new_wsnm");
            entity.Property(e => e.UpdUser).HasColumnName("admgrp_upd_user");
            entity.Property(e => e.UpdDate).HasColumnName("admgrp_upd_date");
            entity.Property(e => e.UpdApid).HasColumnName("admgrp_upd_apid");
            entity.Property(e => e.UpdWsnm).HasColumnName("admgrp_upd_wsnm");
            entity.Property(e => e.DelFg).HasColumnName("DelFg");
        });

        // ユーザーマスタ (AD_M_USER)
        modelBuilder.Entity<AdMUser>(entity =>
        {
            entity.Property(e => e.TantoKbn).HasConversion<short>();
            entity.Property(e => e.Syubetu).HasConversion<short>();
            entity.Property(e => e.NewUser).HasColumnName("admuse_new_user");
            entity.Property(e => e.NewDate).HasColumnName("admuse_new_date");
            entity.Property(e => e.NewApid).HasColumnName("admuse_new_apid");
            entity.Property(e => e.NewWsnm).HasColumnName("admuse_new_wsnm");
            entity.Property(e => e.UpdUser).HasColumnName("admuse_upd_user");
            entity.Property(e => e.UpdDate).HasColumnName("admuse_upd_date");
            entity.Property(e => e.UpdApid).HasColumnName("admuse_upd_apid");
            entity.Property(e => e.UpdWsnm).HasColumnName("admuse_upd_wsnm");
            entity.Property(e => e.DelFg).HasColumnName("admuse_del_flg").HasConversion<short>();
        });

        // 月次日付マスタ (AD_M_GDATE)
        modelBuilder.Entity<AdMGdate>(entity =>
        {
            entity.Property(e => e.KosinFlg).HasConversion<short>();
            entity.Property(e => e.NewUser).HasColumnName("admgdt_new_user");
            entity.Property(e => e.NewDate).HasColumnName("admgdt_new_date");
            entity.Property(e => e.NewApid).HasColumnName("admgdt_new_apid");
            entity.Property(e => e.NewWsnm).HasColumnName("admgdt_new_wsnm");
            entity.Property(e => e.UpdUser).HasColumnName("admgdt_upd_user");
            entity.Property(e => e.UpdDate).HasColumnName("admgdt_upd_date");
            entity.Property(e => e.UpdApid).HasColumnName("admgdt_upd_apid");
            entity.Property(e => e.UpdWsnm).HasColumnName("admgdt_upd_wsnm");
            entity.Property(e => e.DelFg).HasColumnName("DelFg");
        });
    }
}
