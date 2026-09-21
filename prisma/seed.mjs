import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';

const prisma = new PrismaClient();

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
};

const draftIndicators = [
  ['TJ 1', 'Indeks Kepuasan Masyarakat (IKM)', 'Indeks'],
  ['TJ 2', 'Jumlah perusahaan industri/pelaku usaha/instansi yang memanfaatkan layanan jasa industri', 'Perusahaan Industri/Pelaku Usaha/Instansi'],
  ['SK.1.1', 'Persentase pelayanan tepat waktu sesuai Service Level Agreement (SLA)', 'Persen'],
  ['SK.1.2.', 'Nilai Net Promoter Score (NPS)', 'Nilai'],
  ['SK.2.1', 'Indeks peningkatan Penerimaan Negara Bukan Pajak (PNBP)', 'Indeks'],
  ['SK.2.2', 'Jumlah hasil layanan jasa industri', 'Hasil Layanan'],
  ['SK.2.3', 'Nilai Revenue on Asset (RoA)', 'Persen'],
  ['SK.2.4', 'Rasio Pendapatan Operasional terhadap Biaya Operasional (POBO)', 'Persen'],
  ['SK.3.1.', 'Indeks Profesionalitas ASN (IPASN)', 'Indeks'],
  ['S.K.4.1.', 'Persentase jenis layanan yang datanya terintegrasi dengan sistem informasi BSKJI', 'Persen'],
  ['S.K.4.2', 'Tingkat Penerapan Sistem Pemerintahan Berbasis Elektronik (SPBE)', 'Persen'],
  ['S.K.4.3.', 'Indeks Pelayanan Publik (IPP)', 'Indeks'],
  ['S.K.5.1.', 'Rekomendasi hasil pengawasan internal telah ditindaklanjuti oleh satker', 'Persen'],
  ['S.K.5.2', 'Nilai minimal hasil pengawasan kearsipan internal (Unit Kearsipan)', 'Nilai'],
  ['S.K.6.1', 'Nilai minimal Sistem Akuntabilitas Instansi Pemerintah (SAKIP) Satker', 'Nilai'],
  ['S.K.6.2', 'Nilai minimal Indikator Kinerja Pelaksanaan Anggaran (IKPA)', 'Nilai'],
  ['S.K.6.3.', 'Penilaian dan Analisis Laporan Keuangan', 'Nilai'],
  ['S.K.7.1', 'Persentase penggunaan Produk Dalam Negeri dalam pengadaan barang dan/atau jasa pemerintah', 'Persen'],
];

