"use client";

import Image from "next/image";
import type { CosmeItem } from "@/types";

interface CosmeCardProps {
  item: CosmeItem;
  onAdd: (item: CosmeItem) => void;
  /** すでにリストに含まれているか */
  isInList?: boolean;
}

export function CosmeCard({ item, onAdd, isInList }: CosmeCardProps) {
  return (
    <div className="card-cream rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start">
      <div className="relative w-full sm:w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-cream-200">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gold-600 font-medium tracking-wide">
          {item.brand}
        </p>
        <h3 className="mt-0.5 font-medium text-stone-800 line-clamp-2">
          {item.name}
        </h3>
        <p className="text-xs text-stone-500 mt-1">{item.category}</p>
        <button
          type="button"
          onClick={() => onAdd(item)}
          disabled={isInList}
          className="mt-3 text-sm font-medium text-gold-600 hover:text-gold-700 disabled:text-stone-400 disabled:cursor-not-allowed"
        >
          {isInList ? "追加済み" : "リストに追加"}
        </button>
      </div>
    </div>
  );
}
