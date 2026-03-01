"use client";

import { useEffect, useRef } from "react";
import { PhoneMockup } from "./PhoneMockup";

/**
 * Linktree風：ヒーロー下のiPhoneモックスライドショー
 * 横スクロールで流れるように表示
 */
export function HeroSlideshow() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    const speed = 0.5; // px per frame

    const animate = () => {
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      } else {
        el.scrollLeft += speed;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-full overflow-hidden py-8 md:py-12">
      <div
        ref={scrollRef}
        className="flex flex-nowrap gap-8 md:gap-12 overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          scrollBehavior: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center justify-center"
            style={{ scrollSnapAlign: "center" }}
          >
            <PhoneMockup size="md" />
          </div>
        ))}
      </div>
      {/* フェードエッジ（ミントグラデーション背景に合わせる） */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-[#e0f7f5] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-[#e0f7f5] to-transparent"
        aria-hidden
      />
    </div>
  );
}
