"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { useI18n } from "@/src/i18n/client";
import { toIntlLocale } from "@/src/i18n/config";

const DAY_OPTIONS = [5, 7, 10] as const;
const MAX_OPTIONS = 20;

const WINDOW_PRESETS = [
  { id: "workday", i18nKey: "windowWorkday", start: "09:00", end: "19:00" },
  { id: "morning", i18nKey: "windowMorning", start: "09:00", end: "13:00" },
  { id: "afternoon", i18nKey: "windowAfternoon", start: "15:00", end: "19:00" },
  { id: "evening", i18nKey: "windowEvening", start: "18:00", end: "21:00" },
] as const;

function timeToMinutes(time: string): number {
  const [hourRaw, minuteRaw] = time.split(":");
  const hours = Number.parseInt(hourRaw ?? "0", 10);
  const minutes = Number.parseInt(minuteRaw ?? "0", 10);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

function buildHalfHourScale(start = "07:00", end = "22:00"): string[] {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  const scale: string[] = [];

  for (let current = startMinutes; current <= endMinutes; current += 30) {
    scale.push(minutesToTime(current));
  }

  return scale;
}

function buildTimes(start: string, end: string): string[] {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  const times: string[] = [];

  for (let current = startMinutes; current < endMinutes; current += 30) {
    times.push(minutesToTime(current));
  }

  return times;
}

function getDayLabel(dayOffset: number, locale: string): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + dayOffset);

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
}

function slotKeyToIso(slotKey: string): string {
  const [dayOffsetRaw, time] = slotKey.split("|");
  const [hourRaw, minuteRaw] = (time ?? "00:00").split(":");

  const dayOffset = Number.parseInt(dayOffsetRaw ?? "1", 10);
  const hour = Number.parseInt(hourRaw ?? "0", 10);
  const minute = Number.parseInt(minuteRaw ?? "0", 10);

  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);

  return date.toISOString();
}

