import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Simulasikan apa yang dilakukan API capaian-iku untuk 2026 Q4
const fiscalYear2026 = await prisma.fiscalYear.findUnique({ where: { year: 2026 }, select: { id: true, year: true } });
console.log('FiscalYear 2026:', fiscalYear2026);

const quarterVal = 4;

const perfIndicators = await prisma.performanceIndicator.findMany({
  where: { isActive: true },
  orderBy: { id: 'asc' },
  include: {
    assignments: { where: { fiscalYearId: fiscalYear2026.id }, include: { picUser: { select: { name: true } } } },
    submissions: {
      where: { fiscalYearId: fiscalYear2026.id },
      include: { values: { where: { quarter: quarterVal } } }
    },
  },
});

console.log('\nPerformance Indicators with 2026 Q4 data:');
for (const ind of perfIndicators) {
  const subsWithValues = ind.submissions.filter(s => s.values.length > 0);
  if (subsWithValues.length > 0) {
    for (const sub of subsWithValues) {
      for (const val of sub.values) {
        console.log(`  [${ind.code}] sub.quarter=${sub.reportingQuarter} val.quarter=${val.quarter} target=${val.targetValue} real=${val.realizationValue} syncId=${val.sourceSyncRunId}`);
      }
    }
  }
}

// Count indicators with Q4 data vs without
const withData = perfIndicators.filter(ind => ind.submissions.some(s => s.values.length > 0 && s.values.some(v => v.sourceSyncRunId !== null)));
const withNullData = perfIndicators.filter(ind => ind.submissions.some(s => s.values.length > 0 && s.values.some(v => v.sourceSyncRunId !== null && v.targetValue === null && v.realizationValue === null)));
console.log(`\nIndicators with Q4 sync data: ${withData.length}`);
console.log(`Indicators with Q4 sync but NULL values: ${withNullData.length}`);
for (const ind of withNullData) {
  console.log(`  - ${ind.code}`);
}

await prisma.$disconnect();

