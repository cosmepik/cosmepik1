import { fetchPublicPageData } from "@/lib/supabase-fetch";
import { generateThemeVars, getFontLinkUrl } from "@/lib/theme-css";
import { PublicPageSSR } from "@/components/public/PublicPageSSR";
import { AffiliateClickHandler } from "@/components/public/AffiliateClickHandler";
import { AnalyticsBeacon } from "@/components/public/AnalyticsBeacon";
import { checkPremiumByUsername } from "@/lib/premium-server";

export const revalidate = 60;

type Props = { params: Promise<{ username: string }> };

export default async function PublicPageByUsername({ params }: Props) {
  const { username } = await params;
  const [{ profile, sections }, isPremium] = await Promise.all([
    fetchPublicPageData(username),
    checkPremiumByUsername(username),
  ]);
  const themeVars = generateThemeVars(profile);
  const fontUrl = getFontLinkUrl(profile);

  const lightSections = sections.map((s) => {
    if (s.type !== "recipe" || !s.backgroundImage) return s;
    const bg = s.backgroundImage;
    if (bg.startsWith("http://") || bg.startsWith("https://")) return s;
    return { ...s, backgroundImage: "API" };
  });

  return (
    <>
      {fontUrl && <link rel="stylesheet" href={fontUrl} />}
      <AnalyticsBeacon username={username} />
      <AffiliateClickHandler slug={username} userAffiliateId={profile?.rakutenAffiliateId} />
      <PublicPageSSR
        username={username}
        profile={profile}
        sections={lightSections}
        themeVars={themeVars}
        isPremium={isPremium}
      />
    </>
  );
}
