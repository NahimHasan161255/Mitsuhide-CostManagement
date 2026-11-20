import React from 'react';
import { createPortal } from 'react-dom';
import type { ProgramMasterItem } from '../../pages/Master/ProgramMasterPage';
import './printReport.css';

interface ProgramPrintReportProps {
  items: ProgramMasterItem[];
  subSysCd?: string;
  startProgId?: string;
  endProgId?: string;
  selectedStatus?: string;
  keyword?: string;
  printDate?: Date;
}

// Official AD1740C Specification: 16 items per page (32 item rows + 2 header rows = 34 total rows)
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
  if (isNaN(d.getTime())) return typeof val === 'string' ? val : '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${y}/${m}/${day} ${hh}:${mm}:${ss}`;
};

export const ProgramPrintReport: React.FC<ProgramPrintReportProps> = ({
  items,
  subSysCd = 'ALL',
  startProgId,
  endProgId,
  selectedStatus = 'ALL',
  keyword,
  printDate = new Date(),
}) => {
  // Sort according to official specification: ｻﾌﾞｼｽﾃﾑCD ＞ 表示行
  const sortedItems = [...items].sort((a, b) => {
    if (a.subSysCd !== b.subSysCd) {
      return a.subSysCd.localeCompare(b.subSysCd);
    }
    return a.gyo - b.gyo;
  });

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE));
  const pages: ProgramMasterItem[][] = [];

  for (let i = 0; i < totalPages; i++) {
    pages.push(sortedItems.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
  }

  const formattedDate = formatPrintDateTime(printDate);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="erp-print-container erp-report-ad1740c" aria-hidden="true">
      {pages.map((pageItems, pageIdx) => (
        <div key={pageIdx} className="erp-print-page">
          {/* Header per AD1740C Official Specification */}
          <div className="erp-print-header">
            <div className="erp-print-header-id">ID: AD1740C</div>
            <div className="erp-print-header-title">プ ロ グ ラ ム マ ス タ 一 覧 表</div>
            <div className="erp-print-header-meta">
              <div>作成日: {formattedDate}</div>
              <div>{pageIdx + 1} / {totalPages} 頁</div>
            </div>
          </div>

          {/* Master Table Grid */}
          <table className="erp-print-table">
            <colgroup>
              <col style={{ width: '6%' }} />   {/* ｻﾌﾞｼｽﾃﾑCD (Spans 2 rows) */}
              <col style={{ width: '22%' }} />  {/* ﾌﾟﾛｸﾞﾗﾑID／名称 */}
              <col style={{ width: '5%' }} />   {/* 表示行 (Spans 2 rows) */}
              <col style={{ width: '13%' }} />  {/* ﾌﾟﾛｸﾞﾗﾑ引数 (Spans 2 rows) */}
              <col style={{ width: '7%' }} />   {/* ﾌﾟﾛｸﾞﾗﾑVer (Spans 2 rows) */}
              <col style={{ width: '6%' }} />   {/* 最大件数 (Spans 2 rows) */}
              <col style={{ width: '5%' }} />   {/* 起動不可 (Spans 2 rows) */}
              <col style={{ width: '7%' }} />   {/* 登録/更新者ID */}
              <col style={{ width: '13%' }} />  {/* 登録/更新日時 */}
              <col style={{ width: '7%' }} />   {/* 登録/更新APID */}
              <col style={{ width: '9%' }} />   {/* 登録/更新端末名 */}
            </colgroup>

            <thead>
              {/* Header Row 1 */}
              <tr className="th-top">
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>ｻﾌﾞｼｽﾃﾑCD</th>
                <th style={{ textAlign: 'left' }}>ﾌﾟﾛｸﾞﾗﾑID</th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>表示行</th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>ﾌﾟﾛｸﾞﾗﾑ引数</th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>ﾌﾟﾛｸﾞﾗﾑVer</th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>最大件数</th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>起動不可</th>
                <th>登録／更新者ID</th>
                <th>登録／更新日時</th>
                <th>登録／更新APID</th>
                <th>登録／更新端末名</th>
              </tr>

              {/* Header Row 2 */}
              <tr className="th-bot">
                <th style={{ textAlign: 'left', color: '#1e293b' }}>ﾌﾟﾛｸﾞﾗﾑ名称</th>
                <th style={{ fontSize: '6.5pt', color: '#64748b' }}>（上段:登録 ／ 下段:更新）</th>
                <th style={{ fontSize: '6.5pt', color: '#64748b' }}>（上段:登録 ／ 下段:更新）</th>
                <th style={{ fontSize: '6.5pt', color: '#64748b' }}>（上段:登録 ／ 下段:更新）</th>
                <th style={{ fontSize: '6.5pt', color: '#64748b' }}>（上段:登録 ／ 下段:更新）</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                    該当するプログラムマスタデータはありません。
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => {
                  const newDateText = formatDateTime(item.newDate || '2026-11-15 09:00:00');
                  const updDateText = formatDateTime(item.updDate || item.newDate || '2026-11-18 14:30:00');

                  return (
                    <React.Fragment key={`${item.subSysCd}-${item.progId}`}>
                      {/* Sub-row 1 (Registration Info) */}
                      <tr className="sub-row">
                        <td rowSpan={2} className="code-cell" style={{ fontSize: '9pt' }}>
                          {item.subSysCd}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {item.progId}
                        </td>
                        <td rowSpan={2} style={{ textAlign: 'right' }}>
                          {item.gyo}
                        </td>
                        <td rowSpan={2} style={{ fontSize: '7pt', color: item.progOpt ? '#0f172a' : '#94a3b8' }}>
                          {item.progOpt || '-'}
                        </td>
                        <td rowSpan={2} style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                          {item.progVer || '9.9.9'}
                        </td>
                        <td rowSpan={2} style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          {item.maxCnt ? item.maxCnt.toLocaleString() : '0'}
                        </td>
                        <td rowSpan={2} style={{ textAlign: 'center', color: item.runBad === 1 ? '#dc2626' : '#64748b', fontWeight: item.runBad === 1 ? 700 : 400 }}>
                          {item.runBad === 1 ? '不可' : ''}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{item.newUser || 'SYSTEM'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{newDateText}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{item.newApid || 'AD1740C'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{item.newWsnm || 'PC-ADMIN'}</span>
                        </td>
                      </tr>

                      {/* Sub-row 2 (Update Info) */}
                      <tr className="sub-row-last">
                        <td>
                          <span className="erp-print-val-bold">{item.progName || ''}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{item.updUser || item.newUser || 'SYSTEM'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{updDateText}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{item.updApid || item.newApid || 'AD1740C'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{item.updWsnm || item.newWsnm || 'PC-ADMIN'}</span>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Footer per AD1740C Specification */}
          <div className="erp-print-footer">
            <div>
              <strong>【抽出条件】</strong>
              <span> サブシステム: {subSysCd !== 'ALL' ? `${subSysCd}系` : '全て'}</span>
              {(startProgId || endProgId) && (
                <span> ｜ コード範囲: {startProgId || '最初'} 〜 {endProgId || '最後'}</span>
              )}
              {selectedStatus !== 'ALL' && (
                <span> ｜ 起動状態: {selectedStatus === '0' ? '起動可能' : '起動不可'}</span>
              )}
              {keyword && <span> ｜ 検索: "{keyword}"</span>}
              <span> ｜ 該当件数: {sortedItems.length}件</span>
            </div>
            <div>株式会社ミツヒデ 原価管理システム</div>
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
};
