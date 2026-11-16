-- =============================================================================
-- 株式会社ミツヒデ (Mitsuhide Co., Ltd.)
-- 原価管理システム (Cost Management ERP System)
-- Microsoft SQL Server 2019+ Database Initialization & Schema Script (T-SQL)
-- =============================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'mitsuhide_cost_db')
BEGIN
    CREATE DATABASE [mitsuhide_cost_db];
END
GO

USE [mitsuhide_cost_db];
GO

-- -----------------------------------------------------------------------------
-- 1. 受注先マスタ (AD_M_JYUCYU - Customer Master)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_JYUCYU', 'U') IS NOT NULL DROP TABLE dbo.AD_M_JYUCYU;
GO

CREATE TABLE dbo.AD_M_JYUCYU (
    [admjyu_code]      INT NOT NULL,
    [admjyu_name]      NVARCHAR(40) NOT NULL,
    [admjyu_ryaku]     NVARCHAR(16) NULL,
    [admjyu_kana]      NVARCHAR(20) NULL,
    [admjyu_sekinin]   NVARCHAR(30) NULL,
    [admjyu_yubin]     VARCHAR(8) NULL,
    [admjyu_jyusyo1]   NVARCHAR(40) NULL,
    [admjyu_jyusyo2]   NVARCHAR(40) NULL,
    [admjyu_tel]       VARCHAR(13) NULL,
    [admjyu_fax]       VARCHAR(13) NULL,
    [admjyu_mail]      VARCHAR(40) NULL,
    [admjyu_simedd]    INT NOT NULL DEFAULT 0,
    [admjyu_syukinmm]  INT NOT NULL DEFAULT 0,
    [admjyu_syukindd]  INT NOT NULL DEFAULT 0,
    [admjyu_kaisyu]    NVARCHAR(20) NULL,
    [admjyu_tegata]    INT NOT NULL DEFAULT 0,
    [admjyu_genkin]    INT NOT NULL DEFAULT 0,
    [admjyu_kakert]    INT NOT NULL DEFAULT 100,
    [admjyu_syosiki]   INT NOT NULL DEFAULT 1,
    [admjyu_torikb]    INT NOT NULL DEFAULT 1,
    [admjyu_biko1]     NVARCHAR(60) NULL,
    [admjyu_biko2]     NVARCHAR(60) NULL,
    [admjyu_biko3]     NVARCHAR(60) NULL,
    [NewUser]          VARCHAR(6) NULL,
    [NewDate]          DATETIME2 NULL,
    [NewApid]          VARCHAR(7) NULL,
    [NewWsnm]          VARCHAR(20) NULL,
    [UpdUser]          VARCHAR(6) NULL,
    [UpdDate]          DATETIME2 NULL,
    [UpdApid]          VARCHAR(7) NULL,
    [UpdWsnm]          VARCHAR(20) NULL,
    [DelFg]            INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_AD_M_JYUCYU] PRIMARY KEY CLUSTERED ([admjyu_code])
);
GO

-- -----------------------------------------------------------------------------
-- 2. 仕入先マスタ (AD_M_SIIRE - Supplier Master)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_SIIRE', 'U') IS NOT NULL DROP TABLE dbo.AD_M_SIIRE;
GO

