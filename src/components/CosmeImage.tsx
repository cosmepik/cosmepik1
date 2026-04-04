"use client";

import Image from "next/image";
import { useState } from "react";

const PLACEHOLDER_SRC = "/cosme-placeholder.svg";

interface CosmeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  unoptimized?: boolean;
}

/** コスメ画像：読み込み失敗時はシンプルなプレースホルダーを表示 */
export function CosmeImage({ src, alt, fill, sizes, className, style, unoptimized }: CosmeImageProps) {
  const [error, setError] = useState(false);
  const usePlaceholder = !src || error || src.includes("cosme-placeholder");
  const effectiveSrc = usePlaceholder ? PLACEHOLDER_SRC : src;

  return (
    <Image
      src={effectiveSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      style={style}
      unoptimized={unoptimized}
      onError={() => setError(true)}
    />
  );
}
