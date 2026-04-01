import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { StatusBadge } from "@/src/components/ui/status-badge";
import { DeleteVoteButton } from "@/src/components/polls/delete-vote-button";
import { ClosePollForm } from "@/src/components/polls/close-poll-form";
import { CopyVoteLinkButton } from "@/src/components/polls/copy-vote-link-button";
import { getPollById, getPollVoteRows, getUsableMeetingIdByPollId } from "@/src/lib/db/repo";
import { formatDateTime } from "@/src/lib/dates";
import { requireOwnerPage } from "@/src/lib/ui/owner-page";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";

export default async function PollManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ pollId: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { locale, i18n } = await getRequestI18n();
  const owner = await requireOwnerPage();
  const { pollId } = await params;
  const { created } = await searchParams;
  const showCreatedState = created === "1";

  const poll = await getPollById(pollId);
  if (!poll || poll.orgId !== owner.orgId) {
    notFound();
  }

  const [rows, usableMeetingId] = await Promise.all([
    getPollVoteRows(poll.id, i18n.poll.participant),
    getUsableMeetingIdByPollId(poll.id),
  ]);
  const effectivePollStatus = poll.status === "closed" && !usableMeetingId ? "close_failed" : poll.status;
  const displayStatus =
    effectivePollStatus === "closing"
      ? "processing"
      : effectivePollStatus === "close_failed"
        ? "error"
        : effectivePollStatus;
  const canClosePoll = effectivePollStatus === "open" || effectivePollStatus === "close_failed";
  const showRetryRoomCreation = effectivePollStatus === "close_failed" && !usableMeetingId;

  const options = poll.options.map((option) => ({
    id: option.id,
    label: formatDateTime(option.startsAt, locale),
  }));
  const voteRows = rows.map((row) => ({
    ...row,
    selectedCount: Object.values(row.availabilityByOptionId).filter(Boolean).length,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {poll.title}
          </h1>
          <p className="mt-1 break-all text-sm text-slate-600">/{poll.slug}</p>
        </div>
        <StatusBadge status={displayStatus} labels={i18n.status} />
      </div>

      <Card className={showCreatedState ? "border-emerald-200 bg-emerald-50/40" : undefined}>
        <CardHeader>
          <h2 className="text-base font-semibold">
            {showCreatedState ? i18n.poll.justCreatedTitle : i18n.poll.nextStepsTitle}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCreatedState ? <p className="text-sm text-slate-700">{i18n.poll.justCreatedHint}</p> : null}
          <div className="grid gap-2 text-sm text-slate-700">
            <p>{i18n.poll.stepShare}</p>
            <p>{i18n.poll.stepCollect}</p>
            <p>{canClosePoll ? i18n.poll.stepClose : i18n.poll.stepClosed}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
              {i18n.poll.votesReceived}: {rows.length}
            </span>
            {usableMeetingId ? (
              <Link
                className="rounded-md border border-slate-300 px-3 py-2 text-center font-medium transition-colors hover:bg-slate-50"
                href={withLocalePath(locale, `/owner/meetings/${usableMeetingId}`)}
              >
                {i18n.poll.openMeeting}
              </Link>
            ) : null}
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <CopyVoteLinkButton slug={poll.slug} />
            <Link
              className="rounded-md bg-sky-500 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-sky-600"
              href={withLocalePath(locale, `/p/${poll.slug}/results`)}
            >
              {i18n.poll.openPublicResults}
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">{i18n.poll.voteManagementTitle}</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">{i18n.poll.voteManagementHint}</p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {i18n.poll.voteManagementGuardrail}
          </p>
          {voteRows.length === 0 ? (
            <p className="text-sm text-slate-600">{i18n.poll.noVotesYet}</p>
          ) : (
            voteRows.map((row) => (
              <div
                key={row.voterId}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-slate-900">{row.voterName}</p>
                  <Badge className="mt-1 border-slate-200 bg-white text-slate-600">
                    {i18n.poll.selectedOptions}: {row.selectedCount}/{options.length}
                  </Badge>
                </div>
                <DeleteVoteButton pollId={poll.id} voterId={row.voterId} voterName={row.voterName} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {canClosePoll ? (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold">
              {showRetryRoomCreation ? i18n.poll.retryRoomCreationTitle : i18n.poll.closePoll}
            </h2>
          </CardHeader>
          <CardContent>
            <ClosePollForm
              pollId={poll.id}
              options={options}
              initialWinningOptionId={poll.winningOptionId ?? options[0]?.id ?? ""}
              lockOptionSelection={showRetryRoomCreation && !!poll.winningOptionId}
              submitLabel={showRetryRoomCreation ? i18n.poll.retryRoomCreation : undefined}
              loadingLabel={showRetryRoomCreation ? i18n.poll.retryingRoomCreation : undefined}
              helperText={showRetryRoomCreation ? i18n.poll.retryRoomCreationHint : undefined}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
