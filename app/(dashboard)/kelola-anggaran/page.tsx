'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type BudgetForm = {
  initialCeilingAmount: string;
  latestRevisionCeilingAmount: string;
  blockedAmount: string;
  rupiahMurniAmount: string;
  pnbpAmount: string;
  financialTargetPct: string;
  spendingActualAmount: string;
  pnbpTargetAmount: string;
  pnbpActualAmount: string;
};

const empty: BudgetForm = { initialCeilingAmount: '', latestRevisionCeilingAmount: '', blockedAmount: '', rupiahMurniAmount: '', pnbpAmount: '', financialTargetPct: '', spendingActualAmount: '', pnbpTargetAmount: '', pnbpActualAmount: '' };
const numberValue = (value: string) => Number(value.replace(/\./g, '').replace(',', '.')) || 0;
const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Math.max(0, value));
const percent = (value: number) => `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value)}%`;
const cleanMoney = (value: string) => value.replace(/[^\d,.-]/g, '');
const formatMoneyInput = (value: string) => {
  if (!value.trim()) return '';
  const parsed = numberValue(value);
  return parsed === 0 && !/[1-9]/.test(value) ? '0' : rupiah(parsed);
};

type FieldProps = { label: string; field: keyof BudgetForm; form: BudgetForm; setField: (key: keyof BudgetForm) => (value: string) => void; tone?: string };
function MoneyField({ label, field, form, setField, tone = 'text-slate-700' }: FieldProps) {
  return <label className="flex flex-col gap-2 text-xs font-semibold text-slate-500"><span>{label}</span><span className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500"><span className="px-3 py-2 bg-slate-50 border-r border-slate-200">Rp</span><input value={form[field]} onChange={(event) => setField(field)(cleanMoney(event.target.value))} onBlur={() => setField(field)(formatMoneyInput(form[field]))} className={`w-full px-3 py-2 text-sm outline-none ${tone}`} inputMode="numeric" placeholder="41.767.656.000" /></span></label>;
}
function PercentField({ label, field, form, setField }: FieldProps) {
  return <label className="flex flex-col gap-2 text-xs font-semibold text-slate-500"><span>{label}</span><span className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-blue-500"><input value={form[field]} onChange={(event) => setField(field)(cleanMoney(event.target.value))} className="w-full px-3 py-2 text-sm outline-none" inputMode="decimal" placeholder="47,43" /><span className="px-3 py-2 bg-slate-50 border-l border-slate-200">%</span></span></label>;
}

