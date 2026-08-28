'use client';

import Link from 'next/link';

export default function RiwayatPengajuanPage() {
  // Data dummy dilengkapi dengan field untuk laporan cetak (Target, Realisasi, Evaluasi, Kendala)
  const tableData = [
    {
      id: 1,
      tanggal: '18 Ags 2026, 09:30',
      periode: 'Triwulan II',
      sasaran: 'Meningkatnya kualitas dan kuantitas layanan jasa industri',
      indikator: '1.1 - Indeks Kepuasan Masyarakat (IKM)',
      target: '3.68 Indeks',
      realisasi: '3.74 Indeks',
      evaluasi: 'Penyebaran kuesioner kepada 183 pelanggan. Hasil analisa IKM secara akumulasi bulan Januari-Juni adalah sebesar 3,74.',
      kendala: 'Masih sedikitnya jumlah pelanggan yang mengisi kuesioner yang di blasting melalui WA dan e-mail.',
      tindakLanjut: 'Melakukan strategi proaktif untuk menarik minat pelanggan di loket penerimaan sampel.',
      pic: 'Dyah AF (PIC Umum)',
      status: 'DISETUJUI KAPOKJA (SELESAI)',
      statusColor: 'emerald',
      icon: 'check_circle',
      action: 'Lihat Detail',
      actionType: 'link'
    },
    {
      id: 2,
      tanggal: '17 Ags 2026, 14:15',
      periode: 'Triwulan II',
      sasaran: 'Terwujudnya layanan jasa industri yang profesional',
      indikator: '2.1 - Persentase pelayanan tepat waktu (SLA)',
      target: '88.50 Persen',
      realisasi: '99.50 Persen',
      evaluasi: 'SLA layanan rata-rata mencapai di atas 95% untuk kalibrasi dan pengujian.',
      kendala: 'Terdapat layanan berdurasi panjang yang belum selesai sehingga belum bisa dihitung.',
      tindakLanjut: 'Memastikan monitoring berkala terhadap layanan dengan SLA khusus.',
      pic: 'Dyah AF (PIC Umum)',
      status: 'REVISI DARI KATIM',
      statusColor: 'rose',
      icon: 'assignment_return',
      action: 'Perbaiki Data',
      actionType: 'button',
      catatanRevisi: 'Tolong perbaiki angka realisasi pada Triwulan II, sepertinya tidak sesuai dengan dokumen kuitansi.'
    },
    {
      id: 3,
      tanggal: '18 Ags 2026, 11:00',
      periode: 'Triwulan II',
      sasaran: 'Terwujudnya layanan jasa industri yang mandiri',
      indikator: '3.1 - Indeks peningkatan PNBP',
      target: '3 Indeks',
      realisasi: '3.5 Indeks',
      evaluasi: 'Penerimaan PNBP BBSPJPPI sampai dengan bulan Juni 2026 sebesar Rp. 8.376.976.815.',
      kendala: 'Adanya kompetitor dengan layanan sejenis dan harga lebih murah.',
      tindakLanjut: 'Meningkatkan promosi dan perluasan ruang lingkup pengujian.',
      pic: 'Misbakhul Anam (Keuangan)',
      status: 'MENUNGGU REVIEW KATIM',
      statusColor: 'amber',
      icon: 'pending',
      action: 'Lihat Detail',
      actionType: 'link'
    }
  ];

  return (
    <div className="animation-fade-in w-full pb-10 flex flex-col min-h-[90vh] print:bg-white print:pb-0">
      
      {/* 🛑 CSS KHUSUS PRINT: Memaksa Kertas Menjadi Landscape & Margin Tipis 🛑 */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
        }
      `}} />

      {/* ========================================================= */}
      {/* UI LAYAR: HEADER & KARTU (Sembunyi saat cetak)            */}
      {/* ========================================================= */}
      <div className="print:hidden">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Riwayat Pengajuan Kinerja</h2>
            <p className="text-sm text-slate-500 mt-2">
              Pantau status validasi dari laporan kinerja yang telah Anda kirimkan.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Tombol Cetak Rekap */}
            <button 
              onClick={() => window.print()}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              Cetak Laporan
            </button>

            {/* Profile Card */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
              <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm overflow-hidden">
                <span className="material-symbols-outlined text-[24px]">person</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-bold text-slate-800 text-sm leading-tight">Dyah AF</span>
                <span className="text-xs text-slate-500">PIC Umum</span>
              </div>
            </div>
          </div>
        </header>

        {/* 3 KARTU SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
               <span className="material-symbols-outlined text-[28px]">hourglass_empty</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">Sedang Diproses</span>
              <span className="text-2xl font-black text-slate-800 mt-1">2 Laporan</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
               <span className="material-symbols-outlined text-[28px]">error</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">Perlu Revisi</span>
              <span className="text-2xl font-black text-slate-800 mt-1">1 Laporan</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
               <span className="material-symbols-outlined text-[28px]">task_alt</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">Selesai (Disetujui)</span>
              <span className="text-2xl font-black text-slate-800 mt-1">8 Laporan</span>
            </div>
          </div>
        </div>
        
        {/* TABEL UI LAYAR */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[20px]">search</span>
              <input type="text" placeholder="Cari Indikator atau Periode..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition bg-white" />
            </div>
            <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white font-medium cursor-pointer w-48">
              <option>Semua Status</option>
              <option>Disetujui</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Tanggal Kirim</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Periode & Indikator</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Status Pelacakan</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-6 text-slate-600 font-medium whitespace-nowrap align-top">{row.tanggal}</td>
                    <td className="px-6 py-6 align-top">
                      <div className="mb-2">
                        <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">
                          {row.sasaran}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 mb-1">{row.periode}</p>
                      <p className="text-slate-500">{row.indikator}</p>
                      {row.statusColor === 'rose' && row.catatanRevisi && (
                        <div className="mt-3 bg-rose-50 border border-rose-100 rounded-md p-3 max-w-md">
                          <p className="text-xs text-rose-700 leading-relaxed whitespace-normal"><span className="font-bold text-rose-800">Catatan: </span>{row.catatanRevisi}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-6 align-top">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        row.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        row.statusColor === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">{row.icon}</span>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <div className="flex justify-end">
                        {row.actionType === 'button' ? (
                          <Link href="/input-kinerja" className="bg-[#0f62fe] text-white hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm w-max"><span className="material-symbols-outlined text-[18px]">edit_document</span>{row.action}</Link>
                        ) : (
                          <Link href="/riwayat-pengajuan/detail" className="text-blue-600 hover:text-blue-800 px-2 py-2 text-sm font-bold transition flex items-center gap-1.5 w-max"><span className="material-symbols-outlined text-[18px]">visibility</span>{row.action}</Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* UI CETAK: TABEL EXCEL LANDSCAPE (Hanya Muncul di PDF)     */}
      {/* ========================================================= */}
      <div className="hidden print:block w-full text-black">
        {/* KOP LAPORAN */}
        <div className="text-center mb-6">
          <h1 className="font-bold text-lg uppercase">Laporan Realisasi Rencana Aksi</h1>
          <h2 className="font-bold text-base uppercase">BBSPJPPI Tahun Anggaran 2026</h2>
          <p className="text-xs mt-1">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
        </div>

        {/* TABEL GAYA EXCEL */}
        <table className="w-full border-collapse border border-black text-[10px]">
          <thead className="bg-slate-200 text-center">
            <tr>
              <th className="border border-black p-2 align-middle w-8">No.</th>
              <th className="border border-black p-2 align-middle w-48">Sasaran Kegiatan</th>
              <th className="border border-black p-2 align-middle w-48">Indikator Kinerja</th>
              <th className="border border-black p-2 align-middle">Target</th>
              <th className="border border-black p-2 align-middle">Realisasi</th>
              <th className="border border-black p-2 align-middle w-48">Evaluasi Pelaksanaan</th>
              <th className="border border-black p-2 align-middle w-48">Kendala</th>
              <th className="border border-black p-2 align-middle w-48">Tindak Lanjut</th>
              <th className="border border-black p-2 align-middle">Penanggung Jawab</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={row.id} className="text-left align-top">
                <td className="border border-black p-2 text-center">{index + 1}</td>
                <td className="border border-black p-2 font-bold">{row.sasaran}</td>
                <td className="border border-black p-2 font-bold">{row.indikator}</td>
                <td className="border border-black p-2 text-center whitespace-nowrap">{row.target}</td>
                <td className="border border-black p-2 text-center whitespace-nowrap font-bold">{row.realisasi}</td>
                <td className="border border-black p-2 leading-relaxed">{row.evaluasi}</td>
                <td className="border border-black p-2 leading-relaxed text-rose-700">{row.kendala}</td>
                <td className="border border-black p-2 leading-relaxed text-blue-700">{row.tindakLanjut}</td>
                <td className="border border-black p-2 text-center font-bold">{row.pic}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* BLOK TANDA TANGAN */}
        <div className="mt-8 w-full text-black text-xs">
          <div className="flex justify-between px-10">
            <div className="text-center">
              <p className="mb-16 font-bold">Dibuat Oleh, PIC Terkait</p>
              <p className="font-bold underline">Dyah AF</p>
              <p>NIP. 19850212 201012 1 003</p>
            </div>
            <div className="text-center">
              <p className="mb-16 font-bold">Disetujui Oleh, Katim Reviewer</p>
              <p className="font-bold underline">Bapak Ahmad</p>
              <p>NIP. 19780520 200501 1 002</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}