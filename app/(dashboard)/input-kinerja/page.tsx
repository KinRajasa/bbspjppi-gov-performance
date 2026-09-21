import Link from 'next/link';

export default function InputKinerjaPage() {
  return (
    <div className="animation-fade-in w-full pb-10">
      <header className="mb-8 border-b border-slate-200 pb-5">
        <h2 className="text-3xl font-bold text-slate-800">Input Kinerja</h2>
        <p className="mt-2 text-sm text-slate-500">Pilih jenis pelaporan yang ingin Anda kerjakan.</p>
      </header>
      <div className="grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        <Link href="/input-kinerja/fisik" className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><span className="material-symbols-outlined text-[30px]">monitoring</span></div>
          <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700">Realisasi Fisik (Rencana Aksi)</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">Laporkan realisasi kegiatan, evaluasi lapangan, dan capaian fisik bulanan atau triwulanan.</p>
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-blue-600">Mulai pelaporan <span className="material-symbols-outlined text-[18px]">arrow_forward</span></span>
        </Link>
        <Link href="/input-kinerja/perjakin" className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><span className="material-symbols-outlined text-[30px]">upload_file</span></div>
          <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-700">Realisasi Perjakin Akhir</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">Unggah Kertas Kerja Excel sebagai laporan realisasi Perjanjian Kinerja akhir tahun.</p>
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-600">Unggah kertas kerja <span className="material-symbols-outlined text-[18px]">arrow_forward</span></span>
        </Link>
      </div>
    </div>
  );
}
