import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/AppHeader";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cosmepik.me";

export const metadata: Metadata = {
  title: "#cosmepik編集部 - メイクレシピの作り方・コスメ情報",
  description:
    "cosmepik編集部がお届けするメイクレシピの作り方、おすすめコスメ、スキンケア情報。あなたのメイクをもっと楽しくするヒントが満載です。",
  keywords: [
    "メイクレシピ",
    "メイクレシピ 作り方",
    "メイクレシピ 共有",
    "コスメ",
    "スキンケア",
    "cosmepik",
    "コスメピック",
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "#cosmepik編集部 - メイクレシピの作り方・コスメ情報",
    description:
      "cosmepik編集部がお届けするメイクレシピの作り方、おすすめコスメ、スキンケア情報。",
    url: `${SITE_URL}/blog`,
    siteName: "cosmepik",
    type: "website",
  },
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  thumbnail_url: string | null;
  created_at: string;
}

const catColor = (cat: string) => {
  const map: Record<string, string> = {
    ビューティー: "#d94c7a",
    スキンケア: "#d94c7a",
    レシピ: "#d94c7a",
    コスメ: "#e87a50",
    特集: "#9b8ec4",
    連載: "#4a9ec4",
    収益化: "#e87a50",
    使い方: "#4ab894",
    新機能: "#9b8ec4",
  };
  return map[cat] || "#888";
};

async function fetchAllPosts(): Promise<BlogPost[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const url = `${SUPABASE_URL}/rest/v1/blog_posts?published=eq.true&select=id,title,category,thumbnail_url,created_at&order=created_at.desc`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return (await res.json()) as BlogPost[];
  } catch {
    return [];
  }
}

export default async function BlogListPage() {
  const posts = await fetchAllPosts();

  // ItemList の構造化データ。ブログ一覧が記事の集合体であることを Google に伝える。
  // 上位 20 件まで載せれば Google には十分。
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "#cosmepik編集部 記事一覧",
    itemListElement: posts.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${p.id}`,
      name: p.title,
    })),
  };

  // パンくず
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "#cosmepik編集部", item: `${SITE_URL}/blog` },
    ],
  };

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "#f5f0e8",
        backgroundImage: "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(#e5e5e5 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AppHeader />

      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold text-foreground">#cosmepik編集部</h1>

        {posts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">記事を準備中です</p>
        ) : (
          <div style={{ border: "1.5px dashed #333" }}>
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group flex items-center gap-3 px-3 py-2 transition-all hover:opacity-80"
                style={i > 0 ? { borderTop: "1.5px dashed #333" } : undefined}
              >
                {post.thumbnail_url ? (
                  <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg">
                    <Image src={post.thumbnail_url} alt="" fill className="object-cover" sizes="72px" />
                  </div>
                ) : (
                  <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-lg" style={{ background: "#f2c4d4" }}>
                    <span className="text-xl">📝</span>
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <span className="text-[11px] font-bold" style={{ color: catColor(post.category) }}>{post.category}</span>
                  <p className="mt-1 text-[13px] font-bold leading-[1.45] line-clamp-2 text-foreground">{post.title}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-border pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
