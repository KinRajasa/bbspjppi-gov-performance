import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ids = [3, 4]; // Budi Ketua Tim, Siti Ketua Pokja

try {
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, email: true },
  });
  if (users.length !== ids.length) {
    throw new Error(`Akun target tidak lengkap: ${JSON.stringify(users)}`);
  }

  const result = await prisma.$transaction(async (tx) => {
    // Hapus relasi yang memiliki FK wajib terlebih dahulu.
    const reviews = await tx.submissionReview.deleteMany({ where: { reviewerUserId: { in: ids } } });
    const roleLinks = await tx.userRole.deleteMany({ where: { userId: { in: ids } } });
    const indicatorAssignments = await tx.indicatorAssignment.deleteMany({ where: { picUserId: { in: ids } } });
    const ikuAssignments = await tx.ikuPicAssignment.deleteMany({ where: { picUserId: { in: ids } } });

    // Lepaskan relasi opsional tanpa menghapus indikator/transaksi.
    const ikuLinks = await tx.indikatorKinerjaUtama.updateMany({
      where: { OR: [{ picId: { in: ids } }, { katimId: { in: ids } }] },
      data: { picId: null, katimId: null },
    });
    const submissions = await tx.performanceSubmission.updateMany({
      where: { submittedById: { in: ids } },
      data: { submittedById: null },
    });
    const sources = await tx.googleSheetSource.updateMany({
      where: { createdById: { in: ids } },
      data: { createdById: null },
    });
    const logs = await tx.activityLog.updateMany({
      where: { userId: { in: ids } },
      data: { userId: null },
    });
    const deletedUsers = await tx.user.deleteMany({ where: { id: { in: ids } } });

    return {
      reviews: reviews.count,
      roleLinks: roleLinks.count,
      indicatorAssignments: indicatorAssignments.count,
      ikuAssignments: ikuAssignments.count,
      ikuLinks: ikuLinks.count,
      submissionsDetached: submissions.count,
      sourcesDetached: sources.count,
      logsDetached: logs.count,
      users: deletedUsers.count,
    };
  });

  console.log(JSON.stringify({ removedUsers: users, result }, null, 2));
} finally {
  await prisma.$disconnect();
}
