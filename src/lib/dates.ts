import { Timestamp } from "firebase-admin/firestore";
import { defaultLocale, toIntlLocale, type I18nLocale } from "@/src/i18n/config";

const appTimeZone = "Europe/Madrid";

export function timestampToDate(
  value: Timestamp | Date | string | number | null | undefined
): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "number") {
    const fromEpoch = new Date(value);
    return Number.isNaN(fromEpoch.getTime()) ? null : fromEpoch;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function formatDateTime(
  value: Timestamp | Date | string | number | null | undefined,
  locale: I18nLocale = defaultLocale
): string {
  const date = timestampToDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: appTimeZone,
  }).format(date);
}

export function toIso(value: Timestamp | Date | string | number | null | undefined): string {
  const date = timestampToDate(value);
  if (!date) return "";
  return date.toISOString();
}

function getCalendarDateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
}

export function isBeforeTodayInAppTimeZone(
  value: Timestamp | Date | string | number | null | undefined,
  now: Date = new Date()
): boolean {
  const date = timestampToDate(value);
  if (!date) return false;

  return getCalendarDateKey(date, appTimeZone) < getCalendarDateKey(now, appTimeZone);
}
