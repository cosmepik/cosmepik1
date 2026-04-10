import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";

export const revalidate = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

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
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${encodeURIComponent(id)}&published=eq.true&select=id,title,body,thumbnail_url,category,published,created_at`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/vnd.pgrst.object+json",
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as BlogPost;
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ id: string }> };

const COSMEPIK_URL_RE = /^https?:\/\/cosmepik\.me\/(?:p\/)?([a-zA-Z0-9_-]+)\s*$/;
const BODY_IMAGE_RE = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/;
const URL_RE = /(https?:\/\/[^\s]+)/g;

function renderLineWithLinks(text: string): React.ReactNode {
  const parts = text.split(URL_RE);
  if (parts.length === 1) return text;
  return parts.map((part, j) =>
    URL_RE.test(part) ? (
      <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all hover:text-primary/80">
        {part}
      </a>
    ) : (
      <span key={j}>{part}</span>
    ),
  );
}

interface EmbedProfile {
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
}

async function fetchProfileLight(username: string): Promise<EmbedProfile | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=username,display_name,avatar_url,bio`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/vnd.pgrst.object+json",
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.username) return null;
    return {
      username: d.username,
      displayName: d.display_name || d.username,
      avatarUrl: d.avatar_url || undefined,
      bio: d.bio || undefined,
    };
  } catch {
    return null;
  }
}

async function resolveEmbeds(body: string): Promise<Map<string, EmbedProfile>> {
  const lines = body.split("\n");
  const usernames = new Set<string>();
  for (const line of lines) {
    const m = line.trim().match(COSMEPIK_URL_RE);
    if (m) usernames.add(m[1]);
  }
  const map = new Map<string, EmbedProfile>();
  await Promise.all(
    [...usernames].map(async (u) => {
      const profile = await fetchProfileLight(u);
      if (profile) map.set(u, profile);
    }),
  );
  return map;
}

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await fetchPost(id);
  if (!post) notFound();

  const embeds = await resolveEmbeds(post.body);

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

      <article className="mx-auto max-w-2xl px-4 py-8">
        {/* Category + Date */}
        <div className="mb-4 flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
            style={{ background: catColor(post.category) }}
          >
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-6 text-xl font-bold leading-snug text-foreground sm:text-2xl">
          {post.title}
        </h1>

        {/* Thumbnail */}
        {post.thumbnail_url && (
          <div className="relative mx-auto mb-8 aspect-square w-2/3 overflow-hidden rounded-xl">
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
          {post.body.split("\n").map((line, i) => {
            const trimmed = line.trim();
            const imgMatch = trimmed.match(BODY_IMAGE_RE);
            if (imgMatch) {
              return (
                <div key={i} className="my-4">
                  <Image src={imgMatch[2]} alt={imgMatch[1] || ""} width={672} height={448} className="rounded-xl" style={{ width: "100%", height: "auto" }} />
                </div>
              );
            }
            const m = trimmed.match(COSMEPIK_URL_RE);
            if (m) {
              const profile = embeds.get(m[1]);
              if (profile) {
                return (
                  <Link
                    key={i}
                    href={`/${profile.username}`}
                    className="not-prose my-4 flex items-center gap-3 rounded-2xl bg-white p-4 no-underline shadow-sm transition-all hover:shadow-md"
                    style={{ border: "1.5px solid #eee" }}
                  >
                    {profile.avatarUrl ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                        <Image src={profile.avatarUrl} alt="" fill className="object-cover" sizes="56px" />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pink-50 text-lg">
                        👤
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground">{profile.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{profile.username}</p>
                      {profile.bio && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{profile.bio}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-white">
                      メイクレシピを見る
                    </span>
                  </Link>
                );
              }
            }
            if (trimmed.startsWith("## ")) {
              return <h2 key={i} className="mb-3 mt-8 text-lg font-bold text-foreground">{trimmed.slice(3)}</h2>;
            }
            if (trimmed.startsWith("### ")) {
              return <h3 key={i} className="mb-2 mt-6 text-base font-bold text-foreground">{trimmed.slice(4)}</h3>;
            }
            return (
              <p key={i} className={trimmed === "" ? "h-4" : "mb-4 leading-relaxed"}>
                {renderLineWithLinks(line)}
              </p>
            );
          })}
        </div>

        {/* Back links */}
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            ← トップページに戻る
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            #cosmepik編集部一覧へ
          </Link>
        </div>
      </article>
    </main>
  );
}
