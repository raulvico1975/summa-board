import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { RequestEmailVerificationForm } from "@/src/components/auth/request-email-verification-form";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";
import { applyProductBranding } from "@/src/lib/product/branding";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string }>;
}) {
  const { locale } = await getRequestI18n();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const copy = {
    ca: {
      title: "Verificar correu",
      subtitle:
        "Si l'accés ha fallat perquè el correu encara no està verificat, normalment ja te l'hem reenviat automàticament. Des d'aquí el pots tornar a enviar manualment.",
      emailLabel: "Correu de l'entitat",
      passwordLabel: "Contrasenya",
      submitLabel: "Reenviar verificació",
      loadingLabel: "Enviant...",
      successMessage: "Hem enviat un nou correu de verificació. Revisa la safata d'entrada.",
      alreadyVerifiedMessage: "Aquest correu ja està verificat. Ja pots accedir a l'entitat.",
      errorMessage: "No s'ha pogut reenviar la verificació. Revisa les dades i torna-ho a provar.",
      helpMessage:
        "Per seguretat, el reenviament manual demana correu i contrasenya. Si véns directament del login, l'aplicació ja ho intenta reenviar automàticament.",
      backToLogin: "Tornar a l'accés",
    },
    es: {
      title: "Verificar correo",
      subtitle:
        "Si el acceso ha fallado porque el correo aún no está verificado, normalmente ya te lo hemos reenviado automáticamente. Desde aquí puedes volver a enviarlo manualmente.",
      emailLabel: "Correo de la entidad",
      passwordLabel: "Contraseña",
      submitLabel: "Reenviar verificación",
      loadingLabel: "Enviando...",
      successMessage: "Hemos enviado un nuevo correo de verificación. Revisa tu bandeja de entrada.",
      alreadyVerifiedMessage: "Este correo ya está verificado. Ya puedes acceder a la entidad.",
      errorMessage: "No se ha podido reenviar la verificación. Revisa los datos y vuelve a intentarlo.",
      helpMessage:
        "Por seguridad, el reenvío manual pide correo y contraseña. Si vienes directamente del login, la aplicación ya intenta reenviarlo automáticamente.",
      backToLogin: "Volver al acceso",
    },
  } as const;

  const text = applyProductBranding(copy[locale], locale);

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader className="space-y-1">
          <h1 className="text-xl font-semibold">{text.title}</h1>
          <p className="break-words text-sm text-slate-600">{text.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RequestEmailVerificationForm
            emailLabel={text.emailLabel}
            passwordLabel={text.passwordLabel}
            submitLabel={text.submitLabel}
            loadingLabel={text.loadingLabel}
            successMessage={text.successMessage}
            alreadyVerifiedMessage={text.alreadyVerifiedMessage}
            errorMessage={text.errorMessage}
            helpMessage={text.helpMessage}
            initialEmail={resolvedSearchParams?.email}
          />
          <Link
            href={withLocalePath(locale, "/login")}
            className="block text-center text-sm font-medium text-sky-700 hover:underline"
          >
            {text.backToLogin}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
