import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolveContextualHelp, resolveContextualHelpKey } from "@/src/lib/help/contextual-help";

test("contextual help resolves the core owner journey routes", () => {
  assert.equal(resolveContextualHelpKey("/ca/dashboard"), "dashboard");
  assert.equal(resolveContextualHelpKey("/ca/archive"), "archive");
  assert.equal(resolveContextualHelpKey("/ca/polls/new"), "newPoll");
  assert.equal(resolveContextualHelpKey("/ca/polls/abc123"), "pollManage");
  assert.equal(resolveContextualHelpKey("/ca/owner/meetings/meeting-1"), "ownerMeeting");
});

test("contextual help resolves public participation routes and falls back safely", () => {
  assert.equal(resolveContextualHelpKey("/es/p/asamblea-2026"), "publicVote");
  assert.equal(resolveContextualHelpKey("/es/p/asamblea-2026/results"), "publicResults");
  assert.equal(resolveContextualHelpKey("/es/no-existe"), "generic");
});

test("meeting help explains the full execution path after the convocation is closed", () => {
  const article = resolveContextualHelp("/ca/owner/meetings/meeting-1", "ca");
  assert.equal(article.title, "Realitzar la reunió i obtenir l'acta");
  assert.equal(article.whatToDo.some((item) => item.includes("Inicia i atura la gravació")), true);
  assert.equal(article.outcome.includes("esborrany d'acta"), true);
});

test("root layout mounts the contextual help entry point globally", async () => {
  const source = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.equal(source.includes('import { ContextualHelp } from "@/src/components/help/contextual-help";'), true);
  assert.equal(source.includes("<ContextualHelp />"), true);
});
