/**
 * 公開プロフィールページの SSR コンポーネント。
 * "use client" なし — HTML だけで表示が完結する。
 * テーマ CSS 変数は wrapper の style 属性で注入し、
 * アフィリエイトクリックは data-afl 属性 + AffiliateClickHandler で処理。
 */
import { cn } from "@/lib/utils";
import { getCardDesign } from "@/lib/card-designs";
import { AdBanner } from "@/components/AdSense";
import type { InfluencerProfile, SnsLink } from "@/types";
import type { Section, SectionItem } from "@/lib/sections";

/* ── Inline SVG Icons（lucide-react を排除するため直接定義） ────── */

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function Share2Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function getSnsIcon(type: SnsLink["type"]) {
  switch (type) {
    case "instagram": return InstagramIcon;
    case "twitter": return XIcon;
    case "youtube": return YoutubeIcon;
    default: return LinkIcon;
  }
}

/* ── Logo ────── */

function Logo({ height = 24, color = "var(--primary)", className }: { height?: number; color?: string; className?: string }) {
  return (
    <span
      role="img"
      aria-label="cosmepik"
      className={cn("inline-block shrink-0", className)}
      style={{
        width: height * 4,
        height,
        backgroundColor: color,
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
  );
}

/* ── Profile Header ────── */

function ProfileHeader({ username, profile }: { username: string; profile: InfluencerProfile | null }) {
  const displayName = profile?.displayName?.trim() ? profile.displayName : "USER";
  const skinType = profile?.skinType;
  const personalColor = profile?.personalColor;

  return (
    <header className="flex flex-col items-center gap-4 pb-3">
      <div className="relative">
        <div className="h-20 w-20 overflow-hidden rounded-full shadow-md">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" loading="eager" fetchPriority="high" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-green">
              <UserIcon className="h-10 w-10" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{displayName}</h1>
        <p className="text-xs text-muted-foreground">@{username}</p>
        {profile?.bio && (
          <p className="max-w-[280px] text-center text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
        )}
        {profile?.bioSub && <p className="text-xs text-muted-foreground">{profile.bioSub}</p>}
        {(skinType || personalColor) && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {skinType && <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">{skinType}</span>}
            {personalColor && <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">{personalColor}</span>}
          </div>
        )}
      </div>

      {(profile?.snsLinks?.length ?? 0) > 0 && (
        <div className="flex items-center gap-3">
          {profile!.snsLinks!.map((link) => {
            const Icon = getSnsIcon(link.type);
            return (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-green hover:text-white active:scale-95">
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
          <button aria-label="シェア" className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-green hover:text-white active:scale-95">
            <Share2Icon className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
}

/* ── Section Items ────── */

const PLACEHOLDER_SRC = "/cosme-placeholder.svg";

function SafeImage({ src, alt, className, sizes }: { src?: string; alt: string; className?: string; sizes?: string }) {
  const effectiveSrc = src && !src.includes("cosme-placeholder") ? src : PLACEHOLDER_SRC;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={effectiveSrc} alt={alt} className={className} loading="lazy" decoding="async" sizes={sizes} />
  );
}

function RoutineItem({ item, listClassName, listImageClassName, cardColorStyle }: { item: SectionItem; listClassName: string; listImageClassName: string; cardColorStyle?: React.CSSProperties }) {
  return (
    <a
      href={item.link || "#"}
      target="_blank"
      rel="noopener noreferrer"
      data-afl={item.link || undefined}
      data-item-id={item.id}
      className={cn("flex items-stretch gap-2", listClassName)}
      style={cardColorStyle}
    >
      <div className={cn("relative", listImageClassName)}>
        {item.image && <SafeImage src={item.image} alt={item.product || ""} className="h-full w-full object-cover" sizes="48px" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 overflow-hidden">
        {item.brand && <span className="text-[9px] font-medium uppercase tracking-wider text-primary">{item.brand}</span>}
        <span className="line-clamp-2 break-words text-xs font-medium leading-snug text-card-foreground">{item.product}</span>
        {item.label && <span className="text-[10px] text-muted-foreground">{item.label}</span>}
      </div>
      <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0 self-center text-muted-foreground" />
    </a>
  );
}

function ProductCard({ item, productClassName, productImageClassName, cardColorStyle }: { item: SectionItem; productClassName: string; productImageClassName: string; cardColorStyle?: React.CSSProperties }) {
  return (
    <div className="group relative">
      <a
        href={item.link || "#"}
        target="_blank"
        rel="noopener noreferrer"
        data-afl={item.link || undefined}
        data-item-id={item.id}
        className={cn("relative block overflow-hidden", productClassName)}
        style={cardColorStyle}
      >
        <div className={cn(productImageClassName)}>
          {item.image && (
            <SafeImage
              src={item.image}
              alt={item.product || ""}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 224px"
            />
          )}
          {item.badge && (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">{item.badge}</span>
          )}
          <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm">
            <HeartIcon className="h-3.5 w-3.5 text-foreground" />
          </span>
        </div>
        <div className="flex flex-col gap-0.5 p-2.5">
          {item.brand && <p className="text-[9px] font-medium uppercase tracking-wider text-primary">{item.brand}</p>}
          <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-card-foreground">{item.product}</h3>
          <div className="mt-0.5 flex items-center justify-between">
            {item.price && <span className="text-xs font-bold text-card-foreground">{item.price}</span>}
            <ExternalLinkIcon className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </a>
    </div>
  );
}

function cardBgStyle(cardColor: string | undefined): React.CSSProperties | undefined {
  if (!cardColor) return undefined;
  return { backgroundColor: cardColor };
}

function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

function RecipeSectionBlock({ section, slug }: { section: Section; slug?: string }) {
  const placements = section.placements ?? [];
  if (!section.backgroundImage && placements.length === 0) return null;
  const bgSrc = isExternalUrl(section.backgroundImage ?? "")
    ? section.backgroundImage
    : slug
      ? `/api/recipe-bg/${encodeURIComponent(slug)}`
      : section.backgroundImage;
  const hasComments = placements.some((p) => p.type === "comment");
  return (
    <section className="relative">
      {hasComments && (
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Yomogi&display=swap" />
      )}
      {section.backgroundImage && bgSrc && (
        <link rel="preload" as="image" href={bgSrc} />
      )}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3 / 4" }}>
        {section.backgroundImage && (
          <img src={bgSrc} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" fetchPriority="high" />
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
          return (
            <div
              key={p.id}
              className="absolute z-10 flex flex-col items-center gap-0.5"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
              }}
            >
              {p.image && (
                <a
                  href={p.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-afl={p.link || undefined}
                  className="block h-14 w-14 overflow-hidden rounded-lg border-2 border-white/80 bg-white shadow-lg"
                >
                  <SafeImage src={p.image} alt={p.product || ""} className="h-full w-full object-cover" />
                </a>
              )}
              {(p.brand || p.product) && (
                <div className="max-w-[100px] bg-black/40 px-1.5 py-0.5 text-center" style={{ backdropFilter: "blur(2px)" }}>
                  {p.brand && <p className="truncate text-[9px] font-bold text-white">{p.brand}</p>}
                  {p.product && <p className="line-clamp-3 text-[8px] font-medium leading-tight text-white">{p.product}</p>}
                </div>
              )}
            </div>
          );
        })}
        {/* cosmepik ロゴ */}
        <span
          aria-hidden="true"
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

function SectionBlock({ section, cardDesignId, cardColor, slug }: { section: Section; cardDesignId?: string; cardColor?: string; slug?: string }) {
  if (section.type === "recipe") return <RecipeSectionBlock section={section} slug={slug} />;
  const design = getCardDesign(cardDesignId);
  const { listClassName, productClassName, listImageClassName, productImageClassName } = design;
  const colorStyle = cardBgStyle(cardColor);
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
            {section.items.map((item) => <RoutineItem key={item.id} item={item} listClassName={listClassName} listImageClassName={listImageClassName} cardColorStyle={colorStyle} />)}
          </div>
        )}
        {section.type === "products" && (
          <div className={cn("grid gap-3", section.columns === 1 ? "grid-cols-1" : "grid-cols-2")}>
            {section.items.map((item) => <ProductCard key={item.id} item={item} productClassName={productClassName} productImageClassName={productImageClassName} cardColorStyle={colorStyle} />)}
          </div>
        )}
        {section.type === "heading" && (
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
            {section.subtitle && <p className="text-sm text-muted-foreground">{section.subtitle}</p>}
          </div>
        )}
        {section.type === "text" && (
          <div className={cn("p-2.5", listClassName)} style={colorStyle}>
            <p className="text-sm leading-relaxed text-card-foreground">{section.title}</p>
          </div>
        )}
        {section.type === "link" && (
          <div className="flex flex-col gap-2">
            {section.items.map((item) => (
              <a
                key={item.id}
                href={item.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                data-afl={item.link || undefined}
                data-item-id={item.id}
                className={cn("flex items-center justify-between p-2.5", listClassName)}
                style={colorStyle}
              >
                <span className="font-medium text-card-foreground">{item.label || item.product}</span>
                <ExternalLinkIcon className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Main Page Component ────── */

interface PublicPageSSRProps {
  username: string;
  profile: InfluencerProfile | null;
  sections: Section[];
  themeVars: Record<string, string>;
}

export function PublicPageSSR({ username, profile, sections, themeVars }: PublicPageSSRProps) {
  const hasCustomBg = !!profile?.backgroundImageUrl;
  const usePreset = !!profile?.usePreset;

  const wrapperStyle: Record<string, string> = {
    ...themeVars,
    backgroundColor: "var(--page-bg, var(--background))",
    backgroundImage: "var(--page-bg-image, none)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="min-h-screen" style={wrapperStyle as React.CSSProperties}>
      <div className="relative min-h-screen w-full">
        {hasCustomBg && !usePreset && (
          <div
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `url(${profile!.backgroundImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
        <main className="relative z-10 mx-auto flex max-w-[400px] flex-col gap-3 px-4 py-8">
          <div className="flex justify-center">
            <Logo className="h-6" height={26} />
          </div>

          <ProfileHeader username={username} profile={profile} />

          {sections.map((section) => (
            <SectionBlock key={section.id} section={section} cardDesignId={profile?.cardDesignId} cardColor={profile?.cardColor} slug={username} />
          ))}

          <AdBanner className="w-full" />

          <footer className="flex flex-col items-center gap-2 pb-8 pt-4">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
              <span className="text-xs font-medium">Powered by</span>
              <Logo className="shrink-0" height={18} color="var(--green)" />
            </div>
            <a href="/" className="text-xs font-medium text-green hover:underline">
              cosmepikを使ってみる
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
