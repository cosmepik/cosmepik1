"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useParams, useSearchParams } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { themes } from "@/lib/themes";
import type { ThemeId } from "@/lib/themes";
import { backgroundGroups } from "@/lib/backgrounds";
import type { Background } from "@/lib/backgrounds";
import { setProfile, getProfile } from "@/lib/store";
import { Palette, X, Check, Paintbrush, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

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

type StylePickerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openTab: "color" | "background";
  setOpenTab: (tab: "color" | "background") => void;
  openWithTab: (tab: "color" | "background") => void;
};

const StylePickerContext = createContext<StylePickerContextValue | null>(null);

export function StylePickerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [openTab, setOpenTab] = useState<"color" | "background">("color");
  const openWithTab = (tab: "color" | "background") => {
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
        openTab: "color" as const,
        setOpenTab: () => {},
        openWithTab: () => {},
      };
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
  onUpload,
  onRemove,
}: {
  slug: string;
  hasBackground: boolean;
  onUpload: () => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await compressImage(file);
      setProfile({
        username: slug,
        backgroundImageUrl: dataUrl,
        updatedAt: new Date().toISOString(),
      });
      window.dispatchEvent(new CustomEvent("cosmepik-background-change"));
      onUpload();
    } catch {
      alert("画像の読み込みに失敗しました。別の画像をお試しください。");
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">画像をアップロード</h4>
      <div className="flex gap-2">
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
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/50 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent"
        >
          <Upload className="h-4 w-4" />
          画像を選択
        </button>
        {hasBackground && (
          <button
            type="button"
            onClick={() => {
              setProfile({
                username: slug,
                backgroundImageUrl: "",
                updatedAt: new Date().toISOString(),
              });
              window.dispatchEvent(new CustomEvent("cosmepik-background-change"));
              onRemove();
            }}
            className="rounded-xl border-2 border-destructive/30 px-4 py-3 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
}

function BackgroundGrid({
  currentBackgroundId,
  onSelect,
  onClose,
  slug,
}: {
  currentBackgroundId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  slug: string;
}) {
  const [hasCustomBackground, setHasCustomBackground] = useState(false);

  useEffect(() => {
    getProfile(slug).then((p) => setHasCustomBackground(!!p?.backgroundImageUrl));
  }, [slug]);

  useEffect(() => {
    const handler = () => getProfile(slug).then((p) => setHasCustomBackground(!!p?.backgroundImageUrl));
    window.addEventListener("cosmepik-background-change", handler);
    return () => window.removeEventListener("cosmepik-background-change", handler);
  }, [slug]);

  return (
    <div className="flex flex-col gap-5">
      <BackgroundUploadSection
        slug={slug}
        hasBackground={hasCustomBackground}
        onUpload={() => setHasCustomBackground(true)}
        onRemove={() => setHasCustomBackground(false)}
      />
      {backgroundGroups.map((group) => (
        <div key={group.type} className="flex flex-col gap-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{group.label}</h4>
          <div
            className={cn(
              "grid gap-2.5",
              group.type === "wallpaper" ? "grid-cols-3" : "grid-cols-4"
            )}
          >
            {group.backgrounds.map((bg) => (
              <BackgroundItem
                key={bg.id}
                bg={bg}
                selected={currentBackgroundId === bg.id}
                onSelect={() => {
                  onSelect(bg.id);
                  onClose();
                }}
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
  const { themeId, setThemeId, backgroundId, setBackgroundId } = useTheme();
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="スタイルを変更"
      >
        <Palette className="h-6 w-6" />
      </button>

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
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {activeTab === "color" ? (
                <ThemeGrid currentThemeId={themeId} onSelect={(id) => setThemeId(id as ThemeId)} onClose={() => setOpen(false)} />
              ) : (
                <BackgroundGrid
                  currentBackgroundId={backgroundId}
                  onSelect={setBackgroundId}
                  onClose={() => setOpen(false)}
                  slug={slug}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
