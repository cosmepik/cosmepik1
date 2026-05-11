/**
 * メイクレシピキャンバスを画像（PNG）として保存するためのユーティリティ。
 *
 * 設計メモ:
 * - 画像化には `html-to-image` を使うが、これは内部的に DOM を SVG `foreignObject`
 *   に埋め込んでラスタライズする方式。iOS WebKit では大きな <img>（背景の顔写真等）
 *   や CORS 未対応の <img> が `foreignObject` 経由で「黙ってスキップ」される
 *   既知の不具合があり、PC では動くがモバイルだけ背景が白く落ちる現象が起きる。
 * - そこで合成ハイブリッド方式を採用:
 *     1) `data-recipe-background="1"` の <img>（背景）を一時的に hidden にする
 *     2) `html-to-image.toBlob` で「背景を除いた前景＋ロゴ」だけを透明背景でキャプチャ
 *     3) 自前で <canvas> を作り、まず背景を `drawImage` で object-fit:cover 風に塗り、
 *        その上に前景 PNG を `drawImage` して 1 枚に合成する
 * - 背景画像は `/api/img-proxy` 経由で blob として読み込むことで:
 *     a) Supabase / 楽天 等の cross-origin の CORS 問題から逃げる
 *     b) data URL ではなく blob URL を使うので foreignObject 経由でなく自前 canvas
 *        側でも tainted 化を回避できる
 * - 楽天の商品画像 <img>（前景）は従来どおり data URL 化して `html-to-image` に通す。
 *   こちらはサイズが小さく WebKit の foreignObject でも安定して描画される。
 * - 保存方法は次の優先順位で試す:
 *   1) Web Share API（`navigator.share` with files）→ iOS Safari の写真アプリ保存に最適
 *   2) `<a download>` 属性によるダウンロード → デスクトップ Chrome / Safari / Android
 *   3) 上記いずれも使えない / エラー時は new tab で開く（長押し保存）
 * - 編集中のUI（選択枠・削除ボタン等）は `data-editor-decoration="1"` を
 *   付けておけばこの関数で除外する。
 */

export interface DownloadRecipeOptions {
  /** ダウンロードファイル名（拡張子無し） */
  filename?: string;
  /** Web Share API のタイトル */
  shareTitle?: string;
  /** 画像化のピクセル比。Retina で綺麗にしたいので既定 2。 */
  pixelRatio?: number;
}

/**
 * URL がクロスオリジンかつ data:/blob: でないかを判定する。
 * 同一オリジン or data/blob/相対パス はそのまま使えるので差し替え不要。
 */
