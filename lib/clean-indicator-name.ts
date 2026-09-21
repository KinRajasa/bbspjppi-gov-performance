/** Remove legacy worksheet/code prefixes from an indicator label. */
export function cleanIndicatorName(name: string | null | undefined): string {
  return String(name ?? '')
    .trim()
    // Mendukung TJ.1, TJ 1, SK.1.1, S.K.4.1., IKU-1, dan 1.1.
    .replace(/^\s*(?:S\.?K|TJ|IKU)\s*[-.]?\s*\d+(?:\.\d+)*\.?\s*[–—-]\s*/i, '')
    .replace(/^\s*\d+(?:\.\d+)+\s*[–—-]\s*/i, '')
    .trim();
}
