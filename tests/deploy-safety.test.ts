import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

test("package exposes a safe production deploy command", async () => {
  const source = await fs.readFile("package.json", "utf8");

  assert.equal(source.includes('"deploy:prod:safe": "bash scripts/deploy-production-safe.sh"'), true);
});

test("manual deploy workflow uses the safe deploy command and runtime secrets", async () => {
  const source = await fs.readFile(".github/workflows/deploy.yml", "utf8");

  assert.equal(source.includes("google-github-actions/setup-gcloud@v2"), true);
  assert.equal(source.includes("run: npm run deploy:prod:safe"), true);
  assert.equal(source.includes("DAILY_API_KEY: ${{ secrets.DAILY_API_KEY }}"), true);
  assert.equal(source.includes("STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}"), true);
});

test("safe deploy script restores runtime env and verifies public routes", async () => {
  const source = await fs.readFile("scripts/deploy-production-safe.sh", "utf8");

  assert.equal(source.includes("write_sanitized_env"), true);
  assert.equal(source.includes("configure_runtime"), true);
  assert.equal(source.includes('for route in "/" "/login" "/verify-email"; do'), true);
  assert.equal(source.includes('ensure_secret_binding "DAILY_API_KEY" "required"'), true);
  assert.equal(source.includes('ensure_secret_binding "STRIPE_SECRET_KEY" "required"'), true);
});
