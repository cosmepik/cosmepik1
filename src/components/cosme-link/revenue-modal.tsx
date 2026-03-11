"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useProfile } from "@/lib/profile-context";
import { toInfluencerProfile } from "@/lib/profile-context";
import { setProfile as saveProfileToStore } from "@/lib/store";

interface RevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RevenueModal({ isOpen, onClose }: RevenueModalProps) {
  const { profile, slug, updateProfile } = useProfile();
  const [rakutenAffiliateId, setRakutenAffiliateId] = useState(
    profile.rakutenAffiliateId ?? ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRakutenAffiliateId(profile.rakutenAffiliateId ?? "");
    }
  }, [isOpen, profile.rakutenAffiliateId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const next = {
        ...profile,
        rakutenAffiliateId: rakutenAffiliateId.trim() || undefined,
      };
      updateProfile({ rakutenAffiliateId: next.rakutenAffiliateId });
      const data = toInfluencerProfile(next);
      const usernameToSave = slug || profile.username;
      if (!usernameToSave) return;
      await saveProfileToStore({
        ...data,
        username: usernameToSave,
        displayName: profile.name,
      });
      onClose();
    } catch (err) {
      console.error("[RevenueModal] 保存失敗:", err);
      alert(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md animate-in slide-in-from-bottom duration-300 rounded-t-3xl bg-card shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
          <h3 className="text-base font-bold text-card-foreground">収益化</h3>
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

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-card-foreground">
              楽天アフィリエイト
            </h4>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                楽天アフィリエイトID
              </label>
              <input
                type="text"
                value={rakutenAffiliateId}
                onChange={(e) => setRakutenAffiliateId(e.target.value)}
                placeholder="0ea12345.ab.cd（任意）"
                className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <p className="text-[11px] text-muted-foreground">
                楽天アフィリエイトに登録済みの場合、IDを入力すると収益の一部が還元されます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
