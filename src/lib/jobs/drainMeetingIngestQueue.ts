import { adminDb } from "@/src/lib/firebase/admin";
import type { MeetingIngestJobDoc } from "@/src/lib/db/types";
import {
  claimMeetingIngestJob,
  completeMeetingIngestJob,
  failMeetingIngestJob,
  getMeetingById,
  getMeetingIngestJobById,
  listMeetingIngestJobsByOrg,
  updateMeetingRecordingState,
} from "@/src/lib/db/repo";
import { processMeetingIngestJob } from "@/src/lib/jobs/processMeetingIngestJob";
import { reportServerUnexpectedError } from "@/src/lib/monitoring/report";
import {
  buildMeetingIngestRetryDelayMs,
  classifyMeetingIngestError,
  MEETING_INGEST_DRAIN_BATCH,
  MEETING_INGEST_LEASE_MS,
  MEETING_INGEST_MAX_ATTEMPTS,
} from "@/src/lib/meetings/ingest-policy";

type QueueJob = MeetingIngestJobDoc & { id: string };

function isRunnableJob(job: QueueJob, now: number, force: boolean): boolean {
  if (job.status === "completed") {
    return false;
  }

  if (force) {
    return true;
  }

  if (job.status === "processing") {
    return (job.leaseExpiresAt ?? 0) <= now;
  }

  return (job.nextAttemptAt ?? 0) <= now;
}

function sortQueueJobs(left: QueueJob, right: QueueJob): number {
  const leftNext = left.nextAttemptAt ?? left.updatedAt ?? 0;
  const rightNext = right.nextAttemptAt ?? right.updatedAt ?? 0;
  if (leftNext !== rightNext) {
    return leftNext - rightNext;
  }

  return (left.updatedAt ?? 0) - (right.updatedAt ?? 0);
}

async function loadCandidateJobs(input: {
  orgId?: string;
  jobIds?: string[];
  force?: boolean;
}): Promise<QueueJob[]> {
  const uniqueJobIds = Array.from(new Set((input.jobIds ?? []).filter(Boolean)));

  if (uniqueJobIds.length > 0) {
    const resolved = await Promise.all(uniqueJobIds.map((jobId) => getMeetingIngestJobById(jobId)));
    return resolved.filter((job): job is QueueJob => job !== null);
  }

  if (input.orgId) {
    return listMeetingIngestJobsByOrg(input.orgId, 100);
  }

  const snap = await adminDb.collection("meeting_ingest_jobs").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as MeetingIngestJobDoc) }));
}

export async function drainMeetingIngestQueue(input?: {
  orgId?: string;
  jobIds?: string[];
  limit?: number;
  force?: boolean;
  reportStage?: string;
}): Promise<{
  inspected: number;
  processed: number;
  completed: number;
  retried: number;
  failed: number;
}> {
  const limit = Math.max(1, input?.limit ?? MEETING_INGEST_DRAIN_BATCH);
  const force = input?.force ?? false;
  const now = Date.now();
  const candidates = (await loadCandidateJobs({ orgId: input?.orgId, jobIds: input?.jobIds, force }))
    .filter((job) => isRunnableJob(job, now, force))
    .sort(sortQueueJobs)
    .slice(0, limit);

  const result = {
    inspected: candidates.length,
    processed: 0,
    completed: 0,
    retried: 0,
    failed: 0,
  };

  for (const job of candidates) {
    const claim = await claimMeetingIngestJob(job.id, {
      leaseMs: MEETING_INGEST_LEASE_MS,
      force,
    });

    if (claim !== "claimed") {
      continue;
    }

    result.processed += 1;

    try {
      const processed = await processMeetingIngestJob({
        meetingId: job.meetingId,
        recordingId: job.recordingId,
        recordingUrl: job.recordingUrl,
      });

      await completeMeetingIngestJob({
        jobId: job.id,
        mode: processed.mode,
        model: processed.model,
      });

      result.completed += 1;
    } catch (error) {
      const classified = classifyMeetingIngestError(error);
      const attemptCount = (job.attemptCount ?? 0) + 1;
      const retryable = classified.retryable && attemptCount < MEETING_INGEST_MAX_ATTEMPTS;
      const nextAttemptAt = retryable ? Date.now() + buildMeetingIngestRetryDelayMs(attemptCount) : null;

      await failMeetingIngestJob({
        jobId: job.id,
        error: classified.code,
        retryable,
        nextAttemptAt,
      });

      if (retryable) {
        await updateMeetingRecordingState({
          meetingId: job.meetingId,
          recordingStatus: "processing",
          recordingUrl: job.recordingUrl,
        });
        result.retried += 1;
        continue;
      }

      const meeting = await getMeetingById(job.meetingId);
      if (meeting) {
        await updateMeetingRecordingState({
          meetingId: job.meetingId,
          recordingStatus: "error",
          recordingUrl: job.recordingUrl,
        });
      }

      result.failed += 1;

      await reportServerUnexpectedError({
        stage: input?.reportStage ?? "meeting-ingest-queue",
        error,
        dedupeKey: `meeting-ingest:${job.meetingId}:${job.recordingId}:${classified.code}`,
      });
    }
  }

  return result;
}
