'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      
      <aside className="w-64 bg-[#0f172a] text-slate-300 fixed h-full flex flex-col justify-between z-50">
        <div>
          <div className="p-6 pb-4">
            <h1 className="text-2xl font-bold text-white tracking-wide">BBSPJPPI</h1>
            <p className="text-xs text-slate-400 mt-1">Gov Performance System</p>
          </div>
          
          <nav className="mt-2 flex flex-col gap-1 pr-4">
            
            <Link 
              href="/" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                isActive('/') 
                  ? 'border-blue-500 bg-blue-600/20 text-blue-400' 
                  : 'border-transparent hover:bg-slate-800'
              }`}
            >
              Dashboard Eksekutif
            </Link>
            
            <Link 
              href="/perjanjian-kinerja" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                isActive('/perjanjian-kinerja') 
                  ? 'border-blue-500 bg-blue-600/20 text-blue-400' 
                  : 'border-transparent hover:bg-slate-800'
              }`}
            >
              Perjanjian Kinerja
            </Link>

            <Link 
              href="/kelola-anggaran" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                isActive('/kelola-anggaran') ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-transparent hover:bg-slate-800'
              }`}
            >
              Kelola Anggaran
            </Link>

            <Link 
              href="/input-kinerja" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                isActive('/input-kinerja') ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-transparent hover:bg-slate-800'
              }`}
            >
              Input Kinerja
            </Link>

            <Link 
              href="/validasi-data" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                isActive('/validasi-data') ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-transparent hover:bg-slate-800'
              }`}
            >
              Validasi Data
            </Link>

            <Link 
              href="/riwayat-pengajuan" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                isActive('/riwayat-pengajuan') ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-transparent hover:bg-slate-800'
              }`}
            >
              Riwayat Pengajuan
            </Link>

            <Link 
              href="/log-aktivitas" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                isActive('/log-aktivitas') ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-transparent hover:bg-slate-800'
              }`}
            >
              Log Aktivitas
            </Link>
          </nav>
        </div>


        {/* ========================================== */}
        {/* MENU BAWAH (Pengaturan & Keluar)             */}
        {/* ========================================== */}
        <div className="mt-auto pt-6 border-t border-slate-700/50 flex flex-col gap-2">
          
          {/* Menu Pengaturan (DISEMBUNYIKAN SEMENTARA) */}
          {/* 
          <Link 
            href="/pengaturan" 
            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition font-medium text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            Pengaturan
          </Link>
          */}

          {/* Menu Keluar */}
          <Link 
            href="/login" 
            className="flex items-center gap-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition font-medium text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Keluar
          </Link>
          
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}