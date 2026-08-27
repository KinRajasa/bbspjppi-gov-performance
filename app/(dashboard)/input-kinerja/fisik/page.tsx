'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InputKinerjaPage() {
  // 1. DATA DUMMY: Konsisten dengan Master Data & Rencana Aksi
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

  // 2. STATE LOGIC UTAMA
  const [selectedIndikatorId, setSelectedIndikatorId] = useState('1.1');
  const [selectedPeriode, setSelectedPeriode] = useState('mar');
  const [realisasiFisik, setRealisasiFisik] = useState<number | string>(25);

  // 3. AUTO-FILL LOGIC: Mencari detail PIC dan Target
  const selectedIndikator = sasarans.flatMap(s => s.indikators).find(ind => ind.id === selectedIndikatorId) || null;

  // 4. HELPER: Menentukan nama Triwulan & Target Fisik berdasarkan Bulan
  const getTriwulanInfo = (bulan: string) => {
    if (['jan', 'feb', 'mar'].includes(bulan)) return { nama: 'Triwulan I', target: 25 };
    if (['apr', 'mei', 'jun'].includes(bulan)) return { nama: 'Triwulan II', target: 50 };
    if (['jul', 'ags', 'sep'].includes(bulan)) return { nama: 'Triwulan III', target: 75 };
    if (['okt', 'nov', 'des'].includes(bulan)) return { nama: 'Triwulan IV', target: 100 };
    return { nama: 'Triwulan I', target: 25 };
  };

  const triwulanAktif = getTriwulanInfo(selectedPeriode);
  const targetFisik = triwulanAktif.target;
  const isTargetTerpenuhi = Number(realisasiFisik) >= targetFisik;

  return (
    <div className="animation-fade-in w-full pb-10">
      
      {/* HEADER */}
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Input Capaian & Realisasi Aksi</h2>
        <p className="text-sm text-slate-500 mt-1">
          Laporkan realisasi, evaluasi, kendala, dan tindak lanjut periode berjalan.
        </p>
      </header>

      <div className="space-y-6">
        
        {/* ========================================================= */}
        {/* TAHAP 1: KUALITATIF                                       */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <span className="material-symbols-outlined text-blue-500 text-[22px]">description</span>
            <h3 className="font-bold text-slate-700 text-lg">Tahap 1: Laporan Pelaksanaan & Evaluasi (Kualitatif)</h3>
          </div>

          {/* Baris 1: Filter/Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* DROPDOWN DINAMIS (OPTGROUP) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Pilih Indikator Kinerja</label>
              <select 
                value={selectedIndikatorId}
                onChange={(e) => setSelectedIndikatorId(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm text-slate-700 outline-none bg-white cursor-pointer focus:border-blue-500"
              >
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
            
            {/* PIC AUTO-FILL */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Penanggung Jawab</label>
              <input 
                type="text" 
                disabled 
                value={selectedIndikator ? selectedIndikator.pic : ''} 
                className="w-full bg-slate-50 border border-slate-200 text-slate-500 font-medium text-sm rounded-md px-3 py-2.5 outline-none cursor-not-allowed"
              />
            </div>
            
            {/* PERIODE PELAPORAN */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Periode Pelaporan</label>
              <select 
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
              >
                <option value="" disabled>-- Pilih Bulan --</option>
                <option value="jan">Januari</option>
                <option value="feb">Februari</option>
                <option value="mar" className="font-bold text-blue-600">Maret (Akhir Triwulan I)</option>
                <option value="apr">April</option>
                <option value="mei">Mei</option>
                <option value="jun" className="font-bold text-blue-600">Juni (Akhir Triwulan II)</option>
                <option value="jul">Juli</option>
                <option value="ags">Agustus</option>
                <option value="sep" className="font-bold text-blue-600">September (Akhir Triwulan III)</option>
                <option value="okt">Oktober</option>
                <option value="nov">November</option>
                <option value="des" className="font-bold text-blue-600">Desember (Akhir Triwulan IV)</option>
              </select>
            </div>
          </div>

          {/* Baris 2: Rencana vs Realisasi Kegiatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Rencana Kegiatan {triwulanAktif.nama}
              </label>
              <textarea 
                rows={6}
                disabled
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-4 text-sm text-slate-600 outline-none cursor-not-allowed custom-scrollbar resize-none leading-relaxed"
                value="1. Penanganan dan pemantauan komplain pelanggan TW I.&#10;2. Penyebaran kuesioner kepuasan pelanggan TW I.&#10;3. Evaluasi dan penghitungan statistisi penilaian IKM TW I."
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
                Realisasi Kegiatan (Bulan Berjalan) <span className="text-rose-500">*</span>
              </label>
              <textarea 
                rows={6}
                className="w-full bg-white border border-slate-300 rounded-md p-4 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 custom-scrollbar resize-none leading-relaxed"
                defaultValue="1. Penyebaran kuesioner kepada 118 pelanggan and kembali kepada BBSPJPPI sejumlah 22 responden.&#10;Hasil analisa IKM bulan Januari berpedoman pada PermenPANRB NO 14/2017 adalah sebesar 3.72."
              />
            </div>
          </div>

          {/* Kotak Abu-abu: Analisis & Tindak Lanjut */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <h4 className="font-bold text-slate-700 mb-4 text-sm md:text-base">Analisis & Tindak Lanjut Lapangan</h4>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Evaluasi Pelaksanaan Kegiatan</label>
                <textarea 
                  rows={2}
                  className="w-full bg-white border border-slate-300 rounded-md p-3 text-sm text-slate-700 outline-none focus:border-blue-500 transition resize-none"
                  defaultValue="Masih terdapat pelanggan yang belum mengisi kuesioner secara proaktif."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Kendala yang Dihadapi</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-white border border-slate-300 border-l-4 border-l-rose-500 rounded-md p-3 text-sm text-slate-700 outline-none focus:border-rose-400 transition resize-none"
                    defaultValue="Tingkat respons (response rate) pengisian survei mandiri masih rendah."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Tindak Lanjut / Perbaikan</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-white border border-slate-300 border-l-4 border-l-blue-500 rounded-md p-3 text-sm text-slate-700 outline-none focus:border-blue-400 transition resize-none"
                    defaultValue="Memberikan notifikasi pengingat via WhatsApp kepada pelanggan setelah dokumen LHU diserahkan."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAHAP 2: KUANTITATIF                                      */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
            <span className="material-symbols-outlined text-blue-500 text-[22px]">analytics</span>
            <h3 className="font-bold text-slate-700 text-lg">Tahap 2: Capaian % Fisik (Kuantitatif)</h3>
          </div>
          
          <p className="text-sm text-slate-500 mb-6">Laporkan persentase realisasi fisik dibandingkan dengan target triwulan berjalan.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* BOX KIRI: Target (Otomatis menyesuaikan bulan yang dipilih) */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                Target Fisik ({triwulanAktif.nama})
              </span>
              <div className="text-4xl font-black text-slate-800">{targetFisik}%</div>
            </div>

            {/* BOX KANAN: Realisasi Input */}
            <div className="flex flex-col">
               <span className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider text-center md:text-left">
                 Realisasi % Fisik
               </span>
               <div className="flex-1 border border-slate-300 rounded-xl overflow-hidden flex items-stretch bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition shadow-sm">
                  <input 
                    type="number"
                    value={realisasiFisik}
                    onChange={(e) => setRealisasiFisik(e.target.value)}
                    className="flex-1 text-center text-4xl font-black text-slate-800 outline-none p-4 w-full"
                  />
                  <div className="bg-slate-50 border-l border-slate-200 px-6 flex items-center justify-center text-2xl font-bold text-slate-500">
                    %
                  </div>
               </div>
            </div>
          </div>

          {/* INTERAKTIF: Alert Status Otomatis */}
          <div className={`p-4 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-colors duration-300 ${
            isTargetTerpenuhi ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {isTargetTerpenuhi ? 'check_circle' : 'warning'}
            </span>
            {isTargetTerpenuhi ? 'Status: Target Fisik Terpenuhi' : 'Status: Target Fisik Belum Terpenuhi'}
          </div>

        </div>

        {/* BOTTOM ACTIONS */}
        <div className="flex justify-end gap-4 pt-4">
          <Link href="/validasi-data" className="px-6 py-2.5 rounded-md text-sm font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 transition shadow-sm flex items-center justify-center">
            Batal
          </Link>
          <button className="px-8 py-2.5 rounded-md text-sm font-bold text-white bg-[#0f172a] hover:bg-slate-800 flex items-center gap-2 transition shadow-sm">
            <span className="material-symbols-outlined text-[18px]">save</span> Simpan Laporan
          </button>
        </div>

      </div>
    </div>
  );
}