CREATE TABLE dbo.AD_M_SIIRE (
    [admsir_code]      INT NOT NULL,
    [admsir_name]      NVARCHAR(40) NOT NULL,
    [admsir_ryaku]     NVARCHAR(16) NULL,
    [admsir_kana]      NVARCHAR(20) NULL,
    [admsir_sekinin]   NVARCHAR(30) NULL,
    [admsir_gyousyu]   NVARCHAR(20) NULL,
    [admsir_yubin]     VARCHAR(8) NULL,
    [admsir_jyusyo1]   NVARCHAR(40) NULL,
    [admsir_jyusyo2]   NVARCHAR(40) NULL,
    [admsir_tel]       VARCHAR(13) NULL,
    [admsir_fax]       VARCHAR(13) NULL,
    [admsir_mail]      VARCHAR(40) NULL,
    [admsir_simedd]    INT NOT NULL DEFAULT 0,
    [admsir_siharai]   NVARCHAR(40) NULL,
    [admsir_risoku]    DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    [admsir_bnknm]     NVARCHAR(30) NULL,
    [admsir_stnnm]     NVARCHAR(30) NULL,
    [admsir_kozasb]    INT NOT NULL DEFAULT 1,
    [admsir_kozano]    VARCHAR(7) NULL,
    [admsir_kozanm]    NVARCHAR(30) NULL,
    [admsir_biko1]     NVARCHAR(60) NULL,
    [admsir_biko2]     NVARCHAR(60) NULL,
    [admsir_biko3]     NVARCHAR(60) NULL,
    [NewUser]          VARCHAR(6) NULL,
    [NewDate]          DATETIME2 NULL,
    [NewApid]          VARCHAR(7) NULL,
    [NewWsnm]          VARCHAR(20) NULL,
    [UpdUser]          VARCHAR(6) NULL,
    [UpdDate]          DATETIME2 NULL,
    [UpdApid]          VARCHAR(7) NULL,
    [UpdWsnm]          VARCHAR(20) NULL,
    [DelFg]            INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_AD_M_SIIRE] PRIMARY KEY CLUSTERED ([admsir_code])
);
GO

-- -----------------------------------------------------------------------------
-- 3. ユーザーグループマスタ (AD_M_USER_GRP)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_USER_GRP', 'U') IS NOT NULL DROP TABLE dbo.AD_M_USER_GRP;
GO

CREATE TABLE dbo.AD_M_USER_GRP (
    [admgrp_usergrp_cd]   VARCHAR(4) NOT NULL,
    [admgrp_usergrp_name] NVARCHAR(20) NOT NULL,
    [admgrp_run_apl_cnt]  INT NOT NULL DEFAULT 5,
    [NewUser]             VARCHAR(6) NULL,
    [NewDate]             DATETIME2 NULL,
    [NewApid]             VARCHAR(7) NULL,
    [NewWsnm]             VARCHAR(20) NULL,
    [UpdUser]             VARCHAR(6) NULL,
    [UpdDate]             DATETIME2 NULL,
    [UpdApid]             VARCHAR(7) NULL,
    [UpdWsnm]             VARCHAR(20) NULL,
    [DelFg]               INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_AD_M_USER_GRP] PRIMARY KEY CLUSTERED ([admgrp_usergrp_cd])
);
GO

-- -----------------------------------------------------------------------------
-- 4. ユーザーマスタ (AD_M_USER)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_USER', 'U') IS NOT NULL DROP TABLE dbo.AD_M_USER;
GO

CREATE TABLE dbo.AD_M_USER (
    [admuse_user_cd]        VARCHAR(6) NOT NULL,
    [admuse_user_name]      NVARCHAR(20) NOT NULL,
    [admuse_user_name_r]    NVARCHAR(10) NULL,
    [admuse_user_name_k]    NVARCHAR(10) NULL,
    [admuse_tanto_kbn]      INT NOT NULL DEFAULT 1,
    [admuse_usergrp_cd]     VARCHAR(4) NOT NULL DEFAULT '1',
    [admuse_syubetu]        INT NOT NULL DEFAULT 1,
    [admuse_biko]           NVARCHAR(40) NULL,
    [admuse_pass]           VARCHAR(255) NOT NULL,
    [admuse_pass_upd_date]  DATETIME2 NULL,
    [admuse_pass_kigen]     INT NULL,
    [admuse_login_date]     DATETIME2 NULL,
    [admuse_user_kigen]     INT NULL,
    [NewUser]               VARCHAR(6) NULL,
    [NewDate]               DATETIME2 NULL,
    [NewApid]               VARCHAR(7) NULL,
    [NewWsnm]               VARCHAR(20) NULL,
    [UpdUser]               VARCHAR(6) NULL,
    [UpdDate]               DATETIME2 NULL,
    [UpdApid]               VARCHAR(7) NULL,
    [UpdWsnm]               VARCHAR(20) NULL,
    [DelFg]                 INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_AD_M_USER] PRIMARY KEY CLUSTERED ([admuse_user_cd])
);
GO

