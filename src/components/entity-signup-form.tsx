"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/field";
import { useI18n } from "@/src/i18n/client";
import { withLocalePath } from "@/src/i18n/routing";
import { applyProductBranding } from "@/src/lib/product/branding";

type State = {
  loading: boolean;
  error?: string;
};

export function EntitySignupForm() {
  const { locale, i18n } = useI18n();
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [state, setState] = useState<State & { success?: boolean; verificationEmailSent?: boolean }>({
    loading: false,
  });
  const legalCopy = {
    ca: {
      intro: "Per activar l'entitat cal acceptar la política de privacitat i les condicions del servei.",
      privacy: "He llegit i accepto la política de privacitat.",
      terms: "He llegit i accepto les condicions del servei.",
    },
    es: {
      intro: "Para activar la entidad hace falta aceptar la política de privacidad y las condiciones del servicio.",
      privacy: "He leído y acepto la política de privacidad.",
      terms: "He leído y acepto las condiciones del servicio.",
    },
  } as const;
  const verificationCopy = {
    ca: {
      title: "Compte creat. Verifica el correu per activar l'accés.",
      sentBody:
        "T'hem enviat un correu de verificació. Quan el confirmis, ja podràs entrar a Summa Reu i activar la subscripció.",
      fallbackBody:
        "El compte s'ha creat, però cal verificar el correu abans d'entrar. Si no t'ha arribat el missatge, pots reenviar-lo des de l'enllaç següent.",
      goLogin: "Anar a l'accés",
      resend: "Reenviar correu de verificació",
    },
    es: {
      title: "Cuenta creada. Verifica el correo para activar el acceso.",
      sentBody:
        "Te hemos enviado un correo de verificación. Cuando lo confirmes, ya podrás entrar en Summa Reu y activar la suscripción.",
      fallbackBody:
        "La cuenta se ha creado, pero hace falta verificar el correo antes de entrar. Si no te ha llegado el mensaje, puedes reenviarlo desde el siguiente enlace.",
      goLogin: "Ir al acceso",
      resend: "Reenviar correo de verificación",
    },
  } as const;
  const legalText = applyProductBranding(legalCopy[locale], locale);
  const verificationText = applyProductBranding(verificationCopy[locale], locale);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true });

    try {
      const signupRes = await fetch("/api/auth/workspace-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName,
          contactName,
          email,
          password,
          acceptPrivacy,
          acceptTerms,
        }),
      });

      const signupData = (await signupRes.json()) as { ok?: boolean; error?: string };
      if (!signupRes.ok || !signupData.ok) {
        throw new Error(signupData.error ?? i18n.signup.error);
      }

      let verificationEmailSent = false;
      const verificationRes = await fetch("/api/auth/request-email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (verificationRes.ok) {
        const verificationData = (await verificationRes.json()) as {
          ok?: boolean;
          status?: "sent" | "already_verified";
        };
        verificationEmailSent = verificationData.ok === true;
      }

      setState({
        loading: false,
        success: true,
        verificationEmailSent,
      });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : i18n.signup.error,
      });
    }
  }

  if (state.success) {
    return (
      <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
        <p className="text-sm font-medium text-emerald-900">{verificationText.title}</p>
        <p className="text-sm text-emerald-800">
          {state.verificationEmailSent ? verificationText.sentBody : verificationText.fallbackBody}
        </p>
        <Link
          href={withLocalePath(locale, "/login")}
          className="block break-words text-sm font-medium text-sky-700 hover:underline"
        >
          {verificationText.goLogin}
        </Link>
        <Link
          href={withLocalePath(locale, "/verify-email")}
          className="block break-words text-sm font-medium text-sky-700 hover:underline"
        >
          {verificationText.resend}
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">{i18n.signup.orgName}</label>
        <Input required value={orgName} onChange={(event) => setOrgName(event.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">{i18n.signup.contactName}</label>
        <Input required value={contactName} onChange={(event) => setContactName(event.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">{i18n.signup.email}</label>
        <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">{i18n.signup.password}</label>
        <Input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm text-slate-700">{legalText.intro}</p>
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            required
            checked={acceptPrivacy}
            onChange={(event) => setAcceptPrivacy(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span>
            {legalText.privacy}{" "}
            <Link href={withLocalePath(locale, "/privacy")} className="font-medium text-sky-700 hover:underline">
              {locale === "ca" ? "Veure text" : "Ver texto"}
            </Link>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            required
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span>
            {legalText.terms}{" "}
            <Link href={withLocalePath(locale, "/terms")} className="font-medium text-sky-700 hover:underline">
              {locale === "ca" ? "Veure text" : "Ver texto"}
            </Link>
          </span>
        </label>
      </div>

      {state.error ? <p className="break-words text-sm text-red-600">{state.error}</p> : null}

      <Button type="submit" disabled={state.loading || !acceptPrivacy || !acceptTerms} className="w-full">
        {state.loading ? i18n.signup.loading : i18n.signup.submit}
      </Button>

      <Link
        href={withLocalePath(locale, "/login")}
        className="block break-words text-sm font-medium text-sky-700 hover:underline"
      >
        {i18n.signup.toLogin}
      </Link>
    </form>
  );
}
