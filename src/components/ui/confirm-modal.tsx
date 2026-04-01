"use client";

import { useEffect } from "react";
import { Button } from "@/src/components/ui/button";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmLoadingLabel?: string;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmLoadingLabel,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
      onClick={!loading ? onCancel : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="confirm-modal-title" className="mt-2 text-lg font-semibold text-slate-900">
            {title}
          </h2>
        </div>
        <div className="space-y-4 px-5 py-5">
          <p id="confirm-modal-description" className="text-sm leading-6 text-slate-600">
            {description}
          </p>
          {error ? <p className="break-words text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button type="button" variant="destructive" onClick={onConfirm} disabled={loading}>
              {loading && confirmLoadingLabel ? confirmLoadingLabel : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
