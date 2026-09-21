'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cleanIndicatorName } from '@/lib/clean-indicator-name';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type QuarterValue = {
  quarter: number;
  targetValue: string | null;
  realizationValue: string | null;
  evidenceFileUrl: string | null;
  sourceSyncRunId: number | null;
};

type ReviewEntry = {
  id: number;
  reviewStage: string;
  decision: string;
  note: string | null;
  reviewedAt: string;
};

type Detail = {
  id: number;
  status: string;
  sasaranName: string;
  reportingMonth: number | null;
  reportingQuarter: number | null;
  realizationNarrative: string | null;
  evaluation: string | null;
  constraints: string | null;
  followUp: string | null;
  physicalRealization: string | null;
  evidenceFileUrl: string | null;
  revisionNote: string | null;
  indicator: { code: string; name: string; unit: string | null };
  submittedBy: { name: string } | null;
  values: QuarterValue[];
  reviews?: ReviewEntry[];
};

const QUARTER_LABELS = ['I', 'II', 'III', 'IV'] as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatNumber(value: string | null): string {
  if (value === null) return 'Belum tersedia';
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 6 }).format(num);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ValidasiDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<Detail | null>(null);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  /* ---- Fetch detail ---- */
  useEffect(() => {
    fetch(`/api/validasi-data/${id}`)
      .then((response) => response.json())
      .then((result) => {
        if (!result.success) throw new Error(result.message);
        setData(result.data);
      })
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : 'Detail gagal dimuat.')
      );
  }, [id]);

  /* ---- Review action ---- */
  const review = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !note.trim()) {
      setMessage('Catatan revisi wajib diisi saat menolak laporan.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`/api/validasi-data/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      router.push('/validasi-katim');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Validasi gagal diproses.');
    } finally {
      setSaving(false);
    }
  };

  /* ---- Loading / error ---- */
  if (!data) {
    return (
      <div className="p-8 text-sm text-slate-600">
        {message || 'Memuat detail laporan...'}
      </div>
    );
  }

  /* ---- Derived values ---- */
  const quarter = data.reportingQuarter ?? 1;
  const quarterLabel = QUARTER_LABELS[quarter - 1] ?? quarter;
  const unit = data.indicator.unit ?? 'Satuan belum diatur';
  const isWaitingPicRevision = data.status === 'REVISION_REQUIRED_BY_KATIM' || data.status === 'REVISION_BY_KATIM';

  // Data Aktual IKU: only values that originate from Google Sheets sync
  const actualIkuValue = data.values.find(
    (v) => v.quarter === quarter && v.sourceSyncRunId !== null
  );

  // If no sync-sourced value for this quarter, fall back to any value for this quarter
  const quarterValue = actualIkuValue ?? data.values.find((v) => v.quarter === quarter);

  return (
    <div className="animation-fade-in w-full pb-10">
      {/* ============================================================
          HEADER
      ============================================================= */}
      <header className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-5">
        <Link
          href="/validasi-katim"
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>

        <div>
          <h2 className="text-2xl font-bold text-slate-800">Review Laporan Kinerja</h2>
          <p className="mt-1 text-sm text-slate-500">{cleanIndicatorName(data.indicator.name)}</p>
          <p className="hidden mt-1 text-sm text-slate-500">
            {data.indicator.code} – {data.indicator.name}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ==========================================================
            LEFT PANEL (2/3)
        =========================================================== */}
        <div className="space-y-6 lg:col-span-2">
          {/* ---- INFO PIC / PERIODE / STATUS ---- */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">PIC</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {data.submittedBy?.name ?? 'PIC'}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Periode</p>
                <p className="mt-1 font-semibold text-slate-800">
                  Triwulan {quarterLabel}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Status</p>
                <p className="mt-1 font-semibold text-amber-700">{data.status}</p>
              </div>
            </div>
          </section>

          {/* ---- DATA KUALITATIF ---- */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-bold text-slate-800">Data Kualitatif</h3>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Realisasi Kegiatan
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {data.realizationNarrative || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Evaluasi</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {data.evaluation || '-'}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border-l-4 border-rose-500 bg-rose-50 p-4">
                  <p className="text-sm font-bold text-rose-700">Kendala</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-rose-700">
                    {data.constraints || '-'}
                  </p>
                </div>

                <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                  <p className="text-sm font-bold text-blue-700">Tindak Lanjut</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-blue-700">
                    {data.followUp || '-'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ---- RIWAYAT REVIEW (jika ada) ---- */}
          {data.reviews && data.reviews.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-800">Riwayat Review</h3>

              <div className="space-y-3">
                {data.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`rounded-lg border p-4 ${
                      rev.decision === 'APPROVED'
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-bold ${
                          rev.decision === 'APPROVED'
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {rev.reviewStage} ·{' '}
                        {rev.decision === 'APPROVED' ? 'Disetujui' : 'Dikembalikan'}
                      </span>
                      <span className="text-slate-500">{formatDate(rev.reviewedAt)}</span>
                    </div>
                    {rev.note && (
                      <p className="mt-2 text-sm text-slate-700">{rev.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ==========================================================
            RIGHT SIDEBAR (1/3)
        =========================================================== */}
        <aside className="space-y-6">
          {/* ---- DATA AKTUAL IKU (dari Excel / Google Sheets) ---- */}
          <section className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-600">
                table_chart
              </span>
              <h3 className="text-lg font-bold text-slate-800">Data Aktual IKU</h3>
            </div>

            <p className="mb-4 rounded-md bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
              Sumber: Sinkronisasi Excel/Google Sheets (read-only)
            </p>

            <div className="space-y-4">
              {/* Target Aktual */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target
                </p>
                <p className="text-3xl font-black text-slate-700">
                  {formatNumber(quarterValue?.targetValue ?? null)}
                </p>
                <p className="mt-1 text-xs text-slate-500">{unit}</p>
              </div>

              {/* Realisasi Aktual */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Realisasi
                </p>
                <p className="text-3xl font-black text-emerald-600">
                  {formatNumber(quarterValue?.realizationValue ?? null)}
                </p>
                <p className="mt-1 text-xs text-emerald-700">{unit}</p>
              </div>
            </div>

            {!actualIkuValue && (
              <p className="mt-3 text-xs text-amber-600">
                ⚠ Data belum disinkronisasi dari Excel untuk triwulan ini.
              </p>
            )}
          </section>

          {/* ---- CAPAIAN FISIK (dari Input PIC) ---- */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-indigo-600">
                trending_up
              </span>
              <h3 className="text-lg font-bold text-slate-800">Capaian Fisik</h3>
            </div>

            <p className="mb-4 rounded-md bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700">
              Sumber: Input manual PIC (operasional)
            </p>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-sm text-slate-500">Realisasi Fisik</span>
              <strong className="text-lg text-indigo-600">
                {data.physicalRealization !== null
                  ? `${formatNumber(data.physicalRealization)}%`
                  : '-'}
              </strong>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Progres operasional dalam satuan Persen (%). Target tahunan = 100% dibagi 4
              triwulan.
            </p>
          </section>

          {/* ---- BUKTI DUKUNG ---- */}
          {data.evidenceFileUrl && (
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Bukti Dukung</h3>
              <a
                href={data.evidenceFileUrl}
                target="_blank"
                rel="noreferrer"
                className="block break-all rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                <span className="material-symbols-outlined mr-1 align-middle text-[16px]">
                  open_in_new
                </span>
                Lihat bukti dukung
              </a>
            </section>
          )}

          {/* ---- CATATAN REVISI SEBELUMNYA ---- */}
          {data.revisionNote && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs font-bold text-rose-700">Catatan Revisi Sebelumnya:</p>
              <p className="mt-1 text-sm text-rose-700">{data.revisionNote}</p>
            </div>
          )}

          {/* ---- KEPUTUSAN KATIM ---- */}
          <section className="rounded-xl border-2 border-blue-500 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-800">Keputusan Katim</h3>

            {isWaitingPicRevision && (
              <div className="mb-4 rounded-lg border border-slate-300 bg-slate-100 p-3 text-sm font-semibold text-slate-600">
                <span className="material-symbols-outlined mr-1 align-middle">lock</span>
                Perlu Revisi PIC / Dikembalikan. Aksi Katim dikunci sampai PIC mengirim ulang.
              </div>
            )}

            <label className="text-sm font-semibold text-slate-600">
              Catatan review
              <textarea
                rows={5}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={isWaitingPicRevision}
                placeholder="Wajib diisi jika laporan ditolak/revisi"
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 font-normal"
              />
            </label>

            {message && <p className="mt-4 text-sm text-rose-600">{message}</p>}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => review('reject')}
                disabled={saving || isWaitingPicRevision}
                className="rounded-lg border border-rose-500 px-3 py-3 text-sm font-bold text-rose-600 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-400"
              >
                Tolak / Revisi
              </button>

              <button
                onClick={() => review('approve')}
                disabled={saving || isWaitingPicRevision}
                className="rounded-lg bg-emerald-600 px-3 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                Setujui
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
