"use client";

import { CosmeImage } from "@/components/CosmeImage";
import type { CosmeItem } from "@/types";

interface CosmeCardProps {
  item: CosmeItem;
  onAdd: (item: CosmeItem) => void;
  /** すでにリストに含まれているか */
  isInList?: boolean;
}

export function CosmeCard({ item, onAdd, isInList }: CosmeCardProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl bg-white p-4 shadow-sm sm:flex-row">
      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg bg-secondary sm:w-24">
        <CosmeImage
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover object-center"
          sizes="96px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wide text-green">
          {item.brand}
        </p>
        <h3 className="mt-0.5 font-medium line-clamp-2 text-card-foreground">
          {item.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
        <button
          type="button"
          onClick={() => onAdd(item)}
          disabled={isInList}
          className="mt-3 text-sm font-medium text-green hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground"
        >
          {isInList ? "追加済み" : "リストに追加"}
        </button>
      </div>
    </div>
  );
}
