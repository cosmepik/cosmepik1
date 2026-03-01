"use client";

import { useState } from "react";
import {
  X,
  ListOrdered,
  Grid2X2,
  Type,
  AlignLeft,
  Link,
  Plus,
} from "lucide-react";
import { useSections } from "@/lib/section-context";
import { type SectionType, type Section } from "@/lib/sections";

const sectionTypes: {
  type: SectionType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: "routine",
    label: "コレクション",
    description: "アイテムをリスト形式で表示",
    icon: <ListOrdered className="h-5 w-5" />,
  },
  {
    type: "products",
    label: "グリッド表示",
    description: "商品をグリッド形式で表示",
    icon: <Grid2X2 className="h-5 w-5" />,
  },
  {
    type: "heading",
    label: "見出し",
    description: "セクションを区切る見出しテキスト",
    icon: <Type className="h-5 w-5" />,
  },
  {
    type: "text",
    label: "テキスト",
    description: "自己紹介やメッセージを表示",
    icon: <AlignLeft className="h-5 w-5" />,
  },
  {
    type: "link",
    label: "リンク",
    description: "SNSや外部サイトへのリンク",
    icon: <Link className="h-5 w-5" />,
  },
];

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSectionModal({ isOpen, onClose }: AddSectionModalProps) {
  const { addSection } = useSections();
  const [selectedType, setSelectedType] = useState<SectionType | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [icon, setIcon] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !title.trim()) return;

    const newSection: Section = {
      id: `section-${Date.now()}`,
      type: selectedType,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      icon: icon.trim() || undefined,
      items: [],
      showSteps: selectedType === "routine",
      columns: selectedType === "products" ? 2 : undefined,
    };

    addSection(newSection);
    handleClose();
  };

  const handleClose = () => {
    setSelectedType(null);
    setTitle("");
    setSubtitle("");
    setIcon("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-xl animate-in slide-in-from-bottom duration-300">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 pb-3 pt-5">
          <h3 className="text-base font-bold text-card-foreground">
            セクションを追加
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!selectedType ? (
            <div className="flex flex-col gap-2">
              <p className="mb-2 text-sm text-muted-foreground">
                追加するセクションの種類を選択してください
              </p>
              {sectionTypes.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedType(item.type)}
                  className="flex items-center gap-3 rounded-xl border-2 border-border p-4 text-left transition-all hover:border-primary/40 hover:bg-accent"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-card-foreground">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="mb-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-primary hover:underline"
                >
                  戻る
                </button>
                <span className="text-sm text-muted-foreground">
                  {sectionTypes.find((t) => t.type === selectedType)?.label}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-card-foreground">
                  タイトル <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    selectedType === "routine"
                      ? "朝のスキンケア"
                      : "セクション名"
                  }
                  className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>

              {(selectedType === "heading" || selectedType === "text") && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-card-foreground">
                    サブタイトル / 説明
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="補足テキスト"
                    className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              {selectedType === "routine" && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-card-foreground">
                    アイコン（2文字まで）
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value.slice(0, 2))}
                    placeholder="AM"
                    maxLength={2}
                    className="w-24 rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!title.trim()}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                セクションを追加
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
