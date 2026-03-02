import { createClient } from "@supabase/supabase-js";

/**
 * サーバー専用。SUPABASE_SERVICE_ROLE_KEY がある場合のみ使用。
 * 退会時に auth.users からユーザーを削除するために使用。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
