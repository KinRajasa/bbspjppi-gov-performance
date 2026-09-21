import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const fy2026 = await prisma.fiscalYear.findUnique({ where: { year: 2026 }, include: { submissions: { include: { values: true } } } });
  console.log('Fiscal year 2026 submissions:', fy2026.submissions.length);
  const quarters = {};
  for (const s of fy2026.submissions) {
    for (const v of s.values) {
      quarters[v.quarter] = (quarters[v.quarter] || 0) + 1;
    }
  }
  console.log('Quarter counts:', quarters);
  // Also list submissions per indicator
  const indMap = {};
  for (const s of fy2026.submissions) {
    const indId = s.indicatorId;
    if (!indMap[indId]) indMap[indId] = [];
    indMap[indId].push(s);
  }
  for (const [indId, subs] of Object.entries(indMap)) {
    console.log(`Indicator ${indId}: ${subs.length} submissions`);
    for (const s of subs) {
      console.log(`  Q${s.reportingQuarter}: status=${s.status}, physicalRealization=${s.physicalRealization}`);
      for (const v of s.values) {
        console.log(`    Q${v.quarter}: target=${v.targetValue}, realization=${v.realizationValue}`);
      }
    }
  }
}
main().finally(() => prisma.$disconnect());