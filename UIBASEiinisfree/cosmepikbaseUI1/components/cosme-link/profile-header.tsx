"use client"

import Image from "next/image"
import { Instagram, Twitter, Youtube, Share2 } from "lucide-react"

export function ProfileHeader() {
  return (
    <header className="flex flex-col items-center gap-4 pb-6">
      <div className="relative">
        <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-primary shadow-md">
          <Image
            src="/images/avatar.jpg"
            alt="Minaのプロフィール画像"
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {"K"}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {"@mina_kbeauty"}
        </h1>
        <p className="max-w-[280px] text-center text-sm leading-relaxed text-muted-foreground">
          {"韓国コスメ好き | スキンケアオタク"}
        </p>
        <p className="text-xs text-muted-foreground">
          {"毎日のスキンケアルーティンをシェア中"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="#"
          aria-label="Instagram"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <Instagram className="h-4 w-4" />
        </a>
        <a
          href="#"
          aria-label="Twitter"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <Twitter className="h-4 w-4" />
        </a>
        <a
          href="#"
          aria-label="YouTube"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <Youtube className="h-4 w-4" />
        </a>
        <button
          aria-label="シェア"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
