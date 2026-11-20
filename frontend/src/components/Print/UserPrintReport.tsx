import React from 'react';
import { createPortal } from 'react-dom';
import type { UserItem } from '../../pages/Master/UserMasterPage';
import './printReport.css';

interface UserPrintReportProps {
  items: UserItem[];
  startUserCd?: string;
  endUserCd?: string;
  keyword?: string;
  printDate?: Date;
}

// Legacy specification template shows 10-12 items per page
// 10 items per page with 3 sub-rows (30 data rows + 3 header rows = 33 rows) provides optimal legibility
const ITEMS_PER_PAGE = 10;

const getDayOfWeekJa = (d: Date) => {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[d.getDay()];
};

const formatPrintDateTime = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dow = getDayOfWeekJa(d);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${day}(${dow}) ${hh}:${mm}`;
};

const formatDateTime = (val?: string | Date | null) => {
  if (!val) return '';
  const d = typeof val === 'string' ? new Date(val) : val;
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${y}/${m}/${day} ${hh}:${mm}:${ss}`;
};

const formatDateKigen = (val?: number | string | null) => {
  if (!val) return '';
  const str = String(val).trim();
  if (str.length === 8 && /^\d{8}$/.test(str)) {
    return `${str.slice(0, 4)}/${str.slice(4, 6)}/${str.slice(6, 8)}`;
  }
  return str;
};

export const UserPrintReport: React.FC<UserPrintReportProps> = ({
  items,
  startUserCd,
  endUserCd,
  keyword,
  printDate = new Date(),
}) => {
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const pages: UserItem[][] = [];

  for (let i = 0; i < totalPages; i++) {
    pages.push(items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
  }

  const formattedDate = formatPrintDateTime(printDate);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="erp-print-container erp-report-ad1730c" aria-hidden="true">
      {pages.map((pageItems, pageIdx) => (
        <div key={pageIdx} className="erp-print-page">
          {/* Header per AD1730C Official Specification */}
          <div className="erp-print-header">
            <div className="erp-print-header-id">ID: AD1730C</div>
            <div className="erp-print-header-title">ユ ー ザ ー マ ス タ 一 覧 表</div>
            <div className="erp-print-header-meta">
              <div>作成日: {formattedDate}</div>
              <div>{pageIdx + 1} / {totalPages} 頁</div>
            </div>
          </div>

          {/* Master Table Grid */}
          <table className="erp-print-table">
            <colgroup>
              <col style={{ width: '8%' }} />   {/* ユーザーCD (Spans 3 rows) */}
              <col style={{ width: '15%' }} />  {/* ユーザー名称 / パスワード / 削除フラグ */}
              <col style={{ width: '10%' }} />  {/* ユーザー略称 / 変更日時 / 起動APL数 */}
              <col style={{ width: '10%' }} />  {/* カナ / 有効期限 / ID有効期限 */}
              <col style={{ width: '8%' }} />   {/* 担当者区分 / ユーザグループCD / ユーザ種別CD */}
              <col style={{ width: '17%' }} />  {/* 備考 (Col 6+7) / グループ名 / 種別名 */}
              <col style={{ width: '7%' }} />   {/* 登録ID / 更新ID */}
              <col style={{ width: '13%' }} />  {/* 最終ログイン日時 (Col 8+9+10) / 登録日時 / 更新日時 */}
              <col style={{ width: '5%' }} />   {/* 登録APID / 更新APID */}
              <col style={{ width: '7%' }} />   {/* 登録端末名 / 更新端末名 */}
            </colgroup>

            <thead>
              {/* Header Row 1 */}
              <tr className="th-top">
                <th rowSpan={3} style={{ textAlign: 'center', verticalAlign: 'middle' }}>ﾕｰｻﾞｰCD</th>
                <th>ユーザー名称</th>
                <th>ユーザー略称</th>
                <th>ｶﾅ</th>
                <th>担当者区分</th>
                <th colSpan={2}>備考</th>
                <th colSpan={3}>最終ﾛｸﾞｲﾝ日時</th>
              </tr>

              {/* Header Row 2 */}
              <tr className="th-sub">
                <th>ﾊﾟｽﾜｰﾄﾞ</th>
                <th>変更日時</th>
                <th>有効期限</th>
                <th>ﾕｰｻﾞｸﾞﾙｰﾌﾟCD</th>
                <th>名称</th>
                <th>登録ID</th>
                <th>登録日時</th>
                <th>登録APID</th>
                <th>登録端末名</th>
              </tr>

              {/* Header Row 3 */}
              <tr className="th-bot">
                <th>削除ﾌﾗｸﾞ</th>
                <th>起動APL数</th>
                <th>ID有効期限</th>
                <th>ﾕｰｻﾞ種別CD</th>
                <th>名称</th>
                <th>更新ID</th>
                <th>更新日時</th>
                <th>更新APID</th>
                <th>更新端末名</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                    該当するユーザーデータはありません。
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => {
                  const passUpdText = formatDateTime(item.passUpdDate);
                  const passKigenText = formatDateKigen(item.passKigen);
                  const userKigenText = formatDateKigen(item.userKigen);
                  const loginText = formatDateTime(item.loginDate);
                  const newDateText = formatDateTime(item.newDate);
                  const updDateText = formatDateTime(item.updDate);

                  const tantoText = item.tantoKbn === 1 ? '1:担当者' : item.tantoKbn === 2 ? '2:担当者以外' : String(item.tantoKbn || '');
                  const deleteText = item.deleteFlg ? '1:削除' : '0:有効';

                  return (
                    <React.Fragment key={item.userCd}>
                      {/* Sub-row 1 (Match Header Row 1) */}
                      <tr className="sub-row">
                        <td rowSpan={3} className="code-cell">
                          {item.userCd}
                        </td>
                        <td>
                          <span className="erp-print-val-bold">{item.userName || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.userNameR || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.userNameK || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{tantoText}</span>
                        </td>
                        <td colSpan={2}>
                          <span className="erp-print-val">{item.biko || ''}</span>
                        </td>
                        <td colSpan={3}>
                          <span className="erp-print-val">{loginText}</span>
                        </td>
                      </tr>

                      {/* Sub-row 2 (Match Header Row 2) */}
                      <tr className="sub-row">
                        <td>
                          <span className="erp-print-val" style={{ fontFamily: 'monospace' }}>********</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{passUpdText}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{passKigenText}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.userGrpCd || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.userGrpNm || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.newUser || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{newDateText}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.newApid || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.newWsnm || ''}</span>
                        </td>
                      </tr>

                      {/* Sub-row 3 (Match Header Row 3) */}
                      <tr className="sub-row-last">
                        <td>
                          <span className="erp-print-val">{deleteText}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">1</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{userKigenText}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.syubetu || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.syubetuNm || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.updUser || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{updDateText}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.updApid || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.updWsnm || ''}</span>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Report Footer */}
          <div className="erp-print-footer">
            <div>
              <strong>抽出条件: </strong>
              <span>
                ユーザーCD [ {startUserCd || '最初'} 〜 {endUserCd || '最後'} ]
                {keyword ? ` ／ 検索語: "${keyword}"` : ''}
              </span>
            </div>
            <div>
              <strong>出力件数: </strong> {items.length} 件
            </div>
            <div>株式会社ミツヒデ 原価管理システム</div>
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
};
