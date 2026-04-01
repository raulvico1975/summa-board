"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
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
  const [state, setState] = useState<{ loading: boolean; error?: string }>({ loading: false });

  async function handleDelete() {
    const confirmed = window.confirm(i18n.poll.deleteVoteConfirm.replace("{name}", voterName));
    if (!confirmed) {
      return;
    }

    setState({ loading: true });

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

      setState({ loading: false });
      router.refresh();
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : i18n.poll.deleteVoteError,
      });
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="destructive" onClick={handleDelete} disabled={state.loading}>
        {state.loading ? i18n.poll.deleteVoteDeleting : i18n.poll.deleteVote}
      </Button>
      {state.error ? <p className="break-words text-sm text-red-600">{state.error}</p> : null}
    </div>
  );
}