async function main() {
  console.log('🌱 Memulai seeding data dummy transaksi & master IKU...');

  // Seed Roles
  const roles = [
    { name: 'ADMIN', description: 'Super Admin - Hak akses penuh sistem' },
    { name: 'PIC', description: 'Person In Charge - Staff Pelaksana' },
    { name: 'KATIM', description: 'Ketua Tim Kerja - Validator Tahap 1' },
    { name: 'KAPOKJA', description: 'Ketua Kelompok Kerja - Validator & Approval Final' },
    { name: 'PIMPINAN', description: 'Pimpinan/Eksekutif - Monitoring Dashboard' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
  }

  // Seed Default Users for each role
  const workUnit = await prisma.workUnit.upsert({
    where: { code: 'BBSPJPPI' },
    update: {},
    create: { code: 'BBSPJPPI', name: 'BBSPJPPI Semarang' },
  });

  const defaultUsers = [
    { name: 'Admin System', email: 'admin@bbspjppi.go.id', role: 'ADMIN' },
    { name: 'Dyah Af', email: 'dyah.af@bbspjppi.go.id', role: 'KAPOKJA' },
    { name: 'Dyah Ahsina', email: 'dyah.ahsina@bbspjppi.go.id', role: 'KATIM' },
    { name: 'Aditya Wicaksono', email: 'aditya.wicaksono@bbspjppi.go.id', role: 'KATIM' },
    { name: 'Sidna Kosim', email: 'sidna.kosim@bbspjppi.go.id', role: 'PIC' },
    { name: 'Yohan Kaleb', email: 'yohan.kaleb@bbspjppi.go.id', role: 'PIC' },
    { name: 'Iin Farida', email: 'iin.farida@bbspjppi.go.id', role: 'PIC' },
    { name: 'Novarina', email: 'novarina@bbspjppi.go.id', role: 'PIC' },
    { name: 'Adi P', email: 'adi.p@bbspjppi.go.id', role: 'PIC' },
    { name: 'Farsananda Noni', email: 'farsananda.noni@bbspjppi.go.id', role: 'PIC' },
    { name: 'Misbakhul Anam', email: 'misbakhul.anam@bbspjppi.go.id', role: 'PIC' },
    { name: 'Agung BP', email: 'agung.bp@bbspjppi.go.id', role: 'PIC' },
    { name: 'Nur Zen', email: 'nur.zen@bbspjppi.go.id', role: 'PIC' },
    { name: 'Rini Rarasati', email: 'rini.rarasati@bbspjppi.go.id', role: 'PIC' },
    { name: 'Kukuh Aryo', email: 'kukuh.aryo@bbspjppi.go.id', role: 'PIC' },
    { name: 'Fandhi Ahmad', email: 'fandhi.ahmad@bbspjppi.go.id', role: 'PIC' },
    { name: 'Lisa Indah P', email: 'lisa.indah@bbspjppi.go.id', role: 'PIC' },
    { name: 'Sanyoto Widagdo', email: 'sanyoto.widagdo@bbspjppi.go.id', role: 'PIC' },
    { name: 'Rahayu', email: 'rahayu@bbspjppi.go.id', role: 'PIC' },
    { name: 'Pimpinan Balai', email: 'pimpinan@bbspjppi.go.id', role: 'PIMPINAN' },
  ];

  const createdUsers = {};
  for (const u of defaultUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, passwordHash: hashPassword('password123'), isActive: true },
      create: {
        name: u.name,
        email: u.email,
        passwordHash: hashPassword('password123'),
        workUnitId: workUnit.id,
      },
    });
    createdUsers[u.role] = user;

    const role = await prisma.role.findUnique({ where: { name: u.role } });
    if (role) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      });
    }
  }

  await prisma.fiscalYear.upsert({
    where: { year: 2026 },
    update: { isActive: true },
    create: {
      year: 2026,
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-12-31T00:00:00.000Z'),
      isActive: true,
    },
  });

  const fiscalYear = await prisma.fiscalYear.findUnique({ where: { year: 2026 } });

  // Seed Indicators
  const createdIndicators = [];
  for (const [code, name, unit] of draftIndicators) {
    const indicator = await prisma.performanceIndicator.upsert({
      where: { code },
      update: { name, unit },
      create: { code, name, unit },
    });
    createdIndicators.push(indicator);
  }

  // Assign beberapa indicator ke PIC
  const picUser = createdUsers['PIC'];
  const indicatorsForPic = createdIndicators.slice(0, 5); // ambil 5 indicator pertama

  for (const indicator of indicatorsForPic) {
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

  // Buat data transaksi submissions dengan berbagai status
  const katimUser = createdUsers['KATIM'];
  const kapokjaUser = createdUsers['KAPOKJA'];

  const submissions = [
    {
      indicator: indicatorsForPic[0],
      quarter: 1,
      status: 'SUBMITTED_TO_KATIM',
      targetValue: 95.0,
      realizationValue: 94.5,
      narrative: 'Realisasi TW I IKM sangat baik, namun ada beberapa komplain yang ditindaklanjuti.',
      evaluation: 'Evaluasi berkala pelaksanaan kegiatan TW 1',
      constraints: 'Tidak ada kendala berarti.',
      followUp: 'Melakukan koordinasi dengan tim terkait.',
      evidenceUrl: '/uploads/dummy-evidence-tw1.pdf',
      reviewNote: null,
      reviewStage: null,
      reviewDecision: null,
    },
    {
      indicator: indicatorsForPic[1],
      quarter: 1,
      status: 'REVISION_REQUIRED_BY_KATIM',
      targetValue: 98.0,
      realizationValue: 80.0,
      narrative: 'Realisasi SLA layanan pengujian terlambat akibat pemeliharaan alat.',
      evaluation: 'Perlu perbaikan prosedur maintenance',
      constraints: 'Alat sedang dalam perbaikan.',
      followUp: 'Koordinasi dengan vendor alat.',
      evidenceUrl: '/uploads/dummy-evidence-tw1-sla.pdf',
      reviewNote: 'Bukti dukung lampiran berita acara pemeliharaan alat kurang lengkap. Mohon diunggah ulang.',
      reviewStage: 'KATIM',
      reviewDecision: 'REVISION',
    },
    {
      indicator: indicatorsForPic[2],
      quarter: 2,
      status: 'SUBMITTED_TO_KAPOKJA',
      targetValue: 85.0,
      realizationValue: 88.2,
      narrative: 'Nilai NPS meningkat dari kuartal lalu setelah percepatan layanan online.',
      evaluation: 'Percepatan layanan berjalan baik',
      constraints: 'Tidak ada kendala.',
      followUp: 'Pertahankan kualitas layanan.',
      evidenceUrl: '/uploads/dummy-evidence-tw2-nps.pdf',
      reviewNote: null,
      reviewStage: null,
      reviewDecision: null,
    },
    {
      indicator: indicatorsForPic[3],
      quarter: 2,
      status: 'REVISION_REQUIRED_BY_KAPOKJA',
      targetValue: 100.0,
      realizationValue: 90.0,
      narrative: 'Laporan pengujian laboratorium tepat waktu semester I.',
      evaluation: 'Evaluasi hasil pengujian semester I',
      constraints: 'Beberapa pengujian tertunda.',
      followUp: 'Tingkatkan koordinasi lab.',
      evidenceUrl: '/uploads/dummy-evidence-tw2-lab.pdf',
      reviewNote: 'Perhitungan persentase pada lembar kerja Excel perlu disesuaikan dengan formula baku.',
      reviewStage: 'KAPOKJA',
      reviewDecision: 'REVISION',
    },
    {
      indicator: indicatorsForPic[4],
      quarter: 1,
      status: 'PUBLISHED',
      targetValue: 90.0,
      realizationValue: 92.5,
      narrative: 'Efisiensi anggaran tercapai dengan optimalisasi operasional balai.',
      evaluation: 'Optimalisasi anggaran berhasil',
      constraints: 'Tidak ada kendala.',
      followUp: 'Pertahankan efisiensi.',
      evidenceUrl: '/uploads/dummy-evidence-tw1-budget.pdf',
      reviewNote: null,
      reviewStage: null,
      reviewDecision: null,
    },
  ];

  for (const sub of submissions) {
    // Hapus submission lama jika ada
    await prisma.performanceSubmission.deleteMany({
      where: {
        fiscalYearId: fiscalYear.id,
        indicatorId: sub.indicator.id,
      },
    });

    const submission = await prisma.performanceSubmission.create({
      data: {
        fiscalYearId: fiscalYear.id,
        indicatorId: sub.indicator.id,
        submittedById: picUser.id,
        status: sub.status,
        reportingQuarter: sub.quarter,
        realizationNarrative: sub.narrative,
        evaluation: sub.evaluation,
        constraints: sub.constraints,
        followUp: sub.followUp,
        physicalRealization: sub.realizationValue,
        evidenceFileUrl: sub.evidenceUrl,
        revisionNote: sub.reviewNote,
        submittedAt: new Date(),
        values: {
          create: {
            quarter: sub.quarter,
            targetValue: sub.targetValue,
            realizationValue: sub.realizationValue,
            evidenceFileUrl: sub.evidenceUrl,
          },
        },
      },
    });

    // Tambahkan review jika ada catatan
    if (sub.reviewNote) {
      await prisma.submissionReview.create({
        data: {
          performanceSubmissionId: submission.id,
          reviewerUserId: sub.reviewStage === 'KAPOKJA' ? kapokjaUser.id : katimUser.id,
          reviewStage: sub.reviewStage,
          decision: sub.reviewDecision,
          note: sub.reviewNote,
        },
      });
    }
  }

  console.log('✅ Seeding data dummy selesai dengan sukses!');
  console.log(`📊 Total Indicators: ${createdIndicators.length}`);
  console.log(`👤 Total Users: ${Object.keys(createdUsers).length}`);
  console.log(`📝 Total Submissions: ${submissions.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
