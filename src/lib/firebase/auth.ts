import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/src/lib/firebase/admin";
import type { OrgDoc, OrgPlan, OrgSubscriptionStatus } from "@/src/lib/db/types";
import { getLocalizedProductCopy } from "@/src/lib/product/config";

export const SESSION_COOKIE_NAME = "__session";

export type OwnerContext = {
  uid: string;
  orgId: string;
  orgName: string;
  contactName: string | null;
  contactEmail: string | null;
  subscriptionStatus: OrgSubscriptionStatus;
  plan: OrgPlan;
  recordingLimitMinutes: number;
};

async function resolveOwnerContext(uid: string): Promise<OwnerContext | null> {
  const productCopy = getLocalizedProductCopy("ca");
  const canonicalDoc = await adminDb.collection("orgs").doc(uid).get();
  if (canonicalDoc.exists) {
    const data = canonicalDoc.data() as OrgDoc;
    return {
      uid,
      orgId: canonicalDoc.id,
      orgName: data.name ?? productCopy.workspaceFallbackName,
      contactName: data.contactName ?? null,
      contactEmail: data.contactEmail ?? null,
      subscriptionStatus: data.subscriptionStatus ?? "none",
      plan: data.plan ?? "basic",
      recordingLimitMinutes: data.recordingLimitMinutes ?? 90,
    };
  }

  // Backward compatibility for older org ids that were not owner uid.
  const legacySnap = await adminDb
    .collection("orgs")
    .where("ownerUid", "==", uid)
    .limit(1)
    .get();

  const orgDoc = legacySnap.docs[0];
  if (!orgDoc) {
    return null;
  }

  const data = orgDoc.data() as OrgDoc;
  return {
    uid,
    orgId: orgDoc.id,
    orgName: data.name ?? productCopy.workspaceFallbackName,
    contactName: data.contactName ?? null,
    contactEmail: data.contactEmail ?? null,
    subscriptionStatus: data.subscriptionStatus ?? "none",
    plan: data.plan ?? "basic",
    recordingLimitMinutes: data.recordingLimitMinutes ?? 90,
  };
}

export async function getSessionUidFromRequest(request: NextRequest): Promise<string | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function getOwnerFromRequest(request: NextRequest): Promise<OwnerContext | null> {
  const uid = await getSessionUidFromRequest(request);
  if (!uid) {
    return null;
  }

  return resolveOwnerContext(uid);
}

export async function getOwnerFromServerCookies(): Promise<OwnerContext | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return resolveOwnerContext(decoded.uid);
  } catch {
    return null;
  }
}
