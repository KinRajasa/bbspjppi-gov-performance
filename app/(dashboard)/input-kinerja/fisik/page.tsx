'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Indicator = { id: number; name: string; picName: string; sasaranName: string };
type Detail = { targetAnnual: string | null; unit: string; picName: string; planActivity: string; physicalTarget: string | null };
const periods = [
  { month: 3, quarter: 1, label: 'Maret (Akhir Triwulan I)' },
  { month: 6, quarter: 2, label: 'Juni (Akhir Triwulan II)' },
  { month: 9, quarter: 3, label: 'September (Akhir Triwulan III)' },
  { month: 12, quarter: 4, label: 'Desember (Akhir Triwulan IV)' },
];

export default function InputKinerjaFisikPage() {
  const router = useRouter();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [editSubmissionId, setEditSubmissionId] = useState('');
  const [requestedIndicatorId, setRequestedIndicatorId] = useState('');
  const [requestedQuarter, setRequestedQuarter] = useState('');
  const [indicatorId, setIndicatorId] = useState('');
  const [periodIndex, setPeriodIndex] = useState(0);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [narrative, setNarrative] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [constraints, setConstraints] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [physical, setPhysical] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const period = periods[periodIndex];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEditSubmissionId(params.get('edit') ?? '');
    setRequestedIndicatorId(params.get('indicatorId') ?? '');
    setRequestedQuarter(params.get('quarter') ?? '');
  }, []);

  useEffect(() => {
    fetch('/api/input-kinerja/indicators').then((response) => response.json()).then((result) => {
      const list = Array.isArray(result.data) ? result.data : [];
      setIndicators(list);
      const requested = requestedIndicatorId && list.find((item: Indicator) => String(item.id) === requestedIndicatorId);
      if (requested) setIndicatorId(String(requested.id));
      else if (!editSubmissionId && list[0]) setIndicatorId(String(list[0].id));
    }).catch(() => setMessage('Indikator belum tersedia.')).finally(() => setLoading(false));
  }, [requestedIndicatorId, editSubmissionId]);

  useEffect(() => {
    if (requestedQuarter && ['1', '2', '3', '4'].includes(requestedQuarter)) {
      setPeriodIndex(Number(requestedQuarter) - 1);
    }
  }, [requestedQuarter]);

  useEffect(() => {
    if (!editSubmissionId) return;
    fetch(`/api/validasi-data/${editSubmissionId}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => {
        if (!result.success || !result.data) throw new Error(result.message ?? 'Data revisi tidak ditemukan.');
        const data = result.data;
        const masterIndicatorId = data.ikuId ?? data.indicatorId;
        if (masterIndicatorId) setIndicatorId(String(masterIndicatorId));
        if (data.reportingQuarter >= 1 && data.reportingQuarter <= 4) setPeriodIndex(data.reportingQuarter - 1);
        setNarrative(data.realizationNarrative ?? '');
        setEvaluation(data.evaluation ?? '');
        setConstraints(data.constraints ?? '');
        setFollowUp(data.followUp ?? '');
        setPhysical(data.physicalRealization ?? '');
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Data revisi gagal dimuat.'));
  }, [editSubmissionId]);

  useEffect(() => {
    if (!indicatorId) return;
    setDetail(null);
    fetch(`/api/input-kinerja/indicator-details/${indicatorId}?quarter=${period.quarter}`).then((response) => response.json()).then((result) => setDetail(result.data ?? null)).catch(() => setMessage('Detail indikator gagal dimuat.'));
  }, [indicatorId, period.quarter]);

  const target = Number(detail?.physicalTarget ?? 0);
  const physicalNumber = physical === '' ? null : Number(physical.replace(',', '.'));
  const fulfilled = physicalNumber !== null && Number.isFinite(physicalNumber) && physicalNumber >= target;
  const needsConstraint = physicalNumber !== null && Number.isFinite(physicalNumber) && target > 0 && physicalNumber < target;
  const save = async () => {
    if (!indicatorId || !narrative.trim()) { setMessage('Realisasi kegiatan wajib diisi.'); return; }
    if (physicalNumber === null || !Number.isFinite(physicalNumber) || physicalNumber < 0 || physicalNumber > 100) { setMessage('Realisasi fisik harus berupa angka 0 sampai 100%.'); return; }
    if (needsConstraint && !constraints.trim()) { setMessage('Kendala wajib diisi karena realisasi fisik masih di bawah target.'); return; }
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/input-kinerja', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ indicatorId: Number(indicatorId), reportingMonth: period.month, quarter: period.quarter, realizationNarrative: narrative, evaluation, constraints, followUp, physicalRealization: physical }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Laporan gagal disimpan.');
      const nextParams = new URLSearchParams({
        indicatorId: indicatorId,
        quarter: String(period.quarter),
        submissionId: String(result.submissionId),
      });
      router.push(`/input-realisasi?${nextParams.toString()}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Laporan gagal disimpan.'); } finally { setSaving(false); }
  };

  return <div className="animation-fade-in w-full pb-10"><header className="mb-8 border-b border-slate-200 pb-5"><h2 className="text-3xl font-bold text-slate-800">Realisasi Fisik (Rencana Aksi)</h2><p className="mt-2 text-sm text-slate-500">Laporkan realisasi kegiatan dan capaian fisik periode berjalan.</p></header><div className="space-y-6">
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="mb-5 border-b border-slate-100 pb-4 text-lg font-bold text-slate-800">Tahap 1: Laporan Pelaksanaan & Evaluasi</h3>{editSubmissionId && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">Mode revisi aktif. Indikator dan periode mengikuti pengajuan yang dipilih.</div>}<div className="grid gap-5 md:grid-cols-3"><label className="text-sm font-semibold text-slate-600 md:col-span-2">Pilih Indikator<select value={indicatorId} disabled={loading || Boolean(editSubmissionId)} onChange={(event) => setIndicatorId(event.target.value)} className="mt-2 w-full rounded-md border border-slate-300 bg-white p-3 font-normal"><option value="">Pilih indikator</option>{indicators.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="text-sm font-semibold text-slate-600">Penanggung Jawab<input readOnly value={detail?.picName ?? ''} className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 p-3 font-bold" /></label><label className="text-sm font-semibold text-slate-600 md:col-span-3">Periode Pelaporan<select value={periodIndex} disabled={Boolean(editSubmissionId)} onChange={(event) => setPeriodIndex(Number(event.target.value))} className="mt-2 w-full rounded-md border border-slate-300 bg-white p-3 font-normal">{periods.map((item, index) => <option key={item.label} value={index}>{item.label}</option>)}</select></label></div><div className="mt-5 grid gap-5 md:grid-cols-2"><label className="text-sm font-semibold text-slate-600">Rencana Kegiatan {period.label}<textarea readOnly rows={5} value={detail?.planActivity ?? 'Belum ada rencana kegiatan.'} className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 p-3 font-normal" /></label><label className="text-sm font-semibold text-slate-600">Realisasi Kegiatan (Bulan Berjalan) *<textarea required rows={5} value={narrative} onChange={(event) => setNarrative(event.target.value)} className="mt-2 w-full rounded-md border border-slate-300 p-3 font-normal" /></label></div></section>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="mb-5 text-lg font-bold text-slate-800">Analisis & Tindak Lanjut Lapangan</h3><label className="block text-sm font-semibold text-slate-600">Evaluasi Pelaksanaan Kegiatan<textarea rows={6} value={evaluation} onChange={(event) => setEvaluation(event.target.value)} placeholder="Jelaskan evaluasi pelaksanaan kegiatan..." className="mt-2 min-h-[160px] w-full resize-y rounded-md border border-slate-300 p-3 font-normal" /></label><div className="mt-5 grid gap-5 md:grid-cols-2"><label className={`text-sm font-semibold ${needsConstraint ? 'text-rose-700' : 'text-slate-600'}`}>Kendala yang Dihadapi {needsConstraint && <span className="text-rose-600">*</span>}<textarea rows={5} required={needsConstraint} value={constraints} onChange={(event) => setConstraints(event.target.value)} placeholder={needsConstraint ? 'Wajib diisi karena realisasi di bawah target...' : 'Tuliskan kendala jika ada...'} className={`mt-2 min-h-[140px] w-full resize-y rounded-md border p-3 font-normal ${needsConstraint ? 'border-rose-300 bg-rose-50' : 'border-slate-300 bg-white'}`} />{needsConstraint && !constraints.trim() && <span className="mt-1 block text-xs font-medium text-rose-600">Isi kendala sebelum melanjutkan ke bukti dukung.</span>}</label><label className="text-sm font-semibold text-blue-700">Tindak Lanjut / Perbaikan<textarea rows={5} value={followUp} onChange={(event) => setFollowUp(event.target.value)} className="mt-2 min-h-[140px] w-full resize-y rounded-md border border-blue-200 bg-blue-50 p-3 font-normal" /></label></div></section>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="mb-5 border-b border-slate-100 pb-4 text-lg font-bold text-slate-800">Tahap 2: Capaian % Fisik</h3><div className="grid gap-5 md:grid-cols-2"><div className="rounded-md bg-slate-50 p-5"><p className="text-xs font-bold uppercase text-slate-500">Target Fisik ({period.label})</p><p className="mt-2 text-4xl font-black text-slate-800">{detail?.physicalTarget ?? '-'}%</p></div><label className="text-sm font-semibold text-slate-600">Realisasi % Fisik<input type="number" min="0" max="100" step="any" value={physical} onChange={(event) => setPhysical(event.target.value)} className="mt-2 w-full rounded-md border border-slate-300 p-3 text-2xl font-bold" /></label></div>{physical !== '' && <div className={`mt-5 rounded-md border p-4 font-bold ${fulfilled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>Status: Target Fisik {fulfilled ? 'Terpenuhi' : 'Belum Terpenuhi'}</div>}</section>
    <div className="flex items-center justify-between border-t border-slate-200 pt-5"><Link href="/input-kinerja" className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-600">Kembali</Link><div className="flex items-center gap-4">{message && <span className="text-sm text-rose-600">{message}</span>}<button onClick={save} disabled={saving || !detail || (needsConstraint && !constraints.trim())} className="rounded-md bg-slate-900 px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}</button></div></div>
  </div></div>;
}
