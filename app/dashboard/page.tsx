import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { DeleteMeetingButton } from "@/src/components/meetings/delete-meeting-button";
import { StatusBadge } from "@/src/components/ui/status-badge";
import { listPollsByOrg } from "@/src/lib/db/repo";
import { formatDateTime } from "@/src/lib/dates";
import { getOwnerMeetings } from "@/src/lib/meetings/get-owner-meetings";
import { requireOwnerPage } from "@/src/lib/ui/owner-page";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";

function getPollDisplayStatus(status: "open" | "closing" | "closed" | "close_failed") {
  if (status === "closing") {
    return "processing";
  }

  if (status === "close_failed") {
    return "error";
  }

  return status;
}

export default async function DashboardPage() {
  const { locale, i18n } = await getRequestI18n();
  const owner = await requireOwnerPage();
  const [polls, pastMeetings] = await Promise.all([
    listPollsByOrg(owner.orgId),
    getOwnerMeetings(owner.orgId),
  ]);
  const dashboardHref = withLocalePath(locale, "/dashboard");
  const activePolls = polls.filter((poll) => poll.status !== "closed");
  const closedPolls = polls.filter((poll) => poll.status === "closed");

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {i18n.dashboard.title}
        </h1>
        <p className="break-words text-sm text-slate-600">{owner.orgName}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-sky-200 bg-sky-50/60">
          <CardContent className="space-y-2 py-5">
            <p className="text-sm font-medium text-sky-900">{i18n.dashboard.activePolls}</p>
            <p className="text-3xl font-semibold tracking-tight text-slate-900">{activePolls.length}</p>
            {activePolls.length === 0 ? (
              <p className="text-sm text-slate-600">{i18n.dashboard.noActivePolls}</p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 py-5">
            <p className="text-sm font-medium text-slate-700">{i18n.dashboard.closedPolls}</p>
            <p className="text-3xl font-semibold tracking-tight text-slate-900">{closedPolls.length}</p>
            {closedPolls.length === 0 ? (
              <p className="text-sm text-slate-600">{i18n.dashboard.noClosedPolls}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {polls.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-slate-600">{i18n.dashboard.empty}</CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {activePolls.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  {i18n.dashboard.activePolls}
                </h2>
                <Badge>{activePolls.length}</Badge>
              </div>
              <div className="space-y-3">
                {activePolls.map((poll) => (
                  <Card key={poll.id} className="shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-base font-semibold leading-tight text-slate-900">
                            {poll.title}
                          </h3>
                          <Badge className="border-slate-200 bg-slate-50 text-slate-600">/{poll.slug}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          {i18n.dashboard.createdLabel}: {formatDateTime(poll.createdAt, locale)}
                        </p>
                      </div>
                      <StatusBadge status={getPollDisplayStatus(poll.status)} labels={i18n.status} />
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-600">{owner.orgName}</p>
                      <div className="grid w-full grid-cols-2 gap-2 text-sm sm:flex sm:w-auto">
                        <Link
                          href={withLocalePath(locale, `/p/${poll.slug}/results`)}
                          className="rounded-md bg-sky-500 px-3 py-2 text-center font-medium text-white transition-colors hover:bg-sky-600"
                        >
                          {i18n.dashboard.results}
                        </Link>
                        <Link
                          href={withLocalePath(locale, `/polls/${poll.id}`)}
                          className="rounded-md border border-slate-300 px-3 py-2 text-center font-medium transition-colors hover:bg-slate-50"
                        >
                          {i18n.dashboard.manage}
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          {closedPolls.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  {i18n.dashboard.closedPolls}
                </h2>
                <Badge>{closedPolls.length}</Badge>
              </div>
              <div className="space-y-3">
                {closedPolls.map((poll) => (
                  <Card key={poll.id} className="shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-base font-semibold leading-tight text-slate-900">
                            {poll.title}
                          </h3>
                          <Badge className="border-slate-200 bg-slate-50 text-slate-600">/{poll.slug}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          {i18n.dashboard.createdLabel}: {formatDateTime(poll.createdAt, locale)}
                        </p>
                      </div>
                      <StatusBadge status={getPollDisplayStatus(poll.status)} labels={i18n.status} />
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-600">{owner.orgName}</p>
                      <div className="grid w-full grid-cols-2 gap-2 text-sm sm:flex sm:w-auto">
                        <Link
                          href={withLocalePath(locale, `/p/${poll.slug}/results`)}
                          className="rounded-md bg-sky-500 px-3 py-2 text-center font-medium text-white transition-colors hover:bg-sky-600"
                        >
                          {i18n.dashboard.results}
                        </Link>
                        <Link
                          href={withLocalePath(locale, `/polls/${poll.id}`)}
                          className="rounded-md border border-slate-300 px-3 py-2 text-center font-medium transition-colors hover:bg-slate-50"
                        >
                          {i18n.dashboard.manage}
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{i18n.dashboard.pastMeetings}</h2>
          <p className="mt-1 text-sm text-slate-600">{i18n.meeting.deleteDescription}</p>
        </div>

        {pastMeetings.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-slate-600">{i18n.dashboard.noPastMeetings}</CardContent>
          </Card>
        ) : (
          pastMeetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <Link
                    href={withLocalePath(locale, `/owner/meetings/${meeting.id}`)}
                    className="block break-words text-base font-semibold text-slate-900 hover:underline"
                  >
                    {meeting.title || i18n.meeting.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {i18n.meeting.meetingDateLabel}: {formatDateTime(meeting.scheduledAt, locale)}
                  </p>
                </div>
                <DeleteMeetingButton meetingId={meeting.id} redirectHref={dashboardHref} />
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
