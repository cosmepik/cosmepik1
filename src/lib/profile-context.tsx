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
}

function toProfile(p: InfluencerProfile | null, slug: string): Profile {
  if (!p) {
    return {
      name: `@${slug}`,
      username: slug,
      bio: "",
      bioSub: "",
      avatarUrl: "",
      snsLinks: [],
      skinType: "",
      personalColor: "",
    };
  }
  const skinType =
    (p.skinType && skinTypeLabelToKey[p.skinType]) || (p.skinType as SkinType) || "";
  const personalColor =
    (p.personalColor && personalColorLabelToKey[p.personalColor]) ||
    (p.personalColor as PersonalColor) ||
    "";
  return {
    name: p.displayName || `@${slug}`,
    username: p.username || slug,
    bio: p.bio ?? "",
    bioSub: p.bioSub ?? "",
    avatarUrl: p.avatarUrl ?? "",
    snsLinks: p.snsLinks ?? [],
    skinType,
    personalColor,
  };
}

function toInfluencerProfile(profile: Profile): Partial<InfluencerProfile> & {
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
    updatedAt: new Date().toISOString(),
  };
}

interface ProfileContextType {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  addSnsLink: (link: SnsLink) => void;
  updateSnsLink: (id: string, updates: Partial<SnsLink>) => void;
  deleteSnsLink: (id: string) => void;
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
  slug: string;
}

export function ProfileProvider({ children, slug }: ProfileProviderProps) {
  const [profile, setProfileState] = useState<Profile>({
    name: `@${slug}`,
    username: slug,
    bio: "",
    bioSub: "",
    avatarUrl: "",
    snsLinks: [],
    skinType: "",
    personalColor: "",
  });

  useEffect(() => {
    getProfile(slug).then((p) => {
      setProfileState(toProfile(p, slug));
    });
  }, [slug]);

  const persistProfile = useCallback(
    (next: Profile) => {
      setProfile(toInfluencerProfile(next));
    },
    []
  );

  const updateProfile = useCallback(
    (updates: Partial<Profile>) => {
      setProfileState((prev) => {
        const next = { ...prev, ...updates };
        persistProfile(next);
        return next;
      });
    },
    [persistProfile]
  );

  const addSnsLink = useCallback(
    (link: SnsLink) => {
      setProfileState((prev) => {
        const next = {
          ...prev,
          snsLinks: [...prev.snsLinks, link],
        };
        persistProfile(next);
        return next;
      });
    },
    [persistProfile]
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
        persistProfile(next);
        return next;
      });
    },
    [persistProfile]
  );

  const deleteSnsLink = useCallback(
    (id: string) => {
      setProfileState((prev) => {
        const next = {
          ...prev,
          snsLinks: prev.snsLinks.filter((l) => l.id !== id),
        };
        persistProfile(next);
        return next;
      });
    },
    [persistProfile]
  );


  const setProfileHandler = useCallback(
    (next: Profile) => {
      setProfileState(next);
      persistProfile(next);
    },
    [persistProfile]
  );

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile: setProfileHandler,
        updateProfile,
        addSnsLink,
        updateSnsLink,
        deleteSnsLink,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
