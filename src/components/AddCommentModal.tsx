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
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-cream-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-cream-200">
          <h2 id="modal-title" className="text-lg font-medium text-stone-800">
            愛用コメントを入力
          </h2>
          <p className="mt-1 text-sm text-stone-500">{item.brand} / {item.name}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <label htmlFor="comment" className="block text-sm font-medium text-stone-700 mb-2">
            この商品の感想やおすすめポイント（任意）
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="例：リップがしっとりして一日持つ！"
            className="w-full rounded-lg border border-cream-300 bg-cream-50 px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
            rows={3}
          />
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn-gold rounded-lg px-5 py-2 text-sm font-medium"
            >
              公開リストに追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
