import Link from "next/link";
import { redirect } from "next/navigation";
import { OwnerLoginForm } from "@/src/components/owner-login-form";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { getOwnerFromServerCookies } from "@/src/lib/firebase/auth";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";
import { applyProductBranding } from "@/src/lib/product/branding";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string; verified?: string; resent?: string; email?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { locale, i18n } = await getRequestI18n();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const loginSupportCopy = {
    ca: {
      forgotPassword: "Has oblidat la contrasenya?",
      verifyEmail: "Has de verificar el correu abans d'accedir.",
      resendVerification: "Reenviar correu de verificació",
      verifiedOk: "Correu verificat. Ja pots entrar a l'entitat.",
      verifyBannerTitle: "Cal verificar el correu abans d'entrar",
      verifyBannerSent:
        "Hem reenviat automàticament un correu de verificació a {email}. Obre'l i torna a provar l'accés.",
      verifyBannerFallback:
        "No hem pogut reenviar automàticament el correu de verificació. Pots fer-ho manualment des d'aquí.",
      verifyBannerCta: "Obrir verificació manual",
    },
    es: {
      forgotPassword: "Has olvidado la contraseña?",
      verifyEmail: "Tienes que verificar el correo antes de acceder.",
      resendVerification: "Reenviar correo de verificación",
      verifiedOk: "Correo verificado. Ya puedes acceder a la entidad.",
      verifyBannerTitle: "Hace falta verificar el correo antes de entrar",
      verifyBannerSent:
        "Hemos reenviado automáticamente un correo de verificación a {email}. Ábrelo y vuelve a probar el acceso.",
      verifyBannerFallback:
        "No hemos podido reenviar automáticamente el correo de verificación. Puedes hacerlo manualmente desde aquí.",
      verifyBannerCta: "Abrir verificación manual",
    },
  } as const;
  const loginSupportText = applyProductBranding(loginSupportCopy[locale], locale);
  const errorMessage =
    resolvedSearchParams?.error === "rate_limited"
      ? i18n.errors.rateLimited
      : resolvedSearchParams?.error === "verify_email"
        ? loginSupportText.verifyEmail
        : resolvedSearchParams?.error === "unauthorized"
          ? i18n.login.error
          : undefined;
  const owner = await getOwnerFromServerCookies();
  if (owner) {
    redirect(withLocalePath(locale, "/dashboard"));
  }
  const verifiedMessage = resolvedSearchParams?.verified === "1" ? loginSupportText.verifiedOk : undefined;
  const verifyEmailHref = withLocalePath(
    locale,
    resolvedSearchParams?.email ? `/verify-email?email=${encodeURIComponent(resolvedSearchParams.email)}` : "/verify-email"
  );
  const verifyBannerMessage =
    resolvedSearchParams?.error === "verify_email"
      ? resolvedSearchParams?.resent === "1" && resolvedSearchParams.email
        ? loginSupportText.verifyBannerSent.replace("{email}", resolvedSearchParams.email)
        : loginSupportText.verifyBannerFallback
      : null;

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader className="space-y-1">
          <h1 className="text-xl font-semibold">{i18n.login.title}</h1>
          <p className="break-words text-sm text-slate-600">{i18n.login.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {verifiedMessage ? <p className="break-words text-sm text-emerald-700">{verifiedMessage}</p> : null}
          {verifyBannerMessage ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-sm font-medium text-amber-900">{loginSupportText.verifyBannerTitle}</p>
              <p className="mt-1 break-words text-sm text-amber-800">{verifyBannerMessage}</p>
              <Link href={verifyEmailHref} className="mt-3 inline-block text-sm font-medium text-sky-700 hover:underline">
                {loginSupportText.verifyBannerCta}
              </Link>
            </div>
          ) : null}
          <OwnerLoginForm
            locale={locale}
            i18n={i18n}
            errorMessage={errorMessage}
            initialEmail={resolvedSearchParams?.email}
          />
          <Link
            href={withLocalePath(locale, "/forgot-password")}
            className="block text-center text-sm font-medium text-sky-700 hover:underline"
          >
            {loginSupportText.forgotPassword}
          </Link>
          <Link
            href={verifyEmailHref}
            className="block text-center text-sm font-medium text-sky-700 hover:underline"
          >
            {loginSupportText.resendVerification}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
