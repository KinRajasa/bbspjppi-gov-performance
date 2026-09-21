export type IkuReference = {
  id: number;
  namaIku: string;
  satuan: string;
  sasaran: { namaSasaran: string };
  pic: { name: string } | null;
};

type PerformanceIndicatorReference = { code: string; name: string };

/**
 * Names entered in the Perjanjian Kinerja can contain different punctuation
 * or spacing from the name imported into performance_indicators. Normalizing
 * here keeps the Sasaran Kegiatan relation stable for the validation queue.
 */
export const normalizeIndicatorName = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

export function resolveIkuReference(
  indicator: PerformanceIndicatorReference,
  rows: IkuReference[],
) {
  const ikuId = /^iku-(\d+)$/i.exec(indicator.code.trim())?.[1];
  if (ikuId) {
    const byId = rows.find((row) => row.id === Number(ikuId));
    if (byId) return byId;
  }

  const normalizedName = normalizeIndicatorName(indicator.name);
  if (!normalizedName) return null;

  const exact = rows.find((row) => normalizeIndicatorName(row.namaIku) === normalizedName);
  if (exact) return exact;

  // Use the most specific partial match when old synced rows contain a code
  // prefix/suffix or a slightly different wording.
  return rows
    .filter((row) => {
      const candidate = normalizeIndicatorName(row.namaIku);
      return candidate && (candidate.includes(normalizedName) || normalizedName.includes(candidate));
    })
    .sort((left, right) => Math.abs(left.namaIku.length - indicator.name.length) - Math.abs(right.namaIku.length - indicator.name.length))[0] ?? null;
}

export const ikuIdToSheetMap: Record<number, string> = {
  // ID Master IKU pada database aktif (1-18).
  1: 'TJ 1',
  2: 'TJ 2',
  3: 'SK.1.1',
  4: 'SK.1.2.',
  5: 'SK.2.1',
  6: 'SK.2.2',
  7: 'SK.2.3',
  8: 'SK.2.4',
  9: 'SK.3.1.',
  10: 'S.K.4.1.',
  11: 'S.K.4.2',
  12: 'S.K.4.3.',
  13: 'S.K.5.1.',
  14: 'S.K.5.2',
  15: 'S.K.6.1',
  16: 'S.K.6.2',
  17: 'S.K.6.3.',
  18: 'S.K.7.1',
  // ID lama hasil import/sinkronisasi tetap dipertahankan.
  33: 'TJ 1',
  50: 'TJ 2',
  51: 'SK.1.1',
  52: 'SK.1.2.',
  53: 'SK.2.1',
  54: 'SK.2.2',
  55: 'SK.2.3',
  56: 'SK.2.4',
  57: 'SK.3.1.',
  58: 'S.K.4.1.',
  59: 'S.K.4.2',
  60: 'S.K.4.3.',
  61: 'S.K.5.1.',
  62: 'S.K.5.2',
  63: 'S.K.6.1',
  64: 'S.K.6.2',
  65: 'S.K.6.3.',
  66: 'S.K.7.1',
};

export function getSheetCodeForIkuId(ikuId: number): string | null {
  return ikuIdToSheetMap[ikuId] ?? null;
}
