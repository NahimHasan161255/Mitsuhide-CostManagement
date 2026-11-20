import React from 'react';
import { createPortal } from 'react-dom';
import type { ControlItem } from '../../pages/Master/ControlMasterPage';
import './printReport.css';

interface ControlPrintReportProps {
  items: ControlItem[];
  printDate?: Date;
}

// Official AD1770C Specification: 12 items per page (24 item rows + 2 header rows = 26 total rows)
const ITEMS_PER_PAGE = 12;

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

export const ControlPrintReport: React.FC<ControlPrintReportProps> = ({
  items,
  printDate = new Date(),
}) => {
  // Sort according to official specification: ｻﾌﾞｼｽﾃﾑCD ＞ ID (ProgId)
  const sortedItems = [...items].sort((a, b) => {
    if (a.subSysCd !== b.subSysCd) {
      return a.subSysCd.localeCompare(b.subSysCd);
    }
    return a.progId.localeCompare(b.progId);
  });

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE));
  const pages: ControlItem[][] = [];

  for (let i = 0; i < totalPages; i++) {
    pages.push(sortedItems.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
  }

  const formattedDate = formatPrintDateTime(printDate);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="erp-print-container erp-report-ad1770c" aria-hidden="true">
      {pages.map((pageItems, pageIdx) => (
        <div key={pageIdx} className="erp-print-page">
          {/* Header per AD1770C Official Specification */}
          <div className="erp-print-header">
            <div className="erp-print-header-id">ID: AD1770C</div>
            <div className="erp-print-header-title">処 理 基 準 管 理 マ ス タ 一 覧 表</div>
            <div className="erp-print-header-meta">
              <div>作成日: {formattedDate}</div>
              <div>{pageIdx + 1} / {totalPages} 頁</div>
            </div>
          </div>

          {/* Master Table Grid */}
          <table className="erp-print-table">
            <colgroup>
              <col style={{ width: '7%' }} />   {/* ｻﾌﾞｼｽﾃﾑCD (Spans 2 rows) */}
              <col style={{ width: '10%' }} />  {/* プログラムID (Spans 2 rows) */}
              <col style={{ width: '19%' }} />  {/* 管理名称 (Spans 2 rows) */}
              <col style={{ width: '22%' }} />  {/* 文字項目 (1/2) */}
              <col style={{ width: '10%' }} />  {/* 数値項目 (1/2) */}
              <col style={{ width: '7%' }} />   {/* 登録/更新者ID */}
              <col style={{ width: '11%' }} />  {/* 登録/更新日時 */}
              <col style={{ width: '7%' }} />   {/* 登録/更新APID */}
              <col style={{ width: '7%' }} />   {/* 登録/更新端末名 */}
            </colgroup>

            <thead>
              {/* Header Row 1 */}
              <tr className="th-top">
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>ｻﾌﾞｼｽﾃﾑCD</th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>プログラムID</th>
                <th rowSpan={2} style={{ textAlign: 'left', verticalAlign: 'middle' }}>管理名称</th>
                <th colSpan={2} style={{ textAlign: 'left' }}>
                  設定パラメータ （上段: 項目1 ／ 下段: 項目2）
                </th>
                <th colSpan={4} style={{ textAlign: 'left' }}>
                  監査情報 （上段: 初回登録 ／ 下段: 最終更新）
                </th>
              </tr>

              {/* Header Row 2 */}
              <tr className="th-bot">
                <th style={{ textAlign: 'left' }}>文字項目 (設定内容・書式)</th>
                <th style={{ textAlign: 'right' }}>数値項目 (設定値・閾値)</th>
                <th style={{ textAlign: 'center' }}>登録/更新者ID</th>
                <th style={{ textAlign: 'center' }}>登録/更新日時</th>
                <th style={{ textAlign: 'center' }}>登録/更新APID</th>
                <th style={{ textAlign: 'left' }}>登録/更新端末名</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                    データが存在しません
                  </td>
                </tr>
              ) : (
                pageItems.map((item, itemIdx) => {
                  const borderTopStyle = itemIdx > 0 ? '1px solid #94a3b8' : undefined;
                  return (
                    <React.Fragment key={`${item.subSysCd}-${item.progId}`}>
                      {/* Sub-row 1: 項目1 & 初回登録情報 */}
                      <tr style={{ borderTop: borderTopStyle }}>
                        <td
                          rowSpan={2}
                          style={{
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: '8pt',
                            color: '#0891b2',
                            background: '#f8fafc',
                          }}
                        >
                          {item.subSysCd}
                        </td>
                        <td
                          rowSpan={2}
                          style={{
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: '8pt',
                            color: '#0f172a',
                            background: '#f8fafc',
                          }}
                        >
                          {item.progId}
                        </td>
                        <td
                          rowSpan={2}
                          style={{
                            verticalAlign: 'middle',
                            fontWeight: 600,
                            color: '#0f172a',
                            paddingLeft: 6,
                          }}
                        >
                          {item.kanriName}
                        </td>
                        <td style={{ textAlign: 'left', color: '#0f172a', paddingLeft: 6 }}>
                          <span style={{ color: '#64748b', marginRight: 4 }}>[文字1]</span>
                          {item.ch1 || '-'}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          {item.nm1 !== undefined && item.nm1 !== null ? Number(item.nm1).toLocaleString() : '-'}
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

                      {/* Sub-row 2: 項目2 & 最終更新情報 */}
                      <tr style={{ background: '#fafbfc' }}>
                        <td style={{ textAlign: 'left', color: '#475569', paddingLeft: 6 }}>
                          <span style={{ color: '#94a3b8', marginRight: 4 }}>[文字2]</span>
                          {item.ch2 || '-'}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          {item.nm2 !== undefined && item.nm2 !== null ? Number(item.nm2).toLocaleString() : '-'}
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
