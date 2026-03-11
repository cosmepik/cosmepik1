"use client";

import {
  ExternalLink,
  Star,
  Heart,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Package,
  Grid2X2,
  Link as LinkIcon,
  X,
  Pencil,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { type Section, type SectionItem } from "@/lib/sections";
import { useSections } from "@/lib/section-context";
import { useAffiliateClick } from "@/hooks/use-affiliate-click";
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

function SortableRoutineItem({
  item,
  isEditMode,
  onDelete,
  onAffiliateClick,
}: {
  item: SectionItem;
  isEditMode: boolean;
  onDelete: () => void;
  onAffiliateClick: (link: string | undefined, itemId?: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const cardContent = (
    <>
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {item.image && (
          <CosmeImage
            src={item.image}
            alt={item.product || ""}
            fill
            className="object-cover"
            sizes="64px"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {item.brand && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
            {item.brand}
          </span>
        )}
        <span className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
          {item.product}
        </span>
        {item.label && (
          <span className="text-xs text-muted-foreground">{item.label}</span>
        )}
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
    </>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("group relative", isDragging && "z-50 opacity-90")}
    >
      {isEditMode ? (
        <div
          className="flex cursor-grab active:cursor-grabbing items-center gap-3 rounded-xl bg-card p-3 shadow-sm transition-all hover:shadow-md touch-manipulation"
          {...listeners}
          {...attributes}
          onClick={(e) => {
            if (!isDragging && item.link) {
              e.preventDefault();
              onAffiliateClick(item.link, item.id);
            }
          }}
        >
          {cardContent}
        </div>
      ) : (
        <a
          href={item.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm transition-all hover:shadow-md"
          onClick={(e) => {
            if (item.link) {
              e.preventDefault();
              onAffiliateClick(item.link, item.id);
            }
          }}
        >
          {cardContent}
        </a>
      )}
      {isEditMode && (
        <div
          className="absolute -top-1 right-2 flex items-center opacity-100 transition-opacity group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function RoutineSection({ section, onAddItem }: SectionContentProps) {
  const { isEditMode, deleteItemFromSection, reorderItemsInSection } = useSections();
  const onAffiliateClick = useAffiliateClick();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const itemIds = section.items.map((i) => i.id);
    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(itemIds, oldIndex, newIndex);
    reorderItemsInSection(section.id, reordered);
  };

  return (
    <div className="flex flex-col gap-4">
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
        {isEditMode && section.items.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={section.items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.items.map((item) => (
                <SortableRoutineItem
                  key={item.id}
                  item={item}
                  isEditMode={isEditMode}
                  onDelete={() => deleteItemFromSection(section.id, item.id)}
                  onAffiliateClick={onAffiliateClick}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          section.items.map((item) => (
            <SortableRoutineItem
              key={item.id}
              item={item}
              isEditMode={false}
              onDelete={() => {}}
              onAffiliateClick={onAffiliateClick}
            />
          ))
        )}
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
  const { isEditMode } = useSections();

  return (
    <div className="flex flex-col gap-4">
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
          <ProductCard key={item.id} item={item} isEditMode={isEditMode} section={section} onAddItem={onAddItem} />
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

function ProductCard({
  item,
  isEditMode,
  section,
  onAddItem,
}: {
  item: SectionItem;
  isEditMode: boolean;
  section: Section;
  onAddItem?: () => void;
}) {
  const { deleteItemFromSection } = useSections();
  const onAffiliateClick = useAffiliateClick();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const toggleLike = (id: string) =>
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="group relative">
      <a
        href={item.link || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block overflow-hidden rounded-xl bg-card shadow-sm transition-all hover:shadow-md"
        onClick={(e) => {
          if (item.link) {
            e.preventDefault();
            onAffiliateClick(item.link, item.id);
          }
        }}
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
                {item.brand && (
                  <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
                    {item.brand}
                  </p>
                )}
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-card-foreground">
                  {item.product}
                </h3>
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
  const onAffiliateClick = useAffiliateClick();

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
            onClick={(e) => {
              if (item.link) {
                e.preventDefault();
                onAffiliateClick(item.link, item.id);
              }
            }}
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
    updateSection,
  } = useSections();
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState(section.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const currentIndex = sections.findIndex((s) => s.id === section.id);
  const canAddItems = ["routine", "products", "link"].includes(section.type);

  const handleTitleCommit = () => {
    const next = editingTitle.trim();
    if (!next || next === section.title) {
      setEditingTitle(section.title);
      setIsEditingTitle(false);
      return;
    }
    updateSection(section.id, { title: next });
    setIsEditingTitle(false);
  };

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
    const showReadOnlyTitle = !["heading", "text"].includes(section.type);
    return (
      <section className="relative">
        {showReadOnlyTitle && (
          <div className="mb-2 flex items-center gap-1 px-1 py-0.5">
            <span className="text-sm font-semibold text-foreground">
              {section.title}
            </span>
          </div>
        )}
        <div>{renderContent()}</div>
      </section>
    );
  }

  return (
    <section className="relative rounded-2xl border-2 border-dashed border-primary/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {isEditingTitle ? (
            <input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleTitleCommit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                } else if (e.key === "Escape") {
                  setEditingTitle(section.title);
                  setIsEditingTitle(false);
                  e.currentTarget.blur();
                }
              }}
              className="max-w-[200px] rounded bg-transparent px-1 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
              placeholder="セクション名"
              autoFocus
            />
          ) : (
            <>
              <span className="max-w-[200px] truncate text-sm font-semibold text-foreground">
                {section.title || "セクション名"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditingTitle(section.title);
                  setIsEditingTitle(true);
                }}
                className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
                aria-label="セクション名を編集"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
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
      </div>
      <div className="mt-1">{renderContent()}</div>

      <AddItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        sectionId={section.id}
        sectionType={section.type}
      />
    </section>
  );
}
