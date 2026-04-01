import type { OrgSubscriptionStatus } from "@/src/lib/db/types";

export const BILLING_GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

type BillingSubscriptionState = {
  subscriptionStatus?: OrgSubscriptionStatus | null;
  subscriptionPastDueAt?: number | null;
};

export function getBillingGraceDeadline(subscriptionPastDueAt: number | null | undefined): number | null {
  if (subscriptionPastDueAt == null) {
    return null;
  }

  return subscriptionPastDueAt + BILLING_GRACE_PERIOD_MS;
}

export function getBillingGraceDaysRemaining(
  subscriptionPastDueAt: number | null | undefined,
  now = Date.now()
): number {
  const deadline = getBillingGraceDeadline(subscriptionPastDueAt);
  if (deadline === null) {
    return 0;
  }

  return Math.max(0, Math.ceil((deadline - now) / (24 * 60 * 60 * 1000)));
}

export function isBillingGraceActive(
  state: BillingSubscriptionState,
  now = Date.now()
): boolean {
  if (state.subscriptionStatus !== "past_due") {
    return false;
  }

  const deadline = getBillingGraceDeadline(state.subscriptionPastDueAt);
  return deadline !== null && now < deadline;
}

export function canAccessOwnerFeatures(
  state: BillingSubscriptionState,
  now = Date.now()
): boolean {
  return state.subscriptionStatus === "active" || isBillingGraceActive(state, now);
}
