import type { Transaction } from '../data';
import { filterActiveRemittanceChildren } from './is-active-child';

export type ReturnRemittanceStatus = NonNullable<Transaction['remittanceStatus']>;
export type ReturnPendingItem = NonNullable<Transaction['pendingReturns']>[number];

export interface ReturnRemittanceChildLike {
  archivedAt?: unknown;
  contactId?: string | null;
  amount?: number | null;
  date?: string | null;
}

export type ReturnRemittanceReprocessMode =
  | 'reuse_active_children'
  | 'create_children_from_scratch'
  | 'recreate_active_children';

export interface ExistingReturnRemittanceState {
  remittanceStatus: ReturnRemittanceStatus;
  itemCount: number;
  resolvedCount: number;
  pendingCount: number;
  pendingTotalAmount: number;
  pendingReturnsData: ReturnPendingItem[] | null;
  activeChildrenCount: number;
  archivedChildrenCount: number;
}

function sumPendingReturnAmounts(pendingReturns: ReturnPendingItem[] | null | undefined): number {
  return pendingReturns?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
}

function buildPendingItemsFromChildren(
  children: ReturnRemittanceChildLike[]
): ReturnPendingItem[] | null {
  const pending = children
    .filter((child) => !child.contactId)
    .map((child) => ({
      iban: '',
      amount: Math.abs(child.amount || 0),
      date: child.date || '',
    }));

  return pending.length > 0 ? pending : null;
}

export function deriveReturnRemittanceStatus(params: {
  hasActiveChildren: boolean;
  resolvedCount: number;
  pendingCount: number;
}): ReturnRemittanceStatus {
  const { hasActiveChildren, resolvedCount, pendingCount } = params;

  if (!hasActiveChildren) {
    return 'pending';
  }

  if (pendingCount === 0) {
    return 'complete';
  }

  if (resolvedCount === 0) {
    return 'pending';
  }

  return 'partial';
}

export function determineReturnRemittanceReprocessMode(
  children: ReturnRemittanceChildLike[],
  forceRecreateChildren = false
): ReturnRemittanceReprocessMode {
  const activeChildren = filterActiveRemittanceChildren(children);

  if (forceRecreateChildren && activeChildren.length > 0) {
    return 'recreate_active_children';
  }

  if (activeChildren.length > 0) {
    return 'reuse_active_children';
  }

  return 'create_children_from_scratch';
}

export function buildExistingReturnRemittanceState(params: {
  children: ReturnRemittanceChildLike[];
  fallbackItemCount?: number | null;
  fallbackPendingReturns?: ReturnPendingItem[] | null;
}): ExistingReturnRemittanceState {
  const { children, fallbackItemCount, fallbackPendingReturns } = params;
  const activeChildren = filterActiveRemittanceChildren(children);
  const activeChildrenCount = activeChildren.length;
  const archivedChildrenCount = children.length - activeChildrenCount;
  const resolvedCount = activeChildren.filter((child) => !!child.contactId).length;
  const fallbackPendingCount = fallbackPendingReturns?.length ?? 0;
  const itemCount = activeChildrenCount > 0
    ? Math.max(fallbackItemCount ?? 0, activeChildrenCount)
    : Math.max(fallbackItemCount ?? 0, fallbackPendingCount);
  const pendingCount = activeChildrenCount > 0
    ? Math.max(0, itemCount - resolvedCount)
    : Math.max(itemCount, fallbackPendingCount);

  let pendingReturnsData: ReturnPendingItem[] | null;
  let pendingTotalAmount: number;

  if (activeChildrenCount === 0) {
    pendingReturnsData = fallbackPendingReturns ?? null;
    pendingTotalAmount = sumPendingReturnAmounts(pendingReturnsData);
  } else if (pendingCount === 0) {
    pendingReturnsData = null;
    pendingTotalAmount = 0;
  } else if (resolvedCount === 0 && fallbackPendingReturns) {
    pendingReturnsData = fallbackPendingReturns;
    pendingTotalAmount = sumPendingReturnAmounts(pendingReturnsData);
  } else {
    pendingReturnsData = buildPendingItemsFromChildren(activeChildren);
    pendingTotalAmount = sumPendingReturnAmounts(pendingReturnsData);
  }

  return {
    remittanceStatus: deriveReturnRemittanceStatus({
      hasActiveChildren: activeChildrenCount > 0,
      resolvedCount,
      pendingCount,
    }),
    itemCount,
    resolvedCount,
    pendingCount,
    pendingTotalAmount,
    pendingReturnsData,
    activeChildrenCount,
    archivedChildrenCount,
  };
}
