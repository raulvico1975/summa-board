import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
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
    <div className="mx-auto max-w-md">
      <Card className="border-slate-200">
        <CardHeader className="space-y-1">
          <h1 className="text-xl font-semibold">{billing.title}</h1>
          <p className="break-words text-sm text-slate-600">{billing.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">{owner.orgName}</p>
            <p className="mt-1 text-sm text-slate-600">
              {billing.status}: {statusLabel}
            </p>
            <div
              className={`mt-3 rounded-md border p-3 ${
                isPastDue
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <p className="text-sm leading-6">{billingHint}</p>
            </div>
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
