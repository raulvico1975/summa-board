import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { getOwnerFromServerCookies } from "@/src/lib/firebase/auth";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";
import { ActivateSubscriptionButton } from "@/src/components/billing/activate-subscription-button";
import { ManageSubscriptionButton } from "@/src/components/billing/manage-subscription-button";
import { getMarketingPlanCopy } from "@/src/lib/billing/plan";
import { applyProductBranding } from "@/src/lib/product/branding";

const copy = {
  ca: {
    inactiveEyebrow: "Activació",
    activeEyebrow: "Subscripció",
    inactiveTitle: "Activa l'espai de la teva entitat",
    activeTitle: "El teu pla i la teva subscripció",
    inactiveSubtitle:
      "Tindràs el pla preparat en un sol pas i podràs començar a convocar reunions avui mateix.",
    activeSubtitle:
      "Consulta l'estat del teu pla, què inclou i gestiona la subscripció sempre que ho necessitis.",
    status: "Estat actual",
    includesTitle: "Què inclou el pla",
    includesSubtitle: "Preparat perquè la junta o patronat passin de la convocatòria a l'acta sense complicacions.",
    portalTitle: "Pagaments i factures",
    portalBody:
      "La gestió de pagaments i factures es fa des d'un portal segur. T'hi redirigim i tornes aquí quan hagis acabat.",
    cta: "Activar subscripció",
    loading: "Obrint pagament segur...",
    fallbackError: "No s'ha pogut obrir el pagament.",
    manageCta: "Gestionar subscripció",
    manageLoading: "Obrint la gestió de la subscripció...",
    manageError: "No s'ha pogut obrir la gestió de la subscripció.",
  },
  es: {
    inactiveEyebrow: "Activación",
    activeEyebrow: "Suscripción",
    inactiveTitle: "Activa el espacio de tu entidad",
    activeTitle: "Tu plan y tu suscripción",
    inactiveSubtitle:
      "Tendrás el plan listo en un solo paso y podrás empezar a convocar reuniones hoy mismo.",
    activeSubtitle:
      "Consulta el estado de tu plan, qué incluye y gestiona la suscripción siempre que lo necesites.",
    status: "Estado actual",
    includesTitle: "Qué incluye el plan",
    includesSubtitle: "Preparado para que junta o patronato pasen de la convocatoria al acta sin complicaciones.",
    portalTitle: "Pagos y facturas",
    portalBody:
      "La gestión de pagos y facturas se hace desde un portal seguro. Te redirigimos y vuelves aquí cuando termines.",
    cta: "Activar suscripción",
    loading: "Abriendo pago seguro...",
    fallbackError: "No se ha podido abrir el pago.",
    manageCta: "Gestionar suscripción",
    manageLoading: "Abriendo la gestión de la suscripción...",
    manageError: "No se ha podido abrir la gestión de la suscripción.",
  },
} as const;

function formatStatus(locale: "ca" | "es", status: string): string {
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

export default async function BillingPage() {
  const { locale } = await getRequestI18n();
  const owner = await getOwnerFromServerCookies();
  if (!owner) {
    redirect(withLocalePath(locale, "/login"));
  }

  const text = applyProductBranding(copy[locale], locale);
  const plan = getMarketingPlanCopy({
    locale,
    plan: owner.plan,
    recordingLimitMinutes: owner.recordingLimitMinutes,
  });
  const canManageSubscription = owner.subscriptionStatus !== "none";
  const canActivateSubscription =
    owner.subscriptionStatus === "none" ||
    owner.subscriptionStatus === "pending" ||
    owner.subscriptionStatus === "past_due" ||
    owner.subscriptionStatus === "canceled";
  const title = canManageSubscription ? text.activeTitle : text.inactiveTitle;
  const subtitle = canManageSubscription ? text.activeSubtitle : text.inactiveSubtitle;
  const eyebrow = canManageSubscription ? text.activeEyebrow : text.inactiveEyebrow;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-sky-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50">
        <CardContent className="grid gap-4 py-6 sm:grid-cols-[1.2fr_0.8fr] sm:py-7">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{eyebrow}</p>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
              <p className="max-w-2xl text-sm text-slate-700 sm:text-base">{subtitle}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/90 bg-white/90 p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{owner.orgName}</p>
            <p className="mt-2 text-sm text-slate-600">
              {text.status}: <span className="font-medium text-slate-900">{formatStatus(locale, owner.subscriptionStatus)}</span>
            </p>
            <p className="mt-3 text-sm text-slate-600">{plan.displayName}</p>
            <p className="mt-1 text-xs text-slate-500">{plan.billingHint}</p>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-slate-200">
          <CardHeader className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950">{plan.displayName}</h2>
            <p className="text-sm text-slate-600">{plan.summary}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-950 px-5 py-5 text-white">
              <p className="text-sm font-medium text-slate-300">{plan.note}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">{plan.price}</p>
              <p className="mt-1 text-base text-slate-300">{plan.period}</p>
            </div>
            <p className="text-sm text-slate-600">{plan.billingHint}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950">{text.includesTitle}</h2>
            <p className="text-sm text-slate-600">{text.includesSubtitle}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-3 text-sm text-slate-700">
              {plan.highlights.map((item) => (
                <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  {item}
                </li>
              ))}
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">{plan.recordingLimitLabel}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200">
        <CardHeader className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-950">{text.portalTitle}</h2>
          <p className="text-sm text-slate-600">{text.portalBody}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {canActivateSubscription ? (
            <ActivateSubscriptionButton
              label={text.cta}
              loadingLabel={text.loading}
              fallbackError={text.fallbackError}
            />
          ) : null}
          {canManageSubscription ? (
            <ManageSubscriptionButton
              label={text.manageCta}
              loadingLabel={text.manageLoading}
              fallbackError={text.manageError}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
