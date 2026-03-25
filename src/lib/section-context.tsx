"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { type Section, type SectionItem, createDefaultRoutineSection, createDefaultRecipeSection } from "./sections";
import * as store from "./store";

interface SectionContextType {
  slug: string;
  /** 楽天アフィリエイトID（確率分散型レベニューシェア用） */
  userAffiliateId?: string | null;
  sections: Section[];
  setSections: (sections: Section[]) => void;
  addSection: (section: Section) => void;
  updateSection: (id: string, section: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  moveSection: (id: string, direction: "up" | "down") => void;
  addItemToSection: (sectionId: string, item: SectionItem) => void;
  updateItemInSection: (sectionId: string, itemId: string, item: Partial<SectionItem>) => void;
  deleteItemFromSection: (sectionId: string, itemId: string) => void;
  moveItemInSection: (sectionId: string, itemId: string, direction: "up" | "down") => void;
  reorderItemsInSection: (sectionId: string, itemIds: string[]) => void;
  createSectionQuick: (type: "routine" | "products") => void;
  showAddSectionModal: boolean;
  setShowAddSectionModal: (value: boolean) => void;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  isLoading: boolean;
  loadError: boolean;
  retryLoad: () => void;
}

const SectionContext = createContext<SectionContextType | null>(null);

export function useSections(): SectionContextType {
  const ctx = useContext(SectionContext);
  if (!ctx) {
    return {
      slug: "demo",
      userAffiliateId: null,
      sections: [] as Section[],
      setSections: () => {},
      addSection: () => {},
      updateSection: () => {},
      deleteSection: () => {},
      moveSection: () => {},
      addItemToSection: () => {},
      updateItemInSection: () => {},
      deleteItemFromSection: () => {},
      moveItemInSection: () => {},
      reorderItemsInSection: () => {},
      createSectionQuick: () => {},
      showAddSectionModal: false,
      setShowAddSectionModal: () => {},
      isEditMode: false,
      setIsEditMode: () => {},
      isLoading: false,
      loadError: false,
      retryLoad: () => {},
    };
  }
  return ctx;
}

interface SectionProviderProps {
  children: ReactNode;
  slug: string;
  /** 楽天アフィリエイトID（確率分散型レベニューシェア用） */
  userAffiliateId?: string | null;
  /** 編集画面では true にし、編集モードをデフォルトで ON にする */
  defaultEditMode?: boolean;
  /** 事前取得したセクション。undefined=通常fetch, null=API取得中でスキップ, Section[]=使用 */
  initialSections?: Section[] | null;
}

export function SectionProvider({
  children,
  slug,
  userAffiliateId,
  defaultEditMode = false,
  initialSections,
}: SectionProviderProps) {
  const [sections, setSectionsState] = useState<Section[]>([]);
  const [isEditMode, setIsEditMode] = useState(defaultEditMode);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(!Array.isArray(initialSections));

  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const retryLoad = useCallback(() => {
    store.clearSectionsCache(slug);
    setRetryKey((k) => k + 1);
  }, [slug]);

  useEffect(() => {
    if (initialSections === null) return;
    if (Array.isArray(initialSections)) {
      setSectionsState(initialSections.length > 0 ? initialSections : [createDefaultRoutineSection()]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(false);
    let cancelled = false;
    store.getSections(slug).then((result) => {
      if (cancelled) return;
      if (result === "error") {
        setLoadError(true);
        setIsLoading(false);
        return;
      }
      if (result && result.length > 0) {
        setSectionsState(result);
      } else if (defaultEditMode) {
        setSectionsState([createDefaultRoutineSection()]);
      }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug, initialSections, defaultEditMode, retryKey]);

  const persistSections = useCallback(
    (next: Section[]) => {
      setSectionsState(next);
      store.setSections(next, slug);
    },
    [slug]
  );

  const addSection = useCallback(
    (section: Section) => {
      setSectionsState((prev) => {
        const next = [...prev, section];
        store.setSections(next, slug);
        return next;
      });
    },
    [slug]
  );

  const updateSection = useCallback(
    (id: string, updates: Partial<Section>) => {
      setSectionsState((prev) => {
        const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
        store.setSections(next, slug);
        return next;
      });
    },
    [slug]
  );

  const deleteSection = useCallback(
    (id: string) => {
      setSectionsState((prev) => {
        const next = prev.filter((s) => s.id !== id);
        store.setSections(next, slug);
        return next;
      });
    },
    [slug]
  );

  const moveSection = useCallback(
    (id: string, direction: "up" | "down") => {
      setSectionsState((prev) => {
        const index = prev.findIndex((s) => s.id === id);
        if (index === -1) return prev;
        if (direction === "up" && index === 0) return prev;
        if (direction === "down" && index === prev.length - 1) return prev;

        const newSections = [...prev];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newSections[index], newSections[targetIndex]] = [
          newSections[targetIndex],
          newSections[index],
        ];
        store.setSections(newSections, slug);
        return newSections;
      });
    },
    [slug]
  );

  const setSectionsHandler = useCallback(
    (next: Section[]) => {
      persistSections(next);
    },
    [persistSections]
  );

  const addItemToSection = useCallback(
    (sectionId: string, item: SectionItem) => {
      setSectionsState((prev) => {
        const next = prev.map((s) =>
          s.id === sectionId ? { ...s, items: [...s.items, item] } : s
        );
        store.setSections(next, slug);
        return next;
      });
    },
    [slug]
  );

  const updateItemInSection = useCallback(
    (sectionId: string, itemId: string, updates: Partial<SectionItem>) => {
      setSectionsState((prev) => {
        const next = prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                items: s.items.map((i) =>
                  i.id === itemId ? { ...i, ...updates } : i
                ),
              }
            : s
        );
        store.setSections(next, slug);
        return next;
      });
    },
    [slug]
  );

  const deleteItemFromSection = useCallback(
    (sectionId: string, itemId: string) => {
      setSectionsState((prev) => {
        const next = prev.map((s) =>
          s.id === sectionId
            ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
            : s
        );
        store.setSections(next, slug);
        return next;
      });
    },
    [slug]
  );

  const moveItemInSection = useCallback(
    (sectionId: string, itemId: string, direction: "up" | "down") => {
      setSectionsState((prev) => {
        const next = prev.map((s) => {
          if (s.id !== sectionId) return s;
          const idx = s.items.findIndex((i) => i.id === itemId);
          if (idx === -1) return s;
          if (direction === "up" && idx === 0) return s;
          if (direction === "down" && idx === s.items.length - 1) return s;
          const items = [...s.items];
          const target = direction === "up" ? idx - 1 : idx + 1;
          [items[idx], items[target]] = [items[target], items[idx]];
          return { ...s, items };
        });
        store.setSections(next, slug);
        return next;
      });
    },
    [slug]
  );

  const reorderItemsInSection = useCallback(
    (sectionId: string, itemIds: string[]) => {
      setSectionsState((prev) => {
        const next = prev.map((s) => {
          if (s.id !== sectionId) return s;
          const idToItem = new Map(s.items.map((i) => [i.id, i]));
          const items = itemIds.map((id) => idToItem.get(id)).filter(Boolean) as typeof s.items;
          if (items.length !== s.items.length) return s;
          return { ...s, items };
        });
        store.setSections(next, slug);
        return next;
      });
    },
    [slug]
  );

  const createSectionQuick = useCallback(
    (type: "routine" | "products") => {
      const defaultTitles = {
        routine: "コレクション",
        products: "グリッド表示",
      };
      const newSection: Section = {
        id: `section-${Date.now()}`,
        type,
        title: defaultTitles[type],
        items: [],
        showSteps: type === "routine",
        columns: type === "products" ? 2 : undefined,
      };
      setSectionsState((prev) => {
        const next = [...prev, newSection];
        store.setSections(next, slug);
        return next;
      });
    },
    [slug]
  );

  return (
    <SectionContext.Provider
      value={{
        slug,
        userAffiliateId: userAffiliateId ?? null,
        sections,
        setSections: setSectionsHandler,
        addSection,
        updateSection,
        deleteSection,
        moveSection,
        addItemToSection,
        updateItemInSection,
        deleteItemFromSection,
        moveItemInSection,
        reorderItemsInSection,
        createSectionQuick,
        showAddSectionModal,
        setShowAddSectionModal,
        isEditMode,
        setIsEditMode,
        isLoading,
        loadError,
        retryLoad,
      }}
    >
      {children}
    </SectionContext.Provider>
  );
}
