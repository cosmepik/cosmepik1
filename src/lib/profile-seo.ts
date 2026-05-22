/**
 * 公開プロフィールページの SEO メタデータと sitemap 出力可否を計算するユーティリティ。
 *
 * 背景:
 *   AdSense の「有用性の低いコンテンツ」判定対策。
 *   - これまでは全プロフィールが description = "愛用コスメをチェック" 固定で、
 *     Google から重複コンテンツ扱いされていた。
 *   - また、登録直後でコスメ 0〜数個のプロフィールも sitemap に出ていて、
 *     thin content として評価されていた。
 *
 * 設計:
 *   - 公開セクションからコスメアイテム数とブランドを抽出
 *   - プロフィールの bio / displayName / ブランド一覧をもとに動的 description を組み立て
 *   - コスメ < 3 のプロフィールは noindex（sitemap からも除外）
 */
import type { Metadata } from "next";
import type { Section } from "@/lib/sections";
import type { InfluencerProfile } from "@/types";

/** sitemap に出す & index させるための最低限のコスメ数 */
export const THIN_PROFILE_THRESHOLD = 3;

/** 公開セクションから実体のあるコスメアイテム数を数える */
export function countCosmeItems(sections: Section[] | null | undefined): number {
  if (!Array.isArray(sections)) return 0;
  let count = 0;
  for (const s of sections) {
    if (s.type === "recipe") {
      const placements = s.placements ?? [];
      count += placements.filter(
        (p) => p.type !== "comment" && (p.product || p.brand || p.image),
      ).length;
    } else if (Array.isArray(s.items)) {
      count += s.items.filter((i) => i.product || i.brand || i.image).length;
    }
  }
  return count;
}

/** ブランド名のユニークセット（出現順を保持） */
export function extractTopBrands(
  sections: Section[] | null | undefined,
  max = 3,
): string[] {
  if (!Array.isArray(sections)) return [];
  const set = new Set<string>();
  for (const s of sections) {
    if (s.type === "recipe") {
      for (const p of s.placements ?? []) {
        if (p.brand) set.add(p.brand);
      }
    } else {
      for (const i of s.items ?? []) {
        if (i.brand) set.add(i.brand);
      }
    }
    if (set.size >= max) break;
  }
  return Array.from(set).slice(0, max);
}

/** コスメが少なすぎる「中身の薄い」プロフィールか */
export function isThinProfile(sections: Section[] | null | undefined): boolean {
  return countCosmeItems(sections) < THIN_PROFILE_THRESHOLD;
}

/** description に流し込めるよう、bio から改行と過剰な空白を整える */
function normalizeBio(bio?: string | null): string {
  if (!bio) return "";
  return bio.replace(/\s+/g, " ").trim();
}

interface BuildOpts {
  username: string;
  profile: InfluencerProfile | null;
  sections: Section[];
  baseUrl: string;
  /** "/" or "/p/" など。先頭のスラッシュは含めること。 */
  pathPrefix?: string;
}

/**
 * 公開プロフィールページ用のメタデータを動的に組み立てる。
 *
 * - title / description はユーザー毎にユニークにする（重複コンテンツ回避）
 * - コスメ < 3 件のプロフィールは `robots: noindex, follow` を付ける
 */
export function buildProfileMetadata({
  username,
  profile,
  sections,
  baseUrl,
  pathPrefix = "/",
}: BuildOpts): Metadata {
  const cosmeCount = countCosmeItems(sections);
  const brands = extractTopBrands(sections, 3);
  const displayName = profile?.displayName?.trim() || username;
  const bio = normalizeBio(profile?.bio);

  // ── title ─────────────────────────────────────────────
  // displayName と username が同じ場合は片方だけ表示
  const titleSubject =
    displayName && displayName !== username
      ? `${displayName}（@${username}）`
      : `${username}さん`;
  const countPart = cosmeCount > 0 ? `愛用コスメ${cosmeCount}件` : "メイクのお気に入り";
  const title = `${titleSubject}のメイクレシピ・${countPart} | cosmepik`;

  // ── description ───────────────────────────────────────
  // 自己紹介があれば最優先。なければコスメ数・ブランドから組み立て。
  const head = bio
    ? bio.length > 80
      ? `${bio.slice(0, 80)}…`
      : bio
    : `${titleSubject}が cosmepik で公開しているメイクレシピと愛用コスメ${cosmeCount > 0 ? `${cosmeCount}件` : ""}。`;
  const brandPart =
    brands.length > 0 ? ` 主なブランド: ${brands.join("、")}。` : "";
  const tailParts: string[] = [];
  if (profile?.skinType) tailParts.push(`肌タイプ: ${profile.skinType}`);
  if (profile?.personalColor) tailParts.push(`パーソナルカラー: ${profile.personalColor}`);
  const tail =
    tailParts.length > 0
      ? ` ${tailParts.join(" / ")}。`
      : " 実際に使っているコスメをチェック。";
  const description = `${head}${brandPart}${tail}`.slice(0, 160);

  // ── URL ──────────────────────────────────────────────
  const url = `${baseUrl}${pathPrefix}${username}`;
  const ogImage = `${baseUrl}/api/og?username=${encodeURIComponent(username)}`;

  // ── 薄プロフィールは noindex ─────────────────────────
  // follow は許可しておき、サイト内リンクは引き続き Google に辿らせる。
  const thin = cosmeCount < THIN_PROFILE_THRESHOLD;

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [
      "メイクレシピ",
      username,
      ...(displayName !== username ? [displayName] : []),
      ...brands,
      "cosmepik",
      "コスメピック",
      "コスメ",
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: "cosmepik",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${displayName}のメイクレシピ` }],
      type: "profile",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: thin ? { index: false, follow: true } : undefined,
  };
}
