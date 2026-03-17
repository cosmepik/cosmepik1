"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Circle, Copy } from "lucide-react";
import { useProfile } from "@/lib/profile-context";
import { useSections } from "@/lib/section-context";

const DISMISSED_KEY = "cosmepik-setup-guide-dismissed";
const CHECKED_KEY = "cosmepik-setup-guide-checked";

interface GuideStep {
  id: string;
  label: string;
  check: (ctx: StepContext) => boolean;
}

interface StepContext {
  profile: ReturnType<typeof useProfile>["profile"];
  sections: ReturnType<typeof useSections>["sections"];
}

const steps: GuideStep[] = [
  { id: "avatar", label: "アイコン画像を設定", check: (ctx) => !!ctx.profile.avatarUrl },
  { id: "skin", label: "パーソナルカラーと肌質を選択", check: (ctx) => !!ctx.profile.skinType || !!ctx.profile.personalColor },
  { id: "cosme", label: "コスメを追加", check: (ctx) => ctx.sections.some((s) => s.items.length > 0) },
  { id: "wallpaper", label: "壁紙を設定", check: (ctx) => !!ctx.profile.themeId || !!ctx.profile.backgroundId || !!ctx.profile.backgroundImageUrl },
];

export function SetupGuide() {
  const { profile } = useProfile();
  const { sections } = useSections();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [manualChecked, setManualChecked] = useState<Set<string>>(new Set());
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === "true");
    try {
      const saved = JSON.parse(localStorage.getItem(CHECKED_KEY) || "[]");
      if (Array.isArray(saved)) setManualChecked(new Set(saved));
    } catch {}
    setReady(true);
  }, []);

  const ctx: StepContext = { profile, sections };
  const completedCount = steps.filter(
    (s) => s.check(ctx) || manualChecked.has(s.id)
  ).length;
  const allDone = completedCount === steps.length;

  useEffect(() => {
    if (ready && allDone && !dismissed && !showCompletePopup) {
      setShowCompletePopup(true);
      setDismissed(true);
      localStorage.setItem(DISMISSED_KEY, "true");
    }
  }, [ready, allDone, dismissed, showCompletePopup]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  const handleCopyUrl = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/p/${profile.username}` : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const toggleManual = (id: string) => {
    setManualChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(CHECKED_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  if (!ready) return null;
  if (showCompletePopup) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          onClick={() => setShowCompletePopup(false)}
          aria-hidden="true"
        />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-xl">
          <p className="mb-4 text-center text-base font-semibold text-foreground">
            URLをコピーしてSNSに貼り付けよう！
          </p>
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">
              {typeof window !== "undefined" ? `${window.location.origin}/p/${profile.username}` : ""}
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Copy className="h-4 w-4" />
              {copied ? "コピーしました" : "コピー"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowCompletePopup(false)}
            className="w-full rounded-xl border border-border bg-secondary py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }
  if (dismissed) return null;

  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <>
      <div className="relative w-[120px] overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-white via-primary/5 to-primary/10 p-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_12px_-2px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <button
          onClick={handleDismiss}
          className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:text-foreground"
          aria-label="ガイドを閉じる"
        >
          <X className="h-3 w-3" strokeWidth={2.5} />
        </button>

        <p className="mb-1.5 pr-4 text-[10px] font-bold leading-tight text-foreground">
          ページを完成させよう！
        </p>

        <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-primary/15">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <ul className="flex flex-col gap-1">
          {steps.map((step) => {
            const done = step.check(ctx) || manualChecked.has(step.id);
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => toggleManual(step.id)}
                  className="flex min-w-0 w-full items-start gap-1.5 rounded-md px-0.5 py-0.5 text-left transition-colors hover:bg-primary/10"
                >
                  {done ? (
                    <CheckCircle2 className="mt-[1px] h-3 w-3 shrink-0 text-primary" strokeWidth={2.5} />
                  ) : (
                    <Circle className="mt-[1px] h-3 w-3 shrink-0 text-muted-foreground/30" strokeWidth={1.5} />
                  )}
                  <span
                    className={`min-w-0 break-words text-[9px] leading-snug ${
                      done ? "text-muted-foreground line-through" : "text-foreground font-medium"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
