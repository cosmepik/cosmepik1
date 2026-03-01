"use client";

import { Instagram, Youtube, User, Share2, Link as LinkIcon } from "lucide-react";
import { XIcon } from "@/components/icons/x-icon";
import type { InfluencerProfile, SnsLink } from "@/types";

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

const SKIN_TYPE_OPTIONS = [
  { value: "", label: "選択する" },
  { value: "乾燥肌", label: "乾燥肌" },
  { value: "混合肌", label: "混合肌" },
  { value: "脂性肌", label: "脂性肌" },
  { value: "普通肌", label: "普通肌" },
  { value: "敏感肌", label: "敏感肌" },
];

const PERSONAL_COLOR_OPTIONS = [
  { value: "", label: "選択する" },
  { value: "イエベ", label: "イエベ" },
  { value: "ブルベ", label: "ブルベ" },
  { value: "スプリング", label: "スプリング" },
  { value: "サマー", label: "サマー" },
  { value: "オータム", label: "オータム" },
  { value: "ウィンター", label: "ウィンター" },
];

interface ProfileHeaderViewProps {
  username: string;
  profile: InfluencerProfile | null;
}

/** 表示専用：UIBASE 完全準拠 */
export function ProfileHeaderView({ username, profile }: ProfileHeaderViewProps) {
  const displayName = profile?.displayName ?? "コスメ好き";
  const skinType = profile?.skinType;
  const personalColor = profile?.personalColor;
  const initial = (displayName || "K").charAt(0).toUpperCase();

  return (
    <header className="flex flex-col items-center gap-4 pb-6">
      <div className="relative">
        <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-green shadow-md">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-green">
              <User className="h-12 w-12" />
            </div>
          )}
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-green text-xs text-white">
          {initial}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {displayName}
        </h1>
        <p className="text-xs text-muted-foreground">@{username}</p>
        {profile?.bio && (
          <p className="max-w-[280px] text-center text-sm leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        )}
        {profile?.bioSub && (
          <p className="text-xs text-muted-foreground">{profile.bioSub}</p>
        )}
        {(skinType || personalColor) && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {skinType && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                {skinType}
              </span>
            )}
            {personalColor && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                {personalColor}
              </span>
            )}
          </div>
        )}
      </div>

      {(profile?.snsLinks?.length ?? 0) > 0 ? (
        <div className="flex items-center gap-3">
          {profile!.snsLinks!.map((link) => {
            const Icon = getSnsIcon(link.type);
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-green hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
          <button
            aria-label="シェア"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-green hover:text-white"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <a
            href="#"
            aria-label="Instagram"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-green hover:text-white"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="X"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-green hover:text-white"
          >
            <XIcon className="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="YouTube"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-green hover:text-white"
          >
            <Youtube className="h-4 w-4" />
          </a>
        </div>
      )}
    </header>
  );
}

interface ProfileHeaderEditProps {
  username: string;
  displayName: string;
  avatarUrl: string;
  skinType: string;
  personalColor: string;
  editingName: boolean;
  tempName: string;
  onAvatarChange: (dataUrl: string) => void;
  onSkinTypeChange: (v: string) => void;
  onPersonalColorChange: (v: string) => void;
  onStartEditName: () => void;
  onSaveName: () => void;
  onCancelEditName: () => void;
  onTempNameChange: (v: string) => void;
}

/** 編集用：UIBASE 完全準拠 */
export function ProfileHeaderEdit({
  username,
  displayName,
  avatarUrl,
  skinType,
  personalColor,
  editingName,
  tempName,
  onAvatarChange,
  onSkinTypeChange,
  onPersonalColorChange,
  onStartEditName,
  onSaveName,
  onCancelEditName,
  onTempNameChange,
}: ProfileHeaderEditProps) {
  const initial = (displayName || "K").charAt(0).toUpperCase();

  return (
    <header className="flex flex-col items-center gap-4 pb-6">
      <label htmlFor="avatar-upload" className="relative block cursor-pointer">
        <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-green shadow-md">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-green">
              <User className="h-12 w-12" />
            </div>
          )}
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-green text-xs text-white">
          {initial}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              const r = new FileReader();
              r.onloadend = () => onAvatarChange(r.result as string);
              r.readAsDataURL(f);
            }
          }}
          className="hidden"
          id="avatar-upload"
        />
      </label>

      <div className="flex flex-col items-center gap-1">
        {editingName ? (
          <div className="flex items-center gap-2 justify-center flex-wrap">
            <input
              type="text"
              value={tempName}
              onChange={(e) => onTempNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveName();
                else if (e.key === "Escape") onCancelEditName();
              }}
              placeholder="表示名"
              className="w-40 rounded-lg border border-input bg-white px-2.5 py-1.5 text-center text-sm text-card-foreground"
              autoFocus
            />
            <button type="button" onClick={onSaveName} className="rounded-lg bg-green px-2 py-1.5 text-xs text-white hover:opacity-90">
              OK
            </button>
            <button type="button" onClick={onCancelEditName} className="rounded-lg border border-input bg-secondary px-2 py-1.5 text-xs text-muted-foreground">
              キャンセル
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 justify-center">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {displayName || "名前を設定"}
            </h1>
            <button
              type="button"
              onClick={onStartEditName}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="名前を編集"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">@{username}</p>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <select
          value={skinType}
          onChange={(e) => onSkinTypeChange(e.target.value)}
          className="rounded-lg border border-input bg-secondary px-2.5 py-1.5 text-xs text-card-foreground"
        >
          {SKIN_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value || "none"} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={personalColor}
          onChange={(e) => onPersonalColorChange(e.target.value)}
          className="rounded-lg border border-input bg-secondary px-2.5 py-1.5 text-xs text-card-foreground"
        >
          {PERSONAL_COLOR_OPTIONS.map((opt) => (
            <option key={opt.value || "none"} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </header>
  );
}
