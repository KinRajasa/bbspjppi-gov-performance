'use client';

import Link from 'next/link';

export default function DetailRiwayatPage() {
  return (
    <div className="animation-fade-in w-full pb-10">
      
      {/* HEADER WITH BACK BUTTON & STATUS BADGE */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <Link 
            href="/riwayat-pengajuan" 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 transition"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Arsip Laporan</p>
            <h2 className="text-2xl font-bold text-slate-800">Detail Capaian & Realisasi (Maret 2026)</h2>
          </div>
        </div>
        
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 w-max">
          <span className="material-symbols-outlined text-[18px]">check_circle</span> DISETUJUI KAPOKJA (SELESAI)
        </div>
      </header>

      <div className="space-y-6 opacity-95">
        
        {/* ========================================================= */}
        {/* INFO INDIKATOR (READ-ONLY)                                */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          
          {/* 👇 KONTEKS SASARAN DITAMBAHKAN DI SINI 👇 */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-500 mb-2">Sasaran Kegiatan</label>
            <div className="w-full bg-slate-50 border border-slate-200 text-blue-600 text-sm rounded-md px-4 py-3 font-bold">
              Sasaran 1: Meningkatnya kualitas dan kuantitas layanan jasa industri
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Indikator Kinerja</label>
              {/* Kode SK.1 diubah menjadi 1.1 */}
              <div className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-md px-4 py-3 font-bold">
                1.1 - Indeks Kepuasan Masyarakat (IKM)
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Penanggung Jawab</label>
              <div className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-md px-4 py-3 font-medium">
                Budi Santoso (PIC Umum)
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Periode Pelaporan</label>
              <div className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-md px-4 py-3 font-medium">
                Maret 2026
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LAPORAN PELAKSANAAN (READ-ONLY)                           */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-700 text-lg mb-6 border-b border-slate-100 pb-4">Laporan Pelaksanaan & Evaluasi</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-500 mb-2">Rencana Kegiatan</label>
              <textarea 
                rows={5}
                disabled
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-4 text-sm text-slate-500 outline-none resize-none leading-relaxed"
                defaultValue="1. Penanganan dan pemantauan komplain pelanggan.&#10;2. Penyebaran kuesioner kepuasan pelanggan.&#10;3. Evaluasi dan penghitungan statistisi penilaian IKM."
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-2">Realisasi Kegiatan (Telah Dilaporkan)</label>
              <textarea 
                rows={5}
                disabled
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-4 text-sm text-slate-700 font-medium outline-none resize-none leading-relaxed"
                defaultValue="1. Penyebaran kuesioner kepada 118 pelanggan dan kembali kepada BBSPJPPI sejumlah 22 responden.&#10;Hasil analisa IKM berpedoman pada PermenPANRB NO 14/2017 adalah sebesar 3.72."
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <h4 className="font-bold text-slate-600 mb-4 text-sm">Analisis & Tindak Lanjut</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Kendala yang Dihadapi</label>
                <div className="w-full bg-white border border-slate-200 border-l-4 border-l-rose-400 rounded-md p-4 text-sm text-slate-600 leading-relaxed">
                  Tingkat respons (response rate) pengisian survei mandiri masih rendah.
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Tindak Lanjut / Perbaikan</label>
                <div className="w-full bg-white border border-slate-200 border-l-4 border-l-blue-400 rounded-md p-4 text-sm text-slate-600 leading-relaxed">
                  Memberikan notifikasi pengingat via WhatsApp kepada pelanggan setelah dokumen LHU diserahkan.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CAPAIAN FISIK (READ-ONLY)                                 */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-700 text-lg mb-6 border-b border-slate-100 pb-4">Capaian % Fisik (Kuantitatif)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Target % Fisik</span>
              <div className="text-4xl font-black text-slate-400">25%</div>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6 flex flex-col items-center justify-center shadow-sm">
               <span className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wider">Realisasi % Fisik</span>
               <div className="text-4xl font-black text-emerald-600">25%</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}