import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { NewPollForm } from "@/src/components/polls/new-poll-form";
import { requireOwnerPage } from "@/src/lib/ui/owner-page";
import { getRequestI18n } from "@/src/i18n/server";

export default async function NewPollPage() {
  const { locale } = await getRequestI18n();
  await requireOwnerPage();
  const introCopy = {
    ca: {
      title: "Convocar reunió",
      body:
        "Aquest és el primer pas per convocar la reunió: proposa dates i hores, comparteix l'enllaç amb la junta o patronat i després tanca la convocatòria amb l'opció guanyadora.",
      cardTitle: "Proposta de dates",
    },
    es: {
      title: "Convocar reunión",
      body:
        "Este es el primer paso para convocar la reunión: propone fechas y horas, comparte el enlace con la junta o patronato y después cierra la convocatoria con la opción ganadora.",
      cardTitle: "Propuesta de fechas",
    },
  } as const;
  const text = introCopy[locale];

  return (
    <div className="space-y-4">
      <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {text.title}
      </h1>
      <p className="max-w-3xl text-sm text-slate-600">{text.body}</p>
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">{text.cardTitle}</h2>
        </CardHeader>
        <CardContent>
          <NewPollForm />
        </CardContent>
      </Card>
    </div>
  );
}
