# プロフィール編集機能の実装

## 概要

プロフィール情報（表示名、プロフィール文、肌質、パーソナルカラー、SNSリンク）を編集できるボトムシートUIを実装します。

## 必要なファイル

1. `components/icons/x-icon.tsx` - Xの公式ロゴアイコン
2. `lib/profile-context.tsx` - プロフィール状態管理
3. `components/cosme-link/profile-editor.tsx` - 編集モーダル
4. `components/cosme-link/profile-header.tsx` - プロフィール表示（編集ボタン付き）

---

## 1. components/icons/x-icon.tsx

```tsx
export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
```

---

## 2. lib/profile-context.tsx

```tsx
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface SnsLink {
  id: string
  type: "instagram" | "twitter" | "youtube" | "tiktok" | "threads" | "custom"
  label: string
  url: string
}

export type SkinType = "oily" | "dry" | "combination" | "sensitive" | "normal" | ""
export type PersonalColor = "spring" | "summer" | "autumn" | "winter" | ""

export const skinTypeLabels: Record<string, string> = {
  oily: "脂性肌",
  dry: "乾燥肌",
  combination: "混合肌",
  sensitive: "敏感肌",
  normal: "普通肌",
}

export const personalColorLabels: Record<string, string> = {
  spring: "イエベ春",
  summer: "ブルベ夏",
  autumn: "イエベ秋",
  winter: "ブルベ冬",
}

export interface Profile {
  name: string
  username: string
  bio: string
  bioSub: string
  avatarUrl: string
  snsLinks: SnsLink[]
  skinType: SkinType
  personalColor: PersonalColor
}

const defaultProfile: Profile = {
  name: "@mina_kbeauty",
  username: "mina_kbeauty",
  bio: "韓国コスメ好き | スキンケアオタク",
  bioSub: "毎日のスキンケアルーティンをシェア中",
  avatarUrl: "/images/avatar.jpg",
  snsLinks: [
    { id: "sns-1", type: "instagram", label: "Instagram", url: "https://instagram.com/" },
    { id: "sns-2", type: "twitter", label: "X", url: "https://x.com/" },
    { id: "sns-3", type: "youtube", label: "YouTube", url: "https://youtube.com/" },
  ],
  skinType: "",
  personalColor: "",
}

interface ProfileContextType {
  profile: Profile
  setProfile: (profile: Profile) => void
  updateProfile: (updates: Partial<Profile>) => void
  addSnsLink: (link: SnsLink) => void
  updateSnsLink: (id: string, updates: Partial<SnsLink>) => void
  deleteSnsLink: (id: string) => void
}

const ProfileContext = createContext<ProfileContextType>({
  profile: defaultProfile,
  setProfile: () => {},
  updateProfile: () => {},
  addSnsLink: () => {},
  updateSnsLink: () => {},
  deleteSnsLink: () => {},
})

export function useProfile() {
  return useContext(ProfileContext)
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(defaultProfile)

  useEffect(() => {
    const saved = localStorage.getItem("cosmepik-profile")
    if (saved) {
      try {
        setProfile({ ...defaultProfile, ...JSON.parse(saved) })
      } catch {
        setProfile(defaultProfile)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cosmepik-profile", JSON.stringify(profile))
  }, [profile])

  const updateProfile = (updates: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  const addSnsLink = (link: SnsLink) => {
    setProfile((prev) => ({ ...prev, snsLinks: [...prev.snsLinks, link] }))
  }

  const updateSnsLink = (id: string, updates: Partial<SnsLink>) => {
    setProfile((prev) => ({
      ...prev,
      snsLinks: prev.snsLinks.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }))
  }

  const deleteSnsLink = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      snsLinks: prev.snsLinks.filter((l) => l.id !== id),
    }))
  }

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, updateProfile, addSnsLink, updateSnsLink, deleteSnsLink }}
    >
      {children}
    </ProfileContext.Provider>
  )
}
```

---

## 3. components/cosme-link/profile-editor.tsx

