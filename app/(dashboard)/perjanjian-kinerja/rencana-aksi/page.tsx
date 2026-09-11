'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InputRencanaAksiPage() {
  // 1. DATA DUMMY: Tersinkronisasi dengan struktur Master Data IKU yang baru
  const sasarans = [
    {
      id: 1,
      namaSasaran: 'Meningkatnya kualitas dan kuantitas layanan jasa industri',
      indikators: [
        { id: '1.1', nama: 'Indeks Kepuasan Masyarakat (IKM)*', target: 3.70, satuan: 'Indeks', pic: 'Ketua Tim Kerja PJI' },
        { id: '1.2', nama: 'Jumlah perusahaan industri yang memanfaatkan layanan*', target: 990, satuan: 'Perusahaan', pic: 'Ketua Tim Kerja PJI' },
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

  // 2. STATE LOGIC: Melacak indikator mana yang sedang dipilih
  const [selectedIndikatorId, setSelectedIndikatorId] = useState('1.1');

  // 3. AUTO-FILL LOGIC: Mencari detail PIC dan Target dari indikator yang dipilih
  let selectedIndikator: any = null;
  sasarans.forEach(sasaran => {
    const found = sasaran.indikators.find(ind => ind.id === selectedIndikatorId);
    if (found) selectedIndikator = found;
  });

  return (
    <div className="animation-fade-in w-full pb-10">
      
      {/* HEADER */}
      <header className="mb-8 border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-800">Input Rencana Aksi Tahunan</h2>
        <p className="text-sm text-slate-500 mt-1">
          Tetapkan target antara dan rincian rencana kegiatan untuk setiap triwulan.
        </p>
      </header>

      <div className="space-y-8">
        
        {/* CARD 1: INFORMASI INDIKATOR & PENUGASAN */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-blue-500 text-[20px]">info</span>
            <h3 className="font-bold text-slate-700 text-lg">Informasi Indikator & Penugasan</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* KOLOM KIRI: DROPDOWN DINAMIS */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Pilih Indikator Kinerja</label>
              <select 
                value={selectedIndikatorId}
                onChange={(e) => setSelectedIndikatorId(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white font-medium cursor-pointer"
              >
                {/* Looping data Sasaran menjadi Grup Dropdown */}
                {sasarans.map((sasaran, index) => (
                  <optgroup key={sasaran.id} label={`Sasaran ${index + 1}: ${sasaran.namaSasaran}`} className="font-bold text-slate-500">
                    {/* Looping data Indikator menjadi Opsi */}
                    {sasaran.indikators.map(ind => (
                      <option key={ind.id} value={ind.id} className="font-normal text-black">
                        {ind.id} - {ind.nama}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              
              {/* Teks Target otomatis berubah mengikuti indikator yang dipilih */}
              {selectedIndikator && (
                <p className="text-xs font-medium text-blue-600 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">adjust</span> Target Tahunan: {selectedIndikator.target} {selectedIndikator.satuan}
                </p>
              )}
            </div>
            
            {/* KOLOM KANAN: PIC (Auto-fill) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Penanggung Jawab (PIC)</label>
              <input 
                type="text" 
                disabled 
                value={selectedIndikator ? selectedIndikator.pic : ''} 
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold rounded-md px-4 py-2.5 outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SECTION: RINCIAN KEGIATAN PER TRIWULAN */}
        <div>
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 inline-block">Rincian Rencana Kegiatan per Triwulan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* TRIWULAN I */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-blue-500 p-6 flex flex-col transition hover:shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-slate-800">Triwulan I</h4>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <label className="text-xs font-bold text-slate-500">Target:</label>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue="25" className="w-12 bg-transparent text-right font-bold text-slate-800 outline-none" />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Rencana Kegiatan</label>
                <textarea 
                  rows={4} 
                  className="w-full flex-1 border border-slate-300 rounded-md p-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 custom-scrollbar leading-relaxed"
                  defaultValue="1. Penyusunan instrumen survei IKM&#10;2. Koordinasi dengan tim teknis terkait jadwal pelaksanaan survei&#10;3. Uji coba instrumen survei pada sampel terbatas"
                ></textarea>
              </div>
            </div>

            {/* TRIWULAN II */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-sky-400 p-6 flex flex-col transition hover:shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-slate-800">Triwulan II</h4>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <label className="text-xs font-bold text-slate-500">Target:</label>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue="50" className="w-12 bg-transparent text-right font-bold text-slate-800 outline-none" />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Rencana Kegiatan</label>
                <textarea 
                  rows={4} 
                  className="w-full flex-1 border border-slate-300 rounded-md p-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 custom-scrollbar leading-relaxed"
                  defaultValue="1. Pelaksanaan survei IKM tahap I&#10;2. Pengumpulan dan verifikasi data responden&#10;3. Analisis awal hasil survei tahap I"
                ></textarea>
              </div>
            </div>

            {/* TRIWULAN III */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-purple-500 p-6 flex flex-col transition hover:shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-slate-800">Triwulan III</h4>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <label className="text-xs font-bold text-slate-500">Target:</label>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue="75" className="w-12 bg-transparent text-right font-bold text-slate-800 outline-none" />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Rencana Kegiatan</label>
                <textarea 
                  rows={4} 
                  className="w-full flex-1 border border-slate-300 rounded-md p-3 text-sm text-slate-700 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 custom-scrollbar leading-relaxed"
                  placeholder="Masukkan rincian kegiatan (Misal: Evaluasi hasil survei IKM, Penyusunan laporan antara...)"
                ></textarea>
              </div>
            </div>

            {/* TRIWULAN IV */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-500 p-6 flex flex-col transition hover:shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-slate-800">Triwulan IV</h4>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <label className="text-xs font-bold text-slate-500">Target:</label>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue="100" className="w-12 bg-transparent text-right font-bold text-slate-800 outline-none" />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Rencana Kegiatan</label>
                <textarea 
                  rows={4} 
                  className="w-full flex-1 border border-slate-300 rounded-md p-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 custom-scrollbar leading-relaxed"
                  placeholder="Masukkan rincian kegiatan (Misal: Penyusunan laporan akhir, Tindak lanjut rekomendasi perbaikan...)"
                ></textarea>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <Link href="/perjanjian-kinerja" className="px-6 py-2.5 rounded-md text-sm font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-2">
             <span className="material-symbols-outlined text-[18px]">arrow_back</span> Kembali
          </Link>
          <button className="px-6 py-2.5 rounded-md text-sm font-bold text-white bg-[#0f172a] hover:bg-slate-800 flex items-center gap-2 transition shadow-sm">
            <span className="material-symbols-outlined text-[18px]">save</span> Simpan Rencana Aksi
          </button>
        </div>

      </div>
    </div>
  );
}