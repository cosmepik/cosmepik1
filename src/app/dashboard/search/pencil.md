# セクション追加UIの改善 - インラインの+ボタンで直感的にセクション追加

## 課題

現在、セクションを追加するには左下の鉛筆アイコンを押して編集モードに入り、
さらに+ボタンを押す必要があり直感的ではない。

## 改善内容

各セクションの下に「--- + ---」のラインを表示し、
+ボタンをタップするとその場でセクションタイプ選択→タイトル入力→作成ができるインラインUIを追加する。

---

## 1. `components/cosme-link/add-section-inline.tsx` を新規作成

```tsx
"use client"

import { useState } from "react"
import { Plus, ListOrdered, Grid2X2, Type, AlignLeft, Link, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSections } from "@/lib/section-context"
import { type SectionType, type Section } from "@/lib/sections"

const quickOptions: {
  type: SectionType
  label: string
  icon: React.ReactNode
}[] = [
  { type: "routine", label: "ルーティン", icon: <ListOrdered className="h-4 w-4" /> },
  { type: "products", label: "コスメ", icon: <Grid2X2 className="h-4 w-4" /> },
  { type: "heading", label: "見出し", icon: <Type className="h-4 w-4" /> },
  { type: "text", label: "テキスト", icon: <AlignLeft className="h-4 w-4" /> },
  { type: "link", label: "リンク", icon: <Link className="h-4 w-4" /> },
]

interface AddSectionInlineProps {
  insertIndex?: number
}

export function AddSectionInline({ insertIndex }: AddSectionInlineProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedType, setSelectedType] = useState<SectionType | null>(null)
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [icon, setIcon] = useState("")
  const { sections, setSections, addSection } = useSections()

  const handleSelectType = (type: SectionType) => {
    setSelectedType(type)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !title.trim()) return

    const newSection: Section = {
      id: `section-${Date.now()}`,
      type: selectedType,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      icon: icon.trim() || undefined,
      items: [],
      showSteps: selectedType === "routine",
      columns: selectedType === "products" ? 2 : undefined,
    }

    if (insertIndex !== undefined) {
      const newSections = [...sections]
      newSections.splice(insertIndex, 0, newSection)
      setSections(newSections)
    } else {
      addSection(newSection)
    }

    handleClose()
  }

  const handleClose = () => {
    setIsExpanded(false)
    setSelectedType(null)
    setTitle("")
    setSubtitle("")
    setIcon("")
  }

  // Collapsed state: + line
  if (!isExpanded) {
    return (
      <div className="group flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-border transition-colors group-hover:bg-primary/40" />
        <button
          onClick={() => setIsExpanded(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-95"
          aria-label="セクションを追加"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-px flex-1 bg-border transition-colors group-hover:bg-primary/40" />
      </div>
    )
  }

  // Expanded: type selection or form
  return (
    <div className="relative rounded-2xl border-2 border-primary/30 bg-card p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
      >
        <X className="h-3 w-3" />
      </button>

      {!selectedType ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-card-foreground">
            追加するセクション
          </p>
          <div className="flex flex-wrap gap-2">
            {quickOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => handleSelectType(opt.type)}
                className="flex items-center gap-1.5 rounded-full border-2 border-border px-3 py-1.5 text-sm font-medium text-card-foreground transition-all hover:border-primary hover:bg-primary/5"
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedType(null)}
              className="text-xs text-primary hover:underline"
            >
              戻る
            </button>
            <span className="text-xs text-muted-foreground">
              {quickOptions.find((o) => o.type === selectedType)?.label}
            </span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              selectedType === "routine"
                ? "例: 朝のスキンケアルーティン"
                : selectedType === "products"
                ? "例: お気に入りコスメ"
                : selectedType === "heading"
                ? "例: スキンケア"
                : selectedType === "link"
                ? "例: SNSリンク"
                : "セクション名"
            }
            className="rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            autoFocus
            required
          />

          {(selectedType === "heading" || selectedType === "text") && (
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="補足テキスト（任意）"
              className="rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          )}

          {selectedType === "routine" && (
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value.slice(0, 2))}
              placeholder="アイコン（例: AM）"
              maxLength={2}
              className="w-32 rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          )}

          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            追加
          </button>
        </form>
      )}
    </div>
  )
}
```

---

## 2. `lib/section-context.tsx` に `setSections` を追加

SectionContextType に以下を追加（なければ）:

```typescript
interface SectionContextType {
  sections: Section[]
  setSections: (sections: Section[]) => void  // これを追加
  // ... 他のプロパティはそのまま
}
```

Provider内に setSections を公開:

```typescript
<SectionContext.Provider value={{ sections, setSections, /* 他のプロパティ */ }}>
```

---

## 3. page.tsx のセクション表示部分を変更

セクション一覧の表示部分を以下に変更:

```tsx
import { AddSectionInline } from "@/components/cosme-link/add-section-inline"

// ... PageContent コンポーネント内のセクション表示部分:

{/* Dynamic Sections with inline add buttons */}
{sections.length === 0 && isEditMode && (
  <AddSectionInline insertIndex={0} />
)}
{sections.map((section, index) => (
  <div key={section.id} className="flex flex-col gap-4">
    <SectionRenderer section={section} />
    {isEditMode && (
      <AddSectionInline insertIndex={index + 1} />
    )}
  </div>
))}
```

---

## UI動作の説明

### 折りたたみ状態（デフォルト）

- 水平線の中央に小さな + ボタンが表示される
- ホバーするとラインが強調色に変わり、ボタンがプライマリカラーになる

### 展開状態（+ボタンタップ後）

- カード型UIが展開し、5つのセクションタイプがピル型ボタンで並ぶ
  - ルーティン / コスメ / 見出し / テキスト / リンク
- 右上にXボタンで閉じられる

### タイプ選択後

- 選んだタイプに応じた入力フォームが表示
  - タイトル入力（必須）
  - 見出し/テキストはサブタイトル入力欄あり
  - ルーティンはアイコン入力欄（2文字まで、例: AM）あり
- 「追加」ボタンで insertIndex の位置にセクションが挿入される

---

## ポイント

- `insertIndex` を渡すことで、セクション間の任意の位置に新しいセクションを挿入できる
- セクションがゼロの場合は `insertIndex={0}` で最初の位置に表示
- 既存の左下の編集モードトグルはそのまま残してOK（セクション並び替え・削除は編集モードで行う）
