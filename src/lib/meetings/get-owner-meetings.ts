import type { MeetingDoc, PollOptionDoc } from "@/src/lib/db/types";
import { listPollsByOrg } from "@/src/lib/db/repo";
import { isBeforeTodayInAppTimeZone } from "@/src/lib/dates";
import { adminDb } from "@/src/lib/firebase/admin";

export type OwnerMeetingEntry = {
  pollId: string;
  slug: string;
  title: string;
  scheduledAt: PollOptionDoc["startsAt"] | MeetingDoc["scheduledAt"];
  meetingId: string | null;
  hasGeneratedMinutes: boolean;
};

export type PastMeetingEntry = OwnerMeetingEntry;

export function canListMeetingAsPast(meeting: Pick<OwnerMeetingEntry, "scheduledAt">): boolean {
  return isBeforeTodayInAppTimeZone(meeting.scheduledAt);
}

export function canDeletePastMeeting(meeting: Pick<OwnerMeetingEntry, "pollId" | "meetingId">): boolean {
  return !!meeting.pollId || !!meeting.meetingId;
}

function getMeetingTime(value: OwnerMeetingEntry["scheduledAt"]): number {
  return value?.toMillis?.() ?? 0;
}

async function getResolvedOwnerMeetingEntries(orgId: string): Promise<OwnerMeetingEntry[]> {
  const [polls, meetingsSnap] = await Promise.all([
    listPollsByOrg(orgId),
    adminDb.collection("meetings").where("orgId", "==", orgId).get(),
  ]);

  const meetingByPollId = new Map<string, MeetingDoc & { id: string }>();
  meetingsSnap.docs.forEach((doc) => {
    const meeting = { id: doc.id, ...(doc.data() as MeetingDoc) };
    if (meeting.pollId) {
      meetingByPollId.set(meeting.pollId, meeting);
    }
  });

  const resolvedMeetingCandidates: Array<OwnerMeetingEntry | null> = await Promise.all(
    polls.map(async (poll) => {
      if (poll.status !== "closed" || !poll.winningOptionId) {
        return null;
      }

      const meeting = meetingByPollId.get(poll.id) ?? null;
      const optionSnap = await adminDb
        .collection("polls")
        .doc(poll.id)
        .collection("options")
        .doc(poll.winningOptionId)
        .get();

      const scheduledAt = (optionSnap.data() as PollOptionDoc | undefined)?.startsAt ?? meeting?.scheduledAt ?? null;
      if (!scheduledAt) {
        return null;
      }

      return {
        pollId: poll.id,
        slug: poll.slug,
        title: poll.title,
        scheduledAt,
        meetingId: meeting?.id ?? null,
        hasGeneratedMinutes: !!(meeting?.minutesDraft && meeting.minutesDraft.trim().length > 0),
      } satisfies OwnerMeetingEntry;
    })
  );

  return resolvedMeetingCandidates.filter((meeting): meeting is OwnerMeetingEntry => meeting !== null);
}

export async function getUpcomingOwnerMeetings(orgId: string): Promise<OwnerMeetingEntry[]> {
  const meetings = await getResolvedOwnerMeetingEntries(orgId);

  return meetings
    .filter((meeting) => !canListMeetingAsPast(meeting))
    .sort((left, right) => getMeetingTime(left.scheduledAt) - getMeetingTime(right.scheduledAt));
}

export async function getOwnerMeetings(orgId: string): Promise<PastMeetingEntry[]> {
  const meetings = await getResolvedOwnerMeetingEntries(orgId);

  return meetings
    .filter(canListMeetingAsPast)
    .sort((left, right) => getMeetingTime(right.scheduledAt) - getMeetingTime(left.scheduledAt));
}
