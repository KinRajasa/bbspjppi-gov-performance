'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Submission = {
  id: number;
  date: string;
  indicator: { id: number; code: string; name: string; unit: string };
  pic: string;
  quarter: number;
  physicalRealization: string;
  status: string;
  revisionNote: string | null;
  lastReviewNote: string | null;
  targetValue: string | null;
  realizationValue: string | null;
};

type FiscalYear = {
  id: number;
  year: number;
};

export default function RiwayatPengajuanPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeModalNote, setActiveModalNote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = (yearId: number = selectedYear, quarter: number = selectedQuarter) => {
    setLoading(true);
    setLoadError('');
    const params = new URLSearchParams();
    if (yearId > 0) params.set('fiscalYearId', String(yearId));
    if (quarter > 0) params.set('quarter', String(quarter));

    fetch(`/api/riwayat-pengajuan?${params.toString()}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok || !body.success) throw new Error(body.message || 'Riwayat pengajuan gagal dimuat.');
        return body;
      })
      .then((res) => {
        setSubmissions(Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(res.fiscalYears)) setFiscalYears(res.fiscalYears);
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : 'Riwayat pengajuan gagal dimuat.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedYear > 0 || selectedQuarter > 0) {
      loadData(selectedYear, selectedQuarter);
    }
  }, [selectedYear, selectedQuarter]);

  const handleResendRevision = async (submissionId: number) => {
    if (!confirm('Kirim ulang laporan yang sudah diperbaiki ke Katim?')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/validasi-data/resend-revision/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Laporan berhasil dikirim ulang ke Katim.');
        loadData(selectedYear, selectedQuarter);
      } else {
        alert(data.message || 'Gagal mengirim ulang laporan.');
      }
    } catch (error) {
      alert('Terjadi kesalahan. Silakan coba lagi.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MENUNGGU_BUKTI':
        return <span className="bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full text-xs font-bold">Menunggu Bukti Dukung</span>;
      case 'SUBMITTED_TO_KATIM':
      case 'MENUNGGU_VALIDASI_KATIM':
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold">Menunggu Katim</span>;
      case 'REVISION_REQUIRED_BY_KATIM':
      case 'REVISION_BY_KATIM':
      case 'DITOLAK_KATIM':
        return <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-xs font-bold">Perlu Revisi Katim</span>;
      case 'SUBMITTED_TO_KAPOKJA':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold">Menunggu Kapokja</span>;
      case 'REVISION_REQUIRED_BY_KAPOKJA':
      case 'REVISION_BY_KAPOKJA':
        return <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-xs font-bold">Perlu Revisi Kapokja</span>;
      case 'APPROVED':
      case 'PUBLISHED':
      case 'DISETUJUI':
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">Disetujui & Dipublikasi</span>;
      case 'DRAFT':
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">Draft</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="animation-fade-in w-full pb-10">
      <header className="mb-8 border-b border-slate-200 pb-5">
        <h2 className="text-3xl font-bold text-slate-800">Riwayat Pengajuan Kinerja</h2>
        <p className="mt-2 text-sm text-slate-500">Pantau status validasi dari laporan kinerja yang telah Anda kirimkan.</p>
      </header>

      {/* Filter Section */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-600 mb-2">Tahun Anggaran</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-md px-4 py-2 text-sm"
          >
            <option value={0}>Semua Tahun</option>
            {fiscalYears.map((fy) => (
              <option key={fy.id} value={fy.id}>{fy.year}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-600 mb-2">Triwulan</label>
          <select 
            value={selectedQuarter} 
            onChange={(e) => setSelectedQuarter(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-md px-4 py-2 text-sm"
          >
            <option value={0}>Semua Triwulan</option>
            <option value={1}>Triwulan I (Jan-Mar)</option>
            <option value={2}>Triwulan II (Apr-Jun)</option>
            <option value={3}>Triwulan III (Jul-Sep)</option>
            <option value={4}>Triwulan IV (Okt-Des)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loadError && <div className="m-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{loadError}</div>}
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="p-4">Tanggal Pengajuan</th>
              <th className="p-4">Indikator Kinerja</th>
              <th className="p-4">PIC</th>
              <th className="p-4">Periode</th>
              <th className="p-4">Progres Fisik</th>
              <th className="p-4">Status Saat Ini</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">Memuat data...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">Belum ada riwayat pengajuan.</td></tr>
            ) : (
              submissions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="p-4 text-slate-600">{s.date ? new Date(s.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                  <td className="p-4 font-semibold text-slate-800">{s.indicator.name}</td>
                  <td className="p-4 text-slate-600">{s.pic}</td>
                  <td className="p-4 text-slate-600">TW {s.quarter}</td>
                  <td className="p-4 font-bold text-slate-700">{s.physicalRealization}%</td>
                  <td className="p-4">{getStatusBadge(s.status)}</td>
                  <td className="p-4 flex items-center gap-2 flex-wrap">
                    {s.status === 'MENUNGGU_BUKTI' && (
                      <Link 
                        href={`/input-realisasi?physicalSubmissionId=${s.id}&quarter=${s.quarter}`} 
                        className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold px-3 py-1.5 rounded transition"
                      >
                        Unggah Bukti
                      </Link>
                    )}
                    {(s.status === 'REVISION_REQUIRED_BY_KATIM' || s.status === 'REVISION_BY_KATIM') && (
                      <>
                        <Link href={`/input-kinerja/fisik?edit=${s.id}&indicatorId=${s.indicator.id}&quarter=${s.quarter}`} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded transition">
                          Perbaiki
                        </Link>
                        <button 
                          onClick={() => handleResendRevision(s.id)}
                          disabled={submitting}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded transition disabled:opacity-50"
                        >
                          Kirim Ulang
                        </button>
                      </>
                    )}
                    {(s.revisionNote || s.lastReviewNote) && (
                      <button onClick={() => setActiveModalNote(s.revisionNote || s.lastReviewNote)} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded transition">
                        Lihat Catatan
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {activeModalNote && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Catatan Revisi</h3>
            <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">{activeModalNote}</p>
            <div className="flex justify-end">
              <button onClick={() => setActiveModalNote(null)} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
