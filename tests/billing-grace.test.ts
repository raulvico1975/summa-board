import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const {
  BILLING_GRACE_PERIOD_MS,
  canAccessOwnerFeatures,
  getBillingGraceDeadline,
  isBillingGraceActive,
} = await import("../src/lib/billing/subscription.ts");

test("billing grace period lasts three days", () => {
  const startedAt = 1_700_000_000_000;
  assert.equal(getBillingGraceDeadline(startedAt), startedAt + BILLING_GRACE_PERIOD_MS);
});

test("active and grace subscriptions can access owner features", () => {
  assert.equal(canAccessOwnerFeatures({ subscriptionStatus: "active" }), true);
  assert.equal(
    canAccessOwnerFeatures({
      subscriptionStatus: "past_due",
      subscriptionPastDueAt: 1_700_000_000_000,
    }, 1_700_000_000_000 + BILLING_GRACE_PERIOD_MS - 1),
    true
  );
});

test("expired grace period blocks owner features", () => {
  const pastDueAt = 1_700_000_000_000;

  assert.equal(
    isBillingGraceActive(
      {
        subscriptionStatus: "past_due",
        subscriptionPastDueAt: pastDueAt,
      },
      pastDueAt + BILLING_GRACE_PERIOD_MS + 1
    ),
    false
  );
  assert.equal(
    canAccessOwnerFeatures(
      {
        subscriptionStatus: "past_due",
        subscriptionPastDueAt: pastDueAt,
      },
      pastDueAt + BILLING_GRACE_PERIOD_MS + 1
    ),
    false
  );
  assert.equal(canAccessOwnerFeatures({ subscriptionStatus: "canceled" }), false);
  assert.equal(canAccessOwnerFeatures({ subscriptionStatus: "none" }), false);
});

test("stripe webhook updates support the grace period and reminder email", async () => {
  const [webhookSource, emailSource, caSource, esSource, billingPageSource] = await Promise.all([
    fs.readFile("app/api/webhooks/stripe/route.ts", "utf8"),
    fs.readFile("src/lib/notifications/billing-email.ts", "utf8"),
    fs.readFile("src/i18n/ca.ts", "utf8"),
    fs.readFile("src/i18n/es.extra.ts", "utf8"),
    fs.readFile("app/billing/page.tsx", "utf8"),
  ]);

  assert.equal(webhookSource.includes("invoice.payment_failed"), true);
  assert.equal(webhookSource.includes("invoice.payment_succeeded"), true);
  assert.equal(webhookSource.includes("subscriptionPastDueAt"), true);
  assert.equal(webhookSource.includes("notifyOwnerBillingPastDue"), true);
  assert.equal(emailSource.includes("billingPastDueSubject"), true);
  assert.equal(emailSource.includes("billingPastDueCta"), true);
  assert.equal(
    caSource.includes(
      "D'aquí a {days} dies carregarem la quota mensual acordada al mètode de pagament seleccionat."
    ),
    true
  );
  assert.equal(
    esSource.includes(
      "Dentro de {days} días cargaremos la cuota mensual acordada al método de pago seleccionado."
    ),
    true
  );
  assert.equal(billingPageSource.includes("graceDaysRemaining"), true);
});
