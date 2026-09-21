import { readFile } from 'node:fs/promises';
import path from 'node:path';
import ExcelJS from 'exceljs';
import { NextRequest, NextResponse } from 'next/server';
import { SubmissionStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readSessionToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ORGANIZATION = 'BALAI BESAR STANDARDISASI DAN PELAYANAN JASA INDUSTRI PENCEGAHAN PENCEMARAN INDUSTRI';
const TEMPLATE = path.join(process.cwd(), 'public', 'templates', 'rencana-aksi-template.xlsx');

function decimal(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function cleanText(value: unknown) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value && 'richText' in value) {
    return (value as { richText?: Array<{ text?: string }> }).richText?.map((part) => part.text ?? '').join('') ?? '';
  }
  return String(value);
}

function formatTarget(value: number | null, unit: string) {
  if (value === null) return '';
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 6 }).format(value)} ${unit}`.trim();
}

function toPercent(value: number | null) {
  return value === null ? null : Math.max(0, Math.min(100, value)) / 100;
}

function setCellValue(sheet: ExcelJS.Worksheet, address: string, value: ExcelJS.CellValue) {
  sheet.getCell(address).value = value;
}

function thinBorder(): Partial<ExcelJS.Borders> {
  return {
    top: { style: 'thin', color: { argb: 'FFB8C0CC' } },
    left: { style: 'thin', color: { argb: 'FFB8C0CC' } },
    bottom: { style: 'thin', color: { argb: 'FFB8C0CC' } },
    right: { style: 'thin', color: { argb: 'FFB8C0CC' } },
  };
}

function removeAllMerges(sheet: ExcelJS.Worksheet) {
  const merges = Object.keys((sheet as ExcelJS.Worksheet & { _merges?: Record<string, unknown> })._merges ?? {});
  for (const range of merges) sheet.unMergeCells(range);
}

function configureColumns(sheet: ExcelJS.Worksheet) {
  const widths: Record<string, number> = {
    A: 6, B: 30, C: 45, D: 18,
    E: 14, F: 40, G: 14, H: 40, I: 14, J: 40, K: 14, L: 40,
    M: 20, N: 18, O: 40, P: 35, Q: 35, R: 35, S: 30, T: 14,
  };
  for (const [column, width] of Object.entries(widths)) sheet.getColumn(column).width = width;
}

function styleHeader(sheet: ExcelJS.Worksheet) {
  const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4F8' } };
  for (const rowNumber of [5, 6, 7, 8]) {
    const row = sheet.getRow(rowNumber);
    row.height = rowNumber === 7 ? 34 : rowNumber === 8 ? 18 : 24;
    for (let column = 1; column <= 20; column += 1) {
      const cell = row.getCell(column);
      cell.fill = fill;
      cell.font = { bold: true, name: 'Calibri', size: 9, color: { argb: 'FF1F2937' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = thinBorder();
    }
  }
}

function styleData(sheet: ExcelJS.Worksheet, rowNumber: number) {
  const row = sheet.getRow(rowNumber);
  row.height = 90;
  for (let column = 1; column <= 20; column += 1) {
    const cell = row.getCell(column);
    cell.font = { name: 'Calibri', size: 9, color: { argb: 'FF111827' } };
    cell.alignment = {
      vertical: 'top',
      horizontal: column === 1 || [4, 5, 7, 9, 11, 13, 14, 20].includes(column) ? 'center' : 'left',
      wrapText: true,
    };
    cell.border = thinBorder();
  }
  for (const column of [5, 7, 9, 11]) row.getCell(column).numFmt = '0%';
}

function configureHeader(sheet: ExcelJS.Worksheet, year: number) {
  removeAllMerges(sheet);
  for (let row = 1; row <= 27; row += 1) {
    for (let column = 1; column <= 23; column += 1) sheet.getRow(row).getCell(column).value = null;
  }
  sheet.views = [{ showGridLines: true }];
  sheet.name = `Rencana Aksi ${year}`;

  for (const range of [
    'A1:T1', 'A2:T2', 'A3:T3',
    'A5:A7', 'B5:B7', 'C5:C7', 'D5:D7',
    'E5:L5', 'E6:F6', 'G6:H6', 'I6:J6', 'K6:L6',
    'M5:M7', 'N5:N7', 'O5:O7', 'P5:P7', 'Q5:Q7', 'R5:R7', 'S5:S7', 'T5:T7',
  ]) sheet.mergeCells(range);

  const headers: Array<[string, string]> = [
    ['A5', 'No.'], ['B5', 'Sasaran Kegiatan'], ['C5', 'Indikator Kinerja'], ['D5', 'Target'],
    ['E5', 'Rencana Aksi'], ['E6', 'Triwulan I'], ['G6', 'Triwulan II'], ['I6', 'Triwulan III'], ['K6', 'Triwulan IV'],
    ['E7', 'Target Antara'], ['F7', 'Rencana Kegiatan'], ['G7', 'Target Antara'], ['H7', 'Rencana Kegiatan'],
    ['I7', 'Target Antara'], ['J7', 'Rencana Kegiatan'], ['K7', 'Target Antara'], ['L7', 'Rencana Kegiatan'],
    ['M5', 'Realisasi Fisik Kumulatif'], ['N5', 'Capaian (% Fisik)'], ['O5', 'Realisasi Kegiatan'],
    ['P5', 'Evaluasi Pelaksanaan Kegiatan'], ['Q5', 'Kendala'], ['R5', 'Tindak Lanjut/Perbaikan'],
    ['S5', 'Penanggung Jawab'], ['T5', 'Timeline'],
  ];
  for (const [address, value] of headers) setCellValue(sheet, address, value);
  for (let column = 1; column <= 20; column += 1) setCellValue(sheet, `${String.fromCharCode(64 + column)}8`, column);
  styleHeader(sheet);
  sheet.getCell('A1').font = { bold: true, name: 'Calibri', size: 14, color: { argb: 'FF111827' } };
  sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell('A3').alignment = { horizontal: 'left', vertical: 'middle' };
  configureColumns(sheet);
}

export async function GET(request: NextRequest) {
  const session = readSessionToken(request.cookies.get('session')?.value);
  if (session?.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Hanya ADMIN yang dapat mengunduh Rencana Aksi.' }, { status: 403 });
  }

  const yearParam = Number(request.nextUrl.searchParams.get('year') ?? 2026);
  const quarterParam = Number(request.nextUrl.searchParams.get('quarter') ?? 4);
  const year = Number.isInteger(yearParam) && yearParam >= 2000 && yearParam <= 2100 ? yearParam : 2026;
  const quarter = Number.isInteger(quarterParam) ? Math.min(4, Math.max(1, quarterParam)) : 4;

  try {
    const fiscalYear = await prisma.fiscalYear.findUnique({ where: { year }, select: { id: true } });
    const [indicators, submissions] = await Promise.all([
      prisma.indikatorKinerjaUtama.findMany({
        orderBy: { id: 'asc' },
        include: {
          sasaran: { select: { id: true, namaSasaran: true } },
          pic: { select: { name: true } },
          katim: { select: { name: true } },
          actionPlan: { include: { quarters: { orderBy: { quarter: 'asc' } } } },
        },
      }),
      fiscalYear
        ? prisma.performanceSubmission.findMany({
            where: {
              fiscalYearId: fiscalYear.id,
              reportingQuarter: { lte: quarter },
              status: SubmissionStatus.PUBLISHED,
              physicalRealization: { not: null },
            },
            orderBy: [{ indicatorId: 'asc' }, { reportingQuarter: 'asc' }, { updatedAt: 'desc' }],
            select: {
              indicatorId: true,
              reportingQuarter: true,
              physicalRealization: true,
              realizationNarrative: true,
              evaluation: true,
              constraints: true,
              followUp: true,
            },
          })
        : [],
    ]);

    const submissionsByIndicator = new Map<number, typeof submissions>();
    for (const submission of submissions) {
      const list = submissionsByIndicator.get(submission.indicatorId) ?? [];
      list.push(submission);
      submissionsByIndicator.set(submission.indicatorId, list);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await readFile(TEMPLATE) as any);
    const sheet = workbook.getWorksheet('Rencana Aksi 2026') ?? workbook.worksheets[0];
    if (!sheet) throw new Error('Sheet template Rencana Aksi tidak ditemukan.');
    for (const worksheet of [...workbook.worksheets]) {
      if (worksheet.id !== sheet.id) workbook.removeWorksheet(worksheet.id);
    }
    configureHeader(sheet, year);

    indicators.slice(0, 18).forEach((indicator, index) => {
      const rowNumber = 9 + index;
      styleData(sheet, rowNumber);
      const quarters = new Map((indicator.actionPlan?.quarters ?? []).map((item) => [item.quarter, item]));
      const published = submissionsByIndicator.get(indicator.id) ?? [];
      const realisasi = published.reduce((sum, item) => sum + (decimal(item.physicalRealization) ?? 0), 0);
      const targetKumulatif = [1, 2, 3, 4]
        .filter((item) => item <= quarter)
        .reduce((sum, item) => sum + (decimal(quarters.get(item)?.target) ?? 0), 0);
      const capaian = targetKumulatif > 0 ? (realisasi / targetKumulatif) * 100 : null;
      const latest = published[published.length - 1];

      setCellValue(sheet, `A${rowNumber}`, index + 1);
      setCellValue(sheet, `B${rowNumber}`, indicator.sasaran.namaSasaran);
      setCellValue(sheet, `C${rowNumber}`, indicator.namaIku);
      setCellValue(sheet, `D${rowNumber}`, formatTarget(decimal(indicator.target), indicator.satuan));
      for (const [column, quarterNumber] of [['E', 1], ['G', 2], ['I', 3], ['K', 4] ] as Array<[string, number]>) {
        setCellValue(sheet, `${column}${rowNumber}`, toPercent(decimal(quarters.get(quarterNumber)?.target)));
      }
      for (const [column, quarterNumber] of [['F', 1], ['H', 2], ['J', 3], ['L', 4] ] as Array<[string, number]>) {
        setCellValue(sheet, `${column}${rowNumber}`, cleanText(quarters.get(quarterNumber)?.activity));
      }
      setCellValue(sheet, `M${rowNumber}`, `${realisasi.toFixed(2)}%`);
      setCellValue(sheet, `N${rowNumber}`, capaian === null ? '-' : `${capaian.toFixed(2)}%`);
      setCellValue(sheet, `O${rowNumber}`, cleanText(latest?.realizationNarrative));
      setCellValue(sheet, `P${rowNumber}`, cleanText(latest?.evaluation));
      setCellValue(sheet, `Q${rowNumber}`, cleanText(latest?.constraints));
      setCellValue(sheet, `R${rowNumber}`, cleanText(latest?.followUp));
      setCellValue(sheet, `S${rowNumber}`, indicator.pic?.name ?? indicator.katim?.name ?? '');
      setCellValue(sheet, `T${rowNumber}`, new Date(year, 11, 1));
      sheet.getCell(`T${rowNumber}`).numFmt = 'mmm-yy';
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `Rencana_Aksi_Perjakin_${year}_TW${quarter}.xlsx`;
    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[EXPORT_RENCANA_AKSI_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal membuat file Excel Rencana Aksi.' }, { status: 500 });
  }
}
