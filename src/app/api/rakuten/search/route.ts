import { NextRequest, NextResponse } from "next/server";
import type { CosmeItem } from "@/types";
import { cleanseItemName } from "@/lib/search-normalize";

const PRODUCT_API_URL =
  "https://openapi.rakuten.co.jp/ichibaproduct/api/Product/Search/20250801";
const ICHIBA_API_URL =
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601";

/* ─── 楽天 Product/Search レスポンス型 ─── */

interface RakutenProduct {
  productId?: string;
  productName?: string;
  brandName?: string;
  genreName?: string;
  productUrlPC?: string;
  affiliateUrl?: string;
  mediumImageUrl?: string;
  smallImageUrl?: string;
  janCode?: string;
  productCode?: string;
  reviewAverage?: number;
}

/* ─── 楽天 IchibaItem/Search レスポンス型 ─── */

interface RakutenItem {
  itemCode?: string;
  itemName?: string;
  itemUrl?: string;
  affiliateUrl?: string;
  smallImageUrls?: (string | { imageUrl?: string })[];
  mediumImageUrls?: (string | { imageUrl?: string })[];
  smallImageUrl?: string;
  mediumImageUrl?: string;
  genreName?: string;
  shopName?: string;
}

/* ─── ヘルパー ─── */

function toImageUrl(val: unknown): string | undefined {
  if (typeof val === "string" && val.startsWith("http")) return val;
  if (
    val &&
    typeof val === "object" &&
    "imageUrl" in val &&
    typeof (val as { imageUrl: string }).imageUrl === "string"
  ) {
    return (val as { imageUrl: string }).imageUrl;
  }
  return undefined;
}

