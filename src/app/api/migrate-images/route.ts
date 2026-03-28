import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "images";

/**
 * 既存の Base64 画像を Supabase Storage に移行する管理用エンドポイント。
 * Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY> で保護。
 * GET /api/migrate-images で実行。
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    !serviceKey ||
    !authHeader ||
    authHeader !== `Bearer ${serviceKey}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client not available" }, { status: 503 });
  }

  const stats = { avatars: 0, wallpapers: 0, recipes: 0, errors: 0 };

  // --- 1. アバター画像 ---
  const { data: profiles } = await admin
    .from("profiles")
    .select("username, avatar_url")
    .like("avatar_url", "data:%");

  for (const p of profiles ?? []) {
    try {
      const url = await uploadBase64(admin, p.avatar_url, `avatars/${p.username}`, "avatar");
      if (url) {
        await admin.from("profiles").update({ avatar_url: url }).eq("username", p.username);
        stats.avatars++;
      }
    } catch (e) {
      console.error(`[migrate] avatar ${p.username}:`, e);
      stats.errors++;
    }
  }

  // --- 2. 壁紙画像 ---
  const { data: wallpapers } = await admin
    .from("profiles")
    .select("username, background_image_url")
    .like("background_image_url", "data:%");

  for (const p of wallpapers ?? []) {
    try {
      const url = await uploadBase64(admin, p.background_image_url, `wallpapers/${p.username}`, "bg");
      if (url) {
        await admin.from("profiles").update({ background_image_url: url }).eq("username", p.username);
        stats.wallpapers++;
      }
    } catch (e) {
      console.error(`[migrate] wallpaper ${p.username}:`, e);
      stats.errors++;
    }
  }

  // --- 3. レシピ背景画像 ---
  const { data: sectionRows } = await admin
    .from("sections")
    .select("username, sections_json");

  for (const row of sectionRows ?? []) {
    const sections = row.sections_json as Array<Record<string, unknown>> | null;
    if (!Array.isArray(sections)) continue;

    let modified = false;
    for (const s of sections) {
      if (s.type !== "recipe") continue;
      const bg = s.backgroundImage as string | undefined;
      if (!bg || !bg.startsWith("data:")) continue;
      try {
        const url = await uploadBase64(admin, bg, `recipe/${row.username}`, `bg-${Date.now()}`);
        if (url) {
          s.backgroundImage = url;
          modified = true;
          stats.recipes++;
        }
      } catch (e) {
        console.error(`[migrate] recipe ${row.username}:`, e);
        stats.errors++;
      }
    }

    if (modified) {
      await admin
        .from("sections")
        .update({ sections_json: sections, updated_at: new Date().toISOString() })
        .eq("username", row.username);
    }
  }

  return NextResponse.json({ success: true, stats });
}

async function uploadBase64(
  admin: ReturnType<typeof createAdminClient>,
  dataUrl: string,
  folder: string,
  filename: string,
): Promise<string | null> {
  if (!admin || !dataUrl.startsWith("data:")) return null;

  const mimeMatch = dataUrl.match(/^data:(image\/\w+);base64,/);
  if (!mimeMatch) return null;
  const contentType = mimeMatch[1];
  const ext = contentType.split("/")[1] || "jpeg";

  const base64 = dataUrl.split(",")[1];
  const bytes = Buffer.from(base64, "base64");

  const path = `${folder}/${filename}.${ext}`;

  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType,
    upsert: true,
    cacheControl: "public, max-age=31536000",
  });

  if (error) {
    console.error(`[migrate upload] ${path}:`, error.message);
    return null;
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
