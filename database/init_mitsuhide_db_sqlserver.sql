-- =============================================================================
-- 株式会社ミツヒデ (Mitsuhide Co., Ltd.)
-- 原価管理システム (Cost Management ERP System)
-- Microsoft SQL Server 2019+
-- 準拠仕様書: 
--   1. ファイルレイアウト（マスタ）.pdf (全11マスタテーブル)
--   2. ファイルレイアウト（データ）.pdf (全5データテーブル)
-- =============================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'mitsuhide_cost_db')
BEGIN
    CREATE DATABASE [mitsuhide_cost_db];
END
GO

USE [mitsuhide_cost_db];
GO

-- =============================================================================
-- 【マスタ部 (05_マスタ)】ファイルレイアウト（マスタ）.pdf 準拠
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ユーザーグループマスタ (AD_M_USER_GRP) - PDF Page 2
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_USER_GRP', 'U') IS NOT NULL DROP TABLE dbo.AD_M_USER_GRP;
GO
CREATE TABLE dbo.AD_M_USER_GRP (
    [admgrp_usergrp_cd]   VARCHAR(4) NOT NULL,            -- ユーザーグループCD (PKEY: 1:一般, 9:管理者)
    [admgrp_usergrp_name] NVARCHAR(20) NOT NULL,          -- グループ名称
    [admgrp_run_apl_cnt]  SMALLINT NOT NULL DEFAULT 5,    -- 同時実行可能APL数
    [admgrp_new_user]     VARCHAR(6) NULL,                -- 初回作成者
    [admgrp_new_date]     DATETIME2 NULL,                 -- 初回作成日
    [admgrp_new_apid]     VARCHAR(7) NULL,                -- 初回作成APLID
    [admgrp_new_wsnm]     VARCHAR(20) NULL,               -- 初回作成端末名
    [admgrp_upd_user]     VARCHAR(6) NULL,                -- 最終更新者
    [admgrp_upd_date]     DATETIME2 NULL,                 -- 最終更新日
    [admgrp_upd_apid]     VARCHAR(7) NULL,                -- 最終更新APLID
    [admgrp_upd_wsnm]     VARCHAR(20) NULL,               -- 最終更新端末名
    CONSTRAINT [PK_AD_M_USER_GRP] PRIMARY KEY CLUSTERED ([admgrp_usergrp_cd])
);
GO

-- -----------------------------------------------------------------------------
-- 2. システム名称マスタ (AD_M_NAME / AD_M_SYSNAME) - PDF Page 3
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_NAME', 'U') IS NOT NULL DROP TABLE dbo.AD_M_NAME;
IF OBJECT_ID('dbo.AD_M_SYSNAME', 'U') IS NOT NULL DROP TABLE dbo.AD_M_SYSNAME;
GO
CREATE TABLE dbo.AD_M_NAME (
    [admnam_name_kbn]     VARCHAR(5) NOT NULL,            -- システム名称区分 (PKEY)
    [admnam_name_cd]      VARCHAR(7) NOT NULL,            -- システム名称CD (PKEY)
    [admnam_ch1]          NVARCHAR(100) NOT NULL,         -- 文字項目1
    [admnam_ch2]          NVARCHAR(100) NULL,             -- 文字項目2
    [admnam_nm1]          DECIMAL(11,0) NULL,             -- 数字項目1
    [admnam_nm2]          DECIMAL(11,0) NULL,             -- 数字項目2
    [admnam_date1]        INT NULL,                       -- 日付項目1
    [admnam_date2]        INT NULL,                       -- 日付項目2
    [admnam_new_user]     VARCHAR(6) NULL,                -- 初回作成者
    [admnam_new_date]     DATETIME2 NULL,                 -- 初回作成日
    [admnam_new_apid]     VARCHAR(7) NULL,                -- 初回作成APLID
    [admnam_new_wsnm]     VARCHAR(20) NULL,               -- 初回作成端末名
    [admnam_upd_user]     VARCHAR(6) NULL,                -- 最終更新者
    [admnam_upd_date]     DATETIME2 NULL,                 -- 最終更新日
    [admnam_upd_apid]     VARCHAR(7) NULL,                -- 最終更新APLID
    [admnam_upd_wsnm]     VARCHAR(20) NULL,               -- 最終更新端末名
    CONSTRAINT [PK_AD_M_NAME] PRIMARY KEY CLUSTERED ([admnam_name_kbn], [admnam_name_cd])
);
GO
-- 互換ビュー (AD_M_SYSNAME)
CREATE OR ALTER VIEW dbo.AD_M_SYSNAME AS SELECT * FROM dbo.AD_M_NAME;
GO

