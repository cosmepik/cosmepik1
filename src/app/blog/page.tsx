import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/AppHeader";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 60;

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
  try {
    const admin = createAdminClient();
    if (!admin) return [];
    const { data } = await admin
      .from("blog_posts")
      .select("id, title, category, thumbnail_url, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });
    return (data as BlogPost[]) ?? [];
  } catch {
    return [];
  }
}

export default async function BlogListPage() {
  const posts = await fetchAllPosts();

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "#f5f0e8",
        backgroundImage: "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(#e5e5e5 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
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
