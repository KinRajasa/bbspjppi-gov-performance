'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { normalizeRole, type AppRole } from '@/lib/rbac';

type Indicator = { id: number; name: string; target: string | null; unit: string; picName: string; sasaranName: string };
type Quarter = { quarter: number; target: string; activity: string };
type IndicatorDetail = Indicator & { targetTahunan: string | null; satuan: string; quarters: Quarter[] };

const colors = ['border-t-blue-500', 'border-t-sky-400', 'border-t-purple-500', 'border-t-emerald-500'];
const emptyQuarters = () => [1, 2, 3, 4].map((quarter) => ({ quarter, target: '25', activity: '' }));

export default function InputRencanaAksiPage() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState<IndicatorDetail | null>(null);
  const [quarters, setQuarters] = useState<Quarter[]>(emptyQuarters());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState<AppRole | null>(null);
  const canEdit = role === 'ADMIN';

  useEffect(() => {
    const roleCookie = document.cookie.split('; ').find((item) => item.startsWith('userRole='))?.split('=')[1];
    setRole(normalizeRole(decodeURIComponent(roleCookie ?? '')));
    fetch('/api/action-plans/indicators').then((res) => res.json()).then((result) => {
      const list = Array.isArray(result.data) ? result.data : [];
      setIndicators(list); if (list[0]) setSelectedId(String(list[0].id));
    }).catch(() => setMessage('Indikator belum tersedia.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    setMessage('');
    fetch(`/api/action-plans/indicator-details/${selectedId}`).then((res) => res.json()).then((result) => {
      if (!result.data) return;
      setDetail(result.data);
      const loadedQuarters = result.data.quarters as Quarter[];
      // Data yang sudah tersimpan tetap dipertahankan agar mode edit tidak menimpa input lama.
      // Untuk rencana aksi baru, bobot fisik 100% dibagi rata ke empat triwulan.
      const hasSavedTarget = loadedQuarters.some((item) => String(item.target ?? '').trim() !== '');
      setQuarters(hasSavedTarget ? loadedQuarters : emptyQuarters().map((item, index) => ({ ...item, activity: loadedQuarters[index]?.activity ?? '' })));
    }).catch(() => setMessage('Detail indikator gagal dimuat.'));
  }, [selectedId]);

  const cumulative = useMemo(() => quarters.reduce((sum, item) => sum + (Number(String(item.target).replace(',', '.')) || 0), 0), [quarters]);
  const isComplete = Math.abs(cumulative - 100) < 0.000001;
  const updateQuarter = (quarter: number, field: 'target' | 'activity', value: string) => setQuarters((items) => items.map((item) => item.quarter === quarter ? { ...item, [field]: value } : item));
  const save = async () => {
    if (!selectedId || !isComplete) return;
    setSaving(true); setMessage('');
    try {
      const payload: any = { indicatorId: Number(selectedId), quarters };
      const res = await fetch('/api/action-plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Rencana aksi gagal disimpan.');
    } finally {
      setSaving(false);
    }
  };

  return <div className="animation-fade-in w-full pb-10"><header className="mb-8 border-b border-slate-200 pb-5"><h2 className="text-2xl font-bold text-slate-800">Input Rencana Aksi Tahunan</h2><p className="text-sm text-slate-500 mt-1">Tetapkan progres fisik dan rincian rencana kegiatan untuk setiap triwulan.</p></header>
    <div className="space-y-8"><section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"><div className="flex items-center gap-2 mb-6"><span className="material-symbols-outlined text-blue-500">info</span><h3 className="font-bold text-slate-700 text-lg">Informasi Indikator & Penugasan</h3></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-xs font-bold text-slate-600 mb-2">Pilih Indikator Kinerja</label><select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={loading || indicators.length === 0} className="w-full border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white font-medium"><option value="">-- Pilih indikator --</option>{indicators.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{detail && <p className="text-xs font-medium text-blue-600 mt-2">Target Tahunan: {detail.targetTahunan ?? '-'} {detail.satuan}</p>}</div>          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Penanggung Jawab (PIC)</label>
            <input
              readOnly
              value={detail?.picName ?? ''}
              placeholder="PIC belum ditetapkan di Master IKU"
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold rounded-md px-4 py-2.5 outline-none"
            />
          </div></div></section>
      <section><h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 inline-block">Rincian Rencana Kegiatan per Triwulan</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{quarters.map((item, index) => <div key={item.quarter} className={`bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 ${colors[index]} p-6 flex flex-col`}><div className="flex justify-between items-center mb-6"><h4 className="text-xl font-bold text-slate-800">Triwulan {['I', 'II', 'III', 'IV'][index]}</h4><label className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500">Target Fisik (%):<input disabled={!canEdit} value={item.target} onChange={(event) => updateQuarter(item.quarter, 'target', event.target.value.replace(/[^\d,.-]/g, ''))} className="w-20 bg-transparent text-right font-bold text-slate-800 outline-none disabled:cursor-not-allowed" inputMode="decimal" aria-label={`Target fisik triwulan ${index + 1} dalam persen`} /><span>%</span></label></div><label className="text-xs font-bold text-slate-600 mb-2">Rencana Kegiatan</label><textarea disabled={!canEdit} rows={5} value={item.activity} onChange={(event) => updateQuarter(item.quarter, 'activity', event.target.value)} className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-700 outline-none focus:border-blue-500 leading-relaxed disabled:cursor-not-allowed" placeholder="Masukkan rincian kegiatan..." /></div>)}</div><p className={`mt-3 text-sm ${isComplete ? 'text-emerald-600' : 'text-rose-600'}`}>{isComplete ? `Total akumulasi target fisik: ${cumulative.toLocaleString('id-ID', { maximumFractionDigits: 6 })}% (Valid).` : `Total akumulasi target fisik: ${cumulative.toLocaleString('id-ID', { maximumFractionDigits: 6 })}% (Harus tepat 100%).`}</p></section>
      <div className="flex justify-between items-center pt-4 border-t border-slate-200"><Link href="/perjanjian-kinerja" className="px-6 py-2.5 rounded-md text-sm font-bold text-slate-600 border border-slate-300 bg-white">Kembali</Link><div className="flex items-center gap-4">{message && <span className="text-sm text-slate-600">{message}</span>}{canEdit && <button onClick={save} disabled={saving || !detail || !isComplete} className="px-6 py-2.5 rounded-md text-sm font-bold text-white bg-slate-800 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Rencana Aksi'}</button>}</div></div>
    </div></div>;
}