-- -----------------------------------------------------------------------------
-- 3. 処理基準管理マスタ (AD_M_CONTROL) - PDF Page 4
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_CONTROL', 'U') IS NOT NULL DROP TABLE dbo.AD_M_CONTROL;
GO
CREATE TABLE dbo.AD_M_CONTROL (
    [admcon_subsys_cd]    VARCHAR(2) NOT NULL,            -- サブシステムCD (PKEY: MS, GK, UR, SR, VM, AD)
    [admcon_prog_id]      VARCHAR(7) NOT NULL,            -- プログラムID (PKEY)
    [admcon_kanri_name]   NVARCHAR(40) NOT NULL,          -- 管理名称
    [admcon_nm1]          DECIMAL(10,0) NULL,             -- 数値項目１
    [admcon_nm2]          DECIMAL(10,0) NULL,             -- 数値項目２
    [admcon_nm3]          DECIMAL(10,0) NULL,             -- 数値項目３
    [admcon_nm4]          DECIMAL(10,0) NULL,             -- 数値項目４
    [admcon_nm5]          DECIMAL(10,0) NULL,             -- 数値項目５
    [admcon_nm6]          DECIMAL(10,0) NULL,             -- 数値項目６
    [admcon_nm7]          DECIMAL(10,0) NULL,             -- 数値項目７
    [admcon_nm8]          DECIMAL(10,0) NULL,             -- 数値項目８
    [admcon_nm9]          DECIMAL(10,0) NULL,             -- 数値項目９
    [admcon_nm10]         DECIMAL(10,0) NULL,             -- 数値項目１０
    [admcon_nm11]         DECIMAL(10,0) NULL,             -- 数値項目１１
    [admcon_nm12]         DECIMAL(10,0) NULL,             -- 数値項目１２
    [admcon_nm13]         DECIMAL(10,0) NULL,             -- 数値項目１３
    [admcon_nm14]         DECIMAL(10,0) NULL,             -- 数値項目１４
    [admcon_nm15]         DECIMAL(10,0) NULL,             -- 数値項目１５
    [admcon_ch1]          NVARCHAR(100) NULL,             -- 文字項目１
    [admcon_ch2]          NVARCHAR(100) NULL,             -- 文字項目２
    [admcon_ch3]          NVARCHAR(100) NULL,             -- 文字項目３
    [admcon_ch4]          NVARCHAR(100) NULL,             -- 文字項目４
    [admcon_ch5]          NVARCHAR(100) NULL,             -- 文字項目５
    [admcon_ch6]          NVARCHAR(100) NULL,             -- 文字項目６
    [admcon_ch7]          NVARCHAR(100) NULL,             -- 文字項目７
    [admcon_ch8]          NVARCHAR(100) NULL,             -- 文字項目８
    [admcon_ch9]          NVARCHAR(100) NULL,             -- 文字項目９
    [admcon_ch10]         NVARCHAR(100) NULL,             -- 文字項目１０
    [admcon_ch11]         NVARCHAR(200) NULL,             -- 文字項目１１
    [admcon_ch12]         NVARCHAR(200) NULL,             -- 文字項目１２
    [admcon_ch13]         NVARCHAR(200) NULL,             -- 文字項目１３
    [admcon_ch14]         NVARCHAR(200) NULL,             -- 文字項目１４
    [admcon_ch15]         NVARCHAR(200) NULL,             -- 文字項目１５
    [admcon_new_user]     VARCHAR(6) NULL,                -- 初回作成者
    [admcon_new_date]     DATETIME2 NULL,                 -- 初回作成日
    [admcon_new_apid]     VARCHAR(7) NULL,                -- 初回作成APLID
    [admcon_new_wsnm]     VARCHAR(20) NULL,               -- 初回作成端末名
    [admcon_upd_user]     VARCHAR(6) NULL,                -- 最終更新者
    [admcon_upd_date]     DATETIME2 NULL,                 -- 最終更新日
    [admcon_upd_apid]     VARCHAR(7) NULL,                -- 最終更新APLID
    [admcon_upd_wsnm]     VARCHAR(20) NULL,               -- 最終更新端末名
    CONSTRAINT [PK_AD_M_CONTROL] PRIMARY KEY CLUSTERED ([admcon_subsys_cd], [admcon_prog_id])
);
GO

-- -----------------------------------------------------------------------------
-- 4. メッセージマスタ (AD_M_MSG) - PDF Page 5
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_MSG', 'U') IS NOT NULL DROP TABLE dbo.AD_M_MSG;
GO
CREATE TABLE dbo.AD_M_MSG (
    [admmsg_msgno]        VARCHAR(5) NOT NULL,            -- メッセージ番号 (PKEY: 1001~:INFO, 2001~:WARN, 3001~:ERR)
    [admmsg_msg1]         NVARCHAR(100) NULL,             -- メッセージ１ (一行目)
    [admmsg_msg2]         NVARCHAR(100) NULL,             -- メッセージ２ (二行目)
    [admmsg_subsys_cd]    VARCHAR(2) NULL,                -- 基本使用サブシステムCD
    [admmsg_botan_kbn]    SMALLINT NOT NULL DEFAULT 1,    -- デフォルトボタン区分 (1:はい/ok, 2:いいえ)
    [admmsg_new_user]     VARCHAR(6) NULL,
    [admmsg_new_date]     DATETIME2 NULL,
    [admmsg_new_apid]     VARCHAR(7) NULL,
    [admmsg_new_wsnm]     VARCHAR(20) NULL,
    [admmsg_upd_user]     VARCHAR(6) NULL,
    [admmsg_upd_date]     DATETIME2 NULL,
    [admmsg_upd_apid]     VARCHAR(7) NULL,
    [admmsg_upd_wsnm]     VARCHAR(20) NULL,
    CONSTRAINT [PK_AD_M_MSG] PRIMARY KEY CLUSTERED ([admmsg_msgno])
);
GO

-- -----------------------------------------------------------------------------
-- 5. プログラムマスタ (AD_M_PROG_MAST) - PDF Page 6
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_PROG_MAST', 'U') IS NOT NULL DROP TABLE dbo.AD_M_PROG_MAST;
GO
CREATE TABLE dbo.AD_M_PROG_MAST (
    [admprg_subsys_cd]    VARCHAR(2) NOT NULL,            -- サブシステムCD (PKEY)
    [admprg_prog_id]      VARCHAR(7) NOT NULL,            -- プログラムID (PKEY)
    [admprg_gyo]          SMALLINT NOT NULL DEFAULT 0,    -- 表示行
    [admprg_prog_name]    NVARCHAR(50) NOT NULL,          -- プログラム名称
    [admprg_prog_opt]     NVARCHAR(30) NULL,              -- プログラム引数
    [admprg_prog_ver]     VARCHAR(10) NULL,               -- プログラムVer
    [admprg_max_cnt]      INT NOT NULL DEFAULT 0,         -- 最大件数
    [admprg_run_bad]      SMALLINT NOT NULL DEFAULT 0,    -- 起動不可フラグ (0:起動可, 1:不可)
    [admprg_new_user]     VARCHAR(6) NULL,
    [admprg_new_date]     DATETIME2 NULL,
    [admprg_new_apid]     VARCHAR(7) NULL,
    [admprg_new_wsnm]     VARCHAR(20) NULL,
    [admprg_upd_user]     VARCHAR(6) NULL,
    [admprg_upd_date]     DATETIME2 NULL,
    [admprg_upd_apid]     VARCHAR(7) NULL,
    [admprg_upd_wsnm]     VARCHAR(20) NULL,
    CONSTRAINT [PK_AD_M_PROG_MAST] PRIMARY KEY CLUSTERED ([admprg_subsys_cd], [admprg_prog_id])
);
GO

-- -----------------------------------------------------------------------------
-- 6. プログラム起動権限マスタ (AD_M_PROG_KIDO) - PDF Page 7
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_PROG_KIDO', 'U') IS NOT NULL DROP TABLE dbo.AD_M_PROG_KIDO;
GO
CREATE TABLE dbo.AD_M_PROG_KIDO (
    [admkid_usergrp_cd]   VARCHAR(4) NOT NULL,            -- ユーザーグループCD (PKEY)
    [admkid_subsys_cd]    VARCHAR(2) NOT NULL,            -- サブシステムCD (PKEY)
    [admkid_prog_id]      VARCHAR(7) NOT NULL,            -- プログラムID (PKEY)
    [admkid_new_user]     VARCHAR(6) NULL,
    [admkid_new_date]     DATETIME2 NULL,
    [admkid_new_apid]     VARCHAR(7) NULL,
    [admkid_new_wsnm]     VARCHAR(20) NULL,
    [admkid_upd_user]     VARCHAR(6) NULL,
    [admkid_upd_date]     DATETIME2 NULL,
    [admkid_upd_apid]     VARCHAR(7) NULL,
    [admkid_upd_wsnm]     VARCHAR(20) NULL,
    CONSTRAINT [PK_AD_M_PROG_KIDO] PRIMARY KEY CLUSTERED ([admkid_usergrp_cd], [admkid_subsys_cd], [admkid_prog_id])
);
GO

