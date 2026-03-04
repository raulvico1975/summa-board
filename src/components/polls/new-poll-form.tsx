"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input, Textarea } from "@/src/components/ui/field";
import { ca } from "@/src/i18n/ca";
import { defaultTimezone } from "@/src/lib/firebase/env";

const DAY_OPTIONS = [5, 7, 10] as const;
const TIME_OPTIONS = ["09:00", "10:30", "12:00", "16:00", "17:30", "19:00"] as const;
const MORNING_TIMES = ["09:00", "10:30", "12:00"] as const;
const AFTERNOON_TIMES = ["16:00", "17:30", "19:00"] as const;

function getDayLabel(dayOffset: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + dayOffset);

  const short = new Intl.DateTimeFormat("ca-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);

  return `Avui +${dayOffset} · ${short}`;
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

function formatIsoOption(iso: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("ca-ES", {
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

export function NewPollForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [daysToShow, setDaysToShow] = useState<number>(7);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dayOffsets = useMemo(
    () => Array.from({ length: daysToShow }, (_, index) => index + 1),
    [daysToShow]
  );

  useEffect(() => {
    setSelectedSlots((current) =>
      current.filter((slotKey) => {
        const dayOffset = Number.parseInt(slotKey.split("|")[0] ?? "0", 10);
        return dayOffset >= 1 && dayOffset <= daysToShow;
      })
    );
  }, [daysToShow]);

  const optionsIso = useMemo(
    () => selectedSlots.map(slotKeyToIso).sort((a, b) => a.localeCompare(b)),
    [selectedSlots]
  );

  const optionPreview = useMemo(
    () => optionsIso.map((iso) => formatIsoOption(iso, timezone)),
    [optionsIso, timezone]
  );

  function toggleSlot(dayOffset: number, time: string) {
    const key = `${dayOffset}|${time}`;
    setSelectedSlots((current) =>
      current.includes(key)
        ? current.filter((slot) => slot !== key)
        : [...current, key]
    );
  }

  function selectTimeSet(times: readonly string[]) {
    const next = new Set(selectedSlots);

    dayOffsets.forEach((dayOffset) => {
      times.forEach((time) => {
        next.add(`${dayOffset}|${time}`);
      });
    });

    setSelectedSlots(Array.from(next));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (optionsIso.length === 0) {
      setError(ca.poll.selectAtLeastOne);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/owner/polls/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          timezone,
          optionsIso,
        }),
      });

      const data = (await res.json()) as { pollId?: string; error?: string };
      if (!res.ok || !data.pollId) {
        throw new Error(data.error ?? "No s'ha pogut crear la votació");
      }

      router.push(`/polls/${data.pollId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperat");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">{ca.poll.title}</label>
        <Input required value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">{ca.poll.description}</label>
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">{ca.poll.timezone}</label>
        <Input required value={timezone} onChange={(event) => setTimezone(event.target.value)} />
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">{ca.poll.options}</p>
            <p className="text-xs text-slate-500">{ca.poll.optionsHint}</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {DAY_OPTIONS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setDaysToShow(days)}
                className={`rounded-md px-2.5 py-1.5 font-medium ${
                  daysToShow === days
                    ? "bg-sky-500 text-white"
                    : "border border-slate-300 bg-white text-slate-700"
                }`}
              >
                {days} {ca.poll.days}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectTimeSet(MORNING_TIMES)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            {ca.poll.selectMornings}
          </button>
          <button
            type="button"
            onClick={() => selectTimeSet(AFTERNOON_TIMES)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            {ca.poll.selectAfternoons}
          </button>
          <button
            type="button"
            onClick={() => setSelectedSlots([])}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            {ca.poll.clearSelection}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dayOffsets.map((dayOffset) => (
            <div key={dayOffset} className="rounded-md border border-slate-200 bg-white p-3">
              <p className="mb-2 text-xs font-semibold text-slate-700">{getDayLabel(dayOffset)}</p>
              <div className="grid grid-cols-2 gap-2">
                {TIME_OPTIONS.map((time) => {
                  const slotKey = `${dayOffset}|${time}`;
                  const active = selectedSlots.includes(slotKey);

                  return (
                    <button
                      key={slotKey}
                      type="button"
                      onClick={() => toggleSlot(dayOffset, time)}
                      className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-sky-300 bg-sky-50 text-sky-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
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
            {ca.poll.optionsSelected} ({optionsIso.length})
          </p>
          {optionPreview.length === 0 ? (
            <p className="mt-1 text-xs text-slate-500">{ca.poll.optionsNone}</p>
          ) : (
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {optionPreview.slice(0, 12).map((label, index) => (
                <li key={`${label}-${index}`}>• {label}</li>
              ))}
              {optionPreview.length > 12 ? (
                <li className="text-slate-500">+ {optionPreview.length - 12} franges més</li>
              ) : null}
            </ul>
          )}
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Creant..." : ca.poll.create}
      </Button>
    </form>
  );
}
