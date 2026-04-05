import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 60;

interface BlogPost {
  id: string;
  title: string;
  body: string;
  thumbnail_url: string | null;
  category: string;
  published: boolean;
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

async function fetchPost(id: string): Promise<BlogPost | null> {
  try {
    const admin = createAdminClient();
    if (!admin) return null;
    const { data } = await admin
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .single();
    return data as BlogPost | null;
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ id: string }> };

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await fetchPost(id);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-white">
      <AppHeader>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          トップページ
        </Link>
      </AppHeader>

      <article className="mx-auto max-w-2xl px-4 py-8">
        {/* Category + Date */}
        <div className="mb-4 flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
            style={{ background: catColor(post.category) }}
          >
            {post.category}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-6 text-xl font-bold leading-snug text-foreground sm:text-2xl">
          {post.title}
        </h1>

        {/* Thumbnail */}
        {post.thumbnail_url && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
        )}

        {/* Body */}
        <div className="prose prose-sm max-w-none text-foreground">
          {post.body.split("\n").map((line, i) => (
            <p key={i} className={line.trim() === "" ? "h-4" : "mb-4 leading-relaxed"}>
              {line}
            </p>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-12 border-t border-border pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            ← トップページに戻る
          </Link>
        </div>
      </article>
    </main>
  );
}