-- -----------------------------------------------------------------------------
-- 7. ユーザーマスタ (AD_M_USER) - PDF Page 8
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_USER', 'U') IS NOT NULL DROP TABLE dbo.AD_M_USER;
GO
CREATE TABLE dbo.AD_M_USER (
    [admuse_user_cd]        VARCHAR(6) NOT NULL,          -- ユーザーCD (PKEY)
    [admuse_user_name]      NVARCHAR(20) NOT NULL,        -- ユーザー名称
    [admuse_user_name_r]    NVARCHAR(10) NULL,            -- ユーザー略称
    [admuse_user_name_k]    NVARCHAR(10) NULL,            -- フリガナ
    [admuse_tanto_kbn]      SMALLINT NOT NULL DEFAULT 1,  -- 担当者区分 (1:担当者, 9:担当者以外)
    [admuse_usergrp_cd]     VARCHAR(4) NOT NULL DEFAULT '1', -- ユーザーグループCD
    [admuse_syubetu]        SMALLINT NOT NULL DEFAULT 1,  -- ユーザー種別 (1:営業, 5:工務, 9:経理)
    [admuse_biko]           NVARCHAR(40) NULL,            -- 備考
    [admuse_pass]           VARCHAR(255) NOT NULL,        -- 現在パスワード
    [admuse_pass_upd_date]  DATETIME2 NULL,               -- パスワード変更日
    [admuse_pass_kigen]     INT NULL,                     -- パスワード有効期限 (YYYYMMDD)
    [admuse_login_date]     DATETIME2 NULL,               -- 最終ログイン日時
    [admuse_run_apl_cnt]    SMALLINT NOT NULL DEFAULT 5,  -- 起動中APL数
    [admuse_user_kigen]     INT NULL,                     -- ユーザーID有効期限 (YYYYMMDD)
    [admuse_del_flg]        SMALLINT NOT NULL DEFAULT 0,  -- 削除フラグ (0:有効, 1:削除)
    [admuse_new_user]       VARCHAR(6) NULL,
    [admuse_new_date]       DATETIME2 NULL,
    [admuse_new_apid]       VARCHAR(7) NULL,
    [admuse_new_wsnm]       VARCHAR(20) NULL,
    [admuse_upd_user]       VARCHAR(6) NULL,
    [admuse_upd_date]       DATETIME2 NULL,
    [admuse_upd_apid]       VARCHAR(7) NULL,
    [admuse_upd_wsnm]       VARCHAR(20) NULL,
    CONSTRAINT [PK_AD_M_USER] PRIMARY KEY CLUSTERED ([admuse_user_cd])
);
GO

-- -----------------------------------------------------------------------------
-- 8. 月次日付マスタ (AD_M_GDATE) - PDF Page 9
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_GDATE', 'U') IS NOT NULL DROP TABLE dbo.AD_M_GDATE;
GO
CREATE TABLE dbo.AD_M_GDATE (
    [admgdt_yyyymm]       INT NOT NULL,                   -- 月次年月 (PKEY - YYYYMM)
    [admgdt_kosin_flg]    SMALLINT NOT NULL DEFAULT 0,    -- 更新FLG (0:未処理, 1:確定)
    [admgdt_new_user]     VARCHAR(6) NULL,
    [admgdt_new_date]     DATETIME2 NULL,
    [admgdt_new_apid]     VARCHAR(7) NULL,
    [admgdt_new_wsnm]     VARCHAR(20) NULL,
    [admgdt_upd_user]     VARCHAR(6) NULL,
    [admgdt_upd_date]     DATETIME2 NULL,
    [admgdt_upd_apid]     VARCHAR(7) NULL,
    [admgdt_upd_wsnm]     VARCHAR(20) NULL,
    CONSTRAINT [PK_AD_M_GDATE] PRIMARY KEY CLUSTERED ([admgdt_yyyymm])
);
GO

-- -----------------------------------------------------------------------------
-- 9. 権限コントロールマスタ (AD_M_KENGEN) - PDF Page 10
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_KENGEN', 'U') IS NOT NULL DROP TABLE dbo.AD_M_KENGEN;
GO
CREATE TABLE dbo.AD_M_KENGEN (
    [admken_syubetu]      SMALLINT NOT NULL,              -- ユーザー種別 (PKEY: 1:参照者, 5:担当者, 9:管理者)
    [admken_prog_id]      VARCHAR(7) NOT NULL,            -- プログラムID (PKEY)
    [admken_prog_renban]  SMALLINT NOT NULL DEFAULT 0,    -- プログラム連番 (PKEY: 00, 01~)
    [admken_pf1]          SMALLINT NOT NULL DEFAULT 1,    -- PF1 (0:無効, 1:有効)
    [admken_pf2]          SMALLINT NOT NULL DEFAULT 1,    -- PF2
    [admken_pf3]          SMALLINT NOT NULL DEFAULT 1,    -- PF3
    [admken_pf4]          SMALLINT NOT NULL DEFAULT 1,    -- PF4
    [admken_pf5]          SMALLINT NOT NULL DEFAULT 1,    -- PF5
    [admken_pf6]          SMALLINT NOT NULL DEFAULT 1,    -- PF6
    [admken_pf7]          SMALLINT NOT NULL DEFAULT 1,    -- PF7
    [admken_pf8]          SMALLINT NOT NULL DEFAULT 1,    -- PF8
    [admken_pf9]          SMALLINT NOT NULL DEFAULT 1,    -- PF9
    [admken_pf10]         SMALLINT NOT NULL DEFAULT 1,    -- PF10
    [admken_pf11]         SMALLINT NOT NULL DEFAULT 1,    -- PF11
    [admken_pf12]         SMALLINT NOT NULL DEFAULT 1,    -- PF12
    [admken_new_user]     VARCHAR(6) NULL,
    [admken_new_date]     DATETIME2 NULL,
    [admken_new_apid]     VARCHAR(7) NULL,
    [admken_new_wsnm]     VARCHAR(20) NULL,
    [admken_upd_user]     VARCHAR(6) NULL,
    [admken_upd_date]     DATETIME2 NULL,
    [admken_upd_apid]     VARCHAR(7) NULL,
    [admken_upd_wsnm]     VARCHAR(20) NULL,
    CONSTRAINT [PK_AD_M_KENGEN] PRIMARY KEY CLUSTERED ([admken_syubetu], [admken_prog_id], [admken_prog_renban])
);
GO

