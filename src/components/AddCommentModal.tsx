"use client";

import { useState, useCallback } from "react";
import type { CosmeItem } from "@/types";

interface AddCommentModalProps {
  item: CosmeItem | null;
  onClose: () => void;
  onConfirm: (item: CosmeItem, comment: string) => void;
}

export function AddCommentModal({
  item,
  onClose,
  onConfirm,
}: AddCommentModalProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!item) return;
      onConfirm(item, comment.trim());
      setComment("");
      onClose();
    },
    [item, comment, onConfirm, onClose]
  );

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="max-w-md w-full overflow-hidden rounded-2xl border border-border bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border p-6">
          <h2 id="modal-title" className="text-lg font-medium text-foreground">
            愛用コメントを入力
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{item.brand} / {item.name}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <label htmlFor="comment" className="mb-2 block text-sm font-medium text-card-foreground">
            この商品の感想やおすすめポイント（任意）
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="例：リップがしっとりして一日持つ！"
            className="w-full rounded-lg border border-input bg-white px-4 py-3 text-card-foreground placeholder-muted-foreground focus:border-green focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
          />
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-lg bg-green px-5 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              セクションに追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
