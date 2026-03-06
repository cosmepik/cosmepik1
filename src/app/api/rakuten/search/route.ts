import { NextRequest, NextResponse } from "next/server";
import type { CosmeItem } from "@/types";
import { toKatakanaForApi, toHiraganaForApi, sanitizeItemName } from "@/lib/search-normalize";

/**
 * 楽天市場商品検索API（Ichiba Item Search）
 * 楽天市場に出品されている商品を検索。商品価格ナビAPIより商品数が多く、コスメ検索に適しています。
 * @see https://webservice.rakuten.co.jp/documentation/ichiba-item-search
 */
const ICHIBA_ITEM_SEARCH_URL =
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601";

interface IchibaItem {
  itemCode?: string;
  itemName?: string;
  itemPrice?: number;
  itemUrl?: string;
  affiliateUrl?: string;
  smallImageUrls?: string[];
  mediumImageUrls?: string[];
  genreId?: string;
  genreName?: string;
  shopName?: string;
}

interface IchibaResponse {
  items?: IchibaItem[] | { item: IchibaItem }[];
  count?: number;
  error?: string;
  error_description?: string;
}

function toImageUrl(val: unknown): string | undefined {
  if (typeof val === "string" && val.startsWith("http")) return val;
  return undefined;
}

function getFirstImageUrl(item: IchibaItem): string | undefined {
  const urls = item.mediumImageUrls ?? item.smallImageUrls;
  if (Array.isArray(urls) && urls.length > 0) {
    return toImageUrl(urls[0]);
  }
  return undefined;
}

function mapItemToCosmeItem(item: IchibaItem, index: number): CosmeItem {
  const id = item.itemCode ?? `item-${index}`;
  const imageUrl =
    getFirstImageUrl(item) ??
    "https://placehold.co/96x96/f2ebe3/c9a962?text=No+Image";
  const rawName = item.itemName?.trim() || "（商品名なし）";
  return {
    id,
    name: sanitizeItemName(rawName),
    brand: "", // ブランド名取得は難しいため非表示
    category: item.genreName ?? "",
    imageUrl,
    rakutenUrl: item.affiliateUrl ?? item.itemUrl ?? undefined,
  };
}

/** itemCode で重複を除外 */
function deduplicateByItemCode(items: IchibaItem[]): IchibaItem[] {
  const seen = new Set<string>();
  return items.filter((p) => {
    const id = p.itemCode;
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
  const productCode = searchParams.get("productCode")?.trim(); // JANコード（Ichibaでは検索に使えないが、keywordとして渡す）
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
    formatVersion: "2",
    hits: String(hits),
  });

  // Ichiba Item Search は keyword 検索がメイン（JANは keyword として渡す）
  const searchKeyword = hasKeyword ? keyword! : productCode!;
  const katakanaKw = toKatakanaForApi(searchKeyword);
  const hiraganaKw = toHiraganaForApi(searchKeyword);
  const keywords: string[] = [searchKeyword];
  if (katakanaKw !== searchKeyword) keywords.push(katakanaKw);
  if (hiraganaKw !== searchKeyword && hiraganaKw !== katakanaKw) keywords.push(hiraganaKw);
  params.set("keyword", [...new Set(keywords)].join(" "));
  params.set("orFlag", "1");

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
    const res = await fetch(`${ICHIBA_ITEM_SEARCH_URL}?${params}`, { headers });
    const rawText = await res.text();
    let data: IchibaResponse & { [key: string]: unknown };
    try {
      data = JSON.parse(rawText) as IchibaResponse & { [key: string]: unknown };
    } catch {
      data = {};
      console.error("[Rakuten Ichiba API] JSON parse error", res.status, rawText.slice(0, 500));
    }

    if (!res.ok) {
      const msg =
        data.error_description ?? data.error ?? `楽天APIエラー (HTTP ${res.status})`;
      console.error("[Rakuten Ichiba API]", res.status, msg);
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

    let rawItems: IchibaItem[] = [];
    const itemsData = data.items;
    if (Array.isArray(itemsData)) {
      for (const x of itemsData) {
        const item = (x as { item?: IchibaItem }).item ?? (x as IchibaItem);
        if (item && (item.itemName || item.itemCode)) {
          rawItems.push(item);
        }
      }
    }

    rawItems = deduplicateByItemCode(rawItems);
    const items = rawItems.map(mapItemToCosmeItem);

    const body: { items: CosmeItem[]; _debug?: object } = { items };
    if (debugMode) {
      body._debug = {
        appIdSet: !!appId,
        accessKeySet: !!accessKey,
        rawItemCount: rawItems.length,
        apiUrl: ICHIBA_ITEM_SEARCH_URL,
      };
    }
    return NextResponse.json(body);
  } catch (e) {
    console.error("Rakuten Ichiba API error:", e);
    return NextResponse.json(
      {
        error: "楽天APIへの接続に失敗しました",
        _debug: debugMode && e instanceof Error ? { message: e.message } : undefined,
      },
      { status: 500 }
    );
  }
}
