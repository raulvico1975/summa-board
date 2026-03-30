import type { I18nLocale } from "@/src/i18n/config";
import { getCurrentProductId, getProductBaseUrl, type ProductId } from "@/src/lib/product/config";

export type HomePageCopy = {
  heroBadge: string;
  heroTitle: string;
  heroIntro: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroHighlights: string[];
  heroPanelTitle: string;
  heroPanelSteps: Array<{ title: string; body: string }>;
  stepsTitle: string;
  stepsLead: string;
  stepsItems: Array<{ title: string; body: string }>;
  valueTitle: string;
  valueLead: string;
  valueCards: Array<{ title: string; body: string }>;
  pricingEyebrow: string;
  pricingTitle: string;
  pricingBody: string;
  offerTitle: string;
  offerLead: string;
  offerItems: string[];
  pricingIncludesTitle: string;
  pricingCta: string;
  pricingSecondaryCta: string;
  faqTitle: string;
  faqItems: Array<{ question: string; answer: string }>;
  footerTagline: string;
  footerSupport: string;
  footerSitemapTitle: string;
  footerAppsTitle: string;
  footerTerritoryLabel: string;
  footerTerritoryBody: string;
  footerAreas: string[];
  footerFeatureLink: string;
  footerFlowLink: string;
  footerPricingLink: string;
  footerAccessLink: string;
  footerSignupLink: string;
  footerPrivacy: string;
  footerTerms: string;
  footerApps: Array<{ label: string; href: string; body: string }>;
};

