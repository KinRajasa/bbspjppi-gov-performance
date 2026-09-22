'use client';

import { useEffect, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { normalizeRole, type AppRole } from '@/lib/rbac';

type Profile = { name: string; role: AppRole };

const roleLabel = (profile: Profile) => {
  if (profile.role === 'ADMIN') return 'Admin System';
  if (profile.role === 'PIMPINAN') return `Pimpinan - ${profile.name}`;
  if (profile.role === 'KAPOKJA') return `Kapokja - ${profile.name}`;
  if (profile.role === 'KATIM') return `Katim - ${profile.name}`;
  return `PIC - ${profile.name}`;
};

const roleInitial = (role: AppRole) => ({ ADMIN: 'AD', KAPOKJA: 'KP', KATIM: 'KT', PIC: 'PC', PIMPINAN: 'PM' })[role];
const roleStyle: Record<AppRole, { avatar: string; toast: string }> = {
  ADMIN: { avatar: 'bg-indigo-700 text-white', toast: 'border-indigo-200 bg-indigo-50 text-indigo-900' },
  PIMPINAN: { avatar: 'bg-purple-700 text-white', toast: 'border-purple-200 bg-purple-50 text-purple-900' },
  KAPOKJA: { avatar: 'bg-emerald-600 text-white', toast: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
  KATIM: { avatar: 'bg-blue-600 text-white', toast: 'border-blue-200 bg-blue-50 text-blue-900' },
  PIC: { avatar: 'bg-amber-500 text-white', toast: 'border-amber-200 bg-amber-50 text-amber-900' },
};

function readCookie(name: string) {
  return document.cookie.split('; ').find((item) => item.startsWith(`${name}=`))?.split('=').slice(1).join('=') ?? '';
}

export default function Topbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const role = normalizeRole(decodeURIComponent(readCookie('userRole')));
    const name = decodeURIComponent(readCookie('userName'));
    if (role && name) setProfile({ role, name });
    else {
      void fetch('/api/auth/session', { cache: 'no-store' }).then((response) => response.json()).then((result) => {
        const sessionRole = normalizeRole(result.user?.role);
        if (sessionRole && result.user?.name) setProfile({ role: sessionRole, name: result.user.name });
      }).catch(() => undefined);
    }
    if (readCookie('loginToast') === '1') {
      setShowToast(true);
      document.cookie = 'loginToast=; Max-Age=0; path=/';
      const timer = window.setTimeout(() => setShowToast(false), 4000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  if (!profile) return <div className="h-12" aria-hidden="true" />;
  const style = roleStyle[profile.role];
  const label = roleLabel(profile);
  const canExport = profile.role === 'ADMIN' && (pathname === '/dashboard' || pathname === '/');
  const handleDownload = () => {
    const params = new URLSearchParams(window.location.search);
    const year = Number(params.get('year')) || 2026;
    const quarter = Number(params.get('quarter')) || 4;
    window.open(`/api/export/rencana-aksi?year=${year}&quarter=${quarter}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="mb-5 flex min-h-12 items-center justify-end">
        {canExport && (
          <button
            type="button"
            onClick={handleDownload}
            className="mr-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            title="Unduh laporan Rencana Aksi dalam format Excel"
          >
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            Unduh Excel
          </button>
        )}
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${style.avatar}`}>
            {roleInitial(profile.role)}
          </div>
          <div className="max-w-[240px] leading-tight">
            <p className="truncate text-sm font-semibold text-slate-800">{label}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{profile.role}</p>
          </div>
        </div>
      </div>
      {showToast && (
        <div className={`fixed right-6 top-6 z-[100] rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${style.toast}`} role="status">
          Berhasil masuk! Anda saat ini login sebagai {label}.
        </div>
      )}
    </>
  );
}
