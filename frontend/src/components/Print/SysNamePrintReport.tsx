import React from 'react';
import { createPortal } from 'react-dom';
import type { SysNameItem } from '../../pages/Master/SysNameMasterPage';
import './printReport.css';

interface SysNamePrintReportProps {
  items: SysNameItem[];
  printDate?: Date;
}

// Official AD1760C Specification: 10 items per page (40 item rows + 2 header rows = 42 total rows)
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
  if (!val) return '-';
  const d = typeof val === 'string' ? new Date(val) : val;
  if (isNaN(d.getTime())) return typeof val === 'string' ? val : '-';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${y}/${m}/${day} ${hh}:${mm}:${ss}`;
};

const formatDateNumber = (val?: number | string | null) => {
  if (!val) return '-';
  const s = String(val);
  if (s.length === 8) {
    return `${s.slice(0, 4)}/${s.slice(4, 6)}/${s.slice(6, 8)}`;
  }
  return s;
};

export const SysNamePrintReport: React.FC<SysNamePrintReportProps> = ({
  items,
  printDate = new Date(),
}) => {
  // Sort according to official specification: ｼｽﾃﾑ名称区分 ＞ ｼｽﾃﾑ名称CD
  const sortedItems = [...items].sort((a, b) => {
    if (a.nameKbn !== b.nameKbn) {
      return a.nameKbn.localeCompare(b.nameKbn);
    }
    return a.nameCd.localeCompare(b.nameCd);
  });

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE));
  const pages: SysNameItem[][] = [];

  for (let i = 0; i < totalPages; i++) {
    pages.push(sortedItems.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
  }

  const formattedDate = formatPrintDateTime(printDate);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="erp-print-container erp-report-ad1760c" aria-hidden="true">
      {pages.map((pageItems, pageIdx) => (
        <div key={pageIdx} className="erp-print-page">
          {/* Header per AD1760C Official Specification */}
          <div className="erp-print-header">
            <div className="erp-print-header-id">ID: AD1760C</div>
            <div className="erp-print-header-title">シ ス テ ム 名 称 マ ス タ 一 覧 表</div>
            <div className="erp-print-header-meta">
              <div>作成日: {formattedDate}</div>
              <div>{pageIdx + 1} / {totalPages} 頁</div>
            </div>
          </div>

          {/* Master Table Grid */}
          <table className="erp-print-table">
            <colgroup>
              <col style={{ width: '14%' }} />  {/* ｼｽﾃﾑ名称区分CD (Spans 4 rows) */}
              <col style={{ width: '14%' }} />  {/* 数字項目 (下段) */}
              <col style={{ width: '12%' }} />  {/* 日付項目 (下段) */}
              <col style={{ width: '10%' }} />  {/* 登録/更新者ID */}
              <col style={{ width: '16%' }} />  {/* 登録/更新日時 */}
              <col style={{ width: '14%' }} />  {/* 登録/更新APID */}
              <col style={{ width: '20%' }} />  {/* 登録/更新端末名 */}
            </colgroup>

            <thead>
              {/* Header Row 1 */}
              <tr className="th-top">
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>ｼｽﾃﾑ名称区分CD</th>
                <th colSpan={6} style={{ textAlign: 'left' }}>
                  文字項目 （1行目: 文字項目1[名称] ／ 2行目: 文字項目2[略称・補足]）
                </th>
              </tr>

              {/* Header Row 2 */}
              <tr className="th-bot">
                <th style={{ textAlign: 'center' }}>数字項目 (上:1 / 下:2)</th>
                <th style={{ textAlign: 'center' }}>日付項目 (上:1 / 下:2)</th>
                <th style={{ textAlign: 'center' }}>登録/更新者ID</th>
                <th style={{ textAlign: 'center' }}>登録/更新日時</th>
                <th style={{ textAlign: 'center' }}>登録/更新APID</th>
                <th style={{ textAlign: 'center' }}>登録/更新端末名</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                    データが存在しません
                  </td>
                </tr>
              ) : (
                pageItems.map((item, itemIdx) => {
                  const borderTopStyle = itemIdx > 0 ? '1px solid #94a3b8' : undefined;
                  return (
                    <React.Fragment key={`${item.nameKbn}-${item.nameCd}`}>
                      {/* Sub-row 1: 区分CD (rowSpan 4) + 文字項目1 (colSpan 6) */}
                      <tr style={{ borderTop: borderTopStyle }}>
                        <td
                          rowSpan={4}
                          style={{
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: '7.5pt',
                            background: '#f8fafc',
                          }}
                        >
                          <div style={{ color: '#1e40af' }}>{item.nameKbn}</div>
                          <div style={{ color: '#0f172a', marginTop: 1 }}>{item.nameCd}</div>
                        </td>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: 'left',
                            fontWeight: 600,
                            color: '#0f172a',
                            paddingLeft: 6,
                          }}
                        >
                          <span style={{ color: '#64748b', marginRight: 4, fontWeight: 400 }}>[名称]</span>
                          {item.ch1}
                        </td>
                      </tr>

                      {/* Sub-row 2: 文字項目2 (colSpan 6) */}
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: 'left',
                            color: item.ch2 ? '#334155' : '#94a3b8',
                            paddingLeft: 6,
                          }}
                        >
                          <span style={{ color: '#94a3b8', marginRight: 4 }}>[略称]</span>
                          {item.ch2 || '-'}
                        </td>
                      </tr>

                      {/* Sub-row 3: 数字項目1, 日付項目1, 初回登録情報 (6 cols) */}
                      <tr style={{ background: '#fafbfc' }}>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          {item.nm1 !== undefined && item.nm1 !== null ? Number(item.nm1).toLocaleString() : '-'}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                          {formatDateNumber(item.date1)}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                          {item.newUser || '-'}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                          {formatDateTime(item.newDate)}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                          {item.newApid || '-'}
                        </td>
                        <td style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.newWsnm || '-'}
                        </td>
                      </tr>

                      {/* Sub-row 4: 数字項目2, 日付項目2, 最終更新情報 (6 cols) */}
                      <tr>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          {item.nm2 !== undefined && item.nm2 !== null ? Number(item.nm2).toLocaleString() : '-'}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                          {formatDateNumber(item.date2)}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                          {item.updUser || '-'}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                          {formatDateTime(item.updDate)}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                          {item.updApid || '-'}
                        </td>
                        <td style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.updWsnm || '-'}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>,
    document.body
  );
};