-- -----------------------------------------------------------------------------
-- 5. システム名称マスタ (AD_M_SYSNAME)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_SYSNAME', 'U') IS NOT NULL DROP TABLE dbo.AD_M_SYSNAME;
GO

CREATE TABLE dbo.AD_M_SYSNAME (
    [admnam_name_kbn] VARCHAR(5) NOT NULL,
    [admnam_name_cd]  VARCHAR(7) NOT NULL,
    [admnam_ch1]      NVARCHAR(100) NOT NULL,
    [admnam_ch2]      NVARCHAR(100) NULL,
    [admnam_nm1]      DECIMAL(11,0) NULL,
    [admnam_nm2]      DECIMAL(11,0) NULL,
    [admnam_date1]    INT NULL,
    [admnam_date2]    INT NULL,
    [NewUser]         VARCHAR(6) NULL,
    [NewDate]         DATETIME2 NULL,
    [NewApid]         VARCHAR(7) NULL,
    [NewWsnm]         VARCHAR(20) NULL,
    [UpdUser]         VARCHAR(6) NULL,
    [UpdDate]         DATETIME2 NULL,
    [UpdApid]         VARCHAR(7) NULL,
    [UpdWsnm]         VARCHAR(20) NULL,
    [DelFg]           INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_AD_M_SYSNAME] PRIMARY KEY CLUSTERED ([admnam_name_kbn], [admnam_name_cd])
);
GO

-- -----------------------------------------------------------------------------
-- 6. 処理基準管理マスタ (AD_M_CONTROL)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_CONTROL', 'U') IS NOT NULL DROP TABLE dbo.AD_M_CONTROL;
GO

CREATE TABLE dbo.AD_M_CONTROL (
    [admcon_subsys_cd]   VARCHAR(2) NOT NULL,
    [admcon_prog_id]     VARCHAR(7) NOT NULL,
    [admcon_kanri_name]  NVARCHAR(40) NOT NULL,
    [admcon_nm1]         DECIMAL(11,0) NULL,
    [admcon_nm2]         DECIMAL(11,0) NULL,
    [admcon_ch1]         NVARCHAR(100) NULL,
    [admcon_ch2]         NVARCHAR(100) NULL,
    [NewUser]            VARCHAR(6) NULL,
    [NewDate]            DATETIME2 NULL,
    [NewApid]            VARCHAR(7) NULL,
    [NewWsnm]            VARCHAR(20) NULL,
    [UpdUser]            VARCHAR(6) NULL,
    [UpdDate]            DATETIME2 NULL,
    [UpdApid]            VARCHAR(7) NULL,
    [UpdWsnm]            VARCHAR(20) NULL,
    [DelFg]              INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_AD_M_CONTROL] PRIMARY KEY CLUSTERED ([admcon_subsys_cd], [admcon_prog_id])
);
GO

-- -----------------------------------------------------------------------------
-- 7. 処理基準年月マスタ (AD_M_GDATE)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_GDATE', 'U') IS NOT NULL DROP TABLE dbo.AD_M_GDATE;
GO

CREATE TABLE dbo.AD_M_GDATE (
    [admgdt_yyyymm]    INT NOT NULL,
    [admgdt_kosin_flg] INT NOT NULL DEFAULT 0,
    [NewUser]          VARCHAR(6) NULL,
    [NewDate]          DATETIME2 NULL,
    [NewApid]          VARCHAR(7) NULL,
    [NewWsnm]          VARCHAR(20) NULL,
    [UpdUser]          VARCHAR(6) NULL,
    [UpdDate]          DATETIME2 NULL,
    [UpdApid]          VARCHAR(7) NULL,
    [UpdWsnm]          VARCHAR(20) NULL,
    [DelFg]            INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_AD_M_GDATE] PRIMARY KEY CLUSTERED ([admgdt_yyyymm])
);
GO

