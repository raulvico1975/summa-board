"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/field";
import { clientAuth } from "@/src/lib/firebase/client";

type Props = {
  emailLabel: string;
  submitLabel: string;
  loadingLabel: string;
  successMessage: string;
  errorMessage: string;
};

export function RequestPasswordResetForm({
  emailLabel,
  submitLabel,
  loadingLabel,
  successMessage,
  errorMessage,
}: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ loading: boolean; success?: string; error?: string }>({
    loading: false,
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true });

    try {
      await sendPasswordResetEmail(clientAuth, email.trim());
      setState({ loading: false, success: successMessage });
    } catch {
      // Avoid account enumeration: after a syntactically valid email, respond with the same success copy.
      setState({ loading: false, success: successMessage });
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">{emailLabel}</label>
        <Input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      {state.success ? <p className="break-words text-sm text-emerald-700">{state.success}</p> : null}
      {state.error ? <p className="break-words text-sm text-red-600">{state.error}</p> : null}

      <Button type="submit" disabled={state.loading} className="w-full">
        {state.loading ? loadingLabel : submitLabel}
      </Button>

      {!state.success ? <p className="text-xs text-slate-500">{errorMessage}</p> : null}
    </form>
  );
}
