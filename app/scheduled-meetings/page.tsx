import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { StatusBadge } from "@/src/components/ui/status-badge";
import { formatDateTime } from "@/src/lib/dates";
import { getUpcomingOwnerMeetings } from "@/src/lib/meetings/get-owner-meetings";
import { requireOwnerPage } from "@/src/lib/ui/owner-page";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";

const copy = {
  ca: {
    title: "Reunions convocades",
    subtitle:
      "Aquí veuràs les reunions que ja tenen data confirmada per avui o per als propers dies, amb accés directe a la sala o a la convocatòria final.",
    backToDashboard: "Tornar al tauler",
    empty: "No hi ha reunions convocades per avui o endavant.",
    ready: "La reunió ja està preparada per entrar-hi o compartir-la.",
    pending: "La reunió encara s'està acabant de preparar.",
  },
  es: {
    title: "Reuniones convocadas",
    subtitle:
      "Aquí verás las reuniones que ya tienen fecha confirmada para hoy o los próximos días, con acceso directo a la sala o a la convocatoria final.",
    backToDashboard: "Volver al panel",
    empty: "No hay reuniones convocadas para hoy o más adelante.",
    ready: "La reunión ya está preparada para entrar o compartirla.",
    pending: "La reunión todavía se está terminando de preparar.",
  },
} as const;

export default async function ScheduledMeetingsPage() {
  const { locale, i18n } = await getRequestI18n();
  const owner = await requireOwnerPage();
  const text = copy[locale];
  const upcomingMeetings = await getUpcomingOwnerMeetings(owner.orgId);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{text.title}</h1>
            <p className="max-w-2xl text-sm text-slate-600">{text.subtitle}</p>
            <p className="text-sm font-medium text-slate-500">{owner.orgName}</p>
          </div>
          <Link
            href={withLocalePath(locale, "/dashboard")}
            className="rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-slate-50"
          >
            {text.backToDashboard}
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        {upcomingMeetings.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-slate-600">{text.empty}</CardContent>
          </Card>
        ) : (
          upcomingMeetings.map((meeting) => (
            <Card key={meeting.meetingId ?? meeting.pollId}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words text-base font-semibold leading-tight text-slate-900">{meeting.title}</h2>
                </div>
                <StatusBadge status="closed" labels={i18n.status} />
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 text-xs text-slate-500">
                  <p>
                    {i18n.meeting.meetingDateLabel}: {formatDateTime(meeting.scheduledAt, locale)}
                  </p>
                  <p>{meeting.meetingId ? text.ready : text.pending}</p>
                </div>
                <div className="grid w-full gap-2 text-sm sm:flex sm:w-auto">
                  {meeting.meetingId ? (
                    <Link
                      href={withLocalePath(locale, `/owner/meetings/${meeting.meetingId}`)}
                      className="rounded-md bg-sky-500 px-3 py-2 text-center font-medium text-white transition-colors hover:bg-sky-600"
                    >
                      {i18n.poll.openMeeting}
                    </Link>
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
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
