// Utility to export tabular data to CSV with UTF-8 BOM for Microsoft Excel compatibility

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][],
) {
  const sanitize = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    // Escape double quotes by doubling them
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const headerLine = headers.map(sanitize).join(',');
  const rowLines = rows.map((r) => r.map(sanitize).join(','));
  const csvContent = [headerLine, ...rowLines].join('\r\n');

  // Prepend UTF-8 BOM so Excel on Windows recognizes Indonesian characters/accents cleanly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename.endsWith('.csv') ? filename : `${filename}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
