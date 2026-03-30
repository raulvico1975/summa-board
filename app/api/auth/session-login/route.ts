import { NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth } from "@/src/lib/firebase/admin";
import { SESSION_COOKIE_NAME } from "@/src/lib/firebase/auth";
import { getOwnerOrgByUid } from "@/src/lib/db/repo";
import { consumeRateLimitServer } from "@/src/lib/rate-limit-server";
import { getRequestI18nFromNextRequest } from "@/src/i18n/request";
import { reportApiUnexpectedError } from "@/src/lib/monitoring/report";
import { getClientIp, isTrustedSameOrigin } from "@/src/lib/security/request";
import type { NextRequest } from "next/server";

const bodySchema = z.object({
  idToken: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const { i18n } = getRequestI18nFromNextRequest(request);
  try {
    if (!isTrustedSameOrigin(request)) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 403 });
    }

    const ip = getClientIp(request);
    if (!(await consumeRateLimitServer(`session-login:${ip}`, 20, 10 * 60_000))) {
      return NextResponse.json({ error: i18n.errors.rateLimited }, { status: 429 });
    }

    const body = bodySchema.parse(await request.json());
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const decoded = await adminAuth.verifyIdToken(body.idToken);
    const userRecord = await adminAuth.getUser(decoded.uid);
    if (!userRecord.emailVerified) {
      return NextResponse.json({ error: "verify_email_required" }, { status: 403 });
    }

    const ownerOrg = await getOwnerOrgByUid(decoded.uid);

    if (!ownerOrg) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 403 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(body.idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ ok: true });
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000,
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error) {
    await reportApiUnexpectedError({
      route: "/api/auth/session-login",
      action: "intentàvem iniciar la sessió d'una entitat",
      error,
    });

    return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 401 });
  }
}
