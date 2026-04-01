import assert from "node:assert/strict";
import test from "node:test";
import { getClientIp, isTrustedSameOrigin } from "@/src/lib/security/request";

function makeRequest({
  method = "POST",
  headers = {},
}: {
  method?: string;
  headers?: Record<string, string>;
}) {
  return {
    method,
    headers: new Headers(headers),
  } as unknown as Parameters<typeof isTrustedSameOrigin>[0];
}

test("client ip prefers the Cloudflare connecting ip header", () => {
  const request = makeRequest({
    headers: {
      "cf-connecting-ip": "203.0.113.10",
      "x-real-ip": "203.0.113.11",
      "x-forwarded-for": "203.0.113.12, 203.0.113.13",
    },
  });

  assert.equal(getClientIp(request), "203.0.113.10");
});

test("client ip falls back to x-real-ip and then x-forwarded-for", () => {
  const realIpRequest = makeRequest({
    headers: {
      "x-real-ip": "203.0.113.11",
      "x-forwarded-for": "203.0.113.12, 203.0.113.13",
    },
  });

  const forwardedRequest = makeRequest({
    headers: {
      "x-forwarded-for": "203.0.113.12, 203.0.113.13",
    },
  });

  assert.equal(getClientIp(realIpRequest), "203.0.113.11");
  assert.equal(getClientIp(forwardedRequest), "203.0.113.12");
});

test("trusted same origin requires matching hosts on non-get requests", () => {
  const trustedRequest = makeRequest({
    headers: {
      host: "summareu.app",
      origin: "https://summareu.app",
    },
  });

  const untrustedRequest = makeRequest({
    headers: {
      host: "summareu.app",
      origin: "https://evil.example",
    },
  });

  assert.equal(isTrustedSameOrigin(trustedRequest), true);
  assert.equal(isTrustedSameOrigin(untrustedRequest), false);
});
