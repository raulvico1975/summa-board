import type { Metadata } from "next";
import Link from "next/link";
import { getRequestI18n } from "@/src/i18n/server";
import { withLocalePath } from "@/src/i18n/routing";
import { getMarketingPlanCopy } from "@/src/lib/billing/plan";
import { localizedPublicMetadata } from "@/src/lib/seo";
import { getHomePageCopy } from "@/src/lib/product/home";
import { getProductConfig } from "@/src/lib/product/config";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, i18n } = await getRequestI18n();
  return localizedPublicMetadata({
    locale,
    path: "/",
    title: i18n.home.title,
    description: i18n.home.subtitle,
  });
}

export default async function HomePage() {
  const { locale } = await getRequestI18n();
  const product = getProductConfig();
  const text = getHomePageCopy(locale);
  const plan = getMarketingPlanCopy({ locale });
  const homeHref = withLocalePath(locale, "/");
  const featuresHref = `${homeHref}#que-fa`;
  const pricingHref = `${homeHref}#preu`;
  const primaryCtaClasses =
    "inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-800";
  const secondaryCtaClasses =
    "inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100";

  return (
    <div className="space-y-8 sm:space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef8ff_48%,#fff7ed_100%)] px-5 py-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] sm:px-7 sm:py-8">
        <div aria-hidden className="absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_68%)]" />
        <div aria-hidden className="absolute -bottom-12 left-10 h-36 w-36 rounded-full bg-amber-200/35 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <p className="inline-flex w-fit rounded-full border border-sky-200 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
              {text.heroBadge}
            </p>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                {text.heroTitle}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">{text.heroIntro}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={withLocalePath(locale, "/signup")} className={primaryCtaClasses}>
                {text.heroPrimaryCta}
              </Link>
              <Link href={withLocalePath(locale, "/login")} className={secondaryCtaClasses}>
                {text.heroSecondaryCta}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {text.heroHighlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/80 bg-white/88 p-4 shadow-[0_24px_55px_-44px_rgba(15,23,42,0.4)] backdrop-blur sm:p-5">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{text.heroPanelTitle}</p>
                <div className="mt-4 space-y-3">
                  {text.heroPanelSteps.map((item) => (
                    <div key={item.title} className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4">
                      <div className="space-y-1">
                        <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
                        <p className="text-sm leading-6 text-slate-600">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="que-fa" className="space-y-4 scroll-mt-24">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{text.valueTitle}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{text.valueLead}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {text.valueCards.map((item, index) => (
            <div
              key={item.title}
              className="rounded-[1.6rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.25)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">0{index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{text.stepsTitle}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{text.stepsLead}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {text.stepsItems.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-5 py-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.24)]"
            >
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#fffdf8_0%,#ffffff_52%,#eef8ff_100%)] px-5 py-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.22)] sm:px-7 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{text.offerTitle}</h2>
            <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">{text.offerLead}</p>
          </div>

          <div className="grid gap-3">
            {text.offerItems.map((item) => (
              <div key={item} className="rounded-[1.4rem] border border-white/90 bg-white/85 px-4 py-4">
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="preu"
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-5 py-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.22)] sm:px-7 sm:py-8 scroll-mt-24"
      >
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">{text.pricingEyebrow}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{text.pricingTitle}</h2>
            <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">{text.pricingBody}</p>

            <div className="rounded-[1.6rem] border border-slate-200 bg-slate-950 px-5 py-5 text-white">
              <p className="text-sm font-medium text-slate-300">{plan.note}</p>
              <p className="mt-2 text-5xl font-semibold tracking-tight">{plan.price}</p>
              <p className="mt-1 text-base text-slate-300">{plan.period}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={withLocalePath(locale, "/signup")} className={primaryCtaClasses}>
                {text.pricingCta}
              </Link>
              <Link href={withLocalePath(locale, "/login")} className={secondaryCtaClasses}>
                {text.pricingSecondaryCta}
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">{text.pricingIncludesTitle}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {plan.highlights.concat(plan.recordingLimitLabel).map((item) => (
                <div key={item} className="rounded-[1.45rem] border border-slate-200 bg-white px-4 py-4">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{text.faqTitle}</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {text.faqItems.map((item) => (
            <div key={item.question} className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5">
              <h3 className="text-base font-semibold text-slate-900">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white/70 px-5 py-10 sm:px-7 sm:py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <Link href={homeHref} className="inline-flex text-lg font-semibold tracking-tight text-slate-950 hover:opacity-90">
              {product.brandName}
            </Link>
            <p className="max-w-sm text-sm leading-6 text-slate-600">{text.footerTagline}</p>
            <p className="text-sm leading-6 text-slate-500">{text.footerSupport}</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">{text.footerSitemapTitle}</p>
            <nav className="grid gap-3 text-sm text-slate-600">
              <Link href={featuresHref} className="hover:text-slate-950 hover:underline">
                {text.footerFeatureLink}
              </Link>
              <Link href={pricingHref} className="hover:text-slate-950 hover:underline">
                {text.footerPricingLink}
              </Link>
              <Link href={withLocalePath(locale, "/login")} className="hover:text-slate-950 hover:underline">
                {text.footerAccessLink}
              </Link>
              <Link href={withLocalePath(locale, "/signup")} className="hover:text-slate-950 hover:underline">
                {text.footerSignupLink}
              </Link>
              <Link href={withLocalePath(locale, "/privacy")} className="hover:text-slate-950 hover:underline">
                {text.footerPrivacy}
              </Link>
              <Link href={withLocalePath(locale, "/terms")} className="hover:text-slate-950 hover:underline">
                {text.footerTerms}
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">{text.footerAppsTitle}</p>
            <div className="space-y-3">
              {text.footerApps.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-sm text-slate-600 hover:text-slate-950"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="font-medium text-slate-900">{item.label}</span>
                  <span className="mt-1 block leading-6">{item.body}</span>
                </Link>
              ))}
            </div>
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{text.footerTerritoryLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text.footerTerritoryBody}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {text.footerAreas.map((area) => (
                  <span key={area} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