function formatIsoOption(iso: string, timezone: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function isoToSlotKey(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const optionDay = new Date(date);
  optionDay.setHours(0, 0, 0, 0);

  const diffMs = optionDay.getTime() - startOfToday.getTime();
  const dayOffset = Math.round(diffMs / 86_400_000);
  if (dayOffset < 1) {
    return null;
  }

  return `${dayOffset}|${minutesToTime(date.getHours() * 60 + date.getMinutes())}`;
}

type PollOptionsEditorProps = {
  pollId: string;
  timezone: string;
  initialOptionsIso: string[];
};

export function PollOptionsEditor({ pollId, timezone, initialOptionsIso }: PollOptionsEditorProps) {
  const { locale, i18n } = useI18n();
  const intlLocale = toIntlLocale(locale);
  const router = useRouter();
  const [daysToShow, setDaysToShow] = useState<number>(7);
  const [windowStart, setWindowStart] = useState("09:00");
  const [windowEnd, setWindowEnd] = useState("19:00");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialSlotKeys = initialOptionsIso
      .map(isoToSlotKey)
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => left.localeCompare(right));

    if (initialSlotKeys.length === 0) {
      return;
    }

    const dayOffsets = initialSlotKeys.map((slotKey) => Number.parseInt(slotKey.split("|")[0] ?? "1", 10));
    const times = initialSlotKeys.map((slotKey) => slotKey.split("|")[1] ?? "09:00");
    const minutes = times.map(timeToMinutes);
    const nextDaysToShow = DAY_OPTIONS.find((days) => days >= Math.max(...dayOffsets)) ?? 10;
    const nextWindowStart = minutesToTime(Math.max(420, Math.min(...minutes)));
    const nextWindowEnd = minutesToTime(Math.min(1320, Math.max(...minutes) + 30));

    setDaysToShow(nextDaysToShow);
    setWindowStart(nextWindowStart);
    setWindowEnd(nextWindowEnd);
    setSelectedSlots(initialSlotKeys);
  }, [initialOptionsIso]);

  const dayOffsets = useMemo(
    () => Array.from({ length: daysToShow }, (_, index) => index + 1),
    [daysToShow]
  );

  const timeScale = useMemo(() => buildHalfHourScale(), []);

  const visibleTimes = useMemo(() => {
    if (timeToMinutes(windowEnd) <= timeToMinutes(windowStart)) {
      return [];
    }

    return buildTimes(windowStart, windowEnd);
  }, [windowEnd, windowStart]);

  useEffect(() => {
    const visibleSet = new Set(visibleTimes);

    setSelectedSlots((current) =>
      current.filter((slotKey) => {
        const [dayOffsetRaw, time] = slotKey.split("|");
        const dayOffset = Number.parseInt(dayOffsetRaw ?? "0", 10);
        return dayOffset >= 1 && dayOffset <= daysToShow && visibleSet.has(time ?? "");
      })
    );
  }, [daysToShow, visibleTimes]);

  const optionsIso = useMemo(
    () => selectedSlots.map(slotKeyToIso).sort((a, b) => a.localeCompare(b)),
    [selectedSlots]
  );

  const optionPreview = useMemo(
    () => optionsIso.map((iso) => formatIsoOption(iso, timezone, intlLocale)),
    [intlLocale, optionsIso, timezone]
  );

  const maxOptionsMessage = i18n.poll.maxOptionsReached.replace("{max}", String(MAX_OPTIONS));

  function toggleSlot(dayOffset: number, time: string) {
    const key = `${dayOffset}|${time}`;

    if (selectedSlots.includes(key)) {
      setSelectedSlots((current) => current.filter((slot) => slot !== key));
      if (error === maxOptionsMessage) {
        setError(null);
      }
      return;
    }

    if (selectedSlots.length >= MAX_OPTIONS) {
      setError(maxOptionsMessage);
      return;
    }

    setError(null);
    setSelectedSlots((current) => [...current, key]);
  }

  function selectAllVisibleSlots() {
    if (visibleTimes.length === 0) return;

    const next = new Set(selectedSlots);
    let reachedLimit = false;

    dayOffsets.forEach((dayOffset) => {
      visibleTimes.forEach((time) => {
        if (next.size >= MAX_OPTIONS) {
          reachedLimit = true;
          return;
        }

        next.add(`${dayOffset}|${time}`);
      });
    });

    setSelectedSlots(Array.from(next));
    if (reachedLimit) {
      setError(maxOptionsMessage);
      return;
    }

    setError(null);
  }

  function applyPreset(start: string, end: string) {
    setWindowStart(start);
    setWindowEnd(end);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (visibleTimes.length === 0) {
      setError(i18n.poll.invalidWindow);
      setLoading(false);
      return;
    }

    if (optionsIso.length === 0) {
      setError(i18n.poll.selectAtLeastOne);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/owner/polls/update-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollId,
          optionsIso,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? i18n.poll.editOptionsError);
      }

      setMessage(i18n.poll.editOptionsSaved);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : i18n.poll.editOptionsError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">{i18n.poll.editOptionsHint}</p>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">{i18n.poll.windowStartLabel}</label>
          <select
            value={windowStart}
            onChange={(event) => setWindowStart(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          >
            {timeScale.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">{i18n.poll.windowEndLabel}</label>
          <select
            value={windowEnd}
            onChange={(event) => setWindowEnd(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          >
            {timeScale.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={selectAllVisibleSlots}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 md:self-end"
        >
          {i18n.poll.selectVisible}
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedSlots([]);
            setError(null);
            setMessage(null);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 md:self-end"
        >
          {i18n.poll.clearSelection}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {DAY_OPTIONS.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setDaysToShow(days)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
                daysToShow === days
                  ? "bg-sky-500 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              {days} {i18n.poll.days}
            </button>
          ))}
        </div>

        <div className="grid gap-2 sm:flex sm:flex-wrap">
          {WINDOW_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.start, preset.end)}
              className={`rounded-md border px-3 py-2 text-left text-xs font-medium leading-tight ${
                windowStart === preset.start && windowEnd === preset.end
                  ? "border-sky-300 bg-sky-50 text-sky-700"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {i18n.poll[preset.i18nKey]}
            </button>
          ))}
        </div>
      </div>

      {visibleTimes.length === 0 ? <p className="text-xs text-red-600">{i18n.poll.invalidWindow}</p> : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dayOffsets.map((dayOffset) => (
          <div key={dayOffset} className="rounded-md border border-slate-200 bg-white p-3">
            <p className="mb-2 text-xs font-semibold capitalize text-slate-700">
              {getDayLabel(dayOffset, intlLocale)}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {visibleTimes.map((time) => {
                const slotKey = `${dayOffset}|${time}`;
                const active = selectedSlots.includes(slotKey);
                const disabled = !active && optionsIso.length >= MAX_OPTIONS;

                return (
                  <button
                    key={slotKey}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleSlot(dayOffset, time)}
                    className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-sky-600 bg-sky-600 text-white shadow-sm"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold text-slate-700">
          {i18n.poll.optionsSelected} ({optionsIso.length}/{MAX_OPTIONS})
        </p>
        {optionPreview.length === 0 ? (
          <p className="mt-1 text-xs text-slate-500">{i18n.poll.optionsNone}</p>
        ) : (
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {optionPreview.slice(0, 14).map((label, index) => (
              <li key={`${label}-${index}`}>• {label}</li>
            ))}
            {optionPreview.length > 14 ? (
              <li className="text-slate-500">
                {i18n.poll.moreSlots.replace("{count}", String(optionPreview.length - 14))}
              </li>
            ) : null}
          </ul>
        )}
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? i18n.poll.loadingSaving : i18n.poll.editOptionsSubmit}
      </Button>
    </form>
  );
}
