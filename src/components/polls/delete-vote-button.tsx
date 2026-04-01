"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { useI18n } from "@/src/i18n/client";

export function DeleteVoteButton({
  pollId,
  voterId,
  voterName,
}: {
  pollId: string;
  voterId: string;
  voterName: string;
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
      const res = await fetch("/api/owner/polls/votes/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, voterId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? i18n.poll.deleteVoteError);
      }

      setState({ open: false, loading: false });
      router.refresh();
    } catch (error) {
      setState({
        open: true,
        loading: false,
        error: error instanceof Error ? error.message : i18n.poll.deleteVoteError,
      });
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="destructive" onClick={handleDelete} disabled={state.loading || state.open}>
        {state.loading ? i18n.poll.deleteVoteDeleting : i18n.poll.deleteVote}
      </Button>
      <ConfirmModal
        open={state.open}
        title={`${i18n.poll.deleteVote}: ${voterName}`}
        description={i18n.poll.deleteVoteConfirm.replace("{name}", voterName)}
        confirmLabel={i18n.poll.deleteVote}
        confirmLoadingLabel={i18n.poll.deleteVoteDeleting}
        cancelLabel={i18n.common.cancel}
        loading={state.loading}
        error={state.error}
        onConfirm={confirmDelete}
        onCancel={() => setState({ open: false, loading: false })}
      />
    </div>
  );
}
