import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Hapus submission template yang benar-benar menggantung.
 * Submission hasil sync Excel sengaja dipertahankan walaupun physicalRealization
 * dan submittedAt null, selama masih memiliki target/realisasi pada nilai kuartal.
 */
async function main() {
  const where = {
    physicalRealization: null,
    submittedAt: null,
    OR: [{ realizationNarrative: null }, { realizationNarrative: '' }],
    values: {
      none: {
        OR: [{ targetValue: { not: null } }, { realizationValue: { not: null } }],
      },
    },
  };

  const candidates = await prisma.performanceSubmission.count({ where });
  const result = await prisma.performanceSubmission.deleteMany({ where });
  console.log(`Ghost submissions ditemukan: ${candidates}; dihapus: ${result.count}.`);
}

main()
  .catch((error) => {
    console.error('Cleanup ghost submission gagal:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
