import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchProfile, fetchSections } from "@/lib/supabase-db";
import { PublicPageClient } from "./PublicPageClient";

export const revalidate = 30;

type Props = { params: Promise<{ username: string }> };

export default async function PublicPageByUsername({ params }: Props) {
  const { username } = await params;

  let profile = null;
  let sections: Awaited<ReturnType<typeof fetchSections>> = [];

  if (isSupabaseConfigured) {
    [profile, sections] = await Promise.all([
      fetchProfile(username),
      fetchSections(username),
    ]);
  }

  return (
    <PublicPageClient
      username={username}
      profile={profile}
      sections={sections ?? []}
    />
  );
}
