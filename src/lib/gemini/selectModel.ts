import { serverEnv } from "@/src/lib/firebase/env";
import { listGeminiModels } from "@/src/lib/gemini/client";

const fallbackModel = "gemini-2.5-flash-lite";
let cachedModelName: string | null = null;

function normalizeModelName(raw: string): string {
  return raw.replace(/^models\//, "");
}

export async function getGeminiModel(): Promise<string> {
  if (serverEnv.geminiModel) {
    return serverEnv.geminiModel;
  }

  if (cachedModelName) {
    return cachedModelName;
  }

  try {
    const models = await listGeminiModels();
    const selected = models.find((model) => {
      const name = model.name?.toLowerCase() ?? "";
      const supportsGenerate =
        model.supportedGenerationMethods?.some((method) =>
          method.toLowerCase().includes("generatecontent")
        ) ?? false;

      return name.includes("flash-lite") && supportsGenerate;
    });

    cachedModelName = selected?.name ? normalizeModelName(selected.name) : fallbackModel;
    return cachedModelName;
  } catch {
    cachedModelName = fallbackModel;
    return cachedModelName;
  }
}

export function getGeminiFallbackModel(): string {
  return fallbackModel;
}
