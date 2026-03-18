import { adminDb } from "@/src/lib/firebase/admin";
import type { MeetingRecoveryState, OperationErrorDoc } from "@/src/lib/db/types";
import { createDailyRoom } from "@/src/lib/integrations/daily/create-room";

export type CreateMeetingWithDailyResult = {
  meetingId: string;
  meetingUrl: string | null;
  dailyRoomUrl: string | null;
  dailyRoomName: string | null;
  provisioningStatus: "usable" | "provisioning_failed";
  provisioningError: OperationErrorDoc | null;
};

function buildProvisioningError(error: unknown): OperationErrorDoc {
  if (error instanceof Error) {
    return {
      code: error.message.split(":")[0] || "MEETING_PROVISIONING_FAILED",
      message: error.message,
      at: Date.now(),
    };
  }

  return {
    code: "MEETING_PROVISIONING_FAILED",
    message: typeof error === "string" ? error : null,
    at: Date.now(),
  };
}

export async function createMeetingWithDaily(input: {
  createMeeting: () => Promise<string>;
  recoveryState?: "retry_room_creation" | null;
  attemptedAt?: number;
}): Promise<CreateMeetingWithDailyResult> {
  const meetingId = await input.createMeeting();
  const attemptAt = input.attemptedAt ?? Date.now();
  let meetingUrl: string | null = null;
  let dailyRoomUrl: string | null = null;
  let dailyRoomName: string | null = null;
  let provisioningStatus: "usable" | "provisioning_failed" = "provisioning_failed";
  let provisioningError: OperationErrorDoc | null = null;
  const failureRecoveryState: MeetingRecoveryState =
    input.recoveryState === "retry_room_creation" ? "retry_failed" : "retry_pending";

  try {
    const daily = await createDailyRoom(meetingId);
    meetingUrl = daily.roomUrl;
    dailyRoomUrl = daily.roomUrl;
    dailyRoomName = daily.roomName;
    provisioningStatus = "usable";

    await adminDb.collection("meetings").doc(meetingId).set({
      dailyRoomName,
      dailyRoomUrl,
      meetingUrl,
      provisioningStatus,
      provisioningError: null,
      provisioningAttemptedAt: attemptAt,
      provisioningReadyAt: Date.now(),
      recoveryState: null,
      recoveryReason: null,
      lastRecoveryAttemptAt: input.recoveryState ? attemptAt : null,
    }, { merge: true });
  } catch (error) {
    provisioningError = buildProvisioningError(error);
    console.error("daily_room_create_failed", meetingId);
    console.error(error);

    await adminDb.collection("meetings").doc(meetingId).set(
      {
        dailyRoomName: null,
        dailyRoomUrl: null,
        meetingUrl: null,
        provisioningStatus: "provisioning_failed",
        provisioningError,
        provisioningAttemptedAt: attemptAt,
        provisioningReadyAt: null,
        recoveryState: failureRecoveryState,
        recoveryReason: input.recoveryState ?? provisioningError.code,
        lastRecoveryAttemptAt: input.recoveryState ? attemptAt : null,
      },
      { merge: true }
    );
  }

  return {
    meetingId,
    meetingUrl,
    dailyRoomUrl,
    dailyRoomName,
    provisioningStatus,
    provisioningError,
  };
}
