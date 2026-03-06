# サイドメニュー実装ガイド（Cursor向け）

## 概要

プロフィールページ（`/p/[username]`）にハンバーガーボタンから開く左スライドのサイドメニューを実装する。
新規コンポーネント `SideMenu` を作成し、プロフィールページに組み込む。

---

## 変更ファイル一覧

| ファイル | 種別 |
|---|---|
| `components/cosme-link/side-menu.tsx` | 新規作成 |
| `app/p/[username]/page.tsx` | 修正 |

---

## 1. 新規作成: `components/cosme-link/side-menu.tsx`

```tsx
"use client"

import { useEffect } from "react"
import Link from "next/link"
import { X, Globe, Home, BarChart2, Settings, LogOut, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProfile } from "@/lib/profile-context"
import Image from "next/image"

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  {
    icon: Globe,
    label: "トップページに戻る",
    href: "/",
    description: "cosmepikのトップへ",
  },
  {
    icon: Home,
    label: "ホームに戻る",
    href: "/p/mina_kbeauty",
    description: "自分のページを見る",
  },
  {
    icon: BarChart2,
    label: "アクセス解析",
    href: "#analytics",
    description: "訪問者データを確認",
  },
  {
    icon: Settings,
    label: "アカウント設定",
    href: "#settings",
    description: "プロフィール・通知設定",
  },
]

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { profile } = useProfile()

  // Escキーで閉じる
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  // 開いている間はbodyスクロールをロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[300px] flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="サイドメニュー"
        role="dialog"
        aria-modal="true"
      >
        {/* Header: アバター＋ユーザー名＋閉じるボタン */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/30 shadow-sm">
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-tight">{profile.name}</span>
              <span className="text-xs text-muted-foreground">@{profile.username || "user"}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
            aria-label="メニューを閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-center gap-3.5 rounded-xl px-3 py-3 transition-all hover:bg-accent"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-[11px] text-muted-foreground">{item.description}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Divider */}
          <div className="my-3 mx-3 h-px bg-border/60" />

          {/* Sign out */}
          <button
            className="group flex w-full items-center gap-3.5 rounded-xl px-3 py-3 transition-all hover:bg-destructive/8"
            onClick={onClose}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-colors group-hover:bg-destructive group-hover:text-white">
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="flex flex-1 flex-col items-start">
              <span className="text-sm font-medium text-destructive">サインアウト</span>
              <span className="text-[11px] text-muted-foreground">アカウントからログアウト</span>
            </div>
          </button>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border/60">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] text-muted-foreground">cosmepik v1.0</span>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground/60">
            &copy; 2026 cosmepik. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  )
}
```

---

## 2. 修正: `app/p/[username]/page.tsx`

### 追加するimport

```tsx
import { useState } from "react"
import { SideMenu } from "@/components/cosme-link/side-menu"
import { Menu } from "lucide-react"
import { CosmepikLogo } from "@/components/cosmepik-logo"
```

### 削除するimport

```tsx
// 削除
import { Leaf } from "lucide-react"
```

### PageContent 関数の変更

`useSections()` の直後に state を追加:

```tsx
const [menuOpen, setMenuOpen] = useState(false)
```

### ロゴ部分のJSX置き換え

**変更前:**
```tsx
{/* Logo */}
<div className="flex items-center justify-center gap-2">
  <Leaf className="h-5 w-5 text-primary" />
  <span className="text-lg font-bold tracking-tight text-foreground">
    cosmepik
  </span>
</div>
```

**変更後:**
```tsx
{/* Logo + menu button */}
<div className="flex items-center justify-between">
  <button
    onClick={() => setMenuOpen(true)}
    aria-label="メニューを開く"
    className="flex h-9 w-9 items-center justify-center rounded-full bg-card/80 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-card"
  >
    <Menu className="h-4.5 w-4.5" />
  </button>
  <CosmepikLogo className="h-5 w-auto" color="var(--primary)" strokeWidth={2.5} />
  <div className="w-9" /> {/* spacer */}
</div>

<SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
```

---

## デザインポイント

- **ドロワー幅**: `w-[300px]`、左からスライドイン (`translate-x-0` / `-translate-x-full`)
- **バックドロップ**: `backdrop-blur-[2px]` + `bg-black/30` でページをぼかす
- **メニューアイコン**: `bg-primary/10` の角丸ボックス、ホバーで `bg-primary` に変化
- **サインアウト**: `bg-destructive/10` / `text-destructive` で視覚的に分離
- **フッター**: パルスするドットとバージョン表示
- **アクセシビリティ**: `role="dialog"`, `aria-modal`, Escキーで閉じる、bodyスクロールロック

---

## 依存関係

- `useProfile` hook (`@/lib/profile-context`) — アバター・ユーザー名の取得
- `CosmepikLogo` コンポーネント (`@/components/cosmepik-logo`) — SVGロゴ
- `cn` utility (`@/lib/utils`)
- lucide-react: `X, Globe, Home, BarChart2, Settings, LogOut, ChevronRight, Menu`
