'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { cleanIndicatorName } from '@/lib/clean-indicator-name';

type QueueItem = {
  id: number;
  submittedAt: string;
  pic: string;
  katim: string;
  katimNote: string | null;
  katimReviewedAt: string | null;
  sasaranName: string;
  indicator: { code: string; name: string; unit: string | null };
  fiscalYear?: number;
  reportingQuarter: number | null;
  status: string;
  physicalRealization: string | null;
  targetValue: string | null;
  realizationValue: string | null;
  revisionNote: string | null;
  evidenceFileUrl: string | null;
};

type Summary = {
  pending: number;
  revised: number;
  approvedThisMonth: number;
};

const QUARTER_ROMAN = ['I', 'II', 'III', 'IV'] as const;

export default function ValidasiKapokjaPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [summary, setSummary] = useState<Summary>({
    pending: 0,
    revised: 0,
    approvedThisMonth: 0,
  });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetch('/api/validasi-kapokja')
      .then((response) => response.json())
      .then((result) => {
        if (!result.success) throw new Error(result.message);
        setItems(result.data ?? []);
        setSummary(result.summary ?? { pending: 0, revised: 0, approvedThisMonth: 0 });
      })
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : 'Antrean gagal dimuat.')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        `${item.pic} ${item.katim} ${item.indicator.code} ${item.indicator.name} ${item.sasaranName}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const isRevised = item.status === 'REVISION_BY_KAPOKJA' || item.status === 'REVISION_REQUIRED_BY_KAPOKJA';
      const isPending =
        item.status === 'SUBMITTED_TO_KAPOKJA' || item.status === 'DISETUJUI';

      const matchesFilter =
        filter === 'all' ||
        (filter === 'pending' && isPending) ||
        (filter === 'revised' && isRevised);

      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  return (
    <div className="animation-fade-in w-full pb-10">
      {/* ============================================================
          HEADER
      ============================================================= */}
      <header className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-800">
              Tahap 2 / Final
            </span>
            <span className="text-xs text-slate-400">Persetujuan Kapokja</span>
          </div>
          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            Antrean Validasi
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Gerbang terakhir persetujuan. Laporan yang disetujui di sini akan resmi dikunci dan dipublikasikan ke Dashboard Eksekutif.
          </p>
        </div>

        <div className="flex items-center gap-3">
         
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
        </div>
      </header>

      {/* ============================================================
          RINGKASAN METRIK (3 KARTU)
      ============================================================= */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* KARTU 1: MENUNGGU PERSETUJUAN FINAL */}
        <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Menunggu Persetujuan Final</p>
            <p className="mt-1 text-2xl font-black text-slate-800">{summary.pending} Laporan</p>
            <p className="text-[11px] text-blue-600">Sudah lolos verifikasi Katim</p>
          </div>
        </div>

        {/* KARTU 2: REVISI DARI PIMPINAN */}
        <div className="flex items-center gap-4 rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <span className="material-symbols-outlined">assignment_return</span>
          </div>
          <div>
            <p className="text-sm font-medium text-rose-600">Perlu Revisi / Dikembalikan</p>
            <p className="mt-1 text-2xl font-black text-rose-600">{summary.revised} Laporan</p>
            <p className="text-[11px] text-rose-500">Dikembalikan ke Katim/PIC</p>
          </div>
        </div>

        {/* KARTU 3: TELAH DISETUJUI FINAL */}
        <div className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <span className="material-symbols-outlined">task_alt</span>
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-600">Telah Disetujui Final (Bulan Ini)</p>
            <p className="mt-1 text-2xl font-black text-emerald-600">{summary.approvedThisMonth} Laporan</p>
            <p className="text-[11px] text-emerald-600">Telah dipublikasi ke Dashboard</p>
          </div>
        </div>
      </div>

      {/* ============================================================
          TABEL ANTREAN & FILTER
      ============================================================= */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50/60 p-4 md:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari PIC, Katim, atau indikator..."
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 md:w-80"
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
          >
            <option value="all">Semua Antrean Pimpinan</option>
            <option value="pending">Menunggu Persetujuan Final</option>
            <option value="revised">Perlu Revisi</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            <span className="material-symbols-outlined animate-spin align-middle mr-2">autorenew</span>
            Memuat antrean validasi Kapokja...
          </div>
        ) : error ? (
          <p className="p-8 text-center text-sm text-rose-600">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            <span className="material-symbols-outlined mb-2 text-4xl text-slate-300">inbox</span>
            <p className="font-semibold text-slate-700">Tidak ada antrean validasi Kapokja saat ini.</p>
            <p className="mt-1 text-xs text-slate-400">
              Laporan yang disetujui oleh Katim akan otomatis muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-white">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600">Waktu Diajukan</th>
                  <th className="px-6 py-4 font-bold text-slate-600">PIC & Katim</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Indikator Kinerja</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Bukti Dukung</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isRevised = item.status === 'REVISION_BY_KAPOKJA' || item.status === 'REVISION_REQUIRED_BY_KAPOKJA';
                  const isWaitingKatimRevision = item.status === 'REVISION_REQUIRED_BY_KAPOKJA';
                  const quarterLabel =
                    item.reportingQuarter && item.reportingQuarter >= 1 && item.reportingQuarter <= 4
                      ? QUARTER_ROMAN[item.reportingQuarter - 1]
                      : '-';

                  return (
                    <tr key={item.id} className="align-top hover:bg-slate-50">
                      {/* WAKTU */}
                      <td className="whitespace-nowrap px-6 py-5 text-slate-600">
                        <div className="font-medium text-slate-800">{formatDate(item.submittedAt)}</div>
                        <div className="text-xs text-slate-400">TW {quarterLabel} · TA {item.fiscalYear}</div>
                      </td>

                      {/* PIC & KATIM */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                          PIC: {item.pic}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700">
                          <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                          Katim: {item.katim}
                        </div>
                        {item.katimNote && (
                          <div className="mt-1 max-w-xs truncate text-[11px] italic text-slate-500" title={item.katimNote}>
                            &ldquo;{item.katimNote}&rdquo;
                          </div>
                        )}
                      </td>

                      {/* INDIKATOR */}
                      <td className="px-6 py-5">
                        <p className="mb-1 text-xs text-slate-400">{item.sasaranName}</p>
                        <p className="font-bold text-slate-800">
                          {cleanIndicatorName(item.indicator.name)}
                        </p>
                        {isRevised && item.revisionNote && (
                          <div className="mt-2 rounded-md border border-rose-200 bg-rose-50/70 p-2.5 text-xs text-rose-700">
                            <span className="font-bold">Catatan Kapokja:</span> {item.revisionNote}
                          </div>
                        )}
                      </td>

                      {/* BUKTI DUKUNG */}
                      <td className="px-6 py-5">
                        {item.evidenceFileUrl ? (
                          <a
                            href={item.evidenceFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                            Lihat File
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">Belum tersedia</span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        {isWaitingKatimRevision ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            Perlu Revisi / Dikembalikan
                          </span>
                        ) : isRevised ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            Perlu Revisi / Dikembalikan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                            Menunggu Persetujuan Final
                          </span>
                        )}
                      </td>

                      {/* AKSI */}
                      <td className="px-6 py-5 text-right">
                        {isWaitingKatimRevision ? (
                          <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-md border border-slate-300 bg-slate-200 px-4 py-2 text-sm font-bold text-slate-400" aria-disabled="true">
                            <span className="material-symbols-outlined text-[16px]">lock</span>
                            Perlu Revisi / Dikembalikan
                          </span>
                        ) : (
                          <Link
                            href={`/validasi-kapokja/detail/${item.id}`}
                            className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            Tinjau Laporan Akhir
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
