'use client';

import Link from 'next/link';

export default function ValidasiDataPage() {
  // DATA ANTREAN: Ditambahkan properti "sasaran" pada setiap baris
  const tableData = [
    { 
      id: 1, 
      waktu: '24 Okt 2026, 10:30', 
      pic: 'Siti Aminah', 
      sasaran: 'Meningkatnya kualitas layanan jasa industri',
      indikator: '1.1 - Indeks Kepuasan Masyarakat (IKM)', 
      status: 'Menunggu Review', 
      statusType: 'warning',
      isRed: false
    },
    { 
      id: 2, 
      waktu: '23 Okt 2026, 15:45', 
      pic: 'Budi Santoso', 
      sasaran: 'Terwujudnya layanan tata kelola pemerintahan',
      indikator: '2.1 - Indeks peningkatan PNBP', 
      status: 'Revisi dari Kapokja', 
      statusType: 'danger',
      isRed: true,
      catatanRevisi: 'Tolong perbaiki angka realisasi pada Triwulan III, sepertinya tidak sesuai dengan dokumen kuitansi.'
    },
    { 
      id: 3, 
      waktu: '22 Okt 2026, 09:15', 
      pic: 'Andi Rahman', 
      sasaran: 'Meningkatnya kualitas layanan jasa industri',
      indikator: '1.3 - Persentase pelayanan tepat waktu (SLA)', 
      status: 'Menunggu Review', 
      statusType: 'warning',
      isRed: false
    },
  ];

  return (
    <div className="animation-fade-in w-full pb-10">
      
      {/* HEADER & PROFILE INFO */}
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Antrean Validasi (Tahap 1)</h2>
          <p className="text-sm text-slate-500 mt-2">
            Tinjau daftar capaian kinerja yang menunggu persetujuan Anda.
          </p>
        </div>
        
        {/* Profile Card Reviewer */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-md bg-[#0f172a] text-white flex items-center justify-center font-bold text-sm">
            BA
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-sm leading-tight">Bapak Ahmad</span>
            <span className="text-xs text-slate-500">Katim / Reviewer</span>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        
        {/* ========================================================= */}
        {/* 3 KARTU SUMMARY (METRIK)                                  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Menunggu Validasi */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm transition hover:shadow-md cursor-pointer">
            <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
               <span className="material-symbols-outlined text-[28px]">pending_actions</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">Menunggu Validasi</span>
              <span className="text-2xl font-black text-slate-800 mt-1">4 Laporan</span>
            </div>
          </div>

          {/* Card 2: Revisi dari Pimpinan (Highlight Merah) */}
          <div className="bg-white rounded-xl border-2 border-rose-500 p-5 flex items-center gap-4 shadow-md cursor-pointer relative overflow-hidden">
            {/* Aksen warna merah tipis di background */}
            <div className="absolute inset-0 bg-rose-50/30"></div>
            
            <div className="w-14 h-14 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 relative z-10">
               <span className="material-symbols-outlined text-[28px]">assignment_return</span>
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-sm font-medium text-slate-600">Revisi dari Pimpinan</span>
              <span className="text-2xl font-black text-rose-600 mt-1">1 Laporan</span>
            </div>
          </div>

          {/* Card 3: Telah Disetujui */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm transition hover:shadow-md cursor-pointer">
            <div className="w-14 h-14 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
               <span className="material-symbols-outlined text-[28px]">task_alt</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">Telah Disetujui (Bulan Ini)</span>
              <span className="text-2xl font-black text-slate-800 mt-1">12 Laporan</span>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* AREA TABEL DATA                                           */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Toolbar (Search & Filter) */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Cari PIC atau Indikator..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">filter_list</span>
              <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white font-medium cursor-pointer">
                <option>Semua Antrean</option>
                <option>Menunggu Review</option>
                <option>Revisi</option>
              </select>
            </div>
          </div>

          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600">Waktu Submit</th>
                  <th className="px-6 py-4 font-bold text-slate-600">PIC / Divisi</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Indikator Kinerja</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition">
                    
                    <td className={`px-6 py-5 align-top font-medium ${row.isRed ? 'text-rose-600' : 'text-slate-600'}`}>
                      {row.waktu}
                    </td>
                    
                    <td className="px-6 py-5 align-top text-slate-800 font-medium">
                      {row.pic}
                    </td>
                    
                    <td className="px-6 py-5 align-top">
                      {/* Konteks Sasaran (Badge) */}
                      <div className="mb-2">
                        <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded border border-slate-200">
                          {row.sasaran}
                        </span>
                      </div>
                      
                      <div className="text-slate-800 font-bold">{row.indikator}</div>
                      
                      {/* Catatan Revisi */}
                      {row.isRed && row.catatanRevisi && (
                        <div className="mt-3 bg-rose-50/80 border border-rose-200 rounded-md p-3 max-w-[300px]">
                          <p className="text-xs text-rose-700 leading-relaxed whitespace-normal">
                            <span className="font-bold text-rose-800">Catatan: </span> 
                            {row.catatanRevisi}
                          </p>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-5 align-top">
                      {row.statusType === 'warning' ? (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                          {row.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full text-xs font-bold border border-rose-200">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          {row.status}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-5 align-top">
                      <div className="flex justify-end">
                        {row.statusType === 'warning' ? (
                          <Link 
                            href="/validasi-data/detail" 
                            className="border border-blue-500 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-md text-sm font-bold transition flex items-center justify-center gap-1 w-max"
                          >
                            Tinjau Laporan
                          </Link>
                        ) : (
                          <Link 
                            href="/validasi-data/detail" 
                            className="bg-rose-600 text-white hover:bg-rose-700 px-4 py-1.5 rounded-md text-sm font-bold transition flex items-center justify-center gap-1 shadow-sm w-max"
                          >
                            Tinjau Laporan
                          </Link>
                        )}
                      </div>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/30 text-sm">
            <span className="text-slate-500">Menampilkan 1-3 dari 5 antrean</span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-200 transition"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0f172a] text-white font-bold text-xs shadow-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 font-bold text-xs transition">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-slate-600 hover:bg-slate-200 transition"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}