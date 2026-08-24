'use client';

export default function InputRencanaAksiPage() {
  return (
    <div className="animation-fade-in w-full">
      
      {/* HEADER */}
      <header className="mb-8 border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-800">Input Rencana Aksi Tahunan</h2>
        <p className="text-sm text-slate-500 mt-1">
          Tetapkan target antara dan rincian rencana kegiatan untuk setiap triwulan.
        </p>
      </header>

      <div className="space-y-8">
        
        {/* CARD 1: INFORMASI INDIKATOR & PENUGASAN */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-blue-500 text-[20px]">info</span>
            <h3 className="font-bold text-slate-700 text-lg">Informasi Indikator & Penugasan</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Pilih Indikator Kinerja</label>
              <select className="w-full border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 bg-white font-medium">
                <option>SK.1 - Indeks Kepuasan Masyarakat (IKM)</option>
                <option>Jumlah perusahaan industri yang memanfaatkan layanan</option>
              </select>
              <p className="text-xs font-medium text-blue-600 mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">adjust</span> Target Tahunan: 3.68 Indeks
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Penanggung Jawab (PIC)</label>
              <input 
                type="text" 
                disabled 
                value="Ketua Tim Kerja Pengembangan Jasa Industri (Dyah A...)" 
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-md px-4 py-2.5 outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SECTION: RINCIAN KEGIATAN PER TRIWULAN */}
        <div>
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 inline-block">Rincian Rencana Kegiatan per Triwulan</h3>
          
          <div className="grid grid-cols-2 gap-6">
            
            {/* TRIWULAN I */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-blue-500 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-slate-800">Triwulan I</h4>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <label className="text-xs font-bold text-slate-500">Target:</label>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue="25" className="w-12 bg-transparent text-right font-bold text-slate-800 outline-none" />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Rencana Kegiatan</label>
                <textarea 
                  rows={4} 
                  className="w-full flex-1 border border-slate-300 rounded-md p-3 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 custom-scrollbar"
                  defaultValue="1. Penyusunan instrumen survei IKM&#10;2. Koordinasi dengan tim teknis terkait jadwal pelaksanaan survei&#10;3. Uji coba instrumen survei pada sampel terbatas"
                ></textarea>
              </div>
            </div>

            {/* TRIWULAN II */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-sky-400 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-slate-800">Triwulan II</h4>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <label className="text-xs font-bold text-slate-500">Target:</label>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue="50" className="w-12 bg-transparent text-right font-bold text-slate-800 outline-none" />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Rencana Kegiatan</label>
                <textarea 
                  rows={4} 
                  className="w-full flex-1 border border-slate-300 rounded-md p-3 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 custom-scrollbar"
                  defaultValue="1. Pelaksanaan survei IKM tahap I&#10;2. Pengumpulan dan verifikasi data responden&#10;3. Analisis awal hasil survei tahap I"
                ></textarea>
              </div>
            </div>

            {/* TRIWULAN III */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-purple-500 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-slate-800">Triwulan III</h4>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <label className="text-xs font-bold text-slate-500">Target:</label>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue="75" className="w-12 bg-transparent text-right font-bold text-slate-800 outline-none" />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Rencana Kegiatan</label>
                <textarea 
                  rows={4} 
                  className="w-full flex-1 border border-slate-300 rounded-md p-3 text-sm text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 custom-scrollbar"
                  placeholder="Masukkan rincian kegiatan (Misal: Evaluasi hasil survei IKM, Penyusunan laporan antara...)"
                ></textarea>
              </div>
            </div>

            {/* TRIWULAN IV */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-500 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-slate-800">Triwulan IV</h4>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <label className="text-xs font-bold text-slate-500">Target:</label>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue="100" className="w-12 bg-transparent text-right font-bold text-slate-800 outline-none" />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Rencana Kegiatan</label>
                <textarea 
                  rows={4} 
                  className="w-full flex-1 border border-slate-300 rounded-md p-3 text-sm text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 custom-scrollbar"
                  placeholder="Masukkan rincian kegiatan (Misal: Penyusunan laporan akhir, Tindak lanjut rekomendasi perbaikan...)"
                ></textarea>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
          <a href="/perjanjian-kinerja" className="px-6 py-2.5 rounded-md text-sm font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 transition shadow-sm flex items-center justify-center">
            Kembali
          </a>
          <button className="px-6 py-2.5 rounded-md text-sm font-bold text-white bg-[#0f172a] hover:bg-slate-800 flex items-center gap-2 transition shadow-sm">
            <span className="material-symbols-outlined text-[18px]">save</span> Simpan Rencana Aksi
          </button>
        </div>

      </div>
    </div>
  );
}