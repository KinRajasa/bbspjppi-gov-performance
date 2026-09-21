'use client';

import { useState } from 'react';

type QuarterValue = {
  quarter: number;
  targetValue: number | null;
  realizationValue: number | null;
  targetIsPercentage: boolean;
  realizationIsPercentage: boolean;
};

type Preview = {
  spreadsheetId: string;
  worksheetName: string;
  quarterValues: QuarterValue[];
  warnings: string[];
};

const indicators = [
  ['TJ 1', '1.1 Indeks Kepuasan Masyarakat (IKM)*'],
  ['TJ 2', '1.2 Jumlah perusahaan industri/pelaku usaha/instansi yang memanfaatkan layanan jasa industri*'],
  ['SK.1.1', '2.1 Persentase pelayanan tepat waktu sesuai Service Level Agreement (SLA)'],
  ['SK.1.2.', '2.2 Nilai Net Promoter Score (NPS)'],
  ['SK.2.1', '3.1 Indeks peningkatan Penerimaan Negara Bukan Pajak (PNBP)'],
  ['SK.2.2', '3.2 Jumlah hasil layanan jasa industri'],
  ['SK.2.3', '3.3 Nilai Revenue on Asset (RoA)'],
  ['SK.2.4', '3.4 Rasio Pendapatan Operasional terhadap Biaya Operasional (POBO)'],
  ['SK.3.1.', '4.1 Indeks Profesionalitas ASN (IPASN)'],
  ['S.K.4.1.', '5.1 Persentase jenis layanan yang datanya terintegrasi dengan sistem informasi BSKJI'],
  ['S.K.4.2', '5.2 Tingkat Penerapan Sistem Pemerintahan Berbasis Elektronik (SPBE)'],
  ['S.K.4.3.', '5.3 Indeks Pelayanan Publik (IPP)'],
  ['S.K.5.1.', '6.1 Persentase Rekomendasi hasil pengawasan internal telah ditindaklanjuti oleh satker'],
  ['S.K.5.2', '6.2 Nilai minimal hasil pengawasan kearsipan internal (Unit Kearsipan)'],
  ['S.K.6.1', '7.1 Nilai minimal Sistem Akuntabilitas Instansi Pemerintah (SAKIP) Satker'],
  ['S.K.6.2', '7.2 Nilai minimal Indikator Kinerja Pelaksanaan Anggaran IKPA'],
  ['S.K.6.3.', '7.3 Penilaian dan Analisis Laporan Keuangan'],
  ['S.K.7.1', '8.1 Persentase penggunaan Produk Dalam Negeri dalam pengadaan barang dan/atau jasa pemerintah']
];

/**
 * Format nilai untuk tampilan.
 *
 * Contoh:
 * 3.69  -> 3,69
 * 20    -> 20%
 *
 * isPercentage berasal dari format cell Google Sheets.
 */
function formatValue(
  value: number | null,
  isPercentage = false
) {
  if (value === null) {
    return 'Belum tersedia';
  }

  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 6,
  }).format(value);

  return isPercentage ? `${formatted}%` : formatted;
}

