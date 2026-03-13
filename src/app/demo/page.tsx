import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchProfile, fetchSections } from "@/lib/supabase-db";
import { PublicPageClient } from "../[username]/PublicPageClient";

export default async function DemoPage() {
  const username = "demo";

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