-- -----------------------------------------------------------------------------
-- 10. 受注先マスタ (AD_M_JYUCYU) - PDF Page 11
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_JYUCYU', 'U') IS NOT NULL DROP TABLE dbo.AD_M_JYUCYU;
GO
CREATE TABLE dbo.AD_M_JYUCYU (
    [admjyu_code]         INT NOT NULL,                   -- 受注先CD (PKEY)
    [admjyu_name]         NVARCHAR(40) NOT NULL,          -- 受注先名
    [admjyu_ryaku]        NVARCHAR(16) NULL,              -- 略称
    [admjyu_kana]         NVARCHAR(20) NULL,              -- ｶﾅ名
    [admjyu_sekinin]      NVARCHAR(30) NULL,              -- 責任者
    [admjyu_yubin]        VARCHAR(8) NULL,                -- 郵便番号
    [admjyu_jyusyo1]      NVARCHAR(40) NULL,              -- 住所1
    [admjyu_jyusyo2]      NVARCHAR(40) NULL,              -- 住所2
    [admjyu_tel]          VARCHAR(13) NULL,               -- TEL
    [admjyu_fax]          VARCHAR(13) NULL,               -- FAX
    [admjyu_mail]         VARCHAR(40) NULL,               -- ﾒｰﾙｱﾄﾞﾚｽ
    [admjyu_simedd]       INT NOT NULL DEFAULT 0,         -- 請求締日 (01から31)
    [admjyu_syukinmm]     INT NOT NULL DEFAULT 0,         -- 集金月 (0:当月, 1:次月)
    [admjyu_syukindd]     INT NOT NULL DEFAULT 0,         -- 集金日 (01から31)
    [admjyu_kaisyu]       NVARCHAR(20) NULL,              -- 回収方法
    [admjyu_tegata]       INT NOT NULL DEFAULT 0,         -- 手形割合
    [admjyu_genkin]       INT NOT NULL DEFAULT 0,         -- 現金割合
    [admjyu_kakert]       INT NOT NULL DEFAULT 100,       -- 掛率
    [admjyu_syosiki]      INT NOT NULL DEFAULT 1,         -- 請求書式 (1:専用, 2:自社, 9:なし)
    [admjyu_torikb]       INT NOT NULL DEFAULT 1,         -- 取引区分 (1:通常, 2:電子債権)
    [admjyu_biko1]        NVARCHAR(60) NULL,              -- 備考1
    [admjyu_biko2]        NVARCHAR(60) NULL,              -- 備考2
    [admjyu_biko3]        NVARCHAR(60) NULL,              -- 備考3
    [admjyu_new_user]     VARCHAR(6) NULL,                -- 初回作成者
    [admjyu_new_date]     DATETIME2 NULL,                 -- 初回作成日
    [admjyu_new_apid]     VARCHAR(7) NULL,                -- 初回作成APLID
    [admjyu_new_wsnm]     VARCHAR(20) NULL,               -- 初回作成端末名
    [admjyu_upd_user]     VARCHAR(6) NULL,                -- 最終更新者
    [admjyu_upd_date]     DATETIME2 NULL,                 -- 最終更新日
    [admjyu_upd_apid]     VARCHAR(7) NULL,                -- 最終更新APLID
    [admjyu_upd_wsnm]     VARCHAR(20) NULL,               -- 最終更新端末名
    CONSTRAINT [PK_AD_M_JYUCYU] PRIMARY KEY CLUSTERED ([admjyu_code])
);
GO

-- -----------------------------------------------------------------------------
-- 11. 仕入先マスタ (AD_M_SIIRE) - PDF Page 12
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AD_M_SIIRE', 'U') IS NOT NULL DROP TABLE dbo.AD_M_SIIRE;
GO
CREATE TABLE dbo.AD_M_SIIRE (
    [admsir_code]         INT NOT NULL,                   -- 仕入先CD (PKEY)
    [admsir_name]         NVARCHAR(40) NOT NULL,          -- 仕入先名
    [admsir_ryaku]        NVARCHAR(16) NULL,              -- 略称
    [admsir_kana]         NVARCHAR(20) NULL,              -- ｶﾅ名
    [admsir_sekinin]      NVARCHAR(30) NULL,              -- 責任者
    [admsir_gyousyu]      NVARCHAR(20) NULL,              -- 業種
    [admsir_yubin]        VARCHAR(8) NULL,                -- 郵便番号
    [admsir_jyusyo1]      NVARCHAR(40) NULL,              -- 住所1
    [admsir_jyusyo2]      NVARCHAR(40) NULL,              -- 住所2
    [admsir_tel]          VARCHAR(13) NULL,               -- TEL
    [admsir_fax]          VARCHAR(13) NULL,               -- FAX
    [admsir_mail]         VARCHAR(40) NULL,               -- ﾒｰﾙｱﾄﾞﾚｽ
    [admsir_simedd]       INT NOT NULL DEFAULT 0,         -- 支払締日 (01から31)
    [admsir_siharai]      NVARCHAR(40) NULL,              -- 支払方法
    [admsir_risoku]       DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- 利息 (%)
    [admsir_bnknm]        NVARCHAR(30) NULL,              -- 銀行名
    [admsir_stnnm]        NVARCHAR(30) NULL,              -- 支店名
    [admsir_kozasb]       SMALLINT NOT NULL DEFAULT 1,    -- 口座種別 (1:普通, 2:当座)
    [admsir_kozano]       VARCHAR(7) NULL,                -- 口座番号
    [admsir_kozanm]       NVARCHAR(30) NULL,              -- 口座名義人
    [admsir_biko1]        NVARCHAR(60) NULL,              -- 備考1
    [admsir_biko2]        NVARCHAR(60) NULL,              -- 備考2
    [admsir_biko3]        NVARCHAR(60) NULL,              -- 備考3
    [admsir_new_user]     VARCHAR(6) NULL,                -- 初回作成者
    [admsir_new_date]     DATETIME2 NULL,                 -- 初回作成日
    [admsir_new_apid]     VARCHAR(7) NULL,                -- 初回作成APLID
    [admsir_new_wsnm]     VARCHAR(20) NULL,               -- 初回作成端末名
    [admsir_upd_user]     VARCHAR(6) NULL,                -- 最終更新者
    [admsir_upd_date]     DATETIME2 NULL,                 -- 最終更新日
    [admsir_upd_apid]     VARCHAR(7) NULL,                -- 最終更新APLID
    [admsir_upd_wsnm]     VARCHAR(20) NULL,               -- 最終更新端末名
    CONSTRAINT [PK_AD_M_SIIRE] PRIMARY KEY CLUSTERED ([admsir_code])
);
GO


