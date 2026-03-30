import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/src/i18n/client";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";
import { getOwnerFromServerCookies } from "@/src/lib/firebase/auth";
import { LogoutButton } from "@/src/components/logout-button";
import { ErrorMonitor } from "@/src/components/error-monitor";
import { BrandLogo } from "@/src/components/brand-logo";
import { SessionIdleManager } from "@/src/components/session/session-idle-manager";
import { ContextualHelp } from "@/src/components/help/contextual-help";
import { applyProductBranding } from "@/src/lib/product/branding";
import { getProductConfig } from "@/src/lib/product/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const product = getProductConfig();

export const metadata: Metadata = {
  title: product.brandName,
  description: product.defaultDescription,
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale, i18n } = await getRequestI18n();
  const owner = await getOwnerFromServerCookies();
  const footerCopy = {
    ca: {
      billing: "Subscripció",
      privacy: "Privacitat",
      terms: "Condicions",
      copyright: "Convocatòries, reunions i actes automàtiques per a entitats.",
    },
    es: {
      billing: "Suscripción",
      privacy: "Privacidad",
      terms: "Condiciones",
      copyright: "Convocatorias, reuniones y actas automáticas para entidades.",
    },
  } as const;
  const navLinkClasses =
    "rounded-md px-3 py-2 text-center text-sm leading-tight transition-colors hover:bg-slate-100";
  const footerText = applyProductBranding(footerCopy[locale], locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <I18nProvider locale={locale} i18n={i18n}>
          <SessionIdleManager enabled={Boolean(owner)} />
          <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
              <Link
                href={withLocalePath(locale, "/")}
                className="w-fit shrink-0 text-lg font-semibold text-sky-600"
              >
                <span className="sm:hidden">
                  <BrandLogo compact />
                </span>
                <span className="hidden sm:inline-flex">
                  <BrandLogo />
                </span>
              </Link>

              <nav className="flex w-full flex-wrap items-center gap-2 text-sm sm:w-auto sm:justify-end">
                {owner ? (
                  <>
                    <Link
                      className={`${navLinkClasses} flex-1 sm:flex-none`}
                      href={withLocalePath(locale, "/dashboard")}
                    >
                      {i18n.nav.dashboard}
                    </Link>
                    <Link
                      className={`${navLinkClasses} flex-1 sm:flex-none`}
                      href={withLocalePath(locale, "/polls/new")}
                    >
                      {i18n.nav.newPoll}
                    </Link>
                    <Link
                      className={`${navLinkClasses} flex-1 sm:flex-none`}
                      href={withLocalePath(locale, "/billing")}
                    >
                      {footerText.billing}
                    </Link>
                    <LogoutButton className="w-full sm:w-auto" label={i18n.nav.logout} />
                  </>
                ) : (
                  <>
                    <Link
                      className="flex-1 rounded-md bg-sky-600 px-3 py-2 text-center text-sm font-medium leading-tight text-white transition-colors hover:bg-sky-700 sm:flex-none"
                      href={withLocalePath(locale, "/login")}
                    >
                      {i18n.nav.login}
                    </Link>
                    <Link
                      className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-center text-sm leading-tight transition-colors hover:bg-slate-100 sm:flex-none"
                      href={withLocalePath(locale, "/signup")}
                    >
                      {i18n.nav.signup}
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">{children}</main>
          {product.features.contextualHelp ? <ContextualHelp /> : null}
          <footer className="border-t border-slate-200/80 bg-white/85 backdrop-blur">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p>{footerText.copyright}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={withLocalePath(locale, "/privacy")} className="hover:text-slate-900 hover:underline">
                  {footerText.privacy}
                </Link>
                <Link href={withLocalePath(locale, "/terms")} className="hover:text-slate-900 hover:underline">
                  {footerText.terms}
                </Link>
              </div>
            </div>
          </footer>
          <ErrorMonitor />
        </I18nProvider>
      </body>
    </html>
  );
}
