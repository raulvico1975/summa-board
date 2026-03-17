import type { MeetingDoc, PollOptionDoc } from "@/src/lib/db/types";
import { isBeforeTodayInAppTimeZone } from "@/src/lib/dates";
import { adminDb } from "@/src/lib/firebase/admin";
import { listPollsByOrg } from "@/src/lib/db/repo";

export type PastMeetingEntry = {
  pollId: string;
  slug: string;
  title: string;
  scheduledAt: PollOptionDoc["startsAt"] | MeetingDoc["scheduledAt"];
  meetingId: string | null;
  hasGeneratedMinutes: boolean;
};

export function canListMeetingAsPast(meeting: Pick<PastMeetingEntry, "scheduledAt">): boolean {
  return isBeforeTodayInAppTimeZone(meeting.scheduledAt);
}

export function canDeletePastMeeting(meeting: Pick<PastMeetingEntry, "pollId" | "meetingId">): boolean {
  return !!meeting.pollId || !!meeting.meetingId;
}

export async function getOwnerMeetings(orgId: string): Promise<PastMeetingEntry[]> {
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

  const pastMeetingCandidates: Array<PastMeetingEntry | null> = await Promise.all(
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
      } satisfies PastMeetingEntry;
    })
  );
  const resolvedPastMeetings = pastMeetingCandidates.filter(
    (meeting): meeting is PastMeetingEntry => meeting !== null
  );

  return resolvedPastMeetings
    .filter(canListMeetingAsPast)
    .sort((left, right) => {
      const leftTime = left.scheduledAt?.toMillis?.() ?? 0;
      const rightTime = right.scheduledAt?.toMillis?.() ?? 0;
      return rightTime - leftTime;
    });
}
