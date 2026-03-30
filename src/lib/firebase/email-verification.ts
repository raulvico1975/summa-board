import type { NextRequest } from "next/server";
import { withLocalePath } from "@/src/i18n/routing";
import type { I18nLocale } from "@/src/i18n/config";

export function buildVerificationContinueUrl(request: NextRequest, locale: I18nLocale): string | null {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const requestUrl = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = request.headers.get("host")?.split(",")[0]?.trim() ?? requestUrl.host;
  const origin = `${forwardedProto || requestUrl.protocol.replace(":", "")}://${forwardedHost || host}`;
  const continueUrl = new URL(withLocalePath(locale, "/login"), origin);
  continueUrl.searchParams.set("verified", "1");
  return continueUrl.toString();
}
