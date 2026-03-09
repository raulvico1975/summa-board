"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { useI18n } from "@/src/i18n/client";

export function DeleteMeetingButton({
  meetingId,
  redirectHref,
}: {
  meetingId: string;
  redirectHref: string;
}) {
  const router = useRouter();
  const { i18n } = useI18n();
  const [state, setState] = useState<{ loading: boolean; error?: string }>({ loading: false });

  async function handleDelete() {
    if (!window.confirm(i18n.meeting.deleteConfirm)) {
      return;
    }

    setState({ loading: true });

    try {
      const res = await fetch("/api/owner/meetings/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? i18n.meeting.deleteError);
      }

      router.replace(redirectHref);
      router.refresh();
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : i18n.meeting.deleteError,
      });
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={state.loading}
        className="w-full sm:w-auto"
      >
        {state.loading ? i18n.meeting.deleting : i18n.meeting.delete}
      </Button>
      {state.error ? <p className="break-words text-sm text-red-600">{state.error}</p> : null}
    </div>
  );
}
