"use client";

import { useState } from "react";
import {
  Plus,
  ListOrdered,
  Grid2X2,
  Type,
  AlignLeft,
  Link,
  X,
} from "lucide-react";
import { useSections } from "@/lib/section-context";
import { type SectionType, type Section } from "@/lib/sections";

const quickOptions: {
  type: SectionType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { type: "routine", label: "コレクション", icon: <ListOrdered className="h-4 w-4" /> },
  { type: "products", label: "グリッド表示", icon: <Grid2X2 className="h-4 w-4" /> },
  { type: "heading", label: "見出し", icon: <Type className="h-4 w-4" /> },
  { type: "text", label: "テキスト", icon: <AlignLeft className="h-4 w-4" /> },
  { type: "link", label: "リンク", icon: <Link className="h-4 w-4" /> },
];

interface AddSectionInlineProps {
  insertIndex?: number;
}

export function AddSectionInline({ insertIndex }: AddSectionInlineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState<SectionType | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const { sections, setSections, addSection } = useSections();

  const handleSelectType = (type: SectionType) => {
    setSelectedType(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !title.trim()) return;

    const newSection: Section = {
      id: `section-${Date.now()}`,
      type: selectedType,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      items: [],
      showSteps: selectedType === "routine",
      columns: selectedType === "products" ? 2 : undefined,
    };

    if (insertIndex !== undefined) {
      const newSections = [...sections];
      newSections.splice(insertIndex, 0, newSection);
      setSections(newSections);
    } else {
      addSection(newSection);
    }

    handleClose();
  };

  const handleClose = () => {
    setIsExpanded(false);
    setSelectedType(null);
    setTitle("");
    setSubtitle("");
  };

  // Collapsed state: + line
  if (!isExpanded) {
    return (
      <div className="group flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-border transition-colors group-hover:bg-primary/40" />
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-95"
          aria-label="セクションを追加"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-px flex-1 bg-border transition-colors group-hover:bg-primary/40" />
      </div>
    );
  }

  // Expanded: type selection or form
  return (
    <div className="relative rounded-2xl border-2 border-primary/30 bg-card p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
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
                type="button"
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
                ? "例: 朝のスキンケア"
                : selectedType === "products"
                  ? "例: お気に入り"
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
  );
}
