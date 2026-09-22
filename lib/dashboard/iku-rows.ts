import { ikuIdToSheetMap } from '@/lib/resolve-iku-reference';
import { evaluateAchievement, type ComparisonOperator } from './capaian';
import {
  canonicalIkuList,
  normalizeIndicatorCode,
  normalizeIndicatorLabel,
  type MasterIkuTarget,
} from './canonical-iku';
import { selectQuarterSelection, toNumber, type QuarterValueLike, type SubmissionLike } from './quarterly-selection';

export type IndicatorSource = {
  id: number;
  code: string;
  name: string;
  unit: string | null;
  comparisonOperator: ComparisonOperator;
  assignments: { picUser: { name: string } }[];
  submissions: SubmissionLike[];
};

export type CanonicalIkuRow = {
  id: number;
  code: string;
  indikator: string;
  pic: string;
  satuan: string;
  targetValue: number | null;
  realisasiValue: number | null;
  capaianPercentage: number;
  status: boolean;
  /** false bila belum ada angka tersimpan untuk indikator ini pada tahun anggaran terkait. */
  hasData: boolean;
  /** Triwulan asal nilai yang ditampilkan (bisa berbeda dari triwulan yang dipilih). */
  quarter: number | null;
  isExactQuarter: boolean;
  targetSource: 'triwulan' | 'master' | null;
  physicalRealization: number | null;
};

const hasStoredNumbers = (indicator: IndicatorSource) =>
  indicator.submissions.some((submission) =>
    submission.values.some(
      (value: QuarterValueLike) =>
        toNumber(value.targetValue) !== null ||
        toNumber(value.realizationValue) !== null ||
        // Baris yang di-sync (meski belum ada nilai) tetap dianggap punya data
        // agar tidak fallback ke tahun anggaran sebelumnya.
        Boolean(value.sourceSyncRunId),
    ),
  );

/** Satu indikator bisa muncul dengan beberapa penulisan kode; pilih yang punya angka. */
function dedupeIndicators(indicators: IndicatorSource[]): IndicatorSource[] {
  const byCode = new Map<string, IndicatorSource>();

  for (const indicator of indicators) {
    const key = normalizeIndicatorCode(indicator.code);
    const previous = byCode.get(key);
    if (!previous) {
      byCode.set(key, indicator);
      continue;
    }
    if (!hasStoredNumbers(previous) && hasStoredNumbers(indicator)) byCode.set(key, indicator);
  }

  return [...byCode.values()];
}

function findIndicator(
  indicators: IndicatorSource[],
  aliases: string[],
  canonicalName: string,
): IndicatorSource | null {
  const normalizedName = normalizeIndicatorLabel(canonicalName);
  const candidates = indicators.filter(
    (indicator) =>
      aliases.includes(normalizeIndicatorCode(indicator.code)) ||
      normalizeIndicatorLabel(indicator.name) === normalizedName,
  );
  if (candidates.length === 0) return null;

  return [...candidates].sort((left, right) => {
    const dataDiff = Number(hasStoredNumbers(right)) - Number(hasStoredNumbers(left));
    if (dataDiff !== 0) return dataDiff;
    return left.id - right.id;
  })[0];
}

function resolveMaster(
  masterTargets: Map<string, MasterIkuTarget>,
  aliases: string[],
): MasterIkuTarget | null {
  for (const alias of aliases) {
    const found = masterTargets.get(alias);
    if (found) return found;
  }
  return null;
}

/**
 * Susun 18 baris IKU untuk triwulan yang diminta. Target triwulan diambil dari
 * hasil integrasi Excel; bila kosong, dipakai target baseline tahunan Master IKU
 * supaya capaian tetap bisa dihitung dan tidak tampil sebagai 0%.
 */
export function buildCanonicalRows(
  indicators: IndicatorSource[],
  masterTargets: Map<string, MasterIkuTarget>,
  quarter: number,
): CanonicalIkuRow[] {
  const deduped = dedupeIndicators(indicators);

  return canonicalIkuList.map((definition) => {
    const indicator = findIndicator(deduped, definition.aliases, definition.name);
    const master = resolveMaster(masterTargets, definition.aliases);
    const selection = indicator ? selectQuarterSelection(indicator.submissions, quarter) : null;

    const quarterlyTarget = selection?.targetValue ?? null;
    const targetValue = quarterlyTarget ?? master?.target ?? null;
    const realisasiValue = selection?.realizationValue ?? null;
    const operator = indicator?.comparisonOperator ?? 'GTE';
    const achievement = evaluateAchievement(realisasiValue, targetValue, operator);

    return {
      id: indicator?.id ?? -(definition.number),
      code: String(definition.number),
      indikator: definition.name,
      // Setelah lolos validasi Katim/Kapokja, tampilkan PIC yang benar-benar
      // mengirim submission. Fallback ke assignment master untuk baris yang
      // belum memiliki submission final.
      pic:
        indicator?.submissions.find((submission) =>
          ['PUBLISHED', 'APPROVED', 'DISETUJUI'].includes(submission.status),
        )?.submittedBy?.name ??
        master?.pic ??
        indicator?.assignments[0]?.picUser.name ??
        '',
      satuan: indicator?.unit?.trim() || master?.satuan?.trim() || '',
      targetValue,
      realisasiValue,
      capaianPercentage: achievement.capaianPercentage,
      status: achievement.meetsTarget,
      hasData: Boolean(selection),
      quarter: selection?.quarter ?? null,
      isExactQuarter: selection?.isExactQuarter ?? false,
      targetSource: quarterlyTarget !== null ? 'triwulan' : master?.target != null ? 'master' : null,
      physicalRealization: selection?.physicalRealization ?? null,
    };
  });
}

/**
 * Kode worksheet yang dimiliki sebuah baris IKU (mis. IKU 3 -> `SK.1.1`),
 * dipakai untuk menandai baris Master Data IKU pada dashboard.
 */
export function sheetCodeForIkuNumber(ikuNumber: number): string | null {
  const definition = canonicalIkuList.find((item) => item.number === ikuNumber);
  const alias = definition?.aliases[0];
  if (!alias) return null;
  return ikuIdToSheetMap[ikuNumber] ?? alias;
}
