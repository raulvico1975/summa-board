"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/field";
import { applyProductBranding } from "@/src/lib/product/branding";

type Props = {
  locale: "ca" | "es";
  meetingId: string;
  meetingTitle: string;
  scheduledLabel?: string | null;
  initialDisplayName?: string | null;
  autoJoin?: boolean;
  returnHref: string;
};

type JoinState = {
  loading: boolean;
  joinUrl?: string;
  error?: string;
};

const copy = {
  ca: {
    eyebrow: "Accés a la sala",
    title: "Entra a la reunió des de Summa Reu",
    subtitle: "Accedeix a la sala amb el teu nom i entra quan et vagi bé.",
    scheduledAt: "Data i hora",
    displayNameLabel: "Com et veuran a la reunió",
    displayNamePlaceholder: "Escriu el teu nom",
    helper: "Entraràs amb el micro i la càmera apagats. Els podràs activar un cop siguis dins.",
    cta: "Entrar a la reunió",
    loading: "Entrant a la sala...",
    openFallback: "Obrir en una pestanya nova",
    leave: "Sortir de la reunió",
    openedTitle: "Ja ets dins la sala",
    openedBody:
      "La reunió s'està mostrant en aquesta mateixa pàgina. Si prefereixes més espai, la pots obrir en una pestanya nova.",
    error: "No s'ha pogut obrir la reunió.",
    requiredName: "Escriu el teu nom abans d'entrar.",
  },
  es: {
    eyebrow: "Acceso a la sala",
    title: "Entra en la reunión desde Summa Reu",
    subtitle: "Accede a la sala con tu nombre y entra cuando te vaya bien.",
    scheduledAt: "Fecha y hora",
    displayNameLabel: "Cómo te verán en la reunión",
    displayNamePlaceholder: "Escribe tu nombre",
    helper: "Entrarás con el micro y la cámara apagados. Podrás activarlos una vez dentro.",
    cta: "Entrar en la reunión",
    loading: "Entrando en la sala...",
    openFallback: "Abrir en una pestaña nueva",
    leave: "Salir de la reunión",
    openedTitle: "Ya estás dentro de la sala",
    openedBody:
      "La reunión se está mostrando en esta misma página. Si prefieres más espacio, puedes abrirla en una pestaña nueva.",
    error: "No se ha podido abrir la reunión.",
    requiredName: "Escribe tu nombre antes de entrar.",
  },
} as const;

async function requestMeetingJoinToken(input: {
  meetingId: string;
  displayName: string;
}): Promise<string> {
  const response = await fetch("/api/public/meetings/join-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      meetingId: input.meetingId,
      displayName: input.displayName,
    }),
  });
  const data = (await response.json()) as { joinUrl?: string; error?: string };

  if (!response.ok || !data.joinUrl) {
    throw new Error(data.error ?? "JOIN_PREPARATION_FAILED");
  }

  return data.joinUrl;
}

function normalizeHref(href: string): string {
  return href.startsWith("/") ? href : "/";
}

export function MeetingJoinShell({
  locale,
  meetingId,
  meetingTitle,
  scheduledLabel,
  initialDisplayName,
  autoJoin = false,
  returnHref,
}: Props) {
  const text = applyProductBranding(copy[locale], locale);
  const storageKey = `summareu:meetingDisplayName:${meetingId}`;
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [state, setState] = useState<JoinState>({ loading: false });
  const hasAttemptedAutoJoinRef = useRef(false);

  useEffect(() => {
    if (initialDisplayName) {
      setDisplayName(initialDisplayName);
      return;
    }

    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setDisplayName(stored);
      }
    } catch {
      // Best effort only.
    }
  }, [initialDisplayName, storageKey]);

  async function requestJoin(normalizedDisplayName: string) {
    setState({ loading: true });

    try {
      const joinUrl = await requestMeetingJoinToken({
        meetingId,
        displayName: normalizedDisplayName,
      });

      try {
        window.localStorage.setItem(storageKey, normalizedDisplayName);
      } catch {
        // Best effort only.
      }

      setState({ loading: false, joinUrl });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : text.error,
      });
    }
  }

  async function startJoin() {
    const normalizedDisplayName = displayName.trim();
    if (!normalizedDisplayName) {
      setState({ loading: false, error: text.requiredName });
      return;
    }

    await requestJoin(normalizedDisplayName);
  }

  useEffect(() => {
    if (!autoJoin || hasAttemptedAutoJoinRef.current || state.joinUrl || state.loading) {
      return;
    }

    const normalizedDisplayName = displayName.trim();
    if (!normalizedDisplayName) {
      return;
    }

    hasAttemptedAutoJoinRef.current = true;
    setState({ loading: true });

    void requestMeetingJoinToken({
      meetingId,
      displayName: normalizedDisplayName,
    })
      .then((joinUrl) => {
        try {
          window.localStorage.setItem(storageKey, normalizedDisplayName);
        } catch {
          // Best effort only.
        }

        setState({ loading: false, joinUrl });
      })
      .catch((error) => {
        setState({
          loading: false,
          error: error instanceof Error ? error.message : text.error,
        });
      });
  }, [autoJoin, displayName, meetingId, state.joinUrl, state.loading, storageKey, text.error]);

  const safeReturnHref = normalizeHref(returnHref);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-sky-200 bg-[linear-gradient(135deg,#eef8ff_0%,#ffffff_52%,#fff8ef_100%)] p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{text.eyebrow}</p>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{meetingTitle}</h1>
              <p className="text-sm leading-7 text-slate-600 sm:text-base">{text.subtitle}</p>
            </div>
            {scheduledLabel ? (
              <p className="text-sm font-medium text-slate-600">
                {text.scheduledAt}: <span className="text-slate-900">{scheduledLabel}</span>
              </p>
            ) : null}
          </div>

          <div className="rounded-[1.6rem] border border-white/90 bg-white/90 p-4 shadow-sm">
            {!state.joinUrl ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="meeting-display-name">
                    {text.displayNameLabel}
                  </label>
                  <Input
                    id="meeting-display-name"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder={text.displayNamePlaceholder}
                    disabled={state.loading}
                  />
                </div>

                <p className="text-sm leading-6 text-slate-600">{text.helper}</p>

                <Button type="button" className="min-h-12 w-full text-base" disabled={state.loading} onClick={startJoin}>
                  {state.loading ? text.loading : text.cta}
                </Button>

                {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  <p className="font-medium">{text.openedTitle}</p>
                  <p className="mt-1 text-emerald-800">{text.openedBody}</p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <a
                    href={state.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                  >
                    {text.openFallback}
                  </a>
                  <Link
                    href={safeReturnHref}
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    {text.leave}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {state.joinUrl ? (
        <section className="space-y-3">
          <iframe
            key={state.joinUrl}
            src={state.joinUrl}
            title={meetingTitle}
            allow="autoplay; camera; microphone; display-capture; clipboard-write; fullscreen"
            allowFullScreen
            className="min-h-[78vh] w-full rounded-[1.75rem] border border-slate-200 bg-slate-950 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]"
          />
        </section>
      ) : null}
    </div>
  );
}
