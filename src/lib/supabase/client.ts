import { createBrowserClient } from "@supabase/ssr";

let _cached: ReturnType<typeof createBrowserClient> | null | undefined;

export function createClient() {
  if (_cached !== undefined) return _cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    _cached = null;
    return null;
  }
  _cached = createBrowserClient(url, key, {
    auth: {
      lock: async <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => fn(),
    },
  });
  return _cached;
}
