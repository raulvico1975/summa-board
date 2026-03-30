import type { I18nLocale } from "@/src/i18n/config";

export type ProductId = "summareu" | "actium";

type ProductLocaleCopy = {
  workspaceSingular: string;
  workspacePlural: string;
  workspaceFallbackName: string;
  meetingAudience: string;
  meetingAudienceExtended: string;
  minutesPromptRole: string;
};

export type ProductConfig = {
  id: ProductId;
  brandName: string;
  canonicalHost: string;
  defaultDescription: string;
  features: {
    contextualHelp: boolean;
    ops: boolean;
    smartMinutes: boolean;
  };
  copy: Record<I18nLocale, ProductLocaleCopy>;
};

const productConfigs: Record<ProductId, ProductConfig> = {
  summareu: {
    id: "summareu",
    brandName: "Summa Reu",
    canonicalHost: "summareu.app",
    defaultDescription: "Votacions, convocatòries i actes per a entitats socials",
    features: {
      contextualHelp: true,
      ops: true,
      smartMinutes: true,
    },
    copy: {
      ca: {
        workspaceSingular: "entitat",
        workspacePlural: "entitats",
        workspaceFallbackName: "Entitat",
        meetingAudience: "junta o patronat",
        meetingAudienceExtended: "junta, assemblea o patronat",
        minutesPromptRole: "Ets assistent de secretaria d'una entitat social.",
      },
      es: {
        workspaceSingular: "entidad",
        workspacePlural: "entidades",
        workspaceFallbackName: "Entidad",
        meetingAudience: "junta o patronato",
        meetingAudienceExtended: "junta, asamblea o patronato",
        minutesPromptRole: "Eres asistente de secretaría de una entidad social.",
      },
    },
  },
  actium: {
    id: "actium",
    brandName: "Actium",
    canonicalHost: "actiumapp.com",
    defaultDescription: "Convocatòries, reunions i actes automàtiques per a equips i empreses",
    features: {
      contextualHelp: true,
      ops: true,
      smartMinutes: true,
    },
    copy: {
      ca: {
        workspaceSingular: "empresa",
        workspacePlural: "empreses",
        workspaceFallbackName: "Empresa",
        meetingAudience: "direcció o equip",
        meetingAudienceExtended: "direcció, equip o responsables clau",
        minutesPromptRole: "Ets assistent de direcció d'una empresa.",
      },
      es: {
        workspaceSingular: "empresa",
        workspacePlural: "empresas",
        workspaceFallbackName: "Empresa",
        meetingAudience: "dirección o equipo",
        meetingAudienceExtended: "dirección, equipo o responsables clave",
        minutesPromptRole: "Eres asistente de dirección de una empresa.",
      },
    },
  },
};

export function normalizeProductId(value: string | null | undefined): ProductId {
  const normalized = value?.trim().toLowerCase();
  return normalized === "actium" ? "actium" : "summareu";
}

function inferProductIdFromRuntime(): ProductId {
  const publicValue = process.env.NEXT_PUBLIC_PRODUCT_ID;
  if (publicValue) {
    return normalizeProductId(publicValue);
  }

  if (typeof window === "undefined") {
    const serverValue =
      process.env.PRODUCT_ID ??
      process.env.CANONICAL_HOST ??
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_CANONICAL_URL ??
      process.env.CANONICAL_URL;
    if (serverValue) {
      return normalizeProductId(serverValue.includes("actium") ? "actium" : serverValue);
    }
  }

  return "summareu";
}

export function getCurrentProductId(): ProductId {
  return inferProductIdFromRuntime();
}

export function getProductConfig(productId: ProductId = getCurrentProductId()): ProductConfig {
  return productConfigs[productId];
}

export function getLocalizedProductCopy(
  locale: I18nLocale,
  productId: ProductId = getCurrentProductId()
): ProductLocaleCopy {
  return getProductConfig(productId).copy[locale];
}

export function getProductBaseUrl(productId: ProductId = getCurrentProductId()): string {
  return `https://${getProductConfig(productId).canonicalHost}`;
}