-- -----------------------------------------------------------------------------
-- 8. 工事受注データ (GK_T_KOJIJYU)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.GK_T_KOJIJYU', 'U') IS NOT NULL DROP TABLE dbo.GK_T_KOJIJYU;
GO

CREATE TABLE dbo.GK_T_KOJIJYU (
    [gktkjy_unq_id]     BIGINT IDENTITY(1,1) NOT NULL,
    [gktkjy_kojicd]     INT NOT NULL,
    [gktkjy_kojisyu]    INT NOT NULL DEFAULT 0,
    [gktkjy_jyucd]      INT NOT NULL,
    [gktkjy_kojinm]     NVARCHAR(80) NOT NULL,
    [gktkjy_kojiryk]    NVARCHAR(40) NULL,
    [gktkjy_genbanm]    NVARCHAR(80) NULL,
    [gktkjy_genbajy]    NVARCHAR(80) NULL,
    [gktkjy_koukibgn]   INT NOT NULL DEFAULT 0,
    [gktkjy_koukiend]   INT NOT NULL DEFAULT 0,
    [gktkjy_keiyakugnk] DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gktkjy_zeirt]      INT NOT NULL DEFAULT 10,
    [gktkjy_zeigk]      DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gktkjy_keiyakugkm] DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gktkjy_yosangaku]  DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gktkjy_kanseikb]   INT NOT NULL DEFAULT 0,
    [gktkjy_biko]       NVARCHAR(200) NULL,
    [NewUser]           VARCHAR(6) NULL,
    [NewDate]           DATETIME2 NULL,
    [NewApid]           VARCHAR(7) NULL,
    [NewWsnm]           VARCHAR(20) NULL,
    [UpdUser]           VARCHAR(6) NULL,
    [UpdDate]           DATETIME2 NULL,
    [UpdApid]           VARCHAR(7) NULL,
    [UpdWsnm]           VARCHAR(20) NULL,
    [DelFg]             INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_GK_T_KOJIJYU] PRIMARY KEY CLUSTERED ([gktkjy_unq_id]),
    CONSTRAINT [IX_GK_T_KOJIJYU_CKEY1] UNIQUE ([gktkjy_kojicd], [gktkjy_kojisyu])
);
GO

-- -----------------------------------------------------------------------------
-- 9. 工事予算データ (GK_T_KOJIYOS)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.GK_T_KOJIYOS', 'U') IS NOT NULL DROP TABLE dbo.GK_T_KOJIYOS;
GO

CREATE TABLE dbo.GK_T_KOJIYOS (
    [gktkys_unq_id]     BIGINT IDENTITY(1,1) NOT NULL,
    [gktkys_kojicd]     INT NOT NULL,
    [gktkys_kojisyu]    INT NOT NULL DEFAULT 0,
    [gktkys_yosasyu]    INT NOT NULL,
    [gktkys_siirecd]    INT NOT NULL,
    [gktkys_yosangk]    DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gktkys_hassyugk]   DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gktkys_biko]       NVARCHAR(100) NULL,
    [NewUser]           VARCHAR(6) NULL,
    [NewDate]           DATETIME2 NULL,
    [NewApid]           VARCHAR(7) NULL,
    [NewWsnm]           VARCHAR(20) NULL,
    [UpdUser]           VARCHAR(6) NULL,
    [UpdDate]           DATETIME2 NULL,
    [UpdApid]           VARCHAR(7) NULL,
    [UpdWsnm]           VARCHAR(20) NULL,
    [DelFg]             INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_GK_T_KOJIYOS] PRIMARY KEY CLUSTERED ([gktkys_unq_id])
);
GO
CREATE NONCLUSTERED INDEX [IX_GK_T_KOJIYOS_CKEY1] 
ON dbo.GK_T_KOJIYOS ([gktkys_kojicd], [gktkys_kojisyu], [gktkys_yosasyu], [gktkys_siirecd]);
GO

