"use client";

import { ExternalLink, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCardDesign } from "@/lib/card-designs";
import { type Section, type SectionItem } from "@/lib/sections";
import { CosmeImage } from "@/components/CosmeImage";
import { useState, useCallback } from "react";
import { generateAffiliateLink } from "@/utils/affiliate";

interface Props {
  section: Section;
  slug: string;
  userAffiliateId?: string | null;
  cardDesignId?: string;
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

function RoutineItem({
  item,
  onClick,
  listClassName,
}: {
  item: SectionItem;
  onClick: (link: string | undefined, id?: string) => void;
  listClassName: string;
}) {
  return (
    <a
      href={item.link || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("flex items-stretch gap-2", listClassName)}
      onClick={(e) => {
        if (item.link) {
          e.preventDefault();
          onClick(item.link, item.id);
        }
      }}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {item.image && (
          <CosmeImage src={item.image} alt={item.product || ""} fill className="object-cover" sizes="48px" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 overflow-hidden">
        {item.brand && (
          <span className="text-[9px] font-medium uppercase tracking-wider text-primary">{item.brand}</span>
        )}
        <span className="line-clamp-2 break-words text-xs font-medium leading-snug text-card-foreground">
          {item.product}
        </span>
        {item.label && <span className="text-[10px] text-muted-foreground">{item.label}</span>}
      </div>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 self-center text-muted-foreground" />
    </a>
  );
}

function ProductCard({
  item,
  onClick,
  productClassName,
}: {
  item: SectionItem;
  onClick: (link: string | undefined, id?: string) => void;
  productClassName: string;
}) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="group relative">
      <a
        href={item.link || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("relative block overflow-hidden", productClassName)}
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
            <span className="absolute left-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
              {item.badge}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setLiked((v) => !v); }}
            aria-label="お気に入り"
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-colors hover:bg-card"
          >
            <Heart className={cn("h-3.5 w-3.5 transition-colors", liked ? "fill-destructive text-destructive" : "text-foreground")} />
          </button>
        </div>
        <div className="flex flex-col gap-0.5 p-2.5">
          {item.brand && <p className="text-[9px] font-medium uppercase tracking-wider text-primary">{item.brand}</p>}
          <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-card-foreground">{item.product}</h3>
          <div className="mt-0.5 flex items-center justify-between">
            {item.price && <span className="text-xs font-bold text-card-foreground">{item.price}</span>}
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </a>
    </div>
  );
}

export function PublicSectionRenderer({ section, slug, userAffiliateId, cardDesignId }: Props) {
  const onClick = usePublicAffiliateClick(slug, userAffiliateId);
  const { listClassName, productClassName } = getCardDesign(cardDesignId);

  const showTitle = !["heading", "text"].includes(section.type);

  return (
    <section className="relative">
      {showTitle && section.title && (
        <div className="mb-2 flex items-center gap-1 px-1 py-0.5">
          <span className="text-sm font-semibold text-foreground">{section.title}</span>
        </div>
      )}
      <div>
        {section.type === "routine" && (
          <div className="flex flex-col gap-2">
            {section.items.map((item) => (
              <RoutineItem key={item.id} item={item} onClick={onClick} listClassName={listClassName} />
            ))}
          </div>
        )}

        {section.type === "products" && (
          <div className={cn("grid gap-3", section.columns === 1 ? "grid-cols-1" : "grid-cols-2")}>
            {section.items.map((item) => (
              <ProductCard key={item.id} item={item} onClick={onClick} productClassName={productClassName} />
            ))}
          </div>
        )}

        {section.type === "heading" && (
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
            {section.subtitle && <p className="text-sm text-muted-foreground">{section.subtitle}</p>}
          </div>
        )}

        {section.type === "text" && (
          <div className={cn("p-4", listClassName)}>
            <p className="text-sm leading-relaxed text-card-foreground">{section.title}</p>
          </div>
        )}

        {section.type === "link" && (
          <div className="flex flex-col gap-2">
            {section.items.map((item) => (
              <div key={item.id} className="group relative">
                <a
                  href={item.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("flex items-center justify-between p-4", listClassName)}
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
        )}
      </div>
    </section>
  );
}