-- =============================================================================
-- 【データ部 (業務トランザクション)】ファイルレイアウト（データ）.pdf 準拠
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. 工事受注データ (GK_T_KOJIJYU) - PDF Page 2
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.GK_T_KOJIJYU', 'U') IS NOT NULL DROP TABLE dbo.GK_T_KOJIJYU;
GO
CREATE TABLE dbo.GK_T_KOJIJYU (
    [gktkjyu_unq_id]       BIGINT IDENTITY(1,1) NOT NULL,  -- ﾕﾆｰｸID (PKEY, 自動)
    [gktkjyu_kojicd]       INT NOT NULL,                   -- 工事コード (CKEY1)
    [gktkjyu_kojisyu]      INT NOT NULL DEFAULT 0,         -- 工事種目 (CKEY1)
    [gktkjyu_kojinm]       NVARCHAR(100) NOT NULL,         -- 工事名
    [gktkjyu_kojiryk]      NVARCHAR(40) NULL,              -- 工事略称
    [gktkjyu_kojikana]     NVARCHAR(30) NULL,              -- 工事カナ名
    [gktkjyu_sekkei]       NVARCHAR(40) NULL,              -- 設計者
    [gktkjyu_jyucd]        INT NOT NULL,                   -- 受注先
    [gktkjyu_keiyaku_gnk]  DECIMAL(13,0) NOT NULL DEFAULT 0, -- 契約額合計:税抜
    [gktkjyu_keiyaku_gkm]  DECIMAL(13,0) NOT NULL DEFAULT 0, -- 契約額合計:税込
    [gktkjyu_keiyaku_0dt]  INT NOT NULL DEFAULT 0,         -- 契約額当初:受注日 (YYYYMMDD)
    [gktkjyu_keiyaku_0rt]  INT NOT NULL DEFAULT 10,        -- 契約額当初:税率
    [gktkjyu_keiyaku_0nk]  DECIMAL(13,0) NOT NULL DEFAULT 0, -- 契約額当初:税抜
    [gktkjyu_keiyaku_0km]  DECIMAL(13,0) NOT NULL DEFAULT 0, -- 契約額当初:税込
    [gktkjyu_keiyaku_1dt]  INT NOT NULL DEFAULT 0,         -- 契約額変更１:変更日
    [gktkjyu_keiyaku_1rt]  INT NOT NULL DEFAULT 0,         -- 契約額変更１:税率
    [gktkjyu_keiyaku_1nk]  DECIMAL(13,0) NOT NULL DEFAULT 0, -- 契約額変更１:税抜
    [gktkjyu_keiyaku_1km]  DECIMAL(13,0) NOT NULL DEFAULT 0, -- 契約額変更１:税込
    [gktkjyu_keiyaku_2dt]  INT NOT NULL DEFAULT 0,         -- 契約額変更２:変更日
    [gktkjyu_keiyaku_2rt]  INT NOT NULL DEFAULT 0,         -- 契約額変更２:税率
    [gktkjyu_keiyaku_2nk]  DECIMAL(13,0) NOT NULL DEFAULT 0, -- 契約額変更２:税抜
    [gktkjyu_keiyaku_2km]  DECIMAL(13,0) NOT NULL DEFAULT 0, -- 契約額変更２:税込
    [gktkjyu_keiyaku_3dt]  INT NOT NULL DEFAULT 0,         -- 契約額変更３:変更日
    [gktkjyu_keiyaku_3rt]  INT NOT NULL DEFAULT 0,         -- 契約額変更３:税率
    [gktkjyu_keiyaku_3nk]  DECIMAL(13,0) NOT NULL DEFAULT 0, -- 契約額変更３:税抜
    [gktkjyu_keiyaku_3km]  DECIMAL(13,0) NOT NULL DEFAULT 0, -- 契約額変更３:税込
    [gktkjyu_yosangaku]    DECIMAL(13,0) NOT NULL DEFAULT 0, -- 予算金額
    [gktkjyu_yoteiarari]   DECIMAL(13,0) NOT NULL DEFAULT 0, -- 予定粗利
    [gktkjyu_kouki_bgn]    INT NOT NULL DEFAULT 0,         -- 工期開始日 (YYYYMMDD)
    [gktkjyu_kouki_end]    INT NOT NULL DEFAULT 0,         -- 工期終了日 (YYYYMMDD)
    [gktkjyu_basyo]        NVARCHAR(60) NULL,              -- 工事場所
    [gktkjyu_jimusho]      NVARCHAR(60) NULL,              -- 工事事務所
    [gktkjyu_eigyocd]      VARCHAR(6) NULL,                -- 営業担当 (AD_M_USER)
    [gktkjyu_genbacd]      VARCHAR(6) NULL,                -- 現場担当 (AD_M_USER)
    [gktkjyu_jyuryo]       INT NOT NULL DEFAULT 0,         -- 重量（ｔ）
    [gktkjyu_koumin]       INT NOT NULL DEFAULT 1,         -- 公民区分 (1:公共, 2:民間)
    [gktkjyu_keitai]       INT NOT NULL DEFAULT 1,         -- 請負形態 (1:自社, 2:外注)
    [gktkjyu_kanseikb]     INT NOT NULL DEFAULT 0,         -- 完成区分 (0:未成, 1:完成)
    [gktkjyu_kanseidt]     INT NOT NULL DEFAULT 0,         -- 完成日 (YYYYMMDD)
    [gktkjyu_endnyukin]    INT NOT NULL DEFAULT 0,         -- 最終入金日
    [gktkjyu_horyufg]      INT NOT NULL DEFAULT 0,         -- 保留フラグ (0:通常, 1:保留)
    [gktkjyu_biko1]        NVARCHAR(50) NULL,              -- 備考1
    [gktkjyu_biko2]        NVARCHAR(50) NULL,              -- 備考2
    [gktkjyu_kojibiko1]    NVARCHAR(100) NULL,             -- 工事備考1
    [gktkjyu_kojibiko2]    NVARCHAR(100) NULL,             -- 工事備考2
    [gktkjyu_delfg]        INT NOT NULL DEFAULT 0,         -- 削除フラグ (0:有効, 1:削除)
    [gktkjyu_new_user]     VARCHAR(6) NULL,
    [gktkjyu_new_date]     DATETIME2 NULL,
    [gktkjyu_new_apid]     VARCHAR(7) NULL,
    [gktkjyu_new_wsnm]     VARCHAR(20) NULL,
    [gktkjyu_upd_user]     VARCHAR(6) NULL,
    [gktkjyu_upd_date]     DATETIME2 NULL,
    [gktkjyu_upd_apid]     VARCHAR(7) NULL,
    [gktkjyu_upd_wsnm]     VARCHAR(20) NULL,
    CONSTRAINT [PK_GK_T_KOJIJYU] PRIMARY KEY CLUSTERED ([gktkjyu_unq_id]),
    CONSTRAINT [IX_GK_T_KOJIJYU_CKEY1] UNIQUE ([gktkjyu_kojicd], [gktkjyu_kojisyu])
);
GO

