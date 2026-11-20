import React from 'react';
import { createPortal } from 'react-dom';
import type { Jyucyu } from '../../types/master';
import './printReport.css';

interface JyucyuPrintReportProps {
  items: Jyucyu[];
  startCode?: number;
  endCode?: number;
  keyword?: string;
  printDate?: Date;
}

const ITEMS_PER_PAGE = 7;

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

export const JyucyuPrintReport: React.FC<JyucyuPrintReportProps> = ({
  items,
  startCode,
  endCode,
  keyword,
  printDate = new Date(),
}) => {
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const pages: Jyucyu[][] = [];

  for (let i = 0; i < totalPages; i++) {
    pages.push(items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
  }

  const formattedDate = formatPrintDateTime(printDate);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="erp-print-container erp-report-ad1780c" aria-hidden="true">
      {pages.map((pageItems, pageIdx) => (
        <div key={pageIdx} className="erp-print-page">
          {/* Header per AD1780C Official Specification */}
          <div className="erp-print-header">
            <div className="erp-print-header-id">ID: AD1780C</div>
            <div className="erp-print-header-title">受 注 先 マ ス タ 一 覧 表</div>
            <div className="erp-print-header-meta">
              <div>作成日: {formattedDate}</div>
              <div>{pageIdx + 1} / {totalPages} 頁</div>
            </div>
          </div>

          {/* Master Table Grid */}
          <table className="erp-print-table">
            <colgroup>
              <col style={{ width: '7%' }} />   {/* 受注先CD */}
              <col style={{ width: '21%' }} />  {/* 受注先名 / 略称・カナ / 責任者 */}
              <col style={{ width: '9%' }} />   {/* 郵便番号 / 請求締日 / 掛率 */}
              <col style={{ width: '25%' }} />  {/* 住所１・２ / 集金日・回収方法 / 取引区分 */}
              <col style={{ width: '15%' }} />  {/* TEL / FAX / 請求書式・手形割合 */}
              <col style={{ width: '23%' }} />  {/* メール / 備考1 / 備考2 / 備考3 */}
            </colgroup>

            <thead>
              <tr className="th-top">
                <th rowSpan={4} style={{ textAlign: 'center', verticalAlign: 'middle' }}>受注先CD</th>
                <th>受注先名</th>
                <th>郵便番号</th>
                <th>住所１</th>
                <th>ＴＥＬ</th>
                <th>メールアドレス</th>
              </tr>
              <tr className="th-sub">
                <th></th>
                <th></th>
                <th>住所２</th>
                <th>ＦＡＸ</th>
                <th>備考１</th>
              </tr>
              <tr className="th-sub">
                <th>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>略称</span>
                    <span>カナ名</span>
                  </div>
                </th>
                <th>請求締日</th>
                <th>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>集金日</span>
                    <span>回収方法</span>
                  </div>
                </th>
                <th>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>請求書式</span>
                    <span>手形割合</span>
                  </div>
                </th>
                <th>備考２</th>
              </tr>
              <tr className="th-bot">
                <th>責任者</th>
                <th>掛率</th>
                <th>取引区分</th>
                <th></th>
                <th>備考３</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                    該当する受注先データはありません。
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => {
                  // Format fields without noisy '-' fallbacks
                  const simeDdText = item.simeDd !== undefined && item.simeDd !== null
                    ? (item.simeDd === 99 || item.simeDd === 0 ? '末日' : `${item.simeDd}日`)
                    : '';

                  const syukinMmText = item.syukinMm === 1
                    ? '翌月'
                    : item.syukinMm === 2
                    ? '翌々月'
                    : item.syukinMm === 0
                    ? '当月'
                    : item.syukinMm
                    ? `${item.syukinMm}ヶ月後`
                    : '';

                  const syukinDdText = item.syukinDd !== undefined && item.syukinDd !== null
                    ? (item.syukinDd === 99 || item.syukinDd === 0 ? '末日' : `${item.syukinDd}日`)
                    : '';

                  const syukinFull = (syukinMmText || syukinDdText)
                    ? [syukinMmText, syukinDdText].filter(Boolean).join(' ')
                    : '';

                  const syosikiText = item.syosiki === 2 ? '2:指定' : item.syosiki === 1 ? '1:自社' : '';
                  const tegataText = (item.tegata !== undefined && item.tegata !== null && item.genkin !== undefined && item.genkin !== null)
                    ? (item.tegata === 0 && item.genkin === 0 ? '' : `${item.tegata}:${item.genkin}`)
                    : '';

                  const toriKbText = item.toriKb === 2 ? '2: 現金取引' : item.toriKb === 1 ? '1: 通常取引' : '';
                  const kakeRtText = item.kakeRt !== undefined && item.kakeRt !== null ? `${item.kakeRt}%` : '';

                  const zipText = item.yubin
                    ? (item.yubin.includes('-') ? `〒${item.yubin}` : `〒${item.yubin.slice(0, 3)}-${item.yubin.slice(3)}`)
                    : '';

                  return (
                    <React.Fragment key={item.code}>
                      {/* Sub-row 1 (Header Row 1 match) */}
                      <tr className="sub-row">
                        <td rowSpan={4} className="code-cell">
                          {item.code}
                        </td>
                        <td>
                          <span className="erp-print-val-bold">{item.name || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{zipText}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.jyusyo1 || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.tel || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.mail || ''}</span>
                        </td>
                      </tr>

                      {/* Sub-row 2 (Header Row 2 match: 住所2, FAX, 備考1) */}
                      <tr className="sub-row">
                        <td></td>
                        <td></td>
                        <td>
                          <span className="erp-print-val">{item.jyusyo2 || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.fax || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.biko1 || ''}</span>
                        </td>
                      </tr>

                      {/* Sub-row 3 (Header Row 3 match: 略称/カナ, 締日, 集金日/回収, 書式/手形, 備考2) */}
                      <tr className="sub-row">
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="erp-print-val">{item.ryaku || ''}</span>
                            <span className="erp-print-val" style={{ fontSize: '7.5pt', color: '#334155' }}>
                              {item.kana || ''}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="erp-print-val">{simeDdText}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="erp-print-val">{syukinFull}</span>
                            <span className="erp-print-val">{item.kaisyu || ''}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="erp-print-val">{syosikiText}</span>
                            <span className="erp-print-val">{tegataText}</span>
                          </div>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.biko2 || ''}</span>
                        </td>
                      </tr>

                      {/* Sub-row 4 (Header Row 4 match: 責任者, 掛率, 取引区分, 備考3) */}
                      <tr className="sub-row-last">
                        <td>
                          <span className="erp-print-val">{item.sekinin || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{kakeRtText}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{toriKbText}</span>
                        </td>
                        <td></td>
                        <td>
                          <span className="erp-print-val">{item.biko3 || ''}</span>
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
                受注先CD [ {startCode ?? '最初'} 〜 {endCode ?? '最後'} ]
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