function buildHomeCopyByProduct(productId: ProductId): Record<I18nLocale, HomePageCopy> {
  const baseUrl = getProductBaseUrl(productId);

  if (productId === "actium") {
    return {
      ca: {
        heroBadge: "Reunions clares per a empreses",
        heroTitle: "Alinea l'equip, celebra la reunió i surt amb l'acta preparada",
        heroIntro:
          "Actium ajuda empreses i equips a proposar dates, decidir ràpid, fer la reunió i obtenir un esborrany d'acta des d'un sol lloc.",
        heroPrimaryCta: "Activa l'espai de l'empresa",
        heroSecondaryCta: "Entrar com a empresa",
        heroHighlights: ["Sense logins", "Temps il·limitat", "Actes amb IA"],
        heroPanelTitle: "Què t'emportes",
        heroPanelSteps: [
          {
            title: "Una data tancada",
            body: "L'equip respon ràpid i veus quina franja té més encaix sense perseguir ningú.",
          },
          {
            title: "Una reunió fàcil d'executar",
            body: "Entreu a la reunió sense fricció, amb accés clar i una sala llesta per compartir.",
          },
          {
            title: "Una acta amb decisions i tasques",
            body: "Quan acaba, tens una base d'acta preparada per revisar, distribuir i fer seguiment.",
          },
        ],
        stepsTitle: "Com funciona",
        stepsLead:
          "La dinàmica està pensada perquè l'empresa no perdi temps ni en la coordinació prèvia ni en el tancament posterior.",
        stepsItems: [
          {
            title: "1. Proposes opcions",
            body: "Crees la convocatòria amb diverses franges i comparteixes un únic enllaç amb direcció, equip o persones clau.",
          },
          {
            title: "2. Tanques la data",
            body: "Veus les coincidències en una taula clara i fixes la reunió amb l'opció guanyadora.",
          },
          {
            title: "3. Fas la reunió i tens l'acta",
            body: "Entreu a la sala des d'Actium i, quan acaba, parteixes d'un esborrany d'acta llest per revisar.",
          },
        ],
        valueTitle: "Què fa exactament Actium",
        valueLead:
          "Quan una reunió impacta operacions, direcció o seguiment, cal sortir-ne amb decisions clares. Actium està pensat per equips que volen decidir ràpid i deixar traça del que s'ha acordat.",
        valueCards: [
          {
            title: "Convoca",
            body: "Posa diverses dates sobre la taula i aconsegueix respostes clares sense cadenes eternes de correu.",
          },
          {
            title: "Decideix",
            body: "Agrupa totes les respostes en un sol lloc i fixa la data sense improvisació.",
          },
          {
            title: "Realitza la reunió",
            body: "Feu la reunió amb una sala llesta per compartir i amb accés simple per a tothom.",
          },
          {
            title: "Obté l'acta automàtica",
            body: "Quan acaba la reunió, tens un esborrany amb resum, acords i tasques per validar i distribuir.",
          },
        ],
        pricingEyebrow: "Preu clar",
        pricingTitle: "Un únic pla per a empreses",
        pricingBody:
          "Un únic pla perquè el teu equip convoqui reunions, les faci i surti amb una acta automàtica preparada per revisar.",
        offerTitle: "Per què no és només una altra videotrucada",
        offerLead:
          "Actium cobreix el cicle complet: abans de la reunió, durant la reunió i després de la reunió. Menys coordinació dispersa, més decisions traçables.",
        offerItems: [
          "Convocatòria final amb enllaç, missatge preparat i ICS descarregable.",
          "Sala de reunió llesta per compartir amb equip, direcció o responsables interns.",
          "Acta automàtica amb IA des del mateix espai de treball.",
        ],
        pricingIncludesTitle: "Què inclou",
        pricingCta: "Començar amb aquest pla",
        pricingSecondaryCta: "Veure accés empresa",
        faqTitle: "Preguntes freqüents",
        faqItems: [
          {
            question: "Les persones participants necessiten compte?",
            answer: "No. La votació i l'entrada a la reunió es poden compartir amb un enllaç directe.",
          },
          {
            question: "La reunió té límit de temps?",
            answer: "No hi ha un límit curt de videotrucada. El pla inclou la gravació necessària per generar l'acta.",
          },
          {
            question: "L'acta surt publicada automàticament?",
            answer: "No. Actium prepara un esborrany perquè l'empresa el revisi abans de distribuir-lo o arxivar-lo.",
          },
        ],
        footerTagline: "Convocatòries, reunions i actes automàtiques amb IA per a equips i empreses.",
        footerSupport: "Menys correus, menys improvisació, més seguiment.",
        footerSitemapTitle: "Navegació",
        footerAppsTitle: "Producte",
        footerTerritoryLabel: "Pensat per",
        footerTerritoryBody: "Equips petits i mitjans que volen menys coordinació dispersa i més decisions traçables.",
        footerAreas: ["Direcció", "Operacions", "Comercial", "RRHH"],
        footerFeatureLink: "Què fa Actium",
        footerFlowLink: "Com funciona",
        footerPricingLink: "Preu",
        footerAccessLink: "Accés empresa",
        footerSignupLink: "Alta d'empresa",
        footerPrivacy: "Privacitat",
        footerTerms: "Condicions",
        footerApps: [
          {
            label: "Actium",
            href: baseUrl,
            body: "Reunions, convocatòries i actes per a equips i empreses.",
          },
        ],
      },
      es: {
        heroBadge: "Reuniones claras para empresas",
        heroTitle: "Alinea al equipo, celebra la reunión y sal con el acta preparada",
        heroIntro:
          "Actium ayuda a empresas y equipos a proponer fechas, decidir rápido, hacer la reunión y obtener un borrador de acta desde un solo lugar.",
        heroPrimaryCta: "Activa el espacio de la empresa",
        heroSecondaryCta: "Entrar como empresa",
        heroHighlights: ["Sin logins", "Tiempo ilimitado", "Actas con IA"],
        heroPanelTitle: "Qué te llevas",
        heroPanelSteps: [
          {
            title: "Una fecha cerrada",
            body: "El equipo responde rápido y ves qué franja encaja mejor sin perseguir a nadie.",
          },
          {
            title: "Una reunión fácil de ejecutar",
            body: "Entráis en la reunión sin fricción, con acceso claro y una sala lista para compartir.",
          },
          {
            title: "Un acta con decisiones y tareas",
            body: "Cuando termina, tienes una base de acta preparada para revisar, distribuir y dar seguimiento.",
          },
        ],
        stepsTitle: "Cómo funciona",
        stepsLead:
          "La dinámica está pensada para que la empresa no pierda tiempo ni en la coordinación previa ni en el cierre posterior.",
        stepsItems: [
          {
            title: "1. Propones opciones",
            body: "Creas la convocatoria con varias franjas y compartes un único enlace con dirección, equipo o responsables clave.",
          },
          {
            title: "2. Cierras la fecha",
            body: "Ves las coincidencias en una tabla clara y fijas la reunión con la opción ganadora.",
          },
          {
            title: "3. Haces la reunión y tienes el acta",
            body: "Entráis en la sala desde Actium y, cuando termina, partes de un borrador de acta listo para revisar.",
          },
        ],
        valueTitle: "Qué hace exactamente Actium",
        valueLead:
          "Cuando una reunión impacta operaciones, dirección o seguimiento, hay que salir con decisiones claras. Actium está pensado para equipos que quieren decidir rápido y dejar trazabilidad de lo acordado.",
        valueCards: [
          {
            title: "Convoca",
            body: "Pon varias fechas sobre la mesa y consigue respuestas claras sin cadenas eternas de correo.",
          },
          {
            title: "Decide",
            body: "Agrupa todas las respuestas en un solo lugar y fija la fecha sin improvisación.",
          },
          {
            title: "Realiza la reunión",
            body: "Haced la reunión con una sala lista para compartir y con acceso simple para todo el mundo.",
          },
          {
            title: "Obtén el acta automática",
            body: "Cuando termina la reunión, tienes un borrador con resumen, acuerdos y tareas para validar y distribuir.",
          },
        ],
        pricingEyebrow: "Precio claro",
        pricingTitle: "Un único plan para empresas",
        pricingBody:
          "Un único plan para que tu equipo convoque reuniones, las haga y salga con un acta automática preparada para revisar.",
        offerTitle: "Por qué no es solo otra videollamada",
        offerLead:
          "Actium cubre el ciclo completo: antes de la reunión, durante la reunión y después de la reunión. Menos coordinación dispersa y más decisiones trazables.",
        offerItems: [
          "Convocatoria final con enlace, mensaje preparado e ICS descargable.",
          "Sala de reunión lista para compartir con equipo, dirección o responsables internos.",
          "Acta automática con IA desde el mismo espacio de trabajo.",
        ],
        pricingIncludesTitle: "Qué incluye",
        pricingCta: "Empezar con este plan",
        pricingSecondaryCta: "Ver acceso empresa",
        faqTitle: "Preguntas frecuentes",
        faqItems: [
          {
            question: "¿Las personas participantes necesitan cuenta?",
            answer: "No. La votación y la entrada a la reunión se pueden compartir con un enlace directo.",
          },
          {
            question: "¿La reunión tiene límite de tiempo?",
            answer: "No hay un límite corto de videollamada. El plan incluye la grabación necesaria para generar el acta.",
          },
          {
            question: "¿El acta se publica automáticamente?",
            answer: "No. Actium prepara un borrador para que la empresa lo revise antes de distribuirlo o archivarlo.",
          },
        ],
        footerTagline: "Convocatorias, reuniones y actas automáticas con IA para equipos y empresas.",
        footerSupport: "Menos correos, menos improvisación y más seguimiento.",
        footerSitemapTitle: "Navegación",
        footerAppsTitle: "Producto",
        footerTerritoryLabel: "Pensado para",
        footerTerritoryBody: "Equipos pequeños y medianos que quieren menos coordinación dispersa y más decisiones trazables.",
        footerAreas: ["Dirección", "Operaciones", "Comercial", "RRHH"],
        footerFeatureLink: "Qué hace Actium",
        footerFlowLink: "Cómo funciona",
        footerPricingLink: "Precio",
        footerAccessLink: "Acceso empresa",
        footerSignupLink: "Alta de empresa",
        footerPrivacy: "Privacidad",
        footerTerms: "Condiciones",
        footerApps: [
          {
            label: "Actium",
            href: baseUrl,
            body: "Reuniones, convocatorias y actas para equipos y empresas.",
          },
        ],
      },
    };
  }

  return {
    ca: {
      heroBadge: "Reunions clares per a entitats",
      heroTitle: "Organitza reunions i obtén l'acta automàtica amb IA",
      heroIntro:
        "Summa Reu ajuda la teva entitat a proposar dates, decidir quan es fa la reunió, realitzar-la i obtenir una acta automàtica des d'un sol lloc.",
      heroPrimaryCta: "Activa l'espai de l'entitat",
      heroSecondaryCta: "Entrar com a entitat",
      heroHighlights: ["Sense logins", "Temps il·limitat", "Actes amb IA"],
      heroPanelTitle: "Què t'emportes",
      heroPanelSteps: [
        {
          title: "Una data decidida",
          body: "L'equip respon i veus ràpidament quina opció encaixa millor.",
        },
        {
          title: "Una reunió fàcil de fer",
          body: "Entreu a la reunió sense logins ni codis complicats.",
        },
        {
          title: "Una acta automàtica amb IA",
          body: "Quan acaba, tens una base d'acta llesta per revisar, arxivar o compartir.",
        },
      ],
      stepsTitle: "Com funciona",
      stepsLead:
        "La dinàmica està pensada perquè l'entitat no s'encalli ni en la convocatòria ni en la documentació final.",
      stepsItems: [
        {
          title: "1. Proposes opcions",
          body: "Crees la convocatòria amb diverses franges i comparteixes un únic enllaç públic amb la junta o l'equip.",
        },
        {
          title: "2. Tanques la data",
          body: "Veus les coincidències en una taula clara i tanques la convocatòria amb l'opció guanyadora.",
        },
        {
          title: "3. Fas la reunió i tens l'acta",
          body: "Entreu a la sala des de Summa Reu i, quan acaba, reps una base d'acta preparada per revisar.",
        },
      ],
      valueTitle: "Què fa exactament Summa Reu",
      valueLead:
        "Prou d'haver d'estar prenent notes de cada reunió. Està pensat per a entitats que volen reunir-se, decidir i sortir amb la feina documental molt més avançada.",
      valueCards: [
        {
          title: "Convoca",
          body: "Posa diverses dates sobre la taula i fes que tothom respongui de manera clara.",
        },
        {
          title: "Decideix",
          body: "Agrupa les respostes en un únic lloc i tanca la data sense perseguir ningú.",
        },
        {
          title: "Realitza la reunió",
          body: "Feu la reunió sense logins ni codis complicats i amb temps il·limitat.",
        },
        {
          title: "Obté l'acta automàtica",
          body: "Quan acaba la reunió, tens l'acta generada amb IA llesta per arxivar o compartir.",
        },
      ],
      pricingEyebrow: "Preu clar",
      pricingTitle: "Un únic pla per a entitats",
      pricingBody:
        "Un únic pla perquè la teva entitat convoqui, faci reunions i obtingui actes automàtiques amb IA.",
      offerTitle: "Per què se sent com una eina premium",
      offerLead:
        "No és només una sala de videotrucada. És un circuit complet perquè la reunió surti bé abans, durant i després.",
      offerItems: [
        "Entrada pròpia a la reunió amb la marca de Summa Reu.",
        "Convocatòria final amb enllaç, missatge preparat i ICS descarregable.",
        "Acta automàtica amb IA des del mateix espai de treball.",
      ],
      pricingIncludesTitle: "Què inclou",
      pricingCta: "Començar amb aquest pla",
      pricingSecondaryCta: "Veure accés entitat",
      faqTitle: "Preguntes freqüents",
      faqItems: [
        {
          question: "Les persones participants necessiten compte?",
          answer: "No. La votació i l'entrada a la reunió es poden compartir amb un enllaç directe.",
        },
        {
          question: "La reunió té límit de temps?",
          answer: "No hi ha un límit curt de videotrucada. El pla inclou la gravació necessària per generar l'acta.",
        },
        {
          question: "L'acta surt publicada automàticament?",
          answer: "No. Summa Reu prepara un esborrany perquè l'entitat el revisi abans d'arxivar-lo o compartir-lo.",
        },
      ],
      footerTagline: "Convocatòries, reunions i actes automàtiques amb IA per a entitats.",
      footerSupport: "Prou de prendre notes a mà a cada reunió.",
      footerSitemapTitle: "Navegació",
      footerAppsTitle: "Aplicacions intel.ligents per entitats",
      footerTerritoryLabel: "Territori",
      footerTerritoryBody: "Servei pensat per a entitats de Catalunya.",
      footerAreas: ["Barcelona", "Girona", "Lleida", "Tarragona"],
      footerFeatureLink: "Què fa Summa Reu",
      footerFlowLink: "Com funciona",
      footerPricingLink: "Preu",
      footerAccessLink: "Accés entitat",
      footerSignupLink: "Alta d'entitat",
      footerPrivacy: "Privacitat",
      footerTerms: "Condicions",
      footerApps: [
        {
          label: "Summa Reu",
          href: baseUrl,
          body: "Convocatòries, reunions i actes per a entitats.",
        },
        {
          label: "Summa Social",
          href: "https://summasocial.app",
          body: "Gestió econòmica i fiscal per a entitats.",
        },
      ],
    },
    es: {
      heroBadge: "Reuniones claras para entidades",
      heroTitle: "Organiza reuniones y obtén el acta automática con IA",
      heroIntro:
        "Summa Reu ayuda a tu entidad a proponer fechas, decidir cuándo se hace la reunión, realizarla y obtener un acta automática desde un solo lugar.",
      heroPrimaryCta: "Activa el espacio de la entidad",
      heroSecondaryCta: "Entrar como entidad",
      heroHighlights: ["Sin logins", "Tiempo ilimitado", "Actas con IA"],
      heroPanelTitle: "Qué te llevas",
      heroPanelSteps: [
        {
          title: "Una fecha decidida",
          body: "El equipo responde y ves rápido qué opción encaja mejor.",
        },
        {
          title: "Una reunión fácil de hacer",
          body: "Entráis en la reunión sin logins ni códigos complicados.",
        },
        {
          title: "Un acta automática con IA",
          body: "Cuando termina, tienes una base de acta lista para revisarla, archivarla o compartirla.",
        },
      ],
      stepsTitle: "Cómo funciona",
      stepsLead:
        "La dinámica está pensada para que la entidad no se atasque ni en la convocatoria ni en la documentación final.",
      stepsItems: [
        {
          title: "1. Propones opciones",
          body: "Creas la convocatoria con varias franjas y compartes un único enlace público con la junta o el equipo.",
        },
        {
          title: "2. Cierras la fecha",
          body: "Ves las coincidencias en una tabla clara y cierras la convocatoria con la opción ganadora.",
        },
        {
          title: "3. Haces la reunión y tienes el acta",
          body: "Entráis en la sala desde Summa Reu y, cuando termina, recibes una base de acta preparada para revisar.",
        },
      ],
      valueTitle: "Qué hace exactamente Summa Reu",
      valueLead:
        "Se acabó tener que estar tomando notas de cada reunión. Está pensado para entidades que quieren reunirse, decidir y salir con la parte documental mucho más avanzada.",
      valueCards: [
        {
          title: "Convoca",
          body: "Plantea varias fechas y consigue que todo el mundo responda de forma clara.",
        },
        {
          title: "Decide",
          body: "Agrupa las respuestas en un único lugar y cierra la fecha sin perseguir a nadie.",
        },
        {
          title: "Realiza la reunión",
          body: "Haced la reunión sin logins ni códigos complicados y con tiempo ilimitado.",
        },
        {
          title: "Obtén el acta automática",
          body: "Cuando termina la reunión, tienes el acta generada con IA lista para archivarla o compartirla.",
        },
      ],
      pricingEyebrow: "Precio claro",
      pricingTitle: "Un único plan para entidades",
      pricingBody:
        "Un único plan para que tu entidad convoque, haga reuniones y obtenga actas automáticas con IA.",
      offerTitle: "Por qué se siente como una herramienta premium",
      offerLead:
        "No es solo una sala de videollamada. Es un circuito completo para que la reunión salga bien antes, durante y después.",
      offerItems: [
        "Entrada propia a la reunión con la marca de Summa Reu.",
        "Convocatoria final con enlace, mensaje preparado e ICS descargable.",
        "Acta automática con IA desde el mismo espacio de trabajo.",
      ],
      pricingIncludesTitle: "Qué incluye",
      pricingCta: "Empezar con este plan",
      pricingSecondaryCta: "Ver acceso entidad",
      faqTitle: "Preguntas frecuentes",
      faqItems: [
        {
          question: "¿Las personas participantes necesitan cuenta?",
          answer: "No. La votación y la entrada a la reunión se pueden compartir con un enlace directo.",
        },
        {
          question: "¿La reunión tiene límite de tiempo?",
          answer: "No hay un límite corto de videollamada. El plan incluye la grabación necesaria para generar el acta.",
        },
        {
          question: "¿El acta se publica automáticamente?",
          answer: "No. Summa Reu prepara un borrador para que la entidad lo revise antes de archivarlo o compartirlo.",
        },
      ],
      footerTagline: "Convocatorias, reuniones y actas automáticas con IA para entidades.",
      footerSupport: "Se acabó tomar notas a mano en cada reunión.",
      footerSitemapTitle: "Navegación",
      footerAppsTitle: "Aplicaciones inteligentes para entidades",
      footerTerritoryLabel: "Territorio",
      footerTerritoryBody: "Servicio pensado para entidades de Cataluña.",
      footerAreas: ["Barcelona", "Girona", "Lleida", "Tarragona"],
      footerFeatureLink: "Qué hace Summa Reu",
      footerFlowLink: "Cómo funciona",
      footerPricingLink: "Precio",
      footerAccessLink: "Acceso entidad",
      footerSignupLink: "Alta de entidad",
      footerPrivacy: "Privacidad",
      footerTerms: "Condiciones",
      footerApps: [
        {
          label: "Summa Reu",
          href: baseUrl,
          body: "Convocatorias, reuniones y actas para entidades.",
        },
        {
          label: "Summa Social",
          href: "https://summasocial.app",
          body: "Gestión económica y fiscal para entidades.",
        },
      ],
    },
  };
}

export function getHomePageCopy(
  locale: I18nLocale,
  productId: ProductId = getCurrentProductId()
): HomePageCopy {
  return buildHomeCopyByProduct(productId)[locale];
}
