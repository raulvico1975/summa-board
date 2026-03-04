import { Timestamp } from "firebase-admin/firestore";

export function timestampToDate(value: Timestamp | Date | string | null | undefined): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function formatDateTime(value: Timestamp | Date | string | null | undefined): string {
  const date = timestampToDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("ca-ES", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(date);
}

export function toIso(value: Timestamp | Date | string | null | undefined): string {
  const date = timestampToDate(value);
  if (!date) return "";
  return date.toISOString();
}
