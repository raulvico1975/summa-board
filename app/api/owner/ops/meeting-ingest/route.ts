import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { drainMeetingIngestQueue } from "@/src/lib/jobs/drainMeetingIngestQueue";
import {
  getMeetingIngestJobById,
  requeueMeetingIngestJob,
} from "@/src/lib/db/repo";
import {
  isSubscriptionRequiredError,
  requireActiveSubscription,
  subscriptionRequiredResponse,
} from "@/src/lib/auth/require-active-subscription";
import { getOwnerFromRequest } from "@/src/lib/firebase/auth";
import { getRequestI18nFromNextRequest } from "@/src/i18n/request";
import { reportApiUnexpectedError } from "@/src/lib/monitoring/report";
import { isTrustedSameOrigin } from "@/src/lib/security/request";
import { consumeOwnerRateLimit } from "@/src/lib/rate-limit-owner";
import {
  OWNER_MUTATION_RATE_WINDOW_MS,
  OWNER_QUEUE_MUTATION_MAX_HITS,
} from "@/src/lib/meetings/ingest-policy";

export const runtime = "nodejs";

const bodySchema = z.object({
  action: z.enum(["drain", "requeue"]),
  jobId: z.string().min(1).optional(),
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

    if (
      !(await consumeOwnerRateLimit({
        request,
        owner,
        scope: "owner-ops-ingest",
        maxHits: OWNER_QUEUE_MUTATION_MAX_HITS,
        windowMs: OWNER_MUTATION_RATE_WINDOW_MS,
      }))
    ) {
      return NextResponse.json({ error: i18n.errors.rateLimited }, { status: 429 });
    }

    const body = bodySchema.parse(await request.json());

    if (body.action === "requeue") {
      if (!body.jobId) {
        return NextResponse.json({ error: i18n.errors.invalidPayload }, { status: 400 });
      }

      const job = await getMeetingIngestJobById(body.jobId);
      if (!job || job.orgId !== owner.orgId) {
        return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 403 });
      }

      await requeueMeetingIngestJob({ jobId: body.jobId });
      const summary = await drainMeetingIngestQueue({
        jobIds: [body.jobId],
        limit: 1,
      });

      return NextResponse.json({ ok: true, summary });
    }

    const summary = await drainMeetingIngestQueue({
      orgId: owner.orgId,
      limit: 3,
    });

    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    if (isSubscriptionRequiredError(error)) {
      return subscriptionRequiredResponse();
    }

    await reportApiUnexpectedError({
      route: "/api/owner/ops/meeting-ingest",
      action: "intentàvem recuperar la cua de processament de reunions",
      error,
    });

    return NextResponse.json({ error: i18n.errors.generic }, { status: 400 });
  }
}
