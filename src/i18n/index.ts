import { ca } from "@/src/i18n/ca";
import type { DeepPartial, I18nCa } from "@/src/i18n/ca";
import { esCore } from "@/src/i18n/es.core";
import { esExtra } from "@/src/i18n/es.extra";
export * from "@/src/i18n/config";
import type { I18nLocale } from "@/src/i18n/config";
import { applyProductBranding } from "@/src/lib/product/branding";
import { getCurrentProductId, type ProductId } from "@/src/lib/product/config";

const baseI18n: I18nCa = ca;
const i18nCache = new Map<string, I18nCa>();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeI18n<T>(base: T, patch: DeepPartial<T> | undefined): T {
  if (!patch || !isPlainObject(base) || !isPlainObject(patch)) {
    return (patch ?? base) as T;
  }

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(patch)) {
    const patchValue = (patch as Record<string, unknown>)[key];
    if (patchValue === undefined) continue;

    const baseValue = result[key];
    if (isPlainObject(baseValue) && isPlainObject(patchValue)) {
      result[key] = mergeI18n(baseValue, patchValue);
      continue;
    }

    result[key] = patchValue;
  }

  return result as T;
}

const esOverlay = mergeI18n<DeepPartial<I18nCa>>(esCore, esExtra);

const localeOverlayByLocale: Record<I18nLocale, DeepPartial<I18nCa>> = {
  ca,
  es: esOverlay,
};

export function getLocaleOverlay(locale: I18nLocale): DeepPartial<I18nCa> {
  return localeOverlayByLocale[locale];
}

function getCacheKey(locale: I18nLocale, productId: ProductId): string {
  return `${productId}:${locale}`;
}

export function getI18n(locale: I18nLocale, productId: ProductId = getCurrentProductId()): I18nCa {
  const cacheKey = getCacheKey(locale, productId);
  const cached = i18nCache.get(cacheKey);
  if (cached) return cached;

  const merged = mergeI18n(baseI18n, getLocaleOverlay(locale));
  const branded = applyProductBranding(merged, locale, productId);
  i18nCache.set(cacheKey, branded);
  return branded;
}

export const i18n = {
  ca: getI18n("ca"),
  es: getI18n("es"),
} as const;
