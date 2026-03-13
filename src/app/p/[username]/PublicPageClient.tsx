"use client";

import { useEffect } from "react";
import { PublicProfileContent } from "@/components/PublicProfileContent";
import { ProfileThemeApplier } from "@/components/ProfileThemeApplier";
import { SectionProvider } from "@/lib/section-context";
import type { InfluencerProfile } from "@/types";
import type { Section } from "@/lib/sections";

interface Props {
  username: string;
  profile: InfluencerProfile | null;
  sections: Section[];
}

export function PublicPageClient({ username, profile, sections }: Props) {
  useEffect(() => {
    fetch(`/api/analytics/view?username=${encodeURIComponent(username)}`, {
      method: "POST",
    }).catch(() => {});
  }, [username]);

  return (
    <>
      <ProfileThemeApplier profile={profile} />
      <SectionProvider
        slug={username}
        userAffiliateId={profile?.rakutenAffiliateId}
        initialSections={sections}
      >
        <PublicProfileContent username={username} profile={profile} />
      </SectionProvider>
    </>
  );
}
