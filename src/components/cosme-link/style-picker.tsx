"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useId,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname, useParams, useSearchParams } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { themes } from "@/lib/themes";
import type { ThemeId } from "@/lib/themes";
import { backgroundGroups, backgrounds } from "@/lib/backgrounds";
import type { Background } from "@/lib/backgrounds";
import { setProfile, getProfile } from "@/lib/store";
import { fonts, getFontFamily, type FontId } from "@/lib/fonts";
import { Palette, X, Check, Paintbrush, Upload, Plus, Type } from "lucide-react";
import { cn } from "@/lib/utils";

// Deduplicate backgrounds by id to prevent React key conflicts
const deduped = new Set<string>();
const safeBackgroundGroups = backgroundGroups.map((group) => ({
  ...group,
  backgrounds: group.backgrounds.filter((bg) => {
    if (deduped.has(bg.id)) return false;
    deduped.add(bg.id);
    return true;
  }),
}));

if (process.env.NODE_ENV !== "production") {
  const seen = new Set<string>();
  for (const bg of backgrounds) {
    if (seen.has(bg.id)) {
      // eslint-disable-next-line no-console
      console.warn("[StylePicker] Duplicate background id detected:", bg.id);
    }
    seen.add(bg.id);
  }
}

/** 画像を圧縮して data URL を返す */
function compressImage(file: File, maxWidth = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        } else {
          width = (width * maxWidth) / height;
          height = maxWidth;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}

type TabType = "color" | "background" | "font";

type StylePickerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openTab: TabType;
  setOpenTab: (tab: TabType) => void;
  openWithTab: (tab: TabType) => void;
};

const StylePickerContext = createContext<StylePickerContextValue | null>(null);

export function StylePickerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [openTab, setOpenTab] = useState<TabType>("color");
  const openWithTab = (tab: TabType) => {
    setOpenTab(tab);
    setOpen(true);
  };
  return (
    <StylePickerContext.Provider value={{ open, setOpen, openTab, setOpenTab, openWithTab }}>
      {children}
    </StylePickerContext.Provider>
  );
}

export function useStylePickerOpen() {
  const ctx = useContext(StylePickerContext);
  return ctx
    ? {
        open: ctx.open,
        setOpen: ctx.setOpen,
        openTab: ctx.openTab,
        setOpenTab: ctx.setOpenTab,
        openWithTab: ctx.openWithTab,
      }
    : {
        open: false,
        setOpen: () => {},
        openTab: "color" as TabType,
        setOpenTab: () => {},
        openWithTab: () => {},
      };
}

