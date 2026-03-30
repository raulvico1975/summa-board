import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { Timestamp } from "firebase-admin/firestore";

process.env.FIREBASE_PROJECT_ID ||= "summa-board";
process.env.FIREBASE_STORAGE_BUCKET ||= "summa-board.firebasestorage.app";

const { adminDb } = await import("../src/lib/firebase/admin.ts");
const { getPollById, replacePollOptions } = await import("../src/lib/db/repo.ts");
import { readFile } from "node:fs/promises";

function buildId(prefix: string) {
  return `${prefix}-${crypto.randomBytes(6).toString("hex")}`;
}

async function seedEditablePoll(status: "open" | "close_failed" = "open") {
  const pollId = buildId("poll-edit");
  const oldOptionId = buildId("option-old");

  await adminDb.collection("polls").doc(pollId).set({
    orgId: "org-test",
    title: `Poll ${pollId}`,
    description: "Poll for editing proposed options",
    timezone: "Europe/Madrid",
    slug: buildId("slug"),
    status,
    winningOptionId: oldOptionId,
    createdAt: Timestamp.now(),
    closedAt: status === "close_failed" ? Timestamp.now() : null,
    closeError: status === "close_failed" ? { code: "X", message: "failed", at: Date.now() } : null,
  });

  await adminDb.collection("polls").doc(pollId).collection("options").doc(oldOptionId).set({
    startsAt: Timestamp.fromDate(new Date("2026-04-02T09:00:00.000Z")),
  });

  return { pollId, oldOptionId };
}

test("replacePollOptions rewrites proposed slots and reopens a failed close state", async () => {
  const { pollId, oldOptionId } = await seedEditablePoll("close_failed");

  await replacePollOptions({
    pollId,
    optionsIso: ["2026-04-05T10:00:00.000Z", "2026-04-06T16:30:00.000Z"],
  });

  const poll = await getPollById(pollId);
  const oldOptionSnap = await adminDb.collection("polls").doc(pollId).collection("options").doc(oldOptionId).get();

  assert.equal(oldOptionSnap.exists, false);
  assert.equal(poll?.status, "open");
  assert.equal(poll?.winningOptionId, null);
  assert.equal(poll?.closedAt, null);
  assert.equal(poll?.closeError, null);
  assert.deepEqual(
    poll?.options.map((option) => option.startsAt.toDate().toISOString()),
    ["2026-04-05T10:00:00.000Z", "2026-04-06T16:30:00.000Z"]
  );
});

test("poll management page exposes the proposed dates editor while the poll is still editable", async () => {
  const source = await readFile(new URL("../app/polls/[pollId]/page.tsx", import.meta.url), "utf8");

  assert.equal(source.includes('import { PollOptionsEditor } from "@/src/components/polls/poll-options-editor";'), true);
  assert.equal(source.includes("<PollOptionsEditor"), true);
  assert.equal(source.includes("i18n.poll.editOptionsTitle"), true);
});
