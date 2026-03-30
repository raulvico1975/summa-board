import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { MeetingIngestActionButton } from "@/src/components/ops/meeting-ingest-action-button";
import { formatDateTime } from "@/src/lib/dates";
import { getOwnerFromServerCookies } from "@/src/lib/firebase/auth";
import { getOwnerOpsSnapshot } from "@/src/lib/ops/get-owner-ops-snapshot";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";
import { applyProductBranding } from "@/src/lib/product/branding";

const copy = {
  ca: {
    title: "Centre d'operació",
    subtitle:
      "Controla l'estat de l'espai, la cua de processament i les incidències sense sortir de Summa Reu.",
    runQueue: "Drenar cua ara",
    runQueueLoading: "Processant cua...",
    runQueueSuccess: "Cua revisada.",
    runQueueError: "No s'ha pogut drenar la cua.",
    metrics: {
      openPolls: "Votacions obertes",
      closedPolls: "Votacions tancades",
      meetingsReady: "Reunions llestes",
      meetingsProcessing: "Reunions processant",
      meetingsErrored: "Reunions amb error",
      ingestQueued: "Jobs en cua",
      ingestProcessing: "Jobs en marxa",
      ingestErrored: "Jobs amb error",
    },
    recentJobs: "Cua de gravacions",
    recentMeetings: "Reunions recents",
    noJobs: "Encara no hi ha jobs de gravació per a aquesta entitat.",
    noMeetings: "Encara no hi ha reunions creades.",
    retry: "Reintentar job",
    retryLoading: "Reintentant...",
    retrySuccess: "Job relançat.",
    retryError: "No s'ha pogut reintentar el job.",
    attempts: "intents",
    nextAttempt: "Proper intent",
    updatedAt: "Actualitzat",
    meeting: "Reunió",
    status: "Estat",
    error: "Error",
    goMeeting: "Obrir reunió",
    alertTitles: {
      subscription_inactive: "Subscripció pendent d'atenció",
      ingest_errors: "Hi ha gravacions amb error",
      stale_jobs: "Hi ha processaments encallats",
    },
    alertBodies: {
      subscription_inactive: "L'espai no està en estat actiu. Revisa la facturació perquè l'operació no quedi tallada.",
      ingest_errors: "Algunes gravacions no han acabat de generar transcripció o acta. Des d'aquí les pots reintentar.",
      stale_jobs: "S'han detectat jobs amb lease expirada. Pots tornar a drenar la cua per recuperar-los.",
    },
    orgLabel: "Entitat",
    subscriptionLabel: "Subscripció",
    planLabel: "Pla",
  },
  es: {
    title: "Centro de operación",
    subtitle:
      "Controla el estado del espacio, la cola de procesamiento y las incidencias sin salir de Summa Reu.",
    runQueue: "Drenar cola ahora",
    runQueueLoading: "Procesando cola...",
    runQueueSuccess: "Cola revisada.",
    runQueueError: "No se ha podido drenar la cola.",
    metrics: {
      openPolls: "Votaciones abiertas",
      closedPolls: "Votaciones cerradas",
      meetingsReady: "Reuniones listas",
      meetingsProcessing: "Reuniones procesando",
      meetingsErrored: "Reuniones con error",
      ingestQueued: "Jobs en cola",
      ingestProcessing: "Jobs en marcha",
      ingestErrored: "Jobs con error",
    },
    recentJobs: "Cola de grabaciones",
    recentMeetings: "Reuniones recientes",
    noJobs: "Todavía no hay jobs de grabación para esta entidad.",
    noMeetings: "Todavía no hay reuniones creadas.",
    retry: "Reintentar job",
    retryLoading: "Reintentando...",
    retrySuccess: "Job relanzado.",
    retryError: "No se ha podido reintentar el job.",
    attempts: "intentos",
    nextAttempt: "Próximo intento",
    updatedAt: "Actualizado",
    meeting: "Reunión",
    status: "Estado",
    error: "Error",
    goMeeting: "Abrir reunión",
    alertTitles: {
      subscription_inactive: "Suscripción pendiente de atención",
      ingest_errors: "Hay grabaciones con error",
      stale_jobs: "Hay procesamientos atascados",
    },
    alertBodies: {
      subscription_inactive: "El espacio no está en estado activo. Revisa la facturación para que la operación no quede cortada.",
      ingest_errors: "Algunas grabaciones no han terminado de generar transcripción o acta. Desde aquí puedes reintentarlas.",
      stale_jobs: "Se han detectado jobs con lease expirada. Puedes volver a drenar la cola para recuperarlos.",
    },
    orgLabel: "Entidad",
    subscriptionLabel: "Suscripción",
    planLabel: "Plan",
  },
} as const;

