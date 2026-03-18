import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getMeetingById,
  startMeetingIngestRetry,
  updateMeetingIngestJobStatus,
  updateMeetingRecordingState,
} from "@/src/lib/db/repo";
import { processMeetingIngestJob } from "@/src/lib/jobs/processMeetingIngestJob";
import {
  isSubscriptionRequiredError,
  requireActiveSubscription,
  subscriptionRequiredResponse,
} from "@/src/lib/auth/require-active-subscription";
import { getOwnerFromRequest } from "@/src/lib/firebase/auth";
import {
  reportApiUnexpectedError,
  reportServerUnexpectedError,
} from "@/src/lib/monitoring/report";
import { isTrustedSameOrigin } from "@/src/lib/security/request";
import { getRequestI18nFromNextRequest } from "@/src/i18n/request";

export const runtime = "nodejs";

const bodySchema = z.object({
  meetingId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const { i18n } = getRequestI18nFromNextRequest(request);

  try {
    if (!isTrustedSameOrigin(request)) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 403 });
    }

    const owner = await getOwnerFromRequest(request);
    if (!owner) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 401 });
    }
    requireActiveSubscription(owner);

    const body = bodySchema.parse(await request.json());
    const meeting = await getMeetingById(body.meetingId);

    if (!meeting || meeting.orgId !== owner.orgId) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 403 });
    }

    const retry = await startMeetingIngestRetry({ meetingId: meeting.id });

    if (!retry.ok) {
      const status = retry.reason === "meeting_not_found" || retry.reason === "ingest_missing" ? 404 : 409;
      return NextResponse.json({ error: i18n.meeting.retryIngestUnavailable }, { status });
    }

    void (async () => {
      try {
        await processMeetingIngestJob({
          meetingId: meeting.id,
          recordingId: retry.recordingId,
          recordingUrl: retry.recordingUrl,
        });

        await updateMeetingIngestJobStatus({
          jobId: retry.jobId,
          status: "completed",
          error: null,
        });
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : "MEETING_INGEST_UNKNOWN_ERROR";

        await updateMeetingRecordingState({
          meetingId: meeting.id,
          recordingStatus: "error",
          recordingUrl: retry.recordingUrl,
          recoveryState: "retry_failed",
          recoveryReason: reason,
        });

        await updateMeetingIngestJobStatus({
          jobId: retry.jobId,
          status: "error",
          error: reason,
          lastErrorAt: Date.now(),
        });

        await reportServerUnexpectedError({
          stage: "owner.meetings.retry-ingest.processMeetingIngestJob",
          error,
          dedupeKey: `owner-retry-ingest:${meeting.id}:${retry.recordingId}`,
        });
      }
    })();

    return NextResponse.json({ ok: true, status: "processing" });
  } catch (error) {
    if (isSubscriptionRequiredError(error)) {
      return subscriptionRequiredResponse();
    }

    await reportApiUnexpectedError({
      route: "/api/owner/meetings/retry-ingest",
      action: "intentàvem reintentar el processament d'una gravació de reunió",
      error,
    });

    return NextResponse.json({ error: i18n.meeting.retryIngestUnavailable }, { status: 400 });
  }
}
