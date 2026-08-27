'use client';

import Link from 'next/link';

export default function RiwayatPengajuanPage() {
  // Data dummy diperbarui dengan penomoran 1.1 dan tambahan konteks 'sasaran'
  const tableData = [
    {
      id: 1,
      tanggal: '18 Ags 2026, 09:30',
      periode: 'Maret 2026',
      sasaran: 'Meningkatnya kualitas dan kuantitas layanan jasa industri',
      indikator: '1.1 - Indeks Kepuasan Masyarakat (IKM)',
      status: 'DISETUJUI KAPOKJA (SELESAI)',
      statusColor: 'emerald',
      icon: 'check_circle',
      action: 'Lihat Detail',
      actionType: 'link'
    },
    {
      id: 2,
      tanggal: '17 Ags 2026, 14:15',
      periode: 'Triwulan I',
      sasaran: 'Terwujudnya layanan tata kelola pemerintahan yang baik',
      indikator: '2.1 - Indeks peningkatan PNBP',
      status: 'REVISI DARI KATIM',
      statusColor: 'rose',
      icon: 'assignment_return',
      action: 'Perbaiki Data',
      actionType: 'button',
      catatanRevisi: 'Tolong perbaiki angka realisasi pada Triwulan III, sepertinya tidak sesuai dengan dokumen kuitansi.'
    },
    {
      id: 3,
      tanggal: '18 Ags 2026, 11:00',
      periode: 'Juli 2026',
      sasaran: 'Meningkatnya kualitas dan kuantitas layanan jasa industri',
      indikator: '1.3 - Persentase pelayanan tepat waktu (SLA)',
      status: 'MENUNGGU REVIEW KATIM',
      statusColor: 'amber',
      icon: 'pending',
      action: 'Lihat Detail',
      actionType: 'link'
    }
  ];

  return (
    <div className="animation-fade-in w-full pb-10 flex flex-col min-h-[90vh]">
      
      {/* HEADER & PROFILE INFO */}
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Riwayat Pengajuan Kinerja</h2>
          <p className="text-sm text-slate-500 mt-2">
            Pantau status validasi dari laporan kinerja yang telah Anda kirimkan.
          </p>
        </div>
        
        {/* Profile Card PIC */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-md bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm overflow-hidden">
            <span className="material-symbols-outlined text-[24px]">person</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="font-bold text-slate-800 text-sm leading-tight">Budi Santoso</span>
            <span className="text-xs text-slate-500">PIC Umum</span>
          </div>
        </div>
      </header>

      <div className="space-y-6 flex-1">
        
        {/* ========================================================= */}
        {/* 3 KARTU SUMMARY (METRIK)                                  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Sedang Diproses */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm transition hover:shadow-md cursor-pointer">
            <div className="w-14 h-14 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
               <span className="material-symbols-outlined text-[28px]">hourglass_empty</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">Sedang Diproses</span>
              <span className="text-2xl font-black text-slate-800 mt-1">2 Laporan</span>
            </div>
          </div>

          {/* Card 2: Perlu Revisi */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm transition hover:shadow-md cursor-pointer">
            <div className="w-14 h-14 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
               <span className="material-symbols-outlined text-[28px]">error</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">Perlu Revisi</span>
              <span className="text-2xl font-black text-slate-800 mt-1">1 Laporan</span>
            </div>
          </div>

          {/* Card 3: Selesai */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm transition hover:shadow-md cursor-pointer">
            <div className="w-14 h-14 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
               <span className="material-symbols-outlined text-[28px]">task_alt</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">Selesai (Disetujui)</span>
              <span className="text-2xl font-black text-slate-800 mt-1">8 Laporan</span>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* AREA TABEL DATA                                           */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Toolbar (Search & Filter) */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Cari Indikator atau Periode..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white font-medium cursor-pointer w-48">
                <option>Semua Status</option>
                <option>Sedang Diproses</option>
                <option>Perlu Revisi</option>
                <option>Disetujui</option>
              </select>
            </div>
          </div>

          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Tanggal Kirim</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Periode & Indikator</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Status Pelacakan</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition">
                    
                    {/* 1. KOLOM TANGGAL (Ubah align-middle jadi align-top) */}
                    <td className="px-6 py-5 text-slate-600 font-medium whitespace-nowrap align-top">
                      {row.tanggal}
                    </td>
                    
                    {/* 2. KOLOM PERIODE & INDIKATOR */}
                    <td className="px-6 py-5 align-top">
                      {/* Konteks Sasaran ditaruh di sini */}
                      <div className="mb-2">
                        <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded border border-slate-200">
                          {row.sasaran}
                        </span>
                      </div>

                      <p className="font-bold text-slate-800 mb-1">{row.periode}</p>
                      <p className="text-slate-500">{row.indikator}</p>
                      
                      {/* Kotak Catatan Revisi */}
                      {row.statusColor === 'rose' && row.catatanRevisi && (
                        <div className="mt-3 bg-rose-50/80 border border-rose-200 rounded-md p-3 max-w-[300px]">
                          <p className="text-xs text-rose-700 leading-relaxed whitespace-normal">
                            <span className="font-bold text-rose-800">Catatan: </span> 
                            {row.catatanRevisi}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* 3. KOLOM STATUS PELACAKAN (Ubah align-middle jadi align-top) */}
                    <td className="px-6 py-5 align-top">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        row.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        row.statusColor === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">{row.icon}</span>
                        {row.status}
                      </span>
                    </td>

                    {/* 4. KOLOM AKSI (Ubah align-middle jadi align-top) */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex justify-end">
                        {row.actionType === 'button' ? (
                          <Link 
                            href="/input-kinerja" 
                            className="bg-[#0f62fe] text-white hover:bg-blue-700 px-5 py-2 rounded-md text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm w-max"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit_document</span>
                            {row.action}
                          </Link>
                        ) : (
                          <Link 
                          href="/riwayat-pengajuan/detail" 
                          className="text-blue-600 hover:text-blue-800 px-4 py-2 text-sm font-bold transition flex items-center justify-center gap-2 w-max"
                          >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                          {row.action}
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
          <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-white text-sm">
            <span className="text-slate-500">Menampilkan 1-3 dari 11 riwayat pengajuan</span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-300 text-slate-400 hover:bg-slate-50 transition"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-50 transition"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>© 2026 BBSPJPPI. All rights reserved.</p>
        <div className="flex gap-6 font-medium">
          <Link href="#" className="hover:text-blue-600 transition">Privacy Policy</Link>
          <Link href="#" className="hover:text-blue-600 transition">Terms of Service</Link>
        </div>
      </footer>

    </div>
  );
}