import { NextResponse } from "next/server";
import type { OwnerContext } from "@/src/lib/firebase/auth";
import { canAccessOwnerFeatures } from "@/src/lib/billing/subscription";

const SUBSCRIPTION_REQUIRED_CODE = "subscription_required";

export class SubscriptionRequiredError extends Error {
  status = 402;
  code = SUBSCRIPTION_REQUIRED_CODE;

  constructor() {
    super(SUBSCRIPTION_REQUIRED_CODE);
  }
}

export function requireActiveSubscription(
  owner: Pick<OwnerContext, "subscriptionStatus">
): void {
  if (!canAccessOwnerFeatures(owner)) {
    throw new SubscriptionRequiredError();
  }
}

export function isSubscriptionRequiredError(error: unknown): error is SubscriptionRequiredError {
  return error instanceof SubscriptionRequiredError;
}

export function subscriptionRequiredResponse() {
  return NextResponse.json({ error: SUBSCRIPTION_REQUIRED_CODE }, { status: 402 });
}
