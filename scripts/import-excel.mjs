import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import nextEnv from '@next/env';
import { PrismaClient, SubmissionStatus, ComparisonOperator } from '@prisma/client';
import * as XLSX from 'xlsx';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');
nextEnv.loadEnvConfig(projectDirectory);

const prisma = new PrismaClient();

// Data 18 IKU Master BBSPJPPI
export const MASTER_18_IKU = [
  {
    order: 1,
    code: 'TJ 1',
    name: 'Indeks Kepuasan Masyarakat (IKM)',
    unit: 'Indeks',
    operator: ComparisonOperator.GTE,
    aliases: ['tj 1', 'tj1', 'ikm'],
  },
  {
    order: 2,
    code: 'TJ 2',
    name: 'Jumlah perusahaan industri/pelaku usaha/instansi yang memanfaatkan layanan jasa industri',
    unit: 'Perusahaan',
    operator: ComparisonOperator.GTE,
    aliases: ['tj 2', 'tj2', 'jumlah perusahaan'],
  },
  {
    order: 3,
    code: 'SK.1.1',
    name: 'Persentase pelayanan tepat waktu sesuai Service Level Agreement (SLA)',
    unit: '%',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.1.1', 'sk11', 'sk1.1', 'sla'],
  },
  {
    order: 4,
    code: 'SK.1.2.',
    name: 'Nilai Net Promoter Score (NPS)',
    unit: 'Nilai',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.1.2', 'sk.1.2.', 'sk12', 'nps'],
  },
  {
    order: 5,
    code: 'SK.2.1',
    name: 'Indeks peningkatan Penerimaan Negara Bukan Pajak (PNBP)',
    unit: 'Indeks',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.2.1', 'sk21', 'pnbp'],
  },
  {
    order: 6,
    code: 'SK.2.2',
    name: 'Jumlah hasil layanan jasa industri',
    unit: 'Hasil Layanan',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.2.2', 'sk22', 'hasil layanan'],
  },
  {
    order: 7,
    code: 'SK.2.3',
    name: 'Nilai Revenue on Asset (RoA)',
    unit: '%',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.2.3', 'sk23', 'roa'],
  },
  {
    order: 8,
    code: 'SK.2.4',
    name: 'Rasio Pendapatan Operasional terhadap Biaya Operasional (POBO)',
    unit: '%',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.2.4', 'sk24', 'pobo'],
  },
  {
    order: 9,
    code: 'SK.3.1.',
    name: 'Indeks Profesionalitas ASN (IPASN)',
    unit: 'Nilai',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.3.1', 'sk.3.1.', 'sk31', 'ipasn'],
  },
  {
    order: 10,
    code: 'S.K.4.1.',
    name: 'Persentase jenis layanan yang datanya terintegrasi dengan sistem informasi BSKJI',
    unit: '%',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.4.1', 's.k.4.1.', 's.k.4.1', 'sk41', 'integrasi bskji'],
  },
  {
    order: 11,
    code: 'S.K.4.2',
    name: 'Tingkat Penerapan Sistem Pemerintahan Berbasis Elektronik (SPBE)',
    unit: 'Nilai',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.4.2', 's.k.4.2', 'sk42', 'spbe'],
  },
  {
    order: 12,
    code: 'S.K.4.3.',
    name: 'Indeks Pelayanan Publik (IPP)',
    unit: 'Indeks',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.4.3', 's.k.4.3.', 's.k.4.3', 'sk43', 'ipp'],
  },
  {
    order: 13,
    code: 'S.K.5.1.',
    name: 'Persentase Rekomendasi hasil pengawasan internal telah ditindaklanjuti oleh satker',
    unit: '%',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.5.1', 's.k.5.1.', 's.k.5.1', 'sk51', 'pengawasan internal'],
  },
  {
    order: 14,
    code: 'S.K.5.2',
    name: 'Nilai minimal hasil pengawasan kearsipan internal (Unit Kearsipan)',
    unit: 'Nilai',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.5.2', 's.k.5.2', 'sk52', 'kearsipan'],
  },
  {
    order: 15,
    code: 'S.K.6.1',
    name: 'Nilai minimal Sistem Akuntabilitas Instansi Pemerintah (SAKIP) Satker',
    unit: 'Nilai',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.6.1', 's.k.6.1', 'sk61', 'sakip'],
  },
  {
    order: 16,
    code: 'S.K.6.2',
    name: 'Nilai minimal Indikator Kinerja Pelaksanaan Anggaran IKPA',
    unit: 'Nilai',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.6.2', 's.k.6.2', 'sk62', 'ikpa'],
  },
  {
    order: 17,
    code: 'S.K.6.3.',
    name: 'Penilaian dan Analisis Laporan Keuangan',
    unit: 'Nilai',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.6.3', 's.k.6.3.', 's.k.6.3', 'sk63', 'laporan keuangan'],
  },
  {
    order: 18,
    code: 'S.K.7.1',
    name: 'Persentase penggunaan Produk Dalam Negeri dalam pengadaan barang dan/atau jasa pemerintah',
    unit: '%',
    operator: ComparisonOperator.GTE,
    aliases: ['sk.7.1', 's.k.7.1', 'sk71', 'pdn'],
  },
];

