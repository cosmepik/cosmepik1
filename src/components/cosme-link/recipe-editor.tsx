"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Trash2, ZoomIn, ZoomOut, ImageIcon, Pencil, Check, MessageCircle } from "lucide-react";
import { useSections } from "@/lib/section-context";
import type { Section, RecipePlacement } from "@/lib/sections";
import { RecipeCanvas } from "./recipe-canvas";
import { AddItemModal } from "./add-item-modal";

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
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function RecipeEditor() {
  const { sections, updateSection } = useSections();
  const recipeSection = sections.find((s) => s.type === "recipe") as Section | undefined;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [tempProduct, setTempProduct] = useState("");
  const [tempBrand, setTempBrand] = useState("");
  const [editingComment, setEditingComment] = useState(false);
  const [tempComment, setTempComment] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevItemCountRef = useRef(0);

  const backgroundImage = recipeSection?.backgroundImage || "";
  const placements = recipeSection?.placements ?? [];

  const updateRecipe = useCallback(
    (updates: Partial<Section>) => {
      if (!recipeSection) return;
      updateSection(recipeSection.id, updates);
    },
    [recipeSection, updateSection],
  );

  useEffect(() => {
    if (!recipeSection) return;
    const items = recipeSection.items ?? [];
    const currentPlacements = recipeSection.placements ?? [];
    if (items.length > prevItemCountRef.current && items.length > 0) {
      const newItems = items.slice(prevItemCountRef.current);
      const newPlacements: RecipePlacement[] = newItems.map((item, idx) => ({
        id: item.id,
        product: item.product,
        brand: item.brand,
        image: item.image,
        link: item.link,
        x: 30 + ((currentPlacements.length + idx) % 4) * 15,
        y: 30 + ((currentPlacements.length + idx) % 3) * 15,
        scale: 1,
      }));
      updateSection(recipeSection.id, {
        items: [],
        placements: [...currentPlacements, ...newPlacements],
      });
      if (newPlacements.length > 0) {
        setSelectedId(newPlacements[newPlacements.length - 1].id);
      }
    }
    prevItemCountRef.current = items.length;
  }, [recipeSection, updateSection]);

  useEffect(() => {
    if (!showAddModal && recipeSection) {
      prevItemCountRef.current = recipeSection.items?.length ?? 0;
    }
  }, [showAddModal, recipeSection]);

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await compressImage(file);
      updateRecipe({ backgroundImage: dataUrl });
    } catch {
      /* ignore */
    }
  };

  const handleMove = useCallback(
    (id: string, x: number, y: number) => {
      const next = placements.map((p) => (p.id === id ? { ...p, x, y } : p));
      updateRecipe({ placements: next });
    },
    [placements, updateRecipe],
  );

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    const next = placements.filter((p) => p.id !== selectedId);
    updateRecipe({ placements: next });
    setSelectedId(null);
  }, [selectedId, placements, updateRecipe]);

  const handleScale = useCallback(
    (delta: number) => {
      if (!selectedId) return;
      const next = placements.map((p) => {
        if (p.id !== selectedId) return p;
        const cur = p.scale ?? 1;
        return { ...p, scale: Math.max(0.5, Math.min(2.5, cur + delta)) };
      });
      updateRecipe({ placements: next });
    },
    [selectedId, placements, updateRecipe],
  );

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const updatePlacement = useCallback(
    (id: string, updates: Partial<RecipePlacement>) => {
      const next = placements.map((p) => (p.id === id ? { ...p, ...updates } : p));
      updateRecipe({ placements: next });
    },
    [placements, updateRecipe],
  );

  const selectedPlacement = placements.find((p) => p.id === selectedId);
  const isCommentSelected = selectedPlacement?.type === "comment";

  const handleAddComment = useCallback(() => {
    const id = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newComment: RecipePlacement = {
      id,
      type: "comment",
      comment: "コメント",
      x: 50,
      y: 50,
      scale: 1,
      color: "#333",
    };
    updateRecipe({ placements: [...placements, newComment] });
    setSelectedId(id);
    setTempComment("コメント");
    setEditingComment(true);
  }, [placements, updateRecipe]);

  const startEditLabel = useCallback(() => {
    if (!selectedPlacement) return;
    if (isCommentSelected) {
      setTempComment(selectedPlacement.comment ?? "");
      setEditingComment(true);
    } else {
      setTempProduct(selectedPlacement.product ?? "");
      setTempBrand(selectedPlacement.brand ?? "");
      setEditingLabel(true);
    }
  }, [selectedPlacement, isCommentSelected]);

  const saveLabel = useCallback(() => {
    if (!selectedId) return;
    if (isCommentSelected) {
      updatePlacement(selectedId, { comment: tempComment.trim() || "コメント" });
      setEditingComment(false);
    } else {
      updatePlacement(selectedId, {
        product: tempProduct.trim(),
        brand: tempBrand.trim(),
      });
      setEditingLabel(false);
    }
  }, [selectedId, isCommentSelected, tempProduct, tempBrand, tempComment, updatePlacement]);

  const COMMENT_COLORS = ["#333", "#e11d48", "#2563eb", "#16a34a", "#d97706", "#fff"];

  useEffect(() => {
    if (!selectedId) {
      setEditingLabel(false);
      setEditingComment(false);
    }
  }, [selectedId]);

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBackgroundUpload}
      />

      <RecipeCanvas
        backgroundImage={backgroundImage}
        placements={placements}
        editable
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMove={handleMove}
        onBackgroundClick={() => fileInputRef.current?.click()}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50 active:scale-95"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          写真変更
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddComment}
            className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50 active:scale-95"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            コメント
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            コスメを追加
          </button>
        </div>
      </div>

      {/* Selected item controls — comment */}
      {selectedPlacement && isCommentSelected && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-white p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          {editingComment ? (
            <div className="flex items-start gap-2">
              <textarea
                value={tempComment}
                onChange={(e) => setTempComment(e.target.value)}
                placeholder="コメントを入力"
                rows={2}
                className="min-w-0 flex-1 resize-none rounded-lg border border-input bg-white px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                style={{ fontFamily: "Yomogi, cursive" }}
                autoFocus
              />
              <button
                type="button"
                onClick={saveLabel}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
                aria-label="保存"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p
                className="min-w-0 flex-1 cursor-pointer truncate text-xs text-foreground"
                style={{ fontFamily: "Yomogi, cursive" }}
                onClick={startEditLabel}
              >
                {selectedPlacement.comment || "コメント"}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={startEditLabel} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent active:scale-95" aria-label="編集">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {isDesktop && (
                  <>
                    <button type="button" onClick={() => handleScale(-0.15)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent active:scale-95" aria-label="縮小">
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => handleScale(0.15)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent active:scale-95" aria-label="拡大">
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                <button type="button" onClick={handleDelete} className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 active:scale-95" aria-label="削除">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
          {!editingComment && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">色:</span>
              {COMMENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updatePlacement(selectedId!, { color: c })}
                  className={`h-6 w-6 rounded-full border-2 transition-transform active:scale-90 ${selectedPlacement.color === c ? "border-primary scale-110" : "border-border"}`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected item controls — product */}
      {selectedPlacement && !isCommentSelected && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-white p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              {selectedPlacement.image && (
                <img src={selectedPlacement.image} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover" />
              )}
              {editingLabel ? (
                <input
                  type="text"
                  value={tempProduct}
                  onChange={(e) => setTempProduct(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveLabel(); }}
                  placeholder="商品名"
                  className="w-full min-w-0 rounded-lg border border-input bg-white px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  autoFocus
                />
              ) : (
                <p className="min-w-0 cursor-pointer truncate text-xs font-medium text-foreground" onClick={startEditLabel}>
                  {selectedPlacement.product || "アイテム"}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {editingLabel ? (
                <button type="button" onClick={saveLabel} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95" aria-label="保存">
                  <Check className="h-3.5 w-3.5" />
                </button>
              ) : (
                <>
                  <button type="button" onClick={startEditLabel} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent active:scale-95" aria-label="名前を編集">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {isDesktop && (
                    <>
                      <button type="button" onClick={() => handleScale(-0.15)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent active:scale-95" aria-label="縮小">
                        <ZoomOut className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => handleScale(0.15)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent active:scale-95" aria-label="拡大">
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </>
              )}
              <button type="button" onClick={handleDelete} className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 active:scale-95" aria-label="削除">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {placements.length > 0 && !selectedPlacement && (
        <p className="text-center text-[10px] text-muted-foreground">
          コスメをドラッグして位置を調整できます
        </p>
      )}

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        sectionId={recipeSection?.id ?? ""}
        sectionType="routine"
      />
    </div>
  );
}
