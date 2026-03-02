"use client";

import { useState } from "react";
import {
  Instagram,
  Youtube,
  Share2,
  Pencil,
  Link as LinkIcon,
  User,
} from "lucide-react";
import {
  useProfile,
  skinTypeLabels,
  personalColorLabels,
} from "@/lib/profile-context";
import type { SnsLink } from "@/types";
import { XIcon } from "@/components/icons/x-icon";
import { useSections } from "@/lib/section-context";
import { ProfileEditor } from "./profile-editor";

function getSnsIcon(type: SnsLink["type"]) {
  switch (type) {
    case "instagram":
      return Instagram;
    case "twitter":
      return XIcon;
    case "youtube":
      return Youtube;
    default:
      return LinkIcon;
  }
}

export function ProfileHeader() {
  const { profile } = useProfile();
  const { isEditMode } = useSections();
  const [showEditor, setShowEditor] = useState(false);

  const displayName = profile.name?.trim() ? profile.name : "username";
  const initial = (profile.name?.trim() || "U").charAt(0).toUpperCase();

  return (
    <>
      <header className="relative flex flex-col items-center gap-4 pb-6">
        {isEditMode && (
          <button
            onClick={() => setShowEditor(true)}
            className="absolute -top-1 right-0 z-10 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
          >
            <Pencil className="h-3 w-3" />
            プロフィール編集
          </button>
        )}

        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-primary shadow-md">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`${profile.name}のプロフィール画像`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary text-primary">
                <User className="h-12 w-12" />
              </div>
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {initial}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {displayName}
          </h1>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
          <p className="max-w-[280px] text-center text-sm leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
          {profile.bioSub && (
            <p className="text-xs text-muted-foreground">{profile.bioSub}</p>
          )}

          {(profile.skinType || profile.personalColor) && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {profile.skinType && skinTypeLabels[profile.skinType] && (
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                  {skinTypeLabels[profile.skinType]}
                </span>
              )}
              {profile.personalColor &&
                personalColorLabels[profile.personalColor] && (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                    {personalColorLabels[profile.personalColor]}
                  </span>
                )}
            </div>
          )}
        </div>

        {profile.snsLinks.length > 0 && (
          <div className="flex items-center gap-3">
            {profile.snsLinks.map((link) => {
              const Icon = getSnsIcon(link.type);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
            <button
              aria-label="シェア"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      <ProfileEditor isOpen={showEditor} onClose={() => setShowEditor(false)} />
    </>
  );
}
