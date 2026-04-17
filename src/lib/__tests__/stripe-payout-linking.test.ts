import test from 'node:test';
import assert from 'node:assert/strict';

import type { StripeRecentPayout } from '../stripe/payout-api';
import {
  STRIPE_PAYOUT_LINK_TOLERANCE,
  assessStripePayoutLink,
  selectSuggestedStripePayout,
} from '../stripe/payout-linking';

function toUnixDay(date: string): number {
  return Math.floor(new Date(`${date}T12:00:00Z`).getTime() / 1000);
}

function buildPayout(overrides: Partial<StripeRecentPayout>): StripeRecentPayout {
  return {
    id: 'po_default',
    date: toUnixDay('2026-04-09'),
    amount: 11.57,
    currency: 'eur',
    arrivalDate: toUnixDay('2026-04-09'),
    created: toUnixDay('2026-04-09'),
    status: 'paid',
    preview: {
      paymentCount: 1,
      firstDisplayName: 'Test Donor',
      secondDisplayName: null,
    },
    ...overrides,
  };
}

test('selectSuggestedStripePayout auto-selects the unique amount match with near date', () => {
  const payouts: StripeRecentPayout[] = [
    buildPayout({ id: 'po_far', arrivalDate: toUnixDay('2026-04-01'), created: toUnixDay('2026-04-01') }),
    buildPayout({ id: 'po_match', arrivalDate: toUnixDay('2026-04-09'), created: toUnixDay('2026-04-09') }),
    buildPayout({ id: 'po_off_amount', amount: 21.17, arrivalDate: toUnixDay('2026-04-16') }),
  ];

  const suggestion = selectSuggestedStripePayout({
    payouts,
    bankAmount: 11.57,
    bankDate: '2026-04-09',
  });

  assert.deepEqual(suggestion, {
    payoutId: 'po_match',
    reason: 'amount_matches_and_date_is_near',
  });
});

test('selectSuggestedStripePayout stays empty when multiple same-amount candidates remain ambiguous', () => {
  const payouts: StripeRecentPayout[] = [
    buildPayout({ id: 'po_same_a', arrivalDate: toUnixDay('2026-04-09'), created: toUnixDay('2026-04-09') }),
    buildPayout({ id: 'po_same_b', arrivalDate: toUnixDay('2026-04-10'), created: toUnixDay('2026-04-10') }),
  ];

  const suggestion = selectSuggestedStripePayout({
    payouts,
    bankAmount: 11.57,
    bankDate: '2026-04-09',
  });

  assert.equal(suggestion, null);
});

test('assessStripePayoutLink marks payouts outside tolerance as blocked', () => {
  const assessment = assessStripePayoutLink({
    payout: buildPayout({
      id: 'po_mismatch',
      amount: 21.17,
      arrivalDate: toUnixDay('2026-04-16'),
      created: toUnixDay('2026-04-16'),
    }),
    bankAmount: 11.57,
    bankDate: '2026-04-09',
  });

  assert.equal(assessment.canLink, false);
  assert.equal(assessment.withinTolerance, false);
  assert.equal(assessment.amountDifference, 9.6);
  assert.equal(assessment.dateDeltaDays, 7);
});

test('assessStripePayoutLink reuses the official tolerance of two cents', () => {
  const assessment = assessStripePayoutLink({
    payout: buildPayout({
      amount: 11.59,
      arrivalDate: toUnixDay('2026-04-09'),
      created: toUnixDay('2026-04-09'),
    }),
    bankAmount: 11.57,
    bankDate: '2026-04-09',
  });

  assert.equal(STRIPE_PAYOUT_LINK_TOLERANCE, 0.02);
  assert.equal(assessment.withinTolerance, true);
  assert.equal(assessment.canLink, true);
  assert.equal(assessment.isDateNear, true);
});
