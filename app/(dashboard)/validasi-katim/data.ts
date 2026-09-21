// Sumber data tunggal untuk halaman Antrean Validasi & Detail Review.
// Nanti kalau sudah connect ke backend, array ini tinggal diganti hasil fetch API,
// tapi struktur/shape-nya bisa tetap dipakai sebagai acuan tipe data.

export type CatatanRevisi = {
  tanggal: string;
  isi: string;
};

export type RincianBulanan = {
  label: string;
  deskripsi: string;
};

export type LaporanValidasi = {
  id: number;
  waktu: string;
  pic: string;
  picRole: string;
  sasaran: string;
  kodeIndikator: string;
  namaIndikator: string;
  periode: string;
  status: 'Menunggu Review' | 'Revisi dari Kapokja' | 'Disetujui';
  statusType: 'warning' | 'danger' | 'success';
  target: string;
  satuanTarget: string;
  realisasi: string;
  statusRealisasi: string; // contoh: "Melampaui Target"
  capaianFisik: {
    realisasi: number;
    target: number;
    statusLabel: string;
  };
  dokumen: {
    nama: string;
    ukuran: string;
    tanggalUpload: string;
  };
  rincianBulanan: RincianBulanan[];
  kendala: string[];
  tindakLanjut: string;
  // null artinya laporan ini belum pernah ditolak sebelumnya -> banner revisi TIDAK boleh muncul
  catatanRevisi: CatatanRevisi | null;
};