function upgradeImageSize(url: string): string {
  let u = url.replace(/^http:\/\//, "https://");
  u = u.replace(/_ex=\d+x\d+/, "_ex=300x300");
  return u;
}

const PLACEHOLDER_IMG =
  "https://placehold.co/96x96/f2ebe3/c9a962?text=No+Image";

/* ─── マッパー ─── */

function mapProduct(p: RakutenProduct, idx: number): CosmeItem & { _jan?: string } {
  const raw = (p.mediumImageUrl ?? p.smallImageUrl ?? PLACEHOLDER_IMG)
    .replace(/^http:\/\//, "https://");
  const rakutenUrl =
    (p.affiliateUrl && p.affiliateUrl.startsWith("http") ? p.affiliateUrl : null) ||
    (p.productUrlPC && p.productUrlPC.startsWith("http") ? p.productUrlPC : null) ||
    `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(p.productName ?? "")}/?l-id=cosmetree`;
  return {
    id: p.productId ?? `product-${idx}`,
    name: cleanseItemName(p.productName ?? "") || p.productName || "（商品名なし）",
    brand: p.brandName ?? "",
    category: p.genreName ?? "",
    imageUrl: upgradeImageSize(raw),
    rakutenUrl,
    _jan: p.productCode ?? p.janCode ?? undefined,
  };
}

function mapIchibaItem(item: RakutenItem, idx: number): CosmeItem & { _jan?: string } {
  const imgUrls = item.mediumImageUrls ?? item.smallImageUrls ?? [];
  const first = imgUrls[0];
  const imgSingle = item.mediumImageUrl ?? item.smallImageUrl;
  const rawUrl =
    toImageUrl(first) ??
    (typeof imgSingle === "string" ? imgSingle : undefined) ??
    PLACEHOLDER_IMG;

  const rawName = item.itemName ?? "";
  const rakutenUrl =
    (item.affiliateUrl && item.affiliateUrl.startsWith("http") ? item.affiliateUrl : null) ||
    (item.itemUrl && item.itemUrl.startsWith("http") ? item.itemUrl : null) ||
    `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(item.itemName ?? "")}/?l-id=cosmetree`;

  return {
    id: item.itemCode ?? `ichiba-${idx}`,
    name: cleanseItemName(rawName) || rawName || "（商品名なし）",
    brand: "",
    category: item.genreName ?? "",
    imageUrl: upgradeImageSize(rawUrl),
    rakutenUrl,
    _jan: undefined,
  };
}

/* ─── 重複排除 ─── */

function dedup(items: (CosmeItem & { _jan?: string })[]): CosmeItem[] {
  const seen = new Set<string>();
  const result: CosmeItem[] = [];
  for (const item of items) {
    const janKey = item._jan ? `jan:${item._jan}` : null;
    const nameKey = `name:${(item.brand + item.name).replace(/\s+/g, "").toLowerCase()}`;
    if (janKey && seen.has(janKey)) continue;
    if (seen.has(nameKey)) continue;
    if (janKey) seen.add(janKey);
    seen.add(nameKey);
    const { _jan: _, ...clean } = item;
    result.push(clean);
  }
  return result;
}

const COSME_GENRES = /コスメ|美容|化粧|香水|スキンケア|ヘアケア|ボディケア|メイク|ネイル|日焼け|UV|シャンプー|トリートメント|洗顔|クレンジング|美容液|乳液|化粧水|フェイスケア|リップ|アイ|ファンデ|下地|パウダー|チーク|マスカラ|コンシーラー|ハンドクリーム|ボディソープ|入浴剤|デオドラント|脱毛|除毛|コンタクト|カラコン/;

/* ─── API 呼び出し ─── */

function buildHeaders(): HeadersInit {
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.rakuten.co.jp";
  return {
    Accept: "application/json",
    Origin: origin,
    Referer: origin + "/",
    "User-Agent": "Cosmetree/1.0",
  };
}

async function fetchProducts(
  appId: string,
  accessKey: string,
  keyword: string,
  hits: number,
  retry = true,
): Promise<(CosmeItem & { _jan?: string })[]> {
  try {
    const params = new URLSearchParams({
      applicationId: appId,
      accessKey,
      keyword,
      format: "json",
      formatVersion: "2",
      hits: String(hits),
    });
    const affiliateId = process.env.RAKUTEN_AFFILIATE_ID?.trim();
    if (affiliateId) params.set("affiliateId", affiliateId);
    const res = await fetch(`${PRODUCT_API_URL}?${params}`, {
      headers: buildHeaders(),
    });
    if (res.status === 429 && retry) {
      await new Promise((r) => setTimeout(r, 1100));
      return fetchProducts(appId, accessKey, keyword, hits, false);
    }
    if (!res.ok) {
      console.warn("[Product/Search] HTTP", res.status);
      return [];
    }
    const data = await res.json().catch(() => ({}));
    let products: RakutenProduct[] = [];
    if (Array.isArray(data?.Products)) {
      products = data.Products.map(
        (p: RakutenProduct | { Product?: RakutenProduct }) =>
          "productName" in p ? p : (p as { Product?: RakutenProduct }).Product,
      ).filter(Boolean);
    }
    const mapped = products.map(mapProduct);
    const filtered = mapped.filter(
      (item) => item.category && COSME_GENRES.test(item.category),
    );
    return filtered;
  } catch (e) {
    console.error("[Product/Search] error:", e);
    return [];
  }
}

async function fetchIchibaItems(
  appId: string,
  accessKey: string,
  keyword: string,
  hits: number,
  retry = true,
): Promise<(CosmeItem & { _jan?: string })[]> {
  try {
    const params = new URLSearchParams({
      applicationId: appId,
      accessKey,
      keyword,
      format: "json",
      formatVersion: "2",
      hits: String(hits),
      sort: "standard",
    });
    const affiliateId = process.env.RAKUTEN_AFFILIATE_ID?.trim();
    if (affiliateId) params.set("affiliateId", affiliateId);
    const res = await fetch(`${ICHIBA_API_URL}?${params}`, {
      headers: buildHeaders(),
    });
    if (res.status === 429 && retry) {
      await new Promise((r) => setTimeout(r, 1100));
      return fetchIchibaItems(appId, accessKey, keyword, hits, false);
    }
    if (!res.ok) {
      console.warn("[IchibaItem/Search] HTTP", res.status);
      return [];
    }
    const data = await res.json().catch(() => ({}));

    const rawItems: RakutenItem[] = [];
    if (Array.isArray(data?.Items)) {
      for (const x of data.Items) {
        const item = x?.Item ?? x;
        if (item) rawItems.push(item);
      }
    }
    return rawItems.map(mapIchibaItem);
  } catch (e) {
    console.error("[IchibaItem/Search] error:", e);
    return [];
  }
}

/* ─── フォールバックキーワード生成 ─── */

function relaxKeyword(kw: string): string | null {
  const stripped = kw.replace(/\d{1,4}$/g, "").replace(/[#＃No.no.]+\d*/g, "").trim();
  if (stripped !== kw && stripped.length >= 2) return stripped;

  const words = kw.split(/\s+/);
  if (words.length >= 2) {
    const shorter = words.slice(0, -1).join(" ");
    if (shorter.length >= 2) return shorter;
  }

  return null;
}

/* ─── 検索実行 ─── */

async function searchRakuten(
  productAppId: string,
  productAccessKey: string,
  appId: string,
  accessKey: string,
  keyword: string,
  hits: number,
): Promise<(CosmeItem & { _jan?: string })[]> {
  const [products, ichibaItems] = await Promise.all([
    fetchProducts(productAppId, productAccessKey, keyword, hits),
    fetchIchibaItems(appId, accessKey, keyword, hits),
  ]);
  console.log(`[Search] keyword="${keyword}" products=${products.length} ichiba=${ichibaItems.length}`);
  if (products.length >= 3) {
    return [...products, ...ichibaItems];
  }
  return [...ichibaItems, ...products];
}

/* ─── GET ハンドラ ─── */

export async function GET(request: NextRequest) {
  const appId = process.env.RAKUTEN_APPLICATION_ID?.trim();
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim();
  const productAppId = process.env.RAKUTEN_APPLICATION_ID_2?.trim() || appId;
  const productAccessKey = process.env.RAKUTEN_ACCESS_KEY_2?.trim() || accessKey;

  if (!appId) {
    return NextResponse.json(
      { items: [], error: "RAKUTEN_APPLICATION_ID が未設定です。" },
      { status: 503 },
    );
  }
  if (!accessKey) {
    return NextResponse.json(
      { items: [], error: "RAKUTEN_ACCESS_KEY が未設定です。" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword")?.trim();
  const hits = Math.min(
    Math.max(parseInt(searchParams.get("hits") ?? "10", 10), 1),
    30,
  );

  if (!keyword || keyword.length < 2) {
    return NextResponse.json(
      { error: "キーワードは2文字以上で入力してください" },
      { status: 400 },
    );
  }

  try {
    const MIN_RESULTS = 3;
    let merged = await searchRakuten(productAppId!, productAccessKey!, appId, accessKey, keyword, hits);

    if (dedup(merged).length < MIN_RESULTS) {
      const relaxed = relaxKeyword(keyword);
      if (relaxed) {
        await new Promise((r) => setTimeout(r, 300));
        const fallback = await searchRakuten(productAppId!, productAccessKey!, appId, accessKey, relaxed, hits);
        merged = [...merged, ...fallback];
        console.log(`[Search] fallback keyword="${relaxed}" +${fallback.length} items`);
      }
    }

    const unique = dedup(merged);
    const items = unique.slice(0, hits);

    return NextResponse.json({ items });
  } catch (e) {
    console.error("Rakuten API error:", e);
    return NextResponse.json(
      { items: [], error: "楽天APIへの接続に失敗しました" },
      { status: 500 },
    );
  }
}
