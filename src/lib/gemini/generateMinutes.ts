import { generateGeminiText } from "@/src/lib/gemini/client";
import { minutesJsonSchema, type MinutesJsonStrict } from "@/src/lib/minutes/schema";
import { renderMinutesMarkdown } from "@/src/lib/minutes/markdown";

function stripCodeFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseMinutesJson(raw: string): MinutesJsonStrict {
  const candidate = stripCodeFences(raw);
  const parsed = JSON.parse(candidate) as unknown;
  return minutesJsonSchema.parse(parsed);
}

function buildPrompt(transcript: string): string {
  return [
    "Ets assistent de secretaria d'una entitat social.",
    "Genera una acta en català a partir de la transcripció.",
    "Retorna NOMÉS JSON vàlid, sense text extra.",
    "Esquema obligatori:",
    "{",
    '  "language": "ca",',
    '  "summary": string,',
    '  "attendees": string[],',
    '  "agenda": string[],',
    '  "decisions": [{"id": string, "text": string, "owner": string|null, "dueDate": string|null, "tags": string[]}],',
    '  "tasks": [{"id": string, "text": string, "owner": string|null, "dueDate": string|null, "status": "todo"|"doing"|"done"}]',
    "}",
    "Si falten dades, usa null o arrays buids.",
    "Transcripció:",
    transcript,
  ].join("\n");
}

export async function generateMinutesWithGemini(input: {
  model: string;
  transcript: string;
}): Promise<{ minutesJson: MinutesJsonStrict; minutesMarkdown: string }> {
  const prompt = buildPrompt(input.transcript);

  const raw = await generateGeminiText({
    model: input.model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
    },
  });

  try {
    const minutesJson = parseMinutesJson(raw);
    return {
      minutesJson,
      minutesMarkdown: renderMinutesMarkdown(minutesJson),
    };
  } catch {
    const fixRaw = await generateGeminiText({
      model: input.model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                "Converteix aquest contingut en JSON vàlid que compleixi exactament l'esquema demanat.",
                "No afegeixis text fora del JSON.",
                raw,
              ].join("\n\n"),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    });

    const minutesJson = parseMinutesJson(fixRaw);
    return {
      minutesJson,
      minutesMarkdown: renderMinutesMarkdown(minutesJson),
    };
  }
}