-- -----------------------------------------------------------------------------
-- 2. 工事予算データ (GK_T_KOJIYOS) - PDF Page 4
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.GK_T_KOJIYOS', 'U') IS NOT NULL DROP TABLE dbo.GK_T_KOJIYOS;
GO
CREATE TABLE dbo.GK_T_KOJIYOS (
    [gktkyos_unq_id]      BIGINT IDENTITY(1,1) NOT NULL,  -- ﾕﾆｰｸID (PKEY, 自動)
    [gktkyos_kojicd]      INT NOT NULL,                   -- 工事コード (CKEY1)
    [gktkyos_kojisyu]     INT NOT NULL DEFAULT 0,         -- 工事種目 (CKEY1)
    [gktkyos_yosasyu]     INT NOT NULL,                   -- 予算種目 (CKEY1)
    [gktkyos_siire]       INT NOT NULL,                   -- 仕入先 (CKEY1: AD_M_SIIRE)
    [gktkyos_yosangk]     DECIMAL(13,0) NOT NULL DEFAULT 0, -- 予算金額
    [gktkyos_jyouken]     INT NOT NULL DEFAULT 0,         -- 条件
    [gktkyos_biko]        NVARCHAR(40) NULL,              -- 備考
    [gktkyos_delfg]       INT NOT NULL DEFAULT 0,         -- 削除フラグ
    [gktkyos_new_user]    VARCHAR(6) NULL,
    [gktkyos_new_date]    DATETIME2 NULL,
    [gktkyos_new_apid]    VARCHAR(7) NULL,
    [gktkyos_new_wsnm]    VARCHAR(20) NULL,
    [gktkyos_upd_user]    VARCHAR(6) NULL,
    [gktkyos_upd_date]    DATETIME2 NULL,
    [gktkyos_upd_apid]    VARCHAR(7) NULL,
    [gktkyos_upd_wsnm]    VARCHAR(20) NULL,
    CONSTRAINT [PK_GK_T_KOJIYOS] PRIMARY KEY CLUSTERED ([gktkyos_unq_id])
);
GO
CREATE NONCLUSTERED INDEX [IX_GK_T_KOJIYOS_CKEY1] 
ON dbo.GK_T_KOJIYOS ([gktkyos_kojicd], [gktkyos_kojisyu], [gktkyos_yosasyu], [gktkyos_siire]);
GO

-- -----------------------------------------------------------------------------
-- 3. 売上データ (GK_T_URIAGE) - PDF Page 5
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.GK_T_URIAGE', 'U') IS NOT NULL DROP TABLE dbo.GK_T_URIAGE;
GO
CREATE TABLE dbo.GK_T_URIAGE (
    [gkturi_unq_id]       BIGINT IDENTITY(1,1) NOT NULL,  -- ﾕﾆｰｸID (PKEY, 自動)
    [gkturi_date]         INT NOT NULL,                   -- 売上年月 (CKEY1: YYYYMM)
    [gkturi_jyucyu]       INT NOT NULL,                   -- 受注先 (CKEY1: AD_M_JYUCYU)
    [gkturi_kojicd]       INT NOT NULL,                   -- 工事コード (CKEY2)
    [gkturi_kojisyu]      INT NOT NULL DEFAULT 0,         -- 工事種目 (CKEY2)
    [gkturi_uriagegk_nk]  DECIMAL(13,0) NOT NULL DEFAULT 0, -- 売上金額(税抜)
    [gkturi_zeirt]        INT NOT NULL DEFAULT 10,        -- 消費税率
    [gkturi_zeigk]        DECIMAL(13,0) NOT NULL DEFAULT 0, -- 消費税等額
    [gkturi_uriagegk_km]  DECIMAL(13,0) NOT NULL DEFAULT 0, -- 売上金額(税込)
    [gkturi_biko]         NVARCHAR(200) NULL,             -- 備考
    [gkturi_delfg]        INT NOT NULL DEFAULT 0,         -- 削除フラグ
    [gkturi_new_user]     VARCHAR(6) NULL,
    [gkturi_new_date]     DATETIME2 NULL,
    [gkturi_new_apid]     VARCHAR(7) NULL,
    [gkturi_new_wsnm]     VARCHAR(20) NULL,
    [gkturi_upd_user]     VARCHAR(6) NULL,
    [gkturi_upd_date]     DATETIME2 NULL,
    [gkturi_upd_apid]     VARCHAR(7) NULL,
    [gkturi_upd_wsnm]     VARCHAR(20) NULL,
    CONSTRAINT [PK_GK_T_URIAGE] PRIMARY KEY CLUSTERED ([gkturi_unq_id])
);
GO
CREATE NONCLUSTERED INDEX [IX_GK_T_URIAGE_CKEY1] ON dbo.GK_T_URIAGE ([gkturi_date], [gkturi_jyucyu]);
CREATE NONCLUSTERED INDEX [IX_GK_T_URIAGE_CKEY2] ON dbo.GK_T_URIAGE ([gkturi_kojicd], [gkturi_kojisyu]);
GO

