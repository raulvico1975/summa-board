import type { MeetingDoc, MeetingIngestJobDoc, OrgDoc } from "@/src/lib/db/types";
import { getOrgById, listMeetingIngestJobsByOrg, listPollsByOrg } from "@/src/lib/db/repo";
import { adminDb } from "@/src/lib/firebase/admin";

export type OwnerOpsAlert = {
  id: string;
  level: "warning" | "error";
  kind: "subscription_inactive" | "ingest_errors" | "stale_jobs";
};

export type OwnerOpsSnapshot = {
  org: (OrgDoc & { id: string }) | null;
  metrics: {
    openPolls: number;
    closedPolls: number;
    meetingsReady: number;
    meetingsProcessing: number;
    meetingsErrored: number;
    ingestQueued: number;
    ingestProcessing: number;
    ingestErrored: number;
  };
  alerts: OwnerOpsAlert[];
  recentJobs: Array<
    (MeetingIngestJobDoc & { id: string }) & {
      meetingTitle: string;
      meetingUrl: string | null;
    }
  >;
  recentMeetings: Array<(MeetingDoc & { id: string })>;
};

export async function getOwnerOpsSnapshot(orgId: string): Promise<OwnerOpsSnapshot> {
  const [org, polls, meetingsSnap, jobs] = await Promise.all([
    getOrgById(orgId),
    listPollsByOrg(orgId),
    adminDb.collection("meetings").where("orgId", "==", orgId).get(),
    listMeetingIngestJobsByOrg(orgId, 50),
  ]);

  const meetings = meetingsSnap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as MeetingDoc) }))
    .sort((left, right) => (right.createdAt ?? 0) - (left.createdAt ?? 0));

  const meetingById = new Map(meetings.map((meeting) => [meeting.id, meeting]));

  const metrics = {
    openPolls: polls.filter((poll) => poll.status === "open").length,
    closedPolls: polls.filter((poll) => poll.status === "closed").length,
    meetingsReady: meetings.filter((meeting) => meeting.recordingStatus === "ready").length,
    meetingsProcessing: meetings.filter((meeting) => meeting.recordingStatus === "processing").length,
    meetingsErrored: meetings.filter((meeting) => meeting.recordingStatus === "error").length,
    ingestQueued: jobs.filter((job) => job.status === "queued").length,
    ingestProcessing: jobs.filter((job) => job.status === "processing").length,
    ingestErrored: jobs.filter((job) => job.status === "error").length,
  };

  const now = Date.now();
  const alerts: OwnerOpsAlert[] = [];
  const staleJobs = jobs.filter(
    (job) =>
      job.status === "processing" &&
      typeof job.leaseExpiresAt === "number" &&
      job.leaseExpiresAt < now
  );

  if ((org?.subscriptionStatus ?? "none") !== "active") {
    alerts.push({
      id: "subscription",
      level: "warning",
      kind: "subscription_inactive",
    });
  }

  if (metrics.ingestErrored > 0) {
    alerts.push({
      id: "ingest-errors",
      level: "error",
      kind: "ingest_errors",
    });
  }

  if (staleJobs.length > 0) {
    alerts.push({
      id: "stale-jobs",
      level: "warning",
      kind: "stale_jobs",
    });
  }

  const recentJobs = jobs.slice(0, 20).map((job) => {
    const meeting = meetingById.get(job.meetingId);
    return {
      ...job,
      meetingTitle: meeting?.title ?? "Reunió",
      meetingUrl: meeting?.meetingUrl ?? null,
    };
  });

  return {
    org,
    metrics,
    alerts,
    recentJobs,
    recentMeetings: meetings.slice(0, 12),
  };
}
