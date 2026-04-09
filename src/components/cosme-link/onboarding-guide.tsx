"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const ONBOARDING_KEY = "cosmetree:onboardingComplete";
const TOTAL_STEPS = 4;

interface OnboardingCtx {
  step: number;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  dismiss: () => void;
}

const Ctx = createContext<OnboardingCtx>({
  step: -1,
  totalSteps: TOTAL_STEPS,
  next: () => {},
  prev: () => {},
  dismiss: () => {},
});

export const useOnboarding = () => useContext(Ctx);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_KEY)) return;
    const t = setTimeout(() => setStep(0), 700);
    return () => clearTimeout(t);
  }, []);

  const finish = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    localStorage.setItem("cosmetree:editGuideShown", "1");
    setStep(-1);
  }, []);

  const next = useCallback(() => {
    setStep((s) => {
      if (s >= TOTAL_STEPS - 1) {
        finish();
        return -1;
      }
      return s + 1;
    });
  }, [finish]);

  const prev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  useEffect(() => {
    if (step < 0) return;
    const timer = setTimeout(() => {
      if (step <= 1) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <Ctx.Provider value={{ step, totalSteps: TOTAL_STEPS, next, prev, dismiss: finish }}>
      {children}
    </Ctx.Provider>
  );
}

/* ─── 吹き出しバブル ─── */

interface BubbleProps {
  stepIndex: number;
  emoji: string;
  title: string;
  description: string;
  arrow?: "up" | "down" | "none";
  arrowAlign?: "center" | "left" | "right";
  className?: string;
}

export function OnboardingBubble({
  stepIndex,
  emoji,
  title,
  description,
  arrow = "down",
  arrowAlign = "center",
  className = "",
}: BubbleProps) {
  const { step, totalSteps, next, prev, dismiss } = useOnboarding();
  if (step !== stepIndex) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;
  const displayStep = stepIndex + 1;

  const arrowPos =
    arrowAlign === "left"
      ? "left-5"
      : arrowAlign === "right"
        ? "right-5"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      className={`absolute z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {arrow === "up" && (
        <div className={`absolute -top-1.5 h-3 w-3 rotate-45 bg-white ${arrowPos}`} />
      )}
      <div className="flex w-[250px] flex-col items-center gap-1.5 rounded-2xl bg-white px-5 py-4 shadow-xl ring-1 ring-black/[0.06]">
        <p className="text-[10px] font-medium text-muted-foreground/60">
          {displayStep} / {totalSteps}
        </p>
        <span className="text-2xl leading-none">{emoji}</span>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="whitespace-pre-line text-center text-[11px] leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="flex w-full items-center justify-between pt-1">
          {isFirst ? (
            <div />
          ) : (
            <button
              type="button"
              onClick={prev}
              className="py-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              ← 戻る
            </button>
          )}
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            {isLast ? "はじめる！" : "次へ"}
          </button>
        </div>
      </div>
      {arrow === "down" && (
        <div className={`absolute -bottom-1.5 h-3 w-3 rotate-45 bg-white ${arrowPos}`} />
      )}
    </div>
  );
}
