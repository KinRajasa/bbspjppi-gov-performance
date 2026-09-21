# Gov Performance System BBSPJPPI

Aplikasi pemantauan kinerja BBSPJPPI berbasis Next.js App Router, Prisma ORM, MySQL, dan Tailwind CSS.

## Prasyarat

- Node.js 20 atau lebih baru
- npm, Git, dan MySQL 8/MariaDB
- Google Cloud Service Account dan folder Google Drive bila upload bukti digunakan

## Instalasi lokal

```bash
git clone <URL_REPOSITORY>
cd bbspjppi-gov-performance
npm install
```

Buat database MySQL bernama `bbspjppi_performance`, kemudian salin konfigurasi:

```powershell
Copy-Item .env.example .env.local
```

Isi minimal:

```env
DATABASE_URL="mysql://root:@localhost:3306/bbspjppi_performance"
```

Jangan commit `.env`, `.env.local`, private key, atau credential JSON.

## Prisma dan database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed-users
```

Gunakan `npm run db:push` hanya untuk pengembangan lokal jika migration belum tersedia. Password awal akun seeder adalah `password123`; ganti sebelum produksi.

## Menjalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`.

Untuk production lokal:

```bash
npm run build
npm run start
```

## Integrasi Google Sheets dan Drive

Sinkronisasi spreadsheet tersedia di `/perjanjian-kinerja/integrasi-sheet`. Panduan detail ada di [docs/google-sheets-setup.md](docs/google-sheets-setup.md).

Upload bukti dukung menggunakan Service Account. Isi hanya di `.env.local` atau environment server:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL="..."
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
GOOGLE_DRIVE_FOLDER_ID="..."
GOOGLE_DRIVE_PUBLIC_LINK="true"
```

Bagikan folder kepada email Service Account. Untuk menghindari error kuota, gunakan folder Shared Drive dan berikan akses Content Manager. Jangan menaruh private key di frontend atau repository.

## Halaman utama

- `/login` — login pengguna
- `/dashboard` — dashboard eksekutif
- `/input-kinerja` dan `/input-realisasi` — input PIC
- `/validasi-katim` dan `/validasi-kapokja` — validasi bertingkat
- `/perjanjian-kinerja` — master Perjanjian Kinerja
- `/log-aktivitas` — audit log Admin

Akses halaman dikendalikan berdasarkan role melalui proxy/RBAC.

## Pemeliharaan

```bash
npm run db:cleanup-ghost
npm run db:normalize-indicators
npm run lint
```

## Deployment

1. Siapkan MySQL production dan isi `DATABASE_URL` pada environment hosting.
2. Tambahkan environment variable secara aman; jangan upload `.env`.
3. Jalankan `npm ci`, lalu `npm run db:migrate`.
4. Jalankan `npm run build` dan `npm run start` atau gunakan provider Next.js.
5. Uji login semua role, migration, upload Drive, dan sinkronisasi spreadsheet.
6. Backup database sebelum migration dan rotasi credential jika pernah terekspos.
