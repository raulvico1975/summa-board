import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { StatusBadge } from "@/src/components/ui/status-badge";
import { ResultsTable } from "@/src/components/polls/results-table";
import { ClosePollForm } from "@/src/components/polls/close-poll-form";
import { CopyVoteLinkButton } from "@/src/components/polls/copy-vote-link-button";
import { PollOptionsEditor } from "@/src/components/polls/poll-options-editor";
import { DeleteMeetingButton } from "@/src/components/meetings/delete-meeting-button";
import { MeetingShareActions } from "@/src/components/meetings/meeting-share-actions";
import { getMeetingById, getPollById, getPollVoteRows, getUsableMeetingIdByPollId } from "@/src/lib/db/repo";
import { formatDateTime, isBeforeTodayInAppTimeZone } from "@/src/lib/dates";
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
  const usableMeeting = usableMeetingId ? await getMeetingById(usableMeetingId) : null;
  const dashboardHref = withLocalePath(locale, "/dashboard");
  const effectivePollStatus = poll.status === "closed" && !usableMeetingId ? "close_failed" : poll.status;
  const displayStatus =
    effectivePollStatus === "closing"
      ? "processing"
      : effectivePollStatus === "close_failed"
        ? "error"
        : effectivePollStatus;
  const canClosePoll = effectivePollStatus === "open" || effectivePollStatus === "close_failed";
  const winningOption = poll.winningOptionId
    ? poll.options.find((option) => option.id === poll.winningOptionId) ?? null
    : null;
  const canDeletePoll =
    poll.status === "closed" && !!winningOption && isBeforeTodayInAppTimeZone(winningOption.startsAt);

  const options = poll.options.map((option) => ({
    id: option.id,
    label: formatDateTime(option.startsAt, locale),
  }));
  const closedFlowCopy = {
    ca: {
      title: "Convocatòria preparada",
      ics: "Descarregar ICS",
    },
    es: {
      title: "Convocatoria preparada",
      ics: "Descargar ICS",
    },
  } as const;
  const closedFlowText = closedFlowCopy[locale];
  const formattedWinningDate = winningOption ? formatDateTime(winningOption.startsAt, locale) : null;
  const meetingJoinPath = usableMeeting ? withLocalePath(locale, `/join/${usableMeeting.id}`) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {poll.title}
          </h1>
          {poll.description ? <p className="mt-1 break-words text-sm text-slate-600">{poll.description}</p> : null}
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
            {canDeletePoll ? <DeleteMeetingButton pollId={poll.id} redirectHref={dashboardHref} /> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">{i18n.poll.results}</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResultsTable options={options} rows={rows} i18n={i18n} />
          <div className="grid gap-2 text-sm sm:flex sm:flex-wrap">
            <CopyVoteLinkButton slug={poll.slug} />
            <Link
              className="rounded-md border border-slate-300 px-3 py-2 text-center font-medium transition-colors hover:bg-slate-100"
              href={withLocalePath(locale, `/p/${poll.slug}/results`)}
            >
              {i18n.poll.openPublicResults}
            </Link>
          </div>
        </CardContent>
      </Card>

      {canClosePoll ? (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold">{i18n.poll.editOptionsTitle}</h2>
          </CardHeader>
          <CardContent>
            <PollOptionsEditor
              pollId={poll.id}
              timezone={poll.timezone}
              initialOptionsIso={poll.options.map((option) => option.startsAt.toDate().toISOString())}
            />
          </CardContent>
        </Card>
      ) : null}

      {canClosePoll ? (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold">{i18n.poll.closePoll}</h2>
          </CardHeader>
          <CardContent>
            <ClosePollForm pollId={poll.id} options={options} />
          </CardContent>
        </Card>
      ) : null}

      {usableMeeting?.meetingUrl && formattedWinningDate ? (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold">{closedFlowText.title}</h2>
            <a
              href={`/api/public/ics?meetingId=${usableMeeting.id}`}
              className="rounded-md border border-slate-300 px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-slate-50"
            >
              {closedFlowText.ics}
            </a>
          </CardHeader>
          <CardContent>
            <MeetingShareActions
              locale={locale}
              meetingHref={meetingJoinPath ?? usableMeeting.meetingUrl}
              meetingTitle={poll.title}
              scheduledLabel={formattedWinningDate}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
