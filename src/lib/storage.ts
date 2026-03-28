import { createClient } from "@/lib/supabase/client";

const BUCKET = "images";

function getPublicUrl(path: string): string {
  const supabase = createClient();
  if (!supabase) {
    return "";
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * data:image/... 形式の Base64 を Supabase Storage にアップロードし、
 * 公開 URL を返す。失敗時は元の dataUrl をそのまま返す（フォールバック）。
 */
export async function uploadImage(
  dataUrl: string,
  folder: string,
  filename: string,
): Promise<string> {
  if (!dataUrl.startsWith("data:")) return dataUrl;

  const supabase = createClient();
  if (!supabase) return dataUrl;

  const mimeMatch = dataUrl.match(/^data:(image\/\w+);base64,/);
  if (!mimeMatch) return dataUrl;
  const contentType = mimeMatch[1];
  const ext = contentType.split("/")[1] || "jpeg";

  const base64 = dataUrl.split(",")[1];
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const path = `${folder}/${filename}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType,
    upsert: true,
    cacheControl: "public, max-age=31536000",
  });

  if (error) {
    console.error("[Storage upload]", error.message);
    return dataUrl;
  }

  return getPublicUrl(path);
}

/** URLがSupabase StorageのURLか判定 */
export function isStorageUrl(url: string): boolean {
  return url.includes("/storage/v1/object/public/");
}
