import Link from "next/link";
import { DeleteMeetingButton } from "@/src/components/meetings/delete-meeting-button";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { StatusBadge } from "@/src/components/ui/status-badge";
import { formatDateTime } from "@/src/lib/dates";
import { canDeletePastMeeting, getOwnerMeetings } from "@/src/lib/meetings/get-owner-meetings";
import { requireOwnerPage } from "@/src/lib/ui/owner-page";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";

function ArchiveSummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Card className="border-slate-200">
      <CardContent className="space-y-1 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function ArchivePage() {
  const { locale, i18n } = await getRequestI18n();
  const owner = await requireOwnerPage();
  const pastMeetings = await getOwnerMeetings(owner.orgId);
  const archiveHref = withLocalePath(locale, "/archive");
  const availableMinutesCount = pastMeetings.filter((meeting) => meeting.hasGeneratedMinutes).length;
  const pendingMinutesCount = pastMeetings.length - availableMinutesCount;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              {i18n.archive.title}
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">{i18n.archive.subtitle}</p>
            <p className="text-sm font-medium text-slate-500">{owner.orgName}</p>
          </div>
          <Link
            href={withLocalePath(locale, "/dashboard")}
            className="rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-slate-50"
          >
            {i18n.archive.backToDashboard}
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <ArchiveSummaryCard label={i18n.archive.summaryMeetings} value={pastMeetings.length} />
          <ArchiveSummaryCard label={i18n.archive.summaryMinutesReady} value={availableMinutesCount} />
          <ArchiveSummaryCard label={i18n.archive.summaryMinutesPending} value={pendingMinutesCount} />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{i18n.archive.repositoryTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{i18n.archive.repositoryDescription}</p>
        </div>

        {pastMeetings.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-slate-600">{i18n.archive.empty}</CardContent>
          </Card>
        ) : (
          pastMeetings.map((meeting) => (
            <Card key={meeting.meetingId ?? meeting.pollId}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  {meeting.meetingId ? (
                    <Link
                      href={withLocalePath(locale, `/owner/meetings/${meeting.meetingId}`)}
                      className="block break-words text-base font-semibold leading-tight text-slate-900 hover:underline"
                    >
                      {meeting.title}
                    </Link>
                  ) : (
                    <h3 className="break-words text-base font-semibold leading-tight text-slate-900">
                      {meeting.title}
                    </h3>
                  )}
                </div>
                <StatusBadge status={meeting.hasGeneratedMinutes ? "ready" : "pending"} labels={i18n.status} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm text-slate-600">
                  <p>
                    {i18n.meeting.meetingDateLabel}: {formatDateTime(meeting.scheduledAt, locale)}
                  </p>
                  <p>
                    {meeting.hasGeneratedMinutes ? i18n.archive.minutesReady : i18n.archive.minutesMissing}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  {meeting.meetingId ? (
                    <Link
                      href={withLocalePath(
                        locale,
                        meeting.hasGeneratedMinutes
                          ? `/owner/meetings/${meeting.meetingId}#minutes`
                          : `/owner/meetings/${meeting.meetingId}`
                      )}
                      className="rounded-md bg-sky-500 px-3 py-2 text-center font-medium text-white transition-colors hover:bg-sky-600"
                    >
                      {meeting.hasGeneratedMinutes ? i18n.archive.openMinutes : i18n.archive.openMeeting}
                    </Link>
                  ) : null}
                  {meeting.meetingId && meeting.hasGeneratedMinutes ? (
                    <a
                      href={`/api/owner/minutes/export?meetingId=${meeting.meetingId}`}
                      className="rounded-md border border-slate-300 px-3 py-2 text-center font-medium transition-colors hover:bg-slate-50"
                    >
                      {i18n.meeting.exportMinutesMd}
                    </a>
                  ) : null}
                  <Link
                    href={withLocalePath(locale, `/polls/${meeting.pollId}`)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-center font-medium transition-colors hover:bg-slate-50"
                  >
                    {i18n.dashboard.manage}
                  </Link>
                  <Link
                    href={withLocalePath(locale, `/p/${meeting.slug}/results`)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-center font-medium transition-colors hover:bg-slate-50"
                  >
                    {i18n.dashboard.results}
                  </Link>
                </div>

                {canDeletePastMeeting(meeting) ? (
                  <DeleteMeetingButton
                    meetingId={meeting.meetingId}
                    pollId={meeting.pollId}
                    hasGeneratedMinutes={meeting.hasGeneratedMinutes}
                    redirectHref={archiveHref}
                  />
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
