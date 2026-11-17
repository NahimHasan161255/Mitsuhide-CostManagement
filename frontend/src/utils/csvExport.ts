/**
 * Utility to export data to CSV with UTF-8 BOM so Microsoft Excel
 * in Japanese locale opens Japanese text properly without garbled characters (文字化け).
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  columns: { header: string; key: keyof T | ((item: T) => any) }[],
  data: T[]
) {
  if (!data || data.length === 0) {
    return;
  }

  const headerRow = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');
  const rows = data.map((item) =>
    columns
      .map((col) => {
        let val = typeof col.key === 'function' ? col.key(item) : item[col.key];
        if (val === null || val === undefined) val = '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
