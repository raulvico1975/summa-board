import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteMeetingCascade, getMeetingById, getMeetingIdByPollId, getPollById } from "@/src/lib/db/repo";
import {
  isSubscriptionRequiredError,
  requireActiveSubscription,
  subscriptionRequiredResponse,
} from "@/src/lib/auth/require-active-subscription";
import { getOwnerFromRequest } from "@/src/lib/firebase/auth";
import { reportApiUnexpectedError } from "@/src/lib/monitoring/report";
import { isTrustedSameOrigin } from "@/src/lib/security/request";
import { getRequestI18nFromNextRequest } from "@/src/i18n/request";

export const runtime = "nodejs";

const bodySchema = z.object({
  meetingId: z.string().min(1).optional(),
  pollId: z.string().min(1).optional(),
  confirmDeleteGeneratedMinutes: z.boolean().optional(),
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
    if (!body.meetingId && !body.pollId) {
      return NextResponse.json({ error: i18n.errors.invalidPayload }, { status: 400 });
    }

    const [requestedMeeting, requestedPoll] = await Promise.all([
      body.meetingId ? getMeetingById(body.meetingId) : Promise.resolve(null),
      body.pollId ? getPollById(body.pollId) : Promise.resolve(null),
    ]);

    if (body.meetingId && !requestedMeeting && !body.pollId) {
      return NextResponse.json({ error: i18n.errors.meetingNotFound }, { status: 404 });
    }

    if (body.pollId && !requestedPoll && !body.meetingId) {
      return NextResponse.json({ error: i18n.errors.pollNotFound }, { status: 404 });
    }

    const resolvedPoll =
      requestedPoll ?? (requestedMeeting?.pollId ? await getPollById(requestedMeeting.pollId) : null);
    const resolvedMeeting =
      requestedMeeting ??
      (body.pollId
        ? await (async () => {
            const meetingId = await getMeetingIdByPollId(body.pollId!);
            return meetingId ? getMeetingById(meetingId) : null;
          })()
        : null);

    if (!resolvedMeeting && !resolvedPoll) {
      return NextResponse.json({ error: i18n.errors.meetingNotFound }, { status: 404 });
    }

    if (resolvedMeeting && resolvedMeeting.orgId !== owner.orgId) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 403 });
    }

    if (resolvedPoll && resolvedPoll.orgId !== owner.orgId) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 403 });
    }

    const hasGeneratedMinutes = !!(
      resolvedMeeting &&
      ((resolvedMeeting.minutesDraft && resolvedMeeting.minutesDraft.trim().length > 0) ||
        resolvedMeeting.minutes.length > 0)
    );

    if (hasGeneratedMinutes && !body.confirmDeleteGeneratedMinutes) {
      return NextResponse.json(
        {
          error: i18n.meeting.deleteMinutesConfirmationRequired,
          requiresMinutesConfirmation: true,
        },
        { status: 409 }
      );
    }

    await deleteMeetingCascade({
      meetingId: resolvedMeeting?.id ?? null,
      pollId: resolvedPoll?.id ?? resolvedMeeting?.pollId ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isSubscriptionRequiredError(error)) {
      return subscriptionRequiredResponse();
    }

    await reportApiUnexpectedError({
      route: "/api/owner/meetings/delete",
      action: "intentàvem eliminar una reunió",
      error,
    });

    return NextResponse.json({ error: i18n.meeting.deleteError }, { status: 400 });
  }
}
