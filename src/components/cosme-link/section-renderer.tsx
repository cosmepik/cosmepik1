"use client";

import {
  ExternalLink,
  Star,
  Heart,
  ChevronUp,
  ChevronDown,
  Trash2,
  GripVertical,
  Plus,
  Package,
  Grid2X2,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Section } from "@/lib/sections";
import { useSections } from "@/lib/section-context";
import { useState } from "react";
import { CosmeImage } from "@/components/CosmeImage";
import { AddItemModal } from "./add-item-modal";

interface SectionRendererProps {
  section: Section;
}

interface SectionContentProps {
  section: Section;
  onAddItem?: () => void;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-3 w-3",
              star <= rating ? "fill-primary text-primary" : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}

function RoutineSection({ section, onAddItem }: SectionContentProps) {
  const { isEditMode, deleteItemFromSection, moveItemInSection } = useSections();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {section.icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            {section.icon}
          </div>
        )}
        <h2 className="text-base font-bold text-foreground">{section.title}</h2>
      </div>

      <div className="flex flex-col gap-2">
        {section.items.length === 0 && isEditMode && onAddItem && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-8 text-center">
            <Package className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">まだアイテムがありません</p>
            <button
              type="button"
              onClick={onAddItem}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              コスメを追加
            </button>
          </div>
        )}
        {section.items.map((item, index) => (
          <div key={item.id} className="group relative">
            <a
              href={item.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm transition-all hover:shadow-md"
            >
              {section.showSteps && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </div>
              )}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                {item.image && (
                  <CosmeImage
                    src={item.image}
                    alt={item.product || ""}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
                  {item.brand}
                </span>
                <span className="truncate text-sm font-medium text-card-foreground">
                  {item.product}
                </span>
                {item.label && (
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                )}
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </a>
            {isEditMode && (
              <div className="absolute -top-1 right-2 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => moveItemInSection(section.id, item.id, "up")}
                  disabled={index === 0}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-accent disabled:opacity-40"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItemInSection(section.id, item.id, "down")}
                  disabled={index === section.items.length - 1}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-accent disabled:opacity-40"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteItemFromSection(section.id, item.id);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}
        {isEditMode && section.items.length > 0 && onAddItem && (
          <button
            type="button"
            onClick={onAddItem}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 py-3 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
          >
            <Plus className="h-4 w-4" />
            コスメを追加
          </button>
        )}
      </div>
    </div>
  );
}

function ProductsSection({ section, onAddItem }: SectionContentProps) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const { isEditMode, deleteItemFromSection } = useSections();

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">{section.title}</h2>
        <span className="text-xs text-muted-foreground">
          {section.items.length}個のアイテム
        </span>
      </div>

      {section.items.length === 0 && isEditMode && onAddItem && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-8 text-center">
          <Grid2X2 className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">まだアイテムがありません</p>
          <button
            type="button"
            onClick={onAddItem}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            コスメを追加
          </button>
        </div>
      )}

      <div
        className={cn(
          "grid gap-3",
          section.columns === 1 ? "grid-cols-1" : "grid-cols-2"
        )}
      >
        {section.items.map((item) => (
          <div key={item.id} className="group relative">
            <a
              href={item.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block overflow-hidden rounded-xl bg-card shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden bg-secondary">
                {item.image && (
                  <CosmeImage
                    src={item.image}
                    alt={item.product || ""}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 224px"
                  />
                )}
                {item.badge && (
                  <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {item.badge}
                  </span>
                )}
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLike(item.id);
                    }}
                    aria-label="お気に入り"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-colors hover:bg-card"
                  >
                    <Heart
                      className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        likedIds.has(item.id)
                          ? "fill-destructive text-destructive"
                          : "text-foreground"
                      )}
                    />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
                  {item.brand}
                </p>
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-card-foreground">
                  {item.product}
                </h3>
                {item.rating != null && item.reviewCount != null && (
                  <StarRating rating={item.rating} count={item.reviewCount} />
                )}
                <div className="mt-0.5 flex items-center justify-between">
                  {item.price && (
                    <span className="text-sm font-bold text-card-foreground">
                      {item.price}
                    </span>
                  )}
                  <ExternalLink className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
              </div>
            </a>
            {isEditMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  deleteItemFromSection(section.id, item.id);
                }}
                className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {isEditMode && section.items.length > 0 && onAddItem && (
        <button
          type="button"
          onClick={onAddItem}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 py-3 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
        >
          <Plus className="h-4 w-4" />
          コスメを追加
        </button>
      )}
    </div>
  );
}

function HeadingSection({ section }: { section: Section }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
      {section.subtitle && (
        <p className="text-sm text-muted-foreground">{section.subtitle}</p>
      )}
    </div>
  );
}

