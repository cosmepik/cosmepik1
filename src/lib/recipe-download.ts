/**
 * メイクレシピキャンバスを画像（PNG）として保存するためのユーティリティ。
 *
 * 設計メモ:
 * - 画像化には `html-to-image` を使う。foreignObject ベースなので
 *   外部画像（Supabase Storage 等）も CORS が許可されていれば取り込める。
 * - 楽天の商品画像（thumbnail.image.rakuten.co.jp / r.r10s.jp 等）は
 *   CORS ヘッダが返らないため html-to-image の内部 fetch が失敗する。
 *   これを避けるため、画像化前にクロスオリジンの `<img>` を
 *   `/api/img-proxy` 経由で data URL に差し替えてから toBlob を呼ぶ。
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
 * 同一オリジン or data/blob はそのまま使えるので差し替え不要。
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

/**
 * 画像 URL を `/api/img-proxy` 経由で取得し、data URL 化する。
 * プロキシが許可していないホストの場合は upstream 502 が返るので
 * その場合は null を返してスキップさせる。
 */
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
 * 対象要素配下の `<img>` のうち、クロスオリジンのものを data URL に差し替える。
 * 戻り値は復元用クロージャ。
 */
async function inlineCrossOriginImages(root: HTMLElement): Promise<() => void> {
  const imgs = Array.from(root.querySelectorAll("img")) as HTMLImageElement[];
  const restore: Array<() => void> = [];

  // 同じ URL に対して二重 fetch しないよう簡易キャッシュ
  const cache = new Map<string, Promise<string | null>>();
  const getDataUrl = (src: string) => {
    if (!cache.has(src)) cache.set(src, fetchAsDataUrl(src));
    return cache.get(src)!;
  };

  await Promise.all(
    imgs.map(async (img) => {
      const original = img.getAttribute("src");
      if (!original || !isCrossOriginHttp(original)) return;
      const dataUrl = await getDataUrl(original);
      if (!dataUrl) return;

      // 差し替え後に画像のロード完了を待つ（data URL でも decode は非同期な実装あり）
      await new Promise<void>((resolve) => {
        const onDone = () => {
          img.removeEventListener("load", onDone);
          img.removeEventListener("error", onDone);
          resolve();
        };
        img.addEventListener("load", onDone, { once: true });
        img.addEventListener("error", onDone, { once: true });
        img.setAttribute("src", dataUrl);
        // 既にキャッシュされていて load イベントが発火しないケースに備えて
        // タイムアウトでも resolve する
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
        // ignore
      }
    }
  };
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

  // 動的 import でメイン bundle を膨らませない（保存ボタンが押されたときだけ読み込む）
  const { toBlob } = await import("html-to-image");

  // クロスオリジン画像を data URL に差し替え（楽天等の CORS 非対応ホスト対策）
  const restoreImages = await inlineCrossOriginImages(element);

  let blob: Blob | null = null;
  try {
    blob = await toBlob(element, {
      pixelRatio,
      cacheBust: false, // 上で data URL 化済みなのでキャッシュバスト不要
      backgroundColor: "#ffffff",
      // Google Fonts などクロスオリジンの <link rel="stylesheet"> から
      // cssRules を読もうとして SecurityError になるのを避ける。
      // 表示されているコメントのフォントは個別の style 属性で当たっているので
      // 画像にもそれなりに反映される（厳密に同じにならないトレードオフは許容）。
      skipFonts: true,
      // 編集UIや「ダウンロードボタンそのもの」を画像から除外
      filter: (node: HTMLElement) => {
        if (!(node instanceof HTMLElement)) return true;
        return node.dataset?.editorDecoration !== "1";
      },
    });
  } finally {
    restoreImages();
  }

  if (!blob) {
    return { ok: false, method: "download", error: new Error("画像生成に失敗しました") };
  }

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
      // ユーザーが共有シートをキャンセルした場合は成功扱いにする（エラー表示しない）
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
  } catch (err) {
    // 3) 最終フォールバック: 新しいタブで開く（iOS の古い Safari など）
    try {
      window.open(url, "_blank", "noopener");
      return { ok: true, method: "newtab" };
    } catch (err2) {
      const error = err2 instanceof Error ? err2 : new Error(String(err2));
      return { ok: false, method: "newtab", error };
    }
  } finally {
    // ある程度の時間が経ってから revoke（ダウンロードが進行中に消すと壊れる）
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}
