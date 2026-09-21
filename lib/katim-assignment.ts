import { prisma } from '@/lib/prisma';
import { getSheetCodeForIkuId, normalizeIndicatorName } from '@/lib/resolve-iku-reference';
import { indicatorCatalog } from '@/lib/indicator-catalog';

/**
 * PerformanceSubmission menunjuk ke performance_indicators, sedangkan
 * penugasan Katim disimpan di indikator_kinerja_utama. Helper ini menjembatani
 * keduanya melalui kode sheet dan nama indikator (termasuk data impor lama).
 */
export async function getAssignedPerformanceIndicatorIds(katimId: number) {
  const assignedIku = await prisma.$queryRaw<Array<{ id: number; nama_iku: string }>>`
    SELECT id, nama_iku FROM indikator_kinerja_utama WHERE katim_id = ${katimId}
  `;
  return resolvePerformanceIndicatorIds(assignedIku);
}

export async function getAssignedPerformanceIndicatorIdsForPic(picId: number) {
  const assignedIku = await prisma.$queryRaw<Array<{ id: number; nama_iku: string }>>`
    SELECT id, nama_iku FROM indikator_kinerja_utama WHERE pic_id = ${picId} AND target IS NOT NULL
  `;
  return resolvePerformanceIndicatorIds(assignedIku);
}

async function resolvePerformanceIndicatorIds(assignedIku: Array<{ id: number; nama_iku: string }>) {
  if (!assignedIku.length) return [] as number[];

  const performanceIndicators = await prisma.performanceIndicator.findMany({ select: { id: true, code: true, name: true } });
  const matches = performanceIndicators.filter((indicator) => assignedIku.some((iku) => {
    const ikuName = normalizeIndicatorName(iku.nama_iku ?? '');
    const catalog = indicatorCatalog.find((item) => {
      const catalogName = normalizeIndicatorName(item.label);
      return catalogName && ikuName && (catalogName === ikuName || catalogName.includes(ikuName) || ikuName.includes(catalogName));
    });
    const expectedSheet = getSheetCodeForIkuId(Number(iku.id)) ?? catalog?.sheetName;
    const indicatorCode = normalizeIndicatorName(indicator.code);
    const expectedCode = expectedSheet ? normalizeIndicatorName(expectedSheet) : '';
    if (expectedCode && indicatorCode === expectedCode) return true;
    const importedName = normalizeIndicatorName(indicator.name ?? '');
    return Boolean(ikuName && importedName && (ikuName === importedName || ikuName.includes(importedName) || importedName.includes(ikuName)));
  }));
  return matches.map((indicator) => indicator.id);
}