function FontGrid({
  currentFontId,
  onSelect,
  onClose,
}: {
  currentFontId: FontId;
  onSelect: (id: FontId) => void;
  onClose: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {fonts.map((font) => {
        const selected = currentFontId === font.id;
        return (
          <button
            key={font.id}
            type="button"
            onClick={() => {
              onSelect(font.id);
              onClose();
            }}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all",
              selected ? "border-primary bg-accent" : "border-border bg-card hover:border-primary/40"
            )}
            style={{ fontFamily: getFontFamily(font.id) }}
          >
            {selected && (
              <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <Check className="h-3 w-3" />
              </div>
            )}
            <span className="text-sm font-bold text-card-foreground">{font.nameJa}</span>
            <span className="text-[10px] text-muted-foreground">{font.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function ThemeGrid({
  currentThemeId,
  onSelect,
  onClose,
}: {
  currentThemeId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => {
            onSelect(theme.id);
            onClose();
          }}
          className={cn(
            "relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all",
            currentThemeId === theme.id ? "border-primary bg-accent" : "border-border bg-card hover:border-primary/40"
          )}
        >
          {currentThemeId === theme.id && (
            <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Check className="h-3 w-3" />
            </div>
          )}
          <div className="flex items-center -space-x-1">
            <div
              className="h-7 w-7 rounded-full border-2 border-card shadow-sm"
              style={{ backgroundColor: theme.preview.primary }}
            />
            <div
              className="h-7 w-7 rounded-full border-2 border-card shadow-sm"
              style={{ backgroundColor: theme.preview.secondary }}
            />
            <div
              className="h-7 w-7 rounded-full border-2 border-card shadow-sm"
              style={{ backgroundColor: theme.preview.accent }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight text-card-foreground">{theme.nameJa}</span>
            <span className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{theme.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function useCurrentSlug(): string {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  if (pathname?.startsWith("/dashboard/edit/")) {
    const slug = params?.slug;
    return typeof slug === "string" ? slug : "demo";
  }
  const q = searchParams?.get("slug");
  return q ?? "demo";
}

function BackgroundUploadSection({
  slug,
  hasBackground,
  backgroundImageUrl,
  isSelected,
  onUpload,
  onRemove,
  onClearPreset,
}: {
  slug: string;
  hasBackground: boolean;
  backgroundImageUrl: string | null;
  isSelected?: boolean;
  onUpload: (url: string) => void;
  onRemove: () => void;
  onClearPreset?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setIsUploading(true);
    try {
      const dataUrl = await compressImage(file);
      onClearPreset?.();
      await setProfile({
        username: slug,
        backgroundImageUrl: dataUrl,
        usePreset: false,
        updatedAt: new Date().toISOString(),
      });
      window.dispatchEvent(new CustomEvent("cosmepik-background-change", { detail: { backgroundImageUrl: dataUrl } }));
      onUpload(dataUrl);
    } catch {
      alert("画像の読み込みに失敗しました。別の画像をお試しください。");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onRemove();
    window.dispatchEvent(new CustomEvent("cosmepik-background-change", { detail: { backgroundImageUrl: "" } }));
    setProfile({
      username: slug,
      backgroundImageUrl: "",
      updatedAt: new Date().toISOString(),
    }).catch(() => {
      alert("削除の保存に失敗しました。");
    });
  };

  return (
    <div className="flex flex-col gap-2.5">
      <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">画像をアップロード</h4>
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleSelect}
          aria-label="背景画像をアップロード"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/50 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-60 disabled:pointer-events-none"
        >
          <Upload className="h-4 w-4" />
          画像を選択
        </button>
        {isUploading && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">アップロード中</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="progress-indeterminate h-full w-1/3 rounded-full bg-primary" />
            </div>
          </div>
        )}
        {hasBackground && backgroundImageUrl && (
          <div
            className={cn(
              "group relative aspect-[3/4] w-full max-w-[160px] overflow-hidden rounded-xl border-2 bg-secondary transition-all",
              isSelected ? "border-primary ring-2 ring-primary/30" : "border-border"
            )}
          >
            <img
              src={backgroundImageUrl}
              alt="背景プレビュー"
              className="h-full w-full object-cover"
            />
            {isSelected && (
              <div className="absolute left-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </div>
            )}
            <button
              type="button"
              onClick={async () => {
                try {
                  await setProfile({
                    username: slug,
                    usePreset: false,
                    updatedAt: new Date().toISOString(),
                  });
                  window.dispatchEvent(new CustomEvent("cosmepik-background-change"));
                } catch {
                  /* ignore */
                }
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/30"
              aria-label="この画像を背景に選択"
            >
              <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                選択
              </span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="背景画像を削除"
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomColorButton({
  selected,
  onSelect,
  onClose,
}: {
  selected: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const id = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    onSelect(`custom-${hex}`);
    onClose();
  };

  const isCustomSelected = selected;

  return (
    <label
      htmlFor={id}
      className={cn(
        "relative flex cursor-pointer aspect-square overflow-hidden rounded-xl border-2 transition-all",
        isCustomSelected ? "border-primary ring-2 ring-primary/30" : "border-dashed border-border hover:border-primary/40"
      )}
      title="好きな色を選ぶ"
    >
      <input
        id={id}
        type="color"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onChange={handleChange}
        aria-label="好きな色を選択"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0080ff, #8000ff, #ff0080)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <Plus className="h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" strokeWidth={2.5} />
        <span className="text-[9px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">カスタム</span>
      </div>
      {isCustomSelected && (
        <div className="pointer-events-none absolute right-1 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Check className="h-2.5 w-2.5" />
        </div>
      )}
    </label>
  );
}

function CustomGradientButton({
  selected,
  currentId,
  onSelect,
  onClose,
}: {
  selected: boolean;
  currentId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const id = useId();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [color1, setColor1] = useState("#ff9a9e");
  const [color2, setColor2] = useState("#fecfef");
  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [pickerOpen]);

  useEffect(() => {
    if (currentId.startsWith("custom-gradient-")) {
      const rest = currentId.slice("custom-gradient-".length);
      const hexes = rest.split("-").filter((h) => /^#[0-9A-Fa-f]{6}$/.test(h));
      if (hexes.length >= 2) {
        setColor1(hexes[0]!);
        setColor2(hexes[1]!);
      }
    }
  }, [currentId]);

  const handleApply = () => {
    onSelect(`custom-gradient-${color1}-${color2}`);
    setPickerOpen(false);
    onClose();
  };

  const gradientStyle = {
    background: `linear-gradient(135deg, ${color1}, ${color2})`,
  };

  return (
    <div className="relative aspect-square w-full" ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPickerOpen((prev) => !prev);
        }}
        className={cn(
          "relative h-full w-full overflow-hidden rounded-xl border-2 transition-all",
          selected ? "border-primary ring-2 ring-primary/30" : "border-dashed border-border hover:border-primary/40 hover:opacity-90"
        )}
        title="好きなグラデーションを作る"
        style={gradientStyle}
      >
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <Plus className="h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" strokeWidth={2.5} />
          <span className="text-[9px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">カスタム</span>
        </div>
        {selected && (
          <div className="pointer-events-none absolute right-1 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Check className="h-2.5 w-2.5" />
          </div>
        )}
      </button>

      {pickerOpen && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-border bg-card p-3 shadow-xl">
          <p className="mb-2 text-xs font-medium text-muted-foreground">色を選んでグラデーションを作る</p>
          <div className="flex gap-2">
            <label
              htmlFor={`${id}-color1`}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border-2 border-border shadow-sm"
              style={{ backgroundColor: color1 }}
              aria-label="色1を変更"
            />
            <input
              id={`${id}-color1`}
              ref={input1Ref}
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="sr-only"
              aria-label="色1"
            />
            <label
              htmlFor={`${id}-color2`}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border-2 border-border shadow-sm"
              style={{ backgroundColor: color2 }}
              aria-label="色2を変更"
            />
            <input
              id={`${id}-color2`}
              ref={input2Ref}
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="sr-only"
              aria-label="色2"
            />
            <div
              className="h-10 flex-1 rounded-lg border border-border"
              style={gradientStyle}
            />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              適用
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BackgroundGrid({
  currentBackgroundId,
  onSelect,
  onClose,
  slug,
  onClearPreset,
}: {
  currentBackgroundId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  slug: string;
  onClearPreset?: () => void;
}) {
  const [hasCustomBackground, setHasCustomBackground] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [usePreset, setUsePreset] = useState(true);

  const refreshBackground = useCallback(() => {
    getProfile(slug).then((p) => {
      const url = p?.backgroundImageUrl ?? null;
      setHasCustomBackground(!!url);
      setBackgroundImageUrl(url ?? null);
      setUsePreset(!!p?.usePreset);
    });
  }, [slug]);

  useEffect(() => {
    refreshBackground();
  }, [refreshBackground]);

  useEffect(() => {
    window.addEventListener("cosmepik-background-change", refreshBackground);
    return () => window.removeEventListener("cosmepik-background-change", refreshBackground);
  }, [refreshBackground]);

  const handleSelectPreset = useCallback(
    (id: string) => {
      onSelect(id);
      setProfile({
        username: slug,
        backgroundId: id,
        ...(hasCustomBackground && { usePreset: true }),
        updatedAt: new Date().toISOString(),
      })
        .then(() => {
          if (hasCustomBackground) {
            window.dispatchEvent(new CustomEvent("cosmepik-background-change"));
          }
        })
        .catch(() => {});
    },
    [slug, hasCustomBackground, onSelect]
  );

  return (
    <div className="flex flex-col gap-5">
      <BackgroundUploadSection
        slug={slug}
        hasBackground={hasCustomBackground}
        backgroundImageUrl={backgroundImageUrl}
        isSelected={hasCustomBackground && !usePreset}
        onUpload={(url) => {
          setHasCustomBackground(true);
          setBackgroundImageUrl(url);
        }}
        onRemove={() => {
          setHasCustomBackground(false);
          setBackgroundImageUrl(null);
        }}
        onClearPreset={onClearPreset}
      />
      {safeBackgroundGroups.map((group) => (
        <div key={group.type} className="flex flex-col gap-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{group.label}</h4>
          <div
            className={cn(
              "grid gap-2.5",
              group.type === "wallpaper" ? "grid-cols-3" : "grid-cols-4"
            )}
          >
            {group.type === "solid" && (
              <CustomColorButton
                selected={currentBackgroundId.startsWith("custom-") && !currentBackgroundId.startsWith("custom-gradient-")}
                onSelect={handleSelectPreset}
                onClose={onClose}
              />
            )}
            {group.type === "gradient" && (
              <CustomGradientButton
                selected={currentBackgroundId.startsWith("custom-gradient-")}
                currentId={currentBackgroundId}
                onSelect={handleSelectPreset}
                onClose={onClose}
              />
            )}
            {group.backgrounds.map((bg) => (
              <BackgroundItem
                key={bg.id}
                bg={bg}
                selected={currentBackgroundId === bg.id}
                onSelect={() => handleSelectPreset(bg.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BackgroundItem({
  bg,
  selected,
  onSelect,
}: {
  bg: Background;
  selected: boolean;
  onSelect: () => void;
}) {
  const previewStyle =
    bg.type === "solid"
      ? { backgroundColor: bg.preview }
      : bg.type === "gradient"
        ? { background: bg.preview }
        : { backgroundImage: `url(${bg.preview})`, backgroundSize: "cover", backgroundPosition: "center" };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative aspect-square overflow-hidden rounded-xl border-2 transition-all",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"
      )}
    >
      <div className="absolute inset-0" style={previewStyle} />
      {selected && (
        <div className="absolute right-1 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Check className="h-2.5 w-2.5" />
        </div>
      )}
      {bg.type === "wallpaper" && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
          <span className="block truncate text-[9px] font-medium leading-tight text-white">{bg.nameJa}</span>
        </div>
      )}
    </button>
  );
}

export function StylePicker() {
  const slug = useCurrentSlug();
  const { themeId, setThemeId, backgroundId, setBackgroundId, fontId, setFontId } = useTheme();
  const ctx = useContext(StylePickerContext);
  const open = ctx?.open ?? false;
  const setOpen = ctx?.setOpen ?? (() => {});
  const activeTab = ctx?.openTab ?? "color";
  const setActiveTab = ctx?.setOpenTab ?? (() => {});

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="スタイル設定"
            className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-xl animate-in slide-in-from-bottom duration-300"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 pb-3 pt-5">
              <h3 className="text-base font-bold text-card-foreground">スタイル設定</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
                aria-label="閉じる"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex shrink-0 gap-2 border-b border-border px-5 py-3">
              <button
                type="button"
                onClick={() => setActiveTab("color")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === "color"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                )}
              >
                <Palette className="h-4 w-4" />
                カラー
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("background")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === "background"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                )}
              >
                <Paintbrush className="h-4 w-4" />
                背景
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("font")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === "font"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                )}
              >
                <Type className="h-4 w-4" />
                フォント
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {activeTab === "color" ? (
                <ThemeGrid
                  currentThemeId={themeId}
                  onSelect={(id) => {
                    setThemeId(id as ThemeId);
                    setProfile({
                      username: slug,
                      themeId: id,
                      updatedAt: new Date().toISOString(),
                    }).catch(() => {});
                  }}
                  onClose={() => setOpen(false)}
                />
              ) : activeTab === "font" ? (
                <FontGrid
                  currentFontId={fontId}
                  onSelect={(id) => {
                    setFontId(id);
                    setProfile({
                      username: slug,
                      fontId: id,
                      updatedAt: new Date().toISOString(),
                    }).catch(() => {});
                  }}
                  onClose={() => setOpen(false)}
                />
              ) : (
                <BackgroundGrid
                  currentBackgroundId={backgroundId}
                  onSelect={setBackgroundId}
                  onClose={() => setOpen(false)}
                  slug={slug}
                  onClearPreset={() => setBackgroundId("custom-#ffffff")}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
