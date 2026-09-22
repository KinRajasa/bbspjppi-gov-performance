'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cleanIndicatorName } from '@/lib/clean-indicator-name';
import { Building2, CheckCircle2, FileText, Paperclip, TrendingUp } from 'lucide-react';

type Report = {
  id: number;
  status: string;
  reportingQuarter: number | null;
  reportingMonth?: number | null;
  sasaranName?: string | null;
  physicalRealization: string | null;
  realizationNarrative: string | null;
  evaluation: string | null;
  constraints: string | null;
  followUp: string | null;
  revisionNote: string | null;
  evidenceFileUrl: string | null;
  indicator: { code: string; name: string; unit: string | null };
  submittedBy: { name: string; email: string } | null;
  fiscalYear: { year: number };
  values: { quarter: number; targetValue: string | null; realizationValue: string | null; evidenceFileUrl: string | null; sourceSyncRunId: number | null }[];
  reviews: { note: string | null; reviewedAt: string; decision: string }[];
};

export default function DetailValidasiPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) { setError('ID laporan tidak valid.'); setLoading(false); return; }
    fetch(`/api/validasi-data/${id}`, { cache: 'no-store' })
      .then(async (res) => { const body = await res.json(); if (!res.ok || !body.success) throw new Error(body.message || 'Laporan tidak ditemukan.'); return body.data; })
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : 'Laporan tidak ditemukan.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const review = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !note.trim()) { setError('Catatan wajib diisi saat meminta revisi.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/validasi-data/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, note }) });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || 'Validasi gagal.');
      router.push('/validasi-katim'); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Validasi gagal.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat laporan...</div>;
  if (error || !report) return <div className="p-10"><Link href="/validasi-katim" className="text-blue-600 hover:underline">← Kembali</Link><p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error || 'Laporan dengan ID tersebut tidak ditemukan.'}</p></div>;

  const quarter = report.reportingQuarter ?? 1;
  const quarterLabel = ['I', 'II', 'III', 'IV'][quarter - 1] ?? String(quarter);
  const quarterValue = report.values?.find((value) => value.quarter === quarter);
  return <div className="animation-fade-in w-full pb-10">
    <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center"><div className="flex items-center gap-4"><Link href="/validasi-katim" className="rounded-full p-2 text-slate-600 hover:bg-slate-100">←</Link><div><span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">Persetujuan Katim</span><h1 className="mt-2 text-2xl font-bold text-slate-800">Tinjauan Laporan Kinerja</h1><p className="mt-1 text-sm text-slate-500">{cleanIndicatorName(report.indicator.name)}</p></div></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{report.status}</span></header>
    {report.revisionNote && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><b>Catatan revisi:</b> {report.revisionNote}</div>}
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-12 space-y-5 lg:col-span-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-3"><Info label="PIC Penginput" value={report.submittedBy?.name ?? 'Tidak diketahui'} sub={report.submittedBy?.email}/><Info label="Periode Pelaporan" value={`Triwulan ${quarterLabel} (TA ${report.fiscalYear.year})`} sub={`Bulan ke-${report.reportingMonth ?? '-'}`} /><Info label="Sasaran Kegiatan" value={report.sasaranName || 'Sasaran Kegiatan'} /></div></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5"><h2 className="flex items-center text-base font-bold text-emerald-900"><CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600"/>Verifikasi Tahap 1: Rekomendasi Ketua Tim (Katim)</h2>{report.reviews?.length ? <div className="mt-3 rounded-xl border border-emerald-100 bg-white/80 p-4"><div className="flex justify-between text-xs font-medium text-slate-500"><span>Ditinjau oleh: Ketua Tim</span><span>{new Date(report.reviews[0].reviewedAt).toLocaleString('id-ID')}</span></div><p className="mt-2 text-xs font-bold text-slate-700">Keputusan: <span className={report.reviews[0].decision === 'APPROVED' ? 'text-emerald-700' : 'text-rose-700'}>{report.reviews[0].decision === 'APPROVED' ? 'Disetujui di Tahap 1' : 'Perlu Revisi'}</span></p><p className="mt-1 whitespace-pre-wrap text-xs text-slate-600">{report.reviews[0].note || 'Tidak ada catatan.'}</p></div> : <p className="mt-3 text-xs italic text-slate-500">Dalam proses peninjauan Katim.</p>}</div>
        <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold text-slate-800"><FileText className="h-5 w-5 text-blue-600"/>Data Kualitatif Kegiatan</h2><ReadOnlyField label="Realisasi Kegiatan" value={report.realizationNarrative}/><ReadOnlyField label="Evaluasi Pelaksanaan" value={report.evaluation}/><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className="rounded-r-lg border-l-4 border-red-500 bg-rose-50/70 p-4"><p className="mb-2 text-xs font-bold tracking-wider text-red-700">KENDALA YANG DIHADAPI</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-red-800">{report.constraints || 'Tidak ada kendala.'}</p></div><div className="rounded-r-lg border-l-4 border-blue-500 bg-blue-50/70 p-4"><p className="mb-2 text-xs font-bold tracking-wider text-blue-700">RENCANA TINDAK LANJUT</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-800">{report.followUp || 'Tidak ada tindak lanjut khusus.'}</p></div></div></div>
        {report.reviews?.length > 0 && <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 font-bold text-slate-800">Riwayat Validasi & Review</h2>{report.reviews.map((review, index) => <div key={index} className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"><b>{review.decision === 'APPROVED' ? 'Disetujui' : 'Perlu Revisi'}</b><p className="mt-1 text-slate-600">{review.note || '-'}</p></div>)}</div>}
      </section>
      <aside className="col-span-12 space-y-5 lg:col-span-4"><section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 font-bold text-slate-800"><Building2 className="h-5 w-5 text-blue-600"/>Bagian 1: Data Aktual IKU</h2><p className="inline-block w-full rounded-lg bg-blue-50/70 px-3 py-1.5 text-xs font-medium text-blue-600">Ditarik dari Excel / Google Sheets (Read-Only)</p><div className="rounded-lg bg-slate-50 p-4 text-center"><p className="text-xs font-bold uppercase text-slate-500">Target Triwulan {quarterLabel}</p><p className="text-3xl font-black text-slate-800">{quarterValue?.targetValue ?? 'Belum tersedia'}</p><p className="text-xs text-slate-500">{report.indicator.unit ?? '-'}</p></div><div className="rounded-lg bg-emerald-50 p-4 text-center"><p className="text-xs font-bold uppercase text-emerald-700">Realisasi Riil Triwulan {quarterLabel}</p><p className="text-3xl font-black text-emerald-600">{quarterValue?.realizationValue ?? 'Belum tersedia'}</p><p className="text-xs text-emerald-700">{report.indicator.unit ?? '-'}</p></div></section><section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 font-bold text-slate-800"><TrendingUp className="h-5 w-5 text-blue-600"/>Bagian 2: Capaian Fisik</h2><p className="inline-block w-full rounded-lg bg-blue-50/70 px-3 py-1.5 text-xs font-medium text-blue-600">Diinput manual oleh PIC (Operasional)</p><div className="rounded-lg bg-indigo-50 p-5 text-center"><p className="text-xs font-bold uppercase text-indigo-700">Realisasi Fisik Triwulan {quarterLabel}</p><p className="mt-1 text-4xl font-black text-indigo-600">{report.physicalRealization ?? '-'}%</p><p className="mt-2 text-[11px] text-indigo-700">Satuan mutlak Persen (%). Target tahunan selalu 100% dibagi 4 Triwulan.</p></div></section><section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 font-bold text-slate-800"><Paperclip className="h-5 w-5 text-slate-600"/>Bagian 3: Bukti Dukung</h2>{report.evidenceFileUrl ? <a href={report.evidenceFileUrl} target="_blank" rel="noreferrer" className="block rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700 hover:bg-blue-100">Buka Dokumen Bukti Dukung ↗</a> : <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">Belum ada berkas atau tautan bukti dukung yang dilampirkan.</p>}</section><section className="space-y-4 rounded-2xl border-2 border-blue-500 bg-white p-5 shadow-sm"><h2 className="mb-1 font-bold text-slate-800">Keputusan Katim</h2><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} placeholder="Catatan revisi (wajib saat menolak)" className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500" />{error && <p className="mt-2 text-xs text-rose-600">{error}</p>}<div className="grid grid-cols-2 gap-2"><button disabled={saving} onClick={() => review('reject')} className="rounded-lg border-2 border-rose-500 px-3 py-3 text-sm font-bold text-rose-600 disabled:opacity-50">Tolak / Minta Revisi</button><button disabled={saving} onClick={() => review('approve')} className="rounded-lg bg-emerald-600 px-3 py-3 text-sm font-bold text-white disabled:opacity-50">Setujui / Teruskan</button></div></section></aside>
    </div>
  </div>;
}

function Field({ label, value }: { label: string; value: string | null }) { return <div><p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{value || '-'}</p></div>; }
function ReadOnlyField({ label, value }: { label: string; value: string | null }) { return <div><p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p><div className="flex min-h-[48px] items-center rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-sm text-slate-700"><span className="whitespace-pre-wrap">{value || '-'}</span></div></div>; }
function Info({ label, value, sub }: { label: string; value: string; sub?: string }) { return <div><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p>{sub && <p className="text-xs text-slate-400">{sub}</p>}</div>; }
