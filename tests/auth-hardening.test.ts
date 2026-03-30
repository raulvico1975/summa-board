import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

test("password login requires verified email and rate limits access", async () => {
  const source = await fs.readFile("app/api/auth/password-login/route.ts", "utf8");

  assert.equal(source.includes("consumeRateLimitServer(`login:${ip}`"), true);
  assert.equal(source.includes("const userRecord = await adminAuth.getUser(decoded.uid);"), true);
  assert.equal(source.includes("!userRecord.emailVerified"), true);
  assert.equal(source.includes('error: "verify_email"'), true);
  assert.equal(source.includes("sendVerificationEmailWithIdToken"), true);
  assert.equal(source.includes('resent: verificationEmailSent ? "1" : "0"'), true);
});

test("session login rejects unverified owners", async () => {
  const source = await fs.readFile("app/api/auth/session-login/route.ts", "utf8");

  assert.equal(source.includes("consumeRateLimitServer(`session-login:${ip}`"), true);
  assert.equal(source.includes("const userRecord = await adminAuth.getUser(decoded.uid);"), true);
  assert.equal(source.includes("!userRecord.emailVerified"), true);
  assert.equal(source.includes('error: "verify_email_required"'), true);
});

test("signup requests email verification through the controlled backend flow", async () => {
  const source = await fs.readFile("src/components/entity-signup-form.tsx", "utf8");

  assert.equal(source.includes('fetch("/api/auth/request-email-verification"'), true);
  assert.equal(source.includes('"/api/auth/session-login"'), false);
  assert.equal(source.includes('href={withLocalePath(locale, "/verify-email")}'), true);
});

test("email verification resend route is rate limited and uses the auth REST helper", async () => {
  const source = await fs.readFile("app/api/auth/request-email-verification/route.ts", "utf8");

  assert.equal(source.includes("consumeRateLimitServer(`verify-email:${ip}`"), true);
  assert.equal(source.includes("signInWithPassword"), true);
  assert.equal(source.includes("sendVerificationEmailWithIdToken"), true);
  assert.equal(source.includes('status: "already_verified"'), true);
});

test("login page surfaces a verification banner and preserves the email across the retry flow", async () => {
  const source = await fs.readFile("app/login/page.tsx", "utf8");

  assert.equal(source.includes("verifyBannerTitle"), true);
  assert.equal(source.includes("verifyBannerSent"), true);
  assert.equal(source.includes("verifyBannerCta"), true);
  assert.equal(source.includes("initialEmail={resolvedSearchParams?.email}"), true);
  assert.equal(source.includes("verify-email?email="), true);
});

test("daily webhook auth fails closed in production when the bearer token is missing", async () => {
  const source = await fs.readFile("src/lib/meetings/daily.ts", "utf8");

  assert.equal(source.includes('return process.env.NODE_ENV !== "production" || serverEnv.dailyMockMode;'), true);
});
