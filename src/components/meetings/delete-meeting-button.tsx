"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
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
  const [state, setState] = useState<{ open: boolean; loading: boolean; error?: string }>({
    open: false,
    loading: false,
  });

  async function handleDelete() {
    setState({ open: true, loading: false, error: undefined });
  }

  async function confirmDelete() {
    setState((current) => ({ ...current, loading: true, error: undefined }));

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

      setState({ open: false, loading: false });
      router.replace(redirectHref);
      router.refresh();
    } catch (error) {
      setState({
        open: true,
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
        disabled={state.loading || state.open}
        className="w-full sm:w-auto"
      >
        {state.loading ? i18n.meeting.deleting : i18n.meeting.delete}
      </Button>
      <ConfirmModal
        open={state.open}
        title={i18n.meeting.delete}
        description={i18n.meeting.deleteConfirm}
        confirmLabel={i18n.meeting.delete}
        confirmLoadingLabel={i18n.meeting.deleting}
        cancelLabel={i18n.common.cancel}
        loading={state.loading}
        error={state.error}
        onConfirm={confirmDelete}
        onCancel={() => setState({ open: false, loading: false })}
      />
    </div>
  );
}
