import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  /** クリック時のリンク先。未指定時はリンクなし */
  href?: string;
  /** 表示サイズ（高さ） */
  height?: number;
  className?: string;
}

/** cosmepik ロゴ */
export function Logo({ href, height = 40, className = "" }: LogoProps) {
  const img = (
    <Image
      src="/logo.png"
      alt="cosmepik"
      width={height * 3.5}
      height={height}
      className={`object-contain object-left ${className}`}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {img}
      </Link>
    );
  }
  return img;
}
