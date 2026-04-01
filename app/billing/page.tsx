import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { getOwnerFromServerCookies } from "@/src/lib/firebase/auth";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";
import { ActivateSubscriptionButton } from "@/src/components/billing/activate-subscription-button";
import {
  getBillingGraceDaysRemaining,
  isBillingGraceActive,
} from "@/src/lib/billing/subscription";

const statusKeys = {
  none: "subscriptionNone",
  pending: "subscriptionPending",
  active: "subscriptionActive",
  past_due: "subscriptionPastDue",
  canceled: "subscriptionCanceled",
} as const;

export default async function BillingPage() {
  const { locale, i18n } = await getRequestI18n();
  const owner = await getOwnerFromServerCookies();
  if (!owner) {
    redirect(withLocalePath(locale, "/login"));
  }
  if (owner.subscriptionStatus === "active") {
    redirect(withLocalePath(locale, "/dashboard"));
  }

  const { billing } = i18n;
  const statusLabel =
    billing[statusKeys[owner.subscriptionStatus as keyof typeof statusKeys] ?? "subscriptionNone"];
  const graceActive = isBillingGraceActive(owner);
  const graceDaysRemaining = getBillingGraceDaysRemaining(owner.subscriptionPastDueAt);
  const billingHint =
    owner.subscriptionStatus === "past_due"
      ? graceActive
        ? billing.pastDueGrace.replaceAll("{days}", String(graceDaysRemaining || 3))
        : billing.pastDueExpired
      : billing.hint;
  const isPastDue = owner.subscriptionStatus === "past_due";

  return (
    <div className="mx-auto max-w-lg">
      <Card className={`overflow-hidden shadow-sm ${isPastDue ? "border-amber-200 bg-amber-50/30" : "border-slate-200"}`}>
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={isPastDue ? "border-amber-200 bg-amber-100 text-amber-800" : undefined}>
              {billing.status}
            </Badge>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{owner.orgName}</p>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{billing.title}</h1>
          <p className="break-words text-sm text-slate-600">{billing.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`rounded-xl border p-4 ${
              isPastDue
                ? "border-amber-200 bg-white/80 text-amber-950"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-900">{billing.status}</p>
              <p className="text-sm font-semibold text-slate-900">{statusLabel}</p>
            </div>
            <p className="mt-2 text-sm leading-6">{billingHint}</p>
          </div>
          <ActivateSubscriptionButton
            label={billing.cta}
            loadingLabel={billing.loading}
            fallbackError={billing.fallbackError}
          />
        </CardContent>
      </Card>
    </div>
  );
}
