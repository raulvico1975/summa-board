"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { useI18n } from "@/src/i18n/client";
import { resolveContextualHelp } from "@/src/lib/help/contextual-help";
import { cn } from "@/src/lib/cn";

const chromeCopy = {
  ca: {
    button: "Ajuda",
    title: "Ajuda d'aquesta pantalla",
    close: "Tancar",
    whatYouSee: "Què estàs veient",
    whatToDo: "Següents passos",
    outcome: "Quan acabis",
    note: "Important",
    openLabel: "Obrir ajuda contextual",
  },
  es: {
    button: "Ayuda",
    title: "Ayuda de esta pantalla",
    close: "Cerrar",
    whatYouSee: "Qué estás viendo",
    whatToDo: "Siguientes pasos",
    outcome: "Cuando termines",
    note: "Importante",
    openLabel: "Abrir ayuda contextual",
  },
} as const;

export function ContextualHelp() {
  const pathname = usePathname() ?? "/";
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const titleId = useId();
  const article = resolveContextualHelp(pathname, locale);
  const text = chromeCopy[locale];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={text.openLabel}
        onClick={() => setOpen(true)}
        className={cn(
          "fixed right-4 bottom-4 z-40 inline-flex items-center justify-center rounded-full border border-sky-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-100/80 transition-colors hover:bg-sky-50 sm:right-6 sm:bottom-6 sm:gap-3 sm:px-4"
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-base font-bold text-white">
          ?
        </span>
        <span className="hidden sm:inline">{text.button}</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 px-4 py-4 sm:justify-end sm:px-6 sm:py-6"
          onClick={() => setOpen(false)}
        >
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{text.title}</p>
                  <h2 id={titleId} className="text-lg font-semibold text-slate-950">
                    {article.title}
                  </h2>
                </div>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)} className="px-3 py-2">
                  {text.close}
                </Button>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{article.summary}</p>
            </div>

            <div className="space-y-5 px-5 py-5 text-sm text-slate-700">
              <section className="space-y-2">
                <h3 className="font-semibold text-slate-900">{text.whatYouSee}</h3>
                <ul className="space-y-2">
                  {article.whatYouSee.map((item) => (
                    <li key={item} className="flex gap-2 leading-6">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-slate-900">{text.whatToDo}</h3>
                <ol className="space-y-2 pl-5">
                  {article.whatToDo.map((item) => (
                    <li key={item} className="list-decimal leading-6">
                      {item}
                    </li>
                  ))}
                </ol>
              </section>

              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{text.outcome}</p>
                <p className="mt-1 leading-6 text-emerald-900">{article.outcome}</p>
              </section>

              {article.note ? (
                <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">{text.note}</p>
                  <p className="mt-1 leading-6 text-amber-900">{article.note}</p>
                </section>
              ) : null}

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                {locale === "ca" ? (
                  <p>
                    Aquesta ajuda s&apos;adapta automàticament a cada pantalla perquè puguis avançar més ràpid.
                  </p>
                ) : (
                  <p>
                    Esta ayuda se adapta automáticamente a cada pantalla para que puedas avanzar más rápido.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
