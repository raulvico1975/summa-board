import { NextRequest, NextResponse } from "next/server";
import { getMeetingById } from "@/src/lib/db/repo";
import { buildMeetingIcs } from "@/src/lib/ics";
import { timestampToDate } from "@/src/lib/dates";
import { getRequestI18nFromNextRequest } from "@/src/i18n/request";
import { reportApiUnexpectedError } from "@/src/lib/monitoring/report";
import { getOwnerFromRequest } from "@/src/lib/firebase/auth";
import { defaultTimezone } from "@/src/lib/firebase/env";
import { withLocalePath } from "@/src/i18n/routing";
import { getProductConfig } from "@/src/lib/product/config";

export const runtime = "nodejs";

function buildRequestOrigin(request: NextRequest): string {
  const requestUrl = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = request.headers.get("host")?.split(",")[0]?.trim() ?? requestUrl.host;
  const protocol = forwardedProto || requestUrl.protocol.replace(":", "");
  return `${protocol}://${forwardedHost || host}`;
}

export async function GET(request: NextRequest) {
  const { locale, i18n } = getRequestI18nFromNextRequest(request);
  const product = getProductConfig();
  try {
    const owner = await getOwnerFromRequest(request);
    if (!owner) {
      return new NextResponse(i18n.errors.unauthorized, { status: 401 });
    }

    const meetingId = request.nextUrl.searchParams.get("meetingId");
    if (!meetingId) {
      return new NextResponse(i18n.errors.missingMeetingId, { status: 400 });
    }

    const meeting = await getMeetingById(meetingId);
    if (!meeting || meeting.orgId !== owner.orgId) {
      return new NextResponse(i18n.errors.unauthorized, { status: 403 });
    }

    const startsAt = timestampToDate(meeting.scheduledAt);
    if (!startsAt) {
      return new NextResponse(i18n.errors.invalidMeetingDate, { status: 400 });
    }

    const joinUrl = new URL(withLocalePath(locale, `/join/${meeting.id}`), buildRequestOrigin(request)).toString();
    const joinLabel = locale === "ca" ? "Enllaç d'accés" : "Enlace de acceso";
    const baseDescription =
      meeting.description ??
      (locale === "ca"
        ? meeting.poll
          ? `Reunió generada des de la votació ${meeting.poll.slug}`
          : `Reunió creada a ${product.brandName}`
        : meeting.poll
          ? `Reunión generada desde la votación ${meeting.poll.slug}`
          : `Reunión creada en ${product.brandName}`);
    const ics = buildMeetingIcs({
      uid: `meeting-${meeting.id}@${product.canonicalHost}`,
      title: meeting.title,
      description: [baseDescription, `${joinLabel}: ${joinUrl}`].filter(Boolean).join("\n\n"),
      startsAt,
      timezone: meeting.poll?.timezone ?? defaultTimezone,
    });

    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename=meeting-${meeting.id}.ics`,
      },
    });
  } catch (error) {
    await reportApiUnexpectedError({
      route: "/api/public/ics",
      action: "intentàvem generar el fitxer de calendari d'una reunió",
      error,
    });
    return new NextResponse(i18n.errors.generic, { status: 500 });
  }
}
