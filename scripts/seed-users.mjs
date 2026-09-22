import { randomBytes, scryptSync } from 'node:crypto';
import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';

nextEnv.loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
const hash = (password) => { const salt = randomBytes(16).toString('hex'); return `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`; };

const users = [
  ['Admin System', 'admin@bbspjppi.go.id', 'ADMIN'],
  ['Kepala BBSPJPPI', 'pimpinan@bbspjppi.go.id', 'PIMPINAN'],
  ['Dyah Af', 'dyah.af@bbspjppi.go.id', 'KAPOKJA'],
  ['Dyah Ahsina', 'dyah.ahsina@bbspjppi.go.id', 'KATIM'],
  ['Aditya Wicaksono', 'aditya.wicaksono@bbspjppi.go.id', 'KATIM'],
  ['Sidna Kosim', 'sidna.kosim@bbspjppi.go.id', 'PIC'],
  ['Yohan Kaleb', 'yohan.kaleb@bbspjppi.go.id', 'PIC'],
  ['Iin Farida', 'iin.farida@bbspjppi.go.id', 'PIC'],
  ['Novarina', 'novarina@bbspjppi.go.id', 'PIC'],
  ['Adi P', 'adi.p@bbspjppi.go.id', 'PIC'],
  ['Farsananda Noni', 'farsananda.noni@bbspjppi.go.id', 'PIC'],
  ['Misbakhul Anam', 'misbakhul.anam@bbspjppi.go.id', 'PIC'],
  ['Agung BP', 'agung.bp@bbspjppi.go.id', 'PIC'],
  ['Nur Zen', 'nur.zen@bbspjppi.go.id', 'PIC'],
  ['Rini Rarasati', 'rini.rarasati@bbspjppi.go.id', 'PIC'],
  ['Kukuh Aryo', 'kukuh.aryo@bbspjppi.go.id', 'PIC'],
  ['Fandhi Ahmad', 'fandhi.ahmad@bbspjppi.go.id', 'PIC'],
  ['Lisa Indah P', 'lisa.indah@bbspjppi.go.id', 'PIC'],
  ['Sanyoto Widagdo', 'sanyoto.widagdo@bbspjppi.go.id', 'PIC'],
  ['Rahayu', 'rahayu@bbspjppi.go.id', 'PIC'],
];

async function main() {
  const workUnit = await prisma.workUnit.upsert({ where: { code: 'BBSPJPPI' }, update: {}, create: { code: 'BBSPJPPI', name: 'BBSPJPPI Semarang' } });
  for (const [name, email, roleName] of users) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Role ${roleName} belum tersedia.`);
    const user = await prisma.user.upsert({ where: { email }, update: { name, isActive: true, passwordHash: hash('password123') }, create: { name, email, passwordHash: hash('password123'), workUnitId: workUnit.id } });
    await prisma.userRole.deleteMany({ where: { userId: user.id, roleId: { not: role.id } } });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
  }
  console.log(`Seeded ${users.length} akun. Password default: password123`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
