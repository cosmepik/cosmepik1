import { NextRequest, NextResponse } from "next/server";
import type { CosmeItem } from "@/types";

const RAKUTEN_API_URL =
  "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706";

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
  smallImageUrl?: string;
  mediumImageUrl?: string;
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
  const imgSingle = item.mediumImageUrl ?? item.smallImageUrl;
  const imageUrl =
    imgUrls[0] ?? imgSingle ?? "https://placehold.co/96x96/f2ebe3/c9a962?text=No+Image";
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

  if (!appId) {
    return NextResponse.json({ items: [] });
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
    keyword,
    genreId: "100939", // 美容・コスメ・香水
    format: "json",
    hits: String(hits),
  });
  if (accessKey) params.set("accessKey", accessKey);

  try {
    const res = await fetch(`${RAKUTEN_API_URL}?${params}`, {
      headers: { Accept: "application/json" },
    });

    const data: RakutenResponse = await res.json();

    if (!res.ok) {
      const msg = data.error_description ?? data.error ?? "楽天APIでエラーが発生しました";
      console.error("[Rakuten API]", res.status, msg, data);
      // applicationId 等の設定エラーは空で返し、フロントでモック表示
      if (/applicationId|specify valid/i.test(String(msg))) {
        return NextResponse.json({ items: [] });
      }
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    if (data.error) {
      const errMsg = data.error_description ?? data.error ?? "";
      if (/applicationId|specify valid/i.test(String(errMsg))) {
        return NextResponse.json({ items: [] });
      }
      return NextResponse.json(
        { error: errMsg },
        { status: 400 }
      );
    }

    const rawItems: RakutenItem[] = [];
    if (Array.isArray(data.Items)) {
      rawItems.push(...data.Items.map((x) => x.Item).filter(Boolean));
    } else if (Array.isArray(data.items)) {
      // formatVersion=2: flat items / formatVersion=1: items[].item
      rawItems.push(
        ...data.items.map((x: { item?: RakutenItem; itemName?: string }) =>
          x.item ?? x
        )
      );
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
