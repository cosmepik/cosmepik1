"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "ALL" },
  { id: "skincare", label: "スキンケア" },
  { id: "makeup", label: "メイク" },
  { id: "bodycare", label: "ボディケア" },
]

interface CategoryTabsProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <nav aria-label="カテゴリー" className="w-full">
      <div className="flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all",
              activeCategory === category.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
