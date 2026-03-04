import type { MinutesJsonStrict } from "@/src/lib/minutes/schema";

export function renderMinutesMarkdown(data: MinutesJsonStrict): string {
  const decisions = data.decisions
    .map(
      (item) =>
        `- [${item.id}] ${item.text} · Responsable: ${item.owner ?? "-"} · Data límit: ${item.dueDate ?? "-"} · Tags: ${item.tags.join(", ") || "-"}`
    )
    .join("\n");

  const tasks = data.tasks
    .map(
      (item) =>
        `- [${item.id}] (${item.status}) ${item.text} · Responsable: ${item.owner ?? "-"} · Data límit: ${item.dueDate ?? "-"}`
    )
    .join("\n");

  return [
    "# Acta de reunió",
    "",
    "## Resum",
    data.summary,
    "",
    "## Assistents",
    ...data.attendees.map((attendee) => `- ${attendee}`),
    "",
    "## Ordre del dia",
    ...data.agenda.map((point) => `- ${point}`),
    "",
    "## Decisions",
    decisions || "- Sense decisions.",
    "",
    "## Tasques",
    tasks || "- Sense tasques.",
    "",
  ].join("\n");
}
