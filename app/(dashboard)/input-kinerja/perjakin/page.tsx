import Link from 'next/link';

export default function RealisasiPerjakinAkhirPage() {
  // Proxy menangani pengalihan route legacy. Fallback ini sengaja tidak
  // memakai redirect() agar tidak memicu bug performance.measure Turbopack.
  return (
    <main className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-bold text-slate-800">Realisasi Perjakin Akhir</h1>
      <p className="mt-2 text-sm text-slate-500">Halaman ini telah dipindahkan ke Input Realisasi.</p>
      <Link href="/input-realisasi" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
        Buka Input Realisasi
      </Link>
    </main>
  );
}
