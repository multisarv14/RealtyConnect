/** Real file exports: CSV (opens in Excel) and a print view that can be saved as PDF. */

export interface ExportColumn {
  key: string;
  label: string;
}

const cell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const escapeCsv = (value: string) => (/[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function downloadCsv(filename: string, columns: ExportColumn[], rows: Record<string, unknown>[]): void {
  const lines = [columns.map(c => escapeCsv(c.label)).join(','), ...rows.map(r => columns.map(c => escapeCsv(cell(r[c.key]))).join(','))];
  // The BOM makes Excel read the file as UTF-8 (rupee signs, Indian names).
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const html = (value: string) => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] as string);

/** Opens a clean printable table; the browser's print dialog can save it as PDF. */
export function printReport(title: string, columns: ExportColumn[], rows: Record<string, unknown>[], subtitle = ''): boolean {
  const win = window.open('', '_blank', 'width=1000,height=800');
  if (!win) return false;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${html(title)}</title>
<style>
  body{font:13px/1.45 Inter,Segoe UI,Arial,sans-serif;color:#0f172a;margin:32px}
  h1{font-size:20px;margin:0 0 4px} p{margin:0 0 16px;color:#475569}
  table{border-collapse:collapse;width:100%} th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left;vertical-align:top}
  th{background:#f1f5f9;font-weight:600} tr:nth-child(even) td{background:#f8fafc}
  @media print{body{margin:12mm}}
</style></head><body>
<h1>${html(title)}</h1><p>${html(subtitle || `Generated ${new Date().toLocaleString('en-IN')}`)}</p>
<table><thead><tr>${columns.map(c => `<th>${html(c.label)}</th>`).join('')}</tr></thead>
<tbody>${rows.map(r => `<tr>${columns.map(c => `<td>${html(cell(r[c.key]))}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${columns.length}">No records.</td></tr>`}</tbody></table>
</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
  return true;
}
