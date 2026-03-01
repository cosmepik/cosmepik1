"use client"

import { Sparkles, ChevronRight } from "lucide-react"

export function PromoBanner() {
  return (
    <a
      href="#"
      className="group flex items-center gap-3 rounded-xl bg-primary p-4 text-primary-foreground shadow-sm transition-all hover:shadow-md"
    >
      <Sparkles className="h-5 w-5 shrink-0" />
      <div className="flex flex-1 flex-col">
        <span className="text-xs font-bold uppercase tracking-wider opacity-80">
          {"Special Offer"}
        </span>
        <span className="text-sm font-semibold">
          {"Qoo10メガ割で韓国コスメが最大50%OFF!"}
        </span>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </a>
  )
}
