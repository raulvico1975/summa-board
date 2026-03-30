"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/field";

type Props = {
  emailLabel: string;
  passwordLabel: string;
  submitLabel: string;
  loadingLabel: string;
  successMessage: string;
  alreadyVerifiedMessage: string;
  errorMessage: string;
  helpMessage: string;
  initialEmail?: string;
};

export function RequestEmailVerificationForm({
  emailLabel,
  passwordLabel,
  submitLabel,
  loadingLabel,
  successMessage,
  alreadyVerifiedMessage,
  errorMessage,
  helpMessage,
  initialEmail,
}: Props) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<{ loading: boolean; success?: string; error?: string }>({
    loading: false,
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true });

    try {
      const response = await fetch("/api/auth/request-email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        status?: "sent" | "already_verified";
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? errorMessage);
      }

      if (data.status === "already_verified") {
        setState({ loading: false, success: alreadyVerifiedMessage });
        return;
      }

      setState({ loading: false, success: successMessage });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : errorMessage,
      });
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

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">{passwordLabel}</label>
        <Input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {state.success ? <p className="break-words text-sm text-emerald-700">{state.success}</p> : null}
      {state.error ? <p className="break-words text-sm text-red-600">{state.error}</p> : null}

      <Button type="submit" disabled={state.loading} className="w-full">
        {state.loading ? loadingLabel : submitLabel}
      </Button>

      {!state.success ? <p className="text-xs text-slate-500">{helpMessage}</p> : null}
    </form>
  );
}
