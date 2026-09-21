import { createHash } from 'node:crypto';

import { Prisma, SubmissionStatus, SyncStatus, SyncTrigger } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { canonicalizePerformanceIndicatorCode } from '@/lib/indicator-catalog';
import { readSessionToken } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SyncBody = {
  indicatorCode?: unknown;
  year?: unknown;
  targetValues?: unknown;
  realizationValues?: unknown;
  quarterValues?: unknown;
  spreadsheetId?: unknown;
  spreadsheetUrl?: unknown;
  worksheetName?: unknown;
};

class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

function authorized(request: NextRequest) {
  const secret = process.env.GOOGLE_SHEETS_SYNC_SECRET;
  return process.env.NODE_ENV !== 'production' || Boolean(secret && request.headers.get('x-sync-secret') === secret);
}

function getSpreadsheetId(value: unknown) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (/^[a-zA-Z0-9_-]{20,}$/.test(text)) return text;
  const googleId = text.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)?.[1];
  if (googleId) return googleId;
  // URL XLSX online tetap disimpan sebagai sumber sinkronisasi. Jika URL
  // terlalu panjang, pemanggil akan memakai ID manual berbasis TA/indikator.
  return /^https?:\/\//i.test(text) && text.length <= 191 ? text : null;
}

function parseValue(value: unknown, field: string, index: number): string | null {
  if (value === null || value === undefined || value === '') return null;
  const raw = String(value).trim();
  const text = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  if (!/^-?\d+(\.\d+)?$/.test(text)) throw new HttpError(400, `${field}[${index}] harus berupa angka.`);
  try {
    return new Prisma.Decimal(text).toFixed(6);
  } catch {
    throw new HttpError(400, `${field}[${index}] tidak valid.`);
  }
}

function parseQuarterArray(value: unknown, field: string): Array<string | null> {
  if (!Array.isArray(value) || value.length !== 4) {
    throw new HttpError(400, `${field} harus berupa array dengan tepat 4 nilai (Triwulan I-IV).`);
  }
  return value.map((item, index) => parseValue(item, field, index));
}

