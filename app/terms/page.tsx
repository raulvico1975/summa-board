import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { getRequestLocale } from "@/src/i18n/server";
import { applyProductBranding } from "@/src/lib/product/branding";
import { getProductConfig } from "@/src/lib/product/config";

const copy = {
  ca: {
    title: "Condicions del servei",
    description: "Condicions bàsiques d'ús del servei per a entitats i organitzacions.",
    sections: [
      {
        title: "1. Objecte del servei",
        body:
          "Summa Reu és un servei per gestionar votacions, convocatòries, reunions i esborranys d'acta per a entitats i organitzacions.",
      },
      {
        title: "2. Compte i accés",
        body:
          "Cada entitat és responsable de custodiar els accessos del seu compte i de les accions executades des de la seva sessió. El servei pot limitar funcionalitats si la subscripció no està activa.",
      },
      {
        title: "3. Ús acceptable",
        body:
          "No es pot fer servir el servei per emmagatzemar contingut il·lícit, vulnerar drets de tercers, ni intentar accedir a dades d'altres entitats o interferir en el funcionament de la plataforma.",
      },
      {
        title: "4. Facturació",
        body:
          "L'accés complet al servei pot requerir una subscripció activa. La facturació i els mètodes de pagament es gestionen a través de Stripe i es poden revisar des del portal de subscripció.",
      },
      {
        title: "5. Gravació i consentiment",
        body:
          "Si l'entitat activa gravacions, assumeix la responsabilitat d'haver informat les persones participants i d'utilitzar aquesta funcionalitat d'acord amb la normativa aplicable i la seva pròpia política interna.",
      },
      {
        title: "6. Disponibilitat i responsabilitat",
        body:
          "El servei es presta amb criteris de continuïtat i seguretat raonables, però funcionalitats com gravacions, transcripcions o integracions externes poden dependre de tercers i estar subjectes a incidències temporals.",
      },
      {
        title: "7. Suspensió i ús abusiu",
        body:
          "Es poden limitar, suspendre o bloquejar funcionalitats quan es detecti ús abusiu, intents d'accés indegut, càrrega excessiva, impagament o activitats contràries a aquestes condicions.",
      },
      {
        title: "8. Dades i eliminació",
        body:
          "Quan una entitat sol·licita baixa o eliminació, Summa Reu pot necessitar una finestra tècnica raonable per retirar les dades operatives i conservar només allò necessari per seguretat, facturació o compliment legal.",
      },
    ],
  },
  es: {
    title: "Condiciones del servicio",
    description: "Condiciones básicas de uso del servicio para entidades y organizaciones.",
    sections: [
      {
        title: "1. Objeto del servicio",
        body:
          "Summa Reu es un servicio para gestionar votaciones, convocatorias, reuniones y borradores de acta para entidades y organizaciones.",
      },
      {
        title: "2. Cuenta y acceso",
        body:
          "Cada entidad es responsable de custodiar los accesos de su cuenta y de las acciones ejecutadas desde su sesión. El servicio puede limitar funcionalidades si la suscripción no está activa.",
      },
      {
        title: "3. Uso aceptable",
        body:
          "No se puede usar el servicio para almacenar contenido ilícito, vulnerar derechos de terceros, ni intentar acceder a datos de otras entidades o interferir en el funcionamiento de la plataforma.",
      },
      {
        title: "4. Facturación",
        body:
          "El acceso completo al servicio puede requerir una suscripción activa. La facturación y los métodos de pago se gestionan a través de Stripe y se pueden revisar desde el portal de suscripción.",
      },
      {
        title: "5. Grabación y consentimiento",
        body:
          "Si la entidad activa grabaciones, asume la responsabilidad de haber informado a las personas participantes y de utilizar esta funcionalidad de acuerdo con la normativa aplicable y su propia política interna.",
      },
      {
        title: "6. Disponibilidad y responsabilidad",
        body:
          "El servicio se presta con criterios de continuidad y seguridad razonables, pero funcionalidades como grabaciones, transcripciones o integraciones externas pueden depender de terceros y estar sujetas a incidencias temporales.",
      },
      {
        title: "7. Suspensión y uso abusivo",
        body:
          "Se pueden limitar, suspender o bloquear funcionalidades cuando se detecte uso abusivo, intentos de acceso indebido, carga excesiva, impago o actividades contrarias a estas condiciones.",
      },
      {
        title: "8. Datos y eliminación",
        body:
          "Cuando una entidad solicite baja o eliminación, Summa Reu puede necesitar una ventana técnica razonable para retirar los datos operativos y conservar solo lo necesario por seguridad, facturación o cumplimiento legal.",
      },
    ],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const product = getProductConfig();
  const text = applyProductBranding(copy[locale], locale);
  return {
    title: `${text.title} | ${product.brandName}`,
    description: text.description,
  };
}

export default async function TermsPage() {
  const locale = await getRequestLocale();
  const text = applyProductBranding(copy[locale], locale);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-slate-900">{text.title}</h1>
          <p className="text-sm text-slate-600">{text.description}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {text.sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-base font-semibold text-slate-900">{section.title}</h2>
              <p className="text-sm leading-6 text-slate-700">{section.body}</p>
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
