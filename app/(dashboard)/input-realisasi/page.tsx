'use client';

import Link from 'next/link';
import {
  ChangeEvent,
  DragEvent,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type QuarterlyRecord = {
  id: number;
  quarter: number;
  evidenceFileUrl: string | null;

  source: 'GOOGLE_SHEETS';

  indicator: {
    code: string;
    name: string;
    unit: string | null;
  };

  actualIku: {
    targetValue: string | null;
    realizationValue: string | null;
    unit: string | null;
  };

  submission: {
    id: number;
    status: string;
  };
};

type AssignedIndicator = {
  id: number;
  code: string | null;
  name: string;
  target: string | null;
  unit: string | null;
  picName: string;
  sasaranName: string;
};

/**
 * Format nilai dari database dengan dukungan persentase.
 */
function formatValue(value: string | null) {
  if (value === null) {
    return 'Belum tersedia';
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 6,
  }).format(numericValue);

  return formatted;
}

// Nama indikator pada data lama kadang masih diawali kode worksheet (misalnya
// "TJ 1 - ..." atau "S.K.4.1. – ..."). Kode tetap dipakai sebagai value
// internal, tetapi tidak perlu ditampilkan kepada PIC.
function cleanIndicatorName(name: string) {
  return name
    .replace(/^\s*(?:IKU\s*[-.]?\s*\d+|(?:S\.?\s*)?K\.?\s*\d+(?:\.\d+)*\.?|TJ\s*\d+|\d+(?:\.\d+)*)\s*[–-]\s*/i, '')
    .trim();
}

function InputRealisasiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedIndicatorId = searchParams.get('indicatorId');
  const requestedQuarter = searchParams.get('quarter');
  // submissionId adalah nama baru; physicalSubmissionId dipertahankan untuk
  // kompatibilitas link lama dari riwayat pengajuan.
  const submissionId = searchParams.get('submissionId') ?? searchParams.get('physicalSubmissionId');
  const physicalSubmissionId = submissionId;
  const contextLocked = Boolean(requestedIndicatorId || submissionId);
  const [indicatorCode, setIndicatorCode] =
    useState('');
  const [assignedIndicators, setAssignedIndicators] = useState<AssignedIndicator[] | null>(null);

  const [year, setYear] =
    useState('2026');

  const [quarter, setQuarter] =
    useState('');

  const [record, setRecord] =
    useState<QuarterlyRecord | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [evidenceLink, setEvidenceLink] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/input-kinerja/indicators', { cache: 'no-store' })
      .then((res) => res.json())
      .then((result) => setAssignedIndicators(Array.isArray(result.data) ? result.data.filter((item: AssignedIndicator) => Boolean(item.code)) : []))
      .catch(() => setAssignedIndicators([]));
  }, []);

  useEffect(() => {
    if (requestedQuarter && ['1', '2', '3', '4'].includes(requestedQuarter)) {
      setQuarter(requestedQuarter);
    }
  }, [requestedQuarter]);

  // Sumber dropdown adalah Master IKU yang sudah disimpan, bukan daftar statis.
  // Dengan demikian PIC hanya melihat indikator yang ditetapkan kepadanya dan
  // sudah memiliki target.
  const visibleIndicatorGroups = assignedIndicators === null ? [] : Array.from(
    assignedIndicators.reduce((groups, indicator) => {
      const groupName = indicator.sasaranName || 'Indikator Kinerja';
      const items = groups.get(groupName) ?? [];
      items.push({
        sheetName: indicator.code as string,
        code: indicator.code as string,
        label: cleanIndicatorName(indicator.name),
      });
      groups.set(groupName, items);
      return groups;
    }, new Map<string, Array<{ sheetName: string; code: string; label: string }>>()),
  ).map(([group, items]) => ({ group, items }));

  /**
   * Auto-select indicator and quarter from physicalSubmissionId if redirected from Tahap 2
   */
  useEffect(() => {
    if (!requestedIndicatorId && !physicalSubmissionId) return;

    // Jalur utama setelah Simpan Realisasi Fisik: gunakan indicatorId dari
    // URL dan cocokkan langsung dengan Master IKU yang sudah dimuat.
    if (requestedIndicatorId) {
      if (!assignedIndicators) return;
      const assigned = assignedIndicators.find((item) => String(item.id) === requestedIndicatorId);
      if (!assigned?.code) {
        // Fallback mengambil detail berdasarkan ID Master IKU. Endpoint ini
        // tetap memvalidasi ownership PIC, sehingga tidak membuka indikator
        // milik user lain ketika daftar ringkas belum tersinkron.
        fetch(`/api/input-kinerja/indicator-details/${requestedIndicatorId}?quarter=${requestedQuarter ?? 1}`)
          .then((response) => response.json())
          .then((result) => {
            if (result.success && result.data?.code) setIndicatorCode(String(result.data.code));
            else setError(result.message ?? 'Indikator yang dikirim dari Realisasi Fisik tidak ditemukan pada penugasan PIC.');
          })
          .catch(() => setError('Indikator yang dikirim dari Realisasi Fisik tidak dapat dimuat.'));
        return;
      }
      setIndicatorCode(assigned.code);
      return;
    }

    // Kompatibilitas link lama yang hanya membawa physicalSubmissionId.
    fetch(`/api/validasi-data/${physicalSubmissionId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const sub = res.data;
          if (sub.reportingQuarter) {
            setQuarter(String(sub.reportingQuarter));
          }
          if (sub.fiscalYear?.year) {
            setYear(String(sub.fiscalYear.year));
          }
          // Normalisasi link lama (?physicalSubmissionId=...) ke konteks baru
          // agar indikator dan submission selalu dibawa secara eksplisit.
          if (sub.ikuId && sub.reportingQuarter && physicalSubmissionId) {
            const canonicalParams = new URLSearchParams({
              indicatorId: String(sub.ikuId),
              quarter: String(sub.reportingQuarter),
              submissionId: String(physicalSubmissionId),
            });
            router.replace(`/input-realisasi?${canonicalParams.toString()}`);
            return;
          }
          const allItems = (assignedIndicators ?? []).filter((item) => item.code).map((item) => ({
            sheetName: item.code as string,
            code: item.code as string,
            label: item.name,
          }));
          const targetName = cleanIndicatorName(sub.indicator?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const matched = allItems.find((item) => {
            const itemCode = item.sheetName.toLowerCase();
            const subCode = (sub.indicator?.code || '').toLowerCase();
            if (itemCode === subCode) return true;
            const itemClean = cleanIndicatorName(item.label).toLowerCase().replace(/[^a-z0-9]/g, '');
            return targetName && (itemClean.includes(targetName) || targetName.includes(itemClean));
          });
          if (matched) {
            setIndicatorCode(matched.sheetName);
          }
        }
      })
      .catch((err) => console.error('[INPUT_REALISASI_AUTOFILL_ERROR]', err));
  }, [requestedIndicatorId, physicalSubmissionId, assignedIndicators, router]);

  /**
   * ============================================================
   * AMBIL DATA DARI DATABASE
   * ============================================================
   */
  useEffect(() => {
    if (
      !indicatorCode ||
      !quarter ||
      !year
    ) {
      return;
    }

    const controller =
      new AbortController();

    setLoading(true);
    setError('');

    fetch(
      `/api/performance/quarterly?indicatorCode=${encodeURIComponent(
        indicatorCode
      )}&year=${year}&quarter=${quarter}`,
      {
        signal: controller.signal,
      }
    )
      .then(async (response) => {
        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ??
              'Data triwulan tidak ditemukan.'
          );
        }

        setRecord(
          result as QuarterlyRecord
        );
      })
      .catch(
        (
          requestError: Error
        ) => {
          if (
            requestError.name !==
            'AbortError'
          ) {
            setRecord(null);
            setError(
              requestError.message
            );
          }
        }
      )
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () =>
      controller.abort();
  }, [
    indicatorCode,
    quarter,
    year,
  ]);

  /**
   * ============================================================
   * PILIH FILE
   * ============================================================
   */
  function selectFile(
    file: File | undefined
  ) {
    if (!file) {
      return;
    }

    setSelectedFile(file);
    setMessage('');
    setError('');
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    selectFile(
      event.target.files?.[0]
    );
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    selectFile(
      event.dataTransfer.files?.[0]
    );
  }

  /**
   * ============================================================
   * UPLOAD BUKTI
   * ============================================================
   */
  async function handleUpload() {
    if (
      !record ||
      !selectedFile &&
      !evidenceLink.trim()
    ) {
      setError(
        'Pilih dokumen atau masukkan tautan bukti dukung terlebih dahulu.'
      );
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('indicatorCode', indicatorCode);
      formData.append('year', String(Number(year)));
      formData.append('quarter', String(Number(quarter)));
      if (physicalSubmissionId) formData.append('physicalSubmissionId', physicalSubmissionId);
      if (selectedFile) formData.append('file', selectedFile, selectedFile.name);
      if (evidenceLink.trim()) formData.append('evidenceLink', evidenceLink.trim());

      const response = await fetch('/api/performance/evidence', {
        method: 'POST',
        body: formData,
      });

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            'Gagal menyimpan bukti.'
        );
      }

      setRecord(
        (current) =>
          current
            ? {
                ...current,
                evidenceFileUrl:
                  result.evidenceFileUrl,
                submission: {
                  ...current.submission,
                  status:
                    result.status,
                },
              }
            : current
      );

      setMessage(
        result.message
      );
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Gagal menyimpan bukti.'
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="animation-fade-in w-full pb-10 flex min-h-[90vh] flex-col">

      {/* ======================================================
          HEADER
      ======================================================= */}
      <header className="mb-8 border-b border-slate-200 pb-5">
        <div className="mb-2 flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-600 text-[28px]">
            fact_check
          </span>

          <h2 className="text-3xl font-bold text-slate-800">
            Input Realisasi & Bukti Dukung
          </h2>
        </div>

        <p className="text-sm text-slate-500">
          Pilih indikator dan triwulan untuk melihat data
          hasil sinkronisasi Admin.
        </p>
      </header>

      <div className="flex max-w-5xl flex-col gap-6">

        {/* ====================================================
            TAHAP 1
        ===================================================== */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h3 className="mb-6 border-b border-slate-100 pb-4 text-lg font-bold text-slate-700">
            Tahap 1: Pilih Data
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            {/* INDIKATOR */}
            <div className="md:col-span-2">
              <label
                htmlFor="pic-indicator"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Indikator Kinerja
              </label>

              <select
                id="pic-indicator"
                value={indicatorCode}
                disabled={contextLocked || assignedIndicators === null || assignedIndicators.length === 0}
                onChange={(event) => {
                  const next =
                    event.target.value;

                  setIndicatorCode(next);
                  setRecord(null);
                  setError('');
                  setMessage('');

                  setLoading(
                    Boolean(
                      next &&
                        quarter &&
                        year
                    )
                  );
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  -- Pilih Indikator --
                </option>

                {visibleIndicatorGroups.map((group) => (
                  <optgroup key={group.group} label={group.group} className="font-bold text-slate-800">
                    {group.items.map((item) => (
                      <option
                        key={item.sheetName}
                        value={item.sheetName}
                        className="font-normal text-slate-700"
                      >
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* TAHUN */}
            <div>
              <label
                htmlFor="pic-year"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Tahun
              </label>

              <input
                id="pic-year"
                type="number"
                value={year}
                onChange={(event) => {
                  const next =
                    event.target.value;

                  setYear(next);
                  setRecord(null);
                  setError('');
                  setMessage('');

                  setLoading(
                    Boolean(
                      next &&
                        quarter &&
                        indicatorCode
                    )
                  );
                }}
                disabled={contextLocked}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            {/* TRIWULAN */}
            <div className="md:col-span-3">
              <label
                htmlFor="pic-quarter"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Periode Triwulan
              </label>

              <select
                id="pic-quarter"
                value={quarter}
                disabled={contextLocked}
                onChange={(event) => {
                  const next =
                    event.target.value;

                  setQuarter(next);
                  setRecord(null);
                  setError('');
                  setMessage('');

                  setLoading(
                    Boolean(
                      next &&
                        indicatorCode &&
                        year
                    )
                  );
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  -- Pilih triwulan --
                </option>

                {[
                  'I',
                  'II',
                  'III',
                  'IV',
                ].map(
                  (item, index) => (
                    <option
                      key={item}
                      value={index + 1}
                    >
                      Triwulan {item}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </section>

        {/* ====================================================
            LOADING
        ===================================================== */}
        {loading && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center text-sm font-bold text-blue-700">
            <span className="material-symbols-outlined mr-2 align-middle animate-spin">
              autorenew
            </span>
            Mengambil data dari MySQL...
          </div>
        )}

        {/* ====================================================
            ERROR
        ===================================================== */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* ====================================================
            DATA
        ===================================================== */}
        {record &&
          !loading && (
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

              {/* HEADER DATA */}
              <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <h3 className="text-lg font-bold text-slate-700">
                    Data Triwulan{' '}
                    {
                      [
                        'I',
                        'II',
                        'III',
                        'IV',
                      ][
                        record.quarter -
                          1
                      ]
                    }
                  </h3>

                  <p className="text-xs text-slate-500">
                    {record.indicator.name}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  Status:{' '}
                  {
                    record.submission
                      .status
                  }
                </span>
              </div>

              {/* ==================================================
                  TARGET & REALISASI
              =================================================== */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">

                <p className="md:col-span-2 -mb-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                  Data Aktual IKU · sumber Google Sheets (read-only)
                </p>

                {/* TARGET */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Target
                  </p>

                  <p className="text-5xl font-black text-slate-700">
                    {formatValue(record.actualIku.targetValue)}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {record.actualIku.unit ?? 'Satuan belum diatur'}
                  </p>
                </div>

                {/* REALISASI */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Realisasi
                  </p>

                  <p className="text-5xl font-black text-emerald-600">
                    {formatValue(record.actualIku.realizationValue)}
                  </p>

                  <p className="mt-2 text-xs text-emerald-700">
                    {record.actualIku.unit ?? 'Satuan belum diatur'}
                  </p>
                </div>
              </div>

              {/* ==================================================
                  BUKTI DUKUNG
              =================================================== */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="mb-3 text-sm font-bold text-slate-700">
                  Bukti Dukung
                </h4>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      'Enter'
                    ) {
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(event) =>
                    event.preventDefault()
                  }
                  onDrop={handleDrop}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <span className="material-symbols-outlined mb-2 text-[32px] text-slate-400">
                    upload_file
                  </span>

                  <p className="text-sm font-bold text-slate-700">
                    Tarik file ke sini atau klik untuk memilih
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    PDF, JPG, PNG, atau XLSX.
                    File akan disimpan ke Google Drive.
                  </p>

                  {selectedFile && (
                    <p className="mt-4 text-sm font-bold text-blue-600">
                      {selectedFile.name}
                    </p>
                  )}
                </div>

                <label className="mt-4 block text-sm font-bold text-slate-700">
                  Tautan Bukti Dukung (opsional jika mengunggah file)
                  <input
                    type="url"
                    value={evidenceLink}
                    onChange={(event) => setEvidenceLink(event.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-normal outline-none focus:border-blue-500"
                  />
                </label>

                <div className="mt-4 flex items-center justify-between gap-4">

                  {record.evidenceFileUrl && (
                    <span className="text-xs font-medium text-emerald-600">
                      Bukti sudah tercatat.
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={
                      (!selectedFile && !evidenceLink.trim()) ||
                      record.actualIku.targetValue === null ||
                      record.actualIku.realizationValue === null ||
                      uploading
                    }
                    className="ml-auto rounded-lg bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {uploading
                      ? 'Menyimpan...'
                      : 'Kirim & Ajukan'}
                  </button>
                </div>
              </div>

              {/* SUCCESS */}
              {message && (
                <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <span>{message}</span>
                  <Link
                    href="/riwayat-pengajuan"
                    className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Lihat di Riwayat Pengajuan &rarr;
                  </Link>
                </div>
              )}
            </section>
          )}
      </div>
    </div>
  );
}

export default function InputRealisasiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Memuat data realisasi...</div>}>
      <InputRealisasiContent />
    </Suspense>
  );
}