```tsx
"use client"

import { useState } from "react"
import { X, Plus, Trash2, Instagram, Youtube, Link as LinkIcon, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProfile, type SnsLink, type SkinType, type PersonalColor, skinTypeLabels, personalColorLabels } from "@/lib/profile-context"
import { XIcon } from "@/components/icons/x-icon"

const snsTypeOptions = [
  { type: "instagram" as const, label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/username" },
  { type: "twitter" as const, label: "X", icon: XIcon, placeholder: "https://x.com/username" },
  { type: "youtube" as const, label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@channel" },
  { type: "tiktok" as const, label: "TikTok", icon: LinkIcon, placeholder: "https://tiktok.com/@username" },
  { type: "threads" as const, label: "Threads", icon: LinkIcon, placeholder: "https://threads.net/@username" },
  { type: "custom" as const, label: "その他", icon: LinkIcon, placeholder: "https://example.com" },
]

function getSnsIcon(type: SnsLink["type"]) {
  switch (type) {
    case "instagram": return Instagram
    case "twitter": return XIcon
    case "youtube": return Youtube
    default: return LinkIcon
  }
}

interface ProfileEditorProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileEditor({ isOpen, onClose }: ProfileEditorProps) {
  const { profile, updateProfile, addSnsLink, updateSnsLink, deleteSnsLink } = useProfile()
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [bioSub, setBioSub] = useState(profile.bioSub)
  const [skinType, setSkinType] = useState<SkinType>(profile.skinType)
  const [personalColor, setPersonalColor] = useState<PersonalColor>(profile.personalColor)
  const [showAddSns, setShowAddSns] = useState(false)
  const [newSnsType, setNewSnsType] = useState<SnsLink["type"]>("instagram")
  const [newSnsUrl, setNewSnsUrl] = useState("")
  const [newSnsLabel, setNewSnsLabel] = useState("")

  const handleSave = () => {
    updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      bioSub: bioSub.trim(),
      skinType,
      personalColor,
    })
    onClose()
  }

  const handleAddSns = () => {
    if (!newSnsUrl.trim()) return
    const option = snsTypeOptions.find((o) => o.type === newSnsType)
    addSnsLink({
      id: `sns-${Date.now()}`,
      type: newSnsType,
      label: newSnsLabel.trim() || option?.label || "Link",
      url: newSnsUrl.trim(),
    })
    setNewSnsUrl("")
    setNewSnsLabel("")
    setShowAddSns(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md animate-in slide-in-from-bottom duration-300 rounded-t-3xl bg-card shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
          <h3 className="text-base font-bold text-card-foreground">プロフィール編集</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              保存
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Basic info */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-card-foreground">基本情報</h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">表示名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="@username"
                className="rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">プロフィール文</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="韓国コスメ好き | スキンケアオタク"
                className="rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">サブテキスト</label>
              <input
                type="text"
                value={bioSub}
                onChange={(e) => setBioSub(e.target.value)}
                placeholder="ひとこと（任意）"
                className="rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Beauty Profile */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-card-foreground">ビューティープロフィール</h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">肌質</label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(skinTypeLabels) as [SkinType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSkinType(skinType === key ? "" : key)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      skinType === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">パーソナルカラー</label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(personalColorLabels) as [PersonalColor, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPersonalColor(personalColor === key ? "" : key)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      personalColor === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* SNS Links */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-card-foreground">SNSリンク</h4>
              <span className="text-xs text-muted-foreground">{profile.snsLinks.length}個</span>
            </div>

            {/* Existing links */}
            {profile.snsLinks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                SNSリンクがまだありません
              </p>
            )}

            <div className="flex flex-col gap-2">
              {profile.snsLinks.map((link) => {
                const Icon = getSnsIcon(link.type)
                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 rounded-xl border-2 border-border bg-background p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-xs font-medium text-card-foreground">{link.label}</span>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateSnsLink(link.id, { url: e.target.value })}
                        className="truncate bg-transparent text-xs text-muted-foreground outline-none focus:text-foreground"
                        placeholder="URLを入力"
                      />
                    </div>
                    <button
                      onClick={() => deleteSnsLink(link.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Add new SNS */}
            {!showAddSns ? (
              <button
                onClick={() => setShowAddSns(true)}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5 hover:border-primary"
              >
                <Plus className="h-4 w-4" />
                SNSリンクを追加
              </button>
            ) : (
              <div className="flex flex-col gap-3 rounded-xl border-2 border-primary/30 bg-accent/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">新しいリンク</span>
                  <button
                    onClick={() => setShowAddSns(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    キャンセル
                  </button>
                </div>

                {/* Type selector */}
                <div className="flex flex-wrap gap-1.5">
                  {snsTypeOptions.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => {
                        setNewSnsType(opt.type)
                        setNewSnsLabel(opt.label)
                      }}
                      className={cn(
                        "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        newSnsType === opt.type
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-accent"
                      )}
                    >
                      <opt.icon className="h-3 w-3" />
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Label */}
                {newSnsType === "custom" && (
                  <input
                    type="text"
                    value={newSnsLabel}
                    onChange={(e) => setNewSnsLabel(e.target.value)}
                    placeholder="リンク名"
                    className="rounded-lg border-2 border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                )}

                {/* URL */}
                <input
                  type="url"
                  value={newSnsUrl}
                  onChange={(e) => setNewSnsUrl(e.target.value)}
                  placeholder={snsTypeOptions.find((o) => o.type === newSnsType)?.placeholder}
                  className="rounded-lg border-2 border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  autoFocus
                />

                <button
                  onClick={handleAddSns}
                  disabled={!newSnsUrl.trim()}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  追加
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 4. components/cosme-link/profile-header.tsx

```tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { Instagram, Youtube, Share2, Pencil, Link as LinkIcon } from "lucide-react"
import { useProfile, type SnsLink, skinTypeLabels, personalColorLabels } from "@/lib/profile-context"
import { XIcon } from "@/components/icons/x-icon"
import { useSections } from "@/lib/section-context"
import { ProfileEditor } from "./profile-editor"

