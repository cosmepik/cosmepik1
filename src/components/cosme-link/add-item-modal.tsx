"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Package,
  Link as LinkIcon,
  Image as ImageIcon,
  Search,
  Loader2,
} from "lucide-react";
import { useSections } from "@/lib/section-context";
import { type SectionItem, type SectionType } from "@/lib/sections";
import { searchMockCosme } from "@/lib/mock-data";
import { CosmeImage } from "@/components/CosmeImage";
import { uploadImage } from "@/lib/storage";
import { ImageProcessingModal } from "@/components/cosme-link/ImageProcessingModal";
import { warmupBackgroundRemoval } from "@/lib/image-processing";
import type { CosmeItem } from "@/types";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  sectionType: SectionType;
  /**
   * 任意：作成された SectionItem をどう保存するかを呼び出し側で完全に制御したい
   * 場合に渡すコールバック。指定すると `addItemToSection` 経由の保存はスキップし、
   * このコールバックだけが呼ばれる。
   *
   * メイクレシピ編集画面では、`items` を経由せず `placements` に直接保存する
   * ためにこの経路を使う（`items → placements` 変換の useEffect で取り違えが
   * 起きるバグを構造的に避けるため）。
   */
  onItemCreated?: (item: SectionItem) => void;
}

export function AddItemModal({
  isOpen,
  onClose,
  sectionId,
  sectionType,
  onItemCreated,
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
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const [searchResults, setSearchResults] = useState<CosmeItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(15);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [searchApiError, setSearchApiError] = useState<string | null>(null);
  const [searchApiDebug, setSearchApiDebug] = useState<object | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string>("");

  /**
   * 画像処理モーダルの「対象」を 1 つの atomic な state にまとめる。
   * - source と pending を別 state にすると、稀に片方だけが更新済みで
   *   もう片方が前回値というタイミングが React 19 並行レンダリング下で
   *   観測できてしまう（タイトルは正しいのに画像だけ前のコスメになる
   *   バグの根本原因）。
   * - また `invocationId` をキーにして ImageProcessingModal を mount
   *   し直すことで、確実に毎回フレッシュな instance になる。
   * - onConfirm 経由で処理結果が返ってきたとき、`target` を closure
   *   ではなく明示的にパラメータで受け取るため、stale state の余地も
   *   完全に消える。
   */
  type ProcessingTarget = {
    invocationId: string;
    source: string;
    /** null は手動アップロードフォーム経由 */
    item: CosmeItem | null;
  };
  const [processingTarget, setProcessingTarget] = useState<ProcessingTarget | null>(null);

  /**
   * 親から渡された onItemCreated を ref で保持し、handleProcessedImage の
   * 非同期パス内で参照しても確実に最新の参照を呼ぶようにする。
   */
  const onItemCreatedRef = useRef(onItemCreated);
  useEffect(() => {
    onItemCreatedRef.current = onItemCreated;
  });

  /**
   * 作成された item を実際に保存する。onItemCreated が渡されていれば
   * それだけを呼び、無ければ従来どおり addItemToSection に流す。
   */
  const persistItem = (item: SectionItem) => {
    if (onItemCreatedRef.current) {
      onItemCreatedRef.current(item);
      return;
    }
    if (sectionType === "routine") {
      addItemToSection(sectionId, { ...item });
    } else if (sectionType === "products") {
      addItemToSection(sectionId, {
        ...item,
        rating: item.rating ?? 0,
        reviewCount: item.reviewCount ?? 0,
      });
    } else {
      addItemToSection(sectionId, item);
    }
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      // 画像処理モーダルを開く（自動背景除去 → プレビュー → 手動クロップ）
      setProcessingTarget({
        invocationId: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        source: dataUrl,
        item: null, // 手動フォーム用
      });
    } catch {
      setImage("");
      setImagePreview(null);
    } finally {
      // ファイル入力をリセットして同じファイルを再選択できるようにする
      e.target.value = "";
    }
  };

  /**
   * 画像処理モーダルで確定された data URL を処理。
   * - `target` は呼び出し時にモーダルへ渡した「対象」をそのまま受け取る。
   *   state を closure 経由で参照しないため、結果と処理対象が取り違えに
   *   なる経路が原理的に存在しない。
   */
  const handleProcessedImage = async (
    processedDataUrl: string,
    target: ProcessingTarget,
  ) => {
    setProcessingTarget(null);

    const pendingItem = target.item;
    const sourceUrl = target.source;

    if (pendingItem) {
      // 検索結果から追加するフロー
      setImageUploading(true);
      try {
        // ファイル名にタイムスタンプ + ランダムサフィックスを入れて、
        // 同一ミリ秒に呼ばれた場合でも絶対に衝突しないようにする。
        const uniq = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const uploadedUrl = await uploadImage(
          processedDataUrl,
          "cosme-items",
          `processed-${uniq}`,
        );
        const newItem: SectionItem = {
          id: `item-${uniq}`,
          product: pendingItem.name,
          image: uploadedUrl,
          originalImage: pendingItem.imageUrl,
          link: pendingItem.rakutenUrl ?? pendingItem.amazonUrl,
        };
        persistItem(newItem);
        handleClose();
      } finally {
        setImageUploading(false);
      }
      return;
    }

    // 手動追加フォーム用: アップロードして state に反映
    setImageUploading(true);
    try {
      setImagePreview(processedDataUrl);
      const uniq = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const url = await uploadImage(
        processedDataUrl,
        "cosme-items",
        `manual-${uniq}`,
      );
      setImage(url);
      if (sourceUrl) setOriginalImage(sourceUrl);
    } catch {
      setImage("");
      setImagePreview(null);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const uniq = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newItem: SectionItem = {
      id: `item-${uniq}`,
    };

    if (sectionType === "routine") {
      if (!product.trim()) return;
      newItem.product = product.trim();
      newItem.label = label.trim() || undefined;
      newItem.link = link.trim() || undefined;
      newItem.image = image.trim() || undefined;
      newItem.originalImage = originalImage.trim() || undefined;
    } else if (sectionType === "products") {
      if (!product.trim()) return;
      newItem.product = product.trim();
      newItem.price = price.trim() || undefined;
      newItem.link = link.trim() || undefined;
      newItem.image = image.trim() || undefined;
      newItem.originalImage = originalImage.trim() || undefined;
      newItem.badge = badge || undefined;
      newItem.rating = 0;
      newItem.reviewCount = 0;
    } else if (sectionType === "link") {
      if (!linkLabel.trim() || !link.trim()) return;
      newItem.label = linkLabel.trim();
      newItem.link = link.trim();
    }

    persistItem(newItem);
    handleClose();
  };

  const handleClose = () => {
    setProduct("");
    setLink("");
    setImage("");
    setImagePreview(null);
    setPrice("");
    setBadge("");
    setLabel("");
    setLinkLabel("");
    setSearchKeyword("");
    setSubmittedKeyword("");
    setSearchResults([]);
    setIsSearchPending(false);
    setSearchApiError(null);
    setSearchApiDebug(null);
    setOriginalImage("");
    setProcessingTarget(null);
    onClose();
  };

  const handleSearch = () => {
    const k = searchKeyword.trim();
    if (!k) return;
    setSubmittedKeyword(k);
    setSearchCount((c) => c + 1);
    setVisibleCount(15);
  };

  const handleLoadMore = async () => {
    const k = submittedKeyword;
    if (!k || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = Math.floor(searchResults.length / 15) + 1;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(
        `/api/rakuten/search?keyword=${encodeURIComponent(k)}&hits=15&page=${nextPage}`,
        { signal: controller.signal },
      );
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      const items: CosmeItem[] = Array.isArray(data?.items) ? data.items : [];
      if (items.length > 0) {
        const existingIds = new Set(searchResults.map((r) => r.id));
        const newItems = items.filter((it) => !existingIds.has(it.id));
        setSearchResults((prev) => [...prev, ...newItems]);
        setVisibleCount((prev) => prev + 15);
      }
    } catch {
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const k = submittedKeyword.trim();
    if (!k) {
      setSearchResults([]);
      setSearchApiError(null);
      setSearchApiDebug(null);
      setIsSearchPending(false);
      return;
    }

    setIsSearchPending(true);
    setSearchResults([]);
    setSearchApiError(null);
    setSearchApiDebug(null);

    const isProduction =
      typeof window !== "undefined" &&
      !["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (!isProduction) {
      setSearchResults(searchMockCosme(k));
      setIsSearchPending(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(`/api/rakuten/search?keyword=${encodeURIComponent(k)}&hits=15`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (cancelled) return;
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
          setSearchApiDebug(data?._debug ?? null);
          setSearchResults([]);
        } else if (res.ok && items.length === 0) {
          setSearchApiError("商品が見つかりませんでした🙇\n3秒待ってもう一度検索ボタンを押してみて！");
          setSearchResults([]);
        }
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error && e.name === "AbortError"
          ? "検索がタイムアウトしました"
          : (e instanceof Error ? e.message : "楽天APIへの接続に失敗");
        setSearchApiError(msg);
        setSearchApiDebug(null);
        setSearchResults([]);
      } finally {
        if (!cancelled) setIsSearchPending(false);
      }
    })();
    return () => { cancelled = true; };
  }, [submittedKeyword, searchCount]);

  const handleAddFromSearch = (item: CosmeItem) => {
    // 画像処理モーダルを開く（自動背景除去 → プレビュー or 手動調整）
    // source と item を atomic に 1 つの state object として書き込む。
    // 別 state にしていた頃は片方だけ古い値が残るタイミングが理論上あり、
    // 「タイトルは正しいのに画像だけ前のコスメ」の取り違えバグ要因だった。
    setProcessingTarget({
      invocationId: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      source: item.imageUrl,
      item,
    });
  };

  const handleProcessingCancel = () => {
    setProcessingTarget(null);
  };

  useEffect(() => {
    if (!isOpen) return;
    // モーダルを開いたタイミングで背景除去モデルをプリロード（実行時の待ち時間を短縮）
    warmupBackgroundRemoval();
    document.body.style.overflow = "hidden";
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [isOpen]);

  /**
   * 防御: モーダルが閉じる方向（isOpen → false）に切り替わったら必ず
   * 画像処理 state を空にする。`handleClose` でも同じことをしているが、
   * 親側からの強制クローズや、処理中に親 isOpen が落ちるパスでも漏れなく
   * リセットされるようにここでも明示する。
   */
  useEffect(() => {
    if (!isOpen) {
      setProcessingTarget(null);
    }
  }, [isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-end justify-center" onTouchMove={(e) => e.stopPropagation()}>
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm select-none touch-none"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-xl animate-in slide-in-from-bottom duration-300 select-auto" style={{ WebkitUserSelect: "auto", userSelect: "auto" }}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 pb-2.5 pt-4">
          <h3 className="text-base font-bold text-card-foreground">
            {getTitle()}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent active:scale-95"
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
                <div className="flex gap-2">
                  <input
                    type="search"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
                    enterKeyHint="search"
                    placeholder="ファンデーション、SHISEIDO など"
                    className="min-w-0 flex-1 rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={!searchKeyword.trim() || isSearchPending}
                    className="flex shrink-0 items-center justify-center rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {isSearchPending && (
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                  <span>検索中</span>
                </div>
              )}
              {searchApiError && (
                <div className="mb-2 space-y-1">
                  <p className="whitespace-pre-line text-xs text-amber-600">
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
                <div className="max-h-96 overflow-y-auto rounded-xl border border-border p-1.5">
                  <div className="grid grid-cols-3 gap-1.5">
                    {searchResults.slice(0, visibleCount).map((item) => (
                      <div
                        key={item.id}
                        className="relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm"
                      >
                        <div className="relative aspect-square w-full bg-muted">
                          <CosmeImage
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-contain"
                            sizes="160px"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => handleAddFromSearch(item)}
                            aria-label="リストに追加"
                            className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-all hover:bg-primary/90 active:scale-90"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="px-2 py-1.5">
                          {item.brand && (
                            <p className="truncate text-[9px] font-semibold text-primary leading-tight">
                              {item.brand}
                            </p>
                          )}
                          <h3 className="line-clamp-4 text-[11px] font-medium leading-snug text-foreground">
                            {item.name}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" /> 読み込み中...</>
                    ) : (
                      "もっと見る"
                    )}
                  </button>
                </div>
              )}
              <div className="mt-5 rounded-xl border border-dashed border-border/80 bg-muted/30 p-4">
                <p className="mb-1 text-center text-xs font-medium text-muted-foreground">手動で追加する</p>
                <p className="mb-4 text-center text-[10px] text-muted-foreground/70">※手動で追加したコスメは収益化対象外です</p>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-card-foreground">
                      <Package className="mr-1 inline h-4 w-4" />
                      商品名 <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      placeholder="例：グリーンティーシード ヒアルロン セラム"
                      className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                  {sectionType === "products" && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-card-foreground">価格</label>
                        <input
                          type="text"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="¥3,410"
                          className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-card-foreground">バッジ</label>
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
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-card-foreground">
                      <LinkIcon className="mr-1 inline h-4 w-4" />
                      商品リンク <span className="text-xs font-normal text-muted-foreground">（任意）</span>
                    </label>
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="例：https://example.com/product"
                      className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-card-foreground">
                      <ImageIcon className="mr-1 inline h-4 w-4" />
                      商品画像 <span className="text-xs font-normal text-muted-foreground">（任意）</span>
                    </label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                      {imageUploading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />アップロード中...</>
                      ) : imagePreview || image ? (
                        <>
                          <img src={imagePreview || image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                          <span className="text-foreground">画像を変更する</span>
                        </>
                      ) : (
                        <><ImageIcon className="h-4 w-4" />写真フォルダから選択</>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFile}
                        className="hidden"
                        disabled={imageUploading}
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    追加
                  </button>
                </div>
              </div>
                </form>
          ) : null}
        </div>
      </div>

      {processingTarget && (
        <ImageProcessingModal
          // key を invocationId に紐付けることで、+ ボタンを押すたびに
          // 必ず新インスタンスとしてマウントし直す。これにより、前回の
          // useEffect クリーンアップ漏れや stale な Promise / closure が
          // 次のコスメに影響することを完全に防ぐ。
          key={processingTarget.invocationId}
          isOpen={true}
          sourceUrl={processingTarget.source}
          onCancel={handleProcessingCancel}
          // target をクロージャで束縛して onConfirm に渡す。
          // 処理結果と「どのコスメ向けの結果か」を必ず一致させるため、
          // state ではなくこの target を直接 handleProcessedImage に渡す。
          onConfirm={(dataUrl) => handleProcessedImage(dataUrl, processingTarget)}
        />
      )}
    </div>
  );
}
