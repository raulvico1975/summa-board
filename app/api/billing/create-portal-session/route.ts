import { NextRequest, NextResponse } from "next/server";
import { getOwnerFromRequest } from "@/src/lib/firebase/auth";
import { getOrgById } from "@/src/lib/db/repo";
import { createStripeBillingPortalSession } from "@/src/lib/billing/stripe";
import { getRequestI18nFromNextRequest } from "@/src/i18n/request";
import { reportApiUnexpectedError } from "@/src/lib/monitoring/report";
import { isTrustedSameOrigin } from "@/src/lib/security/request";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { i18n } = getRequestI18nFromNextRequest(request);

  try {
    if (!isTrustedSameOrigin(request)) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 403 });
    }

    const owner = await getOwnerFromRequest(request);
    if (!owner) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 401 });
    }

    const org = await getOrgById(owner.orgId);
    if (!org || !org.stripeCustomerId) {
      return NextResponse.json({ error: "stripe_customer_missing" }, { status: 409 });
    }

    const session = await createStripeBillingPortalSession({
      customerId: org.stripeCustomerId,
    });

    return NextResponse.json({ portalUrl: session.url });
  } catch (error) {
    await reportApiUnexpectedError({
      route: "/api/billing/create-portal-session",
      action: "intentàvem obrir el portal de facturació de Stripe",
      error,
    });

    return NextResponse.json({ error: "stripe_portal_failed" }, { status: 400 });
  }
}
