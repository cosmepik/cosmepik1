import { NextRequest, NextResponse } from "next/server";
import { generateAffiliateLink } from "@/utils/affiliate";

/**
 * 楽天アフィリエイト・レベニューシェアの動作確認用デバッグAPI
 *
 * GET /api/affiliate/debug?check=env
 *   → 環境変数の設定状況を返す
 *
 * GET /api/affiliate/debug?itemUrl=...&userAffiliateId=...&slug=...
 *   → アフィリエイトリンク生成の結果を返す（実際のクリックは発生しない）
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const check = searchParams.get("check");
  const itemUrl = searchParams.get("itemUrl");
  const userAffiliateId = searchParams.get("userAffiliateId")?.trim() || null;
  const slug = searchParams.get("slug")?.trim() || null;

  const adminId = process.env.NEXT_PUBLIC_ADMIN_RAKUTEN_ID?.trim() || "";
  const userRate =
    parseFloat(process.env.NEXT_PUBLIC_USER_REVENUE_SHARE_RATE || "0.6") || 0.6;

  if (check === "env") {
    return NextResponse.json({
      ok: true,
      adminIdSet: !!adminId,
      adminIdPreview: adminId ? `${adminId.slice(0, 4)}***` : null,
      userRate,
    });
  }

  if (!itemUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "itemUrl パラメータが必要です。例: ?itemUrl=https://item.rakuten.co.jp/...",
      },
      { status: 400 }
    );
  }

  const { url, usedId } = generateAffiliateLink(userAffiliateId, itemUrl);

  return NextResponse.json({
    ok: true,
    generatedUrl: url,
    usedId,
    userAffiliateId: userAffiliateId ?? null,
    adminIdSet: !!adminId,
    userRate,
    slug: slug ?? null,
  });
}