-- -----------------------------------------------------------------------------
-- 4. 仕入データ (GK_T_SIIRE) - PDF Page 6
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.GK_T_SIIRE', 'U') IS NOT NULL DROP TABLE dbo.GK_T_SIIRE;
GO
CREATE TABLE dbo.GK_T_SIIRE (
    [gktsir_unq_id]       BIGINT IDENTITY(1,1) NOT NULL,  -- ﾕﾆｰｸID (PKEY, 自動)
    [gktsir_date]         INT NOT NULL,                   -- 仕入日 (CKEY1: YYYYMMDD)
    [gktsir_siire]        INT NOT NULL,                   -- 仕入先 (CKEY1: AD_M_SIIRE)
    [gktsir_kojicd]       INT NOT NULL,                   -- 工事コード (CKEY2)
    [gktsir_kojisyu]      INT NOT NULL DEFAULT 0,         -- 工事種目 (CKEY2)
    [gktsir_yosasyu]      INT NOT NULL,                   -- 予算種目
    [gktsir_aitekam]      INT NOT NULL DEFAULT 1,         -- 相手科目 (1:買掛金, 2:現金)
    [gktsir_siiregk_nk]   DECIMAL(13,0) NOT NULL DEFAULT 0, -- 仕入金額(税抜)
    [gktsir_zeirt]        INT NOT NULL DEFAULT 10,        -- 消費税率
    [gktsir_zeigk]        DECIMAL(13,0) NOT NULL DEFAULT 0, -- 消費税等額
    [gktsir_siiregk_km]   DECIMAL(13,0) NOT NULL DEFAULT 0, -- 仕入金額(税込)
    [gktsir_biko]         NVARCHAR(40) NULL,              -- 備考
    [gktsir_delfg]        INT NOT NULL DEFAULT 0,         -- 削除フラグ
    [gktsir_new_user]     VARCHAR(6) NULL,
    [gktsir_new_date]     DATETIME2 NULL,
    [gktsir_new_apid]     VARCHAR(7) NULL,
    [gktsir_new_wsnm]     VARCHAR(20) NULL,
    [gktsir_upd_user]     VARCHAR(6) NULL,
    [gktsir_upd_date]     DATETIME2 NULL,
    [gktsir_upd_apid]     VARCHAR(7) NULL,
    [gktsir_upd_wsnm]     VARCHAR(20) NULL,
    CONSTRAINT [PK_GK_T_SIIRE] PRIMARY KEY CLUSTERED ([gktsir_unq_id])
);
GO
CREATE NONCLUSTERED INDEX [IX_GK_T_SIIRE_CKEY1] ON dbo.GK_T_SIIRE ([gktsir_date], [gktsir_siire]);
CREATE NONCLUSTERED INDEX [IX_GK_T_SIIRE_CKEY2] ON dbo.GK_T_SIIRE ([gktsir_kojicd], [gktsir_kojisyu]);
GO

-- -----------------------------------------------------------------------------
-- 5. 工事仕掛データ (GK_T_KOJISIK) - PDF Page 7
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.GK_T_KOJISIK', 'U') IS NOT NULL DROP TABLE dbo.GK_T_KOJISIK;
GO
CREATE TABLE dbo.GK_T_KOJISIK (
    [gktksik_unq_id]      BIGINT IDENTITY(1,1) NOT NULL,  -- ﾕﾆｰｸID (PKEY, 自動)
    [gktksik_date]        INT NOT NULL,                   -- 対象年月 (CKEY1: YYYYMM)
    [gktksik_kojicd]      INT NOT NULL,                   -- 工事コード (CKEY2)
    [gktksik_hukakati]    DECIMAL(11,0) NOT NULL DEFAULT 0, -- 当月付加価値
    [gktksik_sikakari]    DECIMAL(11,0) NOT NULL DEFAULT 0, -- 当月仕掛金額
    [gktksik_delfg]       INT NOT NULL DEFAULT 0,         -- 削除フラグ
    [gktksik_new_user]    VARCHAR(6) NULL,
    [gktksik_new_date]    DATETIME2 NULL,
    [gktksik_new_apid]    VARCHAR(7) NULL,
    [gktksik_new_wsnm]    VARCHAR(20) NULL,
    [gktksik_upd_user]    VARCHAR(6) NULL,
    [gktksik_upd_date]    DATETIME2 NULL,
    [gktksik_upd_apid]    VARCHAR(7) NULL,
    [gktksik_upd_wsnm]    VARCHAR(20) NULL,
    CONSTRAINT [PK_GK_T_KOJISIK] PRIMARY KEY CLUSTERED ([gktksik_unq_id])
);
GO
CREATE NONCLUSTERED INDEX [IX_GK_T_KOJISIK_CKEY1] ON dbo.GK_T_KOJISIK ([gktksik_date], [gktksik_kojicd]);
GO


-- =============================================================================
-- 初期マスタデータ投入 (Seed Data)
-- =============================================================================

-- 受注先マスタ
INSERT INTO dbo.AD_M_JYUCYU (
    [admjyu_code], [admjyu_name], [admjyu_ryaku], [admjyu_yubin], [admjyu_jyusyo1], 
    [admjyu_tel], [admjyu_simedd], [admjyu_new_date], [admjyu_new_user], [admjyu_new_apid]
) VALUES
(1001, N'清水建設 株式会社', N'清水建設', '104-8370', N'東京都中央区京橋二丁目16番1号', '03-3561-1111', 20, GETDATE(), 'INIT', 'SEED'),
(1002, N'大林組 株式会社', N'大林組', '108-8502', N'東京都港区港南二丁目15番2号', '03-5769-1111', 0, GETDATE(), 'INIT', 'SEED'),
(1003, N'鹿島建設 株式会社', N'鹿島建設', '107-8388', N'東京都港区元赤坂一丁目3番1号', '03-5544-1111', 25, GETDATE(), 'INIT', 'SEED'),
(1004, N'大成建設 株式会社', N'大成建設', '163-0606', N'東京都新宿区西新宿一丁目25番1号', '03-3348-1111', 0, GETDATE(), 'INIT', 'SEED');
GO

-- 仕入先マスタ
INSERT INTO dbo.AD_M_SIIRE (
    [admsir_code], [admsir_name], [admsir_ryaku], [admsir_yubin], [admsir_jyusyo1], 
    [admsir_tel], [admsir_simedd], [admsir_new_date], [admsir_new_user], [admsir_new_apid]
) VALUES
(2001, N'阪和興業 株式会社', N'阪和興業', '104-8429', N'東京都中央区築地一丁目13番1号', '03-3544-2171', 20, GETDATE(), 'INIT', 'SEED'),
(2002, N'ミツヒデ 第一工場 (加工外注)', N'ミツヒデ第1工', '136-0082', N'東京都江東区新木場三丁目4番5号', '03-3522-8811', 0, GETDATE(), 'INIT', 'SEED'),
(2003, N'日本非破壊検査 株式会社', N'非破壊検査', '550-0014', N'大阪府大阪市西区北堀江一丁目18番14号', '06-6532-6111', 0, GETDATE(), 'INIT', 'SEED'),
(2004, N'朝日防錆塗装 工業株式会社', N'朝日防錆', '230-0045', N'神奈川県横浜市鶴見区末広町二丁目1番', '045-501-3321', 25, GETDATE(), 'INIT', 'SEED'),
(2005, N'丸全昭和運輸 株式会社', N'丸全昭和運輸', '231-8419', N'神奈川県横浜市中区南仲通二丁目15番地', '045-671-5811', 20, GETDATE(), 'INIT', 'SEED'),
(2006, N'東京重機 株式会社', N'東京重機', '140-0002', N'東京都品川区東品川三丁目10番21号', '03-3472-9111', 0, GETDATE(), 'INIT', 'SEED');
GO

