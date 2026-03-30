import type { I18nLocale } from "@/src/i18n/config";
import { getLocalizedProductCopy, getProductConfig, type ProductId, getCurrentProductId } from "@/src/lib/product/config";

function capitalize(value: string): string {
  return value ? `${value[0]?.toUpperCase() ?? ""}${value.slice(1)}` : value;
}

function getBrandingReplacements(locale: I18nLocale, productId: ProductId): Array<[string, string]> {
  if (productId === "summareu") {
    return [];
  }

  const product = getProductConfig(productId);
  const copy = getLocalizedProductCopy(locale, productId);

  if (locale === "ca") {
    return [
      ["Summa Reu", product.brandName],
      ["junta, assemblea o patronat", copy.meetingAudienceExtended],
      ["junta o patronat", copy.meetingAudience],
      ["entitats socials", copy.workspacePlural],
      ["Entitats socials", capitalize(copy.workspacePlural)],
      ["Entitats", capitalize(copy.workspacePlural)],
      ["entitats", copy.workspacePlural],
      ["Entitat", capitalize(copy.workspaceSingular)],
      ["entitat", copy.workspaceSingular],
      ["Organització", copy.workspaceFallbackName],
      ["organització", copy.workspaceFallbackName.toLowerCase()],
    ];
  }

  return [
    ["Summa Reu", product.brandName],
    ["junta, asamblea o patronato", copy.meetingAudienceExtended],
    ["junta o patronato", copy.meetingAudience],
    ["entidades sociales", copy.workspacePlural],
    ["Entidades sociales", capitalize(copy.workspacePlural)],
    ["Entidades", capitalize(copy.workspacePlural)],
    ["entidades", copy.workspacePlural],
    ["Entidad", capitalize(copy.workspaceSingular)],
    ["entidad", copy.workspaceSingular],
    ["Organización", copy.workspaceFallbackName],
    ["organización", copy.workspaceFallbackName.toLowerCase()],
  ];
}

export function applyProductBrandingToString(
  value: string,
  locale: I18nLocale,
  productId: ProductId = getCurrentProductId()
): string {
  let result = value;
  for (const [from, to] of getBrandingReplacements(locale, productId)) {
    result = result.replaceAll(from, to);
  }
  return result;
}

export function applyProductBranding<T>(
  value: T,
  locale: I18nLocale,
  productId: ProductId = getCurrentProductId()
): T {
  if (typeof value === "string") {
    return applyProductBrandingToString(value, locale, productId) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => applyProductBranding(item, locale, productId)) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      applyProductBranding(item, locale, productId),
    ]);

    return Object.fromEntries(entries) as T;
  }

  return value;
}
