import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMeetingById, isMeetingUsable } from "@/src/lib/db/repo";
import { getOwnerFromRequest } from "@/src/lib/firebase/auth";
import { buildDailyJoinUrl, createDailyMeetingToken } from "@/src/lib/meetings/daily";
import { reportApiUnexpectedError } from "@/src/lib/monitoring/report";
import { consumeRateLimitServer } from "@/src/lib/rate-limit-server";
import { getClientIp, isTrustedSameOrigin } from "@/src/lib/security/request";
import { getRequestI18nFromNextRequest } from "@/src/i18n/request";

export const runtime = "nodejs";

const bodySchema = z.object({
  meetingId: z.string().min(1),
  displayName: z.string().trim().min(1).max(120).optional(),
});

function getJoinPreparationError(locale: "ca" | "es"): string {
  return locale === "ca"
    ? "No s'ha pogut preparar l'accés a la sala."
    : "No se ha podido preparar el acceso a la sala.";
}

export async function POST(request: NextRequest) {
  const { locale, i18n } = getRequestI18nFromNextRequest(request);

  try {
    if (!isTrustedSameOrigin(request)) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 403 });
    }

    const body = bodySchema.parse(await request.json());
    const meeting = await getMeetingById(body.meetingId);
    if (!meeting || !isMeetingUsable(meeting)) {
      return NextResponse.json({ error: i18n.errors.meetingNotFound }, { status: 404 });
    }

    if (!meeting.meetingUrl) {
      return NextResponse.json({ error: i18n.meeting.missingMeetingUrl }, { status: 400 });
    }

    const ip = getClientIp(request);
    const rateKey = `meeting-join:${meeting.id}:${ip}`;
    if (!(await consumeRateLimitServer(rateKey, 30, 10 * 60_000))) {
      return NextResponse.json({ error: i18n.errors.rateLimited }, { status: 429 });
    }

    const owner = await getOwnerFromRequest(request);
    const isOwner = owner?.orgId === meeting.orgId;
    const ownerDisplayName = isOwner ? owner.contactName?.trim() || owner.orgName.trim() : "";
    const displayName = body.displayName?.trim() || ownerDisplayName;

    if (!displayName) {
      return NextResponse.json({ error: i18n.errors.invalidPayload }, { status: 400 });
    }

    const token = await createDailyMeetingToken({
      meetingUrl: meeting.meetingUrl,
      userName: displayName,
      isOwner,
      locale,
    });

    return NextResponse.json({
      joinUrl: buildDailyJoinUrl(meeting.meetingUrl, token),
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? i18n.errors.invalidPayload
        : error instanceof Error && error.message === "DAILY_NOT_CONFIGURED"
          ? i18n.errors.dailyNotConfigured
          : getJoinPreparationError(locale);

    await reportApiUnexpectedError({
      route: "/api/public/meetings/join-token",
      action: "intentàvem preparar l'accés públic a una reunió",
      error,
    });

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
