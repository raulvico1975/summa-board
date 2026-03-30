import Link from "next/link";
import { Card, CardContent } from "@/src/components/ui/card";
import { listPollsByOrg } from "@/src/lib/db/repo";
import { getOwnerMeetings, getUpcomingOwnerMeetings } from "@/src/lib/meetings/get-owner-meetings";
import { requireOwnerPage } from "@/src/lib/ui/owner-page";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";

function GettingStartedStep({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  href,
  cta,
}: {
  label: string;
  value: number;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="border-slate-200">
      <CardContent className="space-y-3 py-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <p className="text-sm text-slate-600">{description}</p>
        <Link
          href={href}
          className="inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50"
        >
          {cta}
        </Link>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const { locale, i18n } = await getRequestI18n();
  const owner = await requireOwnerPage();
  const [polls, upcomingMeetings, pastMeetings] = await Promise.all([
    listPollsByOrg(owner.orgId),
    getUpcomingOwnerMeetings(owner.orgId),
    getOwnerMeetings(owner.orgId),
  ]);

  const activePolls = polls.filter((poll) => poll.status !== "closed" || !poll.winningOptionId);
  const availableMinutesCount = pastMeetings.filter((meeting) => meeting.hasGeneratedMinutes).length;
  const showGettingStarted = activePolls.length === 0 && upcomingMeetings.length === 0 && availableMinutesCount === 0;
  const newPollHref = withLocalePath(locale, "/polls/new");
  const activePollsHref = withLocalePath(locale, "/active-polls");
  const scheduledMeetingsHref = withLocalePath(locale, "/scheduled-meetings");
  const archiveHref = withLocalePath(locale, "/archive");

  return (
    <div className="space-y-6">
      <Card className="border-sky-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50">
        <CardContent className="flex flex-col gap-6 py-6 sm:py-7">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              {i18n.dashboard.eyebrow}
            </p>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {i18n.dashboard.title}
              </h1>
              <p className="max-w-2xl text-sm text-slate-700 sm:text-base">{i18n.dashboard.subtitle}</p>
            </div>
            <p className="text-sm font-medium text-slate-600">{owner.orgName}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href={newPollHref}
              className="rounded-md bg-sky-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-sky-700"
            >
              {i18n.dashboard.primaryCta}
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <SummaryCard
          label={i18n.dashboard.summaryOpenPolls}
          value={activePolls.length}
          description={i18n.dashboard.summaryOpenPollsHint}
          href={activePollsHref}
          cta={i18n.dashboard.summaryOpenPollsCta}
        />
        <SummaryCard
          label={i18n.dashboard.summaryUpcomingMeetings}
          value={upcomingMeetings.length}
          description={i18n.dashboard.summaryUpcomingMeetingsHint}
          href={scheduledMeetingsHref}
          cta={i18n.dashboard.summaryUpcomingMeetingsCta}
        />
        <SummaryCard
          label={i18n.dashboard.summaryArchive}
          value={availableMinutesCount}
          description={i18n.dashboard.summaryArchiveHint}
          href={archiveHref}
          cta={i18n.dashboard.summaryArchiveCta}
        />
      </section>

      {showGettingStarted ? (
        <Card className="border-amber-200 bg-[linear-gradient(135deg,#fffdf7_0%,#ffffff_44%,#eef8ff_100%)]">
          <CardContent className="grid gap-6 py-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                  {i18n.dashboard.gettingStartedEyebrow}
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {i18n.dashboard.gettingStartedTitle}
                </h2>
                <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  {i18n.dashboard.gettingStartedSubtitle}
                </p>
              </div>

              <Link
                href={newPollHref}
                className="inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                {i18n.dashboard.gettingStartedCta}
              </Link>
            </div>

            <div className="grid gap-3">
              <GettingStartedStep
                title={i18n.dashboard.gettingStartedStepOneTitle}
                body={i18n.dashboard.gettingStartedStepOneBody}
              />
              <GettingStartedStep
                title={i18n.dashboard.gettingStartedStepTwoTitle}
                body={i18n.dashboard.gettingStartedStepTwoBody}
              />
              <GettingStartedStep
                title={i18n.dashboard.gettingStartedStepThreeTitle}
                body={i18n.dashboard.gettingStartedStepThreeBody}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
