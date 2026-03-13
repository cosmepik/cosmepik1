import { fetchPublicPageData } from "@/lib/supabase-fetch";
import { PublicPageClient } from "./PublicPageClient";

export const revalidate = 86400;

type Props = { params: Promise<{ username: string }> };

export default async function PublicPageByUsername({ params }: Props) {
  const { username } = await params;
  const { profile, sections } = await fetchPublicPageData(username);

  return (
    <PublicPageClient
      username={username}
      profile={profile}
      sections={sections}
    />
  );
}
