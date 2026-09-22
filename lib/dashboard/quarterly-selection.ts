/**
 * Pemilihan nilai triwulan untuk Dashboard Eksekutif.
 *
 * Data hasil integrasi Excel/Google Sheets disimpan sebagai satu submission per
 * (tahun anggaran, indikator, triwulan) — lihat `google-sheets/sync`. Karena itu
 * nilai triwulan TIDAK boleh dicari di dalam satu submission saja, melainkan
 * digabung dari seluruh submission indikator pada tahun anggaran tersebut.
 */

export type NumericLike = { toString(): string } | number | string | null | undefined;

export type QuarterValueLike = {
  quarter: number;
  targetValue: NumericLike;
  realizationValue: NumericLike;
  /** Apabila diisi, baris ini berasal dari hasil sinkronisasi Excel (bukan input manual PIC). */
  sourceSyncRunId?: number | null;
};

export type SubmissionLike = {
  id: number;
  reportingQuarter: number;
  status: string;
  approvedAt: Date | null;
  submittedAt: Date | null;
  physicalRealization: NumericLike;
  values: QuarterValueLike[];
  submittedBy?: { name: string } | null;
};

export type QuarterSelection = {
  /** Triwulan asal nilai yang benar-benar dipakai. */
  quarter: number;
  targetValue: number | null;
  realizationValue: number | null;
  physicalRealization: number | null;
  submissionStatus: string | null;
  /** true bila nilai berasal tepat dari triwulan yang dipilih pengguna. */
  isExactQuarter: boolean;
};

/** Status yang dianggap sudah sah untuk ditampilkan di dashboard eksekutif. */
const FINAL_STATUSES = new Set(['PUBLISHED', 'APPROVED', 'DISETUJUI']);

export function toNumber(value: NumericLike): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(typeof value === 'number' ? value : value.toString());
  return Number.isFinite(parsed) ? parsed : null;
}

type Candidate = {
  quarter: number;
  targetValue: number | null;
  realizationValue: number | null;
  submissionId: number;
  submissionStatus: string;
  approvedAt: Date | null;
  submittedAt: Date | null;
  physicalRealization: number | null;
  /** true bila baris ini berasal dari hasil sinkronisasi Excel (meski nilai null). */
  isSynced: boolean;
};

function collectCandidates(submissions: SubmissionLike[]): Candidate[] {
  const candidates: Candidate[] = [];

  for (const submission of submissions) {
    for (const value of submission.values) {
      const targetValue = toNumber(value.targetValue);
      const realizationValue = toNumber(value.realizationValue);
      const isSynced = Boolean(value.sourceSyncRunId);

      // Lewati hanya bila tidak ada data sama sekali DAN tidak berasal dari sync.
      // Baris yang di-sync tetap masuk meski target/realisasi belum terisi,
      // supaya IKU yang sinkronisasinya belum lengkap tidak jatuh ke data tahun lain.
      if (targetValue === null && realizationValue === null && !isSynced) continue;

      candidates.push({
        quarter: value.quarter,
        targetValue,
        realizationValue,
        submissionId: submission.id,
        submissionStatus: submission.status,
        approvedAt: submission.approvedAt,
        submittedAt: submission.submittedAt,
        physicalRealization: toNumber(submission.physicalRealization),
        isSynced,
      });
    }
  }

  return candidates;
}

/**
 * Urutan prioritas: status final lebih diutamakan, lalu waktu approval/submit
 * terbaru, terakhir id submission terbesar agar hasilnya deterministik (bukan
 * acak seperti ORDER BY approved_at DESC ketika seluruh approved_at NULL).
 */
function pickPreferred(candidates: Candidate[]): Candidate {
  return [...candidates].sort((left, right) => {
    const finalDiff =
      Number(FINAL_STATUSES.has(right.submissionStatus)) -
      Number(FINAL_STATUSES.has(left.submissionStatus));
    if (finalDiff !== 0) return finalDiff;

    const approvedDiff = (right.approvedAt?.getTime() ?? 0) - (left.approvedAt?.getTime() ?? 0);
    if (approvedDiff !== 0) return approvedDiff;

    const submittedDiff = (right.submittedAt?.getTime() ?? 0) - (left.submittedAt?.getTime() ?? 0);
    if (submittedDiff !== 0) return submittedDiff;

    return right.submissionId - left.submissionId;
  })[0];
}

function toSelection(candidate: Candidate, isExactQuarter: boolean): QuarterSelection {
  return {
    quarter: candidate.quarter,
    targetValue: candidate.targetValue,
    realizationValue: candidate.realizationValue,
    physicalRealization: candidate.physicalRealization,
    submissionStatus: candidate.submissionStatus,
    isExactQuarter,
  };
}

/**
 * Ambil nilai untuk triwulan yang diminta:
 * Hanya ambil nilai yang triwulannya persis sama dengan requestedQuarter.
 * Jika kosong di Excel/database untuk triwulan tersebut, tetap kosong (null),
 * jangan fallback ke triwulan lain atau tahun sebelumnya.
 */
export function selectQuarterSelection(
  submissions: SubmissionLike[],
  requestedQuarter: number,
): QuarterSelection | null {
  const candidates = collectCandidates(submissions);
  if (candidates.length === 0) return null;

  const exact = candidates.filter((candidate) => candidate.quarter === requestedQuarter);
  if (exact.length > 0) return toSelection(pickPreferred(exact), true);

  return null;
}
