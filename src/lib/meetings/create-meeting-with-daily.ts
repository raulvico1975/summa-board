import { adminDb } from "@/src/lib/firebase/admin";
import type { OperationErrorDoc } from "@/src/lib/db/types";
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
}): Promise<CreateMeetingWithDailyResult> {
  const meetingId = await input.createMeeting();
  let meetingUrl: string | null = null;
  let dailyRoomUrl: string | null = null;
  let dailyRoomName: string | null = null;
  let provisioningStatus: "usable" | "provisioning_failed" = "provisioning_failed";
  let provisioningError: OperationErrorDoc | null = null;

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
      provisioningAttemptedAt: Date.now(),
      provisioningReadyAt: Date.now(),
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
        provisioningAttemptedAt: Date.now(),
        provisioningReadyAt: null,
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
