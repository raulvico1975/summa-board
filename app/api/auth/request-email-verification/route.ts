import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth } from "@/src/lib/firebase/admin";
import { getOwnerOrgByUid } from "@/src/lib/db/repo";
import { consumeRateLimitServer } from "@/src/lib/rate-limit-server";
import { getRequestI18nFromNextRequest } from "@/src/i18n/request";
import { reportApiUnexpectedError } from "@/src/lib/monitoring/report";
import { getClientIp, isTrustedSameOrigin } from "@/src/lib/security/request";
import { sendVerificationEmailWithIdToken, signInWithPassword } from "@/src/lib/firebase/identity-toolkit";
import { buildVerificationContinueUrl } from "@/src/lib/firebase/email-verification";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(120),
});

export async function POST(request: NextRequest) {
  const { locale, i18n } = getRequestI18nFromNextRequest(request);

  try {
    if (!isTrustedSameOrigin(request)) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 403 });
    }

    const ip = getClientIp(request);
    if (!(await consumeRateLimitServer(`verify-email:${ip}`, 10, 10 * 60_000))) {
      return NextResponse.json({ error: i18n.errors.rateLimited }, { status: 429 });
    }

    const body = bodySchema.parse(await request.json());
    const authResult = await signInWithPassword(body.email.toLowerCase(), body.password);
    if (!authResult) {
      return NextResponse.json({ error: i18n.login.error }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(authResult.idToken);
    const userRecord = await adminAuth.getUser(decoded.uid);
    if (userRecord.emailVerified) {
      return NextResponse.json({ ok: true, status: "already_verified" as const });
    }

    const ownerOrg = await getOwnerOrgByUid(decoded.uid);
    if (!ownerOrg) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 403 });
    }

    const sent = await sendVerificationEmailWithIdToken({
      idToken: authResult.idToken,
      continueUrl: buildVerificationContinueUrl(request, locale),
    });

    if (!sent) {
      return NextResponse.json({ error: i18n.signup.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, status: "sent" as const });
  } catch (error) {
    await reportApiUnexpectedError({
      route: "/api/auth/request-email-verification",
      action: "intentàvem reenviar el correu de verificació d'una entitat",
      error,
    });

    return NextResponse.json({ error: i18n.signup.error }, { status: 400 });
  }
}
