import { generateGeminiText } from "@/src/lib/gemini/client";

const MAX_INLINE_BYTES = 7 * 1024 * 1024;

export async function transcribeWithGemini(input: {
  model: string;
  audioBytes: Buffer;
  mimeType: string;
}): Promise<string> {
  if (input.audioBytes.length > MAX_INLINE_BYTES) {
    throw new Error("AUDIO_TOO_LARGE_FOR_INLINE");
  }

  const prompt =
    "Transcriu aquest àudio de reunió. Retorna només text pla, amb salts de línia entre intervencions.";

  const text = await generateGeminiText({
    model: input.model,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: input.mimeType,
              data: input.audioBytes.toString("base64"),
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });

  return text.trim();
}
