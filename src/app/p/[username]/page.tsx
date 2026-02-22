"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { getProfileByUsername, getListByUsername } from "@/lib/store";
import { PublicProfileContent } from "@/components/PublicProfileContent";
import type { InfluencerProfile, ListedCosmeItem } from "@/types";

/**
 * ファン向け公開ページ（ユーザーが共有リンクで見る用）
 * プレビュー用の「戻る」「公開」ボタン等は一切表示しない。
 */
export default function PublicPageByUsername() {
  const params = useParams();
  const username = (params?.username as string) ?? "demo";

  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [list, setList] = useState<ListedCosmeItem[]>([]);

  useEffect(() => {
    getProfileByUsername(username).then(setProfile);
    getListByUsername(username).then(setList);
  }, [username]);

  const sortedList = useMemo(
    () => [...list].sort((a, b) => a.order - b.order),
    [list]
  );

  return (
    <PublicProfileContent
      username={username}
      profile={profile}
      sortedList={sortedList}
    />
  );
}
