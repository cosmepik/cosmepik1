import { ImageResponse } from "next/og";
import { fetchProfile } from "@/lib/supabase-db";

export const runtime = "edge";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

async function fetchRecipeBgUrl(username: string): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/sections?username=eq.${encodeURIComponent(username)}&select=sections_json`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const sections = rows[0]?.sections_json;
    if (!Array.isArray(sections)) return null;
    const recipe = sections.find((s: { type?: string }) => s.type === "recipe");
    const bg = recipe?.backgroundImage as string | undefined;
    if (bg && (bg.startsWith("http://") || bg.startsWith("https://"))) return bg;
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim() || "demo";

  let displayName = "cosmepik";
  let avatarUrl: string | null = null;
  let items: { imageUrl: string }[] = [];
  let recipeBgUrl: string | null = null;

  try {
    const [profile, bgUrl] = await Promise.all([
      fetchProfile(username),
      fetchRecipeBgUrl(username),
    ]);
    if (profile) {
      displayName = profile.displayName?.trim() || `@${username}`;
      avatarUrl = profile.avatarUrl || null;
      items = (profile.list || []).slice(0, 6).map((item) => ({ imageUrl: item.imageUrl }));
    }
    recipeBgUrl = bgUrl;
  } catch {
    // use defaults
  }

  const hasRecipe = !!recipeBgUrl;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #9de0d8 0%, #b8eae4 40%, #e0f7f5 100%)",
        }}
      >
        {hasRecipe ? (
          <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", alignItems: "center" }}>
            {/* 左: プロフィール */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                width: 480,
                padding: 40,
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  width={120}
                  height={120}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                    color: "#0d4f4a",
                  }}
                >
                  {(displayName || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#0d4f4a",
                  maxWidth: 380,
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName} さんのメイクレシピ
              </div>
              <div style={{ display: "flex", fontSize: 20, color: "#1a6b66" }}>
                @{username}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#0d4f4a",
                  opacity: 0.7,
                }}
              >
                cosmepik
              </div>
            </div>
            {/* 右: レシピ背景画像（センタークロップ） */}
            <div
              style={{
                display: "flex",
                width: 720,
                height: 630,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img
                src={recipeBgUrl!}
                alt=""
                width={720}
                height={630}
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", alignItems: "center", justifyContent: "space-between", padding: 48 }}>
            {/* 左: プロフィール（既存レイアウト） */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  width={160}
                  height={160}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 64,
                    color: "#0d4f4a",
                  }}
                >
                  {(displayName || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#0d4f4a",
                  maxWidth: 320,
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </div>
              <div style={{ display: "flex", fontSize: 24, color: "#1a6b66" }}>
                @{username}
              </div>
            </div>

            {/* 右: コスメグリッド */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 16,
                width: 520,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {items.length > 0 ? (
                items.map((item, i) => (
                  <img
                    key={i}
                    src={item.imageUrl}
                    alt=""
                    width={140}
                    height={140}
                    style={{
                      borderRadius: 16,
                      objectFit: "cover",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                      border: "2px solid rgba(255,255,255,0.8)",
                    }}
                  />
                ))
              ) : (
                <div
                  style={{
                    display: "flex",
                    fontSize: 22,
                    color: "#1a6b66",
                    textAlign: "center",
                  }}
                >
                  愛用コスメをチェック
                </div>
              )}
            </div>

            {/* ロゴ */}
            <div
              style={{
                display: "flex",
                position: "absolute",
                bottom: 32,
                right: 48,
                fontSize: 20,
                fontWeight: 600,
                color: "#0d4f4a",
              }}
            >
              cosmepik
            </div>
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
