"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";

type MeetingShareActionsProps = {
  locale: "ca" | "es";
  meetingHref: string;
  meetingTitle: string;
  scheduledLabel: string;
};

type CopyState = "idle" | "copied" | "error";

const copy = {
  ca: {
    body: "Tens l'enllaç i un missatge llest per compartir la reunió amb el grup.",
    urlLabel: "Accés a la sala",
    copyLink: "Copiar enllaç de reunió",
    linkCopied: "Enllaç de reunió copiat.",
    copyInvite: "Copiar missatge de convocatòria",
    inviteCopied: "Missatge de convocatòria copiat.",
    copyError: "No s'ha pogut copiar. Torna-ho a provar.",
  },
  es: {
    body: "Tienes el enlace y un mensaje listo para compartir la reunión con el grupo.",
    urlLabel: "Acceso a la sala",
    copyLink: "Copiar enlace de reunión",
    linkCopied: "Enlace de reunión copiado.",
    copyInvite: "Copiar mensaje de convocatoria",
    inviteCopied: "Mensaje de convocatoria copiado.",
    copyError: "No se ha podido copiar. Vuelve a intentarlo.",
  },
} as const;

function buildInviteText(input: {
  locale: "ca" | "es";
  meetingTitle: string;
  scheduledLabel: string;
  meetingUrl: string;
}) {
  if (input.locale === "ca") {
    return [
      `Us compartim la convocatòria de la reunió: ${input.meetingTitle}`,
      `Data i hora: ${input.scheduledLabel}`,
      `Accés a la sala: ${input.meetingUrl}`,
      "",
      "Si us va bé, connecteu-vos uns minuts abans de començar.",
    ].join("\n");
  }

  return [
    `Os compartimos la convocatoria de la reunión: ${input.meetingTitle}`,
    `Fecha y hora: ${input.scheduledLabel}`,
    `Acceso a la sala: ${input.meetingUrl}`,
    "",
    "Si os va bien, conectaos unos minutos antes de empezar.",
  ].join("\n");
}

function resolveMeetingUrl(meetingHref: string): string {
  if (typeof window === "undefined") {
    return meetingHref;
  }

  try {
    return new URL(meetingHref, window.location.origin).toString();
  } catch {
    return meetingHref;
  }
}

export function MeetingShareActions({
  locale,
  meetingHref,
  meetingTitle,
  scheduledLabel,
}: MeetingShareActionsProps) {
  const text = copy[locale];
  const [linkState, setLinkState] = useState<CopyState>("idle");
  const [inviteState, setInviteState] = useState<CopyState>("idle");
  const [meetingUrl, setMeetingUrl] = useState(meetingHref);

  useEffect(() => {
    setMeetingUrl(resolveMeetingUrl(meetingHref));
  }, [meetingHref]);

  async function copyText(value: string, onState: (state: CopyState) => void) {
    try {
      await navigator.clipboard.writeText(value);
      onState("copied");
      window.setTimeout(() => onState("idle"), 2500);
    } catch {
      onState("error");
      window.setTimeout(() => onState("idle"), 2500);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">{text.body}</p>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{text.urlLabel}</p>
        <code className="mt-2 block break-all text-xs text-slate-700">{meetingUrl}</code>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => copyText(resolveMeetingUrl(meetingHref), setLinkState)}
        >
          {text.copyLink}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() =>
            copyText(
              buildInviteText({
                locale,
                meetingTitle,
                scheduledLabel,
                meetingUrl: resolveMeetingUrl(meetingHref),
              }),
              setInviteState
            )
          }
        >
          {text.copyInvite}
        </Button>
      </div>

      {linkState === "copied" ? <p className="text-xs text-emerald-700">{text.linkCopied}</p> : null}
      {inviteState === "copied" ? <p className="text-xs text-emerald-700">{text.inviteCopied}</p> : null}
      {linkState === "error" || inviteState === "error" ? (
        <p className="text-xs text-red-600">{text.copyError}</p>
      ) : null}
    </div>
  );
}
