import type { MetadataRoute } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cosmepik.me";

async function getPublicUsernames(): Promise<string[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=username&limit=1000`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const rows: { username: string }[] = await res.json();
    return rows.map((r) => r.username).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const usernames = await getPublicUsernames();
  const profilePages: MetadataRoute.Sitemap = usernames.map((u) => ({
    url: `${SITE_URL}/${u}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...profilePages];
}
