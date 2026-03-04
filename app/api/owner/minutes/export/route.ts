import { NextRequest, NextResponse } from "next/server";
import { getOwnerFromRequest } from "@/src/lib/firebase/auth";
import { getMeetingById } from "@/src/lib/db/repo";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) {
    return new NextResponse("No autoritzat", { status: 401 });
  }

  const meetingId = request.nextUrl.searchParams.get("meetingId");
  if (!meetingId) {
    return new NextResponse("Missing meetingId", { status: 400 });
  }

  const meeting = await getMeetingById(meetingId);
  if (!meeting || meeting.orgId !== owner.orgId) {
    return new NextResponse("No autoritzat", { status: 403 });
  }

  const latestMinutes = meeting.minutes[0];
  if (!latestMinutes) {
    return new NextResponse("No hi ha acta", { status: 404 });
  }

  return new NextResponse(latestMinutes.minutesMarkdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename=acta-${meeting.id}.md`,
    },
  });
}