-- -----------------------------------------------------------------------------
-- 10. 仕入データ (GK_T_SIIRE)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.GK_T_SIIRE', 'U') IS NOT NULL DROP TABLE dbo.GK_T_SIIRE;
GO

CREATE TABLE dbo.GK_T_SIIRE (
    [gktsir_unq_id]     BIGINT IDENTITY(1,1) NOT NULL,
    [gktsir_date]       INT NOT NULL,
    [gktsir_siire]      INT NOT NULL,
    [gktsir_kojicd]     INT NOT NULL,
    [gktsir_kojisyu]    INT NOT NULL DEFAULT 0,
    [gktsir_yosasyu]    INT NOT NULL,
    [gktsir_aitekam]    INT NOT NULL DEFAULT 1,
    [gktsir_siiregk_nk] DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gktsir_zeirt]      INT NOT NULL DEFAULT 10,
    [gktsir_zeigk]      DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gktsir_siiregk_km] DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gktsir_biko]       NVARCHAR(200) NULL,
    [NewUser]           VARCHAR(6) NULL,
    [NewDate]           DATETIME2 NULL,
    [NewApid]           VARCHAR(7) NULL,
    [NewWsnm]           VARCHAR(20) NULL,
    [UpdUser]           VARCHAR(6) NULL,
    [UpdDate]           DATETIME2 NULL,
    [UpdApid]           VARCHAR(7) NULL,
    [UpdWsnm]           VARCHAR(20) NULL,
    [DelFg]             INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_GK_T_SIIRE] PRIMARY KEY CLUSTERED ([gktsir_unq_id])
);
GO
CREATE NONCLUSTERED INDEX [IX_GK_T_SIIRE_CKEY1] ON dbo.GK_T_SIIRE ([gktsir_date], [gktsir_siire]);
CREATE NONCLUSTERED INDEX [IX_GK_T_SIIRE_CKEY2] ON dbo.GK_T_SIIRE ([gktsir_kojicd], [gktsir_kojisyu]);
GO

-- -----------------------------------------------------------------------------
-- 11. 売上データ (GK_T_URIAGE)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.GK_T_URIAGE', 'U') IS NOT NULL DROP TABLE dbo.GK_T_URIAGE;
GO

CREATE TABLE dbo.GK_T_URIAGE (
    [gkturi_unq_id]      BIGINT IDENTITY(1,1) NOT NULL,
    [gkturi_date]        INT NOT NULL,
    [gkturi_jyucyu]      INT NOT NULL,
    [gkturi_kojicd]      INT NOT NULL,
    [gkturi_kojisyu]     INT NOT NULL DEFAULT 0,
    [gkturi_uriagegk_nk] DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gkturi_zeirt]       INT NOT NULL DEFAULT 10,
    [gkturi_zeigk]       DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gkturi_uriagegk_km] DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gkturi_biko]        NVARCHAR(200) NULL,
    [NewUser]            VARCHAR(6) NULL,
    [NewDate]            DATETIME2 NULL,
    [NewApid]            VARCHAR(7) NULL,
    [NewWsnm]            VARCHAR(20) NULL,
    [UpdUser]            VARCHAR(6) NULL,
    [UpdDate]            DATETIME2 NULL,
    [UpdApid]            VARCHAR(7) NULL,
    [UpdWsnm]            VARCHAR(20) NULL,
    [DelFg]              INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_GK_T_URIAGE] PRIMARY KEY CLUSTERED ([gkturi_unq_id])
);
GO
CREATE NONCLUSTERED INDEX [IX_GK_T_URIAGE_CKEY1] ON dbo.GK_T_URIAGE ([gkturi_date], [gkturi_jyucyu]);
CREATE NONCLUSTERED INDEX [IX_GK_T_URIAGE_CKEY2] ON dbo.GK_T_URIAGE ([gkturi_kojicd], [gkturi_kojisyu]);
GO