// Data Default TA 2025 sesuai dokumen LAKIP BBSPJPPI
export const DEFAULT_2025_DATA = {
  year: 2025,
  budget: {
    paguAwal: 36159131000,
    paguRevisi: 40465963000,
    blokir: 4942674000,
  },
  indicators: [
    { code: 'TJ 1', target: 3.68, realization: 3.7, unit: 'Indeks' },
    { code: 'TJ 2', target: 960, realization: 1063, unit: 'Perusahaan' },
    { code: 'SK.1.1', target: 88, realization: 94.23, unit: '%' },
    { code: 'SK.1.2', target: 40, realization: 63, unit: 'Nilai' },
    { code: 'SK.2.1', target: 3, realization: 3, unit: 'Indeks' },
    { code: 'SK.2.2', target: 7500, realization: 8574, unit: 'Hasil Layanan' },
    { code: 'SK.2.3', target: 14.5, realization: 15.9, unit: '%' },
    { code: 'SK.2.4', target: 59, realization: 61.46, unit: '%' },
    { code: 'SK.3.1', target: 81.3, realization: 83.43, unit: 'Nilai' },
    { code: 'SK.4.1', target: 20, realization: 20, unit: '%' },
    { code: 'SK.4.2', target: 77, realization: 88.81, unit: 'Nilai' },
    { code: 'SK.4.3', target: 4.62, realization: 4.95, unit: 'Indeks' },
    { code: 'SK.5.1', target: 60, realization: 100, unit: '%' },
    { code: 'SK.5.2', target: 70.1, realization: 86.47, unit: 'Nilai' },
    { code: 'SK.6.1', target: 79.45, realization: 83.6, unit: 'Nilai' },
    { code: 'SK.6.2', target: 93.4, realization: 90.92, unit: 'Nilai' },
    { code: 'SK.6.3', target: 75, realization: 94.75, unit: 'Nilai' },
    { code: 'SK.7.1', target: 81, realization: 89.79, unit: '%' },
  ],
};

// Data Default TA 2026 (Tahun Anggaran Berjalan)
export const DEFAULT_2026_DATA = {
  year: 2026,
  budget: {
    paguAwal: 38000000000,
    paguRevisi: 40000000000,
    blokir: 2500000000,
  },
  indicators: [
    { code: 'TJ 1', target: 3.75, realization: 3.80, unit: 'Indeks' },
    { code: 'TJ 2', target: 990, realization: 298, unit: 'Perusahaan' },
    { code: 'SK.1.1', target: 90, realization: 99.6, unit: '%' },
    { code: 'SK.1.2', target: 41, realization: 73, unit: 'Nilai' },
    { code: 'SK.2.1', target: 3.2, realization: 2.8, unit: 'Indeks' },
    { code: 'SK.2.2', target: 8100, realization: 8400, unit: 'Hasil Layanan' },
    { code: 'SK.2.3', target: 15.0, realization: 16.5, unit: '%' },
    { code: 'SK.2.4', target: 60.0, realization: 55.5, unit: '%' },
    { code: 'SK.3.1', target: 80.0, realization: 82.5, unit: 'Nilai' },
    { code: 'SK.4.1', target: 40.0, realization: 24.0, unit: '%' },
    { code: 'SK.4.2', target: 78.0, realization: 85.0, unit: 'Nilai' },
    { code: 'SK.4.3', target: 4.64, realization: 4.64, unit: 'Indeks' },
    { code: 'SK.5.1', target: 100.0, realization: 88.0, unit: '%' },
    { code: 'SK.5.2', target: 73.0, realization: 69.35, unit: 'Nilai' },
    { code: 'SK.6.1', target: 79.45, realization: 79.45, unit: 'Nilai' },
    { code: 'SK.6.2', target: 93.4, realization: 85.92, unit: 'Nilai' },
    { code: 'SK.6.3', target: 75.25, realization: 75.25, unit: 'Nilai' },
    { code: 'SK.7.1', target: 81.0, realization: 79.3, unit: '%' },
  ],
};

