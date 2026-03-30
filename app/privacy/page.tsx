import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { getRequestLocale } from "@/src/i18n/server";
import { applyProductBranding } from "@/src/lib/product/branding";
import { getProductConfig } from "@/src/lib/product/config";

const copy = {
  ca: {
    title: "Privacitat",
    description: "Com gestionem dades d'accés, votacions, reunions i gravacions dins Summa Reu.",
    sections: [
      {
        title: "1. Dades que tractem",
        body:
          "Tractem les dades d'accés de l'entitat, les dades bàsiques de configuració, la informació de votacions, l'estat de subscripció i, si escau, gravacions, transcripcions i actes generades dins la plataforma.",
      },
      {
        title: "2. Finalitat",
        body:
          "Fem servir aquestes dades per autenticar l'entitat, prestar el servei, facilitar la coordinació de reunions, generar documentació i mantenir la seguretat operativa de l'aplicació.",
      },
      {
        title: "3. Base de servei i tercers",
        body:
          "Per operar el servei utilitzem proveïdors tècnics com Firebase, Stripe, Daily i serveis de generació assistida d'actes. Només s'utilitzen amb la finalitat de prestar Summa Reu i mantenir-ne el funcionament.",
      },
      {
        title: "4. Gravacions i transcripcions",
        body:
          "Quan una entitat activa la gravació d'una reunió, el contingut es pot processar per generar transcripció i esborrany d'acta. L'entitat és responsable d'informar-ne prèviament les persones participants i de valorar si pot gravar aquella sessió.",
      },
      {
        title: "5. Conservació",
        body:
          "Les dades es mantenen mentre l'entitat tingui el servei actiu o mentre siguin necessàries per a traçabilitat, seguretat, facturació o compliment d'obligacions legals.",
      },
      {
        title: "6. Seguretat operativa",
        body:
          "Apliquem controls raonables d'autenticació, verificació de correu, rate limiting, separació per entitat i registres d'operació per reduir accessos indeguts o ús abusiu del servei.",
      },
      {
        title: "7. Control de l'entitat",
        body:
          "L'entitat és responsable de compartir únicament les dades necessàries amb els seus participants i d'informar-los adequadament quan una reunió pugui ser gravada o processada per generar una acta.",
      },
      {
        title: "8. Drets i supressió",
        body:
          "L'entitat pot sol·licitar rectificació, exportació o supressió de dades del seu espai dins dels marges tècnics i legals aplicables. Algunes dades poden conservar-se temporalment per seguretat, facturació o compliment normatiu.",
      },
    ],
  },
  es: {
    title: "Privacidad",
    description: "Cómo gestionamos datos de acceso, votaciones, reuniones y grabaciones dentro de Summa Reu.",
    sections: [
      {
        title: "1. Datos que tratamos",
        body:
          "Tratamos los datos de acceso de la entidad, la configuración básica, la información de votaciones, el estado de suscripción y, en su caso, grabaciones, transcripciones y actas generadas dentro de la plataforma.",
      },
      {
        title: "2. Finalidad",
        body:
          "Usamos estos datos para autenticar la entidad, prestar el servicio, facilitar la coordinación de reuniones, generar documentación y mantener la seguridad operativa de la aplicación.",
      },
      {
        title: "3. Base de servicio y terceros",
        body:
          "Para operar el servicio utilizamos proveedores técnicos como Firebase, Stripe, Daily y servicios de generación asistida de actas. Solo se usan con la finalidad de prestar Summa Reu y mantener su funcionamiento.",
      },
      {
        title: "4. Grabaciones y transcripciones",
        body:
          "Cuando una entidad activa la grabación de una reunión, el contenido puede procesarse para generar transcripción y borrador de acta. La entidad es responsable de informar previamente a las personas participantes y de valorar si puede grabar esa sesión.",
      },
      {
        title: "5. Conservación",
        body:
          "Los datos se mantienen mientras la entidad tenga el servicio activo o mientras sean necesarios para trazabilidad, seguridad, facturación o cumplimiento de obligaciones legales.",
      },
      {
        title: "6. Seguridad operativa",
        body:
          "Aplicamos controles razonables de autenticación, verificación de correo, rate limiting, separación por entidad y registros de operación para reducir accesos indebidos o uso abusivo del servicio.",
      },
      {
        title: "7. Control de la entidad",
        body:
          "La entidad es responsable de compartir únicamente los datos necesarios con sus participantes y de informarles adecuadamente cuando una reunión pueda ser grabada o procesada para generar un acta.",
      },
      {
        title: "8. Derechos y supresión",
        body:
          "La entidad puede solicitar rectificación, exportación o supresión de datos de su espacio dentro de los márgenes técnicos y legales aplicables. Algunos datos pueden conservarse temporalmente por seguridad, facturación o cumplimiento normativo.",
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

export default async function PrivacyPage() {
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
