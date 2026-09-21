import { prisma } from '@/lib/prisma';

/** Aksi yang ditampilkan sebagai kategori pada halaman Log Aktivitas. */
export type ActivityActionType =
  | 'VALIDASI'
  | 'PENOLAKAN'
  | 'INPUT DATA'
  | 'MASTER DATA'
  | 'IMPORT'
  | 'LOGIN'
  | 'DELETE';

type LogActivityInput = {
  req: Request;
  userId?: number | string | null;
  userName: string;
  userRole: string;
  actionType: ActivityActionType;
  description: string;
  moduleReference: string;
  referenceType?: string;
  referenceId?: number | string | null;
  metadataJson?: Record<string, unknown>;
};

function requestIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || '127.0.0.1';
  return req.headers.get('x-real-ip')?.trim() || '127.0.0.1';
}

/**
 * Menulis audit log tanpa menggagalkan transaksi utama apabila pencatatan
 * audit sedang bermasalah. Schema aplikasi yang sudah ada menyimpan kategori
 * pada kolom `action`, sedangkan identitas snapshot user/role disimpan pula
 * di metadata agar tetap tersedia walau akun kelak dihapus.
 */
export async function logActivity(input: LogActivityInput) {
  const parsedUserId = Number(input.userId);
  const parsedReferenceId = Number(input.referenceId);
  const action = input.actionType.replace(/\s+/g, '_');

  try {
    return await prisma.activityLog.create({
      data: {
        userId: Number.isInteger(parsedUserId) && parsedUserId > 0 ? parsedUserId : undefined,
        module: input.moduleReference,
        action,
        description: input.description,
        referenceType: input.referenceType,
        referenceId: Number.isInteger(parsedReferenceId) ? parsedReferenceId : undefined,
        ipAddress: requestIp(input.req),
        metadataJson: {
          ...(input.metadataJson ?? {}),
          userName: input.userName,
          userRole: input.userRole,
          actionType: input.actionType,
        },
      },
    });
  } catch (error) {
    console.error('[ACTIVITY_LOG_CREATE_ERROR]', error);
    return null;
  }
}
