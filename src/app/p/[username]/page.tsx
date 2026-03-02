"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getProfileByUsername } from "@/lib/store";
import { PublicProfileContent } from "@/components/PublicProfileContent";
import { SectionProvider } from "@/lib/section-context";
import type { InfluencerProfile } from "@/types";

/**
 * ファン向け公開ページ（ユーザーが共有リンクで見る用）
 * プレビュー用の「戻る」「公開」ボタン等は一切表示しない。
 */
export default function PublicPageByUsername() {
  const params = useParams();
  const username = (params?.username as string) ?? "demo";

  const [profile, setProfile] = useState<InfluencerProfile | null>(null);

  useEffect(() => {
    getProfileByUsername(username).then(setProfile);
  }, [username]);

  // 簡易アナリティクス: 閲覧数を1増やす（クライアントで1回だけ）
  useEffect(() => {
    fetch(`/api/analytics/view?username=${encodeURIComponent(username)}`, {
      method: "POST",
    }).catch(() => {});
  }, [username]);

  return (
    <SectionProvider slug={username}>
      <PublicProfileContent username={username} profile={profile} />
    </SectionProvider>
  );
}
