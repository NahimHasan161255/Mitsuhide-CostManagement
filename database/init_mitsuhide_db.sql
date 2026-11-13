-- =============================================================================
-- 株式会社ミツヒデ (Mitsuhide Co., Ltd.)
-- 原価管理システム (Cost Management ERP System)
-- Database Initialization & Schema Script (MySQL 8.0+)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `mitsuhide_cost_db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `mitsuhide_cost_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. 受注先マスタ (AD_M_JYUCYU)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `AD_M_JYUCYU`;
CREATE TABLE `AD_M_JYUCYU` (
    `admjyu_code`      INT NOT NULL COMMENT '受注先コード (PKEY)',
    `admjyu_name`      VARCHAR(80) NOT NULL COMMENT '受注先名称',
    `admjyu_ryakusiki` VARCHAR(40) NULL COMMENT '受注先略称',
    `admjyu_zip`       VARCHAR(10) NULL COMMENT '郵便番号',
    `admjyu_addr1`     VARCHAR(80) NULL COMMENT '住所1',
    `admjyu_addr2`     VARCHAR(80) NULL COMMENT '住所2',
    `admjyu_tel`       VARCHAR(20) NULL COMMENT '電話番号',
    `admjyu_fax`       VARCHAR(20) NULL COMMENT 'FAX番号',
    `admjyu_tantou`    VARCHAR(40) NULL COMMENT '担当者名',
    `admjyu_simedate`  INT NOT NULL DEFAULT 0 COMMENT '締日 (0:月末, 20:20日締等)',
    `NewUser`          VARCHAR(6) NULL COMMENT '作成者',
    `NewDate`          DATETIME NULL COMMENT '作成日時',
    `NewApid`          VARCHAR(7) NULL COMMENT '作成APID',
    `NewWsnm`          VARCHAR(20) NULL COMMENT '作成端末',
    `UpdUser`          VARCHAR(6) NULL COMMENT '更新者',
    `UpdDate`          DATETIME NULL COMMENT '更新日時',
    `UpdApid`          VARCHAR(7) NULL COMMENT '更新APID',
    `UpdWsnm`          VARCHAR(20) NULL COMMENT '更新端末',
    `DelFg`            INT NOT NULL DEFAULT 0 COMMENT '削除フラグ',
    PRIMARY KEY (`admjyu_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='受注先マスタ';

-- -----------------------------------------------------------------------------
-- 2. 仕入先マスタ (AD_M_SIIRE)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `AD_M_SIIRE`;
CREATE TABLE `AD_M_SIIRE` (
    `admsir_code`      INT NOT NULL COMMENT '仕入先コード (PKEY)',
    `admsir_name`      VARCHAR(80) NOT NULL COMMENT '仕入先名称',
    `admsir_ryakusiki` VARCHAR(40) NULL COMMENT '仕入先略称',
    `admsir_zip`       VARCHAR(10) NULL COMMENT '郵便番号',
    `admsir_addr1`     VARCHAR(80) NULL COMMENT '住所1',
    `admsir_addr2`     VARCHAR(80) NULL COMMENT '住所2',
    `admsir_tel`       VARCHAR(20) NULL COMMENT '電話番号',
    `admsir_fax`       VARCHAR(20) NULL COMMENT 'FAX番号',
    `admsir_tantou`    VARCHAR(40) NULL COMMENT '担当者名',
    `admsir_simedate`  INT NOT NULL DEFAULT 0 COMMENT '締日',
    `NewUser`          VARCHAR(6) NULL,
    `NewDate`          DATETIME NULL,
    `NewApid`          VARCHAR(7) NULL,
    `NewWsnm`          VARCHAR(20) NULL,
    `UpdUser`          VARCHAR(6) NULL,
    `UpdDate`          DATETIME NULL,
    `UpdApid`          VARCHAR(7) NULL,
    `UpdWsnm`          VARCHAR(20) NULL,
    `DelFg`            INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`admsir_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仕入先マスタ';

-- -----------------------------------------------------------------------------
-- 3. ユーザーマスタ (AD_M_USER)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `AD_M_USER`;
CREATE TABLE `AD_M_USER` (
    `admusr_code`      VARCHAR(6) NOT NULL COMMENT '社員コード (PKEY)',
    `admusr_name`      VARCHAR(40) NOT NULL COMMENT 'ユーザー氏名',
    `admusr_kana`      VARCHAR(40) NULL COMMENT 'ユーザーカナ',
    `admusr_passwd`    VARCHAR(128) NOT NULL COMMENT 'パスワードハッシュ',
    `admusr_grpcd`     INT NOT NULL DEFAULT 1 COMMENT '所属グループ',
    `NewUser`          VARCHAR(6) NULL,
    `NewDate`          DATETIME NULL,
    `NewApid`          VARCHAR(7) NULL,
    `NewWsnm`          VARCHAR(20) NULL,
    `UpdUser`          VARCHAR(6) NULL,
    `UpdDate`          DATETIME NULL,
    `UpdApid`          VARCHAR(7) NULL,
    `UpdWsnm`          VARCHAR(20) NULL,
    `DelFg`            INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`admusr_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ユーザーマスタ';

-- -----------------------------------------------------------------------------
-- 4. 処理基準管理マスタ (AD_M_GDATE)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `AD_M_GDATE`;
CREATE TABLE `AD_M_GDATE` (
    `admgdt_yyyymm`    INT NOT NULL COMMENT '処理基準年月 (PKEY - YYYYMM)',
    `admgdt_kosin_flg` INT NOT NULL DEFAULT 0 COMMENT '更新完了フラグ (0:未更新/受付中, 1:更新済/締切)',
    `NewUser`          VARCHAR(6) NULL,
    `NewDate`          DATETIME NULL,
    `NewApid`          VARCHAR(7) NULL,
    `NewWsnm`          VARCHAR(20) NULL,
    `UpdUser`          VARCHAR(6) NULL,
    `UpdDate`          DATETIME NULL,
    `UpdApid`          VARCHAR(7) NULL,
    `UpdWsnm`          VARCHAR(20) NULL,
    `DelFg`            INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`admgdt_yyyymm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='処理基準管理マスタ';

-- -----------------------------------------------------------------------------
-- 5. 工事受注データ (GK_T_KOJIJYU)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `GK_T_KOJIJYU`;
CREATE TABLE `GK_T_KOJIJYU` (
    `gktkjy_unq_id`     BIGINT NOT NULL AUTO_INCREMENT COMMENT 'サロゲートキー (PKEY)',
    `gktkjy_kojicd`     INT NOT NULL COMMENT '工事コード (CKEY1)',
    `gktkjy_kojisyu`    INT NOT NULL DEFAULT 0 COMMENT '工事種目 (CKEY1)',
    `gktkjy_jyucd`      INT NOT NULL COMMENT '受注先コード (AD_M_JYUCYU)',
    `gktkjy_kojinm`     VARCHAR(80) NOT NULL COMMENT '工事名称',
    `gktkjy_kojiryk`    VARCHAR(40) NULL COMMENT '工事略称',
    `gktkjy_genbanm`    VARCHAR(80) NULL COMMENT '現場名称',
    `gktkjy_genbajy`    VARCHAR(80) NULL COMMENT '現場住所',
    `gktkjy_koukibgn`   INT NOT NULL DEFAULT 0 COMMENT '工期開始日 (YYYYMMDD)',
    `gktkjy_koukiend`   INT NOT NULL DEFAULT 0 COMMENT '工期完成日 (YYYYMMDD)',
    `gktkjy_keiyakugnk` DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '契約額(税抜)',
    `gktkjy_zeirt`      INT NOT NULL DEFAULT 10 COMMENT '消費税率(%)',
    `gktkjy_zeigk`      DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '消費税額',
    `gktkjy_keiyakugkm` DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '契約額(税込)',
    `gktkjy_yosangaku`  DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '実行予算額',
    `gktkjy_kanseikb`   INT NOT NULL DEFAULT 0 COMMENT '完成区分 (0:未成, 1:完成)',
    `gktkjy_biko`       VARCHAR(200) NULL COMMENT '備考',
    `NewUser`           VARCHAR(6) NULL,
    `NewDate`           DATETIME NULL,
    `NewApid`           VARCHAR(7) NULL,
    `NewWsnm`           VARCHAR(20) NULL,
    `UpdUser`           VARCHAR(6) NULL,
    `UpdDate`           DATETIME NULL,
    `UpdApid`           VARCHAR(7) NULL,
    `UpdWsnm`           VARCHAR(20) NULL,
    `DelFg`             INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`gktkjy_unq_id`),
    UNIQUE KEY `IX_GK_T_KOJIJYU_CKEY1` (`gktkjy_kojicd`, `gktkjy_kojisyu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工事受注データ';

-- -----------------------------------------------------------------------------
-- 6. 工事予算データ (GK_T_KOJIYOS)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `GK_T_KOJIYOS`;
CREATE TABLE `GK_T_KOJIYOS` (
    `gktkys_unq_id`     BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PKEY',
    `gktkys_kojicd`     INT NOT NULL COMMENT '工事コード (CKEY1)',
    `gktkys_kojisyu`    INT NOT NULL DEFAULT 0 COMMENT '工事種目 (CKEY1)',
    `gktkys_yosasyu`    INT NOT NULL COMMENT '予算種目 (CKEY1)',
    `gktkys_siirecd`    INT NOT NULL COMMENT '指定仕入先 (CKEY1)',
    `gktkys_yosangk`    DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '実行予算額',
    `gktkys_hassyugk`   DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '発注済額',
    `gktkys_biko`       VARCHAR(100) NULL COMMENT '備考',
    `NewUser`           VARCHAR(6) NULL,
    `NewDate`           DATETIME NULL,
    `NewApid`           VARCHAR(7) NULL,
    `NewWsnm`           VARCHAR(20) NULL,
    `UpdUser`           VARCHAR(6) NULL,
    `UpdDate`           DATETIME NULL,
    `UpdApid`           VARCHAR(7) NULL,
    `UpdWsnm`           VARCHAR(20) NULL,
    `DelFg`             INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`gktkys_unq_id`),
    KEY `IX_GK_T_KOJIYOS_CKEY1` (`gktkys_kojicd`, `gktkys_kojisyu`, `gktkys_yosasyu`, `gktkys_siirecd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工事予算データ';

-- -----------------------------------------------------------------------------
-- 7. 仕入データ (GK_T_SIIRE)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `GK_T_SIIRE`;
CREATE TABLE `GK_T_SIIRE` (
    `gktsir_unq_id`     BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PKEY',
    `gktsir_date`       INT NOT NULL COMMENT '仕入発生日 (YYYYMMDD)',
    `gktsir_siire`      INT NOT NULL COMMENT '仕入先コード (AD_M_SIIRE)',
    `gktsir_kojicd`     INT NOT NULL COMMENT '工事コード',
    `gktsir_kojisyu`    INT NOT NULL DEFAULT 0 COMMENT '工事種目',
    `gktsir_yosasyu`    INT NOT NULL COMMENT '予算種目',
    `gktsir_aitekam`    INT NOT NULL DEFAULT 1 COMMENT '相手科目 (1:買掛金, 2:現金)',
    `gktsir_siiregk_nk` DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '仕入額(税抜)',
    `gktsir_zeirt`      INT NOT NULL DEFAULT 10 COMMENT '消費税率(%)',
    `gktsir_zeigk`      DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '消費税額',
    `gktsir_siiregk_km` DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '仕入額(税込)',
    `gktsir_biko`       VARCHAR(200) NULL COMMENT '備考',
    `NewUser`           VARCHAR(6) NULL,
    `NewDate`           DATETIME NULL,
    `NewApid`           VARCHAR(7) NULL,
    `NewWsnm`           VARCHAR(20) NULL,
    `UpdUser`           VARCHAR(6) NULL,
    `UpdDate`           DATETIME NULL,
    `UpdApid`           VARCHAR(7) NULL,
    `UpdWsnm`           VARCHAR(20) NULL,
    `DelFg`             INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`gktsir_unq_id`),
    KEY `IX_GK_T_SIIRE_CKEY1` (`gktsir_date`, `gktsir_siire`),
    KEY `IX_GK_T_SIIRE_CKEY2` (`gktsir_kojicd`, `gktsir_kojisyu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仕入データ';

-- -----------------------------------------------------------------------------
-- 8. 売上データ (GK_T_URIAGE)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `GK_T_URIAGE`;
CREATE TABLE `GK_T_URIAGE` (
    `gkturi_unq_id`      BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PKEY',
    `gkturi_date`        INT NOT NULL COMMENT '売上年月 (YYYYMM)',
    `gkturi_jyucyu`      INT NOT NULL COMMENT '受注先コード (AD_M_JYUCYU)',
    `gkturi_kojicd`      INT NOT NULL COMMENT '工事コード',
    `gkturi_kojisyu`     INT NOT NULL DEFAULT 0 COMMENT '工事種目',
    `gkturi_uriagegk_nk` DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '売上額(税抜)',
    `gkturi_zeirt`       INT NOT NULL DEFAULT 10 COMMENT '消費税率(%)',
    `gkturi_zeigk`       DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '消費税額',
    `gkturi_uriagegk_km` DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '売上額(税込)',
    `gkturi_biko`        VARCHAR(200) NULL COMMENT '備考',
    `NewUser`            VARCHAR(6) NULL,
    `NewDate`            DATETIME NULL,
    `NewApid`            VARCHAR(7) NULL,
    `NewWsnm`            VARCHAR(20) NULL,
    `UpdUser`            VARCHAR(6) NULL,
    `UpdDate`            DATETIME NULL,
    `UpdApid`            VARCHAR(7) NULL,
    `UpdWsnm`            VARCHAR(20) NULL,
    `DelFg`              INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`gkturi_unq_id`),
    KEY `IX_GK_T_URIAGE_CKEY1` (`gkturi_date`, `gkturi_jyucyu`),
    KEY `IX_GK_T_URIAGE_CKEY2` (`gkturi_kojicd`, `gkturi_kojisyu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='売上データ';

-- -----------------------------------------------------------------------------
-- 9. 工事仕掛データ (GK_T_KOJISIK - Work In Progress)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `GK_T_KOJISIK`;
CREATE TABLE `GK_T_KOJISIK` (
    `gktksik_unq_id`   BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PKEY',
    `gktksik_date`     INT NOT NULL COMMENT '対象年月 (YYYYMM)',
    `gktksik_kojicd`   INT NOT NULL COMMENT '工事コード',
    `gktksik_hukakati` DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '当月付加価値',
    `gktksik_sikakari` DECIMAL(13,0) NOT NULL DEFAULT 0 COMMENT '当月仕掛金額',
    `NewUser`          VARCHAR(6) NULL,
    `NewDate`          DATETIME NULL,
    `NewApid`          VARCHAR(7) NULL,
    `NewWsnm`          VARCHAR(20) NULL,
    `UpdUser`          VARCHAR(6) NULL,
    `UpdDate`          DATETIME NULL,
    `UpdApid`          VARCHAR(7) NULL,
    `UpdWsnm`          VARCHAR(20) NULL,
    `DelFg`            INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`gktksik_unq_id`),
    KEY `IX_GK_T_KOJISIK_CKEY1` (`gktksik_date`, `gktksik_kojicd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工事仕掛データ';

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 初期マスタデータ投入 (Seed Data)
-- =============================================================================

-- 受注先マスタ
INSERT INTO `AD_M_JYUCYU` (`admjyu_code`, `admjyu_name`, `admjyu_ryakusiki`, `admjyu_zip`, `admjyu_addr1`, `admjyu_tel`, `admjyu_simedate`, `NewDate`, `NewUser`, `NewApid`)
VALUES
(1001, '清水建設 株式会社', '清水建設', '104-8370', '東京都中央区京橋二丁目16番1号', '03-3561-1111', 20, NOW(), 'INIT', 'SEED'),
(1002, '大林組 株式会社', '大林組', '108-8502', '東京都港区港南二丁目15番2号', '03-5769-1111', 0, NOW(), 'INIT', 'SEED'),
(1003, '鹿島建設 株式会社', '鹿島建設', '107-8388', '東京都港区元赤坂一丁目3番1号', '03-5544-1111', 25, NOW(), 'INIT', 'SEED'),
(1004, '大成建設 株式会社', '大成建設', '163-0606', '東京都新宿区西新宿一丁目25番1号', '03-3348-1111', 0, NOW(), 'INIT', 'SEED');

-- 仕入先マスタ
INSERT INTO `AD_M_SIIRE` (`admsir_code`, `admsir_name`, `admsir_ryakusiki`, `admsir_zip`, `admsir_addr1`, `admsir_tel`, `admsir_simedate`, `NewDate`, `NewUser`, `NewApid`)
VALUES
(2001, '阪和興業 株式会社', '阪和興業', '104-8429', '東京都中央区築地一丁目13番1号', '03-3544-2171', 20, NOW(), 'INIT', 'SEED'),
(2002, 'ミツヒデ 第一工場 (加工外注)', 'ミツヒデ第1工', '136-0082', '東京都江東区新木場三丁目4番5号', '03-3522-8811', 0, NOW(), 'INIT', 'SEED'),
(2003, '日本非破壊検査 株式会社', '非破壊検査', '550-0014', '大阪府大阪市西区北堀江一丁目18番14号', '06-6532-6111', 0, NOW(), 'INIT', 'SEED'),
(2004, '朝日防錆塗装 工業株式会社', '朝日防錆', '230-0045', '神奈川県横浜市鶴見区末広町二丁目1番', '045-501-3321', 25, NOW(), 'INIT', 'SEED'),
(2005, '丸全昭和運輸 株式会社', '丸全昭和運輸', '231-8419', '神奈川県横浜市中区南仲通二丁目15番地', '045-671-5811', 20, NOW(), 'INIT', 'SEED'),
(2006, '東京重機 株式会社', '東京重機', '140-0002', '東京都品川区東品川三丁目10番21号', '03-3472-9111', 0, NOW(), 'INIT', 'SEED');

-- ユーザーマスタ
INSERT INTO `AD_M_USER` (`admusr_code`, `admusr_name`, `admusr_kana`, `admusr_passwd`, `admusr_grpcd`, `NewDate`, `NewUser`, `NewApid`)
VALUES
('000001', '酒井 太郎', 'サカイ タロウ', 'admin123', 1, NOW(), 'INIT', 'SEED'),
('000002', '佐藤 次郎', 'サトウ ジロウ', 'user123', 2, NOW(), 'INIT', 'SEED');

-- 処理基準管理マスタ
INSERT INTO `AD_M_GDATE` (`admgdt_yyyymm`, `admgdt_kosin_flg`, `NewDate`, `NewUser`, `NewApid`)
VALUES
(202611, 0, NOW(), 'INIT', 'SEED');

-- サンプル工事受注データ (新社屋新築工事)
INSERT INTO `GK_T_KOJIJYU` (
    `gktkjy_kojicd`, `gktkjy_kojisyu`, `gktkjy_jyucd`, `gktkjy_kojinm`, `gktkjy_kojiryk`, 
    `gktkjy_genbanm`, `gktkjy_genbajy`, `gktkjy_koukibgn`, `gktkjy_koukiend`, 
    `gktkjy_keiyakugnk`, `gktkjy_zeirt`, `gktkjy_zeigk`, `gktkjy_keiyakugkm`, 
    `gktkjy_yosangaku`, `gktkjy_kanseikb`, `gktkjy_biko`, `NewDate`, `NewUser`, `NewApid`
) VALUES (
    1001, 0, 1001, '新社屋新築工事 (鉄骨工事一式)', '新社屋新築',
    '東京都中央区京橋PJ現場', '東京都中央区京橋二丁目', 20260401, 20261130,
    45000000, 10, 4500000, 49500000,
    35200000, 0, 'S造5階建 柱・梁・ブレース製作建方工事一式', NOW(), 'INIT', 'SEED'
);

-- サンプル実行予算明細
INSERT INTO `GK_T_KOJIYOS` (`gktkys_kojicd`, `gktkys_kojisyu`, `gktkys_yosasyu`, `gktkys_siirecd`, `gktkys_yosangk`, `gktkys_hassyugk`, `gktkys_biko`, `NewDate`, `NewUser`, `NewApid`)
VALUES
(1001, 0, 101, 2001, 16500000, 15000000, 'H形鋼 SM490A, コラム BCR295', NOW(), 'INIT', 'SEED'),
(1001, 0, 102, 2002, 4200000,  4000000,  '開先加工・バンドソー切断', NOW(), 'INIT', 'SEED'),
(1001, 0, 103, 2002, 5800000,  5500000,  '工場鍛冶組立・コア組み立て', NOW(), 'INIT', 'SEED'),
(1001, 0, 104, 2003, 2500000,  2200000,  '柱梁完全溶け込み溶接・UT超音波探傷試験', NOW(), 'INIT', 'SEED'),
(1001, 0, 105, 2004, 2800000,  2500000,  '錆止め塗装・耐火塗装仕様', NOW(), 'INIT', 'SEED'),
(1001, 0, 106, 2005, 1400000,  1200000,  '夜間運搬・トレーラー配送一式', NOW(), 'INIT', 'SEED'),
(1001, 0, 107, 2006, 2000000,  1800000,  'ラフタークレーン25t / 現場建方合図', NOW(), 'INIT', 'SEED');
