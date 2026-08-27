'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InputRealisasiSheetPage() {
  // 1. DATA DUMMY KONSISTEN (Menggunakan optgroup)
  const sasarans = [
    {
      id: 1,
      namaSasaran: 'Meningkatnya kualitas dan kuantitas layanan jasa industri',
      indikators: [
        { id: '1.1', nama: 'Indeks Kepuasan Masyarakat (IKM)', target: 3.70, satuan: 'Indeks', pic: 'Ketua Tim Kerja PJI' },
        { id: '1.2', nama: 'Jumlah perusahaan industri yang memanfaatkan layanan', target: 990, satuan: 'Perusahaan', pic: 'Ketua Tim Kerja PJI' },
        { id: '1.3', nama: 'Persentase pelayanan tepat waktu (SLA)', target: 90.00, satuan: 'Persen', pic: 'Ketua Tim Kerja PJI' }
      ]
    },
    {
      id: 2,
      namaSasaran: 'Terwujudnya layanan tata kelola pemerintahan yang baik',
      indikators: [
        { id: '2.1', nama: 'Indeks peningkatan PNBP', target: 3.00, satuan: 'Indeks', pic: 'Kapokja Keuangan dan BMN' }
      ]
    }
  ];

  const [indikator, setIndikator] = useState('');
  const [periode, setPeriode] = useState('');
  // State: 'idle' | 'fetching' | 'success'
  const [syncStatus, setSyncStatus] = useState('idle'); 

  // Efek pintar: Kalau indikator & periode sudah dipilih, otomatis tarik data!
  useEffect(() => {
    if (indikator && periode) {
      setSyncStatus('fetching');
      // Simulasi backend narik data dari Google Sheets selama 1.5 detik
      setTimeout(() => {
        setSyncStatus('success');
      }, 1500);
    }
  }, [indikator, periode]);

  return (
    <div className="animation-fade-in w-full pb-10 flex flex-col min-h-[90vh]">
      
      {/* HEADER */}
      <header className="mb-8 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3 mb-2">
           <span className="material-symbols-outlined text-blue-600 text-[28px]">sync_saved_locally</span>
           <h2 className="text-3xl font-bold text-slate-800">Input Realisasi Perjakin</h2>
        </div>
        <p className="text-sm text-slate-500">
          Data capaian akan ditarik otomatis dari Google Sheets master instansi.
        </p>
      </header>

      <div className="flex flex-col gap-6 max-w-4xl">
        
        {/* TAHAP 1: PILIH DATA */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h3 className="font-bold text-slate-700 text-lg mb-6 border-b border-slate-100 pb-4">
            Tahap 1: Pemilihan Indikator
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pilih Indikator (Telah di-update menggunakan Optgroup) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Indikator Kinerja <span className="text-rose-500">*</span></label>
              <select 
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                value={indikator}
                onChange={(e) => setIndikator(e.target.value)}
              >
                <option value="">-- Pilih Indikator --</option>
                {sasarans.map((sasaran, index) => (
                  <optgroup key={sasaran.id} label={`Sasaran ${index + 1}: ${sasaran.namaSasaran}`} className="font-bold text-slate-500">
                    {sasaran.indikators.map(ind => (
                      <option key={ind.id} value={ind.id} className="font-normal text-black">
                        {ind.id} - {ind.nama}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Pilih Periode (Triwulanan) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Periode Laporan <span className="text-rose-500">*</span></label>
              <select 
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
              >
                <option value="" disabled>-- Pilih Periode --</option>
                <option value="tw1">Triwulan I</option>
                <option value="tw2">Triwulan II</option>
                <option value="tw3">Triwulan III</option>
                <option value="tw4">Triwulan IV</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOADING ANIMATION */}
        {syncStatus === 'fetching' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col items-center justify-center animation-fade-in">
             <span className="material-symbols-outlined text-[32px] text-blue-500 animate-spin mb-3">autorenew</span>
             <p className="text-sm font-bold text-blue-600">Sinkronisasi data dari Google Sheets...</p>
          </div>
        )}

        {/* TAHAP 2: HASIL TARIKAN DATA & BUKTI DUKUNG */}
        {syncStatus === 'success' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 animation-fade-in flex flex-col">
            <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              Tahap 2: Hasil Realisasi & Bukti Dukung
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                 <span className="material-symbols-outlined text-[12px]">cloud_done</span> Tersinkron
              </span>
            </h3>

            {/* Kotak Hasil Tarikan Data (Read-Only) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8 justify-center text-center md:text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] px-3 py-1 font-bold rounded-bl-lg">
                Sumber: Google Sheets
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Triwulan</p>
                <p className="text-3xl font-black text-slate-400">88.50%</p>
              </div>
              <div className="hidden md:block h-12 w-px bg-slate-300"></div>
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Realisasi Tercapai</p>
                <p className="text-4xl font-black text-emerald-600">99.40%</p>
              </div>
            </div>

            {/* Upload Bukti Dukung Fisik */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Unggah Dokumen Bukti Dukung <span className="text-rose-500">*</span></label>
              <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition cursor-pointer group">
                <span className="material-symbols-outlined text-[28px] text-slate-400 mb-2 group-hover:text-blue-500 transition">picture_as_pdf</span>
                <p className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition">Klik untuk mengunggah file</p>
                <p className="text-xs text-slate-400">Mendukung format PDF, JPG, atau PNG (Maks 5MB)</p>
              </div>
            </div>

            {/* BOTTOM ACTIONS (BARU) */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
              <button className="px-6 py-2.5 rounded-md text-sm font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 transition shadow-sm">
                Batal
              </button>
              <button className="px-8 py-2.5 rounded-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition shadow-sm">
                <span className="material-symbols-outlined text-[18px]">save</span> Simpan Data Realisasi
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}