-- ユーザーグループマスタ
INSERT INTO dbo.AD_M_USER_GRP (
    [admgrp_usergrp_cd], [admgrp_usergrp_name], [admgrp_run_apl_cnt], [admgrp_new_date], [admgrp_new_user], [admgrp_new_apid]
) VALUES
('1', N'一般グループ', 5, GETDATE(), 'INIT', 'SEED'),
('9', N'システム管理者グループ', 10, GETDATE(), 'INIT', 'SEED');
GO

-- ユーザーマスタ
INSERT INTO dbo.AD_M_USER (
    [admuse_user_cd], [admuse_user_name], [admuse_user_name_r], [admuse_user_name_k], 
    [admuse_tanto_kbn], [admuse_usergrp_cd], [admuse_syubetu], [admuse_biko], 
    [admuse_pass], [admuse_pass_upd_date], [admuse_new_date], [admuse_new_user], [admuse_new_apid]
) VALUES
('000001', N'酒井 太郎', N'酒井', N'サカイ タロウ', 1, '9', 1, N'システム管理者 / 営業統括', 'admin123', GETDATE(), GETDATE(), 'INIT', 'SEED'),
('000002', N'佐藤 次郎', N'佐藤', N'サトウ ジロウ', 1, '1', 5, N'現場工事主任', 'user123', GETDATE(), GETDATE(), 'INIT', 'SEED'),
('000003', N'鈴木 花子', N'鈴木', N'スズキ ハナコ', 9, '1', 9, N'経理・決算担当', 'user123', GETDATE(), GETDATE(), 'INIT', 'SEED');
GO

-- 月次日付マスタ
INSERT INTO dbo.AD_M_GDATE ([admgdt_yyyymm], [admgdt_kosin_flg], [admgdt_new_date], [admgdt_new_user], [admgdt_new_apid])
VALUES
(202611, 0, GETDATE(), 'INIT', 'SEED');
GO

-- システム名称マスタ (AD_M_NAME)
INSERT INTO dbo.AD_M_NAME (
    [admnam_name_kbn], [admnam_name_cd], [admnam_ch1], [admnam_ch2], [admnam_nm1], 
    [admnam_new_date], [admnam_new_user], [admnam_new_apid]
) VALUES
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

-- 処理基準管理マスタ (AD_M_CONTROL)
INSERT INTO dbo.AD_M_CONTROL (
    [admcon_subsys_cd], [admcon_prog_id], [admcon_kanri_name], [admcon_nm1], [admcon_nm2], [admcon_ch1], 
    [admcon_new_date], [admcon_new_user], [admcon_new_apid]
) VALUES
('GK', 'GK0010', N'工事番号採番体系', 2026, 4, N'年度(4桁)＋連番(4桁)', GETDATE(), 'INIT', 'SEED'),
('GK', 'GK0020', N'実行予算承認基準額', 50000000, 1, N'5千万円以上役員承認', GETDATE(), 'INIT', 'SEED'),
('UR', 'UR0010', N'売上消費税端数処理', 1, 10, N'四捨五入 (1:切捨, 2:四捨五入, 3:切上)', GETDATE(), 'INIT', 'SEED'),
('SR', 'SR0010', N'仕入消費税端数処理', 1, 10, N'切捨て', GETDATE(), 'INIT', 'SEED'),
('VM', 'VM0010', N'月次更新締日基準', 99, 0, N'当月末日一括更新', GETDATE(), 'INIT', 'SEED'),
('AD', 'AD0000', N'システム標準消費税率', 10, 8, N'標準税率10% / 軽減税率8%', GETDATE(), 'INIT', 'SEED');
GO

-- サンプル工事受注データ (新社屋新築工事)
INSERT INTO dbo.GK_T_KOJIJYU (
    [gktkjyu_kojicd], [gktkjyu_kojisyu], [gktkjyu_kojinm], [gktkjyu_kojiryk], [gktkjyu_jyucd],
    [gktkjyu_basyo], [gktkjyu_jimusho], [gktkjyu_kouki_bgn], [gktkjyu_kouki_end], 
    [gktkjyu_keiyaku_gnk], [gktkjyu_keiyaku_gkm], [gktkjyu_keiyaku_0dt], [gktkjyu_keiyaku_0rt], [gktkjyu_keiyaku_0nk], [gktkjyu_keiyaku_0km],
    [gktkjyu_yosangaku], [gktkjyu_kanseikb], [gktkjyu_biko1], [gktkjyu_new_date], [gktkjyu_new_user], [gktkjyu_new_apid]
) VALUES (
    1001, 0, N'新社屋新築工事 (鉄骨工事一式)', N'新社屋新築', 1001,
    N'東京都中央区京橋PJ現場', N'東京都中央区京橋二丁目', 20260401, 20261130,
    45000000, 49500000, 20260401, 10, 45000000, 49500000,
    35200000, 0, N'S造5階建 柱・梁・ブレース製作建方工事一式', GETDATE(), 'INIT', 'SEED'
);
GO

-- サンプル実行予算明細
INSERT INTO dbo.GK_T_KOJIYOS (
    [gktkyos_kojicd], [gktkyos_kojisyu], [gktkyos_yosasyu], [gktkyos_siire], 
    [gktkyos_yosangk], [gktkyos_biko], [gktkyos_new_date], [gktkyos_new_user], [gktkyos_new_apid]
) VALUES
(1001, 0, 101, 2001, 16500000, N'H形鋼 SM490A, コラム BCR295', GETDATE(), 'INIT', 'SEED'),
(1001, 0, 102, 2002, 4200000,  N'開先加工・バンドソー切断', GETDATE(), 'INIT', 'SEED'),
(1001, 0, 103, 2002, 5800000,  N'工場鍛冶組立・コア組み立て', GETDATE(), 'INIT', 'SEED'),
(1001, 0, 104, 2003, 2500000,  N'柱梁完全溶け込み溶接・UT超音波探傷試験', GETDATE(), 'INIT', 'SEED'),
(1001, 0, 105, 2004, 2800000,  N'錆止め塗装・耐火塗装仕様', GETDATE(), 'INIT', 'SEED'),
(1001, 0, 106, 2005, 1400000,  N'夜間運搬・トレーラー配送一式', GETDATE(), 'INIT', 'SEED'),
(1001, 0, 107, 2006, 2000000,  N'ラフタークレーン25t / 現場建方合図', GETDATE(), 'INIT', 'SEED');
GO
