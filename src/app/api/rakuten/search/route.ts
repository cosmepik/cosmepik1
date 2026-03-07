import { NextRequest, NextResponse } from "next/server";
import type { CosmeItem } from "@/types";

const RAKUTEN_API_URL =
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20170706";

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
  errors?: { errorCode?: number; errorMessage?: string };
}

function toImageUrl(val: unknown): string | undefined {
  if (typeof val === "string" && val.startsWith("http")) return val;
  if (val && typeof val === "object" && "imageUrl" in val && typeof (val as { imageUrl: string }).imageUrl === "string") {
    return (val as { imageUrl: string }).imageUrl;
  }
  return undefined;
}

function extractBrand(itemName?: string, shopName?: string): string {
  if (!itemName && shopName) return shopName;
  if (!itemName) return "";

  let name = itemName.trim();

  while (true) {
    const brackets =
      (name.startsWith("【") && name.indexOf("】") > 0) ||
      (name.startsWith("[") && name.indexOf("]") > 0);
    if (!brackets) break;
    const end =
      name.startsWith("【") && name.indexOf("】") > 0
        ? name.indexOf("】")
        : name.indexOf("]");
    name = name.slice(end + 1).trim();
  }

  const separators = ["　", " ", "｜", "|", "／", "/"];
  let cut = name.length;
  for (const sep of separators) {
    const i = name.indexOf(sep);
    if (i > 0 && i < cut) cut = i;
  }

  const brand = name.slice(0, cut).trim();
  if (brand) return brand;
  if (shopName) return shopName;
  return "";
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
    brand: extractBrand(item.itemName, item.shopName),
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

  const params = new URLSearchParams({
    applicationId: appId,
    accessKey,
    keyword,
    genreId: "100939", // 美容・コスメ・香水
    format: "json",
    hits: String(hits),
  });

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
    const res = await fetch(`${RAKUTEN_API_URL}?${params}`, { headers });

    const rawText = await res.text();
    let data: RakutenResponse & { [key: string]: unknown };
    try {
      data = JSON.parse(rawText) as RakutenResponse & { [key: string]: unknown };
    } catch {
      data = {};
      console.error("[Rakuten API] レスポンスがJSONではありません", res.status, rawText.slice(0, 500));
    }

    const errorsObj = data.errors as { errorCode?: number; errorMessage?: string } | undefined;
    const errMsgFromErrors = errorsObj?.errorMessage;

    if (!res.ok) {
      const msg =
        data.error_description ??
        data.error ??
        errMsgFromErrors ??
        `楽天APIエラー (HTTP ${res.status})`;
      console.error("[Rakuten API]", res.status, msg);
      return NextResponse.json(
        { items: [], error: String(msg) },
        { status: res.status }
      );
    }

    if (data.error) {
      const errMsg = data.error_description ?? data.error ?? "";
      return NextResponse.json(
        { items: [], error: String(errMsg) },
        { status: 400 }
      );
    }

    const rawItems: RakutenItem[] = [];
    if (Array.isArray(data.Items)) {
      rawItems.push(...data.Items.map((x) => x.Item).filter(Boolean));
    } else if (Array.isArray(data.items)) {
      rawItems.push(
        ...data.items.map((x: { item?: RakutenItem; itemName?: string }) =>
          (x as { item?: RakutenItem }).item ?? (x as RakutenItem)
        )
      );
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
