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
  const debug = searchParams.get("debug") === "1";
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

  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID?.trim();

  // 新楽天API（openapi）は Origin / Referer が必須。403 回避のため設定
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.rakuten.co.jp";
  const headers: HeadersInit = {
    Accept: "application/json",
    Origin: origin,
    Referer: origin + "/",
    "User-Agent": "Cosmetree/1.0",
  };

  function parseItems(data: RakutenResponse): RakutenItem[] {
    const raw: RakutenItem[] = [];
    if (Array.isArray(data.Items)) {
      raw.push(...data.Items.map((x) => x.Item).filter(Boolean));
    } else if (Array.isArray(data.items)) {
      for (const x of data.items) {
        const item = (x as { item?: RakutenItem }).item ?? (x as RakutenItem);
        if (item && (item.itemName || item.itemCode)) raw.push(item);
      }
    }
    return raw;
  }

  async function fetchApi(params: URLSearchParams): Promise<{ data: RakutenResponse; res: Response }> {
    const res = await fetch(`${RAKUTEN_API_URL}?${params}`, { headers });
    const data: RakutenResponse = await res.json().catch(() => ({}));
    return { data, res };
  }

  const katakanaKw = toKatakanaForApi(keyword);
  const hiraganaKw = toHiraganaForApi(keyword);
  const expandedKw = [keyword, katakanaKw, hiraganaKw]
    .filter((k) => k && k.trim())
    .filter((k, i, a) => a.indexOf(k) === i)
    .join(" ");

  // 複数戦略でフォールバック（0件なら次を試す）
  const strategies: { keyword: string; genreId?: string; orFlag?: string; field?: string; label: string }[] = [
    { keyword, genreId: "100939", label: "1. 美容・コスメ・香水ジャンル" },
    { keyword, label: "2. ジャンル指定なし" },
    ...(expandedKw !== keyword ? [{ keyword: expandedKw, orFlag: "1", field: "0", label: "3. ひらがなカタカナ展開" }] : []),
    ...(katakanaKw !== keyword ? [{ keyword: katakanaKw, label: "4. カタカナのみ" }] : []),
    ...(hiraganaKw !== keyword ? [{ keyword: hiraganaKw, label: "5. ひらがなのみ" }] : []),
  ];

  try {
    let data: RakutenResponse = {};
    let res: Response = new Response();
    let items: RakutenItem[] = [];
    let hitStrategy: string | null = null;

    for (const s of strategies) {
      const p = new URLSearchParams({
        applicationId: appId,
        accessKey,
        keyword: s.keyword,
        format: "json",
        formatVersion: "2",
        hits: String(hits),
      });
      if (s.genreId) p.set("genreId", s.genreId);
      if (s.orFlag) p.set("orFlag", s.orFlag);
      if (s.field) p.set("field", s.field);
      if (affiliateId) p.set("affiliateId", affiliateId);

      const result = await fetchApi(p);
      data = result.data;
      res = result.res;

      if (!res.ok || data.error) break;
      items = parseItems(data);
      if (items.length > 0) {
        hitStrategy = s.label;
        break;
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

    const cosmeItems = items.map(mapToCosmeItem);

    const body: { items: CosmeItem[]; _strategy?: string } = { items: cosmeItems };
    if (debug && hitStrategy) body._strategy = hitStrategy;

    return NextResponse.json(body);
  } catch (e) {
    console.error("Rakuten API error:", e);
    return NextResponse.json(
      { items: [], error: "楽天APIへの接続に失敗しました" },
      { status: 500 }
    );
  }
}
