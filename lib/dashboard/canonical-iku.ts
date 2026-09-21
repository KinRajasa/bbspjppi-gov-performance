import { ikuIdToSheetMap } from '@/lib/resolve-iku-reference';
import { toNumber } from './quarterly-selection';

export type CanonicalIkuDefinition = {
  number: number;
  name: string;
  /** Kode worksheet hasil normalisasi (tanpa spasi/titik). */
  aliases: string[];
};

/**
 * 18 Indikator Kinerja Utama (IKU) yang wajib tampil di Dashboard Eksekutif,
 * lengkap dengan alias kode worksheet Excel yang dipakai pada integrasi Sheets.
 */
export const canonicalIkuList: CanonicalIkuDefinition[] = [
  { number: 1, name: 'Indeks Kepuasan Masyarakat (IKM)', aliases: ['tj1'] },
  { number: 2, name: 'Jumlah perusahaan industri/pelaku usaha/instansi yang memanfaatkan layanan jasa industri', aliases: ['tj2'] },
  { number: 3, name: 'Persentase pelayanan tepat waktu sesuai Service Level Agreement (SLA)', aliases: ['sk11'] },
  { number: 4, name: 'Nilai Net Promoter Score (NPS)', aliases: ['sk12'] },
  { number: 5, name: 'Indeks peningkatan Penerimaan Negara Bukan Pajak (PNBP)', aliases: ['sk21'] },
  { number: 6, name: 'Jumlah hasil layanan jasa industri', aliases: ['sk22'] },
  { number: 7, name: 'Nilai Revenue on Asset (RoA)', aliases: ['sk23'] },
  { number: 8, name: 'Rasio Pendapatan Operasional terhadap Biaya Operasional (POBO)', aliases: ['sk24'] },
  { number: 9, name: 'Indeks Profesionalitas ASN (IPASN)', aliases: ['sk31'] },
  { number: 10, name: 'Persentase jenis layanan yang datanya terintegrasi dengan sistem informasi BSKJI', aliases: ['sk41'] },
  { number: 11, name: 'Tingkat Penerapan Sistem Pemerintahan Berbasis Elektronik (SPBE)', aliases: ['sk42'] },
  { number: 12, name: 'Indeks Pelayanan Publik (IPP)', aliases: ['sk43'] },
  { number: 13, name: 'Persentase Rekomendasi hasil pengawasan internal telah ditindaklanjuti oleh satker', aliases: ['sk51'] },
  { number: 14, name: 'Nilai minimal hasil pengawasan kearsipan internal (Unit Kearsipan)', aliases: ['sk52'] },
  { number: 15, name: 'Nilai minimal Sistem Akuntabilitas Instansi Pemerintah (SAKIP) Satker', aliases: ['sk61'] },
  { number: 16, name: 'Nilai minimal Indikator Kinerja Pelaksanaan Anggaran IKPA', aliases: ['sk62'] },
  { number: 17, name: 'Penilaian dan Analisis Laporan Keuangan', aliases: ['sk63'] },
  { number: 18, name: 'Persentase penggunaan Produk Dalam Negeri dalam pengadaan barang dan/atau jasa pemerintah', aliases: ['sk71'] },
];

/** `SK 1.1`, `SK.1.1`, dan `S.K.1.1` harus dianggap indikator yang sama. */
export const normalizeIndicatorCode = (value: string) => value.toLowerCase().replace(/[\s.]+/g, '');

export const normalizeIndicatorLabel = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

export type MasterIkuRow = {
  id: number;
  namaIku: string;
  satuan: string;
  target: { toString(): string } | number | null;
  pic: { name: string } | null;
};

export type MasterIkuTarget = {
  target: number | null;
  satuan: string | null;
  pic: string | null;
};

/**
 * Peta target baseline tahunan dari Master IKU (`indikator_kinerja_utama`),
 * di-key dengan kode worksheet hasil normalisasi. Dipakai sebagai cadangan
 * ketika worksheet Excel tidak memuat angka target pada triwulan terpilih.
 */
export function buildMasterTargetMap(rows: MasterIkuRow[]): Map<string, MasterIkuTarget> {
  const map = new Map<string, MasterIkuTarget>();

  for (const row of rows) {
    const sheetCode = ikuIdToSheetMap[row.id];
    if (!sheetCode) continue;
    map.set(normalizeIndicatorCode(sheetCode), {
      target: toNumber(row.target),
      satuan: row.satuan ?? null,
      pic: row.pic?.name ?? null,
    });
  }

  return map;
}
