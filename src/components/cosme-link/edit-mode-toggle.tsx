"use client";

import { Pencil, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSections } from "@/lib/section-context";
import { AddSectionModal } from "./add-section-modal";

export function EditModeToggle() {
  const { isEditMode, setIsEditMode, showAddSectionModal, setShowAddSectionModal } = useSections();

  return (
    <>
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-2">
        {isEditMode && (
          <button
            type="button"
            onClick={() => setShowAddSectionModal(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
            aria-label="セクションを追加"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsEditMode(!isEditMode)}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95",
            isEditMode
              ? "bg-primary text-primary-foreground"
              : "border-2 border-border bg-card text-card-foreground"
          )}
          aria-label={isEditMode ? "編集を終了" : "編集モード"}
        >
          {isEditMode ? (
            <Check className="h-6 w-6" />
          ) : (
            <Pencil className="h-5 w-5" />
          )}
        </button>
      </div>

      <AddSectionModal isOpen={showAddSectionModal} onClose={() => setShowAddSectionModal(false)} />
    </>
  );
}
