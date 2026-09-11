'use client'; 

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardUtama() {
  const [activeTab, setActiveTab] = useState<'perjakin' | 'rencana_aksi'>('perjakin');
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Tahun yang datanya beneran tersedia -- 2025 sekarang terisi data asli dari
  // LAKIP TA 2025 (Nota Dinas No. 25/BBSPJPPI/PR/I/2026). 2024 ke bawah belum
  // ada dokumen sumbernya, jadi tetap empty state.
  const tahunTersedia = ['2026', '2025'];
  // Tahun yang punya data Rencana Aksi TRIWULANAN. LAKIP itu laporan akhir
  // tahun, bukan progres per-triwulan, jadi Tab 2 cuma valid untuk 2026.
  const tahunRencanaAksiTersedia = ['2026'];
  const semuaOpsiTahun = ['2026', '2025', '2024'];
  const [selectedTahun, setSelectedTahun] = useState('2026');
  const dataTahunIniTersedia = tahunTersedia.includes(selectedTahun);
  const rencanaAksiTahunIniTersedia = tahunRencanaAksiTersedia.includes(selectedTahun);

  type IndikatorIKU = { id: number; name: string; score: string; color: string; width: string; kategori: 'utama' | 'pendukung' };

  // Kategori "utama" vs "pendukung" -- pembagian ini baru dikonfirmasi untuk
  // 2 indikator (IKM & Jumlah Perusahaan Pengguna) oleh mentor. Sisanya
  // diasumsikan "pendukung" (indikator administratif/tata kelola yang wajib
  // ada di semua instansi, bukan spesifik tusi BBSPJPPI). WAJIB dikonfirmasi
  // ulang ke mentor apakah ada indikator lain yang sebenarnya juga "utama".
  // Kategori ini sama untuk semua tahun karena sifatnya "jenis indikator",
  // bukan sesuatu yang berubah tiap tahun.
  const dataIKUPerTahun: Record<string, IndikatorIKU[]> = {
    '2026': [
      { id: 1, name: "1. IKM", score: "100.3%", color: "bg-emerald-500", width: "100%", kategori: "utama" },
      { id: 2, name: "2. Jml. Perusahaan Pengguna", score: "30.1%", color: "bg-rose-500", width: "30.1%", kategori: "utama" },
      { id: 3, name: "3. SLA Pelayanan", score: "99.6%", color: "bg-emerald-500", width: "99.6%", kategori: "pendukung" },
      { id: 4, name: "4. NPS", score: "73.0%", color: "bg-emerald-500", width: "73%", kategori: "pendukung" },
      { id: 5, name: "5. Indeks PNBP", score: "85.0%", color: "bg-rose-500", width: "85%", kategori: "pendukung" },
      { id: 6, name: "6. Jml. Hasil Layanan", score: "105.0%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 7, name: "7. ROA", score: "90.0%", color: "bg-emerald-500", width: "90%", kategori: "pendukung" },
      { id: 8, name: "8. POBO", score: "92.5%", color: "bg-emerald-500", width: "92.5%", kategori: "pendukung" },
      { id: 9, name: "9. IPASN", score: "100%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 10, name: "10. Penerapan SPBE", score: "98.0%", color: "bg-emerald-500", width: "98%", kategori: "pendukung" },
      { id: 11, name: "11. IPP", score: "60.0%", color: "bg-rose-500", width: "60%", kategori: "pendukung" },
      { id: 12, name: "12. Integrasi Data BSKJI", score: "110%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 13, name: "13. Tindak Lanjut Pengawasan", score: "100%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 14, name: "14. Nilai Kearsipan", score: "88.0%", color: "bg-rose-500", width: "88%", kategori: "pendukung" },
      { id: 15, name: "15. SAKIP", score: "95.0%", color: "bg-emerald-500", width: "95%", kategori: "pendukung" },
      { id: 16, name: "16. IKPA", score: "100%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 17, name: "17. Laporan Keuangan", score: "92.0%", color: "bg-emerald-500", width: "92%", kategori: "pendukung" },
      { id: 18, name: "18. Penggunaan PDN", score: "100%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
    ],
    // Sumber: LAKIP BBSPJPPI TA 2025 (Nota Dinas No. 25/BBSPJPPI/PR/I/2026, lampiran
    // "Pengukuran Kinerja"). Capaian dihitung dari kolom "Capaian" di dokumen;
    // status Tercapai/Tidak Tercapai memakai ambang >=100%. Sesuai isi Nota Dinas,
    // hanya IKPA yang tidak tercapai (97,34% dari target 93,40).
    '2025': [
      { id: 1, name: "1. IKM", score: "100.5%", color: "bg-emerald-500", width: "100%", kategori: "utama" },
      { id: 2, name: "2. Jml. Perusahaan Pengguna", score: "110.7%", color: "bg-emerald-500", width: "100%", kategori: "utama" },
      { id: 3, name: "3. SLA Pelayanan", score: "107.1%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 4, name: "4. NPS", score: "157.5%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 5, name: "5. Indeks PNBP", score: "100.0%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 6, name: "6. Jml. Hasil Layanan", score: "114.3%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 7, name: "7. ROA", score: "109.7%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 8, name: "8. POBO", score: "104.2%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 9, name: "9. IPASN", score: "102.6%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 10, name: "10. Penerapan SPBE", score: "115.3%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 11, name: "11. IPP", score: "107.1%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 12, name: "12. Integrasi Data BSKJI", score: "100.0%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 13, name: "13. Tindak Lanjut Pengawasan", score: "166.7%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 14, name: "14. Nilai Kearsipan", score: "123.3%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 15, name: "15. SAKIP", score: "105.2%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 16, name: "16. IKPA", score: "97.3%", color: "bg-rose-500", width: "97.3%", kategori: "pendukung" },
      { id: 17, name: "17. Laporan Keuangan", score: "126.3%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
      { id: 18, name: "18. Penggunaan PDN", score: "110.9%", color: "bg-emerald-500", width: "100%", kategori: "pendukung" },
    ],
  };

  const dataIKU: IndikatorIKU[] = dataIKUPerTahun[selectedTahun] ?? [];

  // Ringkasan anggaran per tahun -- 2025 diambil dari Tabel "Pagu DIPA" & butir 2
  // Nota Dinas LAKIP TA 2025.
  const anggaranPerTahun: Record<string, { paguAwal: string; paguRevisi: string; blokir: string; paguEfektif: string; targetKeuangan: string; realisasiKeuanganPersen: string; targetPNBP: string; realisasiPNBP: string; realisasiPNBPPersen: string }> = {
    '2026': {
      paguAwal: '41.767.656.000',
      paguRevisi: '44.740.652.000',
      blokir: '4.334.126.000',
      paguEfektif: '40.406.526.000',
      targetKeuangan: '47,43',
      realisasiKeuanganPersen: '49,15',
      targetPNBP: '21.351.876.000',
      realisasiPNBP: '8.376.976.815',
      realisasiPNBPPersen: '39,23',
    },
    '2025': {
      paguAwal: '36.159.131.000',
      paguRevisi: '40.465.963.000',
      blokir: '4.942.674.000',
      paguEfektif: '35.523.289.000',
      targetKeuangan: '99,81',
      realisasiKeuanganPersen: '99,01',
      targetPNBP: '18.686.000.000',
      realisasiPNBP: '20.483.355.953',
      realisasiPNBPPersen: '109,62',
    },
  };
  const anggaranTahunIni = anggaranPerTahun[selectedTahun] ?? anggaranPerTahun['2026'];

  // Data 18 Rencana Aksi (Khusus Tab Rencana Aksi)
  const dataRencanaAksi = [
    { id: 1, name: "1. IKM*", target: "50.0%", real: "50.0%", color: "bg-emerald-500", width: "50%" },
    { id: 2, name: "2. Jml. Perusahaan Pengguna*", target: "50.0%", real: "45.0%", color: "bg-rose-500", width: "45%" },
    { id: 3, name: "3. SLA Pelayanan", target: "50.0%", real: "51.0%", color: "bg-emerald-500", width: "51%" },
    { id: 4, name: "4. NPS", target: "50.0%", real: "52.0%", color: "bg-emerald-500", width: "52%" },
    { id: 5, name: "5. Indeks PNBP", target: "50.0%", real: "48.0%", color: "bg-rose-500", width: "48%" },
    { id: 6, name: "6. Jml. Hasil Layanan", target: "50.0%", real: "55.0%", color: "bg-emerald-500", width: "55%" },
    { id: 7, name: "7. ROA", target: "50.0%", real: "53.0%", color: "bg-emerald-500", width: "53%" },
    { id: 8, name: "8. POBO", target: "50.0%", real: "50.5%", color: "bg-emerald-500", width: "50.5%" },
    { id: 9, name: "9. IPASN", target: "50.0%", real: "54.0%", color: "bg-emerald-500", width: "54%" },
    { id: 10, name: "10. Penerapan SPBE", target: "50.0%", real: "51.5%", color: "bg-emerald-500", width: "51.5%" },
    { id: 11, name: "11. IPP", target: "50.0%", real: "42.0%", color: "bg-rose-500", width: "42%" },
    { id: 12, name: "12. Integrasi Data BSKJI", target: "50.0%", real: "56.0%", color: "bg-emerald-500", width: "56%" },
    { id: 13, name: "13. Tindak Lanjut Pengawasan", target: "50.0%", real: "50.0%", color: "bg-emerald-500", width: "50%" },
    { id: 14, name: "14. Nilai Kearsipan", target: "50.0%", real: "58.0%", color: "bg-emerald-500", width: "58%" },
    { id: 15, name: "15. SAKIP", target: "50.0%", real: "50.0%", color: "bg-emerald-500", width: "50%" },
    { id: 16, name: "16. IKPA", target: "50.0%", real: "59.0%", color: "bg-emerald-500", width: "59%" },
    { id: 17, name: "17. Laporan Keuangan", target: "50.0%", real: "50.0%", color: "bg-emerald-500", width: "50%" },
    { id: 18, name: "18. Penggunaan PDN", target: "50.0%", real: "50.0%", color: "bg-emerald-500", width: "50%" },
  ];

  // Data Detail IKU untuk Modal Popup
  const detailDataIKU = [
    { id: 1, name: "Indeks Kepuasan Masyarakat (IKM)*", pic: "Tim Kerja Pelayanan", target: "3.75 Indeks", real: "3.80 Indeks", cap: "100.3%", status: "MEMENUHI TARGET" },
    { id: 2, name: "Jumlah Perusahaan*", pic: "Tim Kerja Pengembangan Jasa Industri", target: "990 Perusahaan", real: "298 Perusahaan", cap: "30.1%", status: "TIDAK MEMENUHI" },
    { id: 3, name: "SLA Layanan", pic: "Tim Kerja Pengembangan Jasa Industri", target: "90 Persen", real: "99.6 Persen", cap: "110.6%", status: "MEMENUHI TARGET" },
    { id: 4, name: "NPS", pic: "Tim Kerja Pengembangan Jasa Industri", target: "41.00", real: "73.00", cap: "178.0%", status: "MEMENUHI TARGET" },
    { id: 5, name: "Peningkatan PNBP", pic: "Kapokja Keuangan dan BMN", target: "Rp 21,3 Miliar", real: "Rp 15,2 Miliar", cap: "71.3%", status: "TIDAK MEMENUHI" },
    { id: 6, name: "Jumlah Hasil Layanan Jasa Industri", pic: "Tim Kerja Pengembangan Jasa Industri", target: "8.100 Hasil", real: "8.400 Hasil", cap: "103.7%", status: "MEMENUHI TARGET" },
    { id: 7, name: "ROA", pic: "Kapokja Keuangan dan BMN", target: "15 Persen", real: "16.5 Persen", cap: "110.0%", status: "MEMENUHI TARGET" },
    { id: 8, name: "POBO", pic: "Kapokja Keuangan dan BMN", target: "60 Persen", real: "55.5 Persen", cap: "92.5%", status: "MEMENUHI TARGET" },
    { id: 9, name: "IPASN", pic: "Tim Kerja SDM", target: "80.00", real: "82.50", cap: "103.1%", status: "MEMENUHI TARGET" },
    { id: 10, name: "SPBE", pic: "Tim Kerja IT", target: "3.50 Indeks", real: "3.85 Indeks", cap: "110.0%", status: "MEMENUHI TARGET" },
    { id: 11, name: "IPP", pic: "Tim Kerja Pelayanan", target: "4.64 Indeks", real: "4.64 Indeks", cap: "100.0%", status: "MEMENUHI TARGET" },
    { id: 12, name: "Integrasi Data BSKJI", pic: "Tim Kerja IT", target: "40 Persen", real: "24 Persen", cap: "60.0%", status: "TIDAK MEMENUHI" },
    { id: 13, name: "Tindak Lanjut Pengawasan", pic: "Tim Kerja Kepatuhan", target: "100 Persen", real: "88.0 Persen", cap: "88.0%", status: "TIDAK MEMENUHI" },
    { id: 14, name: "Nilai Kearsipan", pic: "Tim Kerja Umum", target: "73.00", real: "69.35", cap: "95.0%", status: "MEMENUHI TARGET" },
    { id: 15, name: "SAKIP", pic: "Tim Kerja Program", target: "79.45", real: "79.45", cap: "100.0%", status: "MEMENUHI TARGET" },
    { id: 16, name: "IKPA", pic: "Kapokja Keuangan dan BMN", target: "93.40", real: "85.92", cap: "92.0%", status: "MEMENUHI TARGET" },
    { id: 17, name: "Laporan Keuangan", pic: "Kapokja Keuangan dan BMN", target: "75.25", real: "75.25", cap: "100.0%", status: "MEMENUHI TARGET" },
    { id: 18, name: "Persentase Penggunaan Produk dalam Negeri", pic: "Tim Kerja Pengadaan", target: "81 Persen", real: "79.3 Persen", cap: "98.0%", status: "MEMENUHI TARGET" },
  ];

  // Data Setup untuk Recharts
  const [filterKategori, setFilterKategori] = useState<'semua' | 'utama' | 'pendukung'>('semua');

  const jumlahUtama = dataIKU.filter((i) => i.kategori === 'utama').length;
  const jumlahPendukung = dataIKU.filter((i) => i.kategori === 'pendukung').length;

  const dataIKUTerfilter = dataIKU.filter((iku) =>
    filterKategori === 'semua' ? true : iku.kategori === filterKategori
  );

  const jumlahTercapaiTerfilter = dataIKUTerfilter.filter((i) => i.color === 'bg-emerald-500').length;
  const jumlahTidakTercapaiTerfilter = dataIKUTerfilter.filter((i) => i.color === 'bg-rose-500').length;
  const persenTercapaiTerfilter = dataIKUTerfilter.length > 0
    ? ((jumlahTercapaiTerfilter / dataIKUTerfilter.length) * 100).toFixed(1)
    : '0.0';

  const dataStatusKinerja = [
    { name: 'Tercapai', value: jumlahTercapaiTerfilter, color: '#10b981' },
    { name: 'Tidak Tercapai', value: jumlahTidakTercapaiTerfilter, color: '#f43f5e' }
  ];

  // Indikator yang bermasalah ditaruh paling atas, sisanya menyusul di bawah
  // agar saat scroll pun mata langsung tertuju ke hal yang perlu ditindaklanjuti.
  const sortedDataIKU = [...dataIKUTerfilter].sort((a, b) => {
    const aBermasalah = a.color === 'bg-rose-500' ? 0 : 1;
    const bBermasalah = b.color === 'bg-rose-500' ? 0 : 1;
    return aBermasalah - bBermasalah;
  });

  // Daftar ringkas indikator yang tidak memenuhi target, dipakai di panel
  // "Perlu Perhatian" supaya nama indikatornya langsung terlihat tanpa harus klik apa pun.
  const indikatorPerluPerhatian = dataIKUTerfilter.filter((iku) => iku.color === 'bg-rose-500');

  const dataDeviasiStatus = [
    { name: 'On Track', value: 15, color: '#10b981' },
    { name: 'Delayed', value: 3, color: '#f43f5e' }
  ];

  return (
    <>
      <header className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Eksekutif</h2>
          <p className="text-sm text-slate-500 mt-1">Pemantauan Kinerja & Rencana Aksi BBSPJPPI TA. 2026</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">AD</div>
            <span className="text-sm font-medium text-slate-700 pr-1">Admin</span>
          </div>
        </div>
      </header>

      <div className="space-y-8 relative">
        
        {/* TOGGLE & FILTER */}
        <div className="flex justify-between items-center">
          <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-max">
            <button 
              onClick={() => setActiveTab('perjakin')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'perjakin' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Capaian Perjakin (IK)
            </button>
            <button 
              onClick={() => setActiveTab('rencana_aksi')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'rencana_aksi' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Progres Fisik Rencana Aksi
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-500">Tahun:</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-4 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {semuaOpsiTahun.map((tahun) => (
                <option key={tahun} value={tahun}>{tahun}</option>
              ))}
            </select>

            <label className="text-sm text-slate-500 ml-2">Periode:</label>
            <select
              disabled={!dataTahunIniTersedia || !rencanaAksiTahunIniTersedia}
              className="bg-white border border-slate-300 rounded-md px-4 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {rencanaAksiTahunIniTersedia ? (
                <>
                  <option>Triwulan II (Apr-Jun)</option>
                  <option>Triwulan I (Jan-Mar)</option>
                </>
              ) : (
                <option>Akhir Tahun (LAKIP)</option>
              )}
            </select>
          </div>
        </div>

        {/* Info kecil: tahun ini cuma punya laporan akhir tahun (LAKIP), bukan progres triwulanan */}
        {dataTahunIniTersedia && !rencanaAksiTahunIniTersedia && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 -mt-4">
            <span className="material-symbols-outlined text-[16px]">info</span>
            Data TA {selectedTahun} bersumber dari LAKIP (laporan akhir tahun), bukan laporan per-triwulan. Tab &quot;Progres Fisik Rencana Aksi&quot; tidak tersedia untuk tahun ini.
          </div>
        )}

        {/* EMPTY STATE: tahun dipilih belum punya data kinerja */}
        {!dataTahunIniTersedia && (
          <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-400 text-[32px]">calendar_month</span>
            </div>
            <h3 className="font-bold text-slate-700 text-lg mb-1">Belum Ada Data Kinerja Tahun {selectedTahun}</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Sistem baru mencatat data kinerja mulai Tahun Anggaran 2026. Silakan pilih tahun 2026 atau tunggu periode pelaporan tahun berikutnya.
            </p>
          </div>
        )}

        {dataTahunIniTersedia && (
        <>
        {/* ================================================= */}
        {/* KONTEN TAB                                        */}
        {/* ================================================= */}
        {activeTab === 'perjakin' ? (
          
          /* --- TAB 1: PERJAKIN --- */
          <div className="animation-fade-in space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center w-full mb-3">
                  <span className="text-sm font-medium text-slate-500">Pagu Awal</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><span className="material-symbols-outlined text-[18px]">history</span></div>
                </div>
                <span className="text-xl font-bold text-slate-800">Rp {anggaranTahunIni.paguAwal}</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center w-full mb-3">
                  <span className="text-sm font-medium text-slate-500">Pagu Revisi Terakhir</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><span className="material-symbols-outlined text-[18px]">account_balance</span></div>
                </div>
                <span className="text-xl font-bold text-slate-800">Rp {anggaranTahunIni.paguRevisi}</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center w-full mb-3">
                  <span className="text-sm font-medium text-slate-500">Anggaran Blokir</span>
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500"><span className="material-symbols-outlined text-[18px]">lock</span></div>
                </div>
                <span className="text-xl font-bold text-slate-800">Rp {anggaranTahunIni.blokir}</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center w-full mb-3">
                  <span className="text-sm font-medium text-slate-500">Pagu Efektif</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"><span className="material-symbols-outlined text-[18px]">payments</span></div>
                </div>
                <span className="text-xl font-bold text-slate-800">Rp {anggaranTahunIni.paguEfektif}</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              
              <div className="col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Status Capaian Indikator Kinerja
                      <span className="ml-2 text-sm font-normal text-slate-400">({dataIKUTerfilter.length} indikator)</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={filterKategori}
                      onChange={(e) => setFilterKategori(e.target.value as 'semua' | 'utama' | 'pendukung')}
                      className="border border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="semua">Semua Indikator ({dataIKU.length})</option>
                      <option value="utama">IKU Utama ({jumlahUtama})</option>
                      <option value="pendukung">Indikator Pendukung ({jumlahPendukung})</option>
                    </select>
                    <button
                      onClick={() => setShowDetailModal(true)}
                      disabled={selectedTahun !== '2026'}
                      title={selectedTahun !== '2026' ? 'Rincian per-PIC untuk tahun ini belum tersedia' : undefined}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap disabled:text-slate-300 disabled:no-underline disabled:cursor-not-allowed"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto pr-4 space-y-1 custom-scrollbar">
                  {sortedDataIKU.map((iku) => {
                    const bermasalah = iku.color === 'bg-rose-500';
                    return (
                      <div
                        key={iku.id}
                        className={`flex items-center justify-between text-sm py-2 px-2 rounded-lg ${
                          bermasalah ? 'bg-rose-50/60 border-l-4 border-rose-400' : 'border-l-4 border-transparent'
                        }`}
                      >
                        <div className={`w-5/12 text-right pr-4 truncate ${bermasalah ? 'text-rose-700 font-semibold' : 'text-slate-700'}`}>
                          {iku.name}
                        </div>
                        <div className="w-6/12 bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div className={`${iku.color} h-3 rounded-full`} style={{ width: iku.width }}></div>
                        </div>
                        <div className={`w-1/12 text-right font-medium ${bermasalah ? 'text-rose-700' : 'text-slate-700'}`}>
                          {iku.score}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <h3 className="font-bold text-slate-800 w-full border-b border-slate-100 pb-4 text-left">Proporsi Status Kinerja</h3>
                
                {/* Recharts Donut Chart — angka utama diganti jadi PERSENTASE, bukan total,
                    karena satu angka capaian keseluruhan itu yang paling cepat dicerna. */}
                <div className="relative w-full h-48 mt-4">
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                    <span className="text-3xl font-black text-emerald-600">{persenTercapaiTerfilter}%</span>
                    <span className="text-[11px] text-slate-500 mt-1">Tercapai ({jumlahTercapaiTerfilter}/{dataIKUTerfilter.length} indikator)</span>
                  </div>
                  <div className="relative z-10 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataStatusKinerja}
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                          animationDuration={1000}
                        >
                          {dataStatusKinerja.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} Indikator`]}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          wrapperStyle={{ zIndex: 100 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="w-full mt-4 flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-medium text-slate-600">Tercapai <span className="font-bold text-slate-800">{jumlahTercapaiTerfilter}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <span className="text-xs font-medium text-slate-600">Tidak Tercapai <span className="font-bold text-slate-800">{jumlahTidakTercapaiTerfilter}</span></span>
                  </div>
                </div>

                {/* PANEL PERLU PERHATIAN — ini kuncinya: pimpinan langsung tahu APA yang
                    bermasalah tanpa perlu klik "Lihat Detail" atau scroll list 18 indikator. */}
                <div className="w-full mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-rose-500 text-[18px]">warning</span>
                    <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider">Perlu Perhatian Segera</h4>
                  </div>
                  <div className="space-y-2">
                    {indikatorPerluPerhatian.length > 0 ? (
                      indikatorPerluPerhatian.map((iku) => (
                        <div key={iku.id} className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
                          <span className="text-xs font-semibold text-rose-800 pr-2">{iku.name}</span>
                          <span className="text-xs font-bold text-rose-600 whitespace-nowrap">{iku.score}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">Semua indikator pada kategori ini sudah memenuhi target.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

        ) : rencanaAksiTahunIniTersedia ? (
          
          /* --- TAB 2: RENCANA AKSI --- */
          <div className="animation-fade-in">
             <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <span className="text-sm font-medium text-slate-500">Rata-Rata Fisik TW II</span>
                <span className="text-3xl font-bold text-slate-800 mt-2">51.4%</span>
                <span className="text-xs text-slate-400 mt-2">Target kumulatif: 50.0%</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <span className="text-sm font-medium text-slate-500">Sesuai Jadwal (On Track)</span>
                <span className="text-3xl font-bold text-emerald-600 mt-2">15 Kegiatan</span>
                <span className="text-xs text-slate-400 mt-2">Realisasi &ge; Target TW II</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <span className="text-sm font-medium text-slate-500">Terdilay (Delayed)</span>
                <span className="text-3xl font-bold text-rose-600 mt-2">3 Kegiatan</span>
                <span className="text-xs text-slate-400 mt-2">Realisasi &lt; Target TW II</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">Pemantauan Progres Fisik per Indikator (TW II)</h3>
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  
                  {dataRencanaAksi.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border transition ${
                        item.color === 'bg-rose-500' ? 'hover:bg-rose-50 border-rose-100' : 'hover:bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="w-2/5 text-sm font-semibold text-slate-700 truncate pr-4">{item.name}</div>
                      <div className="w-3/5 flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Target: {item.target}</span>
                          <span className={`font-bold ${item.color === 'bg-rose-500' ? 'text-rose-600' : 'text-emerald-600'}`}>Real: {item.real}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full">
                          <div className={`${item.color} h-2.5 rounded-full`} style={{ width: item.width }}></div>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>

              <div className="col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-slate-800 w-full border-b border-slate-100 pb-4">Deviasi Status</h3>
                
                {/* Recharts Donut Chart Tab 2 (FIXED) */}
                <div className="relative w-full h-52 mt-6">
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                    <span className="text-4xl font-bold text-slate-800">51.4%</span>
                    <span className="text-xs text-slate-500 mt-1">Rata-Rata Fisik</span>
                  </div>
                  <div className="relative z-10 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataDeviasiStatus}
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                          animationDuration={1000}
                        >
                          {dataDeviasiStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} Kegiatan`]}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          wrapperStyle={{ zIndex: 100 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="w-full mt-8 space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm"></div>
                      <span className="text-sm font-medium text-slate-600">On Track (&ge; 50%)</span>
                    </div>
                    <span className="font-bold text-slate-800">15</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm"></div>
                      <span className="text-sm font-medium text-slate-600">Delayed (&lt; 50%)</span>
                    </div>
                    <span className="font-bold text-slate-800">3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        ) : (

          /* Tahun ini cuma punya LAKIP (akhir tahun), belum ada progres triwulanan */
          <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-400 text-[32px]">timeline</span>
            </div>
            <h3 className="font-bold text-slate-700 text-lg mb-1">Data Rencana Aksi Triwulanan Tidak Tersedia</h3>
            <p className="text-sm text-slate-500 max-w-md">
              TA {selectedTahun} hanya tercatat sebagai laporan akhir tahun (LAKIP). Silakan pilih TA 2026 untuk melihat progres fisik per triwulan.
            </p>
          </div>
        )}
        </>
        )}

      </div>

      {/* ========================================= */}
      {/* MODAL OVERLAY: REKAPITULASI DETAIL IKU    */}
      {/* ========================================= */}
      {showDetailModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-8 animation-fade-in">
          
          <div className="bg-white w-full max-w-7xl rounded-xl shadow-2xl flex flex-col h-[90vh] overflow-hidden border border-slate-200">
            
            <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-start bg-white">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Rekapitulasi 18 Indikator Kinerja</h2>
                <p className="text-sm text-slate-500 mt-1">Periode: S.d Juli 2026 | Menampilkan perbandingan target dan realisasi seluruh divisi.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                  <input type="text" placeholder="Cari Indikator atau PIC..." className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-64 outline-none focus:border-blue-500" />
                </div>
                <select className="border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-600 outline-none focus:border-blue-500 bg-white">
                  <option>Semua Status</option>
                  <option>Memenuhi Target</option>
                  <option>Tidak Memenuhi</option>
                </select>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-slate-700 font-medium">14 Memenuhi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-sm text-slate-700 font-medium">4 Tidak Memenuhi</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-white p-8">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 pr-4 font-bold w-12">No</th>
                    <th className="py-4 pr-4 font-bold w-1/4">Indikator Kinerja</th>
                    <th className="py-4 pr-4 font-bold w-1/5">Penanggung Jawab</th>
                    <th className="py-4 pr-4 font-bold">Target</th>
                    <th className="py-4 pr-4 font-bold">Realisasi</th>
                    <th className="py-4 pr-4 font-bold">Capaian</th>
                    <th className="py-4 font-bold text-right w-48">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailDataIKU.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 pr-4 text-slate-500 font-medium align-top">{item.id}</td>
                      <td className={`py-5 pr-4 font-medium align-top ${item.status === 'TIDAK MEMENUHI' ? 'text-rose-600' : 'text-slate-800'}`}>
                        {item.name}
                      </td>
                      <td className="py-5 pr-4 text-slate-600 align-top">{item.pic}</td>
                      <td className="py-5 pr-4 text-slate-800 font-medium align-top">{item.target}</td>
                      <td className={`py-5 pr-4 font-medium align-top ${item.status === 'TIDAK MEMENUHI' ? 'text-rose-600' : 'text-slate-800'}`}>
                        {item.real}
                      </td>
                      <td className={`py-5 pr-4 font-medium align-top ${item.status === 'TIDAK MEMENUHI' ? 'text-rose-600' : 'text-slate-800'}`}>
                        {item.cap}
                      </td>
                      <td className="py-5 text-right align-top">
                        {item.status === 'MEMENUHI TARGET' ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-100/60 text-emerald-700 px-3 py-1.5 rounded-md text-xs font-bold border border-emerald-200">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span> {item.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-rose-100/60 text-rose-700 px-3 py-1.5 rounded-md text-xs font-bold border border-rose-200">
                            <span className="material-symbols-outlined text-[14px]">warning</span> {item.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

    </>
  );
}