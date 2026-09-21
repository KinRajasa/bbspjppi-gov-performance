import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';

nextEnv.loadEnvConfig(process.cwd());
const prisma = new PrismaClient();

const email = process.argv[2]?.trim().toLowerCase();
if (!email) throw new Error('Gunakan: node scripts/remove-user.mjs email@domain');

async function main() {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } });
  if (!user) {
    console.log(`Akun ${email} tidak ditemukan.`);
    return;
  }
  const result = await prisma.$transaction(async (tx) => {
    await tx.indikatorKinerjaUtama.updateMany({ where: { picId: user.id }, data: { picId: null } });
    await tx.ikuPicAssignment.deleteMany({ where: { picUserId: user.id } });
    await tx.indicatorAssignment.deleteMany({ where: { picUserId: user.id } });
    await tx.submissionReview.deleteMany({ where: { reviewerUserId: user.id } });
    await tx.performanceSubmission.deleteMany({ where: { submittedById: user.id } });
    await tx.googleSheetSource.updateMany({ where: { createdById: user.id }, data: { createdById: null } });
    await tx.userRole.deleteMany({ where: { userId: user.id } });
    await tx.activityLog.updateMany({ where: { userId: user.id }, data: { userId: null } });
    await tx.user.delete({ where: { id: user.id } });
    return user;
  });
  console.log(`Akun ${result.name} (${result.email}) dan relasi data inputnya telah dihapus.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
