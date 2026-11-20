import React from 'react';
import { createPortal } from 'react-dom';
import type { UserGrpItem } from '../../pages/Master/UserGrpMasterPage';
import './printReport.css';

interface UserGrpPrintReportProps {
  items: UserGrpItem[];
  startGrpCd?: string;
  endGrpCd?: string;
  keyword?: string;
  printDate?: Date;
}

// Legacy specification template (AD1720C) defines 16 items per page (32 item rows + 2 header rows = 34 rows)
const ITEMS_PER_PAGE = 16;

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

export const UserGrpPrintReport: React.FC<UserGrpPrintReportProps> = ({
  items,
  startGrpCd,
  endGrpCd,
  keyword,
  printDate = new Date(),
}) => {
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const pages: UserGrpItem[][] = [];

  for (let i = 0; i < totalPages; i++) {
    pages.push(items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
  }

  const formattedDate = formatPrintDateTime(printDate);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="erp-print-container erp-report-ad1720c" aria-hidden="true">
      {pages.map((pageItems, pageIdx) => (
        <div key={pageIdx} className="erp-print-page">
          {/* Header per AD1720C Official Specification */}
          <div className="erp-print-header">
            <div className="erp-print-header-id">ID: AD1720C</div>
            <div className="erp-print-header-title">ユ ー ザ グ ル ー プ マ ス タ 一 覧 表</div>
            <div className="erp-print-header-meta">
              <div>作成日: {formattedDate}</div>
              <div>{pageIdx + 1} / {totalPages} 頁</div>
            </div>
          </div>

          {/* Master Table Grid */}
          <table className="erp-print-table">
            <colgroup>
              <col style={{ width: '12%' }} />  {/* ユーザグループCD (Spans 2 rows) */}
              <col style={{ width: '24%' }} />  {/* ユーザグループ名称 (Spans 2 rows) */}
              <col style={{ width: '16%' }} />  {/* 同時実行可能APL数 (Spans 2 rows) */}
              <col style={{ width: '11%' }} />  {/* 登録/更新者ID */}
              <col style={{ width: '15%' }} />  {/* 登録/更新日時 */}
              <col style={{ width: '10%' }} />  {/* 登録/更新APID */}
              <col style={{ width: '12%' }} />  {/* 登録/更新端末名 */}
            </colgroup>

            <thead>
              {/* Header Row 1 */}
              <tr className="th-top">
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>ﾕｰｻﾞｸﾞﾙｰﾌﾟCD</th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>ﾕｰｻﾞｸﾞﾙｰﾌﾟ名称</th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>同時実行可能APL数</th>
                <th>登録／更新者ID</th>
                <th>登録／更新日時</th>
                <th>登録／更新APID</th>
                <th>登録／更新端末名</th>
              </tr>

              {/* Header Row 2 */}
              <tr className="th-bot">
                <th style={{ fontSize: '6.5pt', color: '#64748b' }}>（上段:登録 ／ 下段:更新）</th>
                <th style={{ fontSize: '6.5pt', color: '#64748b' }}>（上段:登録 ／ 下段:更新）</th>
                <th style={{ fontSize: '6.5pt', color: '#64748b' }}>（上段:登録 ／ 下段:更新）</th>
                <th style={{ fontSize: '6.5pt', color: '#64748b' }}>（上段:登録 ／ 下段:更新）</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                    該当するユーザーグループデータはありません。
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => {
                  const newDateText = formatDateTime(item.newDate);
                  const updDateText = formatDateTime(item.updDate);

                  return (
                    <React.Fragment key={item.userGrpCd}>
                      {/* Sub-row 1 (Registration Info) */}
                      <tr className="sub-row">
                        <td rowSpan={2} className="code-cell">
                          {item.userGrpCd}
                        </td>
                        <td rowSpan={2}>
                          <span className="erp-print-val-bold">{item.userGrpName || ''}</span>
                        </td>
                        <td rowSpan={2} style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{item.runAplCnt}</span>
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

                      {/* Sub-row 2 (Update Info) */}
                      <tr className="sub-row-last">
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
                ユーザグループCD [ {startGrpCd || '最初'} 〜 {endGrpCd || '最後'} ]
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