-- -----------------------------------------------------------------------------
-- 12. 工事仕掛データ (GK_T_KOJISIK)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.GK_T_KOJISIK', 'U') IS NOT NULL DROP TABLE dbo.GK_T_KOJISIK;
GO

CREATE TABLE dbo.GK_T_KOJISIK (
    [gktksik_unq_id]   BIGINT IDENTITY(1,1) NOT NULL,
    [gktksik_date]     INT NOT NULL,
    [gktksik_kojicd]   INT NOT NULL,
    [gktksik_hukakati] DECIMAL(13,0) NOT NULL DEFAULT 0,
    [gktksik_sikakari] DECIMAL(13,0) NOT NULL DEFAULT 0,
    [NewUser]          VARCHAR(6) NULL,
    [NewDate]          DATETIME2 NULL,
    [NewApid]          VARCHAR(7) NULL,
    [NewWsnm]          VARCHAR(20) NULL,
    [UpdUser]          VARCHAR(6) NULL,
    [UpdDate]          DATETIME2 NULL,
    [UpdApid]          VARCHAR(7) NULL,
    [UpdWsnm]          VARCHAR(20) NULL,
    [DelFg]            INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_GK_T_KOJISIK] PRIMARY KEY CLUSTERED ([gktksik_unq_id])
);
GO
CREATE NONCLUSTERED INDEX [IX_GK_T_KOJISIK_CKEY1] ON dbo.GK_T_KOJISIK ([gktksik_date], [gktksik_kojicd]);
GO

-- =============================================================================
-- 初期マスタデータ投入 (Seed Data)
-- =============================================================================

-- 受注先マスタ
INSERT INTO dbo.AD_M_JYUCYU ([admjyu_code], [admjyu_name], [admjyu_ryaku], [admjyu_yubin], [admjyu_jyusyo1], [admjyu_tel], [admjyu_simedd], [NewDate], [NewUser], [NewApid])
VALUES
(1001, N'清水建設 株式会社', N'清水建設', '104-8370', N'東京都中央区京橋二丁目16番1号', '03-3561-1111', 20, GETDATE(), 'INIT', 'SEED'),
(1002, N'大林組 株式会社', N'大林組', '108-8502', N'東京都港区港南二丁目15番2号', '03-5769-1111', 0, GETDATE(), 'INIT', 'SEED'),
(1003, N'鹿島建設 株式会社', N'鹿島建設', '107-8388', N'東京都港区元赤坂一丁目3番1号', '03-5544-1111', 25, GETDATE(), 'INIT', 'SEED'),
(1004, N'大成建設 株式会社', N'大成建設', '163-0606', N'東京都新宿区西新宿一丁目25番1号', '03-3348-1111', 0, GETDATE(), 'INIT', 'SEED');
GO

-- 仕入先マスタ
INSERT INTO dbo.AD_M_SIIRE ([admsir_code], [admsir_name], [admsir_ryaku], [admsir_yubin], [admsir_jyusyo1], [admsir_tel], [admsir_simedd], [NewDate], [NewUser], [NewApid])
VALUES
(2001, N'阪和興業 株式会社', N'阪和興業', '104-8429', N'東京都中央区築地一丁目13番1号', '03-3544-2171', 20, GETDATE(), 'INIT', 'SEED'),
(2002, N'ミツヒデ 第一工場 (加工外注)', N'ミツヒデ第1工', '136-0082', N'東京都江東区新木場三丁目4番5号', '03-3522-8811', 0, GETDATE(), 'INIT', 'SEED'),
(2003, N'日本非破壊検査 株式会社', N'非破壊検査', '550-0014', N'大阪府大阪市西区北堀江一丁目18番14号', '06-6532-6111', 0, GETDATE(), 'INIT', 'SEED'),
(2004, N'朝日防錆塗装 工業株式会社', N'朝日防錆', '230-0045', N'神奈川県横浜市鶴見区末広町二丁目1番', '045-501-3321', 25, GETDATE(), 'INIT', 'SEED'),
(2005, N'丸全昭和運輸 株式会社', N'丸全昭和運輸', '231-8419', N'神奈川県横浜市中区南仲通二丁目15番地', '045-671-5811', 20, GETDATE(), 'INIT', 'SEED'),
(2006, N'東京重機 株式会社', N'東京重機', '140-0002', N'東京都品川区東品川三丁目10番21号', '03-3472-9111', 0, GETDATE(), 'INIT', 'SEED');
GO

