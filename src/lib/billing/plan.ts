import type { OrgPlan } from "@/src/lib/db/types";
import type { I18nLocale } from "@/src/i18n/config";
import { getCurrentProductId } from "@/src/lib/product/config";

type MarketingPlanCopy = {
  displayName: string;
  price: string;
  period: string;
  note: string;
  summary: string;
  highlights: string[];
  recordingLimitLabel: string;
  billingHint: string;
};

const PLAN_PRICE = "24,90 €";

export function getMarketingPlanCopy({
  locale,
  plan = "basic",
  recordingLimitMinutes = 90,
}: {
  locale: I18nLocale;
  plan?: OrgPlan;
  recordingLimitMinutes?: number;
}): MarketingPlanCopy {
  const normalizedPlan = plan === "basic" ? "basic" : "basic";
  const productId = getCurrentProductId();

  if (productId === "actium") {
    if (locale === "es") {
      return {
        displayName: normalizedPlan === "basic" ? "Plan Empresa" : "Plan Empresa",
        price: PLAN_PRICE,
        period: "al mes",
        note: "por empresa",
        summary: "Convocatorias, reuniones y actas automáticas con IA desde un único espacio.",
        highlights: [
          "Convocatorias públicas para cerrar fecha sin cadenas eternas de correo.",
          "Sala de reunión lista para compartir con dirección, equipo o responsables internos.",
          "Borrador de acta con IA preparado para revisarlo, repartirlo y dar seguimiento.",
        ],
        recordingLimitLabel: `Incluye hasta ${recordingLimitMinutes} minutos de grabación por reunión.`,
        billingHint: `${PLAN_PRICE}/mes con facturación segura.`,
      };
    }

    return {
      displayName: normalizedPlan === "basic" ? "Pla Empresa" : "Pla Empresa",
      price: PLAN_PRICE,
      period: "al mes",
      note: "per empresa",
      summary: "Convocatòries, reunions i actes automàtiques amb IA des d'un únic espai.",
      highlights: [
        "Convocatòries públiques per tancar data sense cadenes eternes de correu.",
        "Sala de reunió llesta per compartir amb direcció, equip o responsables interns.",
        "Esborrany d'acta amb IA preparat per revisar-lo, repartir-lo i fer seguiment.",
      ],
      recordingLimitLabel: `Inclou fins a ${recordingLimitMinutes} minuts de gravació per reunió.`,
      billingHint: `${PLAN_PRICE}/mes amb facturació segura.`,
    };
  }

  if (locale === "es") {
    return {
      displayName: normalizedPlan === "basic" ? "Plan Entidad" : "Plan Entidad",
      price: PLAN_PRICE,
      period: "al mes",
      note: "por entidad",
      summary: "Convocatorias, reuniones y actas automáticas con IA desde un único espacio.",
      highlights: [
        "Convocatorias públicas para decidir la fecha sin logins ni códigos.",
        "Sala de reunión lista para compartir con junta, patronato o equipo.",
        "Borrador de acta con IA preparado para revisarlo y archivarlo.",
      ],
      recordingLimitLabel: `Incluye hasta ${recordingLimitMinutes} minutos de grabación por reunión.`,
      billingHint: `${PLAN_PRICE}/mes con facturación segura.`,
    };
  }

  return {
    displayName: normalizedPlan === "basic" ? "Pla Entitat" : "Pla Entitat",
    price: PLAN_PRICE,
    period: "al mes",
    note: "per entitat",
    summary: "Convocatòries, reunions i actes automàtiques amb IA des d'un únic espai.",
    highlights: [
      "Convocatòries públiques per decidir la data sense logins ni codis.",
      "Sala de reunió llesta per compartir amb junta, patronat o equip.",
      "Esborrany d'acta amb IA preparat per revisar-lo i arxivar-lo.",
    ],
    recordingLimitLabel: `Inclou fins a ${recordingLimitMinutes} minuts de gravació per reunió.`,
    billingHint: `${PLAN_PRICE}/mes amb facturació segura.`,
  };
}
