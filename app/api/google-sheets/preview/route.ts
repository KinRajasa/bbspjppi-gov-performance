import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { fetchXlsxPreview } from '@/lib/xlsx-preview';

type PreviewRequestBody = {
  spreadsheet: string;
  worksheetName: string;
};

type QuarterValue = {
  quarter: number;
  targetValue: number | null;
  realizationValue: number | null;
  targetIsPercentage: boolean;
  realizationIsPercentage: boolean;
};

function extractSpreadsheetId(input: string): string | null {
  const value = input.trim();

  if (/^[a-zA-Z0-9-_]{20,}$/.test(value)) {
    return value;
  }

  const match = value.match(
    /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/
  );

  return match?.[1] ?? null;
}

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function parseNumber(
  value: unknown,
  isPercentage = false
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  const hasPercentSymbol = text.endsWith('%');
  const numberText = text.replace(/%/g, '').replace(/\s/g, '');
  // Indonesia: 1.234,56 -> 1234.56. Angka 88.50 tanpa koma tetap 88.50,
  // bukan 8850 (bug parser lama pada nilai persentase desimal).
  const normalized = numberText.includes(',')
    ? numberText.replace(/\./g, '').replace(',', '.')
    : numberText;
  const number = Number(normalized);
  if (!Number.isFinite(number)) return null;
  return isPercentage && !hasPercentSymbol && Math.abs(number) <= 1 ? number * 100 : number;
}

function isPercentageFormat(
  numberFormatType?: string | null
): boolean {
  return numberFormatType === 'PERCENT';
}

function findQuarterIndex(value: unknown): number | null {
  const text = normalizeText(value);

  const patterns: Record<string, number> = {
    'tw i': 1,
    'tw 1': 1,
    'triwulan i': 1,
    'triwulan 1': 1,
    'q1': 1,
    'i': 1,

    'tw ii': 2,
    'tw 2': 2,
    'triwulan ii': 2,
    'triwulan 2': 2,
    'q2': 2,
    'ii': 2,

    'tw iii': 3,
    'tw 3': 3,
    'triwulan iii': 3,
    'triwulan 3': 3,
    'q3': 3,
    'iii': 3,

    'tw iv': 4,
    'tw 4': 4,
    'triwulan iv': 4,
    'triwulan 4': 4,
    'q4': 4,
    'iv': 4,
  };

  return patterns[text] ?? null;
}

function findQuarterColumns(headerRow: unknown[]) {
  const columns: Record<number, number> = {};

  headerRow.forEach((value, index) => {
    const quarter = findQuarterIndex(value);

    if (quarter && columns[quarter] === undefined) {
      columns[quarter] = index;
    }
  });

  return columns;
}

function getRowLabel(row: unknown[]): string {
  return normalizeText(
    row.find((value) => {
      const text = normalizeText(value);

      return (
        text === 'target' ||
        text === 'realisasi' ||
        text.includes('target') ||
        text.includes('realisasi')
      );
    })
  );
}

