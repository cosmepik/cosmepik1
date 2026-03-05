"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export function ShareModal({ open, onClose, url, title = "共有" }: ShareModalProps) {
  const handleCopy = useCallback(async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }, [url]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="share-modal-title" className="text-lg font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-sm text-foreground">
            {url || "—"}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            コピー
          </button>
        </div>
      </div>
    </div>
  );
}
