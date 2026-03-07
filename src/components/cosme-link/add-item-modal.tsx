"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Package,
  Link as LinkIcon,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import { useSections } from "@/lib/section-context";
import { type SectionItem, type SectionType } from "@/lib/sections";
import { searchMockCosme } from "@/lib/mock-data";
import { CosmeCard } from "@/components/CosmeCard";
import { AddCommentModal } from "@/components/AddCommentModal";
import type { CosmeItem } from "@/types";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  sectionType: SectionType;
}

export function AddItemModal({
  isOpen,
  onClose,
  sectionId,
  sectionType,
}: AddItemModalProps) {
  const { slug, addItemToSection } = useSections();

  const [product, setProduct] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [badge, setBadge] = useState<"NEW" | "BEST" | "SALE" | "">("");
  const [label, setLabel] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<CosmeItem[]>([]);
  const [searchApiError, setSearchApiError] = useState<string | null>(null);
  const [searchApiDebug, setSearchApiDebug] = useState<object | null>(null);
  const [commentModalItem, setCommentModalItem] = useState<CosmeItem | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: SectionItem = {
      id: `item-${Date.now()}`,
    };

    if (sectionType === "routine") {
      if (!product.trim()) return;
      newItem.product = product.trim();
      newItem.label = label.trim() || undefined;
      newItem.link = link.trim() || undefined;
      newItem.image = image.trim() || undefined;
    } else if (sectionType === "products") {
      if (!product.trim()) return;
      newItem.product = product.trim();
      newItem.price = price.trim() || undefined;
      newItem.link = link.trim() || undefined;
      newItem.image = image.trim() || undefined;
      newItem.badge = badge || undefined;
      newItem.rating = 0;
      newItem.reviewCount = 0;
    } else if (sectionType === "link") {
      if (!linkLabel.trim() || !link.trim()) return;
      newItem.label = linkLabel.trim();
      newItem.link = link.trim();
    }

    addItemToSection(sectionId, newItem);
    handleClose();
  };

  const handleClose = () => {
    setProduct("");
    setLink("");
    setImage("");
    setPrice("");
    setBadge("");
    setLabel("");
    setLinkLabel("");
    setSearchKeyword("");
    setSearchResults([]);
    setSearchApiError(null);
    setSearchApiDebug(null);
    setCommentModalItem(null);
    onClose();
  };

  // モーダル内検索：本番ではダミー表示せずAPI結果のみ。開発ではモック→API置き換え
  useEffect(() => {
    const k = searchKeyword.trim();
    if (!k) {
      setSearchResults([]);
      setSearchApiError(null);
      setSearchApiDebug(null);
      return;
    }

    const isProduction =
      typeof window !== "undefined" &&
      !["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (!isProduction) {
      setSearchResults(searchMockCosme(k));
    } else {
      setSearchResults([]);
    }
    setSearchApiError(null);
    setSearchApiDebug(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/rakuten/search?keyword=${encodeURIComponent(k)}&hits=20`);
        const data = await res.json().catch(() => ({}));
        const items = Array.isArray(data?.items) ? data.items : [];
        const errMsg = data?.error ?? data?.error_description;

        if (res.ok && items.length > 0) {
          setSearchResults(items);
          setSearchApiError(null);
        } else if (!res.ok || errMsg) {
          const msg =
            errMsg ??
            (res.status === 403 ? "楽天APIのドメイン制限" : `APIエラー (${res.status})`);
          setSearchApiError(msg);
          if (isProduction) setSearchResults([]);
        } else if (res.ok && items.length === 0) {
          setSearchApiError(isProduction ? "該当する商品がありません（楽天API）" : null);
          if (isProduction) setSearchResults([]);
        }
      } catch (e) {
        setSearchApiError(e instanceof Error ? e.message : "楽天APIへの接続に失敗");
        if (isProduction) setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const handleAddFromSearch = (item: CosmeItem, comment: string) => {
    const newItem: SectionItem = {
      id: `item-${Date.now()}`,
      product: item.name,
      image: item.imageUrl,
      link: item.rakutenUrl ?? item.amazonUrl,
      label: comment.trim() || undefined,
    };
    if (sectionType === "routine") {
      addItemToSection(sectionId, { ...newItem });
    } else if (sectionType === "products") {
      addItemToSection(sectionId, { ...newItem, rating: 0, reviewCount: 0 });
    }
    setCommentModalItem(null);
    handleClose();
  };

  if (!isOpen) return null;

  const canAddCosme = ["routine", "products"].includes(sectionType);
  const getTitle = () => {
    switch (sectionType) {
      case "routine":
        return "コレクションにアイテムを追加";
      case "products":
        return "商品を追加";
      case "link":
        return "リンクを追加";
      default:
        return "アイテムを追加";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-xl animate-in slide-in-from-bottom duration-300">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 pb-3 pt-5">
          <h3 className="text-base font-bold text-card-foreground">
            {getTitle()}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {sectionType === "link" ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-card-foreground">
                  <LinkIcon className="mr-1 inline h-4 w-4" />
                  リンクタイトル <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="Instagram"
                  className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-card-foreground">
                  URL <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                追加
              </button>
            </form>
          ) : canAddCosme ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-card-foreground">
                  <Search className="mr-1 inline h-4 w-4" />
                  コスメを検索
                </label>
                <input
                  type="search"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="ファンデーション、SHISEIDO など"
                  className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              {searchApiError && (
                <div className="mb-2 space-y-1">
                  <p className="text-xs text-amber-600" title="原因追求用">
                    {searchApiError}
                  </p>
                  {searchApiDebug && (
                    <pre className="max-h-24 overflow-auto rounded bg-muted p-1.5 text-[10px] text-muted-foreground">
                      {JSON.stringify(searchApiDebug, null, 2)}
                    </pre>
                  )}
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="max-h-96 overflow-y-auto space-y-0.5 rounded-xl border border-border p-1.5">
                  {searchResults.slice(0, 12).map((item) => (
                    <CosmeCard
                      key={item.id}
                      item={item}
                      onAdd={(i) => setCommentModalItem(i)}
                      isInList={false}
                      compact
                    />
                  ))}
                </div>
              )}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">または手動で入力</span>
                </div>
              </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-card-foreground">
                      <Package className="mr-1 inline h-4 w-4" />
                      商品名 <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      placeholder="グリーンティーシード ヒアルロン セラム"
                      className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                  {sectionType === "routine" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-card-foreground">
                        ステップラベル
                      </label>
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="洗顔"
                        className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}
                  {sectionType === "products" && (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-card-foreground">
                          価格
                        </label>
                        <input
                          type="text"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="¥3,410"
                          className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-card-foreground">
                          バッジ
                        </label>
                        <div className="flex gap-2">
                          {(["", "NEW", "BEST", "SALE"] as const).map((b) => (
                            <button
                              key={b || "none"}
                              type="button"
                              onClick={() => setBadge(b)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                badge === b
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground hover:bg-accent"
                              }`}
                            >
                              {b || "なし"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-card-foreground">
                      <LinkIcon className="mr-1 inline h-4 w-4" />
                      商品リンク
                    </label>
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://example.com/product"
                      className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-card-foreground">
                      <ImageIcon className="mr-1 inline h-4 w-4" />
                      画像URL
                    </label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      商品画像のURLを入力してください
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    追加
                  </button>
                </form>
          ) : null}
        </div>
      </div>
      {canAddCosme && (
        <AddCommentModal
          item={commentModalItem}
          onClose={() => setCommentModalItem(null)}
          onConfirm={handleAddFromSearch}
        />
      )}
    </div>
  );
}
