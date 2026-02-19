import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Supabase が設定されているか */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** ブラウザ用 Supabase クライアント（env が無いときは null） */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
