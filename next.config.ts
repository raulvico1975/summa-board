import type { NextConfig } from "next";
import path from "node:path";

const isDevelopment = process.env.NODE_ENV !== "production";
const rawDailyDomain = process.env.DAILY_DOMAIN ?? process.env.NEXT_PUBLIC_DAILY_DOMAIN ?? "";

function normalizeDailyOrigin(domain: string): string | null {
  const trimmed = domain.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return null;
  }

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return new URL(trimmed).origin;
    }
  } catch {
    return null;
  }

  if (trimmed.includes(".")) {
    return `https://${trimmed}`;
  }

  return `https://${trimmed}.daily.co`;
}

const dailyOrigin = normalizeDailyOrigin(rawDailyDomain);
const permissionsPolicy = [
  `camera=(${dailyOrigin ? `self "${dailyOrigin}"` : "self"})`,
  `microphone=(${dailyOrigin ? `self "${dailyOrigin}"` : "self"})`,
  `display-capture=(${dailyOrigin ? `self "${dailyOrigin}"` : "self"})`,
  "geolocation=()",
].join(", ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'self' https://*.daily.co https://*.daily.local https://daily.mock",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${
    isDevelopment ? " ws: http://localhost:* http://127.0.0.1:*" : ""
  } https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebasestorage.googleapis.com https://*.firebaseio.com https://generativelanguage.googleapis.com`,
  "media-src 'self' blob: https:",
].join("; ");

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: permissionsPolicy },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