export default function IntegrasiSheetPage() {
  const [url, setUrl] = useState('');
  const [worksheet, setWorksheet] = useState('');
  const [tahun, setTahun] = useState('2026');
  const [syncKey, setSyncKey] = useState('');

  const [preview, setPreview] =
    useState<Preview | null>(null);

  const [loading, setLoading] =
    useState<'preview' | 'sync' | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function resetResult() {
    setPreview(null);
    setMessage('');
    setError('');
  }

  /**
   * ============================================================
   * BACA & PRATINJAU GOOGLE SHEET
   * ============================================================
   */
  async function handlePreview() {
    resetResult();

    const numericYear = Number(tahun);

    if (
      !url.trim() ||
      !worksheet ||
      !Number.isInteger(numericYear)
    ) {
      setError(
        'URL Google Spreadsheet, indikator, dan tahun wajib diisi.'
      );
      return;
    }

    setLoading('preview');

    try {
      const response = await fetch(
        '/api/google-sheets/preview',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spreadsheet: url.trim(),
            worksheetName: worksheet,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            'Google Spreadsheet tidak dapat dibaca.'
        );
      }

      if (
        !Array.isArray(result.quarterValues) ||
        result.quarterValues.length !== 4
      ) {
        throw new Error(
          'Data triwulan dari Google Spreadsheet tidak lengkap.'
        );
      }

      setPreview(result as Preview);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Google Spreadsheet tidak dapat dibaca.'
      );
    } finally {
      setLoading(null);
    }
  }

  /**
   * ============================================================
   * SYNC KE DATABASE
   * ============================================================
   */
  async function handleSync() {
    if (!preview) {
      setError(
        'Baca dan pratinjau spreadsheet terlebih dahulu.'
      );
      return;
    }

    setMessage('');
    setError('');
    setLoading('sync');

    try {
      const response = await fetch(
        '/api/google-sheets/sync',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(syncKey.trim()
              ? {
                  'x-sync-secret':
                    syncKey.trim(),
                }
              : {}),
          },
          body: JSON.stringify({
            indicatorCode: worksheet,
            year: Number(tahun),

            targetValues:
              preview.quarterValues.map(
                (item) => item.targetValue
              ),

            realizationValues:
              preview.quarterValues.map(
                (item) =>
                  item.realizationValue
              ),

            spreadsheetId:
              preview.spreadsheetId,

            spreadsheetUrl: url,

            worksheetName:
              preview.worksheetName,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            'Sinkronisasi database gagal.'
        );
      }

      setMessage(
        `${result.message} Submission ID: ${result.submissionId}.`
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Sinkronisasi database gagal.'
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="animation-fade-in w-full min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <header className="mb-6">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            Admin
          </p>

          <h2 className="text-2xl font-bold text-slate-800">
            Integrasi Spreadsheet XLSX Online
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Baca Target/Realisasi Triwulan I-IV dari Google Spreadsheet
            atau URL file XLSX online, tinjau, lalu simpan ke MySQL.
          </p>
        </header>

        {/* =====================================================
            MAIN CARD
        ====================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">

          {/* ===================================================
              URL GOOGLE SPREADSHEET
          ==================================================== */}
          <div>
            <label
              htmlFor="spreadsheet-url"
              className="block text-sm font-bold text-slate-700 mb-2"
            >
              URL Google Spreadsheet / XLSX Online
            </label>

            <input
              id="spreadsheet-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                resetResult();
              }}
              placeholder="https://docs.google.com/spreadsheets/d/.../edit atau https://domain/file.xlsx"
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />

            <p className="text-xs text-slate-500 mt-2">
              Google Spreadsheet harus dibagikan ke service account. Untuk XLSX
              online, URL harus dapat diunduh langsung oleh server tanpa login.
            </p>
          </div>

          {/* ===================================================
              WORKSHEET + TAHUN
          ==================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* WORKSHEET */}
            <div>
              <label
                htmlFor="worksheet"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                Worksheet / indikator
              </label>

              <select
                id="worksheet"
                value={worksheet}
                onChange={(e) => {
                  setWorksheet(e.target.value);
                  resetResult();
                }}
                className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition"
              >
                <option value="">
                  -- Pilih worksheet --
                </option>

                {indicators.map(
                  ([code, label]) => (
                    <option
                      key={code}
                      value={code}
                    >
                      {code} - {label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* TAHUN */}
            <div>
              <label
                htmlFor="tahun"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                Tahun anggaran
              </label>

              <input
                id="tahun"
                type="number"
                value={tahun}
                onChange={(e) => {
                  setTahun(e.target.value);
                  resetResult();
                }}
                className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* ===================================================
              BUTTON PREVIEW
          ==================================================== */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePreview}
              disabled={loading !== null}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 px-6 rounded-md text-sm transition"
            >
              {loading === 'preview'
                ? 'Membaca Spreadsheet...'
                : 'Baca & Pratinjau'}
            </button>
          </div>

          {/* ===================================================
              PREVIEW
          ==================================================== */}
          {preview && (
            <div className="border border-slate-200 rounded-lg p-5 mt-4">

              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700">
                  Hasil Google Spreadsheet
                </h3>

                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                  Siap disinkronkan
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="py-3 font-semibold text-left w-1/5">
                        NILAI
                      </th>

                      <th className="py-3 font-semibold w-1/5">
                        TW I
                      </th>

                      <th className="py-3 font-semibold w-1/5">
                        TW II
                      </th>

                      <th className="py-3 font-semibold w-1/5">
                        TW III
                      </th>

                      <th className="py-3 font-semibold w-1/5">
                        TW IV
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {/* TARGET */}
                    <tr>
                      <td className="py-4 font-bold text-slate-700 text-left">
                        Target
                      </td>

                      {preview.quarterValues.map(
                        (item) => (
                          <td
                            key={`target-${item.quarter}`}
                            className="py-4 text-slate-500"
                          >
                            {formatValue(
                              item.targetValue,
                              item.targetIsPercentage
                            )}
                          </td>
                        )
                      )}
                    </tr>

                    {/* REALISASI */}
                    <tr>
                      <td className="py-4 font-bold text-slate-700 text-left">
                        Realisasi
                      </td>

                      {preview.quarterValues.map(
                        (item) => (
                          <td
                            key={`realization-${item.quarter}`}
                            className="py-4 font-bold text-emerald-600"
                          >
                            {formatValue(
                              item.realizationValue,
                              item.realizationIsPercentage
                            )}
                          </td>
                        )
                      )}
                    </tr>

                  </tbody>
                </table>
              </div>

              {/* WARNINGS */}
              {preview.warnings.length > 0 && (
                <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                  {preview.warnings.join(' ')}
                </div>
              )}
            </div>
          )}

          {/* ===================================================
              SYNC SECRET
          ==================================================== */}
          <div className="mt-6">
            <label
              htmlFor="sync-secret"
              className="block text-sm font-bold text-slate-500 mb-2"
            >
              Kunci sync server (production)
            </label>

            <input
              id="sync-secret"
              type="password"
              value={syncKey}
              onChange={(e) =>
                setSyncKey(e.target.value)
              }
              placeholder="Isi jika server meminta x-sync-secret"
              className="w-full border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* ===================================================
              ERROR
          ==================================================== */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* ===================================================
              SUCCESS
          ==================================================== */}
          {message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}

          {/* ===================================================
              SYNC BUTTON
          ==================================================== */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSync}
              disabled={!preview || loading !== null}
              className="bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-md text-sm transition"
            >
              {loading === 'sync'
                ? 'Menyimpan...'
                : 'Sync to Database'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
