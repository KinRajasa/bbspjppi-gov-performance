import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seeding data dummy transaksi & master IKU...');

  // 1. Buat Role jika belum ada
  const roles = [
    { name: 'ADMIN', description: 'Administrator Sistem' },
    { name: 'PIC', description: 'Person In Charge Pengampu Kinerja' },
    { name: 'KATIM', description: 'Ketua Tim Kerja' },
    { name: 'KAPOKJA', description: 'Ketua Kelompok Kerja' },
    { name: 'PIMPINAN', description: 'Pimpinan/Kepala Balai' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  // 2. Buat Unit Kerja
  const workUnit = await prisma.workUnit.upsert({
    where: { code: 'BBSPJPPI-SEMR' },
    update: {},
    create: {
      code: 'BBSPJPPI-SEMR',
      name: 'Balai Besar Standardisasi dan Pelayanan Jasa Pencegahan Pencemaran Industri',
    },
  });

  // 3. Buat User PIC Dummy
  const picUser = await prisma.user.upsert({
    where: { email: 'pic_lingkungan@bbspjppi.go.id' },
    update: {},
    create: {
      name: 'Ahmad PIC Lingkungan',
      email: 'pic_lingkungan@bbspjppi.go.id',
      passwordHash: '$2b$10$EpjVIBy.276.34.276.34.276.34.276.34.276.34.276.34',
      workUnitId: workUnit.id,
    },
  });

  const picRole = await prisma.role.findUnique({ where: { name: 'PIC' } });
  if (picRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: picUser.id, roleId: picRole.id } },
      update: {},
      create: { userId: picUser.id, roleId: picRole.id },
    });
  }

  // 4. Buat Fiscal Year 2026
  const fiscalYear = await prisma.fiscalYear.upsert({
    where: { year: 2026 },
    update: { isActive: true },
    create: {
      year: 2026,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  });

  // 5. Buat Indikator Kinerja Utama (IKU) & Sasaran
  const indicatorsData = [
  ];

  const createdIndicators = [];
  for (const ind of indicatorsData) {
    const indicator = await prisma.performanceIndicator.upsert({
      where: { code: ind.code },
      update: { name: ind.name },
      create: { code: ind.code, name: ind.name, unit: 'Persen/Layanan' },
    });
    createdIndicators.push(indicator);

    // Hubungkan indicator ke PIC melalui IndicatorAssignment
    await prisma.indicatorAssignment.upsert({
      where: {
        fiscalYearId_indicatorId: {
          fiscalYearId: fiscalYear.id,
          indicatorId: indicator.id,
        },
      },
      update: {},
      create: {
        fiscalYearId: fiscalYear.id,
        indicatorId: indicator.id,
        picUserId: picUser.id,
      },
    });
  }

  // Gunakan akun Katim/Kapokja resmi yang sudah diseed, jangan membuat akun
  // reviewer dummy (Budi/Siti) karena akun tersebut sudah dihapus dari sistem.
  const katimUser = await prisma.user.findFirst({ where: { roles: { some: { role: { name: 'KATIM' } } } } });
  const kapokjaUser = await prisma.user.findFirst({ where: { roles: { some: { role: { name: 'KAPOKJA' } } } } });
  if (!katimUser || !kapokjaUser) throw new Error('Akun Katim dan Kapokja resmi wajib tersedia sebelum menjalankan seed.');

  // 6. Buat Data Transaksi Pengajuan Kinerja (Performance Submissions) sesuai 5 Variasi Status
  const statuses = [
    {
      status: 'SUBMITTED_TO_KATIM',
      quarter: 1,
      target: 95.0,
      realization: 94.5,
      narrative: 'Realisasi TW I IKM sangat baik, namun ada beberapa komplain yang ditindaklanjuti.',
      note: null,
    },
    {
      status: 'REVISION_REQUIRED_BY_KATIM',
      quarter: 1,
      target: 98.0,
      realization: 80.0,
      narrative: 'Realisasi SLA layanan pengujian terlambat akibat pemeliharaan alat.',
      note: 'Bukti dukung lampiran berita acara pemeliharaan alat kurang lengkap. Mohon diunggah ulang.',
    },
    {
      status: 'SUBMITTED_TO_KAPOKJA',
      quarter: 2,
      target: 85.0,
      realization: 88.2,
      narrative: 'Nilai NPS meningkat dari kuartal lalu setelah percepatan layanan online.',
      note: null,
    },
    {
      status: 'REVISION_REQUIRED_BY_KAPOKJA',
      quarter: 2,
      target: 100.0,
      realization: 90.0,
      narrative: 'Laporan pengujian laboratorium tepat waktu semester I.',
      note: 'Perhitungan persentase pada lembar kerja Excel perlu disesuaikan dengan formula baku.',
    },
    {
      status: 'PUBLISHED',
      quarter: 1,
      target: 90.0,
      realization: 92.5,
      narrative: 'Efisiensi anggaran tercapai dengan optimalisasi operasional balai.',
      note: 'Telah disetujui penuh oleh pimpinan.',
    },
  ];

  for (let i = 0; i < statuses.length; i++) {
    const item = statuses[i];
    const indicator = createdIndicators[i % createdIndicators.length];

    // Hapus submission lama jika ada untuk indikator & tahun ini agar unik
    await prisma.performanceSubmission.deleteMany({
      where: {
        fiscalYearId: fiscalYear.id,
        indicatorId: indicator.id,
      },
    });

    const submission = await prisma.performanceSubmission.create({
      data: {
        fiscalYearId: fiscalYear.id,
        indicatorId: indicator.id,
        submittedById: picUser.id,
        status: item.status as any,
        reportingQuarter: item.quarter,
        realizationNarrative: item.narrative,
        evaluation: 'Evaluasi berkala pelaksanaan kegiatan TW ' + item.quarter,
        constraints: item.note ? 'Terdapat catatan revisi dari reviewer.' : 'Tidak ada kendala berarti.',
        followUp: 'Melakukan koordinasi dengan tim terkait.',
        physicalRealization: item.realization,
        evidenceFileUrl: '/uploads/dummy-evidence-tw' + item.quarter + '.pdf',
        revisionNote: item.note,
        submittedAt: new Date(),
        values: {
          create: [
            {
              quarter: item.quarter,
              targetValue: item.target,
              realizationValue: item.realization,
              evidenceFileUrl: '/uploads/dummy-evidence-tw' + item.quarter + '.pdf',
            },
          ],
        },
      },
    });

    // Tambahkan review catatan jika status revisi / ditolak
    if (item.status.includes('REVISION') || item.status.includes('REVISI')) {
      await prisma.submissionReview.create({
        data: {
          performanceSubmissionId: submission.id,
          reviewerUserId: item.status.includes('KAPOKJA') ? kapokjaUser.id : katimUser.id,
          reviewStage: item.status.includes('KAPOKJA') ? 'KAPOKJA' : 'KATIM',
          decision: 'REVISION',
          note: item.note,
        },
      });
    }
  }

  console.log('✅ Seeding data dummy selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Gagal seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
