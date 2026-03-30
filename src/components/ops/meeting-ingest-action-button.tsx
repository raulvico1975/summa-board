"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";

type MeetingIngestActionButtonProps = {
  action: "drain" | "requeue";
  jobId?: string;
  label: string;
  loadingLabel: string;
  successLabel: string;
  errorLabel: string;
  variant?: "primary" | "secondary";
  className?: string;
};

export function MeetingIngestActionButton({
  action,
  jobId,
  label,
  loadingLabel,
  successLabel,
  errorLabel,
  variant = "secondary",
  className,
}: MeetingIngestActionButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<{
    loading: boolean;
    error?: string;
    success?: string;
  }>({ loading: false });

  async function onClick() {
    setState({ loading: true });

    try {
      const response = await fetch("/api/owner/ops/meeting-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, jobId }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? errorLabel);
      }

      setState({ loading: false, success: successLabel });
      router.refresh();
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : errorLabel,
      });
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={state.loading}
        onClick={onClick}
      >
        {state.loading ? loadingLabel : label}
      </Button>
      {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-emerald-700">{state.success}</p> : null}
    </div>
  );
}
