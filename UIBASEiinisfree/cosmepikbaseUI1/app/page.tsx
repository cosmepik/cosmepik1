"use client"

import { useState } from "react"
import { ProfileHeader } from "@/components/cosme-link/profile-header"
import { CategoryTabs } from "@/components/cosme-link/category-tabs"
import { ProductCard, type Product } from "@/components/cosme-link/product-card"
import { RoutineSection } from "@/components/cosme-link/routine-section"
import { PromoBanner } from "@/components/cosme-link/promo-banner"
import { StatsBar } from "@/components/cosme-link/stats-bar"
import { Footer } from "@/components/cosme-link/footer"
import { Leaf } from "lucide-react"

const products: Product[] = [
  {
    id: "1",
    name: "グリーンティーシード ヒアルロン セラム",
    brand: "innisfree",
    price: "\u00A53,410",
    image: "/images/product-serum.jpg",
    rating: 5,
    reviewCount: 804,
    category: "skincare",
    badge: "BEST",
    link: "#",
  },
  {
    id: "2",
    name: "グリーンティー セラミド モイスチャークリーム",
    brand: "innisfree",
    price: "\u00A53,190",
    image: "/images/product-cream.jpg",
    rating: 4,
    reviewCount: 312,
    category: "skincare",
    badge: "NEW",
    link: "#",
  },
  {
    id: "3",
    name: "スーパーヴォルカニック ポア クレイマスク",
    brand: "innisfree",
    price: "\u00A51,950",
    image: "/images/product-mask.jpg",
    rating: 5,
    reviewCount: 567,
    category: "skincare",
    badge: "BEST",
    link: "#",
  },
  {
    id: "4",
    name: "デイリー UV プロテクション クリーム SPF50+",
    brand: "innisfree",
    price: "\u00A52,200",
    image: "/images/product-sunscreen.jpg",
    rating: 4,
    reviewCount: 198,
    category: "skincare",
    link: "#",
  },
  {
    id: "5",
    name: "ビビッドコットン インクティント #04",
    brand: "innisfree",
    price: "\u00A51,540",
    image: "/images/product-lip.jpg",
    rating: 4,
    reviewCount: 245,
    category: "makeup",
    badge: "NEW",
    link: "#",
  },
  {
    id: "6",
    name: "グリーンティー フォームクレンザー",
    brand: "innisfree",
    price: "\u00A5990",
    image: "/images/product-cleanser.jpg",
    rating: 4,
    reviewCount: 421,
    category: "bodycare",
    link: "#",
  },
]

export default function CosmeLink() {
  const [activeCategory, setActiveCategory] = useState("all")

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory)

  const featuredProduct = products.find((p) => p.badge === "BEST")
  const gridProducts = filteredProducts.filter((p) => p.id !== featuredProduct?.id || activeCategory !== "all")

  return (
    <div className="min-h-screen bg-background">
      {/* Top gradient bar */}
      <div className="h-1.5 bg-primary" />

      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            {"CosmeLink"}
          </span>
        </div>

        {/* Profile */}
        <ProfileHeader />

        {/* Stats */}
        <StatsBar />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Routine Section */}
        <RoutineSection />

        {/* My Favorites */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              {"My Favorites"}
            </h2>
            <span className="text-xs text-muted-foreground">
              {filteredProducts.length}{"個のアイテム"}
            </span>
          </div>

          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* Featured product */}
          {activeCategory === "all" && featuredProduct && (
            <ProductCard product={featuredProduct} variant="featured" />
          )}

          {/* Product grid */}
          <div className="grid grid-cols-2 gap-3">
            {(activeCategory === "all"
              ? gridProducts.filter((p) => p.id !== featuredProduct?.id)
              : gridProducts
            ).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
