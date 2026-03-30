import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";

process.env.FIREBASE_PROJECT_ID ||= "summa-board";
process.env.FIREBASE_STORAGE_BUCKET ||= "summa-board.firebasestorage.app";

const {
  claimMeetingIngestJob,
  completeMeetingIngestJob,
  enqueueMeetingIngestJob,
  failMeetingIngestJob,
  getMeetingIngestJobById,
  requeueMeetingIngestJob,
} = await import("../src/lib/db/repo.ts");

function buildId(prefix: string) {
  return `${prefix}-${crypto.randomBytes(6).toString("hex")}`;
}

test("claimMeetingIngestJob leases queued jobs and increments attempts", async () => {
  const meetingId = buildId("meeting");
  const recordingId = buildId("recording");
  const { jobId } = await enqueueMeetingIngestJob({
    meetingId,
    orgId: "org-queue",
    recordingId,
    recordingUrl: "https://example.com/recording.mp4",
  });

  const claimed = await claimMeetingIngestJob(jobId, { leaseMs: 60_000 });
  const job = await getMeetingIngestJobById(jobId);

  assert.equal(claimed, "claimed");
  assert.equal(job?.status, "processing");
  assert.equal(job?.attemptCount, 1);
  assert.equal(typeof job?.lastAttemptAt, "number");
  assert.equal(typeof job?.leaseExpiresAt, "number");
  assert.equal(job?.error, null);
});

test("failMeetingIngestJob keeps retryable jobs in queue with a next attempt", async () => {
  const meetingId = buildId("meeting");
  const recordingId = buildId("recording");
  const { jobId } = await enqueueMeetingIngestJob({
    meetingId,
    orgId: "org-queue",
    recordingId,
    recordingUrl: "https://example.com/recording.mp4",
  });

  await claimMeetingIngestJob(jobId);
  await failMeetingIngestJob({
    jobId,
    error: "GEMINI_HTTP_503:boom",
    retryable: true,
    nextAttemptAt: Date.now() + 30_000,
  });

  const job = await getMeetingIngestJobById(jobId);
  assert.equal(job?.status, "queued");
  assert.equal(job?.error, "GEMINI_HTTP_503:boom");
  assert.equal(typeof job?.nextAttemptAt, "number");
  assert.equal(job?.leaseExpiresAt, null);
});

test("completeMeetingIngestJob stores processor metadata and requeueMeetingIngestJob reopens failed jobs", async () => {
  const completedMeetingId = buildId("meeting");
  const completedRecordingId = buildId("recording");
  const completed = await enqueueMeetingIngestJob({
    meetingId: completedMeetingId,
    orgId: "org-queue",
    recordingId: completedRecordingId,
    recordingUrl: "https://example.com/completed.mp4",
  });

  await claimMeetingIngestJob(completed.jobId);
  await completeMeetingIngestJob({
    jobId: completed.jobId,
    mode: "mock",
    model: "mock-model",
  });

  const completedJob = await getMeetingIngestJobById(completed.jobId);
  assert.equal(completedJob?.status, "completed");
  assert.equal(completedJob?.processorMode, "mock");
  assert.equal(completedJob?.processorModel, "mock-model");
  assert.equal(typeof completedJob?.completedAt, "number");

  const failedMeetingId = buildId("meeting");
  const failedRecordingId = buildId("recording");
  const failed = await enqueueMeetingIngestJob({
    meetingId: failedMeetingId,
    orgId: "org-queue",
    recordingId: failedRecordingId,
    recordingUrl: "https://example.com/failed.mp4",
  });

  await claimMeetingIngestJob(failed.jobId);
  await failMeetingIngestJob({
    jobId: failed.jobId,
    error: "MEETING_INGEST_RECORDING_TOO_LARGE",
    retryable: false,
  });
  await requeueMeetingIngestJob({
    jobId: failed.jobId,
    error: null,
  });

  const failedJob = await getMeetingIngestJobById(failed.jobId);
  assert.equal(failedJob?.status, "queued");
  assert.equal(failedJob?.error, null);
  assert.equal(typeof failedJob?.nextAttemptAt, "number");
});
