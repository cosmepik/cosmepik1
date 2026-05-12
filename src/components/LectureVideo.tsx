"use client";

interface LectureVideoProps {
  /** YouTube の動画ID（Shorts も同じ ID で OK） */
  youtubeId: string;
  /** iframe の title（読み上げ・タブ名にも使われる） */
  title: string;
  /**
   * 動画のアスペクト比。
   * - "landscape": 16:9（通常の横動画）
   * - "vertical":  9:16（Shorts や TikTok 風の縦動画）
   * 既定は "landscape"。
   */
  orientation?: "landscape" | "vertical";
  className?: string;
}

/**
 * レクチャー動画を YouTube から埋め込むための共通コンポーネント。
 *
 * - `youtube-nocookie.com` を使い、未再生時の Cookie トラッキングを抑制
 * - `rel=0` で関連動画、`modestbranding=1` で YouTube ロゴを最小化
 * - `loading="lazy"` でファーストペイントを邪魔しない
 * - `playsinline=1` で iOS Safari でも全画面遷移せずインライン再生
 */
export function LectureVideo({
  youtubeId,
  title,
  orientation = "landscape",
  className = "",
}: LectureVideoProps) {
  const isVertical = orientation === "vertical";
  const wrapperClass = [
    "relative mx-auto overflow-hidden rounded-2xl bg-black shadow-md",
    isVertical ? "aspect-[9/16] w-full max-w-[320px]" : "aspect-video w-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className={wrapperClass}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
