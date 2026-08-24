'use client';

import Link from 'next/link';

export default function KelolaAnggaranPage() {
  return (
    <div className="animation-fade-in w-full pb-10">
      
      {/* HEADER */}
      <header className="mb-8 border-b border-slate-200 pb-5">
        <h2 className="text-3xl font-bold text-slate-800">Kelola Anggaran & Realisasi Keuangan</h2>
        <p className="text-sm text-slate-500 mt-2">
          Input dan pembaruan posisi Pagu DIPA, Realisasi Belanja, dan Penerimaan PNBP.
        </p>
      </header>

      <div className="space-y-6">
        
        {/* ========================================================= */}
        {/* TABEL 1: POSISI PAGU DIPA                                 */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Tabel 1: Posisi Pagu DIPA BBSPJPPI</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Pagu DIPA Awal</label>
              <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 transition">
                <span className="px-3 py-2 bg-slate-50 text-slate-500 border-r border-slate-200 text-sm font-medium">Rp</span>
                <input type="text" defaultValue="41.767.656.000" className="w-full px-3 py-2 text-sm text-slate-700 outline-none" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Pagu Revisi Terakhir</label>
              <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 transition">
                <span className="px-3 py-2 bg-slate-50 text-slate-500 border-r border-slate-200 text-sm font-medium">Rp</span>
                <input type="text" defaultValue="44.740.652.000" className="w-full px-3 py-2 text-sm text-slate-700 outline-none" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Blokir</label>
              <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 transition">
                <span className="px-3 py-2 bg-slate-50 text-slate-500 border-r border-slate-200 text-sm font-medium">Rp</span>
                <input type="text" defaultValue="4.334.126.000" className="w-full px-3 py-2 text-sm text-rose-500 font-medium outline-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Total Pagu Efektif</label>
              <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 transition">
                <span className="px-3 py-2 bg-slate-50 text-slate-500 border-r border-slate-200 text-sm font-medium">Rp</span>
                <input type="text" defaultValue="40.406.526.000" className="w-full px-3 py-2 text-sm text-emerald-600 font-bold outline-none" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Sumber Anggaran: Rupiah Murni</label>
              <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 transition">
                <span className="px-3 py-2 bg-slate-50 text-slate-500 border-r border-slate-200 text-sm font-medium">Rp</span>
                <input type="text" defaultValue="20.271.892.000" className="w-full px-3 py-2 text-sm text-slate-700 outline-none" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Sumber Anggaran: PNBP</label>
              <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 transition">
                <span className="px-3 py-2 bg-slate-50 text-slate-500 border-r border-slate-200 text-sm font-medium">Rp</span>
                <input type="text" defaultValue="20.134.634.000" className="w-full px-3 py-2 text-sm text-slate-700 outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TABEL 2: REALISASI ANGGARAN BELANJA                       */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Tabel 2: Realisasi Anggaran (Belanja)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-500 mb-2">Target Keuangan</label>
                <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 transition">
                  <input type="text" defaultValue="47,43" className="w-full px-4 py-2 text-sm text-slate-700 outline-none" />
                  <span className="px-4 py-2 bg-slate-50 text-slate-500 border-l border-slate-200 text-sm font-medium">%</span>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-500 mb-2">Realisasi Anggaran Aktual</label>
                <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 transition">
                  <span className="px-3 py-2 bg-slate-50 text-slate-500 border-r border-slate-200 text-sm font-medium">Rp</span>
                  <input type="text" defaultValue="19.859.710.144" className="w-full px-3 py-2 text-sm text-blue-600 font-medium outline-none" />
                </div>
              </div>
            </div>

            {/* Kotak Summary Persentase */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col justify-center">
              <h4 className="text-center font-bold text-slate-800 mb-6">Persentase Realisasi Keuangan</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-sm font-medium text-slate-600">Terhadap Total Pagu</span>
                  <span className="font-bold text-slate-800">44,39 %</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-sm font-medium text-slate-600">Terhadap Pagu Efektif</span>
                  <span className="font-bold text-emerald-600">49,15 %</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TABEL 3: CAPAIAN PENERIMAAN PNBP                          */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Tabel 3: Capaian Penerimaan PNBP</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Target PNBP</label>
              <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 transition">
                <span className="px-3 py-2 bg-slate-50 text-slate-500 border-r border-slate-200 text-sm font-medium">Rp</span>
                <input type="text" defaultValue="21.351.876.000" className="w-full px-3 py-2 text-sm text-slate-700 outline-none" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Penerimaan PNBP Aktual</label>
              <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 transition">
                <span className="px-3 py-2 bg-slate-50 text-slate-500 border-r border-slate-200 text-sm font-medium">Rp</span>
                <input type="text" defaultValue="8.376.976.815" className="w-full px-3 py-2 text-sm text-emerald-600 font-medium outline-none" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Realisasi Penerimaan</label>
              <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500 transition">
                <input type="text" defaultValue="39,23" className="w-full px-4 py-2 text-sm text-slate-700 font-bold outline-none" />
                <span className="px-4 py-2 bg-slate-50 text-slate-500 border-l border-slate-200 text-sm font-medium">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM ACTIONS & TIMESTAMP                                */}
        {/* ========================================================= */}
        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-slate-500">Terakhir diperbarui: 3 Juli 2026</p>
          <div className="flex gap-4">
            <Link href="/" className="px-8 py-2.5 rounded-md text-sm font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 transition shadow-sm flex items-center justify-center">
              Batal
            </Link>
            <button className="px-6 py-2.5 rounded-md text-sm font-bold text-white bg-[#0f172a] hover:bg-slate-800 flex items-center gap-2 transition shadow-sm">
              <span className="material-symbols-outlined text-[18px]">save</span> Simpan Perubahan Anggaran
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}