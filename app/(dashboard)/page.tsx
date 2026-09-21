'use client'; 

import { useEffect, useState } from 'react';

type DashboardIndicator = { id: number; code: string; indikator: string; pic: string; satuan: string; targetValue: number | null; realisasiValue: number | null; capaianPercentage: number; status: boolean; quarter: number | null };
type RencanaAksiIndicator = { id: number; name: string; pic: string; satuan: string; targetKumulatif: number; realisasiKumulatif: number; isOnTrack: boolean; hasData: boolean };
type RencanaAksiSummary = { avgRealisasi: number; targetCumulative: number; onTrack: number; delayed: number; total: number };

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardUtama() {
  const [activeTab, setActiveTab] = useState<'perjakin' | 'rencana_aksi'>('perjakin');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [budgetSummary, setBudgetSummary] = useState<{ paguAwal: number; paguRevisiTerakhir: number; anggaranBlokir: number; totalPaguEfektif: number; realisasiAnggaranAktual: number; persentaseRealisasi: number } | null>(null);
  const [dashboardIndicators, setDashboardIndicators] = useState<DashboardIndicator[]>([]);
  const [rencanaAksiIndicators, setRencanaAksiIndicators] = useState<RencanaAksiIndicator[]>([]);
  const [rencanaAksiSummary, setRencanaAksiSummary] = useState<RencanaAksiSummary>({ avgRealisasi: 0, targetCumulative: 100, onTrack: 0, delayed: 0, total: 0 });
  // New state for master IKU data (Tab 1)
  const [ikuData, setIkuData] = useState<Array<{ id: number; name: string; targetKumulatif: number; realisasiKumulatif: number; isOnTrack: boolean }>>([]);
  const [indicatorSearch, setIndicatorSearch] = useState('');
  const [indicatorStatus, setIndicatorStatus] = useState('all');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedQuarter, setSelectedQuarter] = useState(4);

  useEffect(() => {
    // Simpan filter aktif di URL agar tombol export pada Topbar memakai TA/TW
    // yang sedang dilihat Admin, bukan nilai default yang tersimpan di tombol.
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('year', String(selectedYear));
      params.set('quarter', String(selectedQuarter));
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
    // Batalkan request tahun/triwulan sebelumnya agar respons lama (mis. TA 2025)
    // tidak menimpa data yang baru dipilih pengguna (mis. TA 2026 TW IV).
    const controller = new AbortController();
    const requestInit = { signal: controller.signal };
    setDashboardIndicators([]);
    setIkuData([]);
    setRencanaAksiIndicators([]);
    setRencanaAksiSummary({ avgRealisasi: 0, targetCumulative: selectedQuarter * 25, onTrack: 0, delayed: 0, total: 0 });

    fetch(`/api/dashboard/budget-summary?year=${selectedYear}`, requestInit).then((res) => res.json()).then((result) => setBudgetSummary(result.data ?? null)).catch(() => undefined);
    const refresh = () => {
      fetch(`/api/dashboard/rencana-aksi?year=${selectedYear}&quarter=${selectedQuarter}`, requestInit).then((res) => res.json()).then((result) => {
        if (result.data?.year !== undefined && (result.data.year !== selectedYear || result.data.quarter !== selectedQuarter)) return;
        if (result.success && result.data) {
          setRencanaAksiIndicators(result.data.indicators ?? []);
          setRencanaAksiSummary(result.data.summary ?? { avgRealisasi: 0, targetCumulative: selectedQuarter * 25, onTrack: 0, delayed: 0, total: 0 });
        }
      }).catch(() => undefined);
      // Fetch master IKU data for Tab 1
      fetch(`/api/dashboard/capaian-iku?fiscalYear=${selectedYear}&quarter=${selectedQuarter}`, requestInit).then((res) => res.json()).then((result) => {
        const indicators = result.data?.indicators;
        if (result.success && result.data?.fiscalYear === selectedYear && result.data?.quarter === selectedQuarter && Array.isArray(indicators)) {
          setIkuData(indicators);
          setDashboardIndicators(indicators.map((row) => ({
            id: row.id,
            code: row.code,
            indikator: row.name,
            pic: row.pic,
            satuan: row.satuan,
            targetValue: row.targetValue,
            realisasiValue: row.realisasiValue,
            capaianPercentage: row.capaianPercentage,
            status: row.isOnTrack,
            quarter: row.quarter,
          })));
        }
      }).catch(() => undefined);
    };
    refresh();
    const timer = window.setInterval(refresh, 30000);
    return () => {
      window.clearInterval(timer);
      controller.abort();
    };
  }, [selectedYear, selectedQuarter]);

  const formatRupiah = (value: number) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
  const formatIndicatorValue = (value: number | null, unit: string) => value === null ? '-' : `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value)} ${unit}`;
  const filteredIndicators = dashboardIndicators.filter((row) => (!indicatorSearch || `${row.indikator} ${row.pic}`.toLowerCase().includes(indicatorSearch.toLowerCase())) && (indicatorStatus === 'all' || (indicatorStatus === 'met' ? row.status : !row.status)));
  // IKU tab calculations use master data
  const ikuAchievedCount = ikuData.filter((row) => row.isOnTrack).length;
  const ikuTotal = ikuData.length;
  const quarterRoman = ['I', 'II', 'III', 'IV'][selectedQuarter - 1] ?? 'IV';
  const quarterLabel = `TW ${quarterRoman}`;

  // Data 18 IKU (Ringkasan untuk Chart & Bar di Tab Perjakin)
  const dataIKU = [
    { id: 1, name: "1. IKM", score: "100.3%", color: "bg-emerald-500", width: "100%" },
    { id: 2, name: "2. Jml. Perusahaan Pengguna", score: "30.1%", color: "bg-rose-500", width: "30.1%" },
    { id: 3, name: "3. SLA Pelayanan", score: "99.6%", color: "bg-emerald-500", width: "99.6%" },
    { id: 4, name: "4. NPS", score: "73.0%", color: "bg-emerald-500", width: "73%" },
    { id: 5, name: "5. Indeks PNBP", score: "85.0%", color: "bg-rose-500", width: "85%" },
    { id: 6, name: "6. Jml. Hasil Layanan", score: "105.0%", color: "bg-emerald-500", width: "100%" },
    { id: 7, name: "7. ROA", score: "90.0%", color: "bg-emerald-500", width: "90%" },
    { id: 8, name: "8. POBO", score: "92.5%", color: "bg-emerald-500", width: "92.5%" },
    { id: 9, name: "9. IPASN", score: "100%", color: "bg-emerald-500", width: "100%" },
    { id: 10, name: "10. Penerapan SPBE", score: "98.0%", color: "bg-emerald-500", width: "98%" },
    { id: 11, name: "11. IPP", score: "60.0%", color: "bg-rose-500", width: "60%" },
    { id: 12, name: "12. Integrasi Data BSKJI", score: "110%", color: "bg-emerald-500", width: "100%" },
    { id: 13, name: "13. Tindak Lanjut Pengawasan", score: "100%", color: "bg-emerald-500", width: "100%" },
    { id: 14, name: "14. Nilai Kearsipan", score: "88.0%", color: "bg-rose-500", width: "88%" },
    { id: 15, name: "15. SAKIP", score: "95.0%", color: "bg-emerald-500", width: "95%" },
    { id: 16, name: "16. IKPA", score: "100%", color: "bg-emerald-500", width: "100%" },
    { id: 17, name: "17. Laporan Keuangan", score: "92.0%", color: "bg-emerald-500", width: "92%" },
    { id: 18, name: "18. Penggunaan PDN", score: "100%", color: "bg-emerald-500", width: "100%" },
  ];

  // Data 18 Rencana Aksi (Khusus Tab Rencana Aksi)
  const dataRencanaAksi = [
    { id: 1, name: "1. IKM", target: "50.0%", real: "50.0%", color: "bg-emerald-500", width: "50%" },
    { id: 2, name: "2. Jml. Perusahaan Pengguna", target: "50.0%", real: "45.0%", color: "bg-rose-500", width: "45%" },
    { id: 3, name: "3. SLA Pelayanan", target: "50.0%", real: "51.0%", color: "bg-emerald-500", width: "51%" },
    { id: 4, name: "4. NPS", target: "50.0%", real: "52.0%", color: "bg-emerald-500", width: "52%" },
    { id: 5, name: "5. Indeks PNBP", target: "50.0%", real: "48.0%", color: "bg-rose-500", width: "48%" },
    { id: 6, name: "6. Jml. Hasil Layanan", target: "50.0%", real: "55.0%", color: "bg-emerald-500", width: "55%" },
    { id: 7, name: "7. ROA", target: "50.0%", real: "53.0%", color: "bg-emerald-500", width: "53%" },
    { id: 8, name: "8. POBO", target: "50.0%", real: "50.5%", color: "bg-emerald-500", width: "50.5%" },
    { id: 9, name: "9. IPASN", target: "50.0%", real: "54.0%", color: "bg-emerald-500", width: "54%" },
    { id: 10, name: "10. Penerapan SPBE", target: "50.0%", real: "51.5%", color: "bg-emerald-500", width: "51.5%" },
    { id: 11, name: "11. IPP", target: "50.0%", real: "42.0%", color: "bg-rose-500", width: "42%" },
    { id: 12, name: "12. Integrasi Data BSKJI", target: "50.0%", real: "56.0%", color: "bg-emerald-500", width: "56%" },
    { id: 13, name: "13. Tindak Lanjut Pengawasan", target: "50.0%", real: "50.0%", color: "bg-emerald-500", width: "50%" },
    { id: 14, name: "14. Nilai Kearsipan", target: "50.0%", real: "58.0%", color: "bg-emerald-500", width: "58%" },
    { id: 15, name: "15. SAKIP", target: "50.0%", real: "50.0%", color: "bg-emerald-500", width: "50%" },
    { id: 16, name: "16. IKPA", target: "50.0%", real: "59.0%", color: "bg-emerald-500", width: "59%" },
    { id: 17, name: "17. Laporan Keuangan", target: "50.0%", real: "50.0%", color: "bg-emerald-500", width: "50%" },
    { id: 18, name: "18. Penggunaan PDN", target: "50.0%", real: "50.0%", color: "bg-emerald-500", width: "50%" },
  ];

  // Data Detail IKU untuk Modal Popup
  const detailDataIKU = [
    { id: 1, name: "IKM", pic: "Tim Kerja Pelayanan", target: "3.75 Indeks", real: "3.80 Indeks", cap: "100.3%", status: "MEMENUHI TARGET" },
    { id: 2, name: "Jumlah Perusahaan", pic: "Tim Kerja Pengembangan Jasa Industri", target: "990 Perusahaan", real: "298 Perusahaan", cap: "30.1%", status: "TIDAK MEMENUHI" },
    { id: 3, name: "SLA Layanan", pic: "Tim Kerja Pengembangan Jasa Industri", target: "90 Persen", real: "99.6 Persen", cap: "110.6%", status: "MEMENUHI TARGET" },
    { id: 4, name: "NPS", pic: "Tim Kerja Pengembangan Jasa Industri", target: "41.00", real: "73.00", cap: "178.0%", status: "MEMENUHI TARGET" },
    { id: 5, name: "Peningkatan PNBP", pic: "Kapokja Keuangan dan BMN", target: "Rp 21,3 Miliar", real: "Rp 15,2 Miliar", cap: "71.3%", status: "TIDAK MEMENUHI" },
    { id: 6, name: "Jumlah Hasil Layanan Jasa Industri", pic: "Tim Kerja Pengembangan Jasa Industri", target: "8.100 Hasil", real: "8.400 Hasil", cap: "103.7%", status: "MEMENUHI TARGET" },
    { id: 7, name: "ROA", pic: "Kapokja Keuangan dan BMN", target: "15 Persen", real: "16.5 Persen", cap: "110.0%", status: "MEMENUHI TARGET" },
    { id: 8, name: "POBO", pic: "Kapokja Keuangan dan BMN", target: "60 Persen", real: "55.5 Persen", cap: "92.5%", status: "MEMENUHI TARGET" },
    { id: 9, name: "IPASN", pic: "Tim Kerja SDM", target: "80.00", real: "82.50", cap: "103.1%", status: "MEMENUHI TARGET" },
    { id: 10, name: "SPBE", pic: "Tim Kerja IT", target: "3.50 Indeks", real: "3.85 Indeks", cap: "110.0%", status: "MEMENUHI TARGET" },
    { id: 11, name: "IPP", pic: "Tim Kerja Pelayanan", target: "4.64 Indeks", real: "4.64 Indeks", cap: "100.0%", status: "MEMENUHI TARGET" },
    { id: 12, name: "Integrasi Data BSKJI", pic: "Tim Kerja IT", target: "40 Persen", real: "24 Persen", cap: "60.0%", status: "TIDAK MEMENUHI" },
    { id: 13, name: "Tindak Lanjut Pengawasan", pic: "Tim Kerja Kepatuhan", target: "100 Persen", real: "88.0 Persen", cap: "88.0%", status: "TIDAK MEMENUHI" },
    { id: 14, name: "Nilai Kearsipan", pic: "Tim Kerja Umum", target: "73.00", real: "69.35", cap: "95.0%", status: "MEMENUHI TARGET" },
    { id: 15, name: "SAKIP", pic: "Tim Kerja Program", target: "79.45", real: "79.45", cap: "100.0%", status: "MEMENUHI TARGET" },
    { id: 16, name: "IKPA", pic: "Kapokja Keuangan dan BMN", target: "93.40", real: "85.92", cap: "92.0%", status: "MEMENUHI TARGET" },
    { id: 17, name: "Laporan Keuangan", pic: "Kapokja Keuangan dan BMN", target: "75.25", real: "75.25", cap: "100.0%", status: "MEMENUHI TARGET" },
    { id: 18, name: "Persentase Penggunaan Produk dalam Negeri", pic: "Tim Kerja Pengadaan", target: "81 Persen", real: "79.3 Persen", cap: "98.0%", status: "MEMENUHI TARGET" },
  ];

  // Data Pie Chart - Proporsi Status Kinerja
  const dataStatusKinerja = [
    { name: 'Tercapai', value: ikuAchievedCount, color: '#10b981' },
    { name: 'Tidak Tercapai', value: ikuTotal - ikuAchievedCount, color: '#f43f5e' },
  ];

  // Data Pie Chart - Deviasi Status
  const dataDeviasiStatus = [
    { name: 'On Track', value: rencanaAksiSummary.onTrack, color: '#10b981' },
    { name: 'Delayed', value: rencanaAksiSummary.delayed, color: '#f43f5e' },
  ];

  return (
    <>
      <header className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Eksekutif</h2>
            <p className="text-sm text-slate-500 mt-1">Pemantauan Kinerja & Rencana Aksi BBSPJPPI TA. {selectedYear}</p>
        </div>
        
      </header>

      <div className="space-y-8 relative">
        
        {/* TOGGLE & FILTER */}
        <div className="flex justify-between items-center">
          <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-max">
            <button 
              onClick={() => setActiveTab('perjakin')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'perjakin' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Capaian Perjakin (IKU)
            </button>
            <button 
              onClick={() => setActiveTab('rencana_aksi')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'rencana_aksi' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Progres Fisik Rencana Aksi
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-500">Tahun Anggaran:</label>
            <select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))} className="bg-white border border-slate-300 rounded-md px-4 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value={2025}>TA 2025</option>
              <option value={2026}>TA 2026</option>
            </select>
            <label className="text-sm text-slate-500">Periode:</label>
            <select value={selectedQuarter} onChange={(event) => setSelectedQuarter(Number(event.target.value))} className="bg-white border border-slate-300 rounded-md px-4 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value={1}>Triwulan I (Jan-Mar)</option>
              <option value={2}>Triwulan II (Apr-Jun)</option>
              <option value={3}>Triwulan III (Jul-Sep)</option>
              <option value={4}>Triwulan IV (Okt-Des)</option>
            </select>
          </div>
        </div>

        {/* ================================================= */}
        {/* KONTEN TAB                                        */}
        {/* ================================================= */}
        {activeTab === 'perjakin' ? (
          
          /* --- TAB 1: PERJAKIN --- */
          <div className="animation-fade-in space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center w-full mb-3">
                  <span className="text-sm font-medium text-slate-500">Pagu Awal</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><span className="material-symbols-outlined text-[18px]">history</span></div>
                </div>
                <span className="text-xl font-bold text-slate-800">{formatRupiah(budgetSummary?.paguAwal ?? 0)}</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center w-full mb-3">
                  <span className="text-sm font-medium text-slate-500">Pagu Revisi Terakhir</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><span className="material-symbols-outlined text-[18px]">account_balance</span></div>
                </div>
                <span className="text-xl font-bold text-slate-800">{formatRupiah(budgetSummary?.paguRevisiTerakhir ?? 0)}</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center w-full mb-3">
                  <span className="text-sm font-medium text-slate-500">Anggaran Blokir</span>
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500"><span className="material-symbols-outlined text-[18px]">lock</span></div>
                </div>
                <span className="text-xl font-bold text-rose-600">{formatRupiah(budgetSummary?.anggaranBlokir ?? 0)}</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center w-full mb-3">
                  <span className="text-sm font-medium text-slate-500">Pagu Efektif</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"><span className="material-symbols-outlined text-[18px]">payments</span></div>
                </div>
                <span className="text-xl font-bold text-emerald-600">{formatRupiah(budgetSummary?.totalPaguEfektif ?? 0)}</span>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-6">
              
              <div className="col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                  <h3 className="font-bold text-slate-800">Status Capaian 18 Indikator Kinerja</h3>
                  <button onClick={() => setShowDetailModal(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                    Lihat Detail
                  </button>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto pr-4 space-y-5 custom-scrollbar">
                  {dashboardIndicators.map((iku) => (
                    <div key={iku.id} className="flex items-center justify-between text-sm">
                      <div className="w-5/12 text-slate-700 text-right pr-4 truncate" title={`${iku.code} ${iku.indikator}`}><span className="font-bold">{iku.code}</span> {iku.indikator}</div>
                      <div className="w-6/12 bg-slate-100 h-3 rounded-full overflow-hidden"><div className={`${iku.status ? 'bg-emerald-500' : 'bg-rose-500'} h-3 rounded-full`} style={{ width: `${Math.min(Math.max(iku.capaianPercentage, 0), 100)}%` }}></div></div>
                      <div className={`w-1/12 text-right font-medium ${iku.status ? 'text-slate-700' : 'text-rose-600'}`}>{iku.capaianPercentage.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-slate-800 w-full border-b border-slate-100 pb-4 text-left">Proporsi Status Kinerja</h3>
                <div className="relative w-full h-56 mt-6">
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                    <span className="text-4xl font-bold text-slate-800">{ikuTotal}</span>
                    <span className="text-xs text-slate-500 mt-1">Total IKU</span>
                  </div>
                  <div className="relative z-10 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataStatusKinerja}
                          innerRadius={70}
                          outerRadius={95}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                          animationDuration={1000}
                        >
                          {dataStatusKinerja.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} IKU`]}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                          wrapperStyle={{ zIndex: 100 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="w-full mt-12 space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500"></div>
                      <span className="text-sm text-slate-600">Tercapai ({ikuTotal ? (ikuAchievedCount / ikuTotal * 100).toFixed(1) : '0'}%)</span>
                    </div>
                    <div className="text-right flex flex-col leading-tight"><span className="font-bold text-slate-800">{ikuAchievedCount}</span><span className="text-[10px] font-bold text-slate-500">IKU</span></div>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-rose-500"></div>
                      <span className="text-sm text-slate-600">Tidak Tercapai ({ikuTotal ? ((ikuTotal - ikuAchievedCount) / ikuTotal * 100).toFixed(1) : '0'}%)</span>
                    </div>
                    <div className="text-right flex flex-col leading-tight"><span className="font-bold text-slate-800">{ikuTotal - ikuAchievedCount}</span><span className="text-[10px] font-bold text-slate-500">IKU</span></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        ) : (
          
          /* --- TAB 2: RENCANA AKSI (FULL 18 BARIS OTOMATIS) --- */
          <div className="animation-fade-in">
             <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <span className="text-sm font-medium text-slate-500">Rata-Rata Fisik {quarterLabel}</span>
                <span className="text-3xl font-bold text-slate-800 mt-2">{rencanaAksiSummary.avgRealisasi.toFixed(1)}%</span>
                <span className="text-xs text-slate-400 mt-2">Target kumulatif: {rencanaAksiSummary.targetCumulative.toFixed(1)}%</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <span className="text-sm font-medium text-slate-500">Sesuai Jadwal (On Track)</span>
                <span className="text-3xl font-bold text-emerald-600 mt-2">{rencanaAksiSummary.onTrack} Kegiatan</span>
                <span className="text-xs text-slate-400 mt-2">Realisasi &ge; Target {quarterLabel}</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <span className="text-sm font-medium text-slate-500">Terdilay (Delayed)</span>
                <span className="text-3xl font-bold text-rose-600 mt-2">{rencanaAksiSummary.delayed} Kegiatan</span>
                <span className="text-xs text-slate-400 mt-2">Realisasi &lt; Target {quarterLabel}</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">Pemantauan Progres Fisik per Indikator ({quarterLabel})</h3>
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  
                  {/* Render dynamic indicators from API */}
                  {rencanaAksiIndicators.length === 0 ? (
                    <p className="text-center text-slate-500">Tidak ada data untuk triwulan ini.</p>
                  ) : (
                    rencanaAksiIndicators.map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border transition ${
                          !item.isOnTrack ? 'hover:bg-rose-50 border-rose-100' : 'hover:bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="w-2/5 text-sm font-semibold text-slate-700 truncate pr-4">{item.name}</div>
                        <div className="w-3/5 flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Target: {item.targetKumulatif.toFixed(1)}%</span>
                            <span className={`font-bold ${!item.hasData ? 'text-slate-400' : !item.isOnTrack ? 'text-rose-600' : 'text-emerald-600'}`}>{item.hasData ? `Real: ${item.realisasiKumulatif.toFixed(1)}%` : 'Belum ada data'}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full">
                            <div className={`${!item.hasData ? 'bg-slate-300' : !item.isOnTrack ? 'bg-rose-500' : 'bg-emerald-500'} h-2.5 rounded-full`} style={{ width: `${item.hasData ? Math.min(item.realisasiKumulatif, 100) : 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                </div>
              </div>

              <div className="col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-slate-800 w-full border-b border-slate-100 pb-4">Deviasi Status</h3>
                <div className="relative w-full h-52 mt-6">
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                      <span className="text-4xl font-bold text-slate-800">{rencanaAksiSummary.avgRealisasi.toFixed(1)}%</span>
                      <span className="text-xs text-slate-500 mt-1">Rata-Rata Fisik</span>
                    </div>
                    <div className="relative z-10 w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dataDeviasiStatus}
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            animationDuration={1000}
                          >
                            {dataDeviasiStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value} Kegiatan`]}
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                            wrapperStyle={{ zIndex: 100 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                <div className="w-full mt-12 space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm"></div>
                      <span className="text-sm font-medium text-slate-600">On Track (&ge; {rencanaAksiSummary.targetCumulative.toFixed(1)}%)</span>
                    </div>
                    <span className="font-bold text-slate-800">{rencanaAksiSummary.onTrack}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm"></div>
                      <span className="text-sm font-medium text-slate-600">Delayed (&lt; {rencanaAksiSummary.targetCumulative.toFixed(1)}%)</span>
                    </div>
                    <span className="font-bold text-slate-800">{rencanaAksiSummary.delayed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================= */}
      {/* MODAL OVERLAY: REKAPITULASI DETAIL IKU    */}
      {/* ========================================= */}
      {showDetailModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-8 animation-fade-in">
          
          <div className="bg-white w-full max-w-7xl rounded-xl shadow-2xl flex flex-col h-[90vh] overflow-hidden border border-slate-200">
            
            <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-start bg-white">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Rekapitulasi 18 Indikator Kinerja</h2>
                <p className="text-sm text-slate-500 mt-1">Periode: S.d Juli 2026 | Menampilkan perbandingan target dan realisasi seluruh divisi.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                  <input type="text" value={indicatorSearch} onChange={(event) => setIndicatorSearch(event.target.value)} placeholder="Cari Indikator atau PIC..." className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-64 outline-none focus:border-blue-500" />
                </div>
                <select value={indicatorStatus} onChange={(event) => setIndicatorStatus(event.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-600 outline-none focus:border-blue-500 bg-white">
                  <option value="all">Semua Status</option>
                  <option value="met">Memenuhi Target</option>
                  <option value="not-met">Tidak Memenuhi</option>
                </select>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-700 font-medium">{ikuAchievedCount} Memenuhi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                    <span className="text-sm text-slate-700 font-medium">{ikuTotal - ikuAchievedCount} Tidak Memenuhi</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-white p-8">
              <table className="w-full text-sm text-left">
                {/* HEAD TABEL DITAMBAHKAN DI SINI */}
                <thead className="bg-white border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 pr-4 font-bold w-12">No</th>
                    <th className="py-4 pr-4 font-bold w-1/4">Indikator Kinerja</th>
                    <th className="py-4 pr-4 font-bold w-1/5">Penanggung Jawab</th>
                    <th className="py-4 pr-4 font-bold">Target</th>
                    <th className="py-4 pr-4 font-bold">Realisasi</th>
                    <th className="py-4 pr-4 font-bold">Capaian</th>
                    <th className="py-4 font-bold text-right w-48">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIndicators.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 pr-4 text-slate-500 font-medium align-top">{index + 1}</td>
                      <td className={`py-5 pr-4 font-medium align-top ${item.status ? 'text-slate-800' : 'text-rose-600'}`}>
                        <span><strong>{item.code}</strong> {item.indikator}</span>
                      </td>
                      <td className="py-5 pr-4 text-slate-600 align-top">{item.pic || '-'}</td>
                      <td className={`py-5 pr-4 font-medium align-top ${item.status ? 'text-slate-800' : 'text-rose-600'}`}>{formatIndicatorValue(item.targetValue, item.satuan)}</td>
                      <td className={`py-5 pr-4 font-medium align-top ${item.status ? 'text-slate-800' : 'text-rose-600'}`}>
                        {formatIndicatorValue(item.realisasiValue, item.satuan)}
                      </td>
                      <td className={`py-5 pr-4 font-medium align-top ${item.status ? 'text-slate-800' : 'text-rose-600'}`}>
                        {item.capaianPercentage.toLocaleString('id-ID', { maximumFractionDigits: 2 })}%
                      </td>
                      <td className="py-5 text-right align-top">
                        {item.status ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-100/60 text-emerald-700 px-3 py-1.5 rounded-md text-xs font-bold border border-emerald-200">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span> MEMENUHI TARGET
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-rose-100/60 text-rose-700 px-3 py-1.5 rounded-md text-xs font-bold border border-rose-200">
                            <span className="material-symbols-outlined text-[14px]">warning</span> TIDAK MEMENUHI
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

    </>
  );
}
