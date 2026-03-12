import type { Transaction } from '../data';

export type OutRemittanceInconsistencyReason =
  | 'PARENT_MARKED_PROCESSED_WITHOUT_ACTIVE_CHILDREN'
  | 'REMITTANCE_DOC_UNDONE_BUT_PARENT_STILL_PROCESSED';

export interface OutRemittanceParentLike {
  amount?: number | null;
  isRemittance?: boolean | null;
  remittanceStatus?: Transaction['remittanceStatus'] | null;
  parentTransactionId?: string | null;
}

export function isOutRemittanceParent(
  parent: OutRemittanceParentLike
): boolean {
  return (parent.amount ?? 0) < 0 && !parent.parentTransactionId;
}

export function isProcessedOutRemittanceParent(
  parent: OutRemittanceParentLike
): boolean {
  if (!isOutRemittanceParent(parent)) {
    return false;
  }

  return parent.isRemittance === true || parent.remittanceStatus === 'complete';
}

export function isUndoneRemittanceDocumentStatus(status: unknown): boolean {
  return typeof status === 'string' && status.startsWith('undone');
}

export function detectOutRemittanceInconsistencies(params: {
  parent: OutRemittanceParentLike;
  activeChildrenCount: number;
  remittanceDocumentStatus?: unknown;
}): OutRemittanceInconsistencyReason[] {
  const { parent, activeChildrenCount, remittanceDocumentStatus } = params;

  if (!isOutRemittanceParent(parent)) {
    return [];
  }

  const reasons: OutRemittanceInconsistencyReason[] = [];
  const isProcessedParent = isProcessedOutRemittanceParent(parent);

  if (isProcessedParent && activeChildrenCount === 0) {
    reasons.push('PARENT_MARKED_PROCESSED_WITHOUT_ACTIVE_CHILDREN');
  }

  if (isProcessedParent && isUndoneRemittanceDocumentStatus(remittanceDocumentStatus)) {
    reasons.push('REMITTANCE_DOC_UNDONE_BUT_PARENT_STILL_PROCESSED');
  }

  return reasons;
}

export function shouldRepairOutRemittanceParent(params: {
  parent: OutRemittanceParentLike;
  activeChildrenCount: number;
  remittanceDocumentStatus?: unknown;
}): boolean {
  return detectOutRemittanceInconsistencies(params).length > 0;
}
