"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { StatusBadge } from "@/src/components/ui/status-badge";
import { MeetingRecordingControls } from "@/src/components/meetings/meeting-recording-controls";
import { useI18n } from "@/src/i18n/client";
import type { MeetingRecordingStatus } from "@/src/lib/db/types";

function StepIndicator({
  hasOpenedMeeting,
  recordingStatus,
}: {
  hasOpenedMeeting: boolean;
  recordingStatus: MeetingRecordingStatus;
}) {
  const { i18n } = useI18n();

  return (
    <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
      <div className="rounded-lg bg-white px-3 py-3">
        <p className="font-medium text-slate-900">
          {hasOpenedMeeting ? i18n.meeting.stepMeetingOpened : i18n.meeting.stepOpenMeeting}
        </p>
      </div>
      <div className="rounded-lg bg-white px-3 py-3">
        <p className="font-medium text-slate-900">
          {recordingStatus === "recording"
            ? i18n.meeting.stepRecordingActive
            : i18n.meeting.stepStartRecording}
        </p>
      </div>
    </div>
  );
}

function MeetingStatus({
  meetingUsable,
  recordingStatus,
}: {
  meetingUsable: boolean;
  recordingStatus: MeetingRecordingStatus;
}) {
  const { i18n } = useI18n();
  const displayRecordingStatus = recordingStatus === "stopping" ? "processing" : recordingStatus;

  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {i18n.meeting.roomStatusLabel}
        </p>
        <p className="mt-2 text-base font-semibold text-slate-900">
          {meetingUsable ? i18n.meeting.roomStatusAvailable : i18n.meeting.roomStatusUnavailable}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {i18n.meeting.recordingStatusLabel}
        </p>
        <div className="mt-2">
          <StatusBadge status={displayRecordingStatus} labels={i18n.status} />
        </div>
      </div>
    </div>
  );
}

function buildContextMessage(i18n: ReturnType<typeof useI18n>["i18n"], recordingStatus: MeetingRecordingStatus) {
  switch (recordingStatus) {
    case "recording":
      return i18n.meeting.contextRecording;
    case "stopping":
    case "processing":
      return i18n.meeting.contextProcessing;
    case "ready":
      return i18n.meeting.contextReady;
    case "error":
      return i18n.meeting.contextError;
    case "none":
    default:
      return i18n.meeting.contextNone;
  }
}

export function MeetingControlPanel({
  meetingId,
  meetingUrl,
  meetingEntryHref,
  recordingStatus,
}: {
  meetingId: string;
  meetingUrl: string | null;
  meetingEntryHref?: string | null;
  recordingStatus: MeetingRecordingStatus;
}) {
  const { i18n } = useI18n();
  const [openedMeeting, setOpenedMeeting] = useState(false);

  const meetingUsable = Boolean(meetingUrl);
  const hasOpenedMeeting = openedMeeting || recordingStatus !== "none";
  const contextMessage = buildContextMessage(i18n, recordingStatus);

  return (
    <div className="space-y-4">
      <StepIndicator hasOpenedMeeting={hasOpenedMeeting} recordingStatus={recordingStatus} />

      <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#e0f2fe_0%,#ffffff_42%,#f8fafc_100%)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              {i18n.meeting.controlPanelEyebrow}
            </p>
            <h2 className="text-xl font-semibold text-slate-950">{i18n.meeting.controlPanelTitle}</h2>
            <p className="text-sm text-slate-600">{contextMessage}</p>
          </div>

          <div className="w-full lg:max-w-xs">
            <Button
              type="button"
              className="min-h-12 w-full text-base"
              disabled={!meetingUrl}
              onClick={() => {
                if (!meetingUrl) {
                  return;
                }
                window.open(meetingEntryHref ?? meetingUrl, "_blank", "noopener,noreferrer");
                setOpenedMeeting(true);
              }}
            >
              {i18n.meeting.enterMeeting}
            </Button>
          </div>
        </div>

        {openedMeeting ? (
          <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <p className="font-medium">{i18n.meeting.meetingOpenedBannerTitle}</p>
            <p className="mt-1 text-sky-800">{i18n.meeting.meetingOpenedBannerBody}</p>
          </div>
        ) : null}

        {!meetingUsable ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {i18n.meeting.roomCreateError}
          </div>
        ) : null}
      </div>

      <MeetingRecordingControls
        meetingId={meetingId}
        meetingUrl={meetingUrl}
        recordingStatus={recordingStatus}
      />

      <MeetingStatus meetingUsable={meetingUsable} recordingStatus={recordingStatus} />
    </div>
  );
}
