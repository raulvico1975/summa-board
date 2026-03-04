"use client";

import { useState } from "react";
import { ref, uploadBytes } from "firebase/storage";
import { clientAuth, clientStorage } from "@/src/lib/firebase/client";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/field";

export function RecordingUploader({ meetingId }: { meetingId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [state, setState] = useState<{ loading: boolean; message?: string; error?: string }>({
    loading: false,
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true });

    try {
      let storagePath = "";
      let mimeType: string | undefined;
      let originalName: string | undefined;

      if (file) {
        const currentUser = clientAuth.currentUser;
        if (!currentUser) {
          throw new Error("Sessió client no disponible. Torna a entrar.");
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        storagePath = `meetings/${meetingId}/recordings/${Date.now()}-${safeName}`;
        const storageRef = ref(clientStorage, storagePath);
        await uploadBytes(storageRef, file, { contentType: file.type || undefined });

        mimeType = file.type || undefined;
        originalName = file.name;
      }

      const registerRes = await fetch("/api/owner/recordings/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId,
          storagePath,
          rawText,
          mimeType,
          originalName,
        }),
      });

      const registerData = (await registerRes.json()) as { recordingId?: string; error?: string };
      if (!registerRes.ok || !registerData.recordingId) {
        throw new Error(registerData.error ?? "No s'ha pogut registrar la gravació.");
      }

      const processRes = await fetch("/api/owner/process-recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId,
          recordingId: registerData.recordingId,
        }),
      });

      const processData = (await processRes.json()) as { error?: string; mode?: string; model?: string };
      if (!processRes.ok) {
        throw new Error(processData.error ?? "No s'ha pogut processar la gravació.");
      }

      setState({
        loading: false,
        message: `Processament complet (${processData.mode ?? "stub"}${processData.model ? ` · ${processData.model}` : ""}).`,
      });
      setFile(null);
      setRawText("");
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : "Error inesperat",
      });
    }
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Fitxer d&apos;àudio/vídeo (opcional)</label>
        <input
          type="file"
          accept="audio/*,video/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-700"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Notes o transcripció base (opcional)</label>
        <Textarea rows={5} value={rawText} onChange={(event) => setRawText(event.target.value)} />
      </div>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-emerald-700">{state.message}</p> : null}

      <Button type="submit" disabled={state.loading || (!file && rawText.trim().length === 0)}>
        {state.loading ? "Processant..." : "Pujar i processar"}
      </Button>
    </form>
  );
}
