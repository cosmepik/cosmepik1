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
  cardColor?: string;
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

function cardBgStyle(cardColor: string | undefined): React.CSSProperties | undefined {
  if (!cardColor) return undefined;
  return { backgroundColor: cardColor };
}

function buildFallbackLink(item: SectionItem): string {
  if (item.link) return item.link;
  if (item.product) return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(item.product)}/?l-id=cosmetree`;
  return "";
}

function RoutineItem({
  item,
  onClick,
  listClassName,
  listImageClassName,
  cardColorStyle,
}: {
  item: SectionItem;
  onClick: (link: string | undefined, id?: string) => void;
  listClassName: string;
  listImageClassName: string;
  cardColorStyle?: React.CSSProperties;
}) {
  const effectiveLink = buildFallbackLink(item);
  return (
    <a
      href={effectiveLink || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("flex items-stretch gap-2", listClassName)}
      style={cardColorStyle}
      onClick={(e) => {
        if (effectiveLink) {
          e.preventDefault();
          onClick(effectiveLink, item.id);
        }
      }}
    >
      <div className={cn("relative", listImageClassName)}>
        {item.image && (
          <CosmeImage src={item.image} alt={item.product || ""} fill className="object-contain" sizes="48px" />
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
  productImageClassName,
  cardColorStyle,
}: {
  item: SectionItem;
  onClick: (link: string | undefined, id?: string) => void;
  productClassName: string;
  productImageClassName: string;
  cardColorStyle?: React.CSSProperties;
}) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="group relative">
      <a
        href={buildFallbackLink(item) || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("relative block overflow-hidden", productClassName)}
        style={cardColorStyle}
        onClick={(e) => {
          const link = buildFallbackLink(item);
          if (link) {
            e.preventDefault();
            onClick(link, item.id);
          }
        }}
      >
        <div className={cn(productImageClassName)}>
          {item.image && (
            <CosmeImage
              src={item.image}
              alt={item.product || ""}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
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

export function PublicSectionRenderer({ section, slug, userAffiliateId, cardDesignId, cardColor }: Props) {
  const onClick = usePublicAffiliateClick(slug, userAffiliateId);
  const design = getCardDesign(cardDesignId);
  const { listClassName, productClassName, listImageClassName, productImageClassName } = design;
  const colorStyle = cardBgStyle(cardColor);

  if (section.type === "recipe") {
    const placements = section.placements ?? [];
    if (!section.backgroundImage && placements.length === 0) return null;
    const hasComments = placements.some((p) => p.type === "comment");
    return (
      <section className="relative">
        {hasComments && (
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Yomogi&display=swap" />
        )}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3 / 4" }}>
          {section.backgroundImage && (
            <img src={section.backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          {placements.map((p) => {
            if (p.type === "comment") {
              const scale = p.scale ?? 1;
              const rotation = p.rotation ?? 0;
              return (
                <div
                  key={p.id}
                  className="absolute z-10 max-w-[60%]"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <p
                    style={{
                      fontFamily: "Yomogi, cursive",
                      color: p.color || "#333",
                      fontSize: `${Math.round(13 * scale)}px`,
                      lineHeight: 1.4,
                      transform: rotation ? `rotate(${rotation}deg)` : undefined,
                      textShadow: "0 1px 3px rgba(255,255,255,0.8), 0 0 1px rgba(255,255,255,0.6)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {p.comment}
                  </p>
                </div>
              );
            }
            const scale = p.scale ?? 1;
            const labelOffsetX = p.labelOffsetX ?? 0;
            const labelOffsetY = p.labelOffsetY ?? 6.5;
            const labelScale = p.labelScale ?? 1;
            const hasLabel = Boolean(p.brand || p.product);
            const effectiveLink = buildFallbackLink(p);
            const linkProps = effectiveLink
              ? {
                  href: effectiveLink,
                  target: "_blank" as const,
                  rel: "noopener noreferrer",
                  onClick: (e: React.MouseEvent) => { e.preventDefault(); onClick(effectiveLink, p.id); },
                }
              : {};
            const ImgWrapper = effectiveLink ? "a" : "div";
            const LabelWrapper = effectiveLink ? "a" : "div";
            return (
              <div key={p.id}>
                {p.image && (
                  <ImgWrapper
                    {...(linkProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                    className="absolute z-10 block h-20 w-20"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      transform: `translate(-50%, -50%) scale(${scale})`,
                      filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))",
                    }}
                  >
                    <div className="relative h-full w-full">
                      <CosmeImage src={p.image} alt={p.product || ""} fill className="object-contain" sizes="56px" />
                    </div>
                  </ImgWrapper>
                )}
                {hasLabel && (
                  <LabelWrapper
                    {...(linkProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                    className="absolute z-10 block"
                    style={{
                      left: `${p.x + labelOffsetX}%`,
                      top: `${p.y + labelOffsetY}%`,
                      transform: `translate(-50%, -50%) scale(${labelScale})`,
                    }}
                  >
                    <div className="w-[120px] bg-black/40 px-1.5 py-0.5 text-center" style={{ backdropFilter: "blur(2px)" }}>
                      {p.brand && <p className="truncate text-[11px] font-bold text-white">{p.brand}</p>}
                      {p.product && <p className="line-clamp-3 text-[10px] font-medium leading-tight text-white">{p.product}</p>}
                    </div>
                  </LabelWrapper>
                )}
              </div>
            );
          })}
          {/* cosmepik ロゴ */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2"
            style={{
              width: 112,
              height: 28,
              backgroundColor: "rgba(255,255,255,0.6)",
              maskImage: "url(/logo.svg)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskImage: "url(/logo.svg)",
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
            }}
          />
        </div>
      </section>
    );
  }

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
              <RoutineItem key={item.id} item={item} onClick={onClick} listClassName={listClassName} listImageClassName={listImageClassName} cardColorStyle={colorStyle} />
            ))}
          </div>
        )}

        {section.type === "products" && (
          <div className={cn("grid gap-3", section.columns === 1 ? "grid-cols-1" : "grid-cols-2")}>
            {section.items.map((item) => (
              <ProductCard key={item.id} item={item} onClick={onClick} productClassName={productClassName} productImageClassName={productImageClassName} cardColorStyle={colorStyle} />
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
          <div className={cn("p-4", listClassName)} style={colorStyle}>
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
                  style={colorStyle}
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
