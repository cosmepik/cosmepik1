import { ImageResponse } from "next/og";
import { fetchProfile } from "@/lib/supabase-db";

export const runtime = "edge";
export const alt = "cosmepik - コスメプロフィール";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim() || "demo";

  let displayName = "cosmepik";
  let avatarUrl: string | null = null;
  let items: { imageUrl: string }[] = [];

  try {
    const profile = await fetchProfile(username);
    if (profile) {
      displayName = profile.displayName?.trim() || `@${username}`;
      avatarUrl = profile.avatarUrl || null;
      items = (profile.list || []).slice(0, 6).map((item) => ({ imageUrl: item.imageUrl }));
    }
  } catch {
    // use defaults
  }

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
          padding: 48,
        }}
      >
        {/* 左: プロフィール */}
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
          <div
            style={{
              fontSize: 24,
              color: "#1a6b66",
            }}
          >
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
    ),
    { ...size }
  );
}
