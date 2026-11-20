import React from 'react';
import { createPortal } from 'react-dom';
import type { Siire } from '../../types/master';
import './printReport.css';

interface SiirePrintReportProps {
  items: Siire[];
  startCode?: number;
  endCode?: number;
  keyword?: string;
  printDate?: Date;
}

const ITEMS_PER_PAGE = 6;

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

export const SiirePrintReport: React.FC<SiirePrintReportProps> = ({
  items,
  startCode,
  endCode,
  keyword,
  printDate = new Date(),
}) => {
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const pages: Siire[][] = [];

  for (let i = 0; i < totalPages; i++) {
    pages.push(items.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
  }

  const formattedDate = formatPrintDateTime(printDate);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="erp-print-container" aria-hidden="true">
      {pages.map((pageItems, pageIdx) => (
        <div key={pageIdx} className="erp-print-page">
          {/* Header per AD1790C Official Specification */}
          <div className="erp-print-header">
            <div className="erp-print-header-id">ID: AD1790C</div>
            <div className="erp-print-header-title">仕 入 先 マ ス タ 一 覧 表</div>
            <div className="erp-print-header-meta">
              <div>作成日: {formattedDate}</div>
              <div>
                {pageIdx + 1} / {totalPages} 頁
              </div>
            </div>
          </div>

          {/* Master Table Grid */}
          <table className="erp-print-table">
            <colgroup>
              <col style={{ width: '7%' }} />   {/* 仕入先CD */}
              <col style={{ width: '21%' }} />  {/* 仕入先名 / 略称・カナ / 責任者 / 業種 */}
              <col style={{ width: '9%' }} />   {/* 郵便番号 / 支払締日 */}
              <col style={{ width: '25%' }} />  {/* 住所１・２ / 支払方法 / 銀行・支店 / 口座種別・番号・名義 */}
              <col style={{ width: '15%' }} />  {/* TEL / FAX / 利息 */}
              <col style={{ width: '23%' }} />  {/* メール / 備考1 / 備考2 / 備考3 */}
            </colgroup>

            <thead>
              {/* Row 1 */}
              <tr className="th-top">
                <th rowSpan={5} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  仕入先CD
                </th>
                <th>仕入先名</th>
                <th>郵便番号</th>
                <th>住所１</th>
                <th>ＴＥＬ</th>
                <th>メールアドレス</th>
              </tr>

              {/* Row 2 */}
              <tr className="th-sub">
                <th></th>
                <th></th>
                <th>住所２</th>
                <th>ＦＡＸ</th>
                <th>備考１</th>
              </tr>

              {/* Row 3 */}
              <tr className="th-sub">
                <th>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>略称</span>
                    <span>カナ名</span>
                  </div>
                </th>
                <th>支払締日</th>
                <th>支払方法</th>
                <th>利息</th>
                <th>備考２</th>
              </tr>

              {/* Row 4 */}
              <tr className="th-sub">
                <th>責任者</th>
                <th></th>
                <th>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>銀行名</span>
                    <span>支店名</span>
                  </div>
                </th>
                <th></th>
                <th>備考３</th>
              </tr>

              {/* Row 5 */}
              <tr className="th-bot">
                <th>業種</th>
                <th></th>
                <th>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>口座種別</span>
                    <span>口座番号</span>
                    <span>口座名義人</span>
                  </div>
                </th>
                <th></th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                    該当する仕入先データはありません。
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => {
                  const simeDdText =
                    item.simeDd !== undefined && item.simeDd !== null
                      ? item.simeDd === 99 || item.simeDd === 0 || item.simeDd === 31
                        ? '末日'
                        : `${item.simeDd}日`
                      : '';

                  const risokuText =
                    item.risoku !== undefined && item.risoku !== null
                      ? `${item.risoku}%`
                      : '';

                  const kozaSbText =
                    item.kozaSb === 2 ? '2:当座' : item.kozaSb === 1 ? '1:普通' : '';

                  const zipText = item.yubin
                    ? item.yubin.includes('-')
                      ? `〒${item.yubin}`
                      : `〒${item.yubin.slice(0, 3)}-${item.yubin.slice(3)}`
                    : '';

                  return (
                    <React.Fragment key={item.code}>
                      {/* Sub-row 1: 仕入先名, 郵便番号, 住所1, TEL, メール */}
                      <tr className="sub-row">
                        <td rowSpan={5} className="code-cell">
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

                      {/* Sub-row 2: 住所2, FAX, 備考1 */}
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

                      {/* Sub-row 3: 略称/カナ, 支払締日, 支払方法, 利息, 備考2 */}
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
                          <span className="erp-print-val">{item.siharai || ''}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{risokuText}</span>
                        </td>
                        <td>
                          <span className="erp-print-val">{item.biko2 || ''}</span>
                        </td>
                      </tr>

                      {/* Sub-row 4: 責任者, 銀行名/支店名, 備考3 */}
                      <tr className="sub-row">
                        <td>
                          <span className="erp-print-val">{item.sekinin || ''}</span>
                        </td>
                        <td></td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="erp-print-val">{item.bnkNm || ''}</span>
                            <span className="erp-print-val">{item.stnNm || ''}</span>
                          </div>
                        </td>
                        <td></td>
                        <td>
                          <span className="erp-print-val">{item.biko3 || ''}</span>
                        </td>
                      </tr>

                      {/* Sub-row 5: 業種, 口座種別/口座番号/口座名義人 */}
                      <tr className="sub-row-last">
                        <td>
                          <span className="erp-print-val">{item.gyousyu || ''}</span>
                        </td>
                        <td></td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <span className="erp-print-val">{kozaSbText}</span>
                            <span className="erp-print-val">{item.kozaNo || ''}</span>
                            <span className="erp-print-val" style={{ fontWeight: 600 }}>
                              {item.kozaNm || ''}
                            </span>
                          </div>
                        </td>
                        <td></td>
                        <td></td>
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
                仕入先CD [ {startCode ?? '最初'} 〜 {endCode ?? '最後'} ]
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
