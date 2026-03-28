"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CosmeImage } from "@/components/CosmeImage";
import type { CosmeItem } from "@/types";

interface CosmeCardProps {
  item: CosmeItem;
  onAdd: (item: CosmeItem) => void;
  /** すでにリストに含まれているか */
  isInList?: boolean;
  /** モーダル内などコンパクト表示 */
  compact?: boolean;
}

export function CosmeCard({ item, onAdd, isInList, compact }: CosmeCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-white py-1.5 pl-2 pr-1 shadow-sm">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary">
          <CosmeImage
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-contain object-center"
            sizes="40px"
          />
        </div>
        <div className="min-w-0 flex-1">
          {item.brand && (
            <p className="text-[9px] font-medium text-green leading-tight">{item.brand}</p>
          )}
          <h3 className="truncate text-[11px] font-medium leading-tight text-card-foreground">
            {item.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onAdd(item)}
          disabled={isInList}
          aria-label="リストに追加"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:opacity-90 active:scale-95 disabled:bg-muted disabled:text-muted-foreground"
        >
          {isInList ? (
            <span className="text-[10px]">済</span>
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl bg-white p-4 shadow-sm sm:flex-row">
      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg bg-secondary sm:w-24">
        <CosmeImage
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-contain object-center"
          sizes="96px"
        />
      </div>
      <div className="min-w-0 flex-1">
        {item.brand && (
          <p className="text-xs font-medium tracking-wide text-green">{item.brand}</p>
        )}
        <h3 className={cn("font-medium line-clamp-2 text-card-foreground", item.brand && "mt-0.5")}>
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
