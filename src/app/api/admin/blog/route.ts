import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = "cosmepik.team@gmail.com";

async function verifyAdmin() {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase に接続できません", status: 500 };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です", status: 401 };
  if (user.email !== ADMIN_EMAIL) return { error: "管理者のみ実行できます", status: 403 };
  return { user };
}

/** 公開記事の一覧取得（認証不要） */
export async function GET(request: NextRequest) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "DB接続エラー" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "1";

  let query = admin
    .from("blog_posts")
    .select("id, title, body, thumbnail_url, category, published, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (!all) {
    query = query.eq("published", true);
  } else {
    const auth = await verifyAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}

/** 記事の新規作成（管理者のみ） */
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "DB接続エラー" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      title: body.title.trim(),
      body: body.body?.trim() ?? "",
      thumbnail_url: body.thumbnailUrl?.trim() || null,
      category: body.category?.trim() || "特集",
      published: body.published ?? false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

/** 記事の更新（管理者のみ） */
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "DB接続エラー" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.id) {
    return NextResponse.json({ error: "IDは必須です" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.body !== undefined) updates.body = body.body;
  if (body.thumbnailUrl !== undefined) updates.thumbnail_url = body.thumbnailUrl?.trim() || null;
  if (body.category !== undefined) updates.category = body.category.trim();
  if (body.published !== undefined) updates.published = body.published;

  const { data, error } = await admin
    .from("blog_posts")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

/** 記事の削除（管理者のみ） */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "DB接続エラー" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "IDは必須です" }, { status: 400 });
  }

  const { error } = await admin.from("blog_posts").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