function readValues(body: SyncBody, key: 'targetValue' | 'realizationValue') {
  const direct = key === 'targetValue' ? body.targetValues : body.realizationValues;
  if (direct !== undefined) return parseQuarterArray(direct, key === 'targetValue' ? 'targetValues' : 'realizationValues');
  if (!Array.isArray(body.quarterValues)) throw new HttpError(400, 'targetValues dan realizationValues wajib diisi.');
  return parseQuarterArray(
    body.quarterValues.map((item) => (item && typeof item === 'object' ? (item as Record<string, unknown>)[key] : null)),
    `quarterValues.${key}`,
  );
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'Endpoint sinkronisasi Google Sheets aktif. Gunakan POST.' });
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return errorResponse('Akses sinkronisasi admin tidak sah.', 401);

  try {
    let body: SyncBody;
    try {
      body = (await request.json()) as SyncBody;
    } catch {
      throw new HttpError(400, 'Body request harus berupa JSON yang valid.');
    }

    const requestedIndicatorCode = typeof body.indicatorCode === 'string' ? body.indicatorCode.trim() : '';
    const indicatorCode = requestedIndicatorCode ? canonicalizePerformanceIndicatorCode(requestedIndicatorCode) : null;
    const year = typeof body.year === 'number' ? body.year : Number(body.year);
    if (!indicatorCode || !Number.isInteger(year) || year < 1900 || year > 2200) {
      throw new HttpError(400, 'indicatorCode harus merupakan salah satu dari 18 IKU resmi dan year wajib diisi dengan benar.');
    }

    const targetValues = readValues(body, 'targetValue');
    const realizationValues = readValues(body, 'realizationValue');
    const spreadsheetUrl = typeof body.spreadsheetUrl === 'string' ? body.spreadsheetUrl.trim() : '';
    const spreadsheetId = getSpreadsheetId(body.spreadsheetId) ?? getSpreadsheetId(spreadsheetUrl) ?? `manual-${year}-${indicatorCode}`;
    // Nama worksheet asli tetap disimpan untuk audit, tetapi relasi indikator
    // selalu memakai kode kanonik agar variasi Excel tidak membuat baris baru.
    const worksheetName = typeof body.worksheetName === 'string' && body.worksheetName.trim() ? body.worksheetName.trim() : indicatorCode;

    const [fiscalYear, foundIndicator] = await Promise.all([
      prisma.fiscalYear.findUnique({ where: { year } }),
      prisma.performanceIndicator.findUnique({ where: { code: indicatorCode } }),
    ]);
    if (!fiscalYear) throw new HttpError(404, `Tahun anggaran ${year} belum terdaftar.`);
    // Worksheet baru boleh dikenalkan oleh proses sync admin. Jika belum ada
    // di master, buat record minimal agar data tidak hilang hanya karena kode
    // (misalnya S.K.7.1) belum pernah di-seed.
    const indicator = foundIndicator ?? await prisma.performanceIndicator.create({ data: { code: indicatorCode, name: indicatorCode, unit: null } });

    const dataHash = createHash('sha256').update(JSON.stringify({ targetValues, realizationValues })).digest('hex');
    const result = await prisma.$transaction(async (tx) => {
      const source = await tx.googleSheetSource.upsert({
        where: { fiscalYearId_indicatorId: { fiscalYearId: fiscalYear.id, indicatorId: indicator.id } },
        create: { fiscalYearId: fiscalYear.id, indicatorId: indicator.id, spreadsheetId, spreadsheetUrl: spreadsheetUrl || null, worksheetName, isActive: true },
        update: { spreadsheetId, spreadsheetUrl: spreadsheetUrl || undefined, worksheetName, isActive: true },
      });
      const syncRun = await tx.googleSyncRun.create({ data: { sourceId: source.id, triggerType: SyncTrigger.MANUAL } });
      
      const createdSubmissions = [];
      for (const quarter of [1, 2, 3, 4]) {
        const submission = await tx.performanceSubmission.upsert({
          where: {
            fiscalYearId_indicatorId_reportingQuarter: {
              fiscalYearId: fiscalYear.id,
              indicatorId: indicator.id,
              reportingQuarter: quarter,
            },
          },
          create: {
            fiscalYearId: fiscalYear.id,
            indicatorId: indicator.id,
            reportingQuarter: quarter,
            status: SubmissionStatus.DRAFT,
          },
          update: {},
        });
        createdSubmissions.push(submission);

        await tx.quarterlyPerformanceValue.upsert({
          where: { performanceSubmissionId_quarter: { performanceSubmissionId: submission.id, quarter } },
          create: {
            performanceSubmissionId: submission.id,
            quarter,
            targetValue: targetValues[quarter - 1],
            realizationValue: realizationValues[quarter - 1],
            sourceSyncRunId: syncRun.id,
          },
          // Nilai aktual berasal dari sumber sinkronisasi Admin. Jika file
          // diperbaiki, nilai lama boleh diperbarui meskipun submission fisik
          // sudah berstatus final; yang berubah hanya target/realisasi aktual,
          // bukan realisasi fisik PIC maupun status approval.
          update: {
            targetValue: targetValues[quarter - 1],
            realizationValue: realizationValues[quarter - 1],
            sourceSyncRunId: syncRun.id,
          },
        });
      }

      await tx.googleSyncRun.update({
        where: { id: syncRun.id },
        data: {
          status: SyncStatus.SUCCESS,
          finishedAt: new Date(),
          rowsRead: 4,
          rowsCreated: 4,
          rowsUpdated: 0,
          dataHash,
        },
      });
      return { submissionId: createdSubmissions[0]?.id, syncRunId: syncRun.id, sourceId: source.id };
    });

    const session = readSessionToken(request.cookies.get('session')?.value);
    void logActivity({
      req: request,
      userId: session?.id,
      userName: session?.name ?? 'Admin System',
      userRole: session?.role ?? 'ADMIN',
      actionType: 'IMPORT',
      description: `Menghubungkan Google Spreadsheet dan menyinkronkan target/realisasi indikator ${indicatorCode} untuk TA ${year}.`,
      moduleReference: 'Integrasi Google Spreadsheet',
      referenceType: 'GoogleSyncRun',
      referenceId: result.syncRunId,
      metadataJson: { year, indicatorCode, worksheetName },
    });

    return NextResponse.json({ success: true, message: 'Data target dan realisasi berhasil disinkronkan.', ...result });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Sinkronisasi gagal.';
    console.error('[GOOGLE_SHEETS_SYNC_ERROR]', error);
    return errorResponse(message, status);
  }
}
