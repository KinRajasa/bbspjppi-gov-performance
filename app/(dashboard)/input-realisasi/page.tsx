'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InputRealisasiExcelPage() {
  const [indikator, setIndikator] = useState('');
  // State untuk simulasi loading: 'idle' | 'loading' | 'success'
  const [uploadStatus, setUploadStatus] = useState('idle'); 

  // Fungsi untuk mensimulasikan proses backend membaca Excel
  const handleUploadSimulation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!indikator) {
      alert('Pilih Indikator Kinerja terlebih dahulu!');
      return;
    }
    
    setUploadStatus('loading');
    
    // Pura-puranya backend sedang mengekstrak data dari Excel selama 1.5 detik
    setTimeout(() => {
      setUploadStatus('success');
    }, 1500);
  };

  return (
    <div className="animation-fade-in w-full pb-10 flex flex-col min-h-[90vh]">
      
      {/* HEADER */}
      <header className="mb-8 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3 mb-2">
           <h2 className="text-3xl font-bold text-slate-800">Input Realisasi (Integrasi Excel)</h2>
        </div>
        <p className="text-sm text-slate-500">
          Unggah Kertas Kerja Excel untuk menarik data capaian indikator secara otomatis.
        </p>
      </header>

      <div className="flex flex-col gap-6 max-w-4xl">
        
        {/* ========================================================= */}
        {/* TAHAP 1 & 2: PILIH INDIKATOR & UPLOAD                     */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h3 className="font-bold text-slate-700 text-lg mb-6 border-b border-slate-100 pb-4">
            Tahap 1: Pemilihan Data & Dokumen
          </h3>

          <div className="space-y-6">
            {/* GRID UNTUK INDIKATOR DAN PERIODE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Pilih Indikator */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Indikator Kinerja <span className="text-rose-500">*</span></label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                  value={indikator}
                  onChange={(e) => setIndikator(e.target.value)}
                  disabled={uploadStatus === 'success'}
                >
                  <option value="">-- Pilih Indikator --</option>
                  <option value="sk1">SK.1 - Indeks Kepuasan Masyarakat (IKM)</option>
                  <option value="sk2">SK.2 - Persentase SLA Layanan Jasa</option>
                </select>
              </div>

              {/* Pilih Periode (Baru Ditambahkan) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Periode Laporan <span className="text-rose-500">*</span></label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                  disabled={uploadStatus === 'success'}
                  defaultValue=""
                >
                  <option value="" disabled>-- Pilih Bulan --</option>
                  <option value="jan">Januari</option>
                  <option value="feb">Februari</option>
                  <option value="mar">Maret (Triwulan I)</option>
                  <option value="apr">April</option>
                  <option value="mei">Mei</option>
                  <option value="jun">Juni (Triwulan II)</option>
                  <option value="jul">Juli</option>
                  <option value="ags">Agustus</option>
                  <option value="sep">September (Triwulan III)</option>
                  <option value="okt">Oktober</option>
                  <option value="nov">November</option>
                  <option value="des">Desember (Triwulan IV)</option>
                </select>
              </div>

            </div>

            {/* Area Upload (Drag & Drop) */}
            <div className={`transition-all duration-300 ${uploadStatus === 'success' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <label className="block text-sm font-bold text-slate-700 mb-2">Unggah Kertas Kerja (Excel) <span className="text-rose-500">*</span></label>
              
              <div 
                onClick={handleUploadSimulation}
                className="w-full border-2 border-dashed border-blue-300 rounded-xl p-8 flex flex-col items-center justify-center bg-blue-50/50 hover:bg-blue-50 hover:border-blue-500 transition cursor-pointer group"
              >
                {uploadStatus === 'loading' ? (
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[32px] text-blue-500 animate-spin mb-3">autorenew</span>
                    <p className="text-sm font-bold text-blue-600">Mengekstrak data dari Excel...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-blue-200 flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[28px]">upload_file</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 mb-1">
                      Klik untuk simulasi unggah file Excel (.xlsx)
                    </p>
                    <p className="text-xs text-slate-500">
                      Sistem akan membaca nilai realisasi akhir dari dokumen ini.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAHAP 3: HASIL TARIKAN DATA & EVALUASI                    */}
        {/* ========================================================= */}
        {uploadStatus === 'success' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 animation-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                Tahap 2: Verifikasi & Evaluasi
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded uppercase tracking-wider">Data Terekstrak</span>
              </h3>
              <button 
                onClick={() => setUploadStatus('idle')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
              >
                Unggah Ulang Dokumen
              </button>
            </div>

            {/* Kotak Hasil Tarikan Data (Read-Only) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8 justify-center text-center md:text-left">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target</p>
                <p className="text-3xl font-black text-slate-400">3.50</p>
              </div>
              
              <div className="hidden md:block h-12 w-px bg-slate-300"></div>
              
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1 justify-center md:justify-start">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Realisasi (Dari Excel)
                </p>
                <p className="text-4xl font-black text-emerald-600">3.72</p>
              </div>
            </div>

            {/* Input Evaluasi manual oleh PIC (DISEMBUNYIKAN KARENA SUDAH ADA DI EXCEL) */}
            {/* 
            <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Penjelasan / Kendala Pelaksanaan <span className="text-slate-400 text-xs font-normal">(Opsional)</span></label>
                <textarea 
                rows={4}
                placeholder="Tuliskan jika ada kendala atau catatan khusus mengenai hasil kinerja ini..."
                className="w-full border border-slate-300 rounded-lg p-4 text-sm outline-none focus:border-blue-500 transition resize-none bg-white"
                ></textarea>
            </div>
            
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tindak Lanjut / Perbaikan <span className="text-slate-400 text-xs font-normal">(Opsional)</span></label>
                <textarea 
                rows={3}
                placeholder="Tuliskan rencana tindak lanjut ke depannya..."
                className="w-full border border-slate-300 rounded-lg p-4 text-sm outline-none focus:border-blue-500 transition resize-none bg-white"
                ></textarea>
            </div>
            </div>
            */}
            {/* Tombol Kirim */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
              <Link 
                href="/riwayat-pengajuan"
                className="bg-[#0f172a] text-white px-8 py-3 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
                Ajukan Laporan Perjakin
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}