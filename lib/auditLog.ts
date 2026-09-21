import { prisma } from './prisma';

export interface AuditLogPayload {
  userId?: number;
  module: string;
  action: 'VALIDASI' | 'PENOLAKAN' | 'INPUT_DATA' | 'MASTER_DATA' | string;
  description: string;
  referenceType?: string;
  referenceId?: number;
  ipAddress?: string;
  metadataJson?: Record<string, any>;
}

/**
 * Create an audit log entry (non-blocking, fire-and-forget style)
 * @param payload Audit log data
 */
export async function createAuditLog(payload: AuditLogPayload): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: payload.userId,
        module: payload.module,
        action: payload.action,
        description: payload.description,
        referenceType: payload.referenceType,
        referenceId: payload.referenceId,
        ipAddress: payload.ipAddress ?? '127.0.0.1',
        metadataJson: payload.metadataJson ?? {},
      },
    });
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR]', error);
  }
}