function isCrossOriginHttp(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("data:") || url.startsWith("blob:")) return false;
  if (url.startsWith("/")) return false;
  try {
    const u = new URL(url, window.location.href);
    return u.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/** 画像を <img> として読み込む（src は同一オリジン or data: or blob: 想定） */
function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

/**
 * 画像 URL を `/api/img-proxy` 経由で取得して blob URL にする。
 * - 同一オリジン化（CORS 解決）と canvas tainted 回避を兼ねる
 * - 失敗時は null
 *
 * 戻り値の `revoke` は呼び出し側が描画完了後に必ず呼ぶこと。
 */
async function fetchAsObjectUrl(
  url: string,
): Promise<{ objectUrl: string; revoke: () => void } | null> {
  try {
    const proxied = `/api/img-proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxied);
    if (!res.ok) return null;
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    return {
      objectUrl,
      revoke: () => URL.revokeObjectURL(objectUrl),
    };
  } catch {
    return null;
  }
}

/** 画像 URL を `/api/img-proxy` 経由で取得し、data URL 化する（前景 <img> 差し替え用）。 */
async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const proxied = `/api/img-proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxied);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error ?? new Error("FileReader error"));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * 対象要素配下の <img> のうち、クロスオリジンのものを data URL に差し替える。
 * 戻り値は復元用クロージャ。背景 <img> は別経路で扱うため除外する。
 */
async function inlineCrossOriginForegroundImages(root: HTMLElement): Promise<() => void> {
  const imgs = Array.from(root.querySelectorAll("img")) as HTMLImageElement[];
  const restore: Array<() => void> = [];

  const cache = new Map<string, Promise<string | null>>();
  const getDataUrl = (src: string) => {
    if (!cache.has(src)) cache.set(src, fetchAsDataUrl(src));
    return cache.get(src)!;
  };

  await Promise.all(
    imgs.map(async (img) => {
      // 背景画像はキャプチャから外して別 canvas に合成するのでスキップ
      if (img.dataset?.recipeBackground === "1") return;

      const original = img.getAttribute("src");
      if (!original || !isCrossOriginHttp(original)) return;
      const dataUrl = await getDataUrl(original);
      if (!dataUrl) return;

      await new Promise<void>((resolve) => {
        const onDone = () => {
          img.removeEventListener("load", onDone);
          img.removeEventListener("error", onDone);
          resolve();
        };
        img.addEventListener("load", onDone, { once: true });
        img.addEventListener("error", onDone, { once: true });
        img.setAttribute("src", dataUrl);
        setTimeout(onDone, 1500);
      });

      restore.push(() => {
        img.setAttribute("src", original);
      });
    }),
  );

  return () => {
    for (const r of restore) {
      try {
        r();
      } catch {
        /* ignore */
      }
    }
  };
}

/** object-fit: cover を canvas で再現して drawImage する */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
): void {
  const sw = img.naturalWidth;
  const sh = img.naturalHeight;
  if (!sw || !sh) return;
  const ratio = Math.max(dw / sw, dh / sh);
  const drawW = sw * ratio;
  const drawH = sh * ratio;
  const drawX = dx + (dw - drawW) / 2;
  const drawY = dy + (dh - drawH) / 2;
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

/**
 * 背景 <img> を取得し、proxy 経由で同一オリジンの blob URL として読み直した HTMLImageElement を返す。
 * 同一オリジン or data/blob URL の場合はそのまま <img> から読む。
 */
async function loadBackgroundForCompositing(
  bgImg: HTMLImageElement,
): Promise<{ image: HTMLImageElement; cleanup: () => void } | null> {
  const src = bgImg.getAttribute("src");
  if (!src) return null;

  if (isCrossOriginHttp(src)) {
    const proxied = await fetchAsObjectUrl(src);
    if (!proxied) return null;
    try {
      const image = await loadImageElement(proxied.objectUrl);
      return { image, cleanup: proxied.revoke };
    } catch {
      proxied.revoke();
      return null;
    }
  }

  try {
    const image = await loadImageElement(src);
    return { image, cleanup: () => {} };
  } catch {
    return null;
  }
}

/**
 * 指定の DOM 要素を PNG 画像化してユーザーの端末に保存させる。
 * モバイル（特に iOS）では `navigator.share` を優先して写真アプリへの保存を促す。
 */
export async function downloadRecipeImage(
  element: HTMLElement,
  options: DownloadRecipeOptions = {},
): Promise<{ ok: boolean; method: "share" | "download" | "newtab"; error?: Error }> {
  const {
    filename = `cosmepik-recipe-${Date.now()}`,
    shareTitle = "メイクレシピ",
    pixelRatio = 2,
  } = options;

  const { toBlob } = await import("html-to-image");

  // 1) 背景 <img> を識別。iOS WebKit の foreignObject 不具合を避けるため
  //    背景は別 canvas に焼く。
  const bgImg = element.querySelector<HTMLImageElement>(
    'img[data-recipe-background="1"]',
  );

  // 2) 前景の cross-origin <img>（楽天サムネ等）を data URL に差し替え
  const restoreForegroundImages = await inlineCrossOriginForegroundImages(element);

  // 3) 背景画像を canvas 用に proxy 経由でロード
  let bgLoaded: { image: HTMLImageElement; cleanup: () => void } | null = null;
  if (bgImg) {
    bgLoaded = await loadBackgroundForCompositing(bgImg);
  }

  // 4) キャプチャ中は背景 <img> を hidden にして、前景＋ロゴだけ取得する
  const bgPrevVisibility = bgImg ? bgImg.style.visibility : null;
  if (bgImg) bgImg.style.visibility = "hidden";

  // 5) backdrop-filter を持つ要素を一時的に無効化する。
  //    html-to-image の SVG foreignObject 経路では backdrop-filter が
  //    テキストを含むレイヤーをオフスクリーン合成するため、ラベルのテキストが
  //    ぼやける。キャプチャ時だけ無効化することで、画面表示と同じシャープさを保つ。
  //    bg-black/40 の半透明背景は残るので外観上の変化はほぼない。
  type BackdropRestoreEntry = { el: HTMLElement; prev: string };
  const backdropRestoreList: BackdropRestoreEntry[] = [];
  element.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const computed = window.getComputedStyle(el).backdropFilter;
    if (computed && computed !== "none") {
      backdropRestoreList.push({ el, prev: el.style.backdropFilter });
      el.style.backdropFilter = "none";
      el.style.setProperty("-webkit-backdrop-filter", "none");
    }
  });

  let fgBlob: Blob | null = null;
  try {
    fgBlob = await toBlob(element, {
      pixelRatio,
      cacheBust: false,
      // 透明背景で出力。最終合成時に背景画像をその下に敷く。
      backgroundColor: undefined,
      // クロスオリジン <link rel="stylesheet"> から cssRules を読み SecurityError を避ける
      skipFonts: true,
      filter: (node: HTMLElement) => {
        if (!(node instanceof HTMLElement)) return true;
        return node.dataset?.editorDecoration !== "1";
      },
    });
  } finally {
    if (bgImg && bgPrevVisibility !== null) {
      bgImg.style.visibility = bgPrevVisibility;
    }
    for (const { el, prev } of backdropRestoreList) {
      el.style.backdropFilter = prev;
      el.style.setProperty("-webkit-backdrop-filter", prev);
    }
    restoreForegroundImages();
  }

  if (!fgBlob) {
    bgLoaded?.cleanup();
    return { ok: false, method: "download", error: new Error("画像生成に失敗しました") };
  }

  // 5) 自前 canvas に「背景 → 前景」の順で合成
  let finalBlob: Blob | null;
  let fgObjectUrl: string | null = null;
  try {
    const rect = element.getBoundingClientRect();
    const W = Math.max(1, Math.round(rect.width * pixelRatio));
    const H = Math.max(1, Math.round(rect.height * pixelRatio));
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context unavailable");

    // 背景画像のスケーリングと前景キャプチャの drawImage 補間を高品質に。
    // 明示しないとブラウザ既定（多くは "low" / "medium"）で甘くなる。
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    if (bgLoaded) {
      drawImageCover(ctx, bgLoaded.image, 0, 0, W, H);
    }

    fgObjectUrl = URL.createObjectURL(fgBlob);
    const fgImage = await loadImageElement(fgObjectUrl);
    ctx.drawImage(fgImage, 0, 0, W, H);

    finalBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png");
    });
  } catch (err) {
    return {
      ok: false,
      method: "download",
      error: err instanceof Error ? err : new Error(String(err)),
    };
  } finally {
    if (fgObjectUrl) URL.revokeObjectURL(fgObjectUrl);
    bgLoaded?.cleanup();
  }

  if (!finalBlob) {
    return { ok: false, method: "download", error: new Error("合成画像の生成に失敗しました") };
  }

  return await deliverBlob(finalBlob, filename, shareTitle);
}

/** 生成済み Blob をユーザー端末に届ける（share → download → newtab の順）。 */
async function deliverBlob(
  blob: Blob,
  filename: string,
  shareTitle: string,
): Promise<{ ok: boolean; method: "share" | "download" | "newtab"; error?: Error }> {
  const file = new File([blob], `${filename}.png`, { type: "image/png" });

  // 1) Web Share API（iOS で写真アプリに保存できる唯一の方法）
  if (typeof navigator !== "undefined" && typeof navigator.canShare === "function") {
    try {
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: shareTitle });
        return { ok: true, method: "share" };
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (error.name === "AbortError") {
        return { ok: true, method: "share" };
      }
      // それ以外はフォールバックに進む
    }
  }

  // 2) <a download> でダウンロード（デスクトップ・Android Chrome 等）
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return { ok: true, method: "download" };
  } catch {
    // 3) 最終フォールバック: 新しいタブで開く（iOS の古い Safari など）
    try {
      window.open(url, "_blank", "noopener");
      return { ok: true, method: "newtab" };
    } catch (err2) {
      const error = err2 instanceof Error ? err2 : new Error(String(err2));
      return { ok: false, method: "newtab", error };
    }
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}
