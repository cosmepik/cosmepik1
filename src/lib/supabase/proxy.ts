import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const isProtectedRoute = (pathname: string) =>
  pathname.startsWith("/influencer") || pathname.startsWith("/dashboard");

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const hasDemoCookie = request.cookies.get("cosmepik_demo")?.value === "1";

  // LIFF 経由のアクセスはクライアント側で自動ログインするため許可
  const isLiffAccess =
    request.headers.get("user-agent")?.includes("Line/") ||
    request.nextUrl.searchParams.has("liff.state");

  if (
    !data.user &&
    !hasDemoCookie &&
    !isLiffAccess &&
    isProtectedRoute(request.nextUrl.pathname)
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
