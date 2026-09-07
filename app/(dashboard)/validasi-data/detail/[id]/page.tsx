'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getLaporanById } from '../../data';

export default function DetailValidasiPage() {
  const params = useParams();
  const id = Number(params.id);
  const laporan = getLaporanById(id);

  const [catatan, setCatatan] = useState('');
  const [errorCatatan, setErrorCatatan] = useState('');

  const handleTolak = () => {
    if (catatan.trim() === '') {
      setErrorCatatan('Catatan wajib diisi saat menolak data, agar PIC tahu apa yang perlu diperbaiki.');
      return;
    }
    setErrorCatatan('');
    // TODO: panggil API tolak-validasi dengan payload { id, catatan }
  };

  const handleSetujui = () => {
    setErrorCatatan('');
    // TODO: panggil API setujui-validasi dengan payload { id, catatan }
  };

  // Kalau id di URL tidak cocok dengan laporan manapun, tampilkan pesan yang jelas
  // alih-alih halaman kosong atau data yang salah.
  if (!laporan) {
    return (
      <div className="animation-fade-in w-full pb-10">
        <Link href="/validasi-data" className="inline-flex items-center gap-2 text-blue-600 font-medium mb-6 hover:underline">
          <span className="material-symbols-outlined">arrow_back</span> Kembali ke Antrean Validasi
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-slate-600 font-medium">Laporan dengan ID tersebut tidak ditemukan.</p>
        </div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-bold text-slate-800">Review Capaian Kinerja ({laporan.periode.split(' (')[0]})</h2>
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

      {/* Banner Catatan Revisi -- HANYA muncul kalau laporan ini memang pernah ditolak sebelumnya */}
      {laporan.catatanRevisi && (
        <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-5 mb-6 flex gap-4 items-start shadow-sm">
          <div className="bg-rose-100 p-2.5 rounded-full flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-rose-600 text-[22px]">assignment_return</span>
          </div>
          <div>
            <h4 className="font-bold text-rose-800 text-sm">Catatan Revisi Sebelumnya ({laporan.catatanRevisi.tanggal})</h4>
            <p className="text-rose-700 text-sm mt-1.5 leading-relaxed italic">
              "{laporan.catatanRevisi.isi}"
            </p>
          </div>
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* KARTU 1: Info Indikator Utama */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <div className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 ${
              laporan.statusType === 'danger' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {laporan.statusType === 'danger' ? 'Revisi Ulang Diperlukan' : 'Menunggu Validasi Anda'}
            </div>
            
            <p className="text-sm font-bold text-blue-600 mb-1">
              Sasaran: {laporan.sasaran}
            </p>
            <h3 className="text-3xl font-bold text-slate-800 leading-snug mb-4">
              {laporan.kodeIndikator} - {laporan.namaIndikator}
            </h3>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 font-medium mb-8">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person</span>
                {laporan.pic} ({laporan.picRole})
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                Periode: {laporan.periode}
              </div>
            </div>

            {/* Kotak Perbandingan Angka */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Target</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-800">{laporan.target}</span>
                  <span className="text-sm font-medium text-slate-500">{laporan.satuanTarget}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-xs font-bold text-slate-500 mb-1">Realisasi S.d {laporan.periode.split('(Apr-Jun')[0].includes('II') ? 'Juni' : 'Periode'}</p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-blue-600">{laporan.realisasi}</span>
                  <div className={`text-xs font-bold px-2.5 py-1.5 rounded flex items-center gap-1.5 border ${
                    laporan.statusRealisasi.toLowerCase().includes('belum')
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {laporan.statusRealisasi.toLowerCase().includes('belum') ? 'trending_down' : 'trending_up'}
                    </span>
                    {laporan.statusRealisasi}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KARTU 2: Data Kualitatif (Breakdown per Bulan) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <span className="material-symbols-outlined text-slate-800 text-[22px]">description</span>
              <h3 className="font-bold text-slate-800 text-lg">Data Kualitatif ({laporan.periode.split(' (')[0]})</h3>
            </div>

            <div className="space-y-8">
              
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Rincian Realisasi Bulanan</h4>
                <div className="space-y-3">
                  {laporan.rincianBulanan.map((bulan) => (
                    <div key={bulan.label} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/4 font-bold text-slate-700 text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div> {bulan.label}
                      </div>
                      <div className="md:w-3/4 text-sm text-slate-600 leading-relaxed">
                        {bulan.deskripsi}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Evaluasi Keseluruhan ({laporan.periode.split(' (')[0]})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-rose-50 border-l-4 border-rose-500 rounded-r-xl p-5">
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-sm mb-2">
                      <span className="material-symbols-outlined text-[18px]">warning</span> Kendala
                    </div>
                    <ul className="text-sm text-rose-700 leading-relaxed list-disc pl-4 space-y-1">
                      {laporan.kendala.map((k, i) => <li key={i}>{k}</li>)}
                    </ul>
                  </div>
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl p-5">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm mb-2">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span> Tindak Lanjut
                    </div>
                    <p className="text-sm text-emerald-700 leading-relaxed">
                      {laporan.tindakLanjut}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
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
                <p className="text-3xl font-black text-slate-800">{laporan.capaianFisik.realisasi}%</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target Triwulan</p>
                <p className="text-xl font-bold text-slate-700">{laporan.capaianFisik.target}%</p>
              </div>
            </div>
            
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-6">
              <div
                className={`h-full rounded-full ${laporan.capaianFisik.realisasi >= laporan.capaianFisik.target ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(laporan.capaianFisik.realisasi, 100)}%` }}
              ></div>
            </div>

            <div className={`text-xs font-bold px-3 py-2 rounded flex items-center justify-center gap-1.5 border ${
              laporan.capaianFisik.realisasi >= laporan.capaianFisik.target
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <span className="material-symbols-outlined text-[16px]">
                {laporan.capaianFisik.realisasi >= laporan.capaianFisik.target ? 'check_circle' : 'error'}
              </span>
              {laporan.capaianFisik.statusLabel}
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
                  <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition">{laporan.dokumen.nama}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{laporan.dokumen.ukuran} • Diunggah {laporan.dokumen.tanggalUpload}</p>
                </div>
              </div>
              <button className="text-slate-400 group-hover:text-blue-600 transition">
                <span className="material-symbols-outlined">download</span>
              </button>
            </div>
          </div>

          {/* KARTU 5: Form Validasi Data */}
          <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-md p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-50/30"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-slate-800 text-[22px]">fact_check</span>
                <h3 className="font-bold text-slate-800 text-lg">Validasi Data</h3>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Catatan Review <span className="font-normal text-slate-400">(Wajib diisi jika menolak)</span>
                </label>
                <textarea 
                  rows={4}
                  value={catatan}
                  onChange={(e) => {
                    setCatatan(e.target.value);
                    if (errorCatatan) setErrorCatatan('');
                  }}
                  placeholder="Masukkan instruksi revisi atau catatan persetujuan di sini..."
                  className={`w-full bg-white border rounded-xl p-4 text-sm text-slate-700 outline-none focus:ring-2 transition resize-none ${
                    errorCatatan
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
                {errorCatatan && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {errorCatatan}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleTolak}
                  className="flex-1 py-3 border border-rose-500 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 transition flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span> Tolak & Revisi
                </button>
                <button
                  onClick={handleSetujui}
                  className="flex-1 py-3 bg-[#0f172a] text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-sm flex items-center justify-center gap-1"
                >
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