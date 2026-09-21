import * as XLSX from 'xlsx';

export type XlsxQuarterValue = {
  quarter: number;
  targetValue: number | null;
  realizationValue: number | null;
  targetIsPercentage: boolean;
  realizationIsPercentage: boolean;
};

export type XlsxPreview = {
  spreadsheetId: string;
  worksheetName: string;
  quarterValues: XlsxQuarterValue[];
  warnings: string[];
};

function normalize(value: unknown) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function quarterNumber(value: unknown) {
  const text = normalize(value).replace(/[.]/g, '');
  const patterns: Record<string, number> = {
    'tw i': 1, 'tw 1': 1, 'triwulan i': 1, 'triwulan 1': 1, q1: 1, i: 1,
    'tw ii': 2, 'tw 2': 2, 'triwulan ii': 2, 'triwulan 2': 2, q2: 2, ii: 2,
    'tw iii': 3, 'tw 3': 3, 'triwulan iii': 3, 'triwulan 3': 3, q3: 3, iii: 3,
    'tw iv': 4, 'tw 4': 4, 'triwulan iv': 4, 'triwulan 4': 4, q4: 4, iv: 4,
  };
  return patterns[text] ?? null;
}

function findQuarterColumns(row: unknown[]) {
  const result: Record<number, number> = {};
  row.forEach((value, index) => {
    const quarter = quarterNumber(value);
    if (quarter && result[quarter] === undefined) result[quarter] = index;
  });
  return result;
}

function parseNumber(value: unknown) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const isPercentage = raw.includes('%');
  const text = raw.replace(/%/g, '').replace(/\s/g, '');
  const normalized = text.includes(',')
    ? text.replace(/\./g, '').replace(',', '.')
    : text;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? { value: parsed, isPercentage } : null;
}

function rowLabel(row: unknown[]) {
  return row.slice(0, 5).map(normalize).find((value) => value === 'target' || value.startsWith('target ' ) || value === 'realisasi' || value.startsWith('realisasi ')) ?? '';
}

function readQuarterValues(row: unknown[] | undefined, columns: Record<number, number>) {
  const values = [1, 2, 3, 4].map((quarter) => {
    const parsed = row && columns[quarter] !== undefined ? parseNumber(row[columns[quarter]]) : null;
    return { value: parsed?.value ?? null, isPercentage: parsed?.isPercentage ?? false };
  });

  // Beberapa worksheet hanya menulis satu target tahunan, bukan empat target
  // per triwulan. Gunakan nilai tunggal tersebut untuk semua TW agar data tidak
  // hilang saat disimpan ke empat kolom quarterValues.
  if (values.every((item) => item.value === null) && row) {
    const fallback = row.map(parseNumber).find(Boolean);
    if (fallback) return values.map(() => ({ value: fallback.value, isPercentage: fallback.isPercentage }));
  }
  const present = values.filter((item) => item.value !== null);
  if (present.length === 1) {
    return values.map(() => ({ value: present[0].value, isPercentage: present[0].isPercentage }));
  }
  return values;
}

export function parseXlsxBuffer(buffer: Buffer | ArrayBuffer, worksheetName: string, spreadsheetId: string): XlsxPreview {
  const input = buffer instanceof ArrayBuffer ? Buffer.from(buffer) : buffer;
  const workbook = XLSX.read(input, { type: 'buffer', cellStyles: true, cellNF: true, raw: false });
  const sheet = workbook.Sheets[worksheetName];
  if (!sheet) {
    throw new Error(`Worksheet "${worksheetName}" tidak ditemukan. Worksheet tersedia: ${workbook.SheetNames.join(', ')}`);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false }) as unknown[][];
  if (rows.length === 0) throw new Error(`Worksheet "${worksheetName}" tidak memiliki data.`);

  let headerRowIndex = -1;
  let columns: Record<number, number> = {};
  for (let index = 0; index < rows.length; index += 1) {
    const found = findQuarterColumns(rows[index]);
    if (Object.keys(found).length >= 2) {
      headerRowIndex = index;
      columns = found;
      break;
    }
  }
  if (headerRowIndex < 0) {
    headerRowIndex = 0;
    columns = { 1: 1, 2: 2, 3: 3, 4: 4 };
  }

  let targetRow: unknown[] | undefined;
  let realizationRow: unknown[] | undefined;
  for (let index = headerRowIndex + 1; index < Math.min(rows.length, headerRowIndex + 10); index += 1) {
    const label = rowLabel(rows[index]);
    if (!targetRow && label.startsWith('target')) targetRow = rows[index];
    if (!realizationRow && label.startsWith('realisasi')) realizationRow = rows[index];
    if (targetRow && realizationRow) break;
  }

  const target = readQuarterValues(targetRow, columns);
  const realization = readQuarterValues(realizationRow, columns);
  const warnings: string[] = [];
  if (!targetRow) warnings.push('Baris Target tidak ditemukan.');
  if (!realizationRow) warnings.push('Baris Realisasi tidak ditemukan.');

  return {
    spreadsheetId,
    worksheetName,
    quarterValues: [1, 2, 3, 4].map((quarter, index) => ({
      quarter,
      targetValue: target[index].value,
      realizationValue: realization[index].value,
      targetIsPercentage: target[index].isPercentage,
      realizationIsPercentage: realization[index].isPercentage,
    })),
    warnings,
  };
}

export async function fetchXlsxPreview(source: string, worksheetName: string, spreadsheetId: string) {
  const response = await fetch(source, { cache: 'no-store', signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`File XLSX tidak dapat diambil (HTTP ${response.status}).`);
  const contentType = response.headers.get('content-type') ?? '';
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.subarray(0, 2).equals(Buffer.from('PK'))) {
    throw new Error(`URL tidak mengembalikan file XLSX. Content-Type: ${contentType || 'tidak diketahui'}.`);
  }
  return parseXlsxBuffer(buffer, worksheetName, spreadsheetId);
}
