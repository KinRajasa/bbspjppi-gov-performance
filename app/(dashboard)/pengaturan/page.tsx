'use client';

import { useState } from 'react';

export default function PengaturanPage() {
  // State untuk mengontrol tab yang sedang aktif
  const [activeTab, setActiveTab] = useState('profil');

  return (
    <div className="animation-fade-in w-full pb-10 flex flex-col min-h-[90vh]">
      
      {/* HEADER */}
      <header className="mb-8 border-b border-slate-200 pb-5">
        <h2 className="text-3xl font-bold text-slate-800">Pengaturan</h2>
        <p className="text-sm text-slate-500 mt-2">
          Kelola informasi profil, preferensi notifikasi, dan keamanan akun Anda.
        </p>
      </header>

      {/* MAIN CONTENT (SPLIT VIEW) */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* ========================================== */}
        {/* MENU SAMPING (LEFT NAVIGATION)             */}
        {/* ========================================== */}
        <div className="w-full md:w-64 flex flex-col gap-1 shrink-0">
          <button 
            onClick={() => setActiveTab('profil')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition w-full text-left ${
              activeTab === 'profil' 
                ? 'bg-[#0f172a] text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            Profil Pengguna
          </button>
          
          <button 
            onClick={() => setActiveTab('notifikasi')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition w-full text-left ${
              activeTab === 'notifikasi' 
                ? 'bg-[#0f172a] text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            Preferensi Notifikasi
          </button>

          <button 
            onClick={() => setActiveTab('keamanan')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition w-full text-left ${
              activeTab === 'keamanan' 
                ? 'bg-[#0f172a] text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">lock</span>
            Keamanan & Sandi
          </button>
        </div>

        {/* ========================================== */}
        {/* AREA KONTEN (RIGHT FORM AREA)              */}
        {/* ========================================== */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* TAB 1: PROFIL PENGGUNA */}
          {activeTab === 'profil' && (
            <div className="p-6 md:p-8 animation-fade-in">
              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Informasi Personal</h3>
              
              {/* Foto Profil */}
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                   <span className="material-symbols-outlined text-[40px] text-slate-400">person</span>
                </div>
                <div>
                  <div className="flex gap-3 mb-2">
                    <button className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-1.5 rounded-md text-xs font-bold hover:bg-blue-100 transition">
                      Ubah Foto
                    </button>
                    <button className="text-rose-600 px-4 py-1.5 rounded-md text-xs font-bold hover:bg-rose-50 transition">
                      Hapus
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Format JPG, GIF atau PNG. Ukuran maksimal 2MB.</p>
                </div>
              </div>

              {/* Form Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Nama Lengkap</label>
                  <input type="text" defaultValue="Budi Santoso" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">NIP / NIK</label>
                  <input type="text" defaultValue="19850123 201012 1 002" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Email Instansi</label>
                  <input type="email" defaultValue="budi.santoso@bbspjppi.go.id" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Nomor Telepon / WhatsApp</label>
                  <input type="text" defaultValue="0812-3456-7890" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Informasi Jabatan (Read-Only)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Bagian / Divisi</label>
                  <input type="text" defaultValue="Bagian Tata Usaha (Umum)" disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Peran Sistem</label>
                  <input type="text" defaultValue="PIC Umum" disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-sm cursor-not-allowed" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="bg-[#0f172a] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm">
                  Simpan Perubahan
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFIKASI */}
          {activeTab === 'notifikasi' && (
            <div className="p-6 md:p-8 animation-fade-in">
              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Preferensi Notifikasi</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Notifikasi Email</p>
                    <p className="text-xs text-slate-500 mt-1">Kirim email saat ada penugasan baru atau status laporan berubah.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Notifikasi WhatsApp</p>
                    <p className="text-xs text-slate-500 mt-1">Kirim pengingat batas waktu pengisian kinerja ke nomor WhatsApp Anda.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="bg-[#0f172a] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm">
                  Simpan Preferensi
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: KEAMANAN */}
          {activeTab === 'keamanan' && (
            <div className="p-6 md:p-8 animation-fade-in">
              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Ubah Kata Sandi</h3>
              
              <div className="max-w-md space-y-5 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Kata Sandi Saat Ini</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Kata Sandi Baru</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition" />
                  <p className="text-[10px] text-slate-500 mt-1">Minimal 8 karakter, mengandung huruf dan angka.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Konfirmasi Kata Sandi Baru</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="bg-[#0f172a] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm">
                  Perbarui Kata Sandi
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}