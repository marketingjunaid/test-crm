import { getAuditLog, saveAuditLog } from '../store/storage';
import type { AuditLog } from '../types';

export function logAudit(
  userId: string,
  userName: string,
  action: AuditLog['action'],
  module: string,
  entityId: string,
  description: string
) {
  const existing = getAuditLog();
  const entry: AuditLog = {
    id: crypto.randomUUID(),
    userId,
    userName,
    action,
    module,
    entityId,
    description,
    timestamp: new Date().toISOString(),
  };
  // Keep max 500 entries, newest first
  saveAuditLog([entry, ...existing].slice(0, 500));
}