function formatSubscription(locale: "ca" | "es", status: string) {
  const labels = {
    ca: {
      none: "sense subscripció",
      pending: "pendent",
      active: "activa",
      past_due: "pagament pendent",
      canceled: "cancel·lada",
    },
    es: {
      none: "sin suscripción",
      pending: "pendiente",
      active: "activa",
      past_due: "pago pendiente",
      canceled: "cancelada",
    },
  } as const;

  return labels[locale][status as keyof (typeof labels)["ca"]] ?? status;
}

export default async function OpsPage() {
  const { locale } = await getRequestI18n();
  const owner = await getOwnerFromServerCookies();
  if (!owner) {
    redirect(withLocalePath(locale, "/login"));
  }

  const text = applyProductBranding(copy[locale], locale);
  const snapshot = await getOwnerOpsSnapshot(owner.orgId);
  const metricEntries = Object.entries(snapshot.metrics) as Array<
    [keyof typeof snapshot.metrics, number]
  >;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-slate-900">{text.title}</h1>
              <p className="max-w-2xl text-sm text-slate-600">{text.subtitle}</p>
            </div>
            <MeetingIngestActionButton
              action="drain"
              label={text.runQueue}
              loadingLabel={text.runQueueLoading}
              successLabel={text.runQueueSuccess}
              errorLabel={text.runQueueError}
              className="w-full sm:w-auto"
            />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{text.orgLabel}</p>
            <p className="mt-2 font-medium text-slate-900">{snapshot.org?.name ?? owner.orgName}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {text.subscriptionLabel}
            </p>
            <p className="mt-2 font-medium text-slate-900">
              {formatSubscription(locale, snapshot.org?.subscriptionStatus ?? owner.subscriptionStatus)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{text.planLabel}</p>
            <p className="mt-2 font-medium text-slate-900">{snapshot.org?.plan ?? owner.plan}</p>
          </div>
        </CardContent>
      </Card>

      {snapshot.alerts.length > 0 ? (
        <div className="space-y-3">
          {snapshot.alerts.map((alert) => (
            <div
              key={alert.id}
              className={
                alert.level === "error"
                  ? "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  : "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              }
            >
              <p className="font-medium">{text.alertTitles[alert.kind]}</p>
              <p className="mt-1">{text.alertBodies[alert.kind]}</p>
            </div>
          ))}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metricEntries.map(([key, value]) => (
          <Card key={key}>
            <CardContent className="space-y-2 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {text.metrics[key]}
              </p>
              <p className="text-2xl font-semibold text-slate-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">{text.recentJobs}</h2>
        </CardHeader>
        <CardContent>
          {snapshot.recentJobs.length === 0 ? (
            <p className="text-sm text-slate-600">{text.noJobs}</p>
          ) : (
            <div className="space-y-3">
              {snapshot.recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="space-y-3 rounded-xl border border-slate-200 px-4 py-4 text-sm text-slate-700"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">
                        {text.meeting}: {job.meetingTitle}
                      </p>
                      <p className="text-xs text-slate-500">
                        {text.status}: {job.status} · {job.attemptCount ?? 0} {text.attempts}
                      </p>
                      <p className="text-xs text-slate-500">
                        {text.updatedAt}: {formatDateTime(job.updatedAt, locale)}
                      </p>
                      {typeof job.nextAttemptAt === "number" ? (
                        <p className="text-xs text-slate-500">
                          {text.nextAttempt}: {formatDateTime(job.nextAttemptAt, locale)}
                        </p>
                      ) : null}
                      {job.error ? <p className="text-xs text-red-600">{text.error}: {job.error}</p> : null}
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      {job.meetingUrl ? (
                        <Link
                          href={withLocalePath(locale, `/owner/meetings/${job.meetingId}`)}
                          className="rounded-md border border-slate-300 px-3 py-2 text-center font-medium transition-colors hover:bg-slate-50"
                        >
                          {text.goMeeting}
                        </Link>
                      ) : null}
                      {job.status !== "completed" ? (
                        <MeetingIngestActionButton
                          action="requeue"
                          jobId={job.id}
                          label={text.retry}
                          loadingLabel={text.retryLoading}
                          successLabel={text.retrySuccess}
                          errorLabel={text.retryError}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">{text.recentMeetings}</h2>
        </CardHeader>
        <CardContent>
          {snapshot.recentMeetings.length === 0 ? (
            <p className="text-sm text-slate-600">{text.noMeetings}</p>
          ) : (
            <div className="space-y-3">
              {snapshot.recentMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 px-4 py-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">{meeting.title}</p>
                    <p className="text-xs text-slate-500">
                      {text.status}: {meeting.recordingStatus ?? "none"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {text.updatedAt}: {formatDateTime(meeting.createdAt, locale)}
                    </p>
                  </div>
                  <Link
                    href={withLocalePath(locale, `/owner/meetings/${meeting.id}`)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-center font-medium transition-colors hover:bg-slate-50"
                  >
                    {text.goMeeting}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
