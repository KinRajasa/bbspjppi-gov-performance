export type IndicatorCatalogItem = {
  sheetName: string;
  code: string;
  label: string;
};

/**
 * Pemetaan nama worksheet sumber Excel ke IKU yang dipilih pada aplikasi.
 * Ini dipakai hanya untuk mengenali metadata (nama/satuan) dari Master IKU;
 * nilai target dan realisasi selalu tetap diambil dari hasil sinkronisasi.
 */
export const indicatorCatalog: IndicatorCatalogItem[] = [
  { sheetName: 'TJ 1', code: '1.1', label: 'Indeks Kepuasan Masyarakat (IKM)' },
  { sheetName: 'TJ 2', code: '1.2', label: 'Jumlah perusahaan industri/pelaku usaha/instansi yang memanfaatkan layanan jasa industri' },
  { sheetName: 'SK.1.1', code: '2.1', label: 'Persentase pelayanan tepat waktu sesuai Service Level Agreement (SLA)' },
  { sheetName: 'SK.1.2.', code: '2.2', label: 'Nilai Net Promoter Score (NPS)' },
  { sheetName: 'SK.2.1', code: '3.1', label: 'Indeks peningkatan Penerimaan Negara Bukan Pajak (PNBP)' },
  { sheetName: 'SK.2.2', code: '3.2', label: 'Jumlah hasil layanan jasa industri' },
  { sheetName: 'SK.2.3', code: '3.3', label: 'Nilai Revenue on Asset (RoA)' },
  { sheetName: 'SK.2.4', code: '3.4', label: 'Rasio Pendapatan Operasional terhadap Biaya Operasional (POBO)' },
  { sheetName: 'SK.3.1.', code: '4.1', label: 'Indeks Profesionalitas ASN (IPASN)' },
  { sheetName: 'S.K.4.1.', code: '5.1', label: 'Persentase jenis layanan yang datanya terintegrasi dengan sistem informasi BSKJI' },
  { sheetName: 'S.K.4.2', code: '5.2', label: 'Tingkat Penerapan Sistem Pemerintahan Berbasis Elektronik (SPBE)' },
  { sheetName: 'S.K.4.3.', code: '5.3', label: 'Indeks Pelayanan Publik (IPP)' },
  { sheetName: 'S.K.5.1.', code: '6.1', label: 'Persentase Rekomendasi hasil pengawasan internal telah ditindaklanjuti oleh satker' },
  { sheetName: 'S.K.5.2', code: '6.2', label: 'Nilai minimal hasil pengawasan kearsipan internal (Unit Kearsipan)' },
  { sheetName: 'S.K.6.1', code: '7.1', label: 'Nilai minimal Sistem Akuntabilitas Instansi Pemerintah (SAKIP) Satker' },
  { sheetName: 'S.K.6.2', code: '7.2', label: 'Nilai minimal Indikator Kinerja Pelaksanaan Anggaran IKPA' },
  { sheetName: 'S.K.6.3.', code: '7.3', label: 'Penilaian dan Analisis Laporan Keuangan' },
  { sheetName: 'S.K.7.1', code: '8.1', label: 'Persentase penggunaan Produk Dalam Negeri dalam pengadaan barang dan/atau jasa pemerintah' },
];

export const findIndicatorCatalogItem = (sheetName: string) =>
  indicatorCatalog.find((item) => item.sheetName.toLowerCase() === sheetName.trim().toLowerCase()) ?? null;

/**
 * Kode yang disimpan di performance_indicators harus selalu memakai satu
 * bentuk kanonik.  File Excel lama memakai beberapa variasi (S.K. vs SK.,
 * titik di akhir, dan IKU-1/IKU-2), sehingga membiarkan kode mentah masuk ke
 * database akan membuat indikator yang sama menjadi baris berbeda.
 */
export const canonicalPerformanceIndicatorCodes = [
  'TJ 1', 'TJ 2', 'SK.1.1', 'SK.1.2.', 'SK.2.1', 'SK.2.2', 'SK.2.3', 'SK.2.4',
  'SK.3.1.', 'S.K.4.1.', 'S.K.4.2', 'S.K.4.3.', 'S.K.5.1.', 'S.K.5.2',
  'S.K.6.1', 'S.K.6.2', 'S.K.6.3.', 'S.K.7.1',
] as const;

const normalizeCode = (value: string) => value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

const codeAliases: Record<string, number> = Object.fromEntries(
  indicatorCatalog.flatMap((item, index) => {
    const canonical = canonicalPerformanceIndicatorCodes[index];
    const aliases = [item.sheetName, canonical, item.code, `IKU-${index + 1}`, `IKU ${index + 1}`];
    return aliases.map((alias) => [normalizeCode(alias), index]);
  }),
);

/** Mengembalikan kode database kanonik, atau null bila bukan 18 IKU resmi. */
export function canonicalizePerformanceIndicatorCode(value: string) {
  const index = codeAliases[normalizeCode(value)];
  return index === undefined ? null : canonicalPerformanceIndicatorCodes[index];
}
