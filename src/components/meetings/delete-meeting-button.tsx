"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { useI18n } from "@/src/i18n/client";

export function DeleteMeetingButton({
  meetingId,
  pollId,
  hasGeneratedMinutes = false,
  redirectHref,
}: {
  meetingId?: string | null;
  pollId?: string | null;
  hasGeneratedMinutes?: boolean;
  redirectHref: string;
}) {
  const router = useRouter();
  const { i18n } = useI18n();
  const [state, setState] = useState<{ loading: boolean; confirming: boolean; error?: string }>({
    loading: false,
    confirming: false,
  });
  const [requireMinutesConfirmation, setRequireMinutesConfirmation] = useState(hasGeneratedMinutes);

  async function requestDelete(confirmDeleteGeneratedMinutes: boolean) {
    const res = await fetch("/api/owner/meetings/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId, pollId, confirmDeleteGeneratedMinutes }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      requiresMinutesConfirmation?: boolean;
    };

    if (res.status === 409 && data.requiresMinutesConfirmation && !confirmDeleteGeneratedMinutes) {
      setRequireMinutesConfirmation(true);
      setState((current) => ({ ...current, loading: false, confirming: true }));
      return false;
    }

    if (!res.ok || !data.ok) {
      throw new Error(data.error ?? i18n.meeting.deleteError);
    }

    return true;
  }

  async function handleDeleteConfirm() {
    if (!meetingId && !pollId) {
      setState({ loading: false, confirming: false, error: i18n.meeting.deleteError });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: undefined }));

    try {
      const deleted = await requestDelete(requireMinutesConfirmation);
      if (!deleted) {
        return;
      }

      router.replace(redirectHref);
      router.refresh();
    } catch (error) {
      setState({
        loading: false,
        confirming: true,
        error: error instanceof Error ? error.message : i18n.meeting.deleteError,
      });
    }
  }

  return (
    <div className="space-y-3">
      {!state.confirming ? (
        <Button
          type="button"
          variant="destructive"
          onClick={() => setState({ loading: false, confirming: true })}
          disabled={state.loading}
          className="w-full sm:w-auto"
        >
          {state.loading ? i18n.meeting.deleting : i18n.meeting.delete}
        </Button>
      ) : (
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {requireMinutesConfirmation ? i18n.meeting.deleteConfirmWithMinutes : i18n.meeting.deleteConfirm}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={state.loading}
              className="w-full sm:w-auto"
            >
              {state.loading ? i18n.meeting.deleting : i18n.meeting.deleteConfirmAction}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setState({
                  loading: false,
                  confirming: false,
                  error: undefined,
                })
              }
              disabled={state.loading}
              className="w-full sm:w-auto"
            >
              {i18n.meeting.deleteCancel}
            </Button>
          </div>
        </div>
      )}
      {state.error ? <p className="break-words text-sm text-red-600">{state.error}</p> : null}
    </div>
  );
}
