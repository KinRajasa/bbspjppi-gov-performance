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
  reviewer: { id: number; name: string; email: string };
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
  fiscalYear?: { year: number } | null;
  submittedBy: { id: number; name: string; email: string } | null;
  values: QuarterValue[];
  reviews?: ReviewEntry[];
  katimReview?: {
    reviewerName: string;
    decision: string;
    note: string | null;
    reviewedAt: string;
  } | null;
  isLocked?: boolean;
};

const QUARTER_LABELS = ['I', 'II', 'III', 'IV'] as const;

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

export default function ValidasiKapokjaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<Detail | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/validasi-kapokja/${id}`)
      .then((response) => response.json())
      .then((result) => {
        if (!result.success) throw new Error(result.message);
        setData(result.data);
      })
      .catch((error) =>
        setErrorMessage(error instanceof Error ? error.message : 'Detail gagal dimuat.')
      );
  }, [id]);

  /* ---- Aksi Setujui & Publikasikan (Final) ---- */
  const handleApprove = async () => {
    if (!confirm('Apakah Anda yakin ingin MENYETUJUI & MEMPUBLIKASIKAN laporan kinerja ini ke Dashboard Eksekutif? Laporan akan resmi dikunci.')) {
      return;
    }

    setSaving(true);
    setMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/validasi-kapokja/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          note: approvalNote.trim() || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setMessage(result.message);
      // Tunggu 1.5 detik lalu kembali ke antrean
      setTimeout(() => {
        router.push('/validasi-kapokja');
      }, 1200);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Persetujuan gagal diproses.');
    } finally {
      setSaving(false);
    }
  };

  /* ---- Aksi Tolak / Revisi ---- */
  const handleRejectSubmit = async () => {
    if (!revisionNote.trim()) {
      setErrorMessage('Catatan revisi wajib diisi agar PIC/Katim mengetahui perbaikan yang diperlukan.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const response = await fetch(`/api/validasi-kapokja/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          note: revisionNote.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setRejectModalOpen(false);
      setMessage(result.message);
      setTimeout(() => {
        router.push('/validasi-kapokja');
      }, 1200);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Penolakan gagal diproses.');
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="p-12 text-center text-sm text-slate-600">
        <span className="material-symbols-outlined animate-spin align-middle mr-2">autorenew</span>
        {errorMessage || 'Memuat detail tinjauan laporan Kapokja...'}
      </div>
    );
  }

  const quarter = data.reportingQuarter ?? 1;
  const quarterLabel = QUARTER_LABELS[quarter - 1] ?? quarter;
  const unit = data.indicator.unit ?? 'Satuan belum diatur';

  // Nilai Aktual dari Excel
  const actualIkuValue = data.values.find(
    (v) => v.quarter === quarter && v.sourceSyncRunId !== null
  );
  const quarterValue = actualIkuValue ?? data.values.find((v) => v.quarter === quarter);

  const isApproved = data.status === 'APPROVED';
  const isWaitingKatimRevision = data.status === 'REVISION_REQUIRED_BY_KAPOKJA';

  return (
    <div className="animation-fade-in w-full pb-10">
      {/* ============================================================
          HEADER
      ============================================================= */}
      <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/validasi-kapokja"
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 transition"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800">
                Persetujuan Pimpinan (Tahap 2)
              </span>
              {isApproved && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                  Data Terkunci (Locked)
                </span>
              )}
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-800">Tinjauan Akhir Laporan Kinerja</h2>
            <p className="mt-0.5 text-sm text-slate-500">{cleanIndicatorName(data.indicator.name)}</p>
            <p className="hidden mt-0.5 text-sm text-slate-500">
              {data.indicator.code} – {data.indicator.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status Saat Ini:</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isApproved
                ? 'bg-emerald-100 text-emerald-800'
              : isWaitingKatimRevision
                ? 'bg-slate-100 text-slate-600'
              : data.status === 'REVISION_BY_KAPOKJA'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-purple-100 text-purple-800'
            }`}
          >
            {isWaitingKatimRevision ? 'Perlu Revisi / Dikembalikan' : data.status}
          </span>
        </div>
      </header>

      {/* NOTIFIKASI PESAN SUKSES / ERROR */}
      {message && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          {message}
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-600">error</span>
          {errorMessage}
        </div>
      )}

      {/* BANNER DATA TERKUNCI JIKA SUDAH APPROVED */}
      {isApproved && (
        <div className="mb-6 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-emerald-600">lock</span>
            <div>
              <h4 className="text-base font-bold text-emerald-900">
                Laporan Kinerja Resmi Disetujui Final & Dikunci (Locked)
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Data realisasi fisik dan capaian aktual telah dipublikasikan ke Dashboard Eksekutif pimpinan. Laporan ini tidak dapat diubah kembali.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ==========================================================
            KOLOM KIRI (2/3): INFORMASI, KUALITATIF, & CATATAN KATIM
        =========================================================== */}
        <div className="space-y-6 lg:col-span-2">
          {/* ---- CARD 1: INFORMASI UMUM ---- */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">PIC Penginput</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {data.submittedBy?.name ?? 'PIC'}
                </p>
                <p className="text-xs text-slate-400">{data.submittedBy?.email ?? '-'}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Periode Pelaporan</p>
                <p className="mt-1 font-semibold text-slate-800">
                  Triwulan {quarterLabel} (TA {data.fiscalYear?.year ?? '2026'})
                </p>
                <p className="text-xs text-slate-400">Bulan ke-{data.reportingMonth ?? '-'}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Sasaran Kegiatan</p>
                <p className="mt-1 text-xs font-semibold text-slate-700 leading-snug line-clamp-2">
                  {data.sasaranName}
                </p>
              </div>
            </div>
          </section>

          {/* ---- CARD 2: CATATAN & VERIFIKASI KATIM (REFERENSI PIMPINAN) ---- */}
          <section className="rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-emerald-600">verified</span>
              <h3 className="text-base font-bold text-emerald-900">
                Verifikasi Tahap 1: Rekomendasi Ketua Tim (Katim)
              </h3>
            </div>

            {data.katimReview ? (
              <div className="rounded-lg border border-emerald-200 bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Ditinjau oleh: {data.katimReview.reviewerName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(data.katimReview.reviewedAt)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-700 mb-1">
                  Keputusan: Disetujui di Tahap 1
                </p>
                <p className="whitespace-pre-wrap text-sm text-slate-700">
                  {data.katimReview.note || 'Ketua Tim telah memvalidasi kelengkapan fisik, data aktual IKU, dan dokumen bukti dukung.'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Laporan ini diajukan langsung atau verifikasi Katim tercatat otomatis.
              </p>
            )}
          </section>

          {/* ---- CARD 3: DATA KUALITATIF ---- */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">description</span>
              Data Kualitatif Kegiatan
            </h3>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Realisasi Kegiatan
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  {data.realizationNarrative || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Evaluasi Pelaksanaan</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  {data.evaluation || '-'}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border-l-4 border-rose-500 bg-rose-50 p-4">
                  <p className="text-xs font-bold uppercase text-rose-700">Kendala yang Dihadapi</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-rose-800">
                    {data.constraints || 'Tidak ada kendala'}
                  </p>
                </div>

                <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase text-blue-700">Rencana Tindak Lanjut</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-blue-800">
                    {data.followUp || 'Tidak ada tindak lanjut khusus'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ---- CARD 4: TIMELINE RIWAYAT REVIEW LENGKAP ---- */}
          {data.reviews && data.reviews.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500">history</span>
                Riwayat Validasi & Review
              </h3>

              <div className="space-y-3">
                {data.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`rounded-lg border p-4 ${
                      rev.decision === 'APPROVED'
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-rose-200 bg-rose-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-bold ${
                          rev.decision === 'APPROVED' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        Tahap {rev.reviewStage} · {rev.reviewer.name} (
                        {rev.decision === 'APPROVED' ? 'Disetujui' : 'Revisi/Ditolak'})
                      </span>
                      <span className="text-slate-400">{formatDate(rev.reviewedAt)}</span>
                    </div>
                    {rev.note && (
                      <p className="mt-2 text-xs text-slate-700 whitespace-pre-wrap bg-white/70 p-2.5 rounded border border-slate-200/50">
                        {rev.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ==========================================================
            KOLOM KANAN (1/3): DUALITAS DATA, BUKTI, & KEPUTUSAN KAPOKJA
        =========================================================== */}
        <aside className="space-y-6">
          {/* ---- BAGIAN 1: DATA AKTUAL IKU (DARI EXCEL SYNC) ---- */}
          <section className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-600">table_chart</span>
              <h3 className="text-base font-bold text-slate-800">Bagian 1: Data Aktual IKU</h3>
            </div>

            <p className="mb-4 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
              Ditarik dari Excel / Google Sheets (Read-Only)
            </p>

            <div className="space-y-3">
              {/* Target Aktual */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Triwulan {quarterLabel}
                </p>
                <p className="text-3xl font-black text-slate-800">
                  {formatNumber(quarterValue?.targetValue ?? null)}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{unit}</p>
              </div>

              {/* Realisasi Aktual */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Realisasi Riil Triwulan {quarterLabel}
                </p>
                <p className="text-3xl font-black text-emerald-600">
                  {formatNumber(quarterValue?.realizationValue ?? null)}
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-700">{unit}</p>
              </div>
            </div>
          </section>

          {/* ---- BAGIAN 2: DATA FISIK (DARI INPUT PIC) ---- */}
          <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-indigo-600">trending_up</span>
              <h3 className="text-base font-bold text-slate-800">Bagian 2: Capaian Fisik</h3>
            </div>

            <p className="mb-4 rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
              Diinput manual oleh PIC (Operasional)
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Realisasi Fisik Triwulan {quarterLabel}
              </p>
              <p className="text-3xl font-black text-indigo-600 mt-1">
                {data.physicalRealization !== null
                  ? `${formatNumber(data.physicalRealization)}%`
                  : '-'}
              </p>
              <p className="mt-2 text-[11px] text-slate-400">
                Satuan mutlak Persen (%). Target tahunan selalu 100% dibagi 4 Triwulan.
              </p>
            </div>
          </section>

          {/* ---- BAGIAN 3: BUKTI DUKUNG ---- */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-600">attachment</span>
              <h3 className="text-base font-bold text-slate-800">Bagian 3: Bukti Dukung</h3>
            </div>

            {data.evidenceFileUrl ? (
              <a
                href={data.evidenceFileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg bg-blue-50 p-3.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition break-all"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                Buka Dokumen Bukti Dukung
              </a>
            ) : (
              <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                Belum ada berkas atau tautan bukti dukung yang dilampirkan.
              </div>
            )}
          </section>

          {/* ---- BAGIAN 4: KEPUTUSAN KAPOKJA (ACTION PANEL) ---- */}
          <section className="rounded-xl border-2 border-purple-500 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600">gavel</span>
              Keputusan Kapokja (Pimpinan)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Persetujuan final akan mempublikasikan data ke Dashboard Eksekutif dan mengunci data dari perubahan.
            </p>

            {isWaitingKatimRevision ? (
              <div className="rounded-lg border border-slate-300 bg-slate-100 p-4 text-center text-sm font-bold text-slate-600">
                <span className="material-symbols-outlined mr-1 align-middle">lock</span>
                Perlu Revisi / Dikembalikan ke Katim. Aksi Kapokja dikunci.
              </div>
            ) : isApproved ? (
              <div className="rounded-lg bg-emerald-50 p-4 text-center text-sm font-bold text-emerald-700">
                ✓ Laporan Sudah Disetujui Final
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Catatan Persetujuan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    placeholder="Masukkan catatan apresiasi atau arahan pimpinan..."
                    className="mt-1.5 w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRevisionNote('');
                      setRejectModalOpen(true);
                    }}
                    disabled={saving}
                    className="rounded-lg border-2 border-rose-500 px-3 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition"
                  >
                    Tolak / Revisi
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={saving}
                    className="rounded-lg bg-emerald-600 px-3 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
                  >
                    {saving ? 'Memproses...' : 'Setujui & Publikasikan'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>

      {/* ============================================================
          MODAL CATATAN REVISI KAPOKJA
      ============================================================= */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animation-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold">
                <span className="material-symbols-outlined">assignment_return</span>
                <h3>Kembalikan Laporan untuk Revisi</h3>
              </div>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-500">
                Laporan ini akan dikembalikan ke antrean Katim dan PIC untuk diperbaiki. Berikan rincian bagian mana yang harus direvisi.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Catatan Revisi dari Kapokja <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Jelaskan alasan pengembalian, poin koreksi narasi, atau bukti dukung tambahan yang diperlukan..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-rose-500"
                  required
                />
              </div>

              {errorMessage && <p className="text-xs text-rose-600">{errorMessage}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={saving || !revisionNote.trim()}
                className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition"
              >
                {saving ? 'Mengembalikan...' : 'Kirim Catatan & Kembalikan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
