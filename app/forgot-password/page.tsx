import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { RequestPasswordResetForm } from "@/src/components/auth/request-password-reset-form";
import { getRequestLocale } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";
import { applyProductBranding } from "@/src/lib/product/branding";

const copy = {
  ca: {
    title: "Recuperar accés",
    subtitle: "Introdueix el correu de l'entitat i t'enviarem un enllaç per definir una nova contrasenya.",
    emailLabel: "Correu de l'entitat",
    submitLabel: "Enviar enllaç de recuperació",
    loadingLabel: "Enviant...",
    successMessage:
      "Si el correu existeix, rebràs un missatge amb l'enllaç per restablir la contrasenya en uns minuts.",
    hint: "Per seguretat, sempre mostrem la mateixa resposta.",
    backToLogin: "Tornar a l'accés",
  },
  es: {
    title: "Recuperar acceso",
    subtitle: "Introduce el correo de la entidad y te enviaremos un enlace para definir una nueva contraseña.",
    emailLabel: "Correo de la entidad",
    submitLabel: "Enviar enlace de recuperación",
    loadingLabel: "Enviando...",
    successMessage:
      "Si el correo existe, recibirás un mensaje con el enlace para restablecer la contraseña en unos minutos.",
    hint: "Por seguridad, siempre mostramos la misma respuesta.",
    backToLogin: "Volver al acceso",
  },
} as const;

export default async function ForgotPasswordPage() {
  const locale = await getRequestLocale();
  const text = applyProductBranding(copy[locale], locale);

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader className="space-y-1">
          <h1 className="text-xl font-semibold">{text.title}</h1>
          <p className="break-words text-sm text-slate-600">{text.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RequestPasswordResetForm
            emailLabel={text.emailLabel}
            submitLabel={text.submitLabel}
            loadingLabel={text.loadingLabel}
            successMessage={text.successMessage}
            errorMessage={text.hint}
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
