'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type ActivityLog = {
  id: number;
  createdAt: string;
  userName: string;
  userRoles: string[];
  module: string;
  action: string;
  description: string;
  referenceType: string | null;
  referenceId: number | null;
  ipAddress: string | null;
};

type Pagination = { currentPage: number; pageSize: number; totalRecords: number; totalPages: number };

const roleLabel: Record<string, string> = {
  ADMIN: 'Admin',
  PIC: 'PIC',
  KATIM: 'Katim / Reviewer',
  KAPOKJA: 'Kapokja',
  PIMPINAN: 'Pimpinan',
};

function activityKind(log: ActivityLog) {
  const text = `${log.action} ${log.module}`.toUpperCase();
  if (/REJECT|REVISI|TOLAK/.test(text)) return { label: 'PENOLAKAN / REVISI', className: 'bg-rose-100 text-rose-700' };
  if (/APPROVE|VALIDASI|PUBLISH/.test(text)) return { label: 'VALIDASI', className: 'bg-emerald-100 text-emerald-700' };
  if (/IMPORT|MASTER/.test(text)) return { label: 'MASTER DATA / IMPORT', className: 'bg-purple-100 text-purple-700' };
  return { label: 'INPUT DATA', className: 'bg-blue-100 text-blue-700' };
}

function formatDate(value: string) {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date),
    time: `${new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)} WIB`,
  };
}

export default function LogAktivitasPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ currentPage: 1, pageSize: 10, totalRecords: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [role, setRole] = useState('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = useCallback(async (requestedPage = page) => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page: String(requestedPage) });
    if (search.trim()) params.set('search', search.trim());
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (role !== 'ALL') params.set('role', role);
    try {
      const response = await fetch(`/api/activity-logs?${params.toString()}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Log aktivitas gagal dimuat.');
      setLogs(result.data ?? []);
      setPagination(result.pagination);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Log aktivitas gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }, [endDate, page, role, search, startDate]);

  useEffect(() => { loadLogs(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilter = () => {
    setPage(1);
    void loadLogs(1);
  };

  const currentRange = useMemo(() => {
    if (!pagination.totalRecords) return 'Menampilkan 0 aktivitas';
    const from = (pagination.currentPage - 1) * pagination.pageSize + 1;
    const to = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords);
    return `Menampilkan ${from}-${to} dari ${pagination.totalRecords} aktivitas`;
  }, [pagination]);

  return (
    <div className="animation-fade-in flex min-h-[90vh] w-full flex-col pb-10">
      <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Log Aktivitas Sistem</h2>
          <p className="mt-2 text-sm text-slate-500">Jejak audit dan riwayat aktivitas pengguna untuk transparansi dan keamanan data.</p>
        </div>
       
      </header>

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/30 p-6">
          <div className="flex flex-col items-end gap-4 lg:flex-row">
            <div className="w-full flex-1"><label className="mb-2 block text-xs font-bold text-slate-500">Pencarian</label><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilter()} placeholder="Cari pengguna, IP, atau aktivitas..." className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500" /></div>
            <div className="w-full lg:w-64"><label className="mb-2 block text-xs font-bold text-slate-500">Mulai Tanggal</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500" /></div>
            <div className="w-full lg:w-64"><label className="mb-2 block text-xs font-bold text-slate-500">Sampai Tanggal</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500" /></div>
            <div className="w-full lg:w-56"><label className="mb-2 block text-xs font-bold text-slate-500">Peran</label><select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"><option value="ALL">Semua Peran</option><option value="ADMIN">ADMIN</option><option value="PIC">PIC</option><option value="KATIM">KATIM</option><option value="KAPOKJA">KAPOKJA</option><option value="PIMPINAN">PIMPINAN</option></select></div>
            <button onClick={applyFilter} className="flex h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 lg:w-auto"><span className="material-symbols-outlined text-[18px]">filter_list</span>Filter</button>
          </div>
        </div>

        {loading ? <p className="p-12 text-center text-sm text-slate-500">Memuat log aktivitas...</p> : error ? <p className="p-12 text-center text-sm text-rose-600">{error}</p> : logs.length === 0 ? <p className="p-12 text-center text-sm text-slate-500">Belum ada aktivitas sesuai filter.</p> : (
          <div className="flex-1 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 bg-white"><tr><th className="w-36 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Waktu & Tanggal</th><th className="w-48 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Pengguna</th><th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Aktivitas</th><th className="w-48 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Modul Referensi</th><th className="w-36 px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Alamat IP</th></tr></thead><tbody className="divide-y divide-slate-100">{logs.map((log) => { const date = formatDate(log.createdAt); const kind = activityKind(log); return <tr key={log.id} className="transition hover:bg-slate-50/50"><td className="px-6 py-5 align-top"><p className="font-bold text-slate-700">{date.date}</p><p className="mt-0.5 text-xs text-slate-500">{date.time}</p></td><td className="px-6 py-5 align-top"><p className="font-bold text-slate-800">{log.userName}</p><p className="mt-0.5 text-xs text-slate-500">({log.userRoles.map((item) => roleLabel[item] ?? item).join(' / ') || 'Pengguna'})</p></td><td className="px-6 py-5 align-top"><span className={`mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${kind.className}`}>{kind.label}</span><p className="font-medium leading-relaxed text-slate-700">{log.description}</p></td><td className="px-6 py-5 align-top"><p className="text-slate-700">{log.module}</p>{log.referenceId !== null && <p className="mt-0.5 text-xs text-slate-500">(ID: #{log.referenceId})</p>}</td><td className="px-6 py-5 text-right align-top font-mono text-xs text-slate-500">{log.ipAddress || '-'}</td></tr>; })}</tbody></table></div>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 bg-white p-4 text-sm"><span className="text-slate-500">{currentRange}</span><div className="flex items-center gap-2"><button disabled={page <= 1 || loading} onClick={() => { const next = page - 1; setPage(next); void loadLogs(next); }} className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button><span className="min-w-8 text-center font-bold text-slate-700">{pagination.currentPage}</span><button disabled={page >= pagination.totalPages || loading} onClick={() => { const next = page + 1; setPage(next); void loadLogs(next); }} className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button></div></div>
      </div>
    </div>
  );
}
