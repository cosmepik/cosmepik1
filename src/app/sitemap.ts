import type { MetadataRoute } from "next";
import type { Section } from "@/lib/sections";
import { countCosmeItems, THIN_PROFILE_THRESHOLD } from "@/lib/profile-seo";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
// service role があれば下書き含めず正確に published のみ取れる。なければ anon で取得（RLSで published のみ可視のはず）。
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cosmepik.me";

/**
 * sitemap に出すユーザー名を取得する。
 * AdSense「有用性の低いコンテンツ」対策として、コスメ件数が閾値未満の
 * 「中身の薄いプロフィール」は除外する（Google にクロールさせない）。
 *
 * sections テーブルから一括取得し、JS 側で件数をカウントしてフィルタする。
 */
async function getPublicUsernames(): Promise<string[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/sections?select=username,sections_json&limit=2000`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];
    const rows: { username: string; sections_json: Section[] | null }[] = await res.json();
    const usernames: string[] = [];
    for (const r of rows) {
      if (!r.username) continue;
      if (!Array.isArray(r.sections_json) || r.sections_json.length === 0) continue;
      if (countCosmeItems(r.sections_json) < THIN_PROFILE_THRESHOLD) continue;
      usernames.push(r.username);
    }
    return usernames;
  } catch {
    return [];
  }
}

/**
 * 公開済みのブログ記事を取得。SEO対策の要であり、
 * 1) Google にクロールしてもらうため確実にサイトマップに含める
 * 2) lastModified は created_at（updated_at が無いため）を使用
 */
async function getBlogPosts(): Promise<{ id: string; created_at: string }[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?published=eq.true&select=id,created_at&order=created_at.desc&limit=1000`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    return (await res.json()) as { id: string; created_at: string }[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // sitemap には「Google にインデックスしてほしい価値のあるページ」だけを載せる。
  // 認証系（/login, /register 等）は robots.txt で Disallow しているので含めない。
  // 代わりに案内・法務・問い合わせなど、コンテンツとして有用なページを追加して
  // サイト全体の充実度を Google に伝える。
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/guide/rakuten-affiliate`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/price`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/tokushoho`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [usernames, blogPosts] = await Promise.all([
    getPublicUsernames(),
    getBlogPosts(),
  ]);

  const profilePages: MetadataRoute.Sitemap = usernames.map((u) => ({
    url: `${SITE_URL}/${u}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...profilePages, ...blogPages];
}
