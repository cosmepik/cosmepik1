export type SectionType = "routine" | "products" | "heading" | "text" | "link" | "recipe";

export interface SectionItem {
  id: string;
  label?: string;
  product?: string;
  brand?: string;
  image?: string;
  /** 元画像URL（再編集・再クロップ用に保持） */
  originalImage?: string;
  link?: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
  badge?: "NEW" | "BEST" | "SALE";
}

export type PlacementType = "product" | "comment";

export interface RecipePlacement {
  id: string;
  /** "product" (default) or "comment" */
  type?: PlacementType;
  product?: string;
  brand?: string;
  image?: string;
  /** 元画像URL（再編集・再クロップ用に保持） */
  originalImage?: string;
  link?: string;
  /** 0–100 (%) horizontal position on background */
  x: number;
  /** 0–100 (%) vertical position on background */
  y: number;
  /** display scale multiplier (default 1) */
  scale?: number;
  /** comment text (type=comment only) */
  comment?: string;
  /** comment text color (default "#333") */
  color?: string;
  /** comment rotation in degrees */
  rotation?: number;
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  icon?: string;
  items: SectionItem[];
  showSteps?: boolean;
  columns?: 1 | 2;
  /** recipe mode: background face image URL */
  backgroundImage?: string;
  /** recipe mode: positioned cosmetic items */
  placements?: RecipePlacement[];
}

const PLACEHOLDER_IMG = "/cosme-placeholder.svg";

export const defaultSections: Section[] = [
  {
    id: "routine-am",
    type: "routine",
    title: "朝のスキンケア",
    icon: "AM",
    showSteps: true,
    items: [
      {
        id: "r1",
        label: "洗顔",
        product: "グリーンティー フォームクレンザー",
        brand: "innisfree",
        image: PLACEHOLDER_IMG,
        link: "#",
      },
      {
        id: "r2",
        label: "化粧水",
        product: "グリーンティーシード ヒアルロン トナー",
        brand: "innisfree",
        image: PLACEHOLDER_IMG,
        link: "#",
      },
      {
        id: "r3",
        label: "美容液",
        product: "グリーンティーシード ヒアルロン セラム",
        brand: "innisfree",
        image: PLACEHOLDER_IMG,
        link: "#",
      },
      {
        id: "r4",
        label: "日焼け止め",
        product: "デイリー UV プロテクション SPF50+",
        brand: "innisfree",
        image: PLACEHOLDER_IMG,
        link: "#",
      },
    ],
  },
  {
    id: "favorites",
    type: "products",
    title: "My Favorites",
    columns: 2,
    items: [
      {
        id: "p1",
        product: "グリーンティーシード ヒアルロン セラム",
        brand: "innisfree",
        price: "¥3,410",
        image: PLACEHOLDER_IMG,
        rating: 5,
        reviewCount: 804,
        badge: "BEST",
        link: "#",
      },
      {
        id: "p2",
        product: "グリーンティー セラミド モイスチャークリーム",
        brand: "innisfree",
        price: "¥3,190",
        image: PLACEHOLDER_IMG,
        rating: 4,
        reviewCount: 312,
        badge: "NEW",
        link: "#",
      },
      {
        id: "p3",
        product: "スーパーヴォルカニック ポア クレイマスク",
        brand: "innisfree",
        price: "¥1,950",
        image: PLACEHOLDER_IMG,
        rating: 5,
        reviewCount: 567,
        badge: "BEST",
        link: "#",
      },
      {
        id: "p4",
        product: "デイリー UV プロテクション クリーム SPF50+",
        brand: "innisfree",
        price: "¥2,200",
        image: PLACEHOLDER_IMG,
        rating: 4,
        reviewCount: 198,
        link: "#",
      },
    ],
  },
];

/** 初期状態用：空のコレクションセクションを生成 */
export function createDefaultRoutineSection(): Section {
  return {
    id: `section-${Date.now()}`,
    type: "routine",
    title: "コレクション",
    icon: "AM",
    showSteps: true,
    items: [],
  };
}

/** 初期状態用：空のレシピセクションを生成 */
export function createDefaultRecipeSection(): Section {
  return {
    id: `recipe-${Date.now()}`,
    type: "recipe",
    title: "メイクレシピ",
    items: [],
    backgroundImage: "",
    placements: [],
  };
}

export const sectionTypeLabels: Record<SectionType, string> = {
  routine: "コレクション",
  products: "グリッド表示",
  heading: "見出し",
  text: "テキスト",
  link: "リンク",
  recipe: "メイクレシピ",
};

export const sectionTypeIcons: Record<SectionType, string> = {
  routine: "ListOrdered",
  products: "Grid",
  heading: "Type",
  text: "AlignLeft",
  link: "Link",
  recipe: "Camera",
};
