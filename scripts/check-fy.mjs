import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const fy2025 = await prisma.fiscalYear.findUnique({ where: { year: 2025 } });
  console.log('Fiscal year 2025 exists?', !!fy2025);
  if (fy2025) {
    const subs = await prisma.performanceSubmission.count({ where: { fiscalYearId: fy2025.id } });
    console.log('2025 submissions count:', subs);
  }
  const fy2026 = await prisma.fiscalYear.findUnique({ where: { year: 2026 } });
  console.log('Fiscal year 2026 exists?', !!fy2026);
  if (fy2026) {
    const subs = await prisma.performanceSubmission.count({ where: { fiscalYearId: fy2026.id } });
    console.log('2026 submissions count:', subs);
  }
}
main().finally(() => prisma.$disconnect());