export const daftarValidasi: LaporanValidasi[] = [
  {
    id: 1,
    waktu: '24 Okt 2026, 10:30',
    pic: 'Siti Aminah',
    picRole: 'PIC Umum',
    sasaran: 'Meningkatnya kualitas dan kuantitas layanan jasa industri',
    kodeIndikator: '1.1',
    namaIndikator: 'Indeks Kepuasan Masyarakat (IKM)',
    periode: 'Triwulan II (Apr-Jun 2026)',
    status: 'Menunggu Review',
    statusType: 'warning',
    target: '3.68',
    satuanTarget: 'Indeks',
    realisasi: '3.74',
    statusRealisasi: 'Melampaui Target',
    capaianFisik: { realisasi: 50, target: 50, statusLabel: 'STATUS: TARGET FISIK TERPENUHI' },
    dokumen: { nama: 'Rekap_Survei_IKM_TW2.xlsx', ukuran: '1.2 MB', tanggalUpload: '30 Jun' },
    rincianBulanan: [
      { label: 'April 2026', deskripsi: 'Penyebaran kuesioner kepada 176 pelanggan dan kembali sejumlah 15 responden. Hasil analisa IKM akumulasi Januari-April sebesar 3,71.' },
      { label: 'Mei 2026', deskripsi: 'Penyebaran kuesioner kepada 202 pelanggan dan kembali sejumlah 36 responden. Hasil analisa IKM akumulasi Januari-Mei sebesar 3,73.' },
      { label: 'Juni 2026', deskripsi: 'Penyebaran kuesioner kepada 183 pelanggan dan kembali sejumlah 35 responden. Hasil analisa IKM akumulasi Januari-Juni sebesar 3,74.' },
    ],
    kendala: [
      'Masih sedikitnya jumlah pelanggan yang mengisi kuesioner via WA dan e-mail.',
      'Platform SINDII belum bisa digunakan sebagai sarana penyampaian kuesioner IKM.',
    ],
    tindakLanjut: 'Melakukan strategi proaktif di loket penerimaan contoh dan blasting WA secara intens. Mengintegrasikan SINDII agar pelanggan wajib mengisi kuesioner sebelum mengunduh LHU.',
    catatanRevisi: null, // laporan ini belum pernah ditolak -> tidak ada banner revisi
  },
  {
    id: 2,
    waktu: '23 Okt 2026, 15:45',
    pic: 'Budi Santoso',
    picRole: 'Kapokja Keuangan dan BMN',
    sasaran: 'Terwujudnya layanan tata kelola pemerintahan',
    kodeIndikator: '2.1',
    namaIndikator: 'Indeks peningkatan PNBP',
    periode: 'Triwulan II (Apr-Jun 2026)',
    status: 'Revisi dari Kapokja',
    statusType: 'danger',
    target: '3,00',
    satuanTarget: 'Indeks',
    realisasi: '2,10',
    statusRealisasi: 'Belum Memenuhi Target',
    capaianFisik: { realisasi: 39, target: 50, statusLabel: 'STATUS: TARGET FISIK BELUM TERPENUHI' },
    dokumen: { nama: 'Rekap_Penerimaan_PNBP_TW2.xlsx', ukuran: '890 KB', tanggalUpload: '2 Jul' },
    rincianBulanan: [
      { label: 'April 2026', deskripsi: 'Penerimaan PNBP bulan berjalan sebesar Rp 2,1 Miliar, terkendala penurunan permintaan layanan uji.' },
      { label: 'Mei 2026', deskripsi: 'Penerimaan PNBP bulan berjalan sebesar Rp 2,8 Miliar, mulai membaik seiring layanan sertifikasi.' },
      { label: 'Juni 2026', deskripsi: 'Penerimaan PNBP akumulasi s.d Juni sebesar Rp 8,37 Miliar, atau sekitar 39,2% dari target tahunan.' },
    ],
    kendala: [
      'Realisasi penerimaan PNBP belum optimal, berpengaruh pada rencana pelaksanaan kegiatan bersumber PNBP/BLU.',
      'Terdapat perbedaan angka realisasi Triwulan II dengan dokumen kuitansi pendukung.',
    ],
    tindakLanjut: 'Melakukan pengecekan ulang seluruh dokumen kuitansi Triwulan II dan menyesuaikan angka realisasi sebelum diajukan ulang untuk validasi.',
    catatanRevisi: {
      tanggal: '23 Okt 2026, 15:45',
      isi: 'Tolong perbaiki angka realisasi pada Triwulan II, sepertinya tidak sesuai dengan dokumen kuitansi. Mohon dicek ulang kesesuaiannya dengan file Excel lampiran.',
    },
  },
  {
    id: 3,
    waktu: '22 Okt 2026, 09:15',
    pic: 'Andi Rahman',
    picRole: 'Tim Kerja Pengembangan Jasa Industri',
    sasaran: 'Meningkatnya kualitas dan kuantitas layanan jasa industri',
    kodeIndikator: '1.3',
    namaIndikator: 'Persentase pelayanan tepat waktu (SLA)',
    periode: 'Triwulan II (Apr-Jun 2026)',
    status: 'Menunggu Review',
    statusType: 'warning',
    target: '88,5',
    satuanTarget: 'Persen',
    realisasi: '90,2',
    statusRealisasi: 'Melampaui Target',
    capaianFisik: { realisasi: 51, target: 50, statusLabel: 'STATUS: TARGET FISIK TERPENUHI' },
    dokumen: { nama: 'Rekap_SLA_Layanan_TW2.xlsx', ukuran: '640 KB', tanggalUpload: '1 Jul' },
    rincianBulanan: [
      { label: 'April 2026', deskripsi: 'Dari 1.120 order layanan, 1.005 selesai tepat waktu (89,7%).' },
      { label: 'Mei 2026', deskripsi: 'Dari 1.180 order layanan, 1.062 selesai tepat waktu (90,0%).' },
      { label: 'Juni 2026', deskripsi: 'Dari 1.138 order layanan, 1.028 selesai tepat waktu (90,3%).' },
    ],
    kendala: [
      'Beberapa order mengalami keterlambatan akibat antrean alat uji di laboratorium.',
    ],
    tindakLanjut: 'Menjadwalkan ulang prioritas antrean pengujian dan menambah shift kerja pada periode order tinggi.',
    catatanRevisi: null,
  },
];

export function getLaporanById(id: number): LaporanValidasi | undefined {
  return daftarValidasi.find((item) => item.id === id);
}