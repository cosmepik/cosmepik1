import { NextRequest, NextResponse } from "next/server";
import type { CosmeItem } from "@/types";

const RAKUTEN_API_URL =
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601";

/**
 * 楽天市場商品検索API（Ichiba Item Search）のレスポンス型
 */
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
    imgUrls[0] ?? "https://placehold.co/96x96/f2ebe3/c9a962?text=No+Image";
  return {
    id,
    name: item.itemName ?? "（商品名なし）",
    brand: item.shopName ?? "",
    category: item.genreName ?? "",
    imageUrl,
    rakutenUrl: item.affiliateUrl ?? item.itemUrl ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  const appId = process.env.RAKUTEN_APPLICATION_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;

  if (!appId || !accessKey) {
    return NextResponse.json(
      { error: "楽天APIが設定されていません。RAKUTEN_APPLICATION_ID と RAKUTEN_ACCESS_KEY を .env.local に設定してください。" },
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

  const params = new URLSearchParams({
    applicationId: appId,
    accessKey,
    keyword,
    format: "json",
    formatVersion: "2",
    hits: String(hits),
  });

  try {
    const res = await fetch(`${RAKUTEN_API_URL}?${params}`, {
      headers: { Accept: "application/json" },
    });

    const data: RakutenResponse = await res.json();

    if (!res.ok) {
      const msg = data.error_description ?? data.error ?? "楽天APIでエラーが発生しました";
      console.error("[Rakuten API]", res.status, msg, data);
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    if (data.error) {
      return NextResponse.json(
        {
          error: data.error_description ?? data.error,
        },
        { status: 400 }
      );
    }

    const rawItems: RakutenItem[] = [];
    if (Array.isArray(data.Items)) {
      rawItems.push(...data.Items.map((x) => x.Item).filter(Boolean));
    } else if (Array.isArray(data.items)) {
      rawItems.push(...data.items);
    }

    const items = rawItems.map(mapToCosmeItem);

    return NextResponse.json({ items });
  } catch (e) {
    console.error("Rakuten API error:", e);
    return NextResponse.json(
      { error: "楽天APIへの接続に失敗しました" },
      { status: 500 }
    );
  }
}
