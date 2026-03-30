import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth } from "@/src/lib/firebase/admin";
import { getOwnerOrgByUid } from "@/src/lib/db/repo";
import { SESSION_COOKIE_NAME } from "@/src/lib/firebase/auth";
import { consumeRateLimitServer } from "@/src/lib/rate-limit-server";
import { getRequestI18nFromNextRequest } from "@/src/i18n/request";
import { withLocalePath } from "@/src/i18n/routing";
import { reportApiUnexpectedError } from "@/src/lib/monitoring/report";
import { getClientIp, isTrustedSameOrigin } from "@/src/lib/security/request";
import { signInWithPassword } from "@/src/lib/firebase/identity-toolkit";
import { sendVerificationEmailWithIdToken } from "@/src/lib/firebase/identity-toolkit";
import { buildVerificationContinueUrl } from "@/src/lib/firebase/email-verification";

const bodySchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(120),
});

function buildLocalizedLocation(pathname: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return pathname;
  }

  const search = new URLSearchParams(params).toString();
  return `${pathname}?${search}`;
}

function redirect303(location: string): NextResponse {
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: location,
    },
  });
}

export async function POST(request: NextRequest) {
  const { locale } = getRequestI18nFromNextRequest(request);
  const loginPath = withLocalePath(locale, "/login");
  const dashboardPath = withLocalePath(locale, "/dashboard");

  try {
    if (!isTrustedSameOrigin(request)) {
      return redirect303(buildLocalizedLocation(loginPath, { error: "unauthorized" }));
    }

    const ip = getClientIp(request);
    if (!(await consumeRateLimitServer(`login:${ip}`, 12, 10 * 60_000))) {
      return redirect303(buildLocalizedLocation(loginPath, { error: "rate_limited" }));
    }

    const formData = await request.formData();
    const parsed = bodySchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return redirect303(buildLocalizedLocation(loginPath, { error: "unauthorized" }));
    }

    const authResult = await signInWithPassword(parsed.data.email, parsed.data.password);
    if (!authResult) {
      return redirect303(buildLocalizedLocation(loginPath, { error: "unauthorized" }));
    }

    const decoded = await adminAuth.verifyIdToken(authResult.idToken);
    const userRecord = await adminAuth.getUser(decoded.uid);
    if (!userRecord.emailVerified) {
      const verificationEmailSent = await sendVerificationEmailWithIdToken({
        idToken: authResult.idToken,
        continueUrl: buildVerificationContinueUrl(request, locale),
      });

      return redirect303(
        buildLocalizedLocation(loginPath, {
          error: "verify_email",
          resent: verificationEmailSent ? "1" : "0",
          email: parsed.data.email.toLowerCase(),
        })
      );
    }

    const ownerOrg = await getOwnerOrgByUid(decoded.uid);

    if (!ownerOrg) {
      return redirect303(buildLocalizedLocation(loginPath, { error: "unauthorized" }));
    }

    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(authResult.idToken, { expiresIn });

    const response = redirect303(buildLocalizedLocation(dashboardPath));
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
      route: "/api/auth/password-login",
      action: "intentàvem iniciar sessió amb correu i contrasenya",
      error,
    });

    return redirect303(buildLocalizedLocation(loginPath, { error: "unauthorized" }));
  }
}
