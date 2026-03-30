export const MEETING_INGEST_MAX_INLINE_BYTES = 7 * 1024 * 1024;
export const MEETING_INGEST_LEASE_MS = 10 * 60_000;
export const MEETING_INGEST_MAX_ATTEMPTS = 4;
export const MEETING_INGEST_DRAIN_BATCH = 3;

export const OWNER_MUTATION_RATE_WINDOW_MS = 10 * 60_000;
export const OWNER_POLL_MUTATION_MAX_HITS = 24;
export const OWNER_RECORDING_MUTATION_MAX_HITS = 18;
export const OWNER_BILLING_MUTATION_MAX_HITS = 8;
export const OWNER_QUEUE_MUTATION_MAX_HITS = 18;

export const MAX_MANUAL_RECORDING_TEXT_CHARS = 40_000;
export const MAX_MANUAL_RECORDING_FILE_BYTES = MEETING_INGEST_MAX_INLINE_BYTES;

export function buildMeetingIngestRetryDelayMs(attemptCount: number): number {
  if (attemptCount <= 1) {
    return 15_000;
  }

  if (attemptCount === 2) {
    return 60_000;
  }

  if (attemptCount === 3) {
    return 3 * 60_000;
  }

  return 10 * 60_000;
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  return "MEETING_INGEST_UNKNOWN_ERROR";
}

function isRetryableHttpFamily(message: string, prefix: string): boolean | null {
  if (!message.startsWith(prefix)) {
    return null;
  }

  const remainder = message.slice(prefix.length);
  const status = Number.parseInt(remainder.split(":")[0] ?? "", 10);
  if (!Number.isFinite(status)) {
    return true;
  }

  if (status === 408 || status === 425 || status === 429) {
    return true;
  }

  return status >= 500;
}

export function classifyMeetingIngestError(error: unknown): {
  code: string;
  retryable: boolean;
} {
  const message = normalizeErrorMessage(error);
  const downloadRetryable = isRetryableHttpFamily(message, "MEETING_INGEST_DOWNLOAD_FAILED:");
  if (downloadRetryable !== null) {
    return { code: message, retryable: downloadRetryable };
  }

  const geminiRetryable = isRetryableHttpFamily(message, "GEMINI_HTTP_");
  if (geminiRetryable !== null) {
    return { code: message, retryable: geminiRetryable };
  }

  const terminalCodes = new Set([
    "MEETING_INGEST_MEETING_NOT_FOUND",
    "MEETING_INGEST_RECORDING_URL_MISSING",
    "MEETING_INGEST_GEMINI_NOT_CONFIGURED",
    "MEETING_INGEST_RECORDING_TOO_LARGE",
    "AUDIO_TOO_LARGE_FOR_INLINE",
    "DAILY_RECORDING_LINK_MISSING",
    "INVALID_RECORDING_PATH",
    "GEMINI_API_KEY_MISSING",
  ]);

  if (terminalCodes.has(message)) {
    return { code: message, retryable: false };
  }

  if (message.startsWith("SyntaxError:")) {
    return { code: "MEETING_INGEST_RESPONSE_PARSE_FAILED", retryable: true };
  }

  return { code: message, retryable: true };
}

export function getMeetingIngestLimitSnapshot() {
  return {
    maxInlineBytes: MEETING_INGEST_MAX_INLINE_BYTES,
    maxManualRecordingTextChars: MAX_MANUAL_RECORDING_TEXT_CHARS,
  };
}
