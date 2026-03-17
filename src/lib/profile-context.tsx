"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getProfile, setProfile } from "@/lib/store";
import type { InfluencerProfile, SnsLink } from "@/types";

export type SkinType =
  | "oily"
  | "dry"
  | "combination"
  | "sensitive"
  | "normal"
  | "";
export type PersonalColor =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "";

export const skinTypeLabels: Record<string, string> = {
  oily: "脂性肌",
  dry: "乾燥肌",
  combination: "混合肌",
  sensitive: "敏感肌",
  normal: "普通肌",
};

export const personalColorLabels: Record<string, string> = {
  spring: "イエベ春",
  summer: "ブルベ夏",
  autumn: "イエベ秋",
  winter: "ブルベ冬",
};

const skinTypeLabelToKey: Record<string, SkinType> = {
  脂性肌: "oily",
  乾燥肌: "dry",
  混合肌: "combination",
  敏感肌: "sensitive",
  普通肌: "normal",
};

const personalColorLabelToKey: Record<string, PersonalColor> = {
  イエベ春: "spring",
  ブルベ夏: "summer",
  イエベ秋: "autumn",
  ブルベ冬: "winter",
};

export interface Profile {
  name: string;
  username: string;
  bio: string;
  bioSub: string;
  avatarUrl: string;
  snsLinks: SnsLink[];
  skinType: SkinType;
  personalColor: PersonalColor;
  /** 楽天アフィリエイトID（確率分散型レベニューシェア用） */
  rakutenAffiliateId?: string;
  themeId?: string;
  backgroundId?: string;
  backgroundImageUrl?: string;
}

/** store の InfluencerProfile を Profile に変換（編集ページの初期化用にエクスポート） */
export function toProfile(p: InfluencerProfile | null, slug: string): Profile {
  if (!p) {
    return {
      name: "",
      username: slug,
      bio: "",
      bioSub: "",
      avatarUrl: "",
      snsLinks: [],
      skinType: "",
      personalColor: "",
      themeId: undefined,
      backgroundId: undefined,
      backgroundImageUrl: undefined,
    };
  }
  const skinType =
    (p.skinType && skinTypeLabelToKey[p.skinType]) || (p.skinType as SkinType) || "";
  const personalColor =
    (p.personalColor && personalColorLabelToKey[p.personalColor]) ||
    (p.personalColor as PersonalColor) ||
    "";
  return {
    name: p.displayName?.trim() ?? "",
    username: p.username || slug,
    bio: p.bio ?? "",
    bioSub: p.bioSub ?? "",
    avatarUrl: p.avatarUrl ?? "",
    snsLinks: p.snsLinks ?? [],
    skinType,
    personalColor,
    rakutenAffiliateId: p.rakutenAffiliateId?.trim() || "",
    themeId: p.themeId,
    backgroundId: p.backgroundId,
    backgroundImageUrl: p.backgroundImageUrl,
  };
}

/** Profile を InfluencerProfile 形式に変換（プレビュー表示用） */
export function toInfluencerProfile(profile: Profile): Partial<InfluencerProfile> & {
  username: string;
} {
  const skinType =
    profile.skinType && skinTypeLabels[profile.skinType]
      ? skinTypeLabels[profile.skinType]
      : profile.skinType || undefined;
  const personalColor =
    profile.personalColor && personalColorLabels[profile.personalColor]
      ? personalColorLabels[profile.personalColor]
      : profile.personalColor || undefined;

  return {
    username: profile.username,
    displayName: profile.name,
    bio: profile.bio || undefined,
    bioSub: profile.bioSub || undefined,
    avatarUrl: profile.avatarUrl || undefined,
    skinType,
    personalColor,
    snsLinks: profile.snsLinks,
    rakutenAffiliateId: profile.rakutenAffiliateId || undefined,
    updatedAt: new Date().toISOString(),
  };
}

interface ProfileContextType {
  profile: Profile;
  slug: string | null;
  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  addSnsLink: (link: SnsLink) => void;
  updateSnsLink: (id: string, updates: Partial<SnsLink>) => void;
  deleteSnsLink: (id: string) => void;
  refreshProfile: (slug: string) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function useProfile(): ProfileContextType {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return ctx;
}

interface ProfileProviderProps {
  children: ReactNode;
  slug: string | null;
  /** 編集ページ用：storeから取得した初期プロフィール（確実に表示するため） */
  initialProfile?: Profile | null;
}

export function ProfileProvider({ children, slug, initialProfile }: ProfileProviderProps) {
  const [profile, setProfileState] = useState<Profile>(
    initialProfile ?? {
      name: "",
      username: slug ?? "",
      bio: "",
      bioSub: "",
      avatarUrl: "",
      snsLinks: [],
      skinType: "",
      personalColor: "",
    }
  );

  const loadProfile = useCallback((targetSlug: string) => {
    getProfile(targetSlug).then((p) => {
      setProfileState(toProfile(p, targetSlug));
    });
  }, []);

  useEffect(() => {
    if (initialProfile) {
      setProfileState(initialProfile);
    }
  }, [initialProfile]);

  useEffect(() => {
    if (!slug || initialProfile) return;
    loadProfile(slug);
  }, [slug, loadProfile, initialProfile]);

  const refreshProfile = useCallback(
    (targetSlug: string) => {
      loadProfile(targetSlug);
    },
    [loadProfile]
  );

  const persistProfile = useCallback(
    (next: Profile, targetSlug?: string): Promise<void> => {
      const slugToUse = targetSlug ?? slug ?? next.username;
      if (!slugToUse) return Promise.resolve();
      const data = toInfluencerProfile(next);
      return setProfile({ ...data, username: slugToUse });
    },
    [slug]
  );

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      const next = { ...profile, ...updates };
      setProfileState(next);
      const slugToUse = slug ?? profile.username;
      if (slugToUse) {
        await persistProfile(next, slugToUse);
      }
    },
    [persistProfile, profile, slug]
  );

  const addSnsLink = useCallback(
    (link: SnsLink) => {
      setProfileState((prev) => {
        const next = {
          ...prev,
          snsLinks: [...prev.snsLinks, link],
        };
        persistProfile(next, slug ?? next.username).catch(console.error);
        return next;
      });
    },
    [persistProfile, slug]
  );

  const updateSnsLink = useCallback(
    (id: string, updates: Partial<SnsLink>) => {
      setProfileState((prev) => {
        const next = {
          ...prev,
          snsLinks: prev.snsLinks.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        };
        persistProfile(next, slug ?? next.username).catch(console.error);
        return next;
      });
    },
    [persistProfile, slug]
  );

  const deleteSnsLink = useCallback(
    (id: string) => {
      setProfileState((prev) => {
        const next = {
          ...prev,
          snsLinks: prev.snsLinks.filter((l) => l.id !== id),
        };
        persistProfile(next, slug ?? next.username).catch(console.error);
        return next;
      });
    },
    [persistProfile, slug]
  );

  const setProfileHandler = useCallback(
    (next: Profile) => {
      setProfileState(next);
      persistProfile(next, slug ?? next.username).catch(console.error);
    },
    [persistProfile, slug]
  );

  return (
    <ProfileContext.Provider
      value={{
        profile,
        slug,
        setProfile: setProfileHandler,
        updateProfile,
        addSnsLink,
        updateSnsLink,
        deleteSnsLink,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
