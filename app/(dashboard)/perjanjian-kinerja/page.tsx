'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PerjanjianKinerjaPage() {
  const [timeline, setTimeline] = useState('01 Januari 2026 - 31 Desember 2026');

  const pilihanIndikator = [
    "Indeks Kepuasan Masyarakat (IKM)",
    "Jumlah perusahaan industri yang memanfaatkan layanan",
    "Persentase pelayanan tepat waktu (SLA)",
    "Nilai Net Promoter Score (NPS)",
    "Indeks peningkatan PNBP",
    "Jumlah hasil layanan jasa industri",
    "Nilai Revenue on Asset (RoA)",
    "Rasio Pendapatan Operasional terhadap Biaya Operasional (POBO)",
    "Indeks Profesionalitas ASN (IPASN)",
    "Integrasi Data Sistem Informasi BSKJI",
    "Tingkat Penerapan SPBE",
    "Indeks Pelayanan Publik (IPP)",
    "Tindak Lanjut Pengawasan",
    "Nilai Kearsipan",
    "Nilai SAKIP",
    "Nilai IKPA",
    "Laporan Keuangan",
    "Persentase Penggunaan Produk dalam Negeri (PDN)"
  ];

  // STATE: Struktur bertingkat (Sasaran -> Indikator)
  const [sasarans, setSasarans] = useState([
    {
      id: 1,
      namaSasaran: 'Meningkatnya kualitas dan kuantitas layanan jasa industri',
      indikators: [
        { id: 11, nama: 'Indeks Kepuasan Masyarakat (IKM)', satuan: 'Indeks', target: '3.70', pic: 'Ketua Tim Kerja PJI' },
        { id: 12, nama: 'Jumlah perusahaan industri yang memanfaatkan layanan', satuan: 'Perusahaan', target: '990', pic: 'Ketua Tim Kerja PJI' },
        { id: 13, nama: 'Persentase pelayanan tepat waktu (SLA)', satuan: 'Persen', target: '90.00', pic: 'Ketua Tim Kerja PJI' },
        { id: 14, nama: 'Nilai Net Promoter Score (NPS)', satuan: 'Nilai', target: '41.00', pic: 'Ketua Tim Kerja PJI' }
      ]
    },
    {
      id: 2,
      namaSasaran: 'Terwujudnya layanan tata kelola pemerintahan yang baik',
      indikators: [
        { id: 21, nama: 'Indeks peningkatan PNBP', satuan: 'Indeks', target: '3.00', pic: 'Kapokja Keuangan dan BMN' }
      ]
    }
  ]);

  // ==========================================
  // FUNGSI UNTUK SASARAN KEGIATAN
  // ==========================================
  const tambahSasaran = () => {
    const newSasaran = {
      id: Date.now(),
      namaSasaran: '',
      indikators: [
        { id: Date.now() + 1, nama: '', satuan: '', target: '', pic: '' }
      ]
    };
    setSasarans([...sasarans, newSasaran]);
  };

  const hapusSasaran = (sasaranId: number) => {
    setSasarans(sasarans.filter(s => s.id !== sasaranId));
  };

  const ubahNamaSasaran = (sasaranId: number, newValue: string) => {
    setSasarans(sasarans.map(s => 
      s.id === sasaranId ? { ...s, namaSasaran: newValue } : s
    ));
  };

  // ==========================================
  // FUNGSI UNTUK INDIKATOR KINERJA
  // ==========================================
  const tambahIndikator = (sasaranId: number) => {
    setSasarans(sasarans.map(s => {
      if (s.id === sasaranId) {
        return {
          ...s,
          indikators: [
            ...s.indikators,
            { id: Date.now(), nama: '', satuan: '', target: '', pic: '' }
          ]
        };
      }
      return s;
    }));
  };

  const hapusIndikator = (sasaranId: number, indikatorId: number) => {
    setSasarans(sasarans.map(s => {
      if (s.id === sasaranId) {
        return {
          ...s,
          indikators: s.indikators.filter(ind => ind.id !== indikatorId)
        };
      }
      return s;
    }));
  };

  const ubahIndikator = (sasaranId: number, indikatorId: number, field: string, value: string) => {
    setSasarans(sasarans.map(s => {
      if (s.id === sasaranId) {
        return {
          ...s,
          indikators: s.indikators.map(ind => 
            ind.id === indikatorId ? { ...ind, [field]: value } : ind
          )
        };
      }
      return s;
    }));
  };

  return (
    <div className="animation-fade-in w-full pb-10 flex flex-col min-h-[90vh] print:pb-0">
      
      {/* HEADER UTAMA (Hanya di Layar) */}
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Inisialisasi Perjanjian Kinerja</h2>
          <p className="text-sm text-slate-500 mt-2">
            Kelola dan tetapkan Sasaran Kegiatan beserta Indikator Kinerja tahunan.
          </p>
        </div>
      </header>

      {/* ========================================================= */}
      {/* KOP / HEADER DOKUMEN CETAK (Hanya Muncul di PDF) */}
      {/* ========================================================= */}
      <div className="hidden print:block text-center mb-8 w-full text-black">
        <h1 className="font-bold text-xl uppercase">Perjanjian Kinerja (Master Data)</h1>
        <h2 className="font-bold text-lg uppercase">Tahun Anggaran 2026</h2>
        <h3 className="font-bold text-lg uppercase mt-1">Balai Besar Standardisasi dan Pelayanan Jasa Pencegahan Pencemaran Industri</h3>
        <div className="w-full border-b-4 border-black mt-4 mb-1"></div>
        <div className="w-full border-b border-black mb-6"></div>
      </div>

      <div className="space-y-6 flex-1">
        
        {/* KARTU INFORMASI UMUM */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 print:border-none print:shadow-none print:p-0 print:mb-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4 print:hidden">
            <span className="material-symbols-outlined text-blue-600">info</span>
            <h3 className="font-bold text-slate-800 text-lg">Informasi Umum</h3>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 print:text-black">
              Timeline Pelaksanaan
            </label>
            {/* KOTAK INPUT TIMELINE YANG BISA DIEDIT */}
            <div className="flex items-center gap-3 w-full md:w-1/2 bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition print:border-none print:bg-transparent print:p-0">
              <span className="material-symbols-outlined text-slate-400 print:hidden">calendar_month</span>
              <input 
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="Contoh: 01 Januari 2026 - 31 Desember 2026"
                className="w-full bg-transparent text-slate-700 font-medium outline-none print:text-black print:p-0"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* AREA DAFTAR SASARAN KEGIATAN (KARTU BERTINGKAT) */}
        {/* ========================================================= */}
        <div className="space-y-8 print:space-y-6">
          {sasarans.map((sasaran, indexSasaran) => (
            <div key={sasaran.id} className="bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden print:border-black print:rounded-none print:shadow-none print:border">
              
              {/* Header Kartu Sasaran */}
              <div className="bg-slate-50 p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between print:bg-slate-100 print:border-black print:p-4">
                <div className="flex-1 w-full flex items-center gap-3">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold print:hidden mt-4">
                    {indexSasaran + 1}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1.5 print:text-black">
                      Sasaran Kegiatan {indexSasaran + 1}
                    </label>
                    <input
                      type="text"
                      value={sasaran.namaSasaran}
                      onChange={(e) => ubahNamaSasaran(sasaran.id, e.target.value)}
                      placeholder="Ketik Sasaran Kegiatan di sini..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 font-bold outline-none focus:border-blue-500 transition print:border-none print:bg-transparent print:p-0 print:text-lg"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => hapusSasaran(sasaran.id)}
                  className="print:hidden w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition mt-4"
                  title="Hapus Sasaran"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>

              {/* Tabel Indikator di dalam Sasaran */}
              <div className="overflow-x-auto p-5 print:p-0">
                <table className="w-full text-sm text-left print:border-collapse">
                  <thead className="border-b border-slate-200 print:border-black print:bg-white">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-500 w-12 print:border-black print:border print:text-black">No</th>
                      <th className="px-4 py-3 font-bold text-slate-500 print:border-black print:border print:text-black">Indikator Kinerja</th>
                      <th className="px-4 py-3 font-bold text-slate-500 w-36 print:border-black print:border print:text-black">Satuan</th>
                      <th className="px-4 py-3 font-bold text-slate-500 w-32 print:border-black print:border print:text-black text-right print:text-left">Target</th>
                      <th className="px-4 py-3 font-bold text-slate-500 w-64 print:border-black print:border print:text-black">PIC</th>
                      <th className="px-4 py-3 font-bold text-slate-500 w-16 text-center print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-black">
                    {sasaran.indikators.map((ind, indexInd) => (
                      <tr key={ind.id} className="group">
                        <td className="px-4 py-3 align-top font-medium text-slate-500 pt-5 print:border-black print:border print:text-black print:pt-3">
                          {indexSasaran + 1}.{indexInd + 1}
                        </td>
                        <td className="px-4 py-3 align-top print:border-black print:border">
                          {/* DIUBAH MENJADI DROPDOWN */}
                          <select
                            value={ind.nama}
                            onChange={(e) => ubahIndikator(sasaran.id, ind.id, 'nama', e.target.value)}
                            className="w-full border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded px-3 py-2 outline-none bg-white cursor-pointer transition print:appearance-none print:border-none print:p-0 print:bg-transparent text-slate-700 font-medium"
                          >
                            <option value="" disabled>-- Pilih Indikator --</option>
                            {pilihanIndikator.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 align-top print:border-black print:border">
                          <select 
                            value={ind.satuan}
                            onChange={(e) => ubahIndikator(sasaran.id, ind.id, 'satuan', e.target.value)}
                            className="w-full border border-slate-200 focus:border-blue-500 rounded px-3 py-2 outline-none bg-white cursor-pointer print:appearance-none print:border-none print:p-0 print:bg-transparent"
                          >
                            <option value="">Satuan</option>
                            <option value="Indeks">Indeks</option>
                            <option value="Persen">Persen</option>
                            <option value="Perusahaan">Perusahaan</option>
                            <option value="Nilai">Nilai</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 align-top print:border-black print:border">
                          <input
                            type="number"
                            step="any"
                            value={ind.target}
                            onChange={(e) => ubahIndikator(sasaran.id, ind.id, 'target', e.target.value)}
                            placeholder="0.00"
                            className="w-full border border-slate-200 focus:border-blue-500 rounded px-3 py-2 outline-none bg-white transition text-right print:text-left print:border-none print:p-0 print:bg-transparent"
                          />
                        </td>
                        <td className="px-4 py-3 align-top print:border-black print:border">
                          <select 
                            value={ind.pic}
                            onChange={(e) => ubahIndikator(sasaran.id, ind.id, 'pic', e.target.value)}
                            className="w-full border border-slate-200 focus:border-blue-500 rounded px-3 py-2 outline-none bg-white cursor-pointer print:appearance-none print:border-none print:p-0 print:bg-transparent"
                          >
                            <option value="">Pilih PIC</option>
                            <option value="Ketua Tim Kerja PJI">Ketua Tim Kerja PJI</option>
                            <option value="Kapokja Keuangan dan BMN">Kapokja Keuangan dan BMN</option>
                            <option value="Tim Kerja SDM">Tim Kerja SDM</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 align-top text-center print:hidden">
                          <button 
                            onClick={() => hapusIndikator(sasaran.id, ind.id)}
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded transition mt-0.5"
                            title="Hapus Indikator"
                          >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Tombol Tambah Indikator */}
                <button 
                  onClick={() => tambahIndikator(sasaran.id)}
                  className="print:hidden mt-4 flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition px-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Tambah Indikator Kinerja
                </button>
              </div>

            </div>
          ))}

          {/* TOMBOL TAMBAH SASARAN BARU */}
          <button 
            onClick={tambahSasaran}
            className="print:hidden w-full py-5 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition font-bold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[24px]">add_circle</span>
            Tambah Sasaran Kegiatan Baru
          </button>
        </div>

        {/* ========================================================= */}
        {/* BLOK TANDA TANGAN (Hanya muncul saat ekspor PDF)          */}
        {/* ========================================================= */}
        <div className="hidden print:block mt-12 w-full text-black">
          <div className="flex justify-end pr-10">
            <div className="text-center text-sm">
              <p className="mb-1">Semarang, Januari 2026</p>
              <p className="font-bold mb-24">Kepala BBSPJPPI</p>
              
              <p className="font-bold underline">Sofyari Rahman</p>
              <p>NIP. 19700101 199503 1 001</p>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTIONS (Hanya muncul di Layar) */}
        <div className="flex flex-wrap items-center justify-between pt-8 print:hidden">
          {/* Tombol Kiri */}
          <div className="flex gap-3">
            <button className="px-6 py-2.5 rounded-md text-sm font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 transition shadow-sm">
              Batal
            </button>
            <button className="px-6 py-2.5 rounded-md text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Simpan Data
            </button>
            <button 
              onClick={() => window.print()} 
              className="px-6 py-2.5 rounded-md text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              Cetak Dokumen
            </button>
          </div>

          {/* Tombol Kanan */}
          <Link href="/perjanjian-kinerja/rencana-aksi" className="px-6 py-2.5 rounded-md text-sm font-bold text-blue-600 border border-blue-600 bg-white hover:bg-blue-50 flex items-center gap-2 transition shadow-sm mt-4 md:mt-0">
            Lanjut ke Rencana Aksi <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

      </div>
    </div>
  );
}