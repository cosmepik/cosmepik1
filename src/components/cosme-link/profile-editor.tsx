"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  X,
  Plus,
  Trash2,
  Instagram,
  Youtube,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useProfile,
  toInfluencerProfile,
  type SkinType,
  type PersonalColor,
  skinTypeLabels,
  personalColorLabels,
} from "@/lib/profile-context";
import type { SnsLink } from "@/types";
import { setProfile as saveProfileToStore } from "@/lib/store";
import { XIcon } from "@/components/icons/x-icon";

const snsTypeOptions = [
  {
    type: "instagram" as const,
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://instagram.com/username",
  },
  {
    type: "twitter" as const,
    label: "X",
    icon: XIcon,
    placeholder: "https://x.com/username",
  },
  {
    type: "youtube" as const,
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://youtube.com/@channel",
  },
  {
    type: "tiktok" as const,
    label: "TikTok",
    icon: LinkIcon,
    placeholder: "https://tiktok.com/@username",
  },
  {
    type: "threads" as const,
    label: "Threads",
    icon: LinkIcon,
    placeholder: "https://threads.net/@username",
  },
  {
    type: "custom" as const,
    label: "その他",
    icon: LinkIcon,
    placeholder: "https://example.com",
  },
];

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

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditor({ isOpen, onClose }: ProfileEditorProps) {
  const params = useParams();
  const slugFromParams = params?.slug as string | undefined;
  const {
    profile,
    slug: slugFromContext,
    updateProfile,
    addSnsLink,
    updateSnsLink,
    deleteSnsLink,
  } = useProfile();
  const slug = slugFromContext ?? slugFromParams ?? profile.username;
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [skinType, setSkinType] = useState<SkinType>(profile.skinType);
  const [personalColor, setPersonalColor] =
    useState<PersonalColor>(profile.personalColor);
  const [showAddSns, setShowAddSns] = useState(false);
  const [newSnsType, setNewSnsType] = useState<SnsLink["type"]>("instagram");
  const [newSnsUrl, setNewSnsUrl] = useState("");
  const [newSnsLabel, setNewSnsLabel] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setBio(profile.bio);
      setSkinType(profile.skinType);
      setPersonalColor(profile.personalColor);
    }
  }, [isOpen, profile.name, profile.bio, profile.skinType, profile.personalColor]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const next = {
        ...profile,
        name: name.trim(),
        bio: bio.trim(),
        skinType,
        personalColor,
      };
      const slugToSave = slug || profile.username || slugFromParams;
      if (!slugToSave) {
        setSaving(false);
        return;
      }
      updateProfile({ name: next.name, bio: next.bio, skinType, personalColor });
      const data = toInfluencerProfile(next);
      await saveProfileToStore({ ...data, username: slugToSave, displayName: next.name });
      onClose();
    } catch (err) {
      console.error("[ProfileEditor] 保存失敗:", err);
      alert(err instanceof Error ? err.message : "プロフィールの保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSns = () => {
    if (!newSnsUrl.trim()) return;
    const option = snsTypeOptions.find((o) => o.type === newSnsType);
    addSnsLink({
      id: `sns-${Date.now()}`,
      type: newSnsType,
      label: newSnsLabel.trim() || option?.label || "Link",
      url: newSnsUrl.trim(),
    });
    setNewSnsUrl("");
    setNewSnsLabel("");
    setShowAddSns(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md animate-in slide-in-from-bottom duration-300 rounded-t-3xl bg-card shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
          <h3 className="text-base font-bold text-card-foreground">
            プロフィール編集
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Basic info */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-card-foreground">基本情報</h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                プロフィール画像
              </label>
              <div className="flex items-center gap-3">
                <label className="relative block h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-border bg-secondary">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-8 w-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const r = new FileReader();
                        r.onloadend = () =>
                          updateProfile({ avatarUrl: r.result as string });
                        r.readAsDataURL(f);
                      }
                    }}
                  />
                </label>
                <span className="text-xs text-muted-foreground">
                  タップして画像を変更
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                表示名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="@username"
                className="rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                プロフィール文
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="韓国コスメ好き | スキンケアオタク"
                className="rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Beauty Profile */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-card-foreground">
              ビューティープロフィール
            </h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                肌質
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  Object.entries(skinTypeLabels) as [string, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setSkinType(skinType === key ? "" : (key as SkinType))
                    }
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      skinType === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                パーソナルカラー
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  Object.entries(personalColorLabels) as [string, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setPersonalColor(
                        personalColor === key ? "" : (key as PersonalColor)
                      )
                    }
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      personalColor === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* SNS Links */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-card-foreground">
                SNSリンク
              </h4>
              <span className="text-xs text-muted-foreground">
                {profile.snsLinks.length}個
              </span>
            </div>

            {profile.snsLinks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                SNSリンクがまだありません
              </p>
            )}

            <div className="flex flex-col gap-2">
              {profile.snsLinks.map((link) => {
                const Icon = getSnsIcon(link.type);
                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 rounded-xl border-2 border-border bg-background p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-xs font-medium text-card-foreground">
                        {link.label}
                      </span>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          updateSnsLink(link.id, { url: e.target.value })
                        }
                        className="truncate bg-transparent text-xs text-muted-foreground outline-none focus:text-foreground"
                        placeholder="URLを入力"
                      />
                    </div>
                    <button
                      onClick={() => deleteSnsLink(link.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {!showAddSns ? (
              <button
                onClick={() => setShowAddSns(true)}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5 hover:border-primary"
              >
                <Plus className="h-4 w-4" />
                SNSリンクを追加
              </button>
            ) : (
              <div className="flex flex-col gap-3 rounded-xl border-2 border-primary/30 bg-accent/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">
                    新しいリンク
                  </span>
                  <button
                    onClick={() => setShowAddSns(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    キャンセル
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {snsTypeOptions.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => {
                        setNewSnsType(opt.type);
                        setNewSnsLabel(opt.label);
                      }}
                      className={cn(
                        "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        newSnsType === opt.type
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-accent"
                      )}
                    >
                      <opt.icon className="h-3 w-3" />
                      {opt.label}
                    </button>
                  ))}
                </div>

                {newSnsType === "custom" && (
                  <input
                    type="text"
                    value={newSnsLabel}
                    onChange={(e) => setNewSnsLabel(e.target.value)}
                    placeholder="リンク名"
                    className="rounded-lg border-2 border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                )}

                <input
                  type="url"
                  value={newSnsUrl}
                  onChange={(e) => setNewSnsUrl(e.target.value)}
                  placeholder={
                    snsTypeOptions.find((o) => o.type === newSnsType)
                      ?.placeholder
                  }
                  className="rounded-lg border-2 border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  autoFocus
                />

                <button
                  onClick={handleAddSns}
                  disabled={!newSnsUrl.trim()}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  追加
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
