'use client';

import { useState } from 'react';

export default function IntegrasiSheetPage() {
  const [url, setUrl] = useState('https://docs.google.com/spreadsheets/d/1msENnJQpgSBX4ETuDgYyOuJyFV2GZnpEUte7WwvdtZ8/edit');
  const [worksheet, setWorksheet] = useState('TJ 1 - Indeks Kepuasan Masyarakat (IKM)');
  const [tahun, setTahun] = useState('2026');
  const [syncKey, setSyncKey] = useState('');
  const [showPreview, setShowPreview] = useState(true); // Default true agar mirip di gambar

  return (
    <div className="animation-fade-in w-full">
      
      {/* HEADER */}
      <header className="mb-6">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Admin</p>
        <h2 className="text-2xl font-bold text-slate-800">Hubungkan Google Spreadsheet</h2>
        <p className="text-sm text-slate-500 mt-1">
          Baca Target/Realisasi Triwulan I-IV dari worksheet, tinjau, lalu simpan ke MySQL.
        </p>
      </header>

      {/* MAIN CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        
        {/* INPUT: URL */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">URL Google Spreadsheet</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-slate-100/50 border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <p className="text-xs text-slate-500 mt-2">
            Spreadsheet harus dibagikan ke email service account dari `.env.local`.
          </p>
        </div>

        {/* INPUT: WORKSHEET & TAHUN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Worksheet / indikator</label>
            <select 
              value={worksheet}
              onChange={(e) => setWorksheet(e.target.value)}
              className="w-full border border-blue-300 rounded-md px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition"
            >
              <option value="TJ 1 - Indeks Kepuasan Masyarakat (IKM)">TJ 1 - Indeks Kepuasan Masyarakat (IKM)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tahun anggaran</label>
            <input
              type="text"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* BUTTON BACA */}
        <div className="flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-md text-sm transition">
            Baca & Pratinjau
          </button>
        </div>

        {/* AREA PREVIEW (Muncul setelah tombol Baca diklik) */}
        {showPreview && (
          <div className="border border-slate-200 rounded-lg p-5 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700">Hasil Google Spreadsheet</h3>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                Siap disinkronkan
              </span>
            </div>

            <table className="w-full text-sm text-center">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-3 font-semibold text-left w-1/5">NILAI</th>
                  <th className="py-3 font-semibold w-1/5">TW I</th>
                  <th className="py-3 font-semibold w-1/5">TW II</th>
                  <th className="py-3 font-semibold w-1/5">TW III</th>
                  <th className="py-3 font-semibold w-1/5">TW IV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4 font-bold text-slate-700 text-left">Target</td>
                  <td className="py-4 text-slate-500">Belum tersedia</td>
                  <td className="py-4 text-slate-500">Belum tersedia</td>
                  <td className="py-4 text-slate-500">Belum tersedia</td>
                  <td className="py-4 text-slate-500">Belum tersedia</td>
                </tr>
                <tr>
                  <td className="py-4 font-bold text-slate-700 text-left">Realisasi</td>
                  <td className="py-4 font-bold text-emerald-600">3,69</td>
                  <td className="py-4 font-bold text-emerald-600">3,74</td>
                  <td className="py-4 font-bold text-emerald-600">Belum tersedia</td>
                  <td className="py-4 font-bold text-emerald-600">Belum tersedia</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* INPUT SYNC KEY */}
        <div className="mt-6">
          <label className="block text-sm font-bold text-slate-500 mb-2">Kunci sync server (production)</label>
          <input
            type="password"
            value={syncKey}
            onChange={(e) => setSyncKey(e.target.value)}
            placeholder="Isi jika server meminta x-sync-secret"
            className="w-full border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* ALERT SUCCESS */}
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-md text-sm">
          Data target dan realisasi berhasil disinkronkan. Submission ID: 1.
        </div>

        {/* BUTTON SUBMIT */}
        <div className="flex justify-end pt-2">
          <button className="bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-md text-sm transition">
            Sync to Database
          </button>
        </div>

      </div>
    </div>
  );
}