function getSnsIcon(type: SnsLink["type"]) {
  switch (type) {
    case "instagram": return Instagram
    case "twitter": return XIcon
    case "youtube": return Youtube
    default: return LinkIcon
  }
}

export function ProfileHeader() {
  const { profile } = useProfile()
  const { isEditMode } = useSections()
  const [showEditor, setShowEditor] = useState(false)

  return (
    <>
      <header className="relative flex flex-col items-center gap-4 pb-6">
        {/* Edit button overlay */}
        {isEditMode && (
          <button
            onClick={() => setShowEditor(true)}
            className="absolute -top-1 right-0 z-10 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
          >
            <Pencil className="h-3 w-3" />
            編集
          </button>
        )}

        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-primary shadow-md">
            <Image
              src={profile.avatarUrl}
              alt={`${profile.name}のプロフィール画像`}
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
            {profile.name}
          </h1>
          <p className="max-w-[280px] text-center text-sm leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
          {profile.bioSub && (
            <p className="text-xs text-muted-foreground">
              {profile.bioSub}
            </p>
          )}

          {/* Skin type & Personal color badges */}
          {(profile.skinType || profile.personalColor) && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {profile.skinType && (
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                  {skinTypeLabels[profile.skinType]}
                </span>
              )}
              {profile.personalColor && (
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                  {personalColorLabels[profile.personalColor]}
                </span>
              )}
            </div>
          )}
        </div>

        {/* SNS Links - dynamically rendered */}
        {profile.snsLinks.length > 0 && (
          <div className="flex items-center gap-3">
            {profile.snsLinks.map((link) => {
              const Icon = getSnsIcon(link.type)
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              )
            })}
            <button
              aria-label="シェア"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      <ProfileEditor isOpen={showEditor} onClose={() => setShowEditor(false)} />
    </>
  )
}
```

---

## 5. page.tsx でProfileProviderをラップ

```tsx
import { ProfileProvider } from "@/lib/profile-context"

// ... 他のimport

export default function Cosmepik() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <SectionProvider>
          <PageContent />
        </SectionProvider>
      </ProfileProvider>
    </ThemeProvider>
  )
}
```

---

## 機能一覧

### 基本情報
- 表示名
- プロフィール文
- サブテキスト

### ビューティープロフィール
- **肌質**: 脂性肌 / 乾燥肌 / 混合肌 / 敏感肌 / 普通肌（ピルボタンで選択、再タップで解除）
- **パーソナルカラー**: イエベ春 / ブルベ夏 / イエベ秋 / ブルベ冬（同上）

### SNSリンク
- Instagram / X / YouTube / TikTok / Threads / その他から選択
- URL編集、削除、追加が可能
- プロフィールヘッダーにアイコンリンクとして表示

### データ永続化
- `localStorage("cosmepik-profile")` に保存

### 編集モードとの連携
- 編集モード中のみプロフィールヘッダーに「編集」ボタン表示
- ボトムシートで編集、「保存」で反映