function TextSection({ section }: { section: Section }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-sm">
      <p className="text-sm leading-relaxed text-card-foreground">
        {section.title}
      </p>
    </div>
  );
}

function LinkSection({ section, onAddItem }: SectionContentProps) {
  const { isEditMode, deleteItemFromSection } = useSections();

  return (
    <div className="flex flex-col gap-2">
      {section.items.length === 0 && isEditMode && onAddItem && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-8 text-center">
          <LinkIcon className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">まだリンクがありません</p>
          <button
            type="button"
            onClick={onAddItem}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            リンクを追加
          </button>
        </div>
      )}
      {section.items.map((item) => (
        <div key={item.id} className="group relative">
          <a
            href={item.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm transition-all hover:shadow-md"
          >
            <span className="font-medium text-card-foreground">
              {item.label || item.product}
            </span>
            <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </a>
          {isEditMode && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                deleteItemFromSection(section.id, item.id);
              }}
              className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      {isEditMode && section.items.length > 0 && onAddItem && (
        <button
          type="button"
          onClick={onAddItem}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 py-3 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
        >
          <Plus className="h-4 w-4" />
          リンクを追加
        </button>
      )}
    </div>
  );
}

export function SectionRenderer({ section }: SectionRendererProps) {
  const {
    isEditMode,
    moveSection,
    deleteSection,
    sections,
  } = useSections();
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const currentIndex = sections.findIndex((s) => s.id === section.id);
  const canAddItems = ["routine", "products", "link"].includes(section.type);

  const handleAddItem = () => setShowAddItemModal(true);

  const renderContent = () => {
    switch (section.type) {
      case "routine":
        return (
          <RoutineSection
            section={section}
            onAddItem={canAddItems ? handleAddItem : undefined}
          />
        );
      case "products":
        return (
          <ProductsSection
            section={section}
            onAddItem={canAddItems ? handleAddItem : undefined}
          />
        );
      case "heading":
        return <HeadingSection section={section} />;
      case "text":
        return <TextSection section={section} />;
      case "link":
        return (
          <LinkSection
            section={section}
            onAddItem={canAddItems ? handleAddItem : undefined}
          />
        );
      default:
        return null;
    }
  };

  if (!isEditMode) {
    return <section>{renderContent()}</section>;
  }

  return (
    <section className="relative rounded-2xl border-2 border-dashed border-primary/40 p-4">
      <div className="absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-primary px-2 py-1">
        <GripVertical className="h-3 w-3 text-primary-foreground" />
        <span className="text-xs font-medium text-primary-foreground">
          {section.title}
        </span>
      </div>
      <div className="absolute -top-3 right-4 flex items-center gap-1">
        {canAddItems && (
          <button
            type="button"
            onClick={handleAddItem}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/80"
            title="アイテムを追加"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
        <button
          type="button"
          onClick={() => moveSection(section.id, "up")}
          disabled={currentIndex === 0}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-40"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => moveSection(section.id, "down")}
          disabled={currentIndex === sections.length - 1}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-40"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => deleteSection(section.id)}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <div className="mt-4">{renderContent()}</div>

      <AddItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        sectionId={section.id}
        sectionType={section.type}
      />
    </section>
  );
}
