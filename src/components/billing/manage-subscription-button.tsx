"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";

type Props = {
  label: string;
  loadingLabel: string;
  fallbackError: string;
};

export function ManageSubscriptionButton({ label, loadingLabel, fallbackError }: Props) {
  const [state, setState] = useState<{ loading: boolean; error?: string }>({
    loading: false,
  });

  async function onManage() {
    setState({ loading: true });

    try {
      const response = await fetch("/api/billing/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await response.json()) as { portalUrl?: string; error?: string };

      if (!response.ok || !data.portalUrl) {
        throw new Error(data.error ?? fallbackError);
      }

      window.location.assign(data.portalUrl);
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : fallbackError,
      });
    }
  }

  return (
    <div className="space-y-3">
      <Button type="button" variant="secondary" className="w-full" disabled={state.loading} onClick={onManage}>
        {state.loading ? loadingLabel : label}
      </Button>
      {state.error ? <p className="break-words text-sm text-red-600">{state.error}</p> : null}
    </div>
  );
}
