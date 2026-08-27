'use client';

import Link from 'next/link';

export default function DetailValidasiPage() {
  return (
    <div className="animation-fade-in w-full pb-10">
      
      {/* HEADER WITH BACK BUTTON */}
      <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <Link 
            href="/validasi-data" 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 transition"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">BBSPJPPI Gov Performance System</p>
            <h2 className="text-2xl font-bold text-slate-800">Review Capaian Kinerja (Triwulan II)</h2>
          </div>
        </div>
        
        {/* Profile Info (Katim/Reviewer) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="font-bold text-slate-800 text-sm leading-tight">Bapak Ahmad</span>
            <span className="text-xs text-slate-500">Katim / Reviewer</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-sm">
            BA
          </div>
        </div>
      </header>

      <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-5 mb-6 flex gap-4 items-start shadow-sm">
        <div className="bg-rose-100 p-2.5 rounded-full flex-shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-rose-600 text-[22px]">assignment_return</span>
        </div>
        <div>
          <h4 className="font-bold text-rose-800 text-sm">Catatan Revisi Sebelumnya (23 Okt 2026, 15:45)</h4>
          <p className="text-rose-700 text-sm mt-1.5 leading-relaxed italic">
            "Tolong perbaiki angka realisasi pada Triwulan III, sepertinya tidak sesuai dengan dokumen kuitansi. Mohon dicek ulang kesesuaiannya dengan file Excel lampiran."
          </p>
        </div>
      </div>

      {/* MAIN CONTENT GRID (2 KILOM) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ========================================== */}
        {/* KOLOM KIRI (Informasi Utama & Kualitatif)  */}
        {/* ========================================== */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* KARTU 1: Info Indikator Utama */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <div className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              Menunggu Validasi Anda
            </div>
            
            <h3 className="text-3xl font-bold text-slate-800 leading-snug mb-4">
              TJ.1 - Indeks Kepuasan Masyarakat (IKM)
            </h3>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 font-medium mb-8">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person</span>
                Budi Santoso (PIC Umum)
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                Periode: Triwulan II (Apr-Jun 2026)
              </div>
            </div>

            {/* Kotak Perbandingan Angka */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Target</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-800">3.68</span>
                  <span className="text-sm font-medium text-slate-500">Indeks</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-xs font-bold text-slate-500 mb-1">Realisasi</p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-blue-600">3.69</span>
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2.5 py-1.5 rounded flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span> Melampaui Target
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KARTU 2: Data Kualitatif */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <span className="material-symbols-outlined text-slate-800 text-[22px]">description</span>
              <h3 className="font-bold text-slate-800 text-lg">Data Kualitatif</h3>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Realisasi Kegiatan</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Penyebaran kuesioner kepada 500 responden layanan pengujian dan kalibrasi. Pengumpulan data dilakukan secara hybrid (online dan tatap muka) di ruang layanan terpadu BBSPJPPI.
                </p>
              </div>
              
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Evaluasi Pelaksanaan</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Respon kurang proaktif pada minggu pertama penyebaran online. Diperlukan reminder aktif melalui WhatsApp gateway yang diintegrasikan dengan sistem antrean.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-rose-50 border-l-4 border-rose-500 rounded-r-xl p-5">
                  <div className="flex items-center gap-1.5 text-rose-600 font-bold text-sm mb-2">
                    <span className="material-symbols-outlined text-[18px]">warning</span> Kendala
                  </div>
                  <p className="text-sm text-rose-700 leading-relaxed">
                    Partisipasi pelanggan industri kecil menengah (IKM) masih rendah because of keterbatasan literasi digital.
                  </p>
                </div>
                <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl p-5">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm mb-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Tindak Lanjut
                  </div>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Mengerahkan petugas customer service untuk pendampingan pengisian kuesioner secara langsung di loket.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* KOLOM KANAN (Fisik, Dokumen, & Form Validasi)*/}
        {/* ========================================== */}
        <div className="space-y-6">
          
          {/* KARTU 3: Capaian Fisik */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-slate-800 text-[22px]">data_usage</span>
              <h3 className="font-bold text-slate-800 text-lg">Capaian Fisik</h3>
            </div>
            
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Realisasi</p>
                <p className="text-3xl font-black text-slate-800">50%</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target Triwulan</p>
                <p className="text-xl font-bold text-slate-700">50%</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-6">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '50%' }}></div>
            </div>

            <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-2 rounded flex items-center justify-center gap-1.5 border border-emerald-200">
              <span className="material-symbols-outlined text-[16px]">check_circle</span> STATUS: TARGET FISIK TERPENUHI
            </div>
          </div>

          {/* KARTU 4: Dokumen Bukti Dukung */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-slate-800 text-[22px]">snippet_folder</span>
              <h3 className="font-bold text-slate-800 text-lg">Dokumen Bukti Dukung</h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-300 transition cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="text-emerald-500 bg-emerald-100 w-10 h-10 flex items-center justify-center rounded-lg">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition">Rekap_Survei_IKM_TW2.xlsx</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">1.2 MB • Diunggah 30 Jun</p>
                </div>
              </div>
              <button className="text-slate-400 group-hover:text-blue-600 transition">
                <span className="material-symbols-outlined">download</span>
              </button>
            </div>
          </div>

          {/* KARTU 5: Form Validasi Data (Highlighted) */}
          <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-md p-6 lg:p-8 relative overflow-hidden">
            {/* Soft blue background accent */}
            <div className="absolute inset-0 bg-blue-50/30"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-slate-800 text-[22px]">fact_check</span>
                <h3 className="font-bold text-slate-800 text-lg">Validasi Data</h3>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-600 mb-2">Catatan Review (Opsional jika disetujui)</label>
                <textarea 
                  rows={4}
                  placeholder="Masukkan instruksi revisi atau catatan persetujuan di sini..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-4 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 border border-rose-500 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 transition flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">close</span> Tolak & Revisi
                </button>
                <button className="flex-1 py-3 bg-[#0f172a] text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-sm flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">check</span> Setujui Data
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}