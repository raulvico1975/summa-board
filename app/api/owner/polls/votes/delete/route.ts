import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteVoteByVoterId, getPollById } from "@/src/lib/db/repo";
import {
  isSubscriptionRequiredError,
  requireActiveSubscription,
  subscriptionRequiredResponse,
} from "@/src/lib/auth/require-active-subscription";
import { getOwnerFromRequest } from "@/src/lib/firebase/auth";
import { reportApiUnexpectedError } from "@/src/lib/monitoring/report";
import { isTrustedSameOrigin } from "@/src/lib/security/request";
import { getRequestI18nFromNextRequest } from "@/src/i18n/request";

export const runtime = "nodejs";

const bodySchema = z.object({
  pollId: z.string().min(1),
  voterId: z.string().min(1),
});

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
    requireActiveSubscription(owner);

    const body = bodySchema.parse(await request.json());
    const poll = await getPollById(body.pollId);

    if (!poll) {
      return NextResponse.json({ error: i18n.errors.pollNotFound }, { status: 404 });
    }

    if (poll.orgId !== owner.orgId) {
      return NextResponse.json({ error: i18n.errors.unauthorized }, { status: 403 });
    }

    const deleted = await deleteVoteByVoterId({
      pollId: body.pollId,
      voterId: body.voterId,
    });

    if (!deleted) {
      return NextResponse.json({ error: i18n.errors.voteNotFound }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isSubscriptionRequiredError(error)) {
      return subscriptionRequiredResponse();
    }

    await reportApiUnexpectedError({
      route: "/api/owner/polls/votes/delete",
      action: "intentàvem esborrar un vot individual",
      error,
    });

    return NextResponse.json({ error: i18n.errors.generic }, { status: 400 });
  }
}
