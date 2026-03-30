import assert from "node:assert/strict";
import test from "node:test";
import { Timestamp } from "firebase-admin/firestore";
import { isBeforeTodayInAppTimeZone } from "@/src/lib/dates";
import { canDeletePastMeeting, canListMeetingAsPast } from "@/src/lib/meetings/get-owner-meetings";

test("isBeforeTodayInAppTimeZone compares by calendar day in Europe/Madrid", () => {
  const now = new Date("2026-03-16T09:00:00.000Z");

  assert.equal(isBeforeTodayInAppTimeZone(Timestamp.fromDate(new Date("2026-03-15T23:30:00.000Z")), now), false);
  assert.equal(isBeforeTodayInAppTimeZone(Timestamp.fromDate(new Date("2026-03-15T21:30:00.000Z")), now), true);
});

test("canListMeetingAsPast depends on scheduled day, not meeting runtime state", () => {
  const scheduledAt = Timestamp.fromDate(new Date("2020-03-14T10:00:00.000Z"));

  assert.equal(canListMeetingAsPast({ scheduledAt }), true);
});

test("canDeletePastMeeting works with either a meeting or its closed poll", () => {
  assert.equal(canDeletePastMeeting({ pollId: "p1", meetingId: "m1" }), true);
  assert.equal(canDeletePastMeeting({ pollId: "p1", meetingId: null }), true);
  assert.equal(canDeletePastMeeting({ pollId: "", meetingId: null }), false);
});
