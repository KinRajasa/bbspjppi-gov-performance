'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { normalizeRole, routeAllowed, type AppRole } from '@/lib/rbac';
import Topbar from '@/components/Topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isPerjakinOpen, setIsPerjakinOpen] = useState(false);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    const role = document.cookie
      .split('; ')
      .find((item) => item.startsWith('userRole='))
      ?.split('=')[1];
    setRole(normalizeRole(decodeURIComponent(role ?? '')));
  }, []);

  const canAccess = (path: string) => role ? routeAllowed(role, path) : false;

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <aside className="w-64 bg-[#0f172a] text-slate-300 fixed h-full flex flex-col justify-between z-50 print:hidden">
        <div>
          <div className="p-6 pb-4">
            <h1 className="text-2xl font-bold text-white tracking-wide">BBSPJPPI</h1>
            <p className="text-xs text-slate-400 mt-1">Dashboard Kinerja</p>
          </div>
          
          <nav className="mt-2 flex flex-col gap-1 pr-4">
            <Link 
              href="/dashboard" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                (isActive('/') || isActive('/dashboard'))
                  ? 'border-blue-500 bg-blue-600/20 text-blue-400' 
                  : 'border-transparent hover:bg-slate-800'
              }`}
            >
              Dashboard Eksekutif
            </Link>
            
            {/* ========================================= */}
            {/* MENU PERJANJIAN KINERJA DENGAN SUB-MENU   */}
            {/* ========================================= */}
            {canAccess('/perjanjian-kinerja') && <div className="flex flex-col">
              <button 
                onClick={() => setIsPerjakinOpen(!isPerjakinOpen)}
                className={`w-full flex justify-between items-center pr-4 pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                  isActive('/perjanjian-kinerja') 
                    ? 'border-blue-500 bg-blue-600/20 text-blue-400' 
                    : 'border-transparent hover:bg-slate-800'
                }`}
              >
                <span>Perjanjian Kinerja</span>
                <span className="text-[10px] ml-2">{isPerjakinOpen ? '▼' : '▶'}</span>
              </button>

              {isPerjakinOpen && (
                <div className="flex flex-col mt-1 mb-2 relative">
                  <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-700/50"></div>
                  
                  <Link
                    href="/perjanjian-kinerja" 
                    className={`pl-12 py-2 text-sm font-medium transition-colors ${
                      pathname === '/perjanjian-kinerja'
                        ? 'text-blue-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Master Data Indikator
                  </Link>
                  {canAccess('/perjanjian-kinerja/rencana-aksi') && <Link
                    href="/perjanjian-kinerja/rencana-aksi" 
                    className={`pl-12 py-2 text-sm font-medium transition-colors ${
                      pathname === '/perjanjian-kinerja/rencana-aksi'
                        ? 'text-blue-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Rencana Aksi
                  </Link>}
                  {role === 'ADMIN' && <Link
                    href="/perjanjian-kinerja/integrasi-sheet" 
                    className={`pl-12 py-2 text-sm font-medium transition-colors ${
                      pathname === '/perjanjian-kinerja/integrasi-sheet'
                        ? 'text-blue-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Integrasi Sheet
                  </Link>}
                </div>
              )}
            </div>}

            {canAccess('/kelola-anggaran') && <Link 
              href="/kelola-anggaran" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                isActive('/kelola-anggaran') ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-transparent hover:bg-slate-800'
              }`}
            >
              Kelola Anggaran
            </Link>}

            {canAccess('/input-kinerja') && <Link 
              href="/input-kinerja" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                isActive('/input-kinerja') ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-transparent hover:bg-slate-800'
              }`}
              >
              Input Kinerja
            </Link>}

            {canAccess('/validasi-katim') && <Link 
              href="/validasi-katim" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                isActive('/validasi-katim') ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-transparent hover:bg-slate-800'
              }`}
            >
              Validasi Katim
            </Link>}

            {canAccess('/validasi-kapokja') && <Link 
              href="/validasi-kapokja" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                isActive('/validasi-kapokja') ? 'border-purple-500 bg-purple-600/20 text-purple-400' : 'border-transparent hover:bg-slate-800'
              }`}
            >
              Validasi Kapokja
            </Link>}

            {canAccess('/riwayat-pengajuan') && <Link 
              href="/riwayat-pengajuan" 
              className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                isActive('/riwayat-pengajuan') ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-transparent hover:bg-slate-800'
              }`}
            >
              Riwayat Pengajuan
            </Link>}

            {role === 'ADMIN' && (
              <Link
                href="/log-aktivitas"
                className={`pl-5 py-3 text-sm font-medium rounded-r transition-colors border-l-4 ${
                  isActive('/log-aktivitas') ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-transparent hover:bg-slate-800'
                }`}
              >
                Log Aktivitas
              </Link>
            )}
          </nav>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-700/50 flex flex-col gap-2">
          <Link 
            href="/api/auth/logout"
            className="flex items-center gap-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition font-medium text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Keluar
          </Link>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8 print:ml-0 print:p-0 print:w-full">
        <Topbar />
        {children}
      </main>
    </div>
  );
}
