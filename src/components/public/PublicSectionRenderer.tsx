"use client";

import { ExternalLink, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Section, type SectionItem } from "@/lib/sections";
import { CosmeImage } from "@/components/CosmeImage";
import { useState, useCallback } from "react";
import { generateAffiliateLink } from "@/utils/affiliate";

interface Props {
  section: Section;
  slug: string;
  userAffiliateId?: string | null;
}

function usePublicAffiliateClick(slug: string, userAffiliateId?: string | null) {
  return useCallback(
    (itemLink: string | undefined, itemId?: string) => {
      const link = itemLink?.trim();
      if (!link) return;
      const { url, usedId } = generateAffiliateLink(userAffiliateId || null, link);
      fetch("/api/affiliate/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: slug, itemId: itemId ?? null, productUrl: link, usedId }),
      }).catch(() => {});
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [slug, userAffiliateId],
  );
}

function RoutineItem({ item, onClick }: { item: SectionItem; onClick: (link: string | undefined, id?: string) => void }) {
  return (
    <a
      href={item.link || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm transition-all hover:shadow-md"
      onClick={(e) => {
        if (item.link) {
          e.preventDefault();
          onClick(item.link, item.id);
        }
      }}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {item.image && (
          <CosmeImage src={item.image} alt={item.product || ""} fill className="object-cover" sizes="64px" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {item.brand && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-primary">{item.brand}</span>
        )}
        <span className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">{item.product}</span>
        {item.label && <span className="text-xs text-muted-foreground">{item.label}</span>}
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  );
}

function ProductCard({ item, onClick }: { item: SectionItem; onClick: (link: string | undefined, id?: string) => void }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="group relative">
      <a
        href={item.link || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block overflow-hidden rounded-xl bg-card shadow-sm transition-all hover:shadow-md"
        onClick={(e) => {
          if (item.link) {
            e.preventDefault();
            onClick(item.link, item.id);
          }
        }}
      >
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {item.image && (
            <CosmeImage
              src={item.image}
              alt={item.product || ""}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 224px"
            />
          )}
          {item.badge && (
            <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {item.badge}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setLiked((v) => !v); }}
            aria-label="お気に入り"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-colors hover:bg-card"
          >
            <Heart className={cn("h-3.5 w-3.5 transition-colors", liked ? "fill-destructive text-destructive" : "text-foreground")} />
          </button>
        </div>
        <div className="flex flex-col gap-1 p-3">
          {item.brand && <p className="text-[10px] font-medium uppercase tracking-wider text-primary">{item.brand}</p>}
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-card-foreground">{item.product}</h3>
          <div className="mt-0.5 flex items-center justify-between">
            {item.price && <span className="text-sm font-bold text-card-foreground">{item.price}</span>}
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </a>
    </div>
  );
}

export function PublicSectionRenderer({ section, slug, userAffiliateId }: Props) {
  const onClick = usePublicAffiliateClick(slug, userAffiliateId);

  const showTitle = !["heading", "text"].includes(section.type);

  return (
    <section className="relative">
      {showTitle && (
        <div className="mb-2 flex items-center gap-1 px-1 py-0.5">
          <span className="text-sm font-semibold text-foreground">{section.title}</span>
        </div>
      )}
      <div>
        {section.type === "routine" &&
          section.items.map((item) => <RoutineItem key={item.id} item={item} onClick={onClick} />)}

        {section.type === "products" && (
          <div className={cn("grid gap-3", section.columns === 1 ? "grid-cols-1" : "grid-cols-2")}>
            {section.items.map((item) => <ProductCard key={item.id} item={item} onClick={onClick} />)}
          </div>
        )}

        {section.type === "heading" && (
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
            {section.subtitle && <p className="text-sm text-muted-foreground">{section.subtitle}</p>}
          </div>
        )}

        {section.type === "text" && (
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-card-foreground">{section.title}</p>
          </div>
        )}

        {section.type === "link" &&
          section.items.map((item) => (
            <div key={item.id} className="group relative">
              <a
                href={item.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm transition-all hover:shadow-md"
                onClick={(e) => {
                  if (item.link) { e.preventDefault(); onClick(item.link, item.id); }
                }}
              >
                <span className="font-medium text-card-foreground">{item.label || item.product}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          ))}
      </div>
    </section>
  );
}
