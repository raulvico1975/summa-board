import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("daily recording webhook delegates queue work to the durable drain helper", async () => {
  const source = await readFile(new URL("../app/api/webhooks/daily/recording-complete/route.ts", import.meta.url), "utf8");
  assert.equal(source.includes('import { drainMeetingIngestQueue } from "@/src/lib/jobs/drainMeetingIngestQueue";'), true);
  assert.equal(source.includes("await drainMeetingIngestQueue({"), true);
});

test("owner ops route supports queue drain and requeue actions", async () => {
  const source = await readFile(new URL("../app/api/owner/ops/meeting-ingest/route.ts", import.meta.url), "utf8");
  assert.equal(source.includes('action: z.enum(["drain", "requeue"])'), true);
  assert.equal(source.includes("await requeueMeetingIngestJob({ jobId: body.jobId });"), true);
  assert.equal(source.includes("orgId: owner.orgId"), true);
});

test("signup now records legal acceptance and contact data", async () => {
  const route = await readFile(new URL("../app/api/auth/entity-signup/route.ts", import.meta.url), "utf8");
  assert.equal(route.includes("acceptPrivacy: z.literal(true)"), true);
  assert.equal(route.includes("acceptTerms: z.literal(true)"), true);
  assert.equal(route.includes("contactEmail: body.email.toLowerCase()"), true);
  assert.equal(route.includes('legalAcceptedVersion: "2026-03-26"'), true);
});

test("manual recording registration enforces file and text cost guards", async () => {
  const source = await readFile(new URL("../app/api/owner/recordings/register/route.ts", import.meta.url), "utf8");
  assert.equal(source.includes("MAX_MANUAL_RECORDING_TEXT_CHARS"), true);
  assert.equal(source.includes("MAX_MANUAL_RECORDING_FILE_BYTES"), true);
  assert.equal(source.includes("recordingTextTooLarge"), true);
  assert.equal(source.includes("recordingTooLarge"), true);
});

test("public marketing surface exposes guided operation, offer and FAQ sections", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.equal(source.includes("stepsTitle"), true);
  assert.equal(source.includes("offerTitle"), true);
  assert.equal(source.includes("faqTitle"), true);
});
