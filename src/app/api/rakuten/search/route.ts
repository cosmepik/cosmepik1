import { NextRequest, NextResponse } from "next/server";
import type { CosmeItem } from "@/types";
import { toKatakanaForApi, toHiraganaForApi } from "@/lib/search-normalize";

/**
 * 楽天プロダクト製品検索API（商品価格ナビ）
 * productName / brandName を公式データとして取得。商品コード(JAN)・製品IDで検索も可能。
 * @see https://webservice.rakuten.co.jp/documentation/ichiba-product-search
 */
const PRODUCT_API_URL =
  "https://openapi.rakuten.co.jp/ichibaproduct/api/Product/Search/20250801";

interface RakutenProduct {
  productId?: string;
  productCode?: string;
  productName?: string;
  brandName?: string;
  genreName?: string;
  smallImageUrl?: string;
  mediumImageUrl?: string;
  affiliateUrl?: string;
  productUrlPC?: string;
  productUrlMobile?: string;
}

interface ProductResponse {
  items?: RakutenProduct[] | { item: RakutenProduct }[];
  count?: number;
  error?: string;
  error_description?: string;
}

function toImageUrl(val: unknown): string | undefined {
  if (typeof val === "string" && val.startsWith("http")) return val;
  return undefined;
}

function mapProductToCosmeItem(p: RakutenProduct, index: number): CosmeItem {
  const id = p.productId ?? p.productCode ?? `product-${index}`;
  const imageUrl =
    toImageUrl(p.mediumImageUrl) ??
    toImageUrl(p.smallImageUrl) ??
    "https://placehold.co/96x96/f2ebe3/c9a962?text=No+Image";
  return {
    id,
    name: p.productName?.trim() || "（商品名なし）",
    brand: p.brandName?.trim() || "",
    category: p.genreName ?? "",
    imageUrl,
    rakutenUrl: p.affiliateUrl ?? p.productUrlPC ?? p.productUrlMobile ?? undefined,
  };
}

/** productId で重複を除外 */
function deduplicateByProductId(items: RakutenProduct[]): RakutenProduct[] {
  const seen = new Set<string>();
  return items.filter((p) => {
    const id = p.productId ?? p.productCode;
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export async function GET(request: NextRequest) {
  const appId = process.env.RAKUTEN_APPLICATION_ID?.trim();
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim();

  if (!appId) {
    return NextResponse.json(
      {
        items: [],
        error: "RAKUTEN_APPLICATION_ID が未設定です。",
        _debug: "サーバーで applicationId が取得できていません",
      },
      { status: 503 }
    );
  }

  if (!accessKey) {
    return NextResponse.json(
      {
        items: [],
        error: "RAKUTEN_ACCESS_KEY が未設定です。楽天デベロッパーズで Access Key を取得してください。",
        _debug: { appIdSet: true, accessKeySet: false },
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword")?.trim();
  const productCode = searchParams.get("productCode")?.trim(); // JANコードで検索
  const hits = Math.min(
    Math.max(parseInt(searchParams.get("hits") ?? "20", 10), 1),
    30
  );

  const hasKeyword = keyword && keyword.length >= 2;
  const hasProductCode = productCode && productCode.length >= 8;

  if (!hasKeyword && !hasProductCode) {
    return NextResponse.json(
      { error: "キーワードは2文字以上、または製品コード(JAN)を指定してください" },
      { status: 400 }
    );
  }

  const debugMode = searchParams.get("debug") === "1";

  const params = new URLSearchParams({
    applicationId: appId,
    accessKey,
    format: "json",
    formatVersion: "2", // フラット形式で productName, brandName を直接取得
    hits: String(hits),
  });

  if (hasProductCode) {
    params.set("productCode", productCode!);
  } else {
    // 広範囲でヒット：genreId は使わず、ひらがな・カタカナ両方を含めて OR 検索
    const katakanaKw = toKatakanaForApi(keyword!);
    const hiraganaKw = toHiraganaForApi(keyword!);
    const keywords: string[] = [keyword!];
    if (katakanaKw !== keyword) keywords.push(katakanaKw);
    if (hiraganaKw !== keyword && hiraganaKw !== katakanaKw) keywords.push(hiraganaKw);
    params.set("keyword", [...new Set(keywords)].join(" "));
    params.set("orFlag", "1"); // 複数キーワードを OR で検索
  }

  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID?.trim();
  if (affiliateId) params.set("affiliateId", affiliateId);

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.rakuten.co.jp";
  const headers: HeadersInit = {
    Accept: "application/json",
    Origin: origin,
    Referer: origin + "/",
    "User-Agent": "Cosmetree/1.0",
  };

  try {
    const res = await fetch(`${PRODUCT_API_URL}?${params}`, { headers });
    const rawText = await res.text();
    let data: ProductResponse & { [key: string]: unknown };
    try {
      data = JSON.parse(rawText) as ProductResponse & { [key: string]: unknown };
    } catch {
      data = {};
      console.error("[Rakuten Product API] JSON parse error", res.status, rawText.slice(0, 500));
    }

    if (!res.ok) {
      const msg =
        data.error_description ?? data.error ?? `楽天APIエラー (HTTP ${res.status})`;
      console.error("[Rakuten Product API]", res.status, msg);
      return NextResponse.json(
        {
          items: [],
          error: String(msg),
          _debug: debugMode ? { status: res.status, rawPreview: rawText.slice(0, 300) } : undefined,
        },
        { status: res.status }
      );
    }

    if (data.error) {
      return NextResponse.json(
        {
          items: [],
          error: data.error_description ?? data.error ?? "",
          _debug: debugMode ? data : undefined,
        },
        { status: 400 }
      );
    }

    let rawItems: RakutenProduct[] = [];
    const itemsData = data.items;
    if (Array.isArray(itemsData)) {
      for (const x of itemsData) {
        const item = (x as { item?: RakutenProduct }).item ?? (x as RakutenProduct);
        if (item && (item.productName || item.productId || item.productCode)) {
          rawItems.push(item);
        }
      }
    }

    rawItems = deduplicateByProductId(rawItems);
    const items = rawItems.map(mapProductToCosmeItem);

    const body: { items: CosmeItem[]; _debug?: object } = { items };
    if (debugMode) {
      body._debug = {
        appIdSet: !!appId,
        accessKeySet: !!accessKey,
        rawItemCount: rawItems.length,
        apiUrl: PRODUCT_API_URL,
      };
    }
    return NextResponse.json(body);
  } catch (e) {
    console.error("Rakuten Product API error:", e);
    return NextResponse.json(
      {
        error: "楽天APIへの接続に失敗しました",
        _debug: debugMode && e instanceof Error ? { message: e.message } : undefined,
      },
      { status: 500 }
    );
  }
}
