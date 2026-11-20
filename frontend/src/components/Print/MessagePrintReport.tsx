import React from 'react';
import { createPortal } from 'react-dom';
import type { MessageMasterItem } from '../../pages/Master/MessageMasterPage';
import './printReport.css';

interface MessagePrintReportProps {
  items: MessageMasterItem[];
  startMsgNo?: string;
  endMsgNo?: string;
  selectedCategory?: string;
  selectedSubSys?: string;
  keyword?: string;
  printDate?: Date;
}

// Official AD1750C Specification: 12 items per page (36 item rows + 2 header rows = 38 total rows)
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

export const MessagePrintReport: React.FC<MessagePrintReportProps> = ({
  items,
  startMsgNo,
  endMsgNo,
  selectedCategory = 'ALL',
  selectedSubSys = 'ALL',
  keyword,
  printDate = new Date(),
}) => {
  // Sort according to official specification: ﾒｯｾｰｼﾞNO
  const sortedItems = [...items].sort((a, b) => {
    const numA = parseInt(a.msgNo, 10);
    const numB = parseInt(b.msgNo, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.msgNo.localeCompare(b.msgNo);
  });

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE));
  const pages: MessageMasterItem[][] = [];

  for (let i = 0; i < totalPages; i++) {
    pages.push(sortedItems.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
  }

  const formattedDate = formatPrintDateTime(printDate);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="erp-print-container erp-report-ad1750c" aria-hidden="true">
      {pages.map((pageItems, pageIdx) => (
        <div key={pageIdx} className="erp-print-page">
          {/* Header per AD1750C Official Specification */}
          <div className="erp-print-header">
            <div className="erp-print-header-id">ID: AD1750C</div>
            <div className="erp-print-header-title">メ ッ セ ー ジ マ ス タ 一 覧 表</div>
            <div className="erp-print-header-meta">
              <div>作成日: {formattedDate}</div>
              <div>{pageIdx + 1} / {totalPages} 頁</div>
            </div>
          </div>

          {/* Master Table Grid */}
          <table className="erp-print-table">
            <colgroup>
              <col style={{ width: '7%' }} />   {/* ﾒｯｾｰｼﾞNO (Spans 3 rows) */}
              <col style={{ width: '7%' }} />   {/* 登録ID */}
              <col style={{ width: '11%' }} />  {/* 登録日時 */}
              <col style={{ width: '7%' }} />   {/* 登録APID */}
              <col style={{ width: '10%' }} />  {/* 登録端末名 */}
              <col style={{ width: '7%' }} />   {/* 更新ID */}
              <col style={{ width: '11%' }} />  {/* 更新日時 */}
              <col style={{ width: '7%' }} />   {/* 更新APID */}
              <col style={{ width: '10%' }} />  {/* 更新端末名 */}
              <col style={{ width: '10%' }} />  {/* 基本使用ｻﾌﾞｼｽﾃﾑCD (Spans 3 rows) */}
              <col style={{ width: '13%' }} />  {/* ﾃﾞﾌｫﾙﾄﾎﾞﾀﾝ区分 (Spans 3 rows) */}
            </colgroup>

            <thead>
              {/* Header Row 1 */}
              <tr className="th-top">
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>ﾒｯｾｰｼﾞNO</th>
                <th colSpan={8} style={{ textAlign: 'left' }}>ﾒｯｾｰｼﾞ （上段: ﾒｯｾｰｼﾞ1 ／ 中段: ﾒｯｾｰｼﾞ2）</th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>基本使用ｻﾌﾞｼｽﾃﾑCD</th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>ﾃﾞﾌｫﾙﾄﾎﾞﾀﾝ区分</th>
              </tr>

              {/* Header Row 2 */}
              <tr className="th-bot">
                <th style={{ textAlign: 'center' }}>登録ID</th>
                <th style={{ textAlign: 'center' }}>登録日時</th>
                <th style={{ textAlign: 'center' }}>登録APID</th>
                <th style={{ textAlign: 'center' }}>登録端末名</th>
                <th style={{ textAlign: 'center' }}>更新ID</th>
                <th style={{ textAlign: 'center' }}>更新日時</th>
                <th style={{ textAlign: 'center' }}>更新APID</th>
                <th style={{ textAlign: 'center' }}>更新端末名</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                    該当するメッセージマスタデータはありません。
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => {
                  const newDateText = formatDateTime(item.newDate || '2026-11-01 09:00:00');
                  const updDateText = formatDateTime(item.updDate || item.newDate || '2026-11-15 14:30:00');

                  return (
                    <React.Fragment key={item.msgNo}>
                      {/* Sub-row 1 (Message 1) */}
                      <tr className="sub-row">
                        <td rowSpan={3} className="code-cell" style={{ verticalAlign: 'middle', textAlign: 'center', fontSize: '9pt' }}>
                          {item.msgNo}
                        </td>
                        <td colSpan={8}>
                          <span className="erp-print-val-bold">{item.msg1 || ''}</span>
                        </td>
                        <td rowSpan={3} style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                          <span className="erp-print-val">{item.subSysCd || '共通'}</span>
                        </td>
                        <td rowSpan={3} style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                          <span className="erp-print-val">{item.botanKbn === 2 ? 'いいえ' : 'はい/OK'}</span>
                        </td>
                      </tr>

                      {/* Sub-row 2 (Message 2) */}
                      <tr className="sub-row">
                        <td colSpan={8} style={{ color: item.msg2 ? '#0f172a' : '#94a3b8' }}>
                          <span className="erp-print-val">{item.msg2 || '-'}</span>
                        </td>
                      </tr>

                      {/* Sub-row 3 (Audit Info) */}
                      <tr className="sub-row-last">
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{item.newUser || '000001'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{newDateText}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{item.newApid || 'AD1750C'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{item.newWsnm || 'PC-ADMIN'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{item.updUser || item.newUser || '000001'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{updDateText}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="erp-print-val">{item.updApid || item.newApid || 'AD1750C'}</span>
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

          {/* Footer per AD1750C Specification */}
          <div className="erp-print-footer">
            <div>
              <strong>【抽出条件】</strong>
              <span> ﾒｯｾｰｼﾞNO: {startMsgNo || '最初'} 〜 {endMsgNo || '最後'}</span>
              {selectedCategory !== 'ALL' && (
                <span> ｜ 分類: {selectedCategory}</span>
              )}
              {selectedSubSys !== 'ALL' && (
                <span> ｜ サブシステム: {selectedSubSys}</span>
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
