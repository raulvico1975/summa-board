import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPollById, replacePollOptions } from "@/src/lib/db/repo";
import {
  isSubscriptionRequiredError,
  requireActiveSubscription,
  subscriptionRequiredResponse,
} from "@/src/lib/auth/require-active-subscription";
import { getOwnerFromRequest } from "@/src/lib/firebase/auth";
import { getRequestI18nFromNextRequest } from "@/src/i18n/request";
import { reportApiUnexpectedError } from "@/src/lib/monitoring/report";
import { isTrustedSameOrigin } from "@/src/lib/security/request";
import { consumeOwnerRateLimit } from "@/src/lib/rate-limit-owner";
import {
  OWNER_MUTATION_RATE_WINDOW_MS,
  OWNER_POLL_MUTATION_MAX_HITS,
} from "@/src/lib/meetings/ingest-policy";

export const runtime = "nodejs";

const bodySchema = z.object({
  pollId: z.string().trim().min(1),
  optionsIso: z.array(z.string().min(10)).min(1).max(20),
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

    if (
      !(await consumeOwnerRateLimit({
        request,
        owner,
        scope: "owner-update-poll-options",
        maxHits: OWNER_POLL_MUTATION_MAX_HITS,
        windowMs: OWNER_MUTATION_RATE_WINDOW_MS,
      }))
    ) {
      return NextResponse.json({ error: i18n.errors.rateLimited }, { status: 429 });
    }

    const body = bodySchema.parse(await request.json());
    const poll = await getPollById(body.pollId);

    if (!poll || poll.orgId !== owner.orgId) {
      return NextResponse.json({ error: i18n.errors.pollNotFound }, { status: 404 });
    }

    const validDates = body.optionsIso.filter((value) => !Number.isNaN(new Date(value).getTime()));
    if (validDates.length === 0) {
      return NextResponse.json({ error: i18n.errors.invalidOptionDates }, { status: 400 });
    }

    await replacePollOptions({
      pollId: body.pollId,
      optionsIso: validDates,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isSubscriptionRequiredError(error)) {
      return subscriptionRequiredResponse();
    }

    const message =
      error instanceof Error && error.message === "POLL_NOT_EDITABLE"
        ? i18n.poll.editOptionsLocked
        : i18n.poll.editOptionsError;

    await reportApiUnexpectedError({
      route: "/api/owner/polls/update-options",
      action: "intentàvem actualitzar les opcions de data i hora d'una votació",
      error,
    });

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