export default function KelolaAnggaranPage() {
  const [form, setForm] = useState<BudgetForm>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/budget?year=2026').then((res) => res.json()).then((result) => {
      if (!result.data) return;
      const a = result.data.allocation; const r = result.data.realization ?? {};
      setForm({ initialCeilingAmount: a.initialCeilingAmount == null ? '' : rupiah(a.initialCeilingAmount), latestRevisionCeilingAmount: a.latestRevisionCeilingAmount == null ? '' : rupiah(a.latestRevisionCeilingAmount), blockedAmount: a.blockedAmount == null ? '' : rupiah(a.blockedAmount), rupiahMurniAmount: a.rupiahMurniAmount == null ? '' : rupiah(a.rupiahMurniAmount), pnbpAmount: a.pnbpAmount == null ? '' : rupiah(a.pnbpAmount), financialTargetPct: r.financialTargetPct == null ? '' : String(r.financialTargetPct), spendingActualAmount: r.spendingActualAmount == null ? '' : rupiah(r.spendingActualAmount), pnbpTargetAmount: r.pnbpTargetAmount == null ? '' : rupiah(r.pnbpTargetAmount), pnbpActualAmount: r.pnbpActualAmount == null ? '' : rupiah(r.pnbpActualAmount) });
    }).catch(() => setMessage('Data anggaran belum tersedia.')).finally(() => setLoading(false));
  }, []);

  const setField = (key: keyof BudgetForm) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  const summary = useMemo(() => {
    const revised = numberValue(form.latestRevisionCeilingAmount); const blocked = numberValue(form.blockedAmount); const actual = numberValue(form.spendingActualAmount); const effective = revised - blocked;
    return { effective, actual, againstRevision: revised ? actual / revised * 100 : 0, againstEffective: effective ? actual / effective * 100 : 0, pnbpPct: numberValue(form.pnbpTargetAmount) ? numberValue(form.pnbpActualAmount) / numberValue(form.pnbpTargetAmount) * 100 : 0 };
  }, [form]);

  const save = async () => {
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/budget', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ year: 2026, reportingMonth: 12, ...form }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message); setMessage(result.message);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Gagal menyimpan anggaran.'); } finally { setSaving(false); }
  };

  const EffectiveField = () => <label className="flex flex-col gap-2 text-xs font-semibold text-slate-500"><span>Total Pagu Efektif</span><span className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-slate-50"><span className="px-3 py-2 border-r border-slate-200">Rp</span><input value={rupiah(summary.effective)} readOnly className="w-full px-3 py-2 text-sm outline-none text-emerald-600 font-bold" /></span></label>;
  return <div className="animation-fade-in w-full pb-10"><header className="mb-8 border-b border-slate-200 pb-5"><h2 className="text-3xl font-bold text-slate-800">Kelola Anggaran & Realisasi Keuangan</h2><p className="text-sm text-slate-500 mt-2">Input dan pembaruan posisi Pagu DIPA, Realisasi Belanja, dan Penerimaan PNBP.</p></header>
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8"><h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Tabel 1: Posisi Pagu DIPA BBSPJPPI</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><MoneyField form={form} setField={setField} label="Pagu DIPA Awal" field="initialCeilingAmount" /><MoneyField form={form} setField={setField} label="Pagu Revisi Terakhir" field="latestRevisionCeilingAmount" /><MoneyField form={form} setField={setField} label="Blokir" field="blockedAmount" tone="text-rose-600" /><EffectiveField /><MoneyField form={form} setField={setField} label="Sumber Anggaran: Rupiah Murni" field="rupiahMurniAmount" /><MoneyField form={form} setField={setField} label="Sumber Anggaran: PNBP" field="pnbpAmount" /></div></section>
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8"><h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Tabel 2: Realisasi Anggaran (Belanja)</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-6"><PercentField form={form} setField={setField} label="Target Keuangan" field="financialTargetPct" /><MoneyField form={form} setField={setField} label="Realisasi Anggaran Aktual" field="spendingActualAmount" tone="text-blue-600" /></div><div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4"><h4 className="text-center font-bold text-slate-800">Persentase Realisasi Keuangan</h4><div className="flex justify-between border-b pb-2"><span>Terhadap Total Pagu</span><strong>{percent(summary.againstRevision)}</strong></div><div className="flex justify-between"><span>Terhadap Pagu Efektif</span><strong className="text-emerald-600">{percent(summary.againstEffective)}</strong></div></div></div></section>
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8"><h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Tabel 3: Capaian Penerimaan PNBP</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><MoneyField form={form} setField={setField} label="Target PNBP" field="pnbpTargetAmount" /><MoneyField form={form} setField={setField} label="Penerimaan PNBP Aktual" field="pnbpActualAmount" tone="text-emerald-600" /><div className="flex flex-col justify-end"><span className="text-xs font-semibold text-slate-500">Realisasi Penerimaan</span><span className="text-2xl font-bold text-emerald-600 mt-2">{percent(summary.pnbpPct)}</span></div></div></section>
      <div className="flex justify-between items-center pt-2"><div>{message && <p className="text-sm text-slate-600">{message}</p>}{loading && <p className="text-sm text-slate-500">Memuat data...</p>}</div><div className="flex gap-4"><Link href="/" className="px-8 py-2.5 rounded-md text-sm font-bold text-slate-600 border border-slate-300 bg-white">Batal</Link><button onClick={save} disabled={saving || loading} className="px-6 py-2.5 rounded-md text-sm font-bold text-white bg-slate-800 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Perubahan Anggaran'}</button></div></div>
    </div></div>;
}
