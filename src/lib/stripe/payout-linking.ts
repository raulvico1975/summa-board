import type { StripeRecentPayout } from '@/lib/stripe/payout-api';

export const STRIPE_PAYOUT_LINK_TOLERANCE = 0.02;
export const STRIPE_PAYOUT_LINK_NEAR_DATE_DAYS = 1;

export interface StripePayoutLinkAssessment {
  payoutId: string;
  amountDifference: number;
  absoluteAmountDifference: number;
  withinTolerance: boolean;
  dateDeltaDays: number | null;
  isDateNear: boolean;
  canLink: boolean;
}

export interface StripeSuggestedPayoutSelection {
  payoutId: string;
  reason: 'amount_matches_and_date_is_near' | 'single_amount_match';
}

function normalizeDate(value: string | null | undefined): Date | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const parsed = new Date(`${trimmed}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function absoluteDayDelta(from: Date | null, toUnixSeconds: number): number | null {
  if (!from || !Number.isFinite(toUnixSeconds) || toUnixSeconds <= 0) {
    return null;
  }

  const to = new Date(toUnixSeconds * 1000);
  const deltaMs = Math.abs(to.getTime() - from.getTime());
  return Math.round(deltaMs / 86_400_000);
}

export function assessStripePayoutLink(input: {
  payout: StripeRecentPayout;
  bankAmount: number;
  bankDate: string | null | undefined;
}): StripePayoutLinkAssessment {
  const amountDifference = Number((input.payout.amount - input.bankAmount).toFixed(2));
  const absoluteAmountDifference = Math.abs(amountDifference);
  const dateDeltaDays = absoluteDayDelta(normalizeDate(input.bankDate), input.payout.arrivalDate || input.payout.created);
  const withinTolerance = absoluteAmountDifference <= STRIPE_PAYOUT_LINK_TOLERANCE;
  const isDateNear = dateDeltaDays != null && dateDeltaDays <= STRIPE_PAYOUT_LINK_NEAR_DATE_DAYS;

  return {
    payoutId: input.payout.id,
    amountDifference,
    absoluteAmountDifference,
    withinTolerance,
    dateDeltaDays,
    isDateNear,
    canLink: withinTolerance,
  };
}

export function selectSuggestedStripePayout(input: {
  payouts: StripeRecentPayout[];
  bankAmount: number;
  bankDate: string | null | undefined;
}): StripeSuggestedPayoutSelection | null {
  const assessed = input.payouts
    .map((payout) => ({
      payout,
      assessment: assessStripePayoutLink({
        payout,
        bankAmount: input.bankAmount,
        bankDate: input.bankDate,
      }),
    }))
    .filter((entry) => entry.assessment.withinTolerance);

  if (assessed.length === 0) {
    return null;
  }

  const nearDateMatches = assessed.filter((entry) => entry.assessment.isDateNear);
  if (nearDateMatches.length === 1) {
    return {
      payoutId: nearDateMatches[0].payout.id,
      reason: 'amount_matches_and_date_is_near',
    };
  }

  if (assessed.length === 1) {
    return {
      payoutId: assessed[0].payout.id,
      reason: 'single_amount_match',
    };
  }

  return null;
}
