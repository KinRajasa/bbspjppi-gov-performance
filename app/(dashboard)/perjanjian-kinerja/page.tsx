'use client';

import { useState } from 'react';

export default function PerjanjianKinerjaPage() {
  // Data awal (Pre-filled) sesuai desain mockup-mu
  const [rows, setRows] = useState([
    { id: 1, sasaran: 'Indeks Kepuasan Masyarakat (IKM)', satuan: 'Indeks', target: '3.70', pic: 'Ketua Tim Kerja PJI' },
    { id: 2, sasaran: 'Jumlah perusahaan industri yang memanfaatkan layanan', satuan: 'Perusahaan', target: '990', pic: 'Ketua Tim Kerja PJI' },
    { id: 3, sasaran: 'Persentase pelayanan tepat waktu (SLA)', satuan: 'Persen', target: '90', pic: 'Ketua Tim Kerja PJI' },
    { id: 4, sasaran: 'Nilai Net Promoter Score (NPS)', satuan: 'Nilai', target: '41.00', pic: 'Ketua Tim Kerja PJI' },
    { id: 5, sasaran: 'Indeks peningkatan PNBP', satuan: 'Indeks', target: '3.0', pic: 'Kapokja Keuangan dan BMN' },
  ]);

  // Fungsi untuk menambah baris kosong
  const handleAddRow = () => {
    const newRow = {
      id: Date.now(), // Pakai timestamp agar ID unik
      sasaran: '',
      satuan: 'Persen',
      target: '',
      pic: 'Ketua Tim Kerja PJI'
    };
    setRows([...rows, newRow]);
  };

  // Fungsi untuk menghapus baris
  const handleDeleteRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
  };

  // Fungsi untuk mengupdate isi form di baris tertentu
  const handleChange = (id: number, field: string, value: string) => {
    setRows(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  return (
    <div className="animation-fade-in w-full">
      
      {/* HEADER */}
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inisialisasi Perjanjian Kinerja (Master Data)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tetapkan pagu anggaran DIPA, 18 Indikator Kinerja Utama, target tahunan, dan penugasan PIC untuk tahun berjalan.
          </p>
        </div>
      </header>

      <div className="space-y-6">
        
        {/* CARD 1: INFORMASI UMUM */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-[20px]">info</span>
            <h3 className="font-bold text-slate-700 text-lg">Informasi Umum</h3>
          </div>
          <div className="p-6">
            <label className="block text-xs font-semibold text-slate-500 mb-2">Timeline Pelaksanaan</label>
            <div className="relative w-1/2">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">calendar_today</span>
              <input 
                type="text" 
                disabled 
                value="01 Januari 2026 - 31 Desember 2026" 
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-md pl-10 pr-4 py-2.5 outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: TABEL IKU (DINAMIS) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-[20px]">list_alt</span>
            <h3 className="font-bold text-slate-700 text-lg">Daftar Indikator Kinerja Utama (IKU)</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 w-12 text-center">No</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Sasaran / Indikator Kinerja Utama</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 w-40">Satuan</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 w-32">Target Tahunan</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 w-64">Penanggung Jawab (PIC)</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-center font-medium text-slate-500">{index + 1}</td>
                    
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={row.sasaran}
                        onChange={(e) => handleChange(row.id, 'sasaran', e.target.value)}
                        placeholder="Masukkan indikator..."
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </td>
                    
                    <td className="px-6 py-4">
                      <select 
                        value={row.satuan}
                        onChange={(e) => handleChange(row.id, 'satuan', e.target.value)}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="Indeks">Indeks</option>
                        <option value="Perusahaan">Perusahaan</option>
                        <option value="Persen">Persen</option>
                        <option value="Nilai">Nilai</option>
                        <option value="Hasil">Hasil</option>
                      </select>
                    </td>
                    
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        step="any"
                        value={row.target}
                        onChange={(e) => handleChange(row.id, 'target', e.target.value)}
                        placeholder="0.00"
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-right"
                      />
                    </td>
                    
                    <td className="px-6 py-4">
                      <select 
                        value={row.pic}
                        onChange={(e) => handleChange(row.id, 'pic', e.target.value)}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="Ketua Tim Kerja PJI">Ketua Tim Kerja PJI</option>
                        <option value="Kapokja Keuangan dan BMN">Kapokja Keuangan dan BMN</option>
                        <option value="Tim Kerja SDM">Tim Kerja SDM</option>
                        <option value="Tim Kerja IT">Tim Kerja IT</option>
                        <option value="Tim Kerja Program">Tim Kerja Program</option>
                      </select>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDeleteRow(row.id)}
                        className="w-8 h-8 rounded-md text-rose-500 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition"
                        title="Hapus baris"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50/50">
            <button 
              onClick={handleAddRow}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition"
            >
              <span className="material-symbols-outlined text-[18px]">add</span> Tambah Baris Indikator
            </button>
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="flex gap-4 pt-4">
          <button className="px-6 py-2.5 rounded-md text-sm font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 transition shadow-sm">
            Batal
          </button>
          <a href="/perjanjian-kinerja/rencana-aksi" className="px-6 py-2.5 rounded-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition shadow-sm">
            Simpan Data & Lanjut ke Rencana Aksi <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
        </div>

      </div>
    </div>
  );
}