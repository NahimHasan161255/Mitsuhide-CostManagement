USE [mitsuhide_cost_db];
GO

SET NOCOUNT ON;

-- ============================================================================
-- 1. SEED 受注先マスタ (AD_M_JYUCYU) -> 1006 to 1020 (Total 20 Records)
-- ============================================================================
PRINT N'Seeding AD_M_JYUCYU records 1006 to 1020...';

MERGE INTO [AD_M_JYUCYU] AS target
USING (VALUES
(1006, N'株式会社 竹中工務店', N'竹中工務店', N'タケナカコウムテン', N'竹中 康夫', N'541-0053', N'大阪府大阪市中央区本町4-1-13', N'竹中ビル', N'06-6252-1201', N'06-6252-1209', N'takenaka@example.com', 20, 1, 31, N'振込', 0, 100, 100, 1, 1, N'御堂筋プロジェクト', N'特注鉄骨梁先行発注', N'安全管理優良認定', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1007, N'前田建設工業 株式会社', N'前田建設', N'マエダケンセツ', N'前田 栄一', N'102-8151', N'東京都千代田区富士見2-10-2', N'飯田橋グラン・ブルーム', N'03-5276-5151', N'03-5276-5160', N'maeda@example.com', 31, 1, 20, N'手形・振込', 30, 70, 100, 1, 1, N'トンネル・橋梁工事', N'指定請求書必須', N'本社経理部直送', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1008, N'五洋建設 株式会社', N'五洋建設', N'ゴヨウケンセツ', N'清水 浩司', N'112-8576', N'東京都文京区後楽2-2-8', N'五洋建設ビル', N'03-3816-7111', N'03-3816-7120', N'goyo@example.com', 25, 1, 10, N'振込', 0, 100, 100, 1, 1, N'臨海部基礎工事', N'海上輸送調整要', N'支払明細送付要', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1009, N'戸田建設 株式会社', N'戸田建設', N'トダケンセツ', N'戸田 守', N'104-8388', N'東京都中央区京橋1-7-1', N'TODA BUILDING', N'03-3535-1357', N'03-3535-1360', N'toda@example.com', 31, 1, 31, N'振込', 0, 100, 100, 1, 1, N'高層複合ビル案件', N'品質管理記録毎月提出', N'指定検査員巡回', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1010, N'西松建設 株式会社', N'西松建設', N'ニシマツケンセツ', N'西松 一男', N'105-6407', N'東京都港区虎ノ門1-17-1', N'虎ノ門ヒルズビジネスタワー', N'03-3502-0232', N'03-3502-0240', N'nishimatsu@example.com', 20, 1, 20, N'振込', 0, 100, 100, 1, 1, N'山岳土木・都市土木', N'図面承認後加工着手', N'現場代理人常駐', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1011, N'株式会社 安藤・間', N'安藤ハザマ', N'アンドウハザマ', N'間 昌彦', N'105-7360', N'東京都港区東新橋1-9-1', N'東京汐留ビルディング', N'03-6280-0111', N'03-6280-0120', N'hazama@example.com', 31, 1, 31, N'振込', 0, 100, 100, 1, 1, N'ダム・大深度地下工事', N'材料ミルシート添付', N'溶接部非破壊全数検査', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1012, N'株式会社 熊谷組', N'熊谷組', N'クマガイグミ', N'熊谷 昭典', N'162-8557', N'東京都新宿区津久戸町2-1', N'熊谷組本社ビル', N'03-3260-2111', N'03-3260-2125', N'kumagai@example.com', 25, 1, 25, N'振込', 0, 100, 100, 1, 1, N'鉄道・道路インフラ工事', N'工程表前週提出', N'安全協議会参加', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1013, N'東急建設 株式会社', N'東急建設', N'トウキュウケンセツ', N'渋谷 忠志', N'150-8340', N'東京都渋谷区渋谷1-16-14', N'渋谷地下鉄ビル', N'03-5466-5008', N'03-5466-5015', N'tokyu@example.com', 20, 1, 31, N'振込', 0, 100, 100, 1, 1, N'駅前再開発工事', N'夜間鉄骨建方あり', N'近隣配慮対策遵守', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1014, N'三井住友建設 株式会社', N'三井住友建設', N'ミツイスミトモ', N'住友 健治', N'104-0053', N'東京都中央区晴海1-8-12', N'晴海トリトンスクエアZ棟', N'03-4582-3000', N'03-4582-3200', N'smcon@example.com', 31, 1, 31, N'でんさい・振込', 50, 50, 100, 1, 1, N'PC橋梁・免震構造', N'電子請求書対応済', N'四半期査定実施', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1015, N'株式会社 奥村組', N'奥村組', N'オクムラグミ', N'奥村 太一', N'545-8555', N'大阪府大阪市阿倍野区松崎町2-2-2', N'奥村組本社ビル', N'06-6621-1101', N'06-6621-1115', N'okumura@example.com', 20, 1, 20, N'振込', 0, 100, 100, 1, 1, N'免震技術研究所改修', N'搬入時間厳守', N'指定ヘルメット着用', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1016, N'鉄建建設 株式会社', N'鉄建建設', N'テッケンケンセツ', N'鉄道 一郎', N'101-8366', N'東京都千代田区三崎町2-5-3', N'鉄建ビル', N'03-3221-2151', N'03-3221-2160', N'tekken@example.com', 25, 1, 15, N'振込', 0, 100, 100, 1, 1, N'新幹線高架橋補修', N'JR軌道近接施工資格要', N'夜間保安要員配置', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1017, N'株式会社 フジタ', N'フジタ', N'フジタ', N'藤田 正雄', N'151-8570', N'東京都渋谷区千駄ヶ谷4-25-2', N'フジタ本社ビル', N'03-3402-1911', N'03-3402-1925', N'fujita@example.com', 31, 1, 31, N'振込', 0, 100, 100, 1, 1, N'大型物流倉庫建設', N'鉄骨大梁プレハブ化', N'敷地内トラック待機所あり', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1018, N'株式会社 錢高組', N'錢高組', N'ゼニタカグミ', N'錢高 善久', N'550-0005', N'大阪府大阪市西区西本町2-2-11', N'錢高組本社ビル', N'06-6531-6151', N'06-6531-6160', N'zenitaka@example.com', 20, 1, 31, N'振込', 0, 100, 100, 1, 1, N'伝統建築・都市再開発', N'検査前日確認連絡要', N'支払通知書郵送', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1019, N'株式会社 長谷工コーポレーション', N'長谷工', N'ハセコウ', N'長谷川 剛', N'105-8507', N'東京都港区芝2-32-1', N'長谷工ビル', N'03-3456-5451', N'03-3456-5460', N'haseko@example.com', 31, 1, 31, N'手形・振込', 40, 60, 100, 1, 1, N'大規模マンション鉄骨階段', N'標準化プレカット採用', N'定期安全パトロール', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01'),
(1020, N'株式会社 鴻池組', N'鴻池組', N'コウノイケグミ', N'鴻池 祥平', N'541-0057', N'大阪府大阪市中央区北久宝寺町3-6-1', N'本町南ガーデンシティ', N'06-6245-6500', N'06-6245-6510', N'konoike@example.com', 25, 1, 20, N'振込', 0, 100, 100, 1, 1, N'関西空港関連施設', N'耐塩害特殊塗装仕様', N'工期厳守案件', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1780C', N'WS01')
) AS source (
  code, name, ryaku, kana, sekinin, yubin, jyusyo1, jyusyo2, tel, fax, mail, simedd, syukinmm, syukindd, kaisyu, tegata, genkin, kakert, syosiki, torikb, biko1, biko2, biko3, new_user, new_date, new_apid, new_wsnm, upd_user, upd_date, upd_apid, upd_wsnm
)
ON target.admjyu_code = source.code
WHEN MATCHED THEN
  UPDATE SET
    target.admjyu_name = source.name,
    target.admjyu_ryaku = source.ryaku,
    target.admjyu_kana = source.kana,
    target.admjyu_sekinin = source.sekinin,
    target.admjyu_yubin = source.yubin,
    target.admjyu_jyusyo1 = source.jyusyo1,
    target.admjyu_jyusyo2 = source.jyusyo2,
    target.admjyu_tel = source.tel,
    target.admjyu_fax = source.fax,
    target.admjyu_mail = source.mail,
    target.admjyu_simedd = source.simedd,
    target.admjyu_syukinmm = source.syukinmm,
    target.admjyu_syukindd = source.syukindd,
    target.admjyu_kaisyu = source.kaisyu,
    target.admjyu_tegata = source.tegata,
    target.admjyu_genkin = source.genkin,
    target.admjyu_kakert = source.kakert,
    target.admjyu_syosiki = source.syosiki,
    target.admjyu_torikb = source.torikb,
    target.admjyu_biko1 = source.biko1,
    target.admjyu_biko2 = source.biko2,
    target.admjyu_biko3 = source.biko3,
    target.admjyu_upd_user = source.upd_user,
    target.admjyu_upd_date = source.upd_date
WHEN NOT MATCHED THEN
  INSERT (
    admjyu_code, admjyu_name, admjyu_ryaku, admjyu_kana, admjyu_sekinin, admjyu_yubin, admjyu_jyusyo1, admjyu_jyusyo2, admjyu_tel, admjyu_fax, admjyu_mail, admjyu_simedd, admjyu_syukinmm, admjyu_syukindd, admjyu_kaisyu, admjyu_tegata, admjyu_genkin, admjyu_kakert, admjyu_syosiki, admjyu_torikb, admjyu_biko1, admjyu_biko2, admjyu_biko3, admjyu_new_user, admjyu_new_date, admjyu_new_apid, admjyu_new_wsnm, admjyu_upd_user, admjyu_upd_date, admjyu_upd_apid, admjyu_upd_wsnm
  )
  VALUES (
    source.code, source.name, source.ryaku, source.kana, source.sekinin, source.yubin, source.jyusyo1, source.jyusyo2, source.tel, source.fax, source.mail, source.simedd, source.syukinmm, source.syukindd, source.kaisyu, source.tegata, source.genkin, source.kakert, source.syosiki, source.torikb, source.biko1, source.biko2, source.biko3, source.new_user, source.new_date, source.new_apid, source.new_wsnm, source.upd_user, source.upd_date, source.upd_apid, source.upd_wsnm
  );

-- ============================================================================
-- 2. SEED 仕入先マスタ (AD_M_SIIRE) -> 2007 to 2020 (Total 20 Records)
-- ============================================================================
PRINT N'Seeding AD_M_SIIRE records 2007 to 2020...';

MERGE INTO [AD_M_SIIRE] AS target
USING (VALUES
(2007, N'新日鉄住金鋼材 株式会社', N'新日鉄鋼材', N'シンニッテツコウザイ', N'加藤 健二', N'鋼材仕入', N'100-8071', N'東京都千代田区丸の内2-6-1', N'丸の内パークビル', N'03-6867-4111', N'03-6867-5111', N'shinnittetsu@example.com', 31, N'振込', 0.00, N'三菱UFJ銀行', N'本店営業部', 1, N'1234567', N'シンニツテツコウザイ（カ', N'一般構造用圧延鋼材 SS400', N'ミルシート電子発行対応', N'定期デリバリー契約', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2008, N'JFEスチール 株式会社', N'JFEスチール', N'ジェイエフイースチール', N'藤井 裕介', N'厚板・形鋼', N'100-0011', N'東京都千代田区内幸町2-2-3', N'日比谷国際ビル', N'03-3597-3111', N'03-3597-4111', N'jfe@example.com', 20, N'振込', 0.00, N'みずほ銀行', N'東京営業部', 1, N'2345678', N'ジエイエフイースチール（カ', N'建築構造用鋼材 SN490B', N'大梁用極厚板供給', N'船積港指定あり', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2009, N'株式会社 神戸製鋼所', N'神戸製鋼', N'コウベセイコウショ', N'山本 孝', N'特殊鋼・溶接棒', N'651-8585', N'兵庫県神戸市中央区脇浜海岸通2-2-4', N'神戸製鋼本社ビル', N'078-261-5111', N'078-261-5222', N'kobelco@example.com', 25, N'でんさい', 0.50, N'三井住友銀行', N'神戸営業部', 2, N'3456789', N'カ）コウベセイコウショ', N'CO2自動溶接ワイヤ FAMILIARC', N'溶接施工技術指導員派遣', N'パレット回収必須', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2010, N'東京製鐵 株式会社', N'東京製鐵', N'トウキョウセイテツ', N'池田 誠', N'電炉H形鋼', N'100-0011', N'東京都千代田区内幸町2-2-2', N'富国生命ビル', N'03-3501-7721', N'03-3501-7730', N'tokyosteel@example.com', 31, N'振込', 0.00, N'三菱UFJ銀行', N'日比谷支店', 1, N'4567890', N'トウキヨウセイテツ（カ', N'環境配慮型電炉H形鋼エコビーム', N'田原工場直送対応', N'夜間着指定可', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2011, N'共英製鋼 株式会社', N'共英製鋼', N'キョウエイセイコウ', N'森本 秀樹', N'鉄筋棒鋼', N'530-8315', N'大阪府大阪市北区堂島浜1-4-16', N'アクア堂島N棟', N'06-6346-5221', N'06-6346-5230', N'kyoei@example.com', 20, N'振込', 0.00, N'三井住友銀行', N'大阪営業部', 1, N'5678901', N'キヨウエイセイコウ（カ', N'異形棒鋼 SD345 / SD390', N'切断加工・曲げ加工受託', N'結束本数単位納入', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2012, N'日鐵住金建材 株式会社', N'日鐵建材', N'ニッテツケンザイ', N'松井 浩', N'建材・デッキ', N'135-0016', N'東京都江東区東陽2-4-2', N'新東陽ビル', N'03-5626-7001', N'03-5626-7010', N'kenzai@example.com', 31, N'振込', 0.00, N'みずほ銀行', N'東陽町支店', 1, N'6789012', N'ニツテツケンザイ（カ', N'合成スラブ用デッキプレート EZ', N'現場割付図面作成', N'揚重計画書事前提出', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2013, N'関西特殊鋼 株式会社', N'関西特殊鋼', N'カンサイトクシュコウ', N'谷口 順平', N'高張力鋼板', N'550-0012', N'大阪府大阪市西区立売堀1-9-15', N'特殊鋼ビル', N'06-6532-1100', N'06-6532-1110', N'kantoku@example.com', 25, N'振込', 0.00, N'りそな銀行', N'大阪営業部', 1, N'7890123', N'カンサイトクシユコウ（カ', N'耐摩耗鋼板・高張力鋼', N'ガス切断・プラズマ切断加工', N'少量多品種即納体制', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2014, N'中部ボルト工業 株式会社', N'中部ボルト', N'チュウブボルト', N'近藤 敏行', N'ファスナー・締結', N'457-0841', N'愛知県名古屋市南区豊田1-12-8', N'中部ボルト工場', N'052-691-3311', N'052-691-3320', N'chububolt@example.com', 20, N'振込', 0.00, N'名古屋銀行', N'内田橋支店', 1, N'8901234', N'チユウブボルト（カ', N'トルシア形高力ボルト S10T', N'JIS認定試験成績表添付', N'専用締付工具無償貸出', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2015, N'日本ファブテック 株式会社', N'日本ファブ', N'ニホンファブテック', N'小川 忠彦', N'鉄骨加工外注', N'103-0027', N'東京都中央区日本橋2-1-3', N'日本橋朝日生命館', N'03-5299-7000', N'03-5299-7010', N'fabtec@example.com', 31, N'でんさい', 0.25, N'三菱UFJ銀行', N'日本橋支店', 2, N'9012345', N'カ）ニホンフアブテツク', N'大臣認定Hグレード加工ファブ', N'大型柱溶接ロボット加工', N'中間社内検査立会必須', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2016, N'株式会社 横河ブリッジ', N'横河ブリッジ', N'ヨコガワブリッジ', N'横河 伸夫', N'橋梁鉄骨', N'105-0014', N'東京都港区芝3-2-18', N'NBF芝公園ビル', N'03-3453-4111', N'03-3453-4120', N'yokogawa@example.com', 20, N'振込', 0.00, N'みずほ銀行', N'芝支店', 1, N'0123456', N'ヨコガワブリツジ（カ', N'道路橋・鉄道橋鋼構造物製作', N'仮組立検査実施要', N'塗装色サンプル事前提出', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2017, N'川田工業 株式会社', N'川田工業', N'カワダコウギョウ', N'川田 達也', N'システム建築', N'114-8562', N'東京都北区滝野川6-3-1', N'川田ビル', N'03-3915-4321', N'03-3915-4330', N'kawada@example.com', 31, N'振込', 0.00, N'三井住友銀行', N'赤羽支店', 1, N'1234560', N'カワダコウギヨウ（カ', N'大スパン鉄骨トラス構造部材', N'CAD/CAM自動連動データ連携', N'現場指導員随行', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2018, N'名古屋重機リース 株式会社', N'名重機', N'ナゴヤジュウキ', N'大島 勝', N'重機リース', N'455-0831', N'愛知県名古屋市港区十一屋3-55', N'名重機ヤード', N'052-382-7711', N'052-382-7720', N'meijuki@example.com', 25, N'振込', 0.00, N'愛知銀行', N'港支店', 1, N'2345601', N'ナゴヤジユウキ（カ', N'120tラフタークレーン・オルター', N'有資格オペレーター付チャーター', N'道路通行許可事前取得済', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2019, N'愛知クレーン作業 株式会社', N'愛知クレーン', N'アイチクレーン', N'柴田 隆志', N'揚重作業', N'460-0003', N'愛知県名古屋市中区錦1-18-24', N'錦ビル', N'052-221-8811', N'052-221-8820', N'aichi-crane@example.com', 20, N'振込', 0.00, N'十六銀行', N'名古屋営業部', 1, N'3456012', N'アイチクレーン（カ', N'建方合図・玉掛・揚重作業一式', N'安全帯ダブルランヤード徹底', N'朝礼KY活動記録提出', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01'),
(2020, N'名港海運 株式会社', N'名港海運', N'メイコウカイウン', N'水野 圭介', N'鋼材海上陸送', N'455-8630', N'愛知県名古屋市港区入船2-4-6', N'名港ビル', N'052-661-8111', N'052-661-8120', N'meiko@example.com', 31, N'振込', 0.00, N'百五銀行', N'名古屋支店', 1, N'4560123', N'メイコウカイウン（カ', N'超重量鋼材トレーラー特装輸送', N'深夜先導車付き輸送手配', N'港湾埠頭一時保管ヤード利用可', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1790C', N'WS01')
) AS source (
  code, name, ryaku, kana, sekinin, gyousyu, yubin, jyusyo1, jyusyo2, tel, fax, mail, simedd, siharai, risoku, bnknm, stnnm, kozasb, kozano, kozanm, biko1, biko2, biko3, new_user, new_date, new_apid, new_wsnm, upd_user, upd_date, upd_apid, upd_wsnm
)
ON target.admsir_code = source.code
WHEN MATCHED THEN
  UPDATE SET
    target.admsir_name = source.name,
    target.admsir_ryaku = source.ryaku,
    target.admsir_kana = source.kana,
    target.admsir_sekinin = source.sekinin,
    target.admsir_gyousyu = source.gyousyu,
    target.admsir_yubin = source.yubin,
    target.admsir_jyusyo1 = source.jyusyo1,
    target.admsir_jyusyo2 = source.jyusyo2,
    target.admsir_tel = source.tel,
    target.admsir_fax = source.fax,
    target.admsir_mail = source.mail,
    target.admsir_simedd = source.simedd,
    target.admsir_siharai = source.siharai,
    target.admsir_risoku = source.risoku,
    target.admsir_bnknm = source.bnknm,
    target.admsir_stnnm = source.stnnm,
    target.admsir_kozasb = source.kozasb,
    target.admsir_kozano = source.kozano,
    target.admsir_kozanm = source.kozanm,
    target.admsir_biko1 = source.biko1,
    target.admsir_biko2 = source.biko2,
    target.admsir_biko3 = source.biko3,
    target.admsir_upd_user = source.upd_user,
    target.admsir_upd_date = source.upd_date
WHEN NOT MATCHED THEN
  INSERT (
    admsir_code, admsir_name, admsir_ryaku, admsir_kana, admsir_sekinin, admsir_gyousyu, admsir_yubin, admsir_jyusyo1, admsir_jyusyo2, admsir_tel, admsir_fax, admsir_mail, admsir_simedd, admsir_siharai, admsir_risoku, admsir_bnknm, admsir_stnnm, admsir_kozasb, admsir_kozano, admsir_kozanm, admsir_biko1, admsir_biko2, admsir_biko3, admsir_new_user, admsir_new_date, admsir_new_apid, admsir_new_wsnm, admsir_upd_user, admsir_upd_date, admsir_upd_apid, admsir_upd_wsnm
  )
  VALUES (
    source.code, source.name, source.ryaku, source.kana, source.sekinin, source.gyousyu, source.yubin, source.jyusyo1, source.jyusyo2, source.tel, source.fax, source.mail, source.simedd, source.siharai, source.risoku, source.bnknm, source.stnnm, source.kozasb, source.kozano, source.kozanm, source.biko1, source.biko2, source.biko3, source.new_user, source.new_date, source.new_apid, source.new_wsnm, source.upd_user, source.upd_date, source.upd_apid, source.upd_wsnm
  );

-- ============================================================================
-- 3. SEED ユーザマスタ (AD_M_USER) -> 000005 to 000020 (Total 20 Records)
-- All with password 'user123' (BCrypt hash)
-- ============================================================================
PRINT N'Seeding AD_M_USER records 000005 to 000020...';

DECLARE @pwHash NVARCHAR(255) = N'$2a$11$YTrtwIHaKSkEgm0xohbBT.lD5NCwiVnBaXMuCZxiLMy6PMVENQXJS';

MERGE INTO [AD_M_USER] AS target
USING (VALUES
(N'000005', N'高橋 健一', N'高橋', N'タカハシ', 1, N'1', 1, N'営業第一課 課長', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000006', N'田中 一郎', N'田中', N'タナカ', 1, N'1', 5, N'工務部 施工管理担当', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000007', N'伊藤 誠', N'伊藤', N'イトウ', 1, N'1', 9, N'経理部 原価計算主任', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000008', N'渡辺 裕子', N'渡辺', N'ワタナベ', 1, N'1', 1, N'営業部 積算・見積担当', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000009', N'山本 大輔', N'山本', N'ヤマモト', 1, N'1', 5, N'工務部 安全衛生管理者', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000010', N'中村 拓也', N'中村', N'ナカムラ', 1, N'1', 5, N'工務第二課 主任', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000011', N'小林 雅人', N'小林', N'コバヤシ', 1, N'1', 9, N'経理部 出納・支払担当', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000012', N'加藤 浩二', N'加藤', N'カトウ', 1, N'1', 1, N'営業第二課 主任', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000013', N'吉田 美咲', N'吉田', N'ヨシダ', 9, N'1', 9, N'総務部 庶務・労務担当', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000014', N'山田 孝之', N'山田', N'ヤマダ', 1, N'1', 5, N'工務部 鉄骨加工指示担当', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000015', N'佐々木 健', N'佐々木', N'ササキ', 1, N'1', 1, N'営業第一課 担当', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000016', N'山口 達也', N'山口', N'ヤマグチ', 1, N'1', 5, N'工務第一課 現場監理', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000017', N'斎藤 隆', N'斎藤', N'サイトウ', 1, N'1', 5, N'工務部 検査課 技師', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000018', N'松本 淳', N'松本', N'マツモト', 1, N'1', 1, N'営業部 新規開拓担当', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000019', N'井上 陽介', N'井上', N'イノウエ', 1, N'1', 9, N'経理部 月次決算担当', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0),
(N'000020', N'木村 拓哉', N'木村', N'キムラ', 1, N'1', 5, N'工務第二課 現場代理人', @pwHash, SYSDATETIME(), N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', N'ADMIN', SYSDATETIME(), N'AD1730C', N'WS01', 0)
) AS source (
  user_cd, user_name, user_name_r, user_name_k, tanto_kbn, usergrp_cd, syubetu, biko, pass, pass_upd_date, new_user, new_date, new_apid, new_wsnm, upd_user, upd_date, upd_apid, upd_wsnm, del_flg
)
ON target.admuse_user_cd = source.user_cd
WHEN MATCHED THEN
  UPDATE SET
    target.admuse_user_name = source.user_name,
    target.admuse_user_name_r = source.user_name_r,
    target.admuse_user_name_k = source.user_name_k,
    target.admuse_tanto_kbn = source.tanto_kbn,
    target.admuse_usergrp_cd = source.usergrp_cd,
    target.admuse_syubetu = source.syubetu,
    target.admuse_biko = source.biko,
    target.admuse_pass = source.pass,
    target.admuse_pass_upd_date = source.pass_upd_date,
    target.admuse_upd_user = source.upd_user,
    target.admuse_upd_date = source.upd_date
WHEN NOT MATCHED THEN
  INSERT (
    admuse_user_cd, admuse_user_name, admuse_user_name_r, admuse_user_name_k, admuse_tanto_kbn, admuse_usergrp_cd, admuse_syubetu, admuse_biko, admuse_pass, admuse_pass_upd_date, admuse_new_user, admuse_new_date, admuse_new_apid, admuse_new_wsnm, admuse_upd_user, admuse_upd_date, admuse_upd_apid, admuse_upd_wsnm, admuse_del_flg
  )
  VALUES (
    source.user_cd, source.user_name, source.user_name_r, source.user_name_k, source.tanto_kbn, source.usergrp_cd, source.syubetu, source.biko, source.pass, source.pass_upd_date, source.new_user, source.new_date, source.new_apid, source.new_wsnm, source.upd_user, source.upd_date, source.upd_apid, source.upd_wsnm, source.del_flg
  );

PRINT N'Seeding completed successfully!';
GO