function getServiceAccountAuth() {
  const clientEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ??
    process.env.GOOGLE_CLIENT_EMAIL;

  const privateKeyRaw =
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ??
    process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKeyRaw) {
    throw new Error(
      'Konfigurasi Google Service Account belum lengkap.'
    );
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
    ],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body =
      (await request.json()) as PreviewRequestBody;

    const { spreadsheet, worksheetName } = body;

    if (!spreadsheet?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'URL Google Spreadsheet wajib diisi.',
        },
        { status: 400 }
      );
    }

    if (!worksheetName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Worksheet wajib dipilih.',
        },
        { status: 400 }
      );
    }

    // Google Spreadsheet publik dapat dibaca sebagai XLSX langsung melalui
    // endpoint export Google. URL XLSX dari storage lain juga didukung.
    // Jika export Google gagal (misalnya spreadsheet privat), alur lama
    // Google Sheets API tetap dicoba dengan kredensial service account.
    const spreadsheetIdFromUrl = extractSpreadsheetId(spreadsheet);
    const isGoogleSpreadsheetUrl = /docs\.google\.com\/spreadsheets\/d\//i.test(spreadsheet);
    const isDirectXlsxUrl = /^https?:\/\//i.test(spreadsheet) && !isGoogleSpreadsheetUrl;
    if (isGoogleSpreadsheetUrl || isDirectXlsxUrl) {
      const xlsxUrl = isGoogleSpreadsheetUrl && spreadsheetIdFromUrl
        ? `https://docs.google.com/spreadsheets/d/${spreadsheetIdFromUrl}/export?format=xlsx`
        : spreadsheet.trim();
      try {
        const preview = await fetchXlsxPreview(xlsxUrl, worksheetName.trim(), spreadsheetIdFromUrl ?? spreadsheet.trim());
        return NextResponse.json({ success: true, ...preview, sourceType: 'XLSX_ONLINE' });
      } catch (xlsxError) {
        if (isDirectXlsxUrl) throw xlsxError;
        console.warn('[GOOGLE_SHEETS_XLSX_EXPORT_FALLBACK]', xlsxError);
      }
    }

    const spreadsheetId =
      extractSpreadsheetId(spreadsheet);

    if (!spreadsheetId) {
      return NextResponse.json(
        {
          success: false,
          message:
            'URL Google Spreadsheet tidak valid.',
        },
        { status: 400 }
      );
    }

    const auth = getServiceAccountAuth();

    const sheets = google.sheets({
      version: 'v4',
      auth,
    });

    /*
     * Ambil metadata worksheet sekaligus grid data.
     */
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: true,
      ranges: [
        `'${worksheetName.replace(/'/g, "''")}'!A1:Z100`,
      ],
    });

    const worksheet = response.data.sheets?.find(
      (sheet) =>
        sheet.properties?.title?.trim() ===
        worksheetName.trim()
    );

    if (!worksheet) {
      const availableSheets =
        response.data.sheets
          ?.map((sheet) => sheet.properties?.title)
          .filter(Boolean)
          .join(', ');

      return NextResponse.json(
        {
          success: false,
          message:
            `Worksheet "${worksheetName}" tidak ditemukan.` +
            (availableSheets
              ? ` Worksheet tersedia: ${availableSheets}`
              : ''),
        },
        { status: 404 }
      );
    }

    const gridData =
      worksheet.data?.[0];

    const rows =
      gridData?.rowData ?? [];

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Worksheet "${worksheetName}" tidak memiliki data.`,
        },
        { status: 404 }
      );
    }

    /*
     * ==========================================================
     * CARI BARIS HEADER
     * ==========================================================
     */
    let headerRowIndex = -1;
    let quarterColumns: Record<number, number> = {};

    for (
      let rowIndex = 0;
      rowIndex < rows.length;
      rowIndex++
    ) {
      const values =
        rows[rowIndex].values ?? [];

      const formattedValues = values.map(
        (cell) =>
          cell.formattedValue ?? ''
      );

      const columns =
        findQuarterColumns(
          formattedValues
        );

      if (
        Object.keys(columns).length >= 2
      ) {
        headerRowIndex = rowIndex;
        quarterColumns = columns;
        break;
      }
    }

    /*
     * Fallback jika header tidak ditemukan.
     */
    if (headerRowIndex === -1) {
      headerRowIndex = 0;

      quarterColumns = {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
      };
    }

    /*
     * ==========================================================
     * CARI BARIS TARGET & REALISASI
     * ==========================================================
     */
    let targetRowIndex: number | null = null;
    let realizationRowIndex: number | null = null;

    for (
      let rowIndex = headerRowIndex + 1;
      rowIndex < rows.length;
      rowIndex++
    ) {
      const values =
        rows[rowIndex].values ?? [];

      const formattedValues =
        values.map(
          (cell) =>
            cell.formattedValue ?? ''
        );

      const label =
        getRowLabel(formattedValues);

      if (
        label.includes('target')
      ) {
        targetRowIndex = rowIndex;
      }

      if (
        label.includes('realisasi')
      ) {
        realizationRowIndex = rowIndex;
      }
    }

    const specialOffset = specialRealizationOffset(worksheetName);
    if (specialOffset) {
      realizationRowIndex = specialOffset.row;
      quarterColumns = { 1: specialOffset.column, 2: specialOffset.column + 1, 3: specialOffset.column + 2, 4: specialOffset.column + 3 };
      if (targetRowIndex === null && specialOffset.row > 0) targetRowIndex = specialOffset.row - 1;
    }

    const warnings: string[] = [];

    if (targetRowIndex === null) {
      warnings.push(
        'Baris Target tidak ditemukan.'
      );
    }

    if (realizationRowIndex === null) {
      warnings.push(
        'Baris Realisasi tidak ditemukan.'
      );
    }

    /*
     * ==========================================================
     * BUAT QUARTER VALUES
     * ==========================================================
     */
    const quarterValues =
      [1, 2, 3, 4].map(
        (quarter) => {
          const columnIndex =
            quarterColumns[quarter];

          if (
            columnIndex === undefined
          ) {
            return {
              quarter,
              targetValue: null,
              realizationValue: null,
              targetIsPercentage: false,
              realizationIsPercentage: false,
            };
          }

          /*
           * TARGET
           */
          let targetValue: number | null =
            null;

          let targetIsPercentage =
            false;

          if (
            targetRowIndex !== null
          ) {
            const cell =
              rows[targetRowIndex]
                ?.values?.[columnIndex];

            const formatType =
              cell?.effectiveFormat
                ?.numberFormat
                ?.type;

            targetIsPercentage =
              isPercentageFormat(
                formatType
              );

            targetValue =
              parseNumber(
                cell?.formattedValue,
                targetIsPercentage
              );
          }

          /*
           * REALISASI
           */
          let realizationValue:
            number | null = null;

          let realizationIsPercentage =
            false;

          if (
            realizationRowIndex !==
            null
          ) {
            const cell =
              rows[realizationRowIndex]
                ?.values?.[columnIndex];

            const formatType =
              cell?.effectiveFormat
                ?.numberFormat
                ?.type;

            realizationIsPercentage =
              isPercentageFormat(
                formatType
              );

            realizationValue =
              parseNumber(
                cell?.formattedValue,
                realizationIsPercentage
              );
          }

          return {
            quarter,
            targetValue,
            realizationValue,
            targetIsPercentage,
            realizationIsPercentage,
          };
        }
      );

    return NextResponse.json({
      success: true,
      spreadsheetId,
      worksheetName:
        worksheetName.trim(),
      quarterValues,
      warnings: [
        ...new Set(warnings),
      ],
    });
  } catch (error) {
    console.error(
      '[GOOGLE_SHEETS_PREVIEW_ERROR]',
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Google Spreadsheet tidak dapat dibaca.',
      },
      { status: 500 }
    );
  }
}

// Offset khusus template Excel instansi (A1 dikonversi menjadi indeks array).
const realizationOffsets: Record<string, { row: number; column: number }> = {
  'tj 2': { row: 3, column: 4 },
  tj2: { row: 3, column: 4 },
  'sk.1.1': { row: 4, column: 2 },
  'sk1.1': { row: 4, column: 2 },
  'sk 1.1': { row: 4, column: 2 },
  'sk.2.1': { row: 3, column: 2 },
  'sk2.1': { row: 3, column: 2 },
  'sk 2.1': { row: 3, column: 2 },
  'sk.2.2': { row: 3, column: 1 },
  'sk2.2': { row: 3, column: 1 },
  'sk 2.2': { row: 3, column: 1 },
  's.k.7.1': { row: 3, column: 1 },
  's.k.7.1.': { row: 3, column: 1 },
};

function specialRealizationOffset(worksheetName: string) {
  const key = normalizeText(worksheetName).replace(/\.+$/, '');
  return realizationOffsets[key] ?? realizationOffsets[key.replace(/\s/g, '')];
}
