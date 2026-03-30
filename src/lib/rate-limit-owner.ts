import type { NextRequest } from "next/server";
import type { OwnerContext } from "@/src/lib/firebase/auth";
import { consumeRateLimitServer } from "@/src/lib/rate-limit-server";
import { getClientIp } from "@/src/lib/security/request";

export async function consumeOwnerRateLimit(input: {
  request: NextRequest;
  owner: Pick<OwnerContext, "orgId" | "uid">;
  scope: string;
  maxHits: number;
  windowMs: number;
}): Promise<boolean> {
  const ip = getClientIp(input.request);
  const key = `${input.scope}:${input.owner.orgId}:${input.owner.uid}:${ip}`;
  return consumeRateLimitServer(key, input.maxHits, input.windowMs);
}
