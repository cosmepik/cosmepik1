import { NextRequest, NextResponse } from "next/server";
import type { CosmeItem } from "@/types";
import { sanitizeItemName, toKatakanaForApi, toHiraganaForApi } from "@/lib/search-normalize";

/**
 * 楽天市場商品検索API（Ichiba Item Search）- 商品価格ナビ変更前のシンプルな検索
 * @see https://webservice.rakuten.co.jp/documentation/ichiba-item-search
 */
const RAKUTEN_API_URL =
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601";

interface RakutenItem {
  itemCode?: string;
  itemName?: string;
  itemUrl?: string;
  affiliateUrl?: string;
  smallImageUrls?: string[];
  mediumImageUrls?: string[];
  genreName?: string;
  shopName?: string;
}

interface RakutenResponse {
  Items?: { Item: RakutenItem }[];
  items?: RakutenItem[];
  error?: string;
  error_description?: string;
}

function mapToCosmeItem(item: RakutenItem, index: number): CosmeItem {
  const id = item.itemCode ?? `rakuten-${index}`;
  const imgUrls = item.mediumImageUrls ?? item.smallImageUrls ?? [];
  const imageUrl =
    (Array.isArray(imgUrls) ? imgUrls[0] : undefined) ??
    "https://placehold.co/96x96/f2ebe3/c9a962?text=No+Image";
  const rawName = item.itemName ?? "（商品名なし）";
  return {
    id,
    name: sanitizeItemName(typeof rawName === "string" ? rawName : ""),
    brand: "", // ブランド名取得は難しいため非表示
    category: item.genreName ?? "",
    imageUrl: typeof imageUrl === "string" ? imageUrl : "https://placehold.co/96x96/f2ebe3/c9a962?text=No+Image",
    rakutenUrl: item.affiliateUrl ?? item.itemUrl ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  const appId = process.env.RAKUTEN_APPLICATION_ID?.trim();
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim();

  if (!appId) {
    return NextResponse.json(
      {
        items: [],
        error: "RAKUTEN_APPLICATION_ID が未設定です。",
      },
      { status: 503 }
    );
  }

  if (!accessKey) {
    return NextResponse.json(
      {
        items: [],
        error: "RAKUTEN_ACCESS_KEY が未設定です。楽天デベロッパーズで Access Key を取得してください。",
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword")?.trim();
  const hits = Math.min(
    Math.max(parseInt(searchParams.get("hits") ?? "20", 10), 1),
    30
  );

  if (!keyword || keyword.length < 2) {
    return NextResponse.json(
      { error: "キーワードは2文字以上で入力してください" },
      { status: 400 }
    );
  }

  // ひらがな・カタカナ両方で検索してヒット率向上
  const katakanaKw = toKatakanaForApi(keyword);
  const hiraganaKw = toHiraganaForApi(keyword);
  const keywords: string[] = [keyword];
  if (katakanaKw !== keyword) keywords.push(katakanaKw);
  if (hiraganaKw !== keyword && hiraganaKw !== katakanaKw) keywords.push(hiraganaKw);
  const searchKeyword = [...new Set(keywords)].join(" ");

  const params = new URLSearchParams({
    applicationId: appId,
    accessKey,
    keyword: searchKeyword,
    format: "json",
    formatVersion: "2",
    hits: String(hits),
    orFlag: "1", // 複数キーワードをOR検索
    field: "0", // 広い検索（より多くのヒットを優先）
  });

  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID?.trim();
  if (affiliateId) params.set("affiliateId", affiliateId);

  // 新楽天API（openapi）は Origin / Referer が必須。403 回避のため設定
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.rakuten.co.jp";
  const headers: HeadersInit = {
    Accept: "application/json",
    Origin: origin,
    Referer: origin + "/",
    "User-Agent": "Cosmetree/1.0",
  };

  async function fetchApi(keywordParam: string): Promise<{ data: RakutenResponse; res: Response }> {
    const p = new URLSearchParams(params);
    p.set("keyword", keywordParam);
    const res = await fetch(`${RAKUTEN_API_URL}?${p}`, { headers });
    const data: RakutenResponse = await res.json().catch(() => ({}));
    return { data, res };
  }

  try {
    let { data, res } = await fetchApi(searchKeyword);

    // 0件なら元のキーワードのみで再検索（OR検索が厳しすぎる場合のフォールバック）
    if (res.ok && !data.error) {
      const rawItems: RakutenItem[] = [];
      if (Array.isArray(data.Items)) {
        rawItems.push(...data.Items.map((x) => x.Item).filter(Boolean));
      } else if (Array.isArray(data.items)) {
        for (const x of data.items) {
          const item = (x as { item?: RakutenItem }).item ?? (x as RakutenItem);
          if (item && (item.itemName || item.itemCode)) rawItems.push(item);
        }
      }
      if (rawItems.length === 0 && keywords.length > 1) {
        const fallback = await fetchApi(keyword);
        data = fallback.data;
        res = fallback.res;
      }
    }

    if (!res.ok) {
      const msg =
        data.error_description ?? data.error ?? `楽天APIエラー (HTTP ${res.status})`;
      console.error("[Rakuten API]", res.status, msg);
      return NextResponse.json(
        { items: [], error: String(msg) },
        { status: res.status }
      );
    }

    if (data.error) {
      return NextResponse.json(
        {
          items: [],
          error: data.error_description ?? data.error ?? "",
        },
        { status: 400 }
      );
    }

    const rawItems: RakutenItem[] = [];
    if (Array.isArray(data.Items)) {
      rawItems.push(...data.Items.map((x) => x.Item).filter(Boolean));
    } else if (Array.isArray(data.items)) {
      for (const x of data.items) {
        const item = (x as { item?: RakutenItem }).item ?? (x as RakutenItem);
        if (item && (item.itemName || item.itemCode)) {
          rawItems.push(item);
        }
      }
    }

    const items = rawItems.map(mapToCosmeItem);

    return NextResponse.json({ items });
  } catch (e) {
    console.error("Rakuten API error:", e);
    return NextResponse.json(
      { items: [], error: "楽天APIへの接続に失敗しました" },
      { status: 500 }
    );
  }
}
