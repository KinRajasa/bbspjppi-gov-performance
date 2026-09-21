'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { cleanIndicatorName } from '@/lib/clean-indicator-name';

type QueueItem = {
  id: number;
  submittedAt: string;
  pic: string;
  sasaranName: string;
  indicator: { code: string; name: string };
  reportingQuarter: number | null;
  status: string;
  revisionNote: string | null;
  evidenceFileUrl: string | null;
  isLocked: boolean;
};

type Summary = {
  pending: number;
  revised: number;
  approvedThisMonth: number;
};

const revisedStatuses = new Set([
  'REVISI_KATIM',
  'REVISION_BY_KATIM',
  'DITOLAK_KATIM',
  'REVISION_BY_KAPOKJA',
  'REVISION_REQUIRED_BY_KAPOKJA',
]);

const statusLabel = (status: string) => {
  if (status === 'REVISION_REQUIRED_BY_KAPOKJA') return 'Validasi Katim (Revisi Kapokja)';
  if (status === 'REVISION_BY_KAPOKJA') return 'Validasi Katim (Revisi Kapokja)';
  if (status === 'REVISION_REQUIRED_BY_KATIM' || status === 'REVISION_BY_KATIM' || status === 'DITOLAK_KATIM') return 'Perlu Revisi PIC / Dikembalikan';
  return 'Menunggu Review';
};

export default function ValidasiDataPage() {
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
    fetch('/api/validations/queue')
      .then((response) => response.json())
      .then((result) => {
        if (!result.success) throw new Error(result.message);
        // Guard sisi client juga: satu submission hanya boleh muncul sekali
        // walaupun backend menerima respons berulang saat refresh.
        const uniqueItems = Array.from(
          new Map((result.data ?? []).map((item: QueueItem) => [item.id, item])).values(),
        ) as QueueItem[];
        setItems(uniqueItems);
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

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesSearch =
          !search ||
          `${item.pic} ${item.indicator.code} ${cleanIndicatorName(item.indicator.name)}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesFilter =
          filter === 'all' ||
          (filter === 'pending' && !revisedStatuses.has(item.status)) ||
          (filter === 'revised' && revisedStatuses.has(item.status));
        return matchesSearch && matchesFilter;
      }),
    [items, search, filter]
  );

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
      <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
              Tahap 1
            </span>
            <span className="text-xs text-slate-400">Verifikasi Ketua Tim</span>
          </div>
          <h2 className="mt-1 text-3xl font-bold text-slate-800">Antrean Validasi</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tinjau laporan Input Realisasi & Bukti Dukung dari PIC sebelum diteruskan ke Kapokja.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/validasi-kapokja"
            className="rounded-lg border border-purple-300 bg-purple-50 px-3.5 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition"
          >
            Buka Validasi Kapokja →
          </Link>
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Menunggu Validasi</p>
            <p className="mt-1 text-2xl font-black text-slate-800">{summary.pending} Laporan</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <span className="material-symbols-outlined">assignment_return</span>
          </div>
          <div>
            <p className="text-sm font-medium text-rose-600">Revisi dari Pimpinan / Kapokja</p>
            <p className="mt-1 text-2xl font-black text-rose-600">{summary.revised} Laporan</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <span className="material-symbols-outlined">task_alt</span>
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-600">Telah Disetujui (Bulan Ini)</p>
            <p className="mt-1 text-2xl font-black text-emerald-600">
              {summary.approvedThisMonth} Laporan
            </p>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50/60 p-4 md:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari PIC atau indikator..."
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 md:w-80"
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
          >
            <option value="all">Semua Antrean</option>
            <option value="pending">Menunggu Review</option>
            <option value="revised">Revisi</option>
          </select>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Memuat antrean...</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-rose-600">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Belum ada data sesuai filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-white">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600">Waktu Submit</th>
                  <th className="px-6 py-4 font-bold text-slate-600">PIC / Divisi</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Indikator Kinerja</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Bukti Dukung</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const revised = revisedStatuses.has(item.status);
                  const waitingPicRevision = item.status === 'REVISION_REQUIRED_BY_KATIM' || item.status === 'REVISION_BY_KATIM' || item.status === 'REVISI_KATIM' || item.status === 'DITOLAK_KATIM';
                  const kapokjaRevision = item.status === 'REVISION_REQUIRED_BY_KAPOKJA' || item.status === 'REVISION_BY_KAPOKJA';
                  return (
                    <tr key={item.id} className="align-top hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-5 text-slate-600">
                        {formatDate(item.submittedAt)}
                      </td>
                      <td className="px-6 py-5 font-medium text-slate-800">{item.pic}</td>
                      <td className="px-6 py-5">
                        <p className="mb-1 text-xs text-slate-400">
                          {item.sasaranName || 'Sasaran Kegiatan'}
                        </p>
                        <p className="font-bold text-slate-800">
                          {cleanIndicatorName(item.indicator.name)}
                        </p>
                        {revised && item.revisionNote && (
                          <div className="mt-2 rounded-md border border-rose-200 bg-rose-50/70 p-2.5 text-xs text-rose-700">
                            <span className="font-bold">Catatan:</span> {item.revisionNote}
                          </div>
                        )}
                      </td>
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
                      <td className="px-6 py-5">
                        {waitingPicRevision ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            {statusLabel(item.status)}
                          </span>
                        ) : kapokjaRevision ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            {statusLabel(item.status)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            {statusLabel(item.status)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right space-x-2">
                        {item.status === 'REVISION_REQUIRED_BY_KAPOKJA' ? (
                          <>
                            <Link
                              href={`/validasi-katim/detail/${item.id}`}
                              className="inline-flex rounded-md px-4 py-2 text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 transition"
                            >
                              Tinjau Revisi
                            </Link>
                            <button
                              onClick={async () => {
                                if (!confirm('Kirim ulang laporan ini ke Kapokja?')) return;
                                try {
                                  const response = await fetch(`/api/validasi-kapokja/resend-to-katim/${item.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                  });
                                  const result = await response.json();
                                  if (result.success) {
                                    alert('Laporan berhasil dikirim ulang ke Kapokja.');
                                    load();
                                  } else {
                                    alert(result.message);
                                  }
                                } catch (e) {
                                  alert('Gagal mengirim ulang ke Kapokja.');
                                }
                              }}
                              className="inline-flex rounded-md px-4 py-2 text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            >
                              Kirim Ulang ke Kapokja
                            </button>
                          </>
                        ) : !item.isLocked && !waitingPicRevision ? (
                          <Link
                            href={`/validasi-katim/detail/${item.id}`}
                            className="inline-flex rounded-md px-4 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition"
                          >
                            Tinjau Detail
                          </Link>
                        ) : (
                          <span className="inline-flex cursor-not-allowed rounded-md border border-slate-300 bg-slate-200 px-4 py-2 text-sm font-bold text-slate-400" aria-disabled="true">
                            Perlu Revisi PIC / Dikembalikan
                          </span>
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
