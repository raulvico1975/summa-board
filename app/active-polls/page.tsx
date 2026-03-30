import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { StatusBadge } from "@/src/components/ui/status-badge";
import { listPollsByOrg } from "@/src/lib/db/repo";
import { formatDateTime } from "@/src/lib/dates";
import { requireOwnerPage } from "@/src/lib/ui/owner-page";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";

const copy = {
  ca: {
    title: "Convocatòries actives",
    subtitle:
      "Aquí tens totes les convocatòries que encara estan obertes o que necessiten una última revisió abans de tancar-les.",
    backToDashboard: "Tornar al tauler",
    empty: "Ara mateix no tens cap convocatòria activa.",
  },
  es: {
    title: "Convocatorias activas",
    subtitle:
      "Aquí tienes todas las convocatorias que siguen abiertas o que necesitan una última revisión antes de cerrarlas.",
    backToDashboard: "Volver al panel",
    empty: "Ahora mismo no tienes ninguna convocatoria activa.",
  },
} as const;

function getPollDisplayStatus(status: "open" | "closing" | "closed" | "close_failed") {
  if (status === "closing") {
    return "processing";
  }

  if (status === "close_failed") {
    return "error";
  }

  return status;
}

export default async function ActivePollsPage() {
  const { locale, i18n } = await getRequestI18n();
  const owner = await requireOwnerPage();
  const text = copy[locale];
  const polls = await listPollsByOrg(owner.orgId);
  const activePolls = polls.filter((poll) => poll.status !== "closed" || !poll.winningOptionId);

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
        {activePolls.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-slate-600">{text.empty}</CardContent>
          </Card>
        ) : (
          activePolls.map((poll) => (
            <Card key={poll.id}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words text-base font-semibold leading-tight text-slate-900">{poll.title}</h2>
                </div>
                <StatusBadge status={getPollDisplayStatus(poll.status)} labels={i18n.status} />
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  {i18n.dashboard.createdLabel}: {formatDateTime(poll.createdAt, locale)}
                </p>
                <div className="grid w-full grid-cols-2 gap-2 text-sm sm:flex sm:w-auto">
                  <Link
                    href={withLocalePath(locale, `/polls/${poll.id}`)}
                    className="rounded-md bg-sky-500 px-3 py-2 text-center font-medium text-white transition-colors hover:bg-sky-600"
                  >
                    {i18n.dashboard.manage}
                  </Link>
                  <Link
                    href={withLocalePath(locale, `/p/${poll.slug}/results`)}
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
