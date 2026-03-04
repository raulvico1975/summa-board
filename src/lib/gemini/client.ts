import { serverEnv } from "@/src/lib/firebase/env";

type GeminiPart =
  | { text: string }
  | {
      inline_data: {
        mime_type: string;
        data: string;
      };
    };

type GenerateContentPayload = {
  model: string;
  contents: Array<{
    role: "user" | "model";
    parts: GeminiPart[];
  }>;
  generationConfig?: {
    temperature?: number;
    responseMimeType?: string;
    maxOutputTokens?: number;
  };
};

export function hasGeminiApiKey(): boolean {
  return Boolean(serverEnv.geminiApiKey);
}

async function geminiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!serverEnv.geminiApiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const separator = path.includes("?") ? "&" : "?";
  const url = `${serverEnv.geminiBaseUrl}${path}${separator}key=${encodeURIComponent(serverEnv.geminiApiKey)}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GEMINI_HTTP_${res.status}:${body}`);
  }

  return (await res.json()) as T;
}

export async function listGeminiModels(): Promise<
  Array<{ name: string; supportedGenerationMethods?: string[] }>
> {
  const response = await geminiFetch<{ models?: Array<{ name: string; supportedGenerationMethods?: string[] }> }>(
    "/v1beta/models"
  );
  return response.models ?? [];
}

function extractTextFromCandidate(raw: unknown): string {
  const data = raw as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part.text ?? "")
    .join("\n")
    .trim();
}

export async function generateGeminiText(payload: GenerateContentPayload): Promise<string> {
  const body = {
    contents: payload.contents,
    generationConfig: payload.generationConfig,
  };

  const path = `/v1beta/models/${payload.model}:generateContent`;
  const response = await geminiFetch<unknown>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const text = extractTextFromCandidate(response);
  if (!text) {
    throw new Error("GEMINI_EMPTY_RESPONSE");
  }

  return text;
}
