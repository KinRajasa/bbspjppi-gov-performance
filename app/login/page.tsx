'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  // State untuk fitur show/hide password
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-[#F8FAFC]">
      
      {/* ========================================== */}
      {/* SISI KIRI (Branding & Informasi)           */}
      {/* ========================================== */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] flex-col justify-center items-center text-center p-12 relative overflow-hidden">
        
        {/* Aksen bulat tipis di background (Opsional, agar tidak terlalu polos) */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo Instansi */}
        <div className="mb-10 shadow-2xl rounded-2xl overflow-hidden bg-white p-2">
        <img 
            src="/logo.png" 
            alt="Logo BBSPJPPI" 
            className="w-24 h-24 object-contain"
        />
        </div>
          
          <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">Dashboard Kinerja BBSPJPPI</h1>
          
          <p className="text-slate-400 text-sm leading-relaxed max-w-md font-medium">
            Sistem Manajemen dan Evaluasi Kinerja Terpadu<br/>
            Balai Besar Standardisasi dan Pelayanan Jasa<br/>
            Pencegahan Pencemaran Industri
          </p>
        </div>
      </div>

      {/* ========================================== */}
      {/* SISI KANAN (Form Login)                    */}
      {/* ========================================== */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 relative">
        
        <div className="w-full max-w-[420px] bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative z-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Selamat Datang,</h2>
          <p className="text-sm text-slate-500 mb-10">Silakan masuk menggunakan akun instansi Anda.</p>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            
            {/* Input Email */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">person</span>
                <input
                  type="email"
                  placeholder="Masukkan email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] transition bg-white text-slate-700"
                  required
                />
              </div>
            </div>

            {/* Input Kata Sandi */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">Kata Sandi</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">lock</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] transition bg-white text-slate-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Ingat Saya & Lupa Sandi */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-[#0f172a] focus:ring-[#0f172a] cursor-pointer" 
                />
                <span className="text-xs text-slate-500 font-medium group-hover:text-slate-800 transition">Ingat saya</span>
              </label>
              <Link href="#" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition">
                Lupa kata sandi?
              </Link>
            </div>

            {/* Tombol Submit (Di-link ke Dashboard untuk testing) */}
            <Link
              href="/"
              className="block w-full bg-[#0f172a] text-white text-center py-3.5 rounded-lg text-sm font-bold mt-4 hover:bg-slate-800 transition shadow-md"
            >
              Masuk ke Sistem
            </Link>

          </form>
        </div>

        {/* Footer Text */}
        <p className="absolute bottom-8 text-[11px] font-bold text-slate-400 text-center w-full">
          © 2026 BBSPJPPI - Kementerian Perindustrian
        </p>

      </div>
    </div>
  );
}