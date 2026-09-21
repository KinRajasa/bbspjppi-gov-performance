import { Readable } from 'node:stream';
import { google } from 'googleapis';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

function getDriveClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Konfigurasi Google Drive belum lengkap: GOOGLE_SERVICE_ACCOUNT_EMAIL dan GOOGLE_PRIVATE_KEY wajib diisi.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: [DRIVE_SCOPE],
  });

  return google.drive({ version: 'v3', auth });
}

export async function uploadEvidenceToDrive(input: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) throw new Error('GOOGLE_DRIVE_FOLDER_ID belum dikonfigurasi.');

  const drive = getDriveClient();
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._() -]/g, '_').slice(0, 180);
  const response = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: `bukti-${Date.now()}-${safeName}`,
      parents: [folderId],
    },
    media: {
      mimeType: input.mimeType || 'application/octet-stream',
      body: Readable.from(input.buffer),
    },
    fields: 'id,name,size,mimeType,webViewLink,webContentLink',
  });

  const fileId = response.data.id;
  if (!fileId) throw new Error('Google Drive tidak mengembalikan file ID.');

  // Mode publik sesuai kebutuhan saat ini: siapa pun yang memiliki link dapat
  // melihat file. Ubah GOOGLE_DRIVE_PUBLIC_LINK=false untuk deployment privat.
  if (process.env.GOOGLE_DRIVE_PUBLIC_LINK !== 'false') {
    try {
      await drive.permissions.create({
        fileId,
        supportsAllDrives: true,
        requestBody: { type: 'anyone', role: 'reader' },
        fields: 'id',
      });
    } catch (error) {
      // Jangan meninggalkan file yatim di Drive bila kebijakan organisasi
      // menolak permission publik.
      await drive.files.delete({ fileId, supportsAllDrives: true }).catch(() => undefined);
      throw new Error(`File berhasil diunggah tetapi permission publik ditolak Google Drive: ${error instanceof Error ? error.message : 'permission error'}`);
    }
  }

  return {
    fileId,
    fileName: response.data.name ?? safeName,
    mimeType: response.data.mimeType ?? input.mimeType,
    fileSize: Number(response.data.size ?? input.buffer.byteLength),
    viewUrl: response.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`,
    downloadUrl: response.data.webContentLink ?? null,
  };
}