export function parseExcelWorkbook(workbookOrPath) {
  let workbook;
  if (typeof workbookOrPath === 'string') {
    workbook = XLSX.readFile(workbookOrPath);
  } else {
    workbook = XLSX.read(workbookOrPath, { type: 'buffer' });
  }

  const result = {
    budget: null,
    indicators: [],
  };

  const budgetSheetName = workbook.SheetNames.find((name) =>
    /anggaran|budget|dipa|ringkasan/i.test(name)
  );

  if (budgetSheetName) {
    const sheet = workbook.Sheets[budgetSheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    let paguAwal = 0;
    let paguRevisi = 0;
    let blokir = 0;

    for (const row of rows) {
      const lineText = row.map(cell => String(cell).toLowerCase()).join(' ');
      const numbers = row.map(cell => {
        if (typeof cell === 'number') return cell;
        const cleaned = String(cell).replace(/[^0-9.-]/g, '');
        return cleaned ? parseFloat(cleaned) : null;
      }).filter(n => n !== null && n > 0);

      if (/pagu.*awal|dipa.*awal/i.test(lineText) && numbers.length > 0) {
        paguAwal = numbers[0];
      } else if (/revisi.*terakhir|pagu.*revisi|dipa.*revisi/i.test(lineText) && numbers.length > 0) {
        paguRevisi = numbers[0];
      } else if (/blokir|anggaran.*blokir/i.test(lineText) && numbers.length > 0) {
        blokir = numbers[0];
      }
    }

    if (paguAwal || paguRevisi) {
      result.budget = { paguAwal, paguRevisi, blokir };
    }
  }

  const ikuSheetName = workbook.SheetNames.find((name) =>
    /iku|indikator|perjakin|kinerja/i.test(name)
  );

  if (ikuSheetName) {
    const sheet = workbook.Sheets[ikuSheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    
    for (const row of rows) {
      const rowEntries = Object.entries(row);
      let nameVal = '';
      let codeVal = '';
      let unitVal = '';
      let targetVal = null;
      let realVal = null;

      for (const [key, val] of rowEntries) {
        const k = key.toLowerCase();
        const vStr = String(val).trim();
        const vNum = typeof val === 'number' ? val : parseFloat(vStr.replace(/[^0-9.-]/g, ''));

        if (/kode|code/i.test(k)) codeVal = vStr;
        else if (/indikator|nama|name/i.test(k)) nameVal = vStr;
        else if (/satuan|unit/i.test(k)) unitVal = vStr;
        else if (/target/i.test(k) && !isNaN(vNum)) targetVal = vNum;
        else if (/realisasi|actual/i.test(k) && !isNaN(vNum)) realVal = vNum;
      }

      if (nameVal || codeVal) {
        result.indicators.push({
          code: codeVal,
          name: nameVal,
          unit: unitVal,
          target: targetVal,
          realization: realVal,
        });
      }
    }
  }

  return result;
}

export async function importDataToDatabase({ year, budget, indicators, sourceYear = year }) {
  if (sourceYear === 2025 && year !== 2025) {
    throw new Error('Dataset LAKIP 2025 hanya boleh diimpor ke TA 2025 (TW IV), bukan ke TA 2026.');
  }
  console.log(`\n📦 Memproses Data Tahun Anggaran ${year}...`);

  const fiscalYear = await prisma.fiscalYear.upsert({
    where: { year },
    update: {
      isActive: year === 2026,
    },
    create: {
      year,
      startDate: new Date(`${year}-01-01T00:00:00.000Z`),
      endDate: new Date(`${year}-12-31T00:00:00.000Z`),
      isActive: year === 2026,
    },
  });
  console.log(`✅ Fiscal Year ${year} (ID: ${fiscalYear.id}) siap.`);

  if (budget) {
    const effective = (budget.paguRevisi || 0) - (budget.blokir || 0);
    await prisma.budgetAllocation.upsert({
      where: { fiscalYearId: fiscalYear.id },
      update: {
        initialCeilingAmount: budget.paguAwal,
        latestRevisionCeilingAmount: budget.paguRevisi,
        blockedAmount: budget.blokir,
      },
      create: {
        fiscalYearId: fiscalYear.id,
        initialCeilingAmount: budget.paguAwal,
        latestRevisionCeilingAmount: budget.paguRevisi,
        blockedAmount: budget.blokir,
      },
    });
    console.log(`✅ Budget Allocation ${year}: Pagu Awal Rp ${budget.paguAwal.toLocaleString('id-ID')}, Revisi Rp ${budget.paguRevisi.toLocaleString('id-ID')}, Blokir Rp ${budget.blokir.toLocaleString('id-ID')}, Efektif Rp ${effective.toLocaleString('id-ID')}`);
  }

  const defaultUser = await prisma.user.findFirst({
    where: { roles: { some: { role: { name: 'ADMIN' } } } },
  }) || await prisma.user.findFirst();

  let importedCount = 0;

  for (const master of MASTER_18_IKU) {
    const matchedInput = indicators.find((ind) => {
      const codeMatch = ind.code && master.aliases.includes(ind.code.toLowerCase().replace(/[\s.]+/g, ''));
      const nameMatch = ind.name && master.name.toLowerCase().includes(ind.name.toLowerCase().slice(0, 15));
      return codeMatch || nameMatch;
    }) || indicators.find((ind) => ind.code === master.code);

    const targetVal = matchedInput?.target ?? 0;
    const realVal = matchedInput?.realization ?? 0;
    const unitVal = matchedInput?.unit || master.unit;

    const indicator = await prisma.performanceIndicator.upsert({
      where: { code: master.code },
      update: {
        name: master.name,
        unit: unitVal,
        comparisonOperator: master.operator,
        isActive: true,
      },
      create: {
        code: master.code,
        name: master.name,
        unit: unitVal,
        comparisonOperator: master.operator,
        isActive: true,
      },
    });

    const submission = await prisma.performanceSubmission.upsert({
      where: {
        fiscalYearId_indicatorId_reportingQuarter: {
          fiscalYearId: fiscalYear.id,
          indicatorId: indicator.id,
          reportingQuarter: 4,
        },
      },
      update: {
        status: SubmissionStatus.APPROVED,
        physicalRealization: targetVal ? (realVal / targetVal) * 100 : 100,
        approvedAt: new Date(),
      },
      create: {
        fiscalYearId: fiscalYear.id,
        indicatorId: indicator.id,
        reportingQuarter: 4,
        submittedById: defaultUser?.id,
        status: SubmissionStatus.APPROVED,
        physicalRealization: targetVal ? (realVal / targetVal) * 100 : 100,
        approvedAt: new Date(),
      },
    });

    await prisma.quarterlyPerformanceValue.upsert({
      where: {
        performanceSubmissionId_quarter: {
          performanceSubmissionId: submission.id,
          quarter: 4,
        },
      },
      update: {
        targetValue: targetVal,
        realizationValue: realVal,
      },
      create: {
        performanceSubmissionId: submission.id,
        quarter: 4,
        targetValue: targetVal,
        realizationValue: realVal,
      },
    });

    importedCount++;
  }

  console.log(`✅ Berhasil mengimpor ${importedCount} IKU untuk Tahun Anggaran ${year}.`);
}

async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];

  if (filePath && fs.existsSync(filePath)) {
    console.log(`📄 Membaca file Excel: ${filePath}`);
    const parsed = parseExcelWorkbook(filePath);
    const targetYear = parseInt(args[1], 10) || 2025;
    await importDataToDatabase({
      year: targetYear,
      budget: parsed.budget,
      indicators: parsed.indicators.length > 0 ? parsed.indicators : DEFAULT_2025_DATA.indicators,
      sourceYear: parsed.indicators.length > 0 ? targetYear : 2025,
    });
  } else {
    // Dataset default ini adalah LAKIP 2025 dan hanya boleh ditulis ke
    // TA 2025/TW IV. TA 2026 wajib berasal dari file/sinkronisasi Excel 2026
    // yang dikirim eksplisit dengan argumen tahun.
    console.log('🚀 Menjalankan import dataset LAKIP TA 2025 (TW IV)...');
    await importDataToDatabase({ ...DEFAULT_2025_DATA, sourceYear: 2025 });
  }

  console.log('\n🎉 Proses Impor/Seeding Selesai!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Terjadi kesalahan saat impor:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
