import { NextRequest, NextResponse } from "next/server";
import type { CosmeItem } from "@/types";

// 公式ドキュメント準拠: openapi.rakuten.co.jp（app.rakuten.co.jp は非推奨の可能性）
const RAKUTEN_API_URL =
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20170706";

/**
 * 楽天市場商品検索API（Ichiba Item Search）のレスポンス型
 */
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

interface RakutenResponse {
  Items?: { Item: RakutenItem }[];
  items?: RakutenItem[];
  error?: string;
  error_description?: string;
}

function toImageUrl(val: unknown): string | undefined {
  if (typeof val === "string" && val.startsWith("http")) return val;
  if (val && typeof val === "object" && "imageUrl" in val && typeof (val as { imageUrl: string }).imageUrl === "string") {
    return (val as { imageUrl: string }).imageUrl;
  }
  return undefined;
}

function mapToCosmeItem(item: RakutenItem, index: number): CosmeItem {
  const id = item.itemCode ?? `rakuten-${index}`;
  const imgUrls = item.mediumImageUrls ?? item.smallImageUrls ?? [];
  const first = imgUrls[0];
  const imgSingle = item.mediumImageUrl ?? item.smallImageUrl;
  const imageUrl =
    toImageUrl(first) ?? (typeof imgSingle === "string" ? imgSingle : undefined) ?? "https://placehold.co/96x96/f2ebe3/c9a962?text=No+Image";
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
  const appId = process.env.RAKUTEN_APPLICATION_ID?.trim();
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim();

  if (!appId) {
    return NextResponse.json(
      {
        items: [],
        error: "RAKUTEN_APPLICATION_ID が未設定です。Netlifyの環境変数に RAKUTEN_APPLICATION_ID を設定してください。",
        _debug: "サーバーで applicationId が取得できていません",
      },
      { status: 503 }
    );
  }

  if (!accessKey) {
    return NextResponse.json(
      {
        items: [],
        error:
          "RAKUTEN_ACCESS_KEY が未設定です。楽天API（openapi）では applicationId と accessKey の両方が必須です。Netlifyの環境変数に RAKUTEN_ACCESS_KEY を追加してください。楽天デベロッパーズの「Access Key」をコピーしてください。",
        _debug: { appIdSet: true, accessKeySet: false },
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

  const debugMode = searchParams.get("debug") === "1";

  const params = new URLSearchParams({
    applicationId: appId,
    keyword,
    genreId: "100939", // 美容・コスメ・香水
    format: "json",
    hits: String(hits),
  });
  if (accessKey) params.set("accessKey", accessKey);

  const headers: HeadersInit = { Accept: "application/json" };
  if (accessKey) {
    headers["Authorization"] = `Bearer ${accessKey}`;
  }

  try {
    const res = await fetch(`${RAKUTEN_API_URL}?${params}`, {
      headers,
    });

    const data: RakutenResponse = await res.json();

    if (!res.ok) {
      const msg = data.error_description ?? data.error ?? "楽天APIでエラーが発生しました";
      console.error("[Rakuten API]", res.status, msg, data);
      // applicationId 等の設定エラーはエラーメッセージを返す（原因追求のため）
      if (/applicationId|specify valid/i.test(String(msg))) {
        return NextResponse.json({
          items: [],
          error: `楽天API認証エラー: ${msg}`,
          _debug: { status: res.status, raw: String(msg) },
        }, { status: res.status });
      }
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    if (data.error) {
      const errMsg = data.error_description ?? data.error ?? "";
      return NextResponse.json(
        {
          items: [],
          error: `楽天API: ${errMsg}`,
          _debug: { error: data.error, error_description: data.error_description },
        },
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

    const body: { items: CosmeItem[]; _debug?: object } = { items };
    if (debugMode) {
      body._debug = {
        appIdSet: !!appId,
        accessKeySet: !!accessKey,
        rawItemCount: rawItems.length,
        apiUrl: RAKUTEN_API_URL,
      };
    }
    return NextResponse.json(body);
  } catch (e) {
    console.error("Rakuten API error:", e);
    const debugMode = searchParams.get("debug") === "1";
    const body: { error: string; _debug?: object } = {
      error: "楽天APIへの接続に失敗しました",
    };
    if (debugMode) {
      body._debug = {
        message: e instanceof Error ? e.message : String(e),
        appIdSet: !!appId,
      };
    }
    return NextResponse.json(body, { status: 500 });
  }
}
