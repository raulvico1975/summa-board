import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("new meeting flow speaks in terms of convocation instead of only poll creation", async () => {
  const source = await readFile(new URL("../app/polls/new/page.tsx", import.meta.url), "utf8");
  assert.equal(source.includes("Convocar reunió"), true);
  assert.equal(source.includes("Proposta de dates"), true);
});

test("dashboard prioritizes convoking and links out to the archive instead of billing controls", async () => {
  const source = await readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8");
  assert.equal(source.includes('const newPollHref = withLocalePath(locale, "/polls/new");'), true);
  assert.equal(source.includes('const activePollsHref = withLocalePath(locale, "/active-polls");'), true);
  assert.equal(source.includes('const scheduledMeetingsHref = withLocalePath(locale, "/scheduled-meetings");'), true);
  assert.equal(source.includes('const archiveHref = withLocalePath(locale, "/archive");'), true);
  assert.equal(source.includes('id="active-polls"'), false);
  assert.equal(source.includes('id="scheduled-meetings"'), false);
  assert.equal(source.includes("ManageSubscriptionButton"), false);
});

test("active polls page holds the operational list outside the dashboard", async () => {
  const source = await readFile(new URL("../app/active-polls/page.tsx", import.meta.url), "utf8");
  assert.equal(source.includes("Convocatòries actives"), true);
  assert.equal(source.includes('withLocalePath(locale, "/dashboard")'), true);
  assert.equal(source.includes("listPollsByOrg(owner.orgId)"), true);
});

test("scheduled meetings page isolates the confirmed meeting list outside the dashboard", async () => {
  const source = await readFile(new URL("../app/scheduled-meetings/page.tsx", import.meta.url), "utf8");
  assert.equal(source.includes("Reunions convocades"), true);
  assert.equal(source.includes("getUpcomingOwnerMeetings(owner.orgId)"), true);
  assert.equal(source.includes('withLocalePath(locale, "/dashboard")'), true);
});

test("archive page exposes the historical repository with direct minutes access", async () => {
  const source = await readFile(new URL("../app/archive/page.tsx", import.meta.url), "utf8");
  assert.equal(source.includes("i18n.archive.title"), true);
  assert.equal(source.includes('href={`/api/owner/minutes/export?meetingId=${meeting.meetingId}`}'), true);
  assert.equal(source.includes("#minutes"), true);
});

test("owner meeting page exposes final convocation sharing actions and ICS download", async () => {
  const source = await readFile(new URL("../app/owner/meetings/[meetingId]/page.tsx", import.meta.url), "utf8");
  assert.equal(source.includes('import { MeetingShareActions } from "@/src/components/meetings/meeting-share-actions";'), true);
  assert.equal(source.includes("Convocatòria final"), true);
  assert.equal(source.includes('/api/public/ics?meetingId=${meeting.id}'), true);
});

test("closed poll management page surfaces the final convocation materials once a meeting exists", async () => {
  const source = await readFile(new URL("../app/polls/[pollId]/page.tsx", import.meta.url), "utf8");
  assert.equal(source.includes("Convocatòria preparada"), true);
  assert.equal(source.includes("MeetingShareActions"), true);
  assert.equal(source.includes("getMeetingById"), true);
});
