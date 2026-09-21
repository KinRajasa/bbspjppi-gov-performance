import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';

nextEnv.loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

// Inilah satu-satunya 18 kode yang boleh tersimpan di performance_indicators.
// ID lama tidak diubah; yang dipindahkan adalah baris duplikat dan seluruh
// transaksinya supaya foreign key yang sudah ada tetap aman.
const canonicalCodes = [
  'TJ 1', 'TJ 2', 'SK.1.1', 'SK.1.2.', 'SK.2.1', 'SK.2.2', 'SK.2.3', 'SK.2.4',
  'SK.3.1.', 'S.K.4.1.', 'S.K.4.2', 'S.K.4.3.', 'S.K.5.1.', 'S.K.5.2',
  'S.K.6.1', 'S.K.6.2', 'S.K.6.3.', 'S.K.7.1',
];

const normalize = (value) => String(value ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
const aliases = new Map();
for (let index = 0; index < canonicalCodes.length; index += 1) {
  const canonical = canonicalCodes[index];
  const aliasesForIndicator = [canonical, `IKU-${index + 1}`, `IKU ${index + 1}`];
  if (index === 0) aliasesForIndicator.push('IKM-01', 'IKM01');
  if (index === 2) aliasesForIndicator.push('SLA-01', 'SLA01');
  if (index === 3) aliasesForIndicator.push('NPS-01', 'NPS01');
  for (const alias of aliasesForIndicator) aliases.set(normalize(alias), canonical);
}

const isEmptyDraft = (submission) =>
  submission.status === 'DRAFT' &&
  submission.physicalRealization === null &&
  submission.submittedAt === null &&
  !submission.realizationNarrative &&
  !submission.evaluation &&
  !submission.constraints &&
  !submission.followUp &&
  !submission.evidenceFileUrl;

const parentDataFrom = (submission) => ({
  submittedById: submission.submittedById,
  status: submission.status,
  reportingMonth: submission.reportingMonth,
  realizationNarrative: submission.realizationNarrative,
  evaluation: submission.evaluation,
  constraints: submission.constraints,
  followUp: submission.followUp,
  physicalRealization: submission.physicalRealization,
  evidenceFileUrl: submission.evidenceFileUrl,
  revisionNote: submission.revisionNote,
  submittedAt: submission.submittedAt,
  approvedAt: submission.approvedAt,
});

async function mergeSubmission(tx, duplicate, canonical) {
  // Data yang sudah diisi/di-review selalu mengalahkan placeholder DRAFT.
  const duplicateWins = isEmptyDraft(canonical) || !isEmptyDraft(duplicate);
  if (duplicateWins) {
    await tx.performanceSubmission.update({ where: { id: canonical.id }, data: parentDataFrom(duplicate) });
  }

  const canonicalValues = await tx.quarterlyPerformanceValue.findMany({ where: { performanceSubmissionId: canonical.id } });
  const valuesByQuarter = new Map(canonicalValues.map((value) => [value.quarter, value]));
  const duplicateValues = await tx.quarterlyPerformanceValue.findMany({ where: { performanceSubmissionId: duplicate.id } });
  for (const value of duplicateValues) {
    const existing = valuesByQuarter.get(value.quarter);
    if (existing) {
      await tx.quarterlyPerformanceValue.update({
        where: { id: existing.id },
        data: {
          targetValue: value.targetValue ?? existing.targetValue,
          realizationValue: value.realizationValue ?? existing.realizationValue,
          evidenceFileUrl: value.evidenceFileUrl ?? existing.evidenceFileUrl,
          sourceSyncRunId: value.sourceSyncRunId ?? existing.sourceSyncRunId,
        },
      });
    } else {
      await tx.quarterlyPerformanceValue.update({
        where: { id: value.id },
        data: { performanceSubmissionId: canonical.id },
      });
    }
  }

  await tx.submissionReview.updateMany({
    where: { performanceSubmissionId: duplicate.id },
    data: { performanceSubmissionId: canonical.id },
  });
  await tx.performanceSubmission.delete({ where: { id: duplicate.id } });
}

async function main() {
  const result = await prisma.$transaction(async (tx) => {
    const indicators = await tx.performanceIndicator.findMany({ orderBy: { id: 'asc' } });
    const canonicalByCode = new Map(indicators.map((indicator) => [indicator.code, indicator]));
    const migrated = [];

    for (const duplicate of indicators) {
      const canonicalCode = aliases.get(normalize(duplicate.code));
      if (!canonicalCode || duplicate.code === canonicalCode) continue;

      let canonical = canonicalByCode.get(canonicalCode);
      if (!canonical) {
        // Bila instalasi lama belum memiliki baris kanonik, normalkan kode
        // baris yang ada agar data tidak hilang.
        canonical = await tx.performanceIndicator.update({
          where: { id: duplicate.id },
          data: { code: canonicalCode },
        });
        canonicalByCode.set(canonicalCode, canonical);
        migrated.push(`${duplicate.code} -> ${canonicalCode} (rename)`);
        continue;
      }

      const assignments = await tx.indicatorAssignment.findMany({ where: { indicatorId: duplicate.id } });
      for (const assignment of assignments) {
        const conflict = await tx.indicatorAssignment.findUnique({
          where: { fiscalYearId_indicatorId: { fiscalYearId: assignment.fiscalYearId, indicatorId: canonical.id } },
        });
        if (conflict) await tx.indicatorAssignment.delete({ where: { id: assignment.id } });
        else await tx.indicatorAssignment.update({ where: { id: assignment.id }, data: { indicatorId: canonical.id } });
      }

      const submissions = await tx.performanceSubmission.findMany({
        where: { indicatorId: duplicate.id },
        include: { values: true },
      });
      for (const submission of submissions) {
        const conflict = await tx.performanceSubmission.findUnique({
          where: {
            fiscalYearId_indicatorId_reportingQuarter: {
              fiscalYearId: submission.fiscalYearId,
              indicatorId: canonical.id,
              reportingQuarter: submission.reportingQuarter,
            },
          },
          include: { values: true },
        });
        if (conflict) await mergeSubmission(tx, submission, conflict);
        else await tx.performanceSubmission.update({ where: { id: submission.id }, data: { indicatorId: canonical.id } });
      }

      const sources = await tx.googleSheetSource.findMany({ where: { indicatorId: duplicate.id } });
      for (const source of sources) {
        const conflict = await tx.googleSheetSource.findUnique({
          where: { fiscalYearId_indicatorId: { fiscalYearId: source.fiscalYearId, indicatorId: canonical.id } },
        });
        if (conflict) await tx.googleSheetSource.delete({ where: { id: source.id } });
        else await tx.googleSheetSource.update({ where: { id: source.id }, data: { indicatorId: canonical.id } });
      }

      await tx.performanceIndicator.delete({ where: { id: duplicate.id } });
      migrated.push(`${duplicate.code} -> ${canonical.code}`);
    }

    const remaining = await tx.performanceIndicator.count();
    return { migrated, remaining };
  });

  console.log(`Selesai. ${result.migrated.length} kode duplikat dipindahkan/dihapus.`);
  for (const item of result.migrated) console.log(`- ${item}`);
  console.log(`Jumlah performance_indicators sekarang: ${result.remaining} (target: 18).`);
}

main().catch((error) => {
  console.error('Normalisasi indikator gagal:', error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
