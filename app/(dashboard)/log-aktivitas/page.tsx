'use client';

export default function LogAktivitasPage() {
  // Data dummy untuk tabel Log Aktivitas
  const tableData = [
    {
      id: 1,
      waktu: '18 Ags 2026',
      jam: '09:15 WIB',
      pengguna: 'Bapak Ahmad',
      peran: 'Katim / Reviewer',
      jenisAktivitas: 'VALIDASI',
      badgeColor: 'emerald',
      deskripsi: 'Menyetujui capaian indikator 1.3-SLA',
      modul: 'Validasi Data',
      refId: '#1042',
      ip: '192.168.1.45'
    },
    {
      id: 2,
      waktu: '18 Ags 2026',
      jam: '08:30 WIB',
      pengguna: 'Ibu Linda',
      peran: 'Kapokja',
      jenisAktivitas: 'PENOLAKAN',
      badgeColor: 'rose',
      deskripsi: 'Menolak capaian indikator 2.1-PNBP (Catatan: Bukti buram)',
      modul: 'Validasi Data',
      refId: '#1038',
      ip: '114.120.8.22'
    },
    {
      id: 3,
      waktu: '17 Ags 2026',
      jam: '14:00 WIB',
      pengguna: 'Budi Santoso',
      peran: 'PIC Umum',
      jenisAktivitas: 'INPUT DATA',
      badgeColor: 'blue',
      deskripsi: 'Mengunggah bukti dukung dan menyimpan realisasi 2.1-PNBP',
      modul: 'Input Kinerja',
      refId: '',
      ip: '192.168.1.12'
    },
    {
      id: 4,
      waktu: '10 Jan 2026',
      jam: '10:00 WIB',
      pengguna: 'Admin Program',
      peran: 'Tim Program',
      jenisAktivitas: 'MASTER DATA',
      badgeColor: 'purple',
      deskripsi: 'Menetapkan Rencana Aksi Tahunan untuk 18 Indikator',
      modul: 'Perjanjian Kinerja',
      refId: '',
      ip: '10.0.0.5'
    }
  ];

  return (
    <div className="animation-fade-in w-full pb-10 flex flex-col min-h-[90vh]">
      
      {/* HEADER & PROFILE INFO */}
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Log Aktivitas Sistem</h2>
          <p className="text-sm text-slate-500 mt-2">
            Jejak audit dan riwayat aktivitas pengguna untuk transparansi dan keamanan data.
          </p>
        </div>
        
        {/* Profile (Admin) */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="font-bold text-slate-800 text-sm leading-tight">Admin System</span>
            <span className="text-xs text-slate-500">Super Administrator</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
            AS
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTAINER (CARD)                                     */}
      {/* ========================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        
        {/* TOOLBAR FILTER */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            
            {/* Pencarian */}
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-500 mb-2">Pencarian</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
                <input 
                  type="text" 
                  placeholder="Cari pengguna, IP, atau aktivitas..." 
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition bg-white"
                />
              </div>
            </div>

            {/* Rentang Waktu */}
            <div className="w-full lg:w-64">
              <label className="block text-xs font-bold text-slate-500 mb-2">Rentang Waktu</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">calendar_today</span>
                <input 
                  type="text" 
                  defaultValue="17 Ags 2026 - 18 Ags 2026" 
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition bg-white cursor-pointer"
                />
              </div>
            </div>

            {/* Peran */}
            <div className="w-full lg:w-56">
              <label className="block text-xs font-bold text-slate-500 mb-2">Peran</label>
              <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer">
                <option>Semua Peran</option>
                <option>Katim / Reviewer</option>
                <option>PIC Umum</option>
                <option>Tim Program</option>
              </select>
            </div>

            {/* Tombol Filter */}
            <button className="w-full lg:w-auto bg-[#0f172a] text-white hover:bg-slate-800 px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-sm flex items-center justify-center gap-2 h-[42px]">
              <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
            </button>

          </div>
        </div>

        {/* TABEL DATA */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-36">Waktu & Tanggal</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-48">Pengguna</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Aktivitas</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-48">Modul Referensi</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px] text-right w-36">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition">
                  {/* Kolom 1: Waktu */}
                  <td className="px-6 py-5 align-top">
                    <p className="font-bold text-slate-700">{row.waktu}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{row.jam}</p>
                  </td>
                  
                  {/* Kolom 2: Pengguna */}
                  <td className="px-6 py-5 align-top">
                    <p className="font-bold text-slate-800">{row.pengguna}</p>
                    <p className="text-xs text-slate-500 mt-0.5">({row.peran})</p>
                  </td>
                  
                  {/* Kolom 3: Aktivitas */}
                  <td className="px-6 py-5 align-top">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${
                      row.badgeColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                      row.badgeColor === 'rose' ? 'bg-rose-100 text-rose-700' :
                      row.badgeColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {row.jenisAktivitas}
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {row.deskripsi}
                    </p>
                  </td>
                  
                  {/* Kolom 4: Modul */}
                  <td className="px-6 py-5 align-top">
                    <p className="text-slate-700">{row.modul}</p>
                    {row.refId && (
                      <p className="text-xs text-slate-500 mt-0.5">(ID: {row.refId})</p>
                    )}
                  </td>
                  
                  {/* Kolom 5: IP */}
                  <td className="px-6 py-5 align-top text-right font-mono text-xs text-slate-500">
                    {row.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION FOOTER */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-white text-sm mt-auto">
          <span className="text-slate-500">Menampilkan 1-4 dari 1,204 aktivitas</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-300 text-slate-400 hover:bg-slate-50 transition"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0f172a] text-white font-bold shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 transition">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded text-slate-400">...</button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 transition">301</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-50 transition"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>

      </div>
    </div>
  );
}