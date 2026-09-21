import 'server-only';

import { google } from 'googleapis';

export type QuarterNumber = 1 | 2 | 3 | 4;

export type QuarterlyValue = {
  quarter: QuarterNumber;
  targetValue: number | null;
  realizationValue: number | null;
};

export type ParsedWorksheet = {
  worksheetName: string;
  quarterValues: QuarterlyValue[];
  warnings: string[];
};

const GOOGLE_SHEETS_READ_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const MAX_HEADER_SCAN_ROWS = 12;

function getGoogleAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  // Permit values copied from a JSON service-account file, while keeping the
  // canonical .env format (BEGIN/END PRIVATE KEY with escaped newlines).
  const privateKey = rawPrivateKey
    ?.replace(/^['"]/, '')
    .replace(/['"],?\s*$/, '')
    .replace(/\\n/g, '\n');

  if (!email || !privateKey) {
    throw new Error(
      'Kredensial Google Sheets belum lengkap. Isi GOOGLE_SERVICE_ACCOUNT_EMAIL dan GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY pada .env.local.',
    );
  }

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: [GOOGLE_SHEETS_READ_SCOPE],
  });
}

export function extractSpreadsheetId(value: string) {
  const trimmedValue = value.trim();
  const urlMatch = trimmedValue.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

  return urlMatch?.[1] ?? trimmedValue;
}

function normalizeText(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function getQuarterByHeader(value: unknown): QuarterNumber | null {
  const normalized = normalizeText(value)
    .replace(/triwulan/g, 'tw')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ');

  if (/(^|\s)tw\s*(i|1)($|\s)/.test(normalized)) return 1;
  if (/(^|\s)tw\s*(ii|2)($|\s)/.test(normalized)) return 2;
  if (/(^|\s)tw\s*(iii|3)($|\s)/.test(normalized)) return 3;
  if (/(^|\s)tw\s*(iv|4)($|\s)/.test(normalized)) return 4;
  return null;
}

function parseNumericValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value === null || value === undefined || String(value).trim() === '') return null;

  const rawValue = String(value).trim().replace(/\s/g, '');
  const lastComma = rawValue.lastIndexOf(',');
  const lastDot = rawValue.lastIndexOf('.');
  let normalizedValue = rawValue;

  if (lastComma >= 0 && lastDot >= 0) {
    normalizedValue =
      lastComma > lastDot ? rawValue.replace(/\./g, '').replace(',', '.') : rawValue.replace(/,/g, '');
  } else if (lastComma >= 0) {
    normalizedValue = rawValue.replace(',', '.');
  }

  normalizedValue = normalizedValue.replace(/[^0-9.-]/g, '');
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function findQuarterColumns(rows: unknown[][]) {
  for (let rowIndex = 0; rowIndex < Math.min(rows.length, MAX_HEADER_SCAN_ROWS); rowIndex += 1) {
    const matches = new Map<QuarterNumber, number>();

    rows[rowIndex].forEach((cell, columnIndex) => {
      const quarter = getQuarterByHeader(cell);
      if (quarter && !matches.has(quarter)) matches.set(quarter, columnIndex);
    });

    if (matches.size === 4) {
      return { headerRowIndex: rowIndex, columns: matches };
    }
  }

  return null;
}

function findLabeledRow(rows: unknown[][], label: 'target' | 'realisasi', startIndex: number) {
  const endIndex = Math.min(rows.length, startIndex + 7);

  for (let rowIndex = startIndex; rowIndex < endIndex; rowIndex += 1) {
    const matchesLabel = rows[rowIndex].some((cell) => {
      const text = normalizeText(cell);
      return label === 'target' ? text.includes('target') : text.includes('realisasi');
    });

    if (matchesLabel) return rowIndex;
  }

  return null;
}

/**
 * Parses the summary block used by the institutional draft:
 * a header row with TW I - TW IV, followed by Target and Realisasi rows.
 */
export function parseQuarterlyWorksheet(worksheetName: string, values: unknown[][]): ParsedWorksheet {
  const header = findQuarterColumns(values);

  if (!header) {
    throw new Error(
      `Worksheet ${worksheetName} tidak memiliki empat header Triwulan I–IV pada area ringkasan.`,
    );
  }

  const targetRowIndex = findLabeledRow(values, 'target', header.headerRowIndex + 1);
  const realizationRowIndex = findLabeledRow(values, 'realisasi', header.headerRowIndex + 1);
  const warnings: string[] = [];

  if (targetRowIndex === null) warnings.push('Baris Target tidak ditemukan. Nilai target akan kosong.');
  if (realizationRowIndex === null) warnings.push('Baris Realisasi tidak ditemukan. Nilai realisasi akan kosong.');

  const quarterValues: QuarterlyValue[] = ([1, 2, 3, 4] as QuarterNumber[]).map((quarter) => {
    const columnIndex = header.columns.get(quarter);

    return {
      quarter,
      targetValue:
        targetRowIndex === null || columnIndex === undefined
          ? null
          : parseNumericValue(values[targetRowIndex]?.[columnIndex]),
      realizationValue:
        realizationRowIndex === null || columnIndex === undefined
          ? null
          : parseNumericValue(values[realizationRowIndex]?.[columnIndex]),
    };
  });

  if (quarterValues.every(({ targetValue, realizationValue }) => targetValue === null && realizationValue === null)) {
    throw new Error(`Worksheet ${worksheetName} tidak memiliki angka Target atau Realisasi pada ringkasan triwulan.`);
  }

  return { worksheetName, quarterValues, warnings };
}

export async function readQuarterlyWorksheet(spreadsheetIdOrUrl: string, worksheetName: string) {
  const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
  const sheets = google.sheets({ version: 'v4', auth: getGoogleAuth() });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${worksheetName.replace(/'/g, "''")}'!A1:ZZ35`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  });

  return {
    spreadsheetId,
    ...parseQuarterlyWorksheet(worksheetName, response.data.values ?? []),
  };
}