-- ユーザーグループマスタ
INSERT INTO dbo.AD_M_USER_GRP ([admgrp_usergrp_cd], [admgrp_usergrp_name], [admgrp_run_apl_cnt], [NewDate], [NewUser], [NewApid])
VALUES
('1', N'一般グループ', 5, GETDATE(), 'INIT', 'SEED'),
('9', N'システム管理者グループ', 10, GETDATE(), 'INIT', 'SEED');
GO

-- ユーザーマスタ
INSERT INTO dbo.AD_M_USER (
    [admuse_user_cd], [admuse_user_name], [admuse_user_name_r], [admuse_user_name_k], 
    [admuse_tanto_kbn], [admuse_usergrp_cd], [admuse_syubetu], [admuse_biko], 
    [admuse_pass], [admuse_pass_upd_date], [NewDate], [NewUser], [NewApid]
) VALUES
('000001', N'酒井 太郎', N'酒井', N'サカイ タロウ', 1, '9', 1, N'システム管理者 / 営業統括', 'admin123', GETDATE(), GETDATE(), 'INIT', 'SEED'),
('000002', N'佐藤 次郎', N'佐藤', N'サトウ ジロウ', 1, '1', 5, N'現場工事主任', 'user123', GETDATE(), GETDATE(), 'INIT', 'SEED'),
('000003', N'鈴木 花子', N'鈴木', N'スズキ ハナコ', 9, '1', 9, N'経理・決算担当', 'user123', GETDATE(), GETDATE(), 'INIT', 'SEED');
GO

-- 処理基準年月マスタ
INSERT INTO dbo.AD_M_GDATE ([admgdt_yyyymm], [admgdt_kosin_flg], [NewDate], [NewUser], [NewApid])
VALUES
(202611, 0, GETDATE(), 'INIT', 'SEED');
GO

-- システム名称マスタ
INSERT INTO dbo.AD_M_SYSNAME ([admnam_name_kbn], [admnam_name_cd], [admnam_ch1], [admnam_ch2], [admnam_nm1], [NewDate], [NewUser], [NewApid])
VALUES
('GK001', '0', N'未成', N'工事施工中・仕掛', 1, GETDATE(), 'INIT', 'SEED'),
('GK001', '1', N'完成', N'完工引渡済', 2, GETDATE(), 'INIT', 'SEED'),
('GK002', '1', N'民間', N'一般企業・民間工事', 1, GETDATE(), 'INIT', 'SEED'),
('GK002', '2', N'官公庁', N'公共工事・入札', 2, GETDATE(), 'INIT', 'SEED'),
('GK003', '1', N'元請', N'直接請負', 1, GETDATE(), 'INIT', 'SEED'),
('GK003', '2', N'下請', N'ゼネコン一次下請', 2, GETDATE(), 'INIT', 'SEED'),
('GK004', '1', N'課税 (10%)', N'標準税率', 10, GETDATE(), 'INIT', 'SEED'),
('GK004', '2', N'非課税', N'非課税取引', 0, GETDATE(), 'INIT', 'SEED'),
('AD001', '1', N'20日締め', N'毎月20日締切', 20, GETDATE(), 'INIT', 'SEED'),
('AD001', '2', N'末日締め', N'当月末日締切', 99, GETDATE(), 'INIT', 'SEED'),
('AD002', '1', N'営業担当', N'受注・顧客窓口', 1, GETDATE(), 'INIT', 'SEED'),
('AD002', '2', N'工務担当', N'施工・現場管理', 2, GETDATE(), 'INIT', 'SEED'),
('AD002', '9', N'経理担当', N'請求・支払・管理', 9, GETDATE(), 'INIT', 'SEED');
GO

