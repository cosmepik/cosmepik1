import { fetchPublicPageData } from "@/lib/supabase-fetch";
import { generateThemeVars, getFontLinkUrl } from "@/lib/theme-css";
import { PublicPageSSR } from "@/components/public/PublicPageSSR";
import { AffiliateClickHandler } from "@/components/public/AffiliateClickHandler";
import { AnalyticsBeacon } from "@/components/public/AnalyticsBeacon";
import { checkPremiumByUsername } from "@/lib/premium-server";

export const revalidate = 60;

type Props = { params: Promise<{ username: string }> };

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const [{ profile, sections }, isPremium] = await Promise.all([
    fetchPublicPageData(username),
    checkPremiumByUsername(username),
  ]);
  const themeVars = generateThemeVars(profile);
  const fontUrl = getFontLinkUrl(profile);

  return (
    <>
      {fontUrl && <link rel="stylesheet" href={fontUrl} />}
      <style dangerouslySetInnerHTML={{ __html: `@font-face { font-family: 'HuiFontP29'; src: url('/fonts/HuiFontP29.ttf') format('truetype'); font-display: swap; }` }} />
      <AnalyticsBeacon username={username} />
      <AffiliateClickHandler slug={username} userAffiliateId={profile?.rakutenAffiliateId} />
      <PublicPageSSR
        username={username}
        profile={profile}
        sections={sections}
        themeVars={themeVars}
        isPremium={isPremium}
      />
    </>
  );
}
