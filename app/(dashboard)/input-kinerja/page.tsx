'use client';

import Link from 'next/link';

export default function PintuMasukInputKinerjaPage() {
  return (
    <div className="animation-fade-in w-full pb-10 flex flex-col min-h-[90vh]">
      
      {/* HEADER */}
      <header className="mb-10 border-b border-slate-200 pb-5 text-center md:text-left">
        <h2 className="text-3xl font-bold text-slate-800">Pilih Jenis Pelaporan</h2>
        <p className="text-sm text-slate-500 mt-2">
          Silakan pilih jenis data kinerja yang ingin Anda laporkan pada periode ini.
        </p>
      </header>

      {/* DUA KARTU PILIHAN BESAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto md:mx-0 w-full">
        
        {/* KARTU 1: REALISASI FISIK (Manual) */}
        <Link 
          href="/input-kinerja/fisik"
          className="group bg-white rounded-2xl border-2 border-slate-200 p-8 flex flex-col items-center md:items-start text-center md:text-left hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 mb-6 transition-colors border border-slate-100">
            <span className="material-symbols-outlined text-[32px]">edit_document</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
            Realisasi Fisik (Rencana Aksi)
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Formulir manual untuk menginput capaian kuantitatif (persentase) dan evaluasi rencana kegiatan bulanan/triwulanan.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
            Buka Formulir <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </div>
        </Link>

        {/* KARTU 2: REALISASI PERJAKIN (Excel) */}
        <Link 
          href="/input-realisasi"
          className="group bg-white rounded-2xl border-2 border-slate-200 p-8 flex flex-col items-center md:items-start text-center md:text-left hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 mb-6 transition-colors border border-slate-100">
            <span className="material-symbols-outlined text-[32px]">upload_file</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
            Realisasi Perjakin Akhir
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Unggah dokumen Kertas Kerja (Excel) untuk menarik data capaian indikator Perjanjian Kinerja secara otomatis.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
            Mulai Unggah <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </div>
        </Link>

      </div>

    </div>
  );
}