-- 処理基準管理マスタ
INSERT INTO dbo.AD_M_CONTROL ([admcon_subsys_cd], [admcon_prog_id], [admcon_kanri_name], [admcon_nm1], [admcon_nm2], [admcon_ch1], [NewDate], [NewUser], [NewApid])
VALUES
('GK', 'GK0010', N'工事番号採番体系', 2026, 4, N'年度(4桁)＋連番(4桁)', GETDATE(), 'INIT', 'SEED'),
('GK', 'GK0020', N'実行予算承認基準額', 50000000, 1, N'5千万円以上役員承認', GETDATE(), 'INIT', 'SEED'),
('UR', 'UR0010', N'売上消費税端数処理', 1, 10, N'四捨五入 (1:切捨, 2:四捨五入, 3:切上)', GETDATE(), 'INIT', 'SEED'),
('SR', 'SR0010', N'仕入消費税端数処理', 1, 10, N'切捨て', GETDATE(), 'INIT', 'SEED'),
('VM', 'VM0010', N'月次更新締日基準', 99, 0, N'当月末日一括更新', GETDATE(), 'INIT', 'SEED'),
('AD', 'AD0000', N'システム標準消費税率', 10, 8, N'標準税率10% / 軽減税率8%', GETDATE(), 'INIT', 'SEED');
GO

-- サンプル工事受注データ
INSERT INTO dbo.GK_T_KOJIJYU (
    [gktkjy_kojicd], [gktkjy_kojisyu], [gktkjy_jyucd], [gktkjy_kojinm], [gktkjy_kojiryk], 
    [gktkjy_genbanm], [gktkjy_genbajy], [gktkjy_koukibgn], [gktkjy_koukiend], 
    [gktkjy_keiyakugnk], [gktkjy_zeirt], [gktkjy_zeigk], [gktkjy_keiyakugkm], 
    [gktkjy_yosangaku], [gktkjy_kanseikb], [gktkjy_biko], [NewDate], [NewUser], [NewApid]
) VALUES (
    1001, 0, 1001, N'新社屋新築工事 (鉄骨工事一式)', N'新社屋新築',
    N'東京都中央区京橋PJ現場', N'東京都中央区京橋二丁目', 20260401, 20261130,
    45000000, 10, 4500000, 49500000,
    35200000, 0, N'S造5階建 柱・梁・ブレース製作建方工事一式', GETDATE(), 'INIT', 'SEED'
);
GO

-- サンプル実行予算明細
INSERT INTO dbo.GK_T_KOJIYOS ([gktkys_kojicd], [gktkys_kojisyu], [gktkys_yosasyu], [gktkys_siirecd], [gktkys_yosangk], [gktkys_hassyugk], [gktkys_biko], [NewDate], [NewUser], [NewApid])
VALUES
(1001, 0, 101, 2001, 16500000, 15000000, N'H形鋼 SM490A, コラム BCR295', GETDATE(), 'INIT', 'SEED'),
(1001, 0, 102, 2002, 4200000,  4000000,  N'開先加工・バンドソー切断', GETDATE(), 'INIT', 'SEED'),
(1001, 0, 103, 2002, 5800000,  5500000,  N'工場鍛冶組立・コア組み立て', GETDATE(), 'INIT', 'SEED'),
(1001, 0, 104, 2003, 2500000,  2200000,  N'柱梁完全溶け込み溶接・UT超音波探傷試験', GETDATE(), 'INIT', 'SEED'),
(1001, 0, 105, 2004, 2800000,  2500000,  N'錆止め塗装・耐火塗装仕様', GETDATE(), 'INIT', 'SEED'),
(1001, 0, 106, 2005, 1400000,  1200000,  N'夜間運搬・トレーラー配送一式', GETDATE(), 'INIT', 'SEED'),
(1001, 0, 107, 2006, 2000000,  1800000,  N'ラフタークレーン25t / 現場建方合図', GETDATE(), 'INIT', 'SEED');
GO
