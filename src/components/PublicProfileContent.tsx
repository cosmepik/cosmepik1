"use client";

import Link from "next/link";
import { ProfileHeaderView } from "@/components/ProfileHeader";
import { SectionRenderer } from "@/components/cosme-link/section-renderer";
import { useSections } from "@/lib/section-context";
import type { InfluencerProfile } from "@/types";

interface PublicProfileContentProps {
  username: string;
  profile: InfluencerProfile | null;
}

/**
 * ファン向け：セクションファースト設計
 */
export function PublicProfileContent({
  username,
  profile,
}: PublicProfileContentProps) {
  const { sections } = useSections();

  const bgStyle = profile?.backgroundImageUrl
    ? {
        backgroundImage: `url(${profile.backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : undefined;

  return (
    <div className="min-h-screen" style={bgStyle}>
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
        {/* Logo */}
        <div className="flex justify-center">
          <span className="text-lg font-bold tracking-tight text-foreground">
            cosmepik
          </span>
        </div>

        {/* Profile */}
        <ProfileHeaderView username={username} profile={profile} />

        {/* セクション */}
        {sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}

        {/* Footer */}
        <footer className="flex flex-col items-center gap-2 pb-8 pt-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="text-xs font-medium">
              Powered by{" "}
              <span className="font-bold text-green">cosmepik</span>
            </span>
          </div>
          <Link
            href="/"
            className="text-xs font-medium text-green hover:underline"
          >
            cosmepikを使ってみる
          </Link>
        </footer>
      </main>
    </div>
  );
}
