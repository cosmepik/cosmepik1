"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CosmepikLogo } from "@/components/cosmepik-logo";
import { ProfileHeaderView } from "@/components/ProfileHeader";
import { ProfileThemeApplier } from "@/components/ProfileThemeApplier";
import { PublicSectionRenderer } from "@/components/public/PublicSectionRenderer";
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

  const hasCustomBg = !!profile?.backgroundImageUrl;
  const usePreset = !!profile?.usePreset;

  return (
    <>
      <ProfileThemeApplier profile={profile} />
      <div className="relative min-h-screen w-full">
        {hasCustomBg && !usePreset && (
          <div
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `url(${profile!.backgroundImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
        <main className="page-transition-enter relative z-10 mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
          <div className="flex justify-center">
            <CosmepikLogo className="h-6" height={26} />
          </div>

          <ProfileHeaderView username={username} profile={profile} />

          {sections.map((section) => (
            <PublicSectionRenderer
              key={section.id}
              section={section}
              slug={username}
              userAffiliateId={profile?.rakutenAffiliateId}
            />
          ))}

          <footer className="flex flex-col items-center gap-2 pb-8 pt-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-xs font-medium">
                Powered by{" "}
                <CosmepikLogo className="h-4 inline-block align-middle" height={18} color="var(--green)" />
              </span>
            </div>
            <Link href="/" className="text-xs font-medium text-green hover:underline">
              cosmepikを使ってみる
            </Link>
          </footer>
        </main>
      </div>
    </>
  );
}
