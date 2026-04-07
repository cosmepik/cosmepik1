import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchPublicPageData } from "@/lib/supabase-fetch";

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

const COSMEPIK_URL_RE = /^https?:\/\/cosmepik\.me\/(?:p\/)?([a-zA-Z0-9_-]+)\s*$/;
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
      try {
        const { profile } = await fetchPublicPageData(u);
        if (profile) {
          map.set(u, {
            username: profile.username,
            displayName: profile.displayName || profile.username,
            avatarUrl: profile.avatarUrl,
            bio: profile.bio,
          });
        }
      } catch {}
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
            const m = line.trim().match(COSMEPIK_URL_RE);
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
                      見る
                    </span>
                  </Link>
                );
              }
            }
            return (
              <p key={i} className={line.trim() === "" ? "h-4" : "mb-4 leading-relaxed